import type { DeidentificationReport, NormalizedRosterRow } from "./domain.ts";

export interface RosterParseOptions {
  confirmPiiColumnStripping?: boolean;
}

export type PiiValuePattern = "email" | "phone" | "residentId" | "piiText";

export interface RosterParseIssue {
  sourceLineNumber: number;
  code: "PII_VALUE" | "MISSING_REQUIRED_FIELD";
  valuePattern?: PiiValuePattern;
}

export interface ParsedRosterRecord {
  sourceLineNumber: number;
  row: NormalizedRosterRow;
}

export interface RosterParseResult {
  rows: NormalizedRosterRow[];
  records: ParsedRosterRecord[];
  issues: RosterParseIssue[];
  warnings: string[];
  errors: string[];
  requiresPiiColumnConfirmation: boolean;
  report: DeidentificationReport;
}

type RosterField = keyof NormalizedRosterRow;

const headerAliases: Record<string, RosterField> = {
  rowid: "rowId",
  rolegroup: "roleGroup",
  title: "title",
  levellabel: "levelLabel",
  levelrank: "levelRank",
  basesalarykrw: "baseSalaryKRW",
  basesalary: "baseSalaryKRW",
  salary: "baseSalaryKRW",
  startdate: "startDate",
  tenuremonths: "tenureMonths",
  latestraisedate: "latestRaiseDate",
  latestraiseamountkrw: "latestRaiseAmountKRW",
  exceptionflag: "exceptionFlag",
  counterofferflag: "counterOfferFlag",
  managerlabel: "managerLabel",
  teamlabel: "teamLabel",
};

export function parseRosterPaste(rawText: string, options: RosterParseOptions = {}): RosterParseResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const lines = rawText.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    errors.push("Roster paste is empty.");
    return emptyResult({ errors });
  }

  const delimiter = lines[0]!.includes("\t") ? "\t" : ",";
  const headers = splitLine(lines[0]!, delimiter);
  const classifiedColumns = headers.map((header, index) => ({
    field: headerAliases[normalizeHeader(header)],
    header,
    index,
  }));
  const rejectedColumns = classifiedColumns.filter(({ field }) => field === undefined);
  const rejectedColumnHeaders = rejectedColumns.map(({ header }) => header.trim());

  if (rejectedColumnHeaders.length > 0 && options.confirmPiiColumnStripping !== true) {
    warnings.push(`PII/unapproved columns detected and require confirmation before stripping: ${rejectedColumnHeaders.join(", ")}.`);
    return {
      rows: [],
      records: [],
      issues: [],
      warnings,
      errors,
      requiresPiiColumnConfirmation: true,
      report: report({ rejectedColumnHeaders }),
    };
  }

  if (rejectedColumnHeaders.length > 0) {
    warnings.push(`PII/unapproved columns stripped after confirmation: ${rejectedColumnHeaders.join(", ")}.`);
  }

  const retainedColumns = classifiedColumns.filter(
    (column): column is { field: RosterField; header: string; index: number } =>
      column.field !== undefined,
  );

  const managerLabels = new Map<string, string>();
  const teamLabels = new Map<string, string>();
  const rejectedValuePatterns: string[] = [];
  const rows: NormalizedRosterRow[] = [];
  const records: ParsedRosterRecord[] = [];
  const issues: RosterParseIssue[] = [];

  for (const [lineIndex, line] of lines.slice(1).entries()) {
    const sourceLineNumber = lineIndex + 2;
    const values = splitLine(line, delimiter);
    const rawRow = Object.fromEntries(retainedColumns.map(({ field, index }) => [field, values[index]?.trim() ?? ""]));
    const piiPattern = firstPiiValuePattern(Object.values(rawRow));

    if (piiPattern !== undefined) {
      errors.push(`\uC785\uB825 ${sourceLineNumber}\uD589\uC5D0 \uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC740 \uAC1C\uC778 \uC815\uBCF4 \uD615\uC2DD\uC774 \uC788\uC2B5\uB2C8\uB2E4.`);
      issues.push({ sourceLineNumber, code: "PII_VALUE", valuePattern: piiPattern });
      pushUnique(rejectedValuePatterns, piiPattern);
      continue;
    }

    const row = normalizeRow(rawRow, managerLabels, teamLabels);
    if (row === undefined) {
      errors.push(`\uC785\uB825 ${sourceLineNumber}\uD589\uC758 \uD544\uC218 \uAC12\uC744 \uD655\uC778\uD558\uC138\uC694.`);
      issues.push({ sourceLineNumber, code: "MISSING_REQUIRED_FIELD" });
      continue;
    }

    rows.push(row);
    records.push({ sourceLineNumber, row });
  }

  return {
    rows,
    records,
    issues,
    warnings,
    errors,
    requiresPiiColumnConfirmation: false,
    report: report({
      acceptedRowCount: rows.length,
      rejectedColumnHeaders,
      rejectedValuePatterns,
      normalizedManagerLabelCount: managerLabels.size,
      normalizedTeamLabelCount: teamLabels.size,
    }),
  };
}

function normalizeRow(
  rawRow: Record<string, string>,
  managerLabels: Map<string, string>,
  teamLabels: Map<string, string>,
): NormalizedRosterRow | undefined {
  const rowId = rawRow.rowId?.trim();
  const roleGroup = rawRow.roleGroup?.trim();
  const baseSalaryKRW = parseNumber(rawRow.baseSalaryKRW);

  if (!rowId || !roleGroup || baseSalaryKRW === undefined) return undefined;

  return stripUndefined({
    rowId,
    roleGroup,
    title: optionalText(rawRow.title),
    levelLabel: optionalText(rawRow.levelLabel),
    levelRank: parseNumber(rawRow.levelRank),
    baseSalaryKRW,
    startDate: optionalText(rawRow.startDate),
    tenureMonths: parseNumber(rawRow.tenureMonths),
    latestRaiseDate: optionalText(rawRow.latestRaiseDate),
    latestRaiseAmountKRW: parseNumber(rawRow.latestRaiseAmountKRW),
    exceptionFlag: parseBoolean(rawRow.exceptionFlag),
    counterOfferFlag: parseBoolean(rawRow.counterOfferFlag),
    managerLabel: normalizeOpaqueLabel(rawRow.managerLabel, managerLabels, "manager"),
    teamLabel: normalizeOpaqueLabel(rawRow.teamLabel, teamLabels, "team"),
  });
}

function splitLine(line: string, delimiter: string): string[] {
  return line.split(delimiter).map((cell) => cell.trim());
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function firstPiiValuePattern(values: string[]): PiiValuePattern | undefined {
  for (const value of values) {
    if (!value) continue;
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) return "email";
    if (/010-?\d{4}-?\d{4}/.test(value)) return "phone";
    if (/\d{6}-[1-4]\d{6}/.test(value)) return "residentId";
    if (/주민등록|이메일|전화번호|사번/.test(value)) return "piiText";
  }
  return undefined;
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const normalized = value.replace(/[,₩원\s]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return undefined;
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeOpaqueLabel(value: string | undefined, labels: Map<string, string>, prefix: "manager" | "team"): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const existing = labels.get(trimmed);
  if (existing) return existing;
  const next = `${prefix}_${labels.size + 1}`;
  labels.set(trimmed, next);
  return next;
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

function pushUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function emptyResult(input: { errors?: string[]; warnings?: string[] } = {}): RosterParseResult {
  return {
    rows: [],
    records: [],
    issues: [],
    warnings: input.warnings ?? [],
    errors: input.errors ?? [],
    requiresPiiColumnConfirmation: false,
    report: report(),
  };
}

function report(input: Partial<DeidentificationReport> = {}): DeidentificationReport {
  return {
    acceptedRowCount: input.acceptedRowCount ?? 0,
    rejectedColumnHeaders: input.rejectedColumnHeaders ?? [],
    rejectedValuePatterns: input.rejectedValuePatterns ?? [],
    normalizedManagerLabelCount: input.normalizedManagerLabelCount ?? 0,
    normalizedTeamLabelCount: input.normalizedTeamLabelCount ?? 0,
    rawTextPersisted: false,
  };
}