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
  | "UNREADABLE_WORKBOOK"
  | "UNSUPPORTED_ROLE"
  | "UNSUPPORTED_PRODUCT_ENGINEER_COMPARISON";

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
