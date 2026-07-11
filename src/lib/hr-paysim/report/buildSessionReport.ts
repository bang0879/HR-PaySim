import { createDecisionRecord } from "../decisions/decisionRecords.ts";
import type { InterpretationStatement } from "../interpretation/types.ts";
import type { ThemeReview } from "../review/types.ts";
import type {
  BuildSessionReportInput,
  ConfirmedReportResult,
  ReportEvidenceFollowUp,
  ReportStatementRef,
  SessionReport,
  SessionReportSubject,
} from "./types.ts";

export function buildSessionReport(input: BuildSessionReportInput): SessionReport {
  const themesById = new Map(input.themes.map((theme) => [theme.id, theme]));
  const unselectedSubjectAppendix = input.unselectedSubjects
    .filter((theme) => themesById.has(theme.id))
    .map((theme) => ({ themeId: theme.id, roleGroup: theme.roleGroup }))
    .sort(compareAppendix);
  const unselectedIds = new Set(unselectedSubjectAppendix.map((theme) => theme.themeId));
  const selectedThemes = input.themes
    .filter((theme) => !unselectedIds.has(theme.id))
    .sort(compareThemes);
  const selectedThemeIds = new Set(selectedThemes.map((theme) => theme.id));
  const decisions = input.decisions
    .map((decision) => createDecisionRecord(decision, selectedThemeIds))
    .flatMap((result) => result.status === "ready" ? [result.decision] : [])
    .sort((a, b) => compareCodeUnits(a.id, b.id));
  const statementsByTheme = collectStatements(input, selectedThemeIds);

  const reviewedSubjects = selectedThemes.flatMap((theme): SessionReportSubject[] => {
    const review = input.reviews[theme.id];
    if (!review || review.themeId !== theme.id) return [];
    const repeatResult = input.repeatResults[theme.id];
    return [{
      themeId: theme.id,
      roleGroup: theme.roleGroup,
      review: reportReview(review),
      ...(repeatResult?.themeId === theme.id ? { repeatResult: cloneRepeatResult(repeatResult) } : {}),
      decisionIds: decisions
        .filter((decision) => decision.themeIds.includes(theme.id))
        .map((decision) => decision.id),
    }];
  });

  const confirmedResults: ConfirmedReportResult[] = selectedThemes.flatMap((theme) =>
    statementRefs((statementsByTheme.get(theme.id) ?? []).filter(isConfirmedClientFact))
      .map((statement) => ({ themeId: theme.id, ...statement }))
  );
  const followUps: ReportEvidenceFollowUp[] = input.followUps
    .filter((followUp) => selectedThemeIds.has(followUp.themeId))
    .map((followUp) => ({
      id: followUp.id,
      themeId: followUp.themeId,
      evidenceNeeded: followUp.evidenceNeeded,
      ownerRole: followUp.ownerRole,
      dueEvent: followUp.dueEvent,
      statementRefs: statementRefs(
        (statementsByTheme.get(followUp.themeId) ?? []).filter(isWorkingHypothesis),
      ),
    }))
    .sort(compareFollowUps);

  return {
    reviewedSubjects,
    confirmedResults,
    decisions,
    followUps,
    unselectedSubjectAppendix,
  };
}

function reportReview(review: ThemeReview): SessionReportSubject["review"] {
  return {
    outcome: review.outcome,
    explanationBasis: review.explanationBasis,
    evidenceStatus: review.evidenceStatus,
    repeatabilityStatus: review.repeatabilityStatus,
    ...(review.approvedSentenceKey
      ? { approvedSentenceKey: review.approvedSentenceKey }
      : {}),
  };
}

function isConfirmedClientFact(statement: InterpretationStatement): boolean {
  return statement.claimStatus === "SUPPORTED_BY_CLIENT_DATA"
    && statement.kind === "SURFACE_OBSERVATION";
}

function isWorkingHypothesis(statement: InterpretationStatement): boolean {
  return statement.claimStatus === "WORKING_HYPOTHESIS";
}

function statementRefs(statements: InterpretationStatement[]): ReportStatementRef[] {
  const byId = new Map<string, ReportStatementRef>();
  for (const statement of [...statements].sort((a, b) => compareCodeUnits(a.id, b.id))) {
    if (!byId.has(statement.id)) {
      byId.set(statement.id, { statementId: statement.id, copyKey: statement.copyKey });
    }
  }
  return Array.from(byId.values());
}

function collectStatements(
  input: BuildSessionReportInput,
  selectedThemeIds: ReadonlySet<string>,
): Map<string, InterpretationStatement[]> {
  const result = new Map<string, InterpretationStatement[]>();
  for (const claim of [...input.validatedClaims].sort((a, b) => compareCodeUnits(a.id, b.id))) {
    if (!selectedThemeIds.has(claim.themeId)) continue;
    result.set(claim.themeId, [...(result.get(claim.themeId) ?? []), ...claim.statements]);
  }
  return result;
}

function cloneRepeatResult(result: NonNullable<SessionReportSubject["repeatResult"]>) {
  return {
    ...result,
    syntheticRow: { ...result.syntheticRow },
    affectedRowIds: [...result.affectedRowIds],
  };
}

function compareThemes(a: { id: string; roleGroup: string }, b: { id: string; roleGroup: string }): number {
  return compareCodeUnits(a.roleGroup, b.roleGroup) || compareCodeUnits(a.id, b.id);
}

function compareAppendix(
  a: { themeId: string; roleGroup: string },
  b: { themeId: string; roleGroup: string },
): number {
  return compareCodeUnits(a.roleGroup, b.roleGroup) || compareCodeUnits(a.themeId, b.themeId);
}

function compareFollowUps(a: ReportEvidenceFollowUp, b: ReportEvidenceFollowUp): number {
  return compareCodeUnits(a.themeId, b.themeId) || compareCodeUnits(a.id, b.id);
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
