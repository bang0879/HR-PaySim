import type { NormalizedRosterRow } from "../domain.ts";
import { detectStructuralFindings } from "../structuralFindings.ts";
import { buildStructuralThemes } from "../themes/buildStructuralThemes.ts";
import { selectReviewSubjects } from "../themes/selectReviewSubjects.ts";
import type { ProductEngineerSessionDraft } from "./types.ts";

export type ProductEngineerSessionDraftResult =
  | { supported: true; draft: ProductEngineerSessionDraft }
  | {
    supported: false;
    reason: "NO_HEADLINE_PAIR" | "NO_HEADLINE_GAP" | "MISSING_HEADLINE_TENURE";
  };

export function createProductEngineerSessionDraft(
  inputRows: NormalizedRosterRow[],
): ProductEngineerSessionDraftResult {
  const rows = inputRows.map((row) => ({ ...row }));
  const themes = buildStructuralThemes(rows, detectStructuralFindings(rows));
  const allSelection = selectReviewSubjects(themes);
  const productTheme = allSelection.selected.find((theme) => theme.roleGroup === "Product Engineer");

  if (!productTheme?.headlinePair) return { supported: false, reason: "NO_HEADLINE_PAIR" };
  if (typeof productTheme.metrics.headlineGapKRW !== "number") {
    return { supported: false, reason: "NO_HEADLINE_GAP" };
  }

  const lowerPaid = rows.find((row) => row.rowId === productTheme.headlinePair?.underpaidRowId);
  const higherPaid = rows.find((row) => row.rowId === productTheme.headlinePair?.comparatorRowId);
  if (lowerPaid?.tenureMonths === undefined || higherPaid?.tenureMonths === undefined) {
    return { supported: false, reason: "MISSING_HEADLINE_TENURE" };
  }

  const selection = {
    selected: [productTheme],
    unselected: themes.filter((theme) => theme.id !== productTheme.id),
    recommendedIds: [productTheme.id],
    wasOverridden: allSelection.wasOverridden,
  };
  return {
    supported: true,
    draft: {
      rows,
      themes,
      selection,
      activeThemeId: productTheme.id,
    },
  };
}
