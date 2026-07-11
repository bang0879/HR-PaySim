import type { StructuralTheme } from "./types.ts";

const MAX_REVIEW_SUBJECTS = 3;

export interface ReviewSubjectSelection {
  selected: StructuralTheme[];
  unselected: StructuralTheme[];
  recommendedIds: string[];
  wasOverridden: boolean;
}

export function recommendReviewSubjectOrder(themes: StructuralTheme[]): StructuralTheme[] {
  return [...themes].sort(compareReviewSubjects);
}

export function selectReviewSubjects(
  themes: StructuralTheme[],
  overrideIds?: string[],
): ReviewSubjectSelection {
  const recommended = recommendReviewSubjectOrder(themes);
  const recommendedIds = recommended.slice(0, MAX_REVIEW_SUBJECTS).map((theme) => theme.id);
  const themesById = new Map(themes.map((theme) => [theme.id, theme]));
  const overrideSelection = unique(overrideIds ?? [])
    .flatMap((id) => {
      const theme = themesById.get(id);
      return theme ? [theme] : [];
    })
    .slice(0, MAX_REVIEW_SUBJECTS);
  const wasOverridden = overrideSelection.length > 0;
  const selected = wasOverridden
    ? overrideSelection
    : recommended.slice(0, MAX_REVIEW_SUBJECTS);
  const selectedIds = new Set(selected.map((theme) => theme.id));

  return {
    selected,
    unselected: recommended.filter((theme) => !selectedIds.has(theme.id)),
    recommendedIds,
    wasOverridden,
  };
}

function compareReviewSubjects(a: StructuralTheme, b: StructuralTheme): number {
  return compareRank(a.dataStatus, b.dataStatus, ["sufficient", "partial"])
    || compareRank(a.patternKind, b.patternKind, ["systematic", "isolated"])
    || b.normalizedHeadlineGap - a.normalizedHeadlineGap
    || b.comparisonPairs.length - a.comparisonPairs.length
    || compareCodeUnits(a.roleGroup, b.roleGroup)
    || compareCodeUnits(a.id, b.id);
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareRank<T extends string>(a: T, b: T, order: readonly T[]): number {
  return order.indexOf(a) - order.indexOf(b);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
