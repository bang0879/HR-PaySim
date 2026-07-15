import type { NormalizedRosterRow } from "../domain.ts";
import { createPreparationLabels } from "../presentation/createPreparationLabels.ts";
import { createFacilitatorSessionDraft } from "./createFacilitatorSessionDraft.ts";
import {
  adaptKoreanRosterTable,
  type KoreanRosterAdapterOptions,
} from "./koreanRosterAdapter.ts";
import type { CompensationExceptionReason } from "./rosterTemplateContract.ts";
import type {
  FacilitatorPreparationResult,
  PreparationPreviewRow,
  SafePreparationIssue,
} from "./types.ts";

export function createEmptyPreparationResult(): FacilitatorPreparationResult {
  return {
    status: "empty",
    prohibitedColumnHeaders: [],
    issues: [],
    previewRows: [],
    rows: [],
    shouldClearRaw: false,
  };
}

export function prepareFacilitatorRoster(
  rawText: string,
  options: KoreanRosterAdapterOptions = {},
): FacilitatorPreparationResult {
  if (rawText.trim().length === 0) return createEmptyPreparationResult();
  return prepareFacilitatorKoreanTable(parseKoreanPaste(rawText), options);
}

export function prepareFacilitatorKoreanTable(
  table: readonly (readonly unknown[])[],
  options: KoreanRosterAdapterOptions = {},
): FacilitatorPreparationResult {
  if (table.length === 0 || table.every((row) => row.every(isBlankCell))) {
    return createEmptyPreparationResult();
  }

  const adapted = adaptKoreanRosterTable(table, options);
  if (adapted.status === "needs_column_consent") {
    return {
      ...createEmptyPreparationResult(),
      status: "needs_column_consent",
      prohibitedColumnHeaders: [...adapted.prohibitedColumnHeaders],
    };
  }

  if (adapted.status === "blocked") {
    const issues: SafePreparationIssue[] = adapted.issues.map((issue) => ({ ...issue }));
    return {
      ...createEmptyPreparationResult(),
      status: "blocked",
      prohibitedColumnHeaders: [...adapted.prohibitedColumnHeaders],
      issues,
      shouldClearRaw: issues.some(({ code }) => code === "PII_VALUE"),
    };
  }

  const rows = adapted.rows.map((row) => ({ ...row }));
  const labels = createPreparationLabels(rows);
  const previewRows = adapted.records.map(({ row, compensationExceptionReason }) =>
    toPreviewRow(row, labels.get(row.rowId)!, compensationExceptionReason)
  );
  const draftResult = createFacilitatorSessionDraft(rows);
  if (!draftResult.supported) {
    return {
      status: "blocked",
      prohibitedColumnHeaders: [...adapted.prohibitedColumnHeaders],
      issues: [{ code: "NO_SUPPORTED_REVIEW_SUBJECT" }],
      previewRows,
      rows: [],
      shouldClearRaw: true,
    };
  }

  return {
    status: "ready_for_confirmation",
    prohibitedColumnHeaders: [...adapted.prohibitedColumnHeaders],
    issues: [],
    previewRows,
    rows: draftResult.draft.rows,
    draft: draftResult.draft,
    shouldClearRaw: true,
  };
}

function parseKoreanPaste(rawText: string): unknown[][] {
  return rawText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.split("\t"));
}

function toPreviewRow(
  row: NormalizedRosterRow,
  employeeLabel: string,
  compensationExceptionReason: CompensationExceptionReason,
): PreparationPreviewRow {
  return {
    employeeLabel,
    roleGroup: row.roleGroup,
    salaryKRW: row.baseSalaryKRW,
    ...(row.relevantExperienceMonths === undefined
      ? {}
      : { relevantExperienceMonths: row.relevantExperienceMonths }),
    ...(row.tenureMonths === undefined ? {} : { tenureMonths: row.tenureMonths }),
    ...(row.levelLabel === undefined ? {} : { levelLabel: row.levelLabel }),
    ...(row.levelRank === undefined ? {} : { levelRank: row.levelRank }),
    compensationExceptionReason,
  };
}

function isBlankCell(value: unknown): boolean {
  return value === undefined
    || value === null
    || (typeof value === "string" && value.trim().length === 0);
}
