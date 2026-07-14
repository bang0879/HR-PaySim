import type { NormalizedRosterRow } from "../domain.ts";

export const KOREAN_ROSTER_HEADERS = [
  "기본연봉(원)",
  "관련 경력년수",
  "회사 근속개월",
  "직함",
  "레벨",
  "문서화된 예외",
  "카운터오퍼 여부",
] as const;

export type KoreanRosterField =
  | "salary"
  | "relevant_experience"
  | "company_tenure"
  | "title"
  | "level"
  | "documented_exception"
  | "counteroffer";

export type KoreanRosterAdapterIssueCode =
  | "MISSING_HEADER"
  | "DUPLICATE_HEADER"
  | "MISSING_REQUIRED_FIELD"
  | "INVALID_FIELD_VALUE"
  | "PII_VALUE"
  | "TOO_FEW_ROWS";

export interface KoreanRosterAdapterIssue {
  sourceLineNumber?: number;
  code: KoreanRosterAdapterIssueCode;
  field?: KoreanRosterField;
}

export interface KoreanRosterRecord {
  sourceLineNumber: number;
  row: NormalizedRosterRow;
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

const FIELD_BY_HEADER: Record<(typeof KOREAN_ROSTER_HEADERS)[number], KoreanRosterField> = {
  "기본연봉(원)": "salary",
  "관련 경력년수": "relevant_experience",
  "회사 근속개월": "company_tenure",
  "직함": "title",
  "레벨": "level",
  "문서화된 예외": "documented_exception",
  "카운터오퍼 여부": "counteroffer",
};

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

  const headerIssues = KOREAN_ROSTER_HEADERS.flatMap((header): KoreanRosterAdapterIssue[] => {
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
  for (const [dataIndex, sourceRow] of table.slice(1).entries()) {
    const sourceLineNumber = dataIndex + 2;
    if (isFullyBlankRow(sourceRow)) continue;

    const acceptedCells = Object.fromEntries(KOREAN_ROSTER_HEADERS.map((header) => [
      header,
      sourceRow[acceptedIndices.get(header)![0]!],
    ])) as Record<(typeof KOREAN_ROSTER_HEADERS)[number], unknown>;

    const pii = firstPiiValuePattern(Object.values(acceptedCells));
    if (pii) {
      issues.push({ sourceLineNumber, code: "PII_VALUE" });
      continue;
    }

    const parsed = parseAcceptedRow(acceptedCells, sourceLineNumber, records.length);
    if ("issue" in parsed) {
      issues.push(parsed.issue);
      continue;
    }
    records.push({ sourceLineNumber, row: parsed.row });
  }

  if (issues.length > 0) {
    return emptyResult("blocked", {
      issues,
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
    records: records.map(({ sourceLineNumber, row }) => ({
      sourceLineNumber,
      row: { ...row },
    })),
    issues: [],
    prohibitedColumnHeaders: uniqueInOrder(prohibitedColumnHeaders),
  };
}

function parseAcceptedRow(
  cells: Record<(typeof KOREAN_ROSTER_HEADERS)[number], unknown>,
  sourceLineNumber: number,
  acceptedIndex: number,
): { row: NormalizedRosterRow } | { issue: KoreanRosterAdapterIssue } {
  for (const header of KOREAN_ROSTER_HEADERS) {
    if (isFormulaLike(cells[header])) {
      return {
        issue: {
          sourceLineNumber,
          code: "INVALID_FIELD_VALUE",
          field: FIELD_BY_HEADER[header],
        },
      };
    }
  }

  const salaryCell = cells["기본연봉(원)"];
  const relevantExperienceCell = cells["관련 경력년수"];
  const tenureCell = cells["회사 근속개월"];
  for (const [value, field] of [
    [salaryCell, "salary"],
    [relevantExperienceCell, "relevant_experience"],
    [tenureCell, "company_tenure"],
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

  const title = parseOptionalText(cells["직함"]);
  if (title === INVALID_VALUE) return invalidIssue(sourceLineNumber, "title");
  const levelLabel = parseOptionalText(cells["레벨"]);
  if (levelLabel === INVALID_VALUE) return invalidIssue(sourceLineNumber, "level");
  const exceptionFlag = parseKoreanBoolean(cells["문서화된 예외"]);
  if (exceptionFlag === INVALID_VALUE) {
    return invalidIssue(sourceLineNumber, "documented_exception");
  }
  const counterOfferFlag = parseKoreanBoolean(cells["카운터오퍼 여부"]);
  if (counterOfferFlag === INVALID_VALUE) {
    return invalidIssue(sourceLineNumber, "counteroffer");
  }

  return {
    row: stripUndefined({
      rowId: "file_row_" + String(acceptedIndex + 1).padStart(3, "0"),
      roleGroup: "Product Engineer",
      baseSalaryKRW,
      relevantExperienceMonths: Math.round(relevantExperienceYears * 12),
      tenureMonths,
      title,
      levelLabel,
      exceptionFlag,
      counterOfferFlag,
    }),
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

function parseKoreanBoolean(
  value: unknown,
): boolean | undefined | typeof INVALID_VALUE {
  if (isBlank(value)) return undefined;
  if (typeof value !== "string") return INVALID_VALUE;
  const trimmed = value.trim();
  if (trimmed === "예") return true;
  if (trimmed === "아니오") return false;
  return INVALID_VALUE;
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
): value is (typeof KOREAN_ROSTER_HEADERS)[number] {
  return (KOREAN_ROSTER_HEADERS as readonly string[]).includes(value);
}

function isFullyBlankRow(row: readonly unknown[]): boolean {
  return row.every(isBlank);
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
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