import type { DecisionRecord, DecisionRecordValidationResult } from "./types.ts";

const DECISION_FIELDS = [
  "id",
  "themeIds",
  "actionKey",
  "ownerRole",
  "dueEvent",
  "status",
] as const satisfies readonly (keyof DecisionRecord)[];
const ACTION_KEYS = new Set<DecisionRecord["actionKey"]>([
  "define_hiring_additional_pay",
  "review_long_tenure_pay",
  "document_role_ranges",
  "collect_evidence",
]);
const OWNER_ROLES = new Set<DecisionRecord["ownerRole"]>([
  "CEO",
  "HR",
  "ROLE_LEAD",
  "CEO_AND_HR",
]);
const DUE_EVENTS = new Set<DecisionRecord["dueEvent"]>([
  "BEFORE_NEXT_OFFER",
  "BEFORE_NEXT_REVIEW",
  "WITHIN_TWO_WEEKS",
]);
const STATUSES = new Set<DecisionRecord["status"]>(["draft", "approved"]);

export function createDecisionRecord(
  input: unknown,
  validThemeIds: ReadonlySet<string>,
): DecisionRecordValidationResult {
  const payload = isRecord(input) ? input : {};
  const canonicalThemeIds = canonicalThemeIdsFrom(payload.themeIds);
  const invalidFields = DECISION_FIELDS.filter((field) => {
    switch (field) {
      case "id":
        return !isNonEmptyString(payload.id);
      case "themeIds":
        return canonicalThemeIds.length === 0
          || canonicalThemeIds.some((themeId) => !validThemeIds.has(themeId));
      case "actionKey":
        return !isEnumValue(payload.actionKey, ACTION_KEYS);
      case "ownerRole":
        return !isEnumValue(payload.ownerRole, OWNER_ROLES);
      case "dueEvent":
        return !isEnumValue(payload.dueEvent, DUE_EVENTS);
      case "status":
        return !isEnumValue(payload.status, STATUSES);
    }
  });

  if (invalidFields.length > 0) return { status: "invalid_decision", invalidFields };

  return {
    status: "ready",
    decision: {
      id: payload.id as string,
      themeIds: canonicalThemeIds,
      actionKey: payload.actionKey as DecisionRecord["actionKey"],
      ownerRole: payload.ownerRole as DecisionRecord["ownerRole"],
      dueEvent: payload.dueEvent as DecisionRecord["dueEvent"],
      status: payload.status as DecisionRecord["status"],
    },
  };
}

function canonicalThemeIdsFrom(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((item) => !isNonEmptyString(item))) return [];
  return Array.from(new Set(value)).sort(compareCodeUnits);
}

function isEnumValue<T extends string>(value: unknown, allowed: ReadonlySet<T>): value is T {
  return typeof value === "string" && allowed.has(value as T);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
