import type {
  InterpretationClaimStatus,
  InterpretationStatement,
  InterpretationStatementKind,
} from "./types.ts";

export type ClaimDestination =
  | "SCREEN_2_EVIDENCE"
  | "SCREEN_3_REVIEW_PERSPECTIVE"
  | "SCREEN_4_CONFIRMED"
  | "SCREEN_4_FOLLOW_UP"
  | "FACILITATOR_GUIDE"
  | "METHODOLOGY"
  | "EXPORT_CONFIRMED"
  | "EXPORT_FOLLOW_UP";

const DESTINATIONS: ReadonlySet<string> = new Set<ClaimDestination>([
  "SCREEN_2_EVIDENCE",
  "SCREEN_3_REVIEW_PERSPECTIVE",
  "SCREEN_4_CONFIRMED",
  "SCREEN_4_FOLLOW_UP",
  "FACILITATOR_GUIDE",
  "METHODOLOGY",
  "EXPORT_CONFIRMED",
  "EXPORT_FOLLOW_UP",
]);

const CLAIM_STATUSES: ReadonlySet<string> = new Set<InterpretationClaimStatus>([
  "VERIFIED_EXTERNAL",
  "SUPPORTED_BY_CLIENT_DATA",
  "KYLE_EXPERIENCE_BASED",
  "WORKING_HYPOTHESIS",
  "UNSUPPORTED_DO_NOT_USE",
]);

const STATEMENT_KINDS: ReadonlySet<string> = new Set<InterpretationStatementKind>([
  "SURFACE_OBSERVATION",
  "TYPICAL_INTERPRETATION",
  "DEEPER_MECHANISM",
  "TIME_AXIS_OR_CASCADE",
  "COUNTER_INTUITIVE_ANGLE",
  "DECISION_RELEVANCE",
]);

export function resolveStatementsForDestination(
  statements: InterpretationStatement[],
  destination: ClaimDestination,
): InterpretationStatement[] {
  if (!Array.isArray(statements) || !DESTINATIONS.has(destination)) return [];

  return statements
    .filter(isRuntimeStatement)
    .filter((statement) => isAllowedAtDestination(statement, destination))
    .sort(compareStatements);
}

function isRuntimeStatement(value: unknown): value is InterpretationStatement {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<InterpretationStatement>;
  return typeof candidate.id === "string"
    && typeof candidate.copyKey === "string"
    && typeof candidate.claimStatus === "string"
    && CLAIM_STATUSES.has(candidate.claimStatus)
    && typeof candidate.kind === "string"
    && STATEMENT_KINDS.has(candidate.kind);
}

function isAllowedAtDestination(
  statement: InterpretationStatement,
  destination: ClaimDestination,
): boolean {
  if (statement.claimStatus === "UNSUPPORTED_DO_NOT_USE") return false;
  if (statement.claimStatus === "WORKING_HYPOTHESIS") {
    return destination === "SCREEN_4_FOLLOW_UP"
      || destination === "EXPORT_FOLLOW_UP"
      || destination === "SCREEN_3_REVIEW_PERSPECTIVE";
  }
  if (statement.claimStatus === "KYLE_EXPERIENCE_BASED") {
    return destination === "FACILITATOR_GUIDE"
      || destination === "METHODOLOGY"
      || destination === "SCREEN_3_REVIEW_PERSPECTIVE";
  }
  if (statement.claimStatus === "VERIFIED_EXTERNAL") {
    return destination === "METHODOLOGY"
      || destination === "FACILITATOR_GUIDE"
      || destination === "SCREEN_3_REVIEW_PERSPECTIVE";
  }
  if (statement.claimStatus !== "SUPPORTED_BY_CLIENT_DATA") return false;
  if (statement.kind !== "SURFACE_OBSERVATION") return false;
  return destination === "SCREEN_2_EVIDENCE"
    || destination === "SCREEN_4_CONFIRMED"
    || destination === "EXPORT_CONFIRMED";
}

function compareStatements(a: InterpretationStatement, b: InterpretationStatement): number {
  return compareCodeUnits(a.id, b.id)
    || compareCodeUnits(a.copyKey, b.copyKey)
    || compareCodeUnits(a.claimStatus, b.claimStatus)
    || compareCodeUnits(a.kind, b.kind);
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
