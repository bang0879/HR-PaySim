import type { FounderBoundedHiringRule } from "./types.ts";

export type FounderBoundedRuleRepeatResult =
  | { status: "insufficient_parameters"; invalidFields: string[] }
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

const fields: Array<keyof FounderBoundedHiringRule> = [
  "themeId",
  "roleGroup",
  "trigger",
  "referenceSalaryKRW",
  "additionalAmountKRW",
  "maximumSalaryKRW",
  "approverRole",
  "reviewEvent",
];

export function repeatFounderBoundedHiringRule(
  input: unknown,
): FounderBoundedRuleRepeatResult {
  if (!isRecord(input)) {
    return { status: "insufficient_parameters", invalidFields: [...fields] };
  }
  const invalidFields = fields.filter((field) => !isValidField(field, input[field]));
  if (invalidFields.length > 0) {
    return { status: "insufficient_parameters", invalidFields };
  }

  const rule = input as unknown as FounderBoundedHiringRule;
  return {
    status: "ready",
    themeId: rule.themeId,
    roleGroup: rule.roleGroup,
    trigger: rule.trigger,
    referenceSalaryKRW: rule.referenceSalaryKRW,
    additionalAmountKRW: rule.additionalAmountKRW,
    maximumSalaryKRW: rule.maximumSalaryKRW,
    syntheticSalaryKRW: Math.min(
      rule.referenceSalaryKRW + rule.additionalAmountKRW,
      rule.maximumSalaryKRW,
    ),
    approverRole: rule.approverRole,
    reviewEvent: rule.reviewEvent,
    conclusionKey: "founder_bounded_hiring_rule_repeat",
    nonClaimKey: "bounded_rule_not_salary_recommendation",
  };
}

function isValidField(field: keyof FounderBoundedHiringRule, value: unknown): boolean {
  if (field === "themeId" || field === "roleGroup") {
    return typeof value === "string" && value.trim().length > 0;
  }
  if (field === "trigger") {
    return value === "hard_to_fill_role" || value === "scarce_skill" || value === "approved_exception";
  }
  if (field === "approverRole") return value === "CEO" || value === "CEO_AND_HR";
  if (field === "reviewEvent") {
    return value === "BEFORE_NEXT_OFFER" || value === "BEFORE_NEXT_REVIEW";
  }
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
