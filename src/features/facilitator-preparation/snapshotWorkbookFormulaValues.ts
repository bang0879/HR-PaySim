import {
  strFromU8,
  strToU8,
  unzipSync,
  zipSync,
} from "fflate";

const MAX_WORKSHEET_XML_BYTES = 20 * 1024 * 1024;
const MAX_WORKSHEET_XML_TOTAL_BYTES = 20 * 1024 * 1024;
const MAX_WORKSHEET_COUNT = 32;
const MAX_ARCHIVE_TOTAL_BYTES = 40 * 1024 * 1024;
const WORKSHEET_PART_PATTERN = /^xl\/worksheets\/[^/]+\.xml$/;
const FORMULA_ELEMENT_PATTERN = /<(?:[A-Za-z_][\w.-]*:)?f\b[^>]*(?:\/>|>[\s\S]*?<\/(?:[A-Za-z_][\w.-]*:)?f\s*>)/g;
const FORMULA_TAG_PATTERN = /<(?:[A-Za-z_][\w.-]*:)?f(?:\s|\/?>)/;

export type FormulaSnapshotStatus = "none" | "saved_values" | "unavailable";

export interface WorkbookFormulaSnapshot {
  file: File;
  sheetFormulaStatus: ReadonlyMap<string, FormulaSnapshotStatus>;
}

export async function snapshotWorkbookFormulaValues(
  file: File,
): Promise<WorkbookFormulaSnapshot> {
  const archive = unzipBoundedWorkbook(new Uint8Array(await file.arrayBuffer()));
  const sheetParts = mapSheetNamesToParts(archive);
  const partStatus = new Map<string, FormulaSnapshotStatus>();

  for (const partName of worksheetPartNames(archive)) {
    const transformed = snapshotWorksheet(strFromU8(archive[partName]!));
    archive[partName] = strToU8(transformed.xml);
    partStatus.set(partName, transformed.status);
  }

  const sheetFormulaStatus = new Map<string, FormulaSnapshotStatus>(
    [...sheetParts].map(([sheetName, partName]) => [
      sheetName,
      partStatus.get(partName) ?? "none",
    ]),
  );
  if (![...sheetFormulaStatus.values()].some((status) => status !== "none")) {
    return { file, sheetFormulaStatus };
  }

  return {
    file: inMemoryFile(file, zipSync(archive)),
    sheetFormulaStatus,
  };
}

function unzipBoundedWorkbook(bytes: Uint8Array): Record<string, Uint8Array> {
  let worksheetCount = 0;
  let worksheetTotalBytes = 0;
  let archiveTotalBytes = 0;
  let limitError: string | undefined;
  const archive = unzipSync(bytes, {
    filter: ({ name, originalSize }) => {
      if (limitError) return false;

      archiveTotalBytes += originalSize;
      if (archiveTotalBytes > MAX_ARCHIVE_TOTAL_BYTES) {
        limitError = "WORKBOOK_ARCHIVE_TOTAL_LIMIT";
        return false;
      }

      if (!WORKSHEET_PART_PATTERN.test(name)) return true;
      worksheetCount += 1;
      if (worksheetCount > MAX_WORKSHEET_COUNT) {
        limitError = "WORKSHEET_COUNT_LIMIT";
        return false;
      }
      if (originalSize > MAX_WORKSHEET_XML_BYTES) {
        limitError = "WORKSHEET_XML_SIZE_LIMIT";
        return false;
      }
      worksheetTotalBytes += originalSize;
      if (worksheetTotalBytes > MAX_WORKSHEET_XML_TOTAL_BYTES) {
        limitError = "WORKSHEET_XML_TOTAL_LIMIT";
        return false;
      }
      return true;
    },
  });
  if (limitError) throw new Error(limitError);
  return archive;
}

function worksheetPartNames(archive: Record<string, Uint8Array>): string[] {
  return Object.keys(archive).filter((name) => WORKSHEET_PART_PATTERN.test(name));
}

function mapSheetNamesToParts(
  archive: Record<string, Uint8Array>,
): ReadonlyMap<string, string> {
  const workbook = requiredXml(archive, "xl/workbook.xml");
  const relationships = requiredXml(archive, "xl/_rels/workbook.xml.rels");
  const targets = new Map<string, string>();

  for (const match of relationships.matchAll(/<Relationship\b[^>]*\/?\s*>/g)) {
    const attributes = xmlAttributes(match[0]);
    if (attributes.TargetMode === "External") continue;
    if (attributes.Id && attributes.Target) {
      targets.set(attributes.Id, resolvePartName("xl/workbook.xml", attributes.Target));
    }
  }

  const sheets = new Map<string, string>();
  for (const match of workbook.matchAll(/<sheet\b[^>]*\/?\s*>/g)) {
    const attributes = xmlAttributes(match[0]);
    const sheetName = attributes.name;
    const relationshipId = attributes["r:id"];
    const target = relationshipId ? targets.get(relationshipId) : undefined;
    if (!sheetName || !target) throw new Error("WORKBOOK_RELATIONSHIP_MISSING");
    sheets.set(decodeXml(sheetName), target);
  }
  if (sheets.size === 0) throw new Error("WORKBOOK_SHEETS_MISSING");
  return sheets;
}

function snapshotWorksheet(xml: string): {
  xml: string;
  status: FormulaSnapshotStatus;
} {
  let hasFormula = false;
  let hasUnavailableFormula = false;
  const transformed = xml.replace(
    /<c\b([^>]*)>([\s\S]*?)<\/c>/g,
    (cell, attributes: string, contents: string) => {
      if (!FORMULA_TAG_PATTERN.test(contents)) return cell;
      hasFormula = true;
      const cachedValue = contents.match(/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/);
      const isError = /(?:^|\s)t\s*=\s*["']e["'](?:\s|$)/.test(attributes);
      if (!cachedValue || cachedValue[1].length === 0 || isError) {
        hasUnavailableFormula = true;
      }
      return `<c${attributes}>${contents.replace(FORMULA_ELEMENT_PATTERN, "")}</c>`;
    },
  );

  if (FORMULA_TAG_PATTERN.test(transformed)) {
    hasFormula = true;
    hasUnavailableFormula = true;
  }
  return {
    xml: transformed.replace(FORMULA_ELEMENT_PATTERN, ""),
    status: hasUnavailableFormula
      ? "unavailable"
      : hasFormula
        ? "saved_values"
        : "none",
  };
}

function requiredXml(
  archive: Record<string, Uint8Array>,
  partName: string,
): string {
  const bytes = archive[partName];
  if (!bytes) throw new Error("WORKBOOK_PART_MISSING");
  return strFromU8(bytes);
}

function xmlAttributes(tag: string): Record<string, string> {
  return Object.fromEntries(
    [...tag.matchAll(/([A-Za-z_:][\w:.-]*)\s*=\s*["']([^"']*)["']/g)]
      .map((match) => [match[1]!, match[2]!]),
  );
}

function decodeXml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function resolvePartName(sourcePart: string, target: string): string {
  const combined = target.startsWith("/")
    ? target.slice(1)
    : `${sourcePart.slice(0, sourcePart.lastIndexOf("/") + 1)}${target}`;
  const parts: string[] = [];
  for (const segment of combined.replace(/\\/g, "/").split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      parts.pop();
    } else {
      parts.push(segment);
    }
  }
  return parts.join("/");
}

function inMemoryFile(source: File, bytes: Uint8Array): File {
  const copy = () => bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  return new File([copy()], source.name, {
    type: source.type,
    lastModified: source.lastModified,
  });
}
