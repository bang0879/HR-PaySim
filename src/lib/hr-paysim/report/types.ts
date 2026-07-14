import type { DecisionRecord } from "../decisions/types.ts";
import type { InterpretationClaim } from "../interpretation/types.ts";
import type { PrecedentRepeatResult } from "../repeat/types.ts";
import type { EvidenceFollowUp, ThemeReview } from "../review/types.ts";
import type { StructuralTheme } from "../themes/types.ts";

export interface BuildSessionReportInput {
  themes: StructuralTheme[];
  reviews: Record<string, ThemeReview>;
  validatedClaims: InterpretationClaim[];
  repeatResults: Record<string, PrecedentRepeatResult>;
  decisions: DecisionRecord[];
  followUps: EvidenceFollowUp[];
  unselectedSubjects: StructuralTheme[];
}

export interface ReportStatementRef {
  statementId: string;
  copyKey: string;
}

export interface ReportRepeatResult {
  themeId: string;
  currentRosterPairCount: number;
  baselineCandidatePairCount: number;
  repeatedCandidatePairCount: number;
  combinedPairCount: number;
  maximumGapKRW: number;
  affectedRowCount: number;
  conclusionKey: PrecedentRepeatResult["conclusionKey"];
  nonClaimKey: PrecedentRepeatResult["nonClaimKey"];
}

export interface SessionReportSubject {
  themeId: string;
  roleGroup: string;
  review: Pick<
    ThemeReview,
    | "outcome"
    | "explanationBasis"
    | "evidenceStatus"
    | "repeatabilityStatus"
    | "approvedSentenceKey"
  >;
  repeatResult?: ReportRepeatResult;
  decisionIds: string[];
}

export interface ConfirmedReportResult extends ReportStatementRef {
  themeId: string;
}

export interface ReportEvidenceFollowUp extends EvidenceFollowUp {
  statementRefs: ReportStatementRef[];
}

export interface SessionReport {
  reviewedSubjects: SessionReportSubject[];
  confirmedResults: ConfirmedReportResult[];
  decisions: DecisionRecord[];
  followUps: ReportEvidenceFollowUp[];
  unselectedSubjectAppendix: Array<{ themeId: string; roleGroup: string }>;
}
