import type { NormalizedRosterRow } from "../domain.ts";

export interface ObservedPrecedentCandidate {
  sourceRowId: string;
  roleGroup: string;
  referenceRowIds: string[];
  referenceSalaryKRW: number;
  observedSalaryKRW: number;
  additionalAmountKRW: number;
}

export interface ObservedPrecedentSelection {
  candidate: ObservedPrecedentCandidate;
  reason:
    | "documented_hiring_exception"
    | "documented_counteroffer"
    | "facilitator_selected_other";
}

export interface PrecedentRepeatResult {
  themeId: string;
  syntheticRow: NormalizedRosterRow;
  currentRosterPairCount: number;
  baselineCandidatePairCount: number;
  repeatedCandidatePairCount: number;
  combinedPairCount: number;
  maximumGapKRW: number;
  affectedRowIds: string[];
  conclusionKey: "product_engineer_observed_hiring_repeat";
  nonClaimKey: "observed_precedent_not_policy";
}
