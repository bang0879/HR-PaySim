import type { NormalizedRosterRow } from "../domain.ts";
import type { ReviewSubjectSelection } from "../themes/selectReviewSubjects.ts";
import type { StructuralTheme } from "../themes/types.ts";
import type { RosterParseIssue } from "../rosterParser.ts";

export type PreparationStatus =
  | "empty"
  | "needs_column_consent"
  | "blocked"
  | "ready_for_confirmation";

export type PreparationIssueCode =
  | RosterParseIssue["code"]
  | "UNSUPPORTED_ROLE"
  | "UNSUPPORTED_PRODUCT_ENGINEER_COMPARISON";

export interface SafePreparationIssue {
  sourceLineNumber?: number;
  code: PreparationIssueCode;
}

export interface PreparationPreviewRow {
  employeeLabel: string;
  roleGroup: "Product Engineer";
  salaryKRW: number;
  tenureMonths?: number;
  title?: string;
  levelLabel?: string;
  documentedException: boolean;
}

export interface ProductEngineerSessionDraft {
  rows: NormalizedRosterRow[];
  themes: StructuralTheme[];
  selection: ReviewSubjectSelection;
  activeThemeId: string;
}

export interface ProductEngineerPreparationResult {
  status: PreparationStatus;
  prohibitedColumnHeaders: string[];
  issues: SafePreparationIssue[];
  previewRows: PreparationPreviewRow[];
  rows: NormalizedRosterRow[];
  draft?: ProductEngineerSessionDraft;
  shouldClearRaw: boolean;
}
