import { buildMaterialTenurePairs } from "../detectors/tenurePairs.ts";
import type { NormalizedRosterRow } from "../domain.ts";
import type {
  ObservedPrecedentSelection,
  PrecedentRepeatResult,
} from "./types.ts";

export function repeatObservedPrecedent(
  themeId: string,
  rows: NormalizedRosterRow[],
  selection: ObservedPrecedentSelection,
): PrecedentRepeatResult {
  const roleRows = rows.filter((row) => row.roleGroup === selection.candidate.roleGroup);
  const sourceRow = roleRows.find((row) => row.rowId === selection.candidate.sourceRowId);
  if (!sourceRow) {
    throw new Error(`OBSERVED_PRECEDENT_SOURCE_NOT_FOUND:${selection.candidate.sourceRowId}`);
  }

  const syntheticRow = syntheticCandidate(
    sourceRow,
    `synthetic_repeat_${sourceRow.rowId}`,
    selection.candidate.observedSalaryKRW,
  );
  const baselineRow = syntheticCandidate(
    sourceRow,
    `synthetic_baseline_${sourceRow.rowId}`,
    selection.candidate.referenceSalaryKRW,
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
