import type { NormalizedRosterRow } from "../domain.ts";
import type {
  ObservedPrecedentCandidate,
  ObservedPrecedentSelection,
} from "./types.ts";

const RECENT_TENURE_MONTHS = 24;
const OBSERVED_PRECEDENT_REASONS = new Set<ObservedPrecedentSelection["reason"]>([
  "documented_hiring_exception",
  "documented_counteroffer",
  "facilitator_selected_other",
]);

export function findObservedPrecedentCandidates(
  rows: NormalizedRosterRow[],
  roleGroup: string,
): ObservedPrecedentCandidate[] {
  const recentRoleRows = rows.filter((row) =>
    row.roleGroup === roleGroup
    && row.tenureMonths !== undefined
    && row.tenureMonths <= RECENT_TENURE_MONTHS
  );
  const referenceRows = recentRoleRows
    .filter((row) => !hasObservedPremiumFlag(row))
    .sort(compareRows);
  if (referenceRows.length === 0) return [];

  const referenceSalaryKRW = median(referenceRows.map((row) => row.baseSalaryKRW));
  return recentRoleRows
    .filter(hasObservedPremiumFlag)
    .map((row): ObservedPrecedentCandidate => ({
      sourceRowId: row.rowId,
      roleGroup: row.roleGroup,
      referenceRowIds: referenceRows.map((reference) => reference.rowId),
      referenceSalaryKRW,
      observedSalaryKRW: row.baseSalaryKRW,
      additionalAmountKRW: row.baseSalaryKRW - referenceSalaryKRW,
    }))
    .filter((candidate) => candidate.additionalAmountKRW > 0)
    .sort((a, b) => compareCodeUnits(a.sourceRowId, b.sourceRowId));
}

export function selectObservedPrecedent(
  candidates: ObservedPrecedentCandidate[],
  sourceRowId: string,
  reason: ObservedPrecedentSelection["reason"],
): ObservedPrecedentSelection {
  if (!isObservedPrecedentReason(reason)) {
    throw new Error("OBSERVED_PRECEDENT_REASON_INVALID");
  }
  const candidate = candidates.find((item) => item.sourceRowId === sourceRowId);
  if (!candidate) throw new Error(`OBSERVED_PRECEDENT_NOT_FOUND:${sourceRowId}`);
  return { candidate, reason };
}

export function isObservedPrecedentReason(
  value: unknown,
): value is ObservedPrecedentSelection["reason"] {
  return typeof value === "string"
    && OBSERVED_PRECEDENT_REASONS.has(value as ObservedPrecedentSelection["reason"]);
}

function hasObservedPremiumFlag(row: NormalizedRosterRow): boolean {
  return row.exceptionFlag === true || row.counterOfferFlag === true;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle]!;
  return (sorted[middle - 1]! + sorted[middle]!) / 2;
}

function compareRows(a: NormalizedRosterRow, b: NormalizedRosterRow): number {
  return compareCodeUnits(a.rowId, b.rowId);
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
