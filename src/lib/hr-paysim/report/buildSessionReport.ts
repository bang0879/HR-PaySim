import { createDecisionRecord } from "../decisions/decisionRecords.ts";
import type { InterpretationStatement } from "../interpretation/types.ts";
import type { PrecedentRepeatResult } from "../repeat/types.ts";
import type { ThemeReview } from "../review/types.ts";
import type { StructuralTheme } from "../themes/types.ts";
import type {
  BuildSessionReportInput,
  ConfirmedReportResult,
  ReportEvidenceFollowUp,
  ReportRepeatResult,
  ReportStatementRef,
  SessionReport,
  SessionReportSubject,
} from "./types.ts";

export function buildSessionReport(input: BuildSessionReportInput): SessionReport {
  const themes = canonicalThemes(input.themes);
  const themesById = new Map(themes.map((theme) => [theme.id, theme]));
  const unselectedIds = new Set(input.unselectedSubjects
    .map((theme) => theme.id)
    .filter((themeId) => themesById.has(themeId)));
  const unselectedSubjectAppendix = themes
    .filter((theme) => unselectedIds.has(theme.id))
    .map((theme) => ({ themeId: theme.id, roleGroup: theme.roleGroup }));
  const selectedThemes = themes.filter((theme) => {
    const review = input.reviews[theme.id];
    return !unselectedIds.has(theme.id) && review?.themeId === theme.id;
  });
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
      ...(repeatResult?.themeId === theme.id
        ? { repeatResult: reportRepeatResult(repeatResult) }
        : {}),
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

function canonicalThemes(themes: StructuralTheme[]): StructuralTheme[] {
  const byId = new Map<string, StructuralTheme>();
  for (const theme of [...themes].sort(compareThemes)) {
    if (!byId.has(theme.id)) byId.set(theme.id, theme);
  }
  return Array.from(byId.values());
}

function reportReview(review: ThemeReview): SessionReportSubject["review"] {
  return {
    outcome: review.outcome,
    explanationBasis: review.explanationBasis,
    evidenceStatus: review.evidenceStatus,
    repeatabilityStatus: review.repeatabilityStatus,
    ...(review.approvedSentenceKey ? { approvedSentenceKey: review.approvedSentenceKey } : {}),
  };
}

function reportRepeatResult(result: PrecedentRepeatResult): ReportRepeatResult {
  return {
    themeId: result.themeId,
    currentRosterPairCount: result.currentRosterPairCount,
    baselineCandidatePairCount: result.baselineCandidatePairCount,
    repeatedCandidatePairCount: result.repeatedCandidatePairCount,
    combinedPairCount: result.combinedPairCount,
    maximumGapKRW: result.maximumGapKRW,
    affectedRowCount: result.affectedRowIds.length,
    conclusionKey: result.conclusionKey,
    nonClaimKey: result.nonClaimKey,
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
  for (const claim of [...input.validatedClaims].sort((a, b) =>
    compareCodeUnits(a.themeId, b.themeId) || compareCodeUnits(a.id, b.id)
  )) {
    if (!selectedThemeIds.has(claim.themeId)) continue;
    result.set(claim.themeId, [...(result.get(claim.themeId) ?? []), ...claim.statements]);
  }
  return result;
}

function compareThemes(a: StructuralTheme, b: StructuralTheme): number {
  return compareCodeUnits(a.roleGroup, b.roleGroup) || compareCodeUnits(a.id, b.id);
}

function compareFollowUps(a: ReportEvidenceFollowUp, b: ReportEvidenceFollowUp): number {
  return compareCodeUnits(a.themeId, b.themeId) || compareCodeUnits(a.id, b.id);
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
