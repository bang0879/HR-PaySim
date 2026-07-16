import type { NormalizedRosterRow } from "../domain.ts";
import type { ReviewSubjectSelection } from "../themes/selectReviewSubjects.ts";
import type { StructuralTheme } from "../themes/types.ts";
import type {
  KoreanRosterAdapterIssueCode,
  KoreanRosterField,
} from "./koreanRosterAdapter.ts";
import type { CompensationExceptionReason } from "./rosterTemplateContract.ts";

export type PreparationStatus =
  | "empty"
  | "needs_column_consent"
  | "blocked"
  | "ready_for_confirmation";

export type PreparationIssueCode =
  | KoreanRosterAdapterIssueCode
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "EMPTY_WORKBOOK"
  | "AMBIGUOUS_WORKBOOK"
  | "FORMULA_RESULT_UNAVAILABLE"
  | "UNREADABLE_WORKBOOK"
  | "NO_SUPPORTED_REVIEW_SUBJECT";

export interface SafePreparationIssue {
  sourceLineNumber?: number;
  code: PreparationIssueCode;
  field?: KoreanRosterField;
}

export interface PreparationPreviewRow {
  employeeLabel: string;
  roleGroup: string;
  salaryKRW: number;
  relevantExperienceMonths?: number;
  tenureMonths?: number;
  levelLabel?: string;
  levelRank?: number;
  compensationExceptionReason: CompensationExceptionReason;
}

export interface FacilitatorSessionDraft {
  rows: NormalizedRosterRow[];
  themes: StructuralTheme[];
  selection: ReviewSubjectSelection;
  activeThemeId: string;
}

export interface FacilitatorPreparationResult {
  status: PreparationStatus;
  prohibitedColumnHeaders: string[];
  issues: SafePreparationIssue[];
  previewRows: PreparationPreviewRow[];
  rows: NormalizedRosterRow[];
  draft?: FacilitatorSessionDraft;
  shouldClearRaw: boolean;
  usedFormulaSnapshot: boolean;
}
