import type { DeidentificationReport, NormalizedRosterRow } from "./domain.ts";

export interface RosterParseOptions {
  confirmPiiColumnStripping?: boolean;
}

export interface RosterParseResult {
  rows: NormalizedRosterRow[];
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

const piiHeaderKeys = new Set([
  "name",
  "fullname",
  "employeename",
  "email",
  "phone",
  "phonenumber",
  "mobile",
  "residentid",
  "rrn",
  "ssn",
  "employeeid",
  "staffid",
  "address",
  "companyname",
  "rawcsv",
  "rawpaste",
  "contact",
]);

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
  const piiColumnIndexes = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => isPiiColumnHeader(header));
  const rejectedColumnHeaders = piiColumnIndexes.map(({ header }) => header.trim());

  if (rejectedColumnHeaders.length > 0 && options.confirmPiiColumnStripping !== true) {
    warnings.push(`PII-like columns detected and require confirmation before stripping: ${rejectedColumnHeaders.join(", ")}.`);
    return {
      rows: [],
      warnings,
      errors,
      requiresPiiColumnConfirmation: true,
      report: report({ rejectedColumnHeaders }),
    };
  }

  if (rejectedColumnHeaders.length > 0) {
    warnings.push(`PII-like columns stripped after confirmation: ${rejectedColumnHeaders.join(", ")}.`);
  }

  const piiIndexSet = new Set(piiColumnIndexes.map(({ index }) => index));
  const retainedColumns = headers
    .map((header, index) => ({ field: headerAliases[normalizeHeader(header)], index }))
    .filter((column): column is { field: RosterField; index: number } => column.field !== undefined && !piiIndexSet.has(column.index));

  const managerLabels = new Map<string, string>();
  const teamLabels = new Map<string, string>();
  const rejectedValuePatterns: string[] = [];
  const rows: NormalizedRosterRow[] = [];

  for (const [lineIndex, line] of lines.slice(1).entries()) {
    const values = splitLine(line, delimiter);
    const rawRow = Object.fromEntries(retainedColumns.map(({ field, index }) => [field, values[index]?.trim() ?? ""]));
    const rowLabel = rawRow.rowId || `line_${lineIndex + 2}`;
    const piiPattern = firstPiiValuePattern(Object.values(rawRow));

    if (piiPattern !== undefined) {
      errors.push(`${rowLabel} contains a PII-like ${piiPattern} value and was blocked.`);
      pushUnique(rejectedValuePatterns, piiPattern);
      continue;
    }

    const row = normalizeRow(rawRow, managerLabels, teamLabels);
    if (row === undefined) {
      errors.push(`${rowLabel} is missing rowId, roleGroup, or baseSalaryKRW.`);
      continue;
    }

    rows.push(row);
  }

  return {
    rows,
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

function isPiiColumnHeader(header: string): boolean {
  const normalized = normalizeHeader(header);
  return piiHeaderKeys.has(normalized) || /주민등록|이메일|전화번호|사번|주소|이름/.test(header);
}

function firstPiiValuePattern(values: string[]): string | undefined {
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