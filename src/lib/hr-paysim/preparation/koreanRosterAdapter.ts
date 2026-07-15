import type { NormalizedRosterRow } from "../domain.ts";
import {
  COMPENSATION_EXCEPTION_LABELS,
  ROSTER_HEADERS,
  type CompensationExceptionReason,
} from "./rosterTemplateContract.ts";

export { ROSTER_HEADERS };
export const KOREAN_ROSTER_HEADERS = ROSTER_HEADERS;

export type KoreanRosterField =
  | "salary"
  | "relevant_experience"
  | "company_tenure"
  | "job"
  | "grade"
  | "grade_rank"
  | "compensation_exception_reason";

export type KoreanRosterAdapterIssueCode =
  | "MISSING_HEADER"
  | "DUPLICATE_HEADER"
  | "MISSING_REQUIRED_FIELD"
  | "INVALID_FIELD_VALUE"
  | "PII_VALUE"
  | "TOO_FEW_ROWS"
  | "PARTIAL_GRADE_MAPPING"
  | "CONTRADICTORY_GRADE_MAPPING";

export interface KoreanRosterAdapterIssue {
  sourceLineNumber?: number;
  code: KoreanRosterAdapterIssueCode;
  field?: KoreanRosterField;
}

export interface KoreanRosterRecord {
  sourceLineNumber: number;
  row: NormalizedRosterRow;
  compensationExceptionReason: CompensationExceptionReason;
}

export interface KoreanRosterAdaptResult {
  status: "ready" | "blocked" | "needs_column_consent";
  rows: NormalizedRosterRow[];
  records: KoreanRosterRecord[];
  issues: KoreanRosterAdapterIssue[];
  prohibitedColumnHeaders: string[];
}

export interface KoreanRosterAdapterOptions {
  confirmPiiColumnStripping?: boolean;
}

const FIELD_BY_HEADER: Record<(typeof ROSTER_HEADERS)[number], KoreanRosterField> = {
  "기본연봉(원)": "salary",
  "관련 경력년수": "relevant_experience",
  "회사 근속개월": "company_tenure",
  "직무": "job",
  "직급": "grade",
  "직급 순서": "grade_rank",
  "처우 예외적용 사유": "compensation_exception_reason",
};

const REASON_BY_LABEL = new Map<string, CompensationExceptionReason>(
  Object.entries(COMPENSATION_EXCEPTION_LABELS).map(([reason, label]) => [
    label,
    reason as CompensationExceptionReason,
  ]),
);

export function normalizeFacilitatorJob(value: string): {
  key: string;
  display: string;
} {
  const display = value.normalize("NFKC").trim().replace(/\s+/g, " ");
  return { key: display.toLowerCase(), display };
}

export function adaptKoreanRosterTable(
  table: readonly (readonly unknown[])[],
  options: KoreanRosterAdapterOptions = {},
): KoreanRosterAdaptResult {
  const headerRow = table[0] ?? [];
  const headers = headerRow.map(normalizeHeaderCell);
  const acceptedIndices = new Map<string, number[]>();
  const prohibitedColumnHeaders: string[] = [];

  headers.forEach((header, index) => {
    if (isKoreanRosterHeader(header)) {
      acceptedIndices.set(header, [...(acceptedIndices.get(header) ?? []), index]);
    } else if (header.length > 0) {
      prohibitedColumnHeaders.push(header);
    }
  });

  if (
    prohibitedColumnHeaders.length > 0
    && options.confirmPiiColumnStripping !== true
  ) {
    return emptyResult("needs_column_consent", {
      prohibitedColumnHeaders: uniqueInOrder(prohibitedColumnHeaders),
    });
  }

  const headerIssues = ROSTER_HEADERS.flatMap((header): KoreanRosterAdapterIssue[] => {
    const indices = acceptedIndices.get(header) ?? [];
    if (indices.length === 0) {
      return [{ code: "MISSING_HEADER", field: FIELD_BY_HEADER[header] }];
    }
    if (indices.length > 1) {
      return [{ code: "DUPLICATE_HEADER", field: FIELD_BY_HEADER[header] }];
    }
    return [];
  });
  if (headerIssues.length > 0) {
    return emptyResult("blocked", {
      issues: headerIssues,
      prohibitedColumnHeaders: uniqueInOrder(prohibitedColumnHeaders),
    });
  }

  const records: KoreanRosterRecord[] = [];
  const issues: KoreanRosterAdapterIssue[] = [];
  const displayByJobKey = new Map<string, string>();

  for (const [dataIndex, sourceRow] of table.slice(1).entries()) {
    const sourceLineNumber = dataIndex + 2;
    if (isFullyBlankRow(sourceRow)) continue;

    const acceptedCells = Object.fromEntries(ROSTER_HEADERS.map((header) => [
      header,
      sourceRow[acceptedIndices.get(header)![0]!],
    ])) as Record<(typeof ROSTER_HEADERS)[number], unknown>;

    if (firstPiiValuePattern(Object.values(acceptedCells))) {
      issues.push({ sourceLineNumber, code: "PII_VALUE" });
      continue;
    }

    const parsed = parseAcceptedRow(
      acceptedCells,
      sourceLineNumber,
      records.length,
      displayByJobKey,
    );
    if ("issue" in parsed) {
      issues.push(parsed.issue);
      continue;
    }
    records.push({
      sourceLineNumber,
      row: parsed.row,
      compensationExceptionReason: parsed.compensationExceptionReason,
    });
  }

  if (issues.length > 0) {
    return emptyResult("blocked", {
      issues,
      prohibitedColumnHeaders: uniqueInOrder(prohibitedColumnHeaders),
    });
  }

  const gradeIssue = validateGradeMappings(records);
  if (gradeIssue) {
    return emptyResult("blocked", {
      issues: [gradeIssue],
      prohibitedColumnHeaders: uniqueInOrder(prohibitedColumnHeaders),
    });
  }

  if (records.length < 4) {
    return emptyResult("blocked", {
      issues: [{ code: "TOO_FEW_ROWS" }],
      prohibitedColumnHeaders: uniqueInOrder(prohibitedColumnHeaders),
    });
  }

  return {
    status: "ready",
    rows: records.map(({ row }) => ({ ...row })),
    records: records.map(({ sourceLineNumber, row, compensationExceptionReason }) => ({
      sourceLineNumber,
      row: { ...row },
      compensationExceptionReason,
    })),
    issues: [],
    prohibitedColumnHeaders: uniqueInOrder(prohibitedColumnHeaders),
  };
}

function parseAcceptedRow(
  cells: Record<(typeof ROSTER_HEADERS)[number], unknown>,
  sourceLineNumber: number,
  acceptedIndex: number,
  displayByJobKey: Map<string, string>,
): {
  row: NormalizedRosterRow;
  compensationExceptionReason: CompensationExceptionReason;
} | { issue: KoreanRosterAdapterIssue } {
  for (const header of ROSTER_HEADERS) {
    if (isFormulaLike(cells[header])) {
      return invalidIssue(sourceLineNumber, FIELD_BY_HEADER[header]);
    }
  }

  const salaryCell = cells["기본연봉(원)"];
  const relevantExperienceCell = cells["관련 경력년수"];
  const tenureCell = cells["회사 근속개월"];
  const jobCell = cells["직무"];
  const reasonCell = cells["처우 예외적용 사유"];

  for (const [value, field] of [
    [salaryCell, "salary"],
    [relevantExperienceCell, "relevant_experience"],
    [tenureCell, "company_tenure"],
    [jobCell, "job"],
    [reasonCell, "compensation_exception_reason"],
  ] as const) {
    if (isBlank(value)) {
      return {
        issue: { sourceLineNumber, code: "MISSING_REQUIRED_FIELD", field },
      };
    }
  }

  const baseSalaryKRW = parseSalary(salaryCell);
  if (baseSalaryKRW === undefined) {
    return invalidIssue(sourceLineNumber, "salary");
  }
  const relevantExperienceYears = parseCareerYears(relevantExperienceCell);
  if (relevantExperienceYears === undefined) {
    return invalidIssue(sourceLineNumber, "relevant_experience");
  }
  const tenureMonths = parseCompanyTenure(tenureCell);
  if (tenureMonths === undefined) {
    return invalidIssue(sourceLineNumber, "company_tenure");
  }

  if (typeof jobCell !== "string") {
    return invalidIssue(sourceLineNumber, "job");
  }
  const normalizedJob = normalizeFacilitatorJob(jobCell);
  if (normalizedJob.display.length === 0) {
    return {
      issue: {
        sourceLineNumber,
        code: "MISSING_REQUIRED_FIELD",
        field: "job",
      },
    };
  }
  const roleGroup = displayByJobKey.get(normalizedJob.key) ?? normalizedJob.display;

  const levelLabel = parseOptionalText(cells["직급"]);
  if (levelLabel === INVALID_VALUE) {
    return invalidIssue(sourceLineNumber, "grade");
  }
  const levelRank = parseOptionalPositiveInteger(cells["직급 순서"]);
  if (levelRank === INVALID_VALUE) {
    return invalidIssue(sourceLineNumber, "grade_rank");
  }

  const compensationExceptionReason = parseExceptionReason(reasonCell);
  if (compensationExceptionReason === INVALID_VALUE) {
    return invalidIssue(sourceLineNumber, "compensation_exception_reason");
  }
  const flags = exceptionFlags(compensationExceptionReason);
  displayByJobKey.set(normalizedJob.key, roleGroup);

  return {
    row: stripUndefined({
      rowId: "file_row_" + String(acceptedIndex + 1).padStart(3, "0"),
      roleGroup,
      baseSalaryKRW,
      relevantExperienceMonths: Math.round(relevantExperienceYears * 12),
      tenureMonths,
      levelLabel,
      levelRank,
      exceptionFlag: flags.exceptionFlag,
      counterOfferFlag: flags.counterOfferFlag,
    }),
    compensationExceptionReason,
  };
}

function validateGradeMappings(
  records: readonly KoreanRosterRecord[],
): KoreanRosterAdapterIssue | undefined {
  const recordsByRole = new Map<string, KoreanRosterRecord[]>();
  for (const record of records) {
    const roleRecords = recordsByRole.get(record.row.roleGroup) ?? [];
    roleRecords.push(record);
    recordsByRole.set(record.row.roleGroup, roleRecords);
  }

  for (const roleRecords of recordsByRole.values()) {
    const states = roleRecords.map(({ row }) => ({
      hasLabel: row.levelLabel !== undefined,
      hasRank: row.levelRank !== undefined,
    }));

    if (states.some(({ hasLabel, hasRank }) => hasLabel !== hasRank)) {
      return { code: "PARTIAL_GRADE_MAPPING" };
    }

    const completeCount = states.filter(({ hasLabel }) => hasLabel).length;
    if (completeCount !== 0 && completeCount !== roleRecords.length) {
      return { code: "PARTIAL_GRADE_MAPPING" };
    }

    const rankByLabel = new Map<string, number>();
    for (const { row } of roleRecords) {
      if (row.levelLabel === undefined || row.levelRank === undefined) continue;
      const knownRank = rankByLabel.get(row.levelLabel);
      if (knownRank !== undefined && knownRank !== row.levelRank) {
        return { code: "CONTRADICTORY_GRADE_MAPPING" };
      }
      rankByLabel.set(row.levelLabel, row.levelRank);
    }
  }

  return undefined;
}

function exceptionFlags(reason: CompensationExceptionReason): {
  exceptionFlag: boolean;
  counterOfferFlag: boolean;
} {
  return {
    exceptionFlag: reason === "hiring_exception" || reason === "other_documented",
    counterOfferFlag: reason === "counteroffer",
  };
}

const INVALID_VALUE = Symbol("INVALID_VALUE");

function parseSalary(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 ? value : undefined;
  }
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(trimmed)) return undefined;
  const parsed = Number(trimmed.replaceAll(",", ""));
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseCareerYears(value: unknown): number | undefined {
  const parsed = parsePlainNumber(value);
  if (parsed === undefined || parsed < 0 || parsed > 60) return undefined;
  return parsed;
}

function parseCompanyTenure(value: unknown): number | undefined {
  const parsed = parsePlainNumber(value);
  if (parsed === undefined || !Number.isSafeInteger(parsed) || parsed < 0 || parsed > 720) {
    return undefined;
  }
  return parsed;
}

function parsePlainNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalText(value: unknown): string | undefined | typeof INVALID_VALUE {
  if (isBlank(value)) return undefined;
  if (typeof value !== "string") return INVALID_VALUE;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseOptionalPositiveInteger(
  value: unknown,
): number | undefined | typeof INVALID_VALUE {
  if (isBlank(value)) return undefined;
  const parsed = parsePlainNumber(value);
  return parsed !== undefined && Number.isSafeInteger(parsed) && parsed > 0
    ? parsed
    : INVALID_VALUE;
}

function parseExceptionReason(
  value: unknown,
): CompensationExceptionReason | typeof INVALID_VALUE {
  if (typeof value !== "string") return INVALID_VALUE;
  return REASON_BY_LABEL.get(value.trim()) ?? INVALID_VALUE;
}

function invalidIssue(
  sourceLineNumber: number,
  field: KoreanRosterField,
): { issue: KoreanRosterAdapterIssue } {
  return {
    issue: { sourceLineNumber, code: "INVALID_FIELD_VALUE", field },
  };
}

function normalizeHeaderCell(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/^\uFEFF/, "") : "";
}

function isKoreanRosterHeader(
  value: string,
): value is (typeof ROSTER_HEADERS)[number] {
  return (ROSTER_HEADERS as readonly string[]).includes(value);
}

function isFullyBlankRow(row: readonly unknown[]): boolean {
  return row.every(isBlank);
}

function isBlank(value: unknown): boolean {
  return value === undefined
    || value === null
    || (typeof value === "string" && value.trim() === "");
}

function isFormulaLike(value: unknown): boolean {
  return typeof value === "string" && value.trimStart().startsWith("=");
}

function firstPiiValuePattern(values: unknown[]): boolean {
  return values.some((value) => {
    if (typeof value !== "string") return false;
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) return true;
    if (/010-?\d{4}-?\d{4}/.test(value)) return true;
    if (/\d{6}-[1-4]\d{6}/.test(value)) return true;
    return /주민등록|이메일|전화번호|사번/.test(value);
  });
}

function emptyResult(
  status: "blocked" | "needs_column_consent",
  input: Partial<Pick<
    KoreanRosterAdaptResult,
    "issues" | "prohibitedColumnHeaders"
  >> = {},
): KoreanRosterAdaptResult {
  return {
    status,
    rows: [],
    records: [],
    issues: input.issues ?? [],
    prohibitedColumnHeaders: input.prohibitedColumnHeaders ?? [],
  };
}

function uniqueInOrder(values: string[]): string[] {
  return Array.from(new Set(values));
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as T;
}
