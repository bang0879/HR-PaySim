export type ExplanationBasis =
  | "role_responsibility_difference"
  | "market_hiring_additional_pay"
  | "performance_or_scarce_skill"
  | "retention_exception"
  | "timing_context"
  | "founder_cannot_explain";

export type EvidenceStatus =
  | "unanswered"
  | "documented"
  | "observable"
  | "leader_assertion_only"
  | "insufficient_data";

export type RepeatabilityStatus =
  | "unanswered"
  | "reusable_rule"
  | "conditional_rule"
  | "one_time_exception"
  | "not_reusable"
  | "insufficient_data";

export type ReviewOutcome =
  | "unanswered"
  | "explained_with_evidence"
  | "explained_without_documentation"
  | "one_time_exception"
  | "founder_cannot_explain"
  | "insufficient_data";

export interface EvidenceFollowUp {
  id: string;
  themeId: string;
  evidenceNeeded: "role_document" | "offer_record" | "raise_history" | "exception_approval";
  ownerRole: "CEO" | "HR" | "ROLE_LEAD";
  dueEvent: "BEFORE_NEXT_OFFER" | "BEFORE_NEXT_REVIEW" | "WITHIN_TWO_WEEKS";
}

export interface ThemeReview {
  themeId: string;
  explanationBasis: ExplanationBasis | "unanswered";
  evidenceStatus: EvidenceStatus;
  repeatabilityStatus: RepeatabilityStatus;
  outcome: ReviewOutcome;
  approvedSentenceKey?: ExplanationBasis;
  evidenceFollowUp?: EvidenceFollowUp;
}

export interface ReviewDependencyState {
  review: ThemeReview;
  repeatResult?: { themeId: string; status: "ready" };
  decision?: { themeId: string; status: "draft" | "approved" };
}
