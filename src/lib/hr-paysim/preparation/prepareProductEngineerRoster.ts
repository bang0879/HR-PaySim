import { parseRosterPaste } from "../rosterParser.ts";
import { createEmployeeLabels } from "../presentation/createEmployeeLabels.ts";
import { createProductEngineerSessionDraft } from "./createProductEngineerSessionDraft.ts";
import type {
  PreparationPreviewRow,
  ProductEngineerPreparationResult,
  SafePreparationIssue,
} from "./types.ts";

export function createEmptyPreparationResult(): ProductEngineerPreparationResult {
  return {
    status: "empty",
    prohibitedColumnHeaders: [],
    issues: [],
    previewRows: [],
    rows: [],
    shouldClearRaw: false,
  };
}

export function prepareProductEngineerRoster(
  rawText: string,
  options: { confirmPiiColumnStripping?: boolean } = {},
): ProductEngineerPreparationResult {
  if (rawText.trim().length === 0) return createEmptyPreparationResult();

  const parsed = parseRosterPaste(rawText, options);
  if (parsed.requiresPiiColumnConfirmation) {
    return {
      ...createEmptyPreparationResult(),
      status: "needs_column_consent",
      prohibitedColumnHeaders: [...parsed.report.rejectedColumnHeaders],
    };
  }

  const issues: SafePreparationIssue[] = [
    ...parsed.issues.map(({ sourceLineNumber, code }) => ({ sourceLineNumber, code })),
    ...parsed.records
      .filter(({ row }) => row.roleGroup !== "Product Engineer")
      .map(({ sourceLineNumber }) => ({
        sourceLineNumber,
        code: "UNSUPPORTED_ROLE" as const,
      })),
  ];

  if (issues.length > 0) {
    return {
      ...createEmptyPreparationResult(),
      status: "blocked",
      prohibitedColumnHeaders: [...parsed.report.rejectedColumnHeaders],
      issues,
      shouldClearRaw: issues.some(({ code }) => code === "PII_VALUE"),
    };
  }

  const rows = parsed.rows.map((row) => ({ ...row }));
  const draftResult = createProductEngineerSessionDraft(rows);
  if (!draftResult.supported) {
    return {
      status: "blocked",
      prohibitedColumnHeaders: [...parsed.report.rejectedColumnHeaders],
      issues: [{ code: "UNSUPPORTED_PRODUCT_ENGINEER_COMPARISON" }],
      previewRows: parsed.records.map(({ row }, index) =>
        toPreviewRow(row, `\uC9C1\uC6D0 ${String.fromCharCode(65 + index)}`),
      ),
      rows: [],
      shouldClearRaw: true,
    };
  }

  const productTheme = draftResult.draft.selection.selected[0]!;
  const labels = createEmployeeLabels(
    draftResult.draft.rows,
    productTheme.headlinePair!.underpaidRowId,
    productTheme.headlinePair!.comparatorRowId,
  );

  return {
    status: "ready_for_confirmation",
    prohibitedColumnHeaders: [...parsed.report.rejectedColumnHeaders],
    issues: [],
    previewRows: parsed.records.map(({ row }) => toPreviewRow(row, labels.get(row.rowId)!)),
    rows: draftResult.draft.rows,
    draft: draftResult.draft,
    shouldClearRaw: true,
  };
}

function toPreviewRow(
  row: ReturnType<typeof parseRosterPaste>["rows"][number],
  employeeLabel: string,
): PreparationPreviewRow {
  return {
    employeeLabel,
    roleGroup: "Product Engineer",
    salaryKRW: row.baseSalaryKRW,
    ...(row.tenureMonths === undefined ? {} : { tenureMonths: row.tenureMonths }),
    ...(row.title === undefined ? {} : { title: row.title }),
    ...(row.levelLabel === undefined ? {} : { levelLabel: row.levelLabel }),
    documentedException: row.exceptionFlag === true || row.counterOfferFlag === true,
  };
}
