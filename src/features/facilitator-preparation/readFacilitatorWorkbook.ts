import readXlsxFile, { type Sheet } from "read-excel-file/browser";

import {
  createEmptyPreparationResult,
  prepareFacilitatorKoreanTable,
} from "../../lib/hr-paysim/preparation/prepareFacilitatorRoster.ts";
import type { FacilitatorPreparationResult } from "../../lib/hr-paysim/preparation/types.ts";

import {
  snapshotWorkbookFormulaValues,
  type WorkbookFormulaSnapshot,
} from "./snapshotWorkbookFormulaValues.ts";
export const MAX_WORKBOOK_BYTES = 5 * 1024 * 1024;

type WorkbookSheet = Pick<Sheet, "sheet" | "data">;
type WorkbookReader = (file: File) => Promise<WorkbookSheet[]>;
type WorkbookFormulaSnapshotter = (file: File) => Promise<WorkbookFormulaSnapshot>;

export function selectWorkbookSheet(
  sheets: readonly WorkbookSheet[],
): WorkbookSheet {
  const nonEmptySheets = sheets.filter(({ data }) => hasContent(data));
  const preferred = nonEmptySheets.find(({ sheet }) => sheet === "입력 양식");
  if (preferred) return preferred;
  if (nonEmptySheets.length === 0) throw new Error("EMPTY_WORKBOOK");
  if (nonEmptySheets.length > 1) throw new Error("AMBIGUOUS_WORKBOOK");
  return nonEmptySheets[0]!;
}

export async function readFacilitatorWorkbook(
  file: File,
  options: {
    readWorkbook?: WorkbookReader;
    confirmProhibitedHeaders?: (headers: readonly string[]) => Promise<boolean>;
    snapshotWorkbookFormulas?: WorkbookFormulaSnapshotter;
  } = {},
): Promise<FacilitatorPreparationResult> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return workbookBlocked("UNSUPPORTED_FILE_TYPE");
  }
  if (file.size > MAX_WORKBOOK_BYTES) {
    return workbookBlocked("FILE_TOO_LARGE");
  }

  try {
    const snapshotWorkbook = options.snapshotWorkbookFormulas
      ?? (options.readWorkbook
        ? async (sourceFile: File): Promise<WorkbookFormulaSnapshot> => ({
            file: sourceFile,
            sheetFormulaStatus: new Map(),
          })
        : snapshotWorkbookFormulaValues);
    const snapshot = await snapshotWorkbook(file);
    const sheets = await (options.readWorkbook ?? readXlsxFile)(snapshot.file);
    const selected = selectWorkbookSheet(sheets);
    const formulaStatus = snapshot.sheetFormulaStatus.get(selected.sheet) ?? "none";
    if (formulaStatus === "unavailable") {
      return workbookBlocked("FORMULA_RESULT_UNAVAILABLE");
    }
    const usedFormulaSnapshot = formulaStatus === "saved_values";
    const inspected = prepareFacilitatorKoreanTable(selected.data);
    if (
      inspected.status === "needs_column_consent"
      && options.confirmProhibitedHeaders
      && await options.confirmProhibitedHeaders([...inspected.prohibitedColumnHeaders])
    ) {
      return withFormulaSnapshot(
        prepareFacilitatorKoreanTable(selected.data, {
          confirmPiiColumnStripping: true,
        }),
        usedFormulaSnapshot,
      );
    }
    return withFormulaSnapshot(inspected, usedFormulaSnapshot);
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

function withFormulaSnapshot(
  result: FacilitatorPreparationResult,
  usedFormulaSnapshot: boolean,
): FacilitatorPreparationResult {
  return {
    ...result,
    usedFormulaSnapshot,
  };
}

function workbookBlocked(
  code:
    | "UNSUPPORTED_FILE_TYPE"
    | "FILE_TOO_LARGE"
    | "EMPTY_WORKBOOK"
    | "AMBIGUOUS_WORKBOOK"
    | "FORMULA_RESULT_UNAVAILABLE"
    | "UNREADABLE_WORKBOOK",
): FacilitatorPreparationResult {
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

function isBlank(value: unknown): boolean {
  return value === undefined
    || value === null
    || (typeof value === "string" && value.trim().length === 0);
}
