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

export interface FounderBoundedHiringRule {
  themeId: string;
  roleGroup: string;
  trigger: "hard_to_fill_role" | "scarce_skill" | "approved_exception";
  referenceSalaryKRW: number;
  additionalAmountKRW: number;
  maximumSalaryKRW: number;
  approverRole: "CEO" | "CEO_AND_HR";
  reviewEvent: "BEFORE_NEXT_OFFER" | "BEFORE_NEXT_REVIEW";
}

export type FounderBoundedHiringRuleField = keyof FounderBoundedHiringRule;

export interface FounderBoundedRuleApproval {
  rule: unknown;
  approvedFields: unknown;
}

export type FounderBoundedRuleRepeatResult =
  | {
    status: "insufficient_parameters";
    invalidFields: FounderBoundedHiringRuleField[];
    unapprovedFields: FounderBoundedHiringRuleField[];
  }
  | {
    status: "ready";
    themeId: string;
    roleGroup: string;
    trigger: FounderBoundedHiringRule["trigger"];
    referenceSalaryKRW: number;
    additionalAmountKRW: number;
    maximumSalaryKRW: number;
    syntheticSalaryKRW: number;
    approverRole: FounderBoundedHiringRule["approverRole"];
    reviewEvent: FounderBoundedHiringRule["reviewEvent"];
    conclusionKey: "founder_bounded_hiring_rule_repeat";
    nonClaimKey: "bounded_rule_not_salary_recommendation";
  };
