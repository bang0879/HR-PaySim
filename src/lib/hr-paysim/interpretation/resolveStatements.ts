import type { InterpretationStatement } from "./types.ts";

export type ClaimDestination =
  | "SCREEN_2_EVIDENCE"
  | "SCREEN_3_REVIEW_PERSPECTIVE"
  | "SCREEN_4_CONFIRMED"
  | "SCREEN_4_FOLLOW_UP"
  | "FACILITATOR_GUIDE"
  | "METHODOLOGY"
  | "EXPORT_CONFIRMED"
  | "EXPORT_FOLLOW_UP";

export function resolveStatementsForDestination(
  statements: InterpretationStatement[],
  destination: ClaimDestination,
): InterpretationStatement[] {
  return statements.filter((statement) => {
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
  });
}
