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

interface ScopedStatement {
  themeId: string;
  statement: InterpretationStatement;
}

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
  const validatedDecisions = input.decisions
    .map((decision) => createDecisionRecord(decision, selectedThemeIds))
    .flatMap((result) => result.status === "ready" ? [result.decision] : []);
  const decisions = resolveIdentityCollisions(
    validatedDecisions,
    (decision) => decision.id,
    stableSerialize,
  );
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
  const followUpCandidates: ReportEvidenceFollowUp[] = input.followUps
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
    }));
  const followUps = resolveIdentityCollisions(
    followUpCandidates,
    (followUp) => followUp.id,
    stableSerialize,
  ).sort(compareFollowUps);

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
  return statements
    .map((statement) => ({ statementId: statement.id, copyKey: statement.copyKey }))
    .sort((a, b) => compareCodeUnits(a.statementId, b.statementId));
}

function collectStatements(
  input: BuildSessionReportInput,
  selectedThemeIds: ReadonlySet<string>,
): Map<string, InterpretationStatement[]> {
  const candidates: ScopedStatement[] = input.validatedClaims.flatMap((claim) =>
    selectedThemeIds.has(claim.themeId)
      ? claim.statements.map((statement) => ({ themeId: claim.themeId, statement }))
      : []
  );
  const resolved = resolveIdentityCollisions(
    candidates,
    (item) => item.statement.id,
    stableSerialize,
  );
  const result = new Map<string, InterpretationStatement[]>();
  for (const item of resolved) {
    result.set(item.themeId, [...(result.get(item.themeId) ?? []), item.statement]);
  }
  return result;
}

function resolveIdentityCollisions<T>(
  items: T[],
  identityOf: (item: T) => string,
  fingerprintOf: (item: T) => string,
): T[] {
  const groups = new Map<string, Map<string, T>>();
  for (const item of items) {
    const identity = identityOf(item);
    const fingerprints = groups.get(identity) ?? new Map<string, T>();
    const fingerprint = fingerprintOf(item);
    if (!fingerprints.has(fingerprint)) fingerprints.set(fingerprint, item);
    groups.set(identity, fingerprints);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => compareCodeUnits(a, b))
    .flatMap(([, fingerprints]) => fingerprints.size === 1
      ? [fingerprints.values().next().value as T]
      : []);
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .sort(([a], [b]) => compareCodeUnits(a, b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? String(value);
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
