import readXlsxFile, { type Sheet } from "read-excel-file/browser";

import {
  createEmptyPreparationResult,
  prepareProductEngineerKoreanTable,
} from "../../lib/hr-paysim/preparation/prepareProductEngineerRoster.ts";
import type { ProductEngineerPreparationResult } from "../../lib/hr-paysim/preparation/types.ts";

export const MAX_WORKBOOK_BYTES = 5 * 1024 * 1024;

type WorkbookSheet = Pick<Sheet, "sheet" | "data">;
type WorkbookReader = (file: File) => Promise<WorkbookSheet[]>;

export function selectWorkbookSheet(
  sheets: readonly WorkbookSheet[],
): WorkbookSheet {
  const nonEmptySheets = sheets.filter(({ data }) => hasContent(data));
  const preferred = nonEmptySheets.find(({ sheet, data }) =>
    sheet === "입력 양식" && hasDataRows(data)
  );
  if (preferred) return preferred;
  if (nonEmptySheets.length === 0) throw new Error("EMPTY_WORKBOOK");
  if (nonEmptySheets.length > 1) throw new Error("AMBIGUOUS_WORKBOOK");
  return nonEmptySheets[0]!;
}

export async function readProductEngineerWorkbook(
  file: File,
  options: {
    readWorkbook?: WorkbookReader;
    confirmedProhibitedHeaders?: readonly string[];
  } = {},
): Promise<ProductEngineerPreparationResult> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return workbookBlocked("UNSUPPORTED_FILE_TYPE");
  }
  if (file.size > MAX_WORKBOOK_BYTES) {
    return workbookBlocked("FILE_TOO_LARGE");
  }

  try {
    const sheets = await (options.readWorkbook ?? readXlsxFile)(file);
    const selected = selectWorkbookSheet(sheets);
    const inspected = prepareProductEngineerKoreanTable(selected.data);
    if (
      inspected.status === "needs_column_consent"
      && sameHeaders(inspected.prohibitedColumnHeaders, options.confirmedProhibitedHeaders)
    ) {
      return prepareProductEngineerKoreanTable(selected.data, {
        confirmPiiColumnStripping: true,
      });
    }
    return inspected;
  } catch (error) {
    if (error instanceof Error && error.message === "EMPTY_WORKBOOK") {
      return workbookBlocked("EMPTY_WORKBOOK");
    }
    if (error instanceof Error && error.message === "AMBIGUOUS_WORKBOOK") {
      return workbookBlocked("AMBIGUOUS_WORKBOOK");
    }
    return workbookBlocked("UNREADABLE_WORKBOOK");
  }
}

function workbookBlocked(
  code:
    | "UNSUPPORTED_FILE_TYPE"
    | "FILE_TOO_LARGE"
    | "EMPTY_WORKBOOK"
    | "AMBIGUOUS_WORKBOOK"
    | "UNREADABLE_WORKBOOK",
): ProductEngineerPreparationResult {
  return {
    ...createEmptyPreparationResult(),
    status: "blocked",
    issues: [{ code }],
    shouldClearRaw: true,
  };
}

function hasContent(data: readonly (readonly unknown[])[]): boolean {
  return data.some((row) => row.some((cell) => !isBlank(cell)));
}

function hasDataRows(data: readonly (readonly unknown[])[]): boolean {
  return data.slice(1).some((row) => row.some((cell) => !isBlank(cell)));
}

function isBlank(value: unknown): boolean {
  return value === undefined
    || value === null
    || (typeof value === "string" && value.trim().length === 0);
}
function sameHeaders(
  actual: readonly string[],
  confirmed: readonly string[] | undefined,
): boolean {
  if (!confirmed || actual.length !== confirmed.length) return false;
  const expected = new Set(confirmed);
  return actual.every((header) => expected.has(header));
}