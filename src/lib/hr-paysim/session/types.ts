import type { DecisionRecord } from "../decisions/types.ts";
import type { NormalizedRosterRow } from "../domain.ts";
import type { InterpretationClaim } from "../interpretation/types.ts";
import type { PrecedentRepeatResult } from "../repeat/types.ts";
import type { SessionReport } from "../report/types.ts";
import type { ThemeReview } from "../review/types.ts";
import type { ThemeReviewUpdate } from "../review/updateThemeReview.ts";
import type { ReviewSubjectSelection } from "../themes/selectReviewSubjects.ts";
import type { StructuralTheme } from "../themes/types.ts";

export type DecisionRoomScreen =
  | "introduction"
  | "confirmed_pay_differences"
  | "company_rule"
  | "session_result";

export type SessionReportViewModel = SessionReport;

export interface DecisionRoomSessionState {
  mode: "facilitated" | "demo";
  screen: DecisionRoomScreen;
  rows: NormalizedRosterRow[];
  themes: StructuralTheme[];
  selection: ReviewSubjectSelection;
  activeThemeId?: string;
  reviews: Record<string, ThemeReview>;
  interpretations: Record<string, InterpretationClaim>;
  repeats: Record<string, PrecedentRepeatResult>;
  decisions: DecisionRecord[];
  report?: SessionReportViewModel;
}

export type DecisionRoomAction =
  | {
    type: "START_SESSION";
    mode: DecisionRoomSessionState["mode"];
    rows: NormalizedRosterRow[];
    themes: StructuralTheme[];
    selection: ReviewSubjectSelection;
    activeThemeId?: string;
  }
  | { type: "SELECT_THEME"; themeId: string }
  | { type: "UPDATE_REVIEW"; themeId: string; patch: ThemeReviewUpdate }
  | { type: "SET_INTERPRETATIONS"; claims: InterpretationClaim[] }
  | { type: "SET_REPEAT"; repeat: PrecedentRepeatResult }
  | { type: "APPROVE_DECISION"; decision: DecisionRecord }
  | { type: "GO_TO_SCREEN"; screen: DecisionRoomScreen }
  | { type: "END_SESSION" };
