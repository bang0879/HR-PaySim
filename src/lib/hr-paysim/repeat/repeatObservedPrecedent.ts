import { buildMaterialTenurePairs } from "../detectors/tenurePairs.ts";
import type { NormalizedRosterRow } from "../domain.ts";
import {
  findObservedPrecedentCandidates,
  isObservedPrecedentReason,
} from "./selectObservedPrecedent.ts";
import type {
  ObservedPrecedentCandidate,
  ObservedPrecedentSelection,
  PrecedentRepeatResult,
} from "./types.ts";

const CANDIDATE_KEYS = [
  "additionalAmountKRW",
  "observedSalaryKRW",
  "referenceRowIds",
  "referenceSalaryKRW",
  "roleGroup",
  "sourceRowId",
] as const;

export function repeatObservedPrecedent(
  themeId: string,
  rows: NormalizedRosterRow[],
  selection: ObservedPrecedentSelection,
): PrecedentRepeatResult {
  if (!isObservedPrecedentReason(selection?.reason)) {
    throw new Error("OBSERVED_PRECEDENT_REASON_INVALID");
  }
  const candidate = resolveCanonicalCandidate(rows, selection?.candidate);
  const roleRows = rows.filter((row) => row.roleGroup === candidate.roleGroup);
  const sourceRow = roleRows.find((row) => row.rowId === candidate.sourceRowId)!;

  const syntheticRow = syntheticCandidate(
    sourceRow,
    `synthetic_repeat_${sourceRow.rowId}`,
    candidate.observedSalaryKRW,
  );
  const baselineRow = syntheticCandidate(
    sourceRow,
    `synthetic_baseline_${sourceRow.rowId}`,
    candidate.referenceSalaryKRW,
  );
  const currentPairs = buildMaterialTenurePairs(
    roleRows,
    (underpaid, comparator) => underpaid.tenureMonths! > comparator.tenureMonths!,
  );
  const baselinePairs = candidatePairs(roleRows, baselineRow);
  const repeatedPairs = candidatePairs(roleRows, syntheticRow);

  return {
    themeId,
    syntheticRow,
    currentRosterPairCount: currentPairs.length,
    baselineCandidatePairCount: baselinePairs.length,
    repeatedCandidatePairCount: repeatedPairs.length,
    combinedPairCount: currentPairs.length + repeatedPairs.length,
    maximumGapKRW: Math.max(0, ...repeatedPairs.map((pair) => pair.salaryGapKRW)),
    affectedRowIds: Array.from(new Set(repeatedPairs.map((pair) => pair.underpaidRowId)))
      .sort(compareCodeUnits),
    conclusionKey: "product_engineer_observed_hiring_repeat",
    nonClaimKey: "observed_precedent_not_policy",
  };
}

function resolveCanonicalCandidate(
  rows: NormalizedRosterRow[],
  supplied: unknown,
): ObservedPrecedentCandidate {
  if (!isRecord(supplied) || !hasExactCandidateKeys(supplied)) {
    throw new Error("OBSERVED_PRECEDENT_SELECTION_INVALID");
  }
  const sourceRowId = supplied.sourceRowId;
  if (typeof sourceRowId !== "string") {
    throw new Error("OBSERVED_PRECEDENT_SELECTION_INVALID");
  }
  const sourceRow = rows.find((row) => row.rowId === sourceRowId);
  if (!sourceRow) {
    throw new Error("OBSERVED_PRECEDENT_SELECTION_INVALID");
  }
  const canonical = findObservedPrecedentCandidates(rows, sourceRow.roleGroup)
    .find((candidate) => candidate.sourceRowId === sourceRowId);
  if (!canonical || !matchesCanonicalCandidate(supplied, canonical)) {
    throw new Error("OBSERVED_PRECEDENT_SELECTION_INVALID");
  }
  return canonical;
}

function matchesCanonicalCandidate(
  supplied: Record<string, unknown>,
  canonical: ObservedPrecedentCandidate,
): boolean {
  return supplied.sourceRowId === canonical.sourceRowId
    && supplied.roleGroup === canonical.roleGroup
    && arraysEqual(supplied.referenceRowIds, canonical.referenceRowIds)
    && supplied.referenceSalaryKRW === canonical.referenceSalaryKRW
    && supplied.observedSalaryKRW === canonical.observedSalaryKRW
    && supplied.additionalAmountKRW === canonical.additionalAmountKRW;
}

function hasExactCandidateKeys(candidate: Record<string, unknown>): boolean {
  const keys = Object.keys(candidate).sort(compareCodeUnits);
  return arraysEqual(keys, CANDIDATE_KEYS);
}

function arraysEqual(value: unknown, expected: readonly string[]): boolean {
  return Array.isArray(value)
    && value.length === expected.length
    && value.every((item, index) => item === expected[index]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function candidatePairs(
  roleRows: NormalizedRosterRow[],
  syntheticRow: NormalizedRosterRow,
) {
  return buildMaterialTenurePairs(
    [...roleRows, syntheticRow],
    (underpaid, comparator) =>
      underpaid.rowId !== syntheticRow.rowId
      && comparator.rowId === syntheticRow.rowId,
  );
}

function syntheticCandidate(
  sourceRow: NormalizedRosterRow,
  rowId: string,
  baseSalaryKRW: number,
): NormalizedRosterRow {
  return {
    rowId,
    roleGroup: sourceRow.roleGroup,
    ...(sourceRow.title !== undefined ? { title: sourceRow.title } : {}),
    ...(sourceRow.levelLabel !== undefined ? { levelLabel: sourceRow.levelLabel } : {}),
    baseSalaryKRW,
    tenureMonths: 0,
    exceptionFlag: sourceRow.exceptionFlag === true,
    counterOfferFlag: sourceRow.counterOfferFlag === true,
  };
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
