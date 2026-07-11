import type {
  FounderBoundedHiringRule,
  FounderBoundedHiringRuleField,
  FounderBoundedRuleRepeatResult,
} from "./types.ts";

const RULE_FIELDS = [
  "themeId",
  "roleGroup",
  "trigger",
  "referenceSalaryKRW",
  "additionalAmountKRW",
  "maximumSalaryKRW",
  "approverRole",
  "reviewEvent",
] as const satisfies readonly FounderBoundedHiringRuleField[];

const TRIGGERS = new Set<FounderBoundedHiringRule["trigger"]>([
  "hard_to_fill_role",
  "scarce_skill",
  "approved_exception",
]);
const APPROVER_ROLES = new Set<FounderBoundedHiringRule["approverRole"]>([
  "CEO",
  "CEO_AND_HR",
]);
const REVIEW_EVENTS = new Set<FounderBoundedHiringRule["reviewEvent"]>([
  "BEFORE_NEXT_OFFER",
  "BEFORE_NEXT_REVIEW",
]);

export function repeatFounderBoundedHiringRule(approval: unknown): FounderBoundedRuleRepeatResult {
  const payload = isRecord(approval) ? approval : {};
  const rule = isRecord(payload.rule) ? payload.rule : {};
  const invalidFields = RULE_FIELDS.filter((field) => !isValidRuleField(field, rule[field]));
  const approvedFields = validApprovedFields(payload.approvedFields);
  const unapprovedFields = RULE_FIELDS.filter((field) => !approvedFields.has(field));

  if (invalidFields.length > 0 || unapprovedFields.length > 0) {
    return { status: "insufficient_parameters", invalidFields, unapprovedFields };
  }

  const canonical = canonicalRule(rule);
  return {
    status: "ready",
    ...canonical,
    syntheticSalaryKRW: Math.min(
      canonical.referenceSalaryKRW + canonical.additionalAmountKRW,
      canonical.maximumSalaryKRW,
    ),
    conclusionKey: "founder_bounded_hiring_rule_repeat",
    nonClaimKey: "bounded_rule_not_salary_recommendation",
  };
}

function canonicalRule(rule: Record<string, unknown>): FounderBoundedHiringRule {
  return {
    themeId: rule.themeId as string,
    roleGroup: rule.roleGroup as string,
    trigger: rule.trigger as FounderBoundedHiringRule["trigger"],
    referenceSalaryKRW: rule.referenceSalaryKRW as number,
    additionalAmountKRW: rule.additionalAmountKRW as number,
    maximumSalaryKRW: rule.maximumSalaryKRW as number,
    approverRole: rule.approverRole as FounderBoundedHiringRule["approverRole"],
    reviewEvent: rule.reviewEvent as FounderBoundedHiringRule["reviewEvent"],
  };
}

function isValidRuleField(field: FounderBoundedHiringRuleField, value: unknown): boolean {
  switch (field) {
    case "themeId":
    case "roleGroup":
      return isNonEmptyString(value);
    case "trigger":
      return typeof value === "string"
        && TRIGGERS.has(value as FounderBoundedHiringRule["trigger"]);
    case "referenceSalaryKRW":
    case "additionalAmountKRW":
    case "maximumSalaryKRW":
      return isNonNegativeFiniteNumber(value);
    case "approverRole":
      return typeof value === "string"
        && APPROVER_ROLES.has(value as FounderBoundedHiringRule["approverRole"]);
    case "reviewEvent":
      return typeof value === "string"
        && REVIEW_EVENTS.has(value as FounderBoundedHiringRule["reviewEvent"]);
  }
}

function validApprovedFields(value: unknown): Set<FounderBoundedHiringRuleField> {
  if (!Array.isArray(value)) return new Set();
  return new Set(value.filter((field): field is FounderBoundedHiringRuleField =>
    typeof field === "string" && RULE_FIELDS.includes(field as FounderBoundedHiringRuleField)
  ));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
