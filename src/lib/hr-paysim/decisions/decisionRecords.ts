import type { DecisionRecord } from "./types.ts";

export type CreateDecisionRecordResult =
  | { status: "ready"; decision: DecisionRecord }
  | { status: "invalid_decision" };

const actionKeys = new Set<DecisionRecord["actionKey"]>([
  "define_hiring_additional_pay",
  "review_long_tenure_pay",
  "document_role_ranges",
  "collect_evidence",
]);
const ownerRoles = new Set<DecisionRecord["ownerRole"]>(["CEO", "HR", "ROLE_LEAD", "CEO_AND_HR"]);
const dueEvents = new Set<DecisionRecord["dueEvent"]>([
  "BEFORE_NEXT_OFFER",
  "BEFORE_NEXT_REVIEW",
  "WITHIN_TWO_WEEKS",
]);
const statuses = new Set<DecisionRecord["status"]>(["draft", "approved"]);

export function createDecisionRecord(
  input: unknown,
  validThemeIds: ReadonlySet<string>,
): CreateDecisionRecordResult {
  if (!isRecord(input)) return { status: "invalid_decision" };
  if (typeof input.id !== "string" || input.id.trim().length === 0) {
    return { status: "invalid_decision" };
  }
  if (!Array.isArray(input.themeIds) || input.themeIds.length === 0) {
    return { status: "invalid_decision" };
  }
  if (!input.themeIds.every((id) => typeof id === "string" && validThemeIds.has(id))) {
    return { status: "invalid_decision" };
  }
  if (!actionKeys.has(input.actionKey as DecisionRecord["actionKey"])) {
    return { status: "invalid_decision" };
  }
  if (!ownerRoles.has(input.ownerRole as DecisionRecord["ownerRole"])) {
    return { status: "invalid_decision" };
  }
  if (!dueEvents.has(input.dueEvent as DecisionRecord["dueEvent"])) {
    return { status: "invalid_decision" };
  }
  if (!statuses.has(input.status as DecisionRecord["status"])) {
    return { status: "invalid_decision" };
  }

  return {
    status: "ready",
    decision: {
      id: input.id,
      themeIds: Array.from(new Set(input.themeIds as string[])).sort(compareCodeUnits),
      actionKey: input.actionKey as DecisionRecord["actionKey"],
      ownerRole: input.ownerRole as DecisionRecord["ownerRole"],
      dueEvent: input.dueEvent as DecisionRecord["dueEvent"],
      status: input.status as DecisionRecord["status"],
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
