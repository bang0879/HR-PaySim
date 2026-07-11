export interface DecisionRecord {
  id: string;
  themeIds: string[];
  actionKey:
    | "define_hiring_additional_pay"
    | "review_long_tenure_pay"
    | "document_role_ranges"
    | "collect_evidence";
  ownerRole: "CEO" | "HR" | "ROLE_LEAD" | "CEO_AND_HR";
  dueEvent: "BEFORE_NEXT_OFFER" | "BEFORE_NEXT_REVIEW" | "WITHIN_TWO_WEEKS";
  status: "draft" | "approved";
}

export type DecisionRecordValidationResult =
  | { status: "ready"; decision: DecisionRecord }
  | { status: "invalid_decision"; invalidFields: Array<keyof DecisionRecord> };
