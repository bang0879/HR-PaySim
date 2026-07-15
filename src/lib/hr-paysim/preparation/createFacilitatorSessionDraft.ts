import type { NormalizedRosterRow } from "../domain.ts";
import { detectStructuralFindings } from "../structuralFindings.ts";
import { buildStructuralThemes } from "../themes/buildStructuralThemes.ts";
import { selectFacilitatorReviewSubjects } from "../themes/selectReviewSubjects.ts";
import type { StructuralTheme } from "../themes/types.ts";
import type { FacilitatorSessionDraft } from "./types.ts";

type UnsupportedDraftReason =
  | "NO_HEADLINE_PAIR"
  | "NO_HEADLINE_GAP"
  | "MISSING_HEADLINE_RELEVANT_EXPERIENCE"
  | "MISSING_HEADLINE_TENURE";

export type FacilitatorSessionDraftResult =
  | { supported: true; draft: FacilitatorSessionDraft }
  | { supported: false; reason: UnsupportedDraftReason };

export function createFacilitatorSessionDraft(
  inputRows: NormalizedRosterRow[],
): FacilitatorSessionDraftResult {
  const rows = inputRows.map((row) => ({ ...row }));
  const themes = buildStructuralThemes(rows, detectStructuralFindings(rows));
  const selection = selectFacilitatorReviewSubjects(themes);

  if (selection.selected.length === 0) {
    return { supported: false, reason: "NO_HEADLINE_PAIR" };
  }

  for (const theme of selection.selected) {
    const unsupportedReason = validateSelectedTheme(rows, theme);
    if (unsupportedReason) return { supported: false, reason: unsupportedReason };
  }

  return {
    supported: true,
    draft: {
      rows,
      themes,
      selection,
      activeThemeId: selection.selected[0]!.id,
    },
  };
}

function validateSelectedTheme(
  rows: NormalizedRosterRow[],
  theme: StructuralTheme,
): UnsupportedDraftReason | undefined {
  if (!theme.headlinePair) return "NO_HEADLINE_PAIR";
  if (typeof theme.metrics.headlineGapKRW !== "number") {
    return "NO_HEADLINE_GAP";
  }

  const lowerPaid = rows.find((row) =>
    row.rowId === theme.headlinePair?.underpaidRowId
  );
  const higherPaid = rows.find((row) =>
    row.rowId === theme.headlinePair?.comparatorRowId
  );
  if (
    lowerPaid?.relevantExperienceMonths === undefined
    || higherPaid?.relevantExperienceMonths === undefined
  ) {
    return "MISSING_HEADLINE_RELEVANT_EXPERIENCE";
  }
  if (lowerPaid?.tenureMonths === undefined || higherPaid?.tenureMonths === undefined) {
    return "MISSING_HEADLINE_TENURE";
  }

  return undefined;
}
