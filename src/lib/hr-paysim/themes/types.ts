import type {
  StructuralFindingPair,
  StructuralFindingType,
} from "../domain.ts";
import type { FindingMetricSet } from "../metrics/types.ts";

export type ThemeArchetype =
  | "emergent_structure"
  | "cohort_precedent"
  | "level_integrity"
  | "isolated_relationship";

export type ThemeDataStatus = "sufficient" | "partial";
export type ThemePatternKind = "systematic" | "isolated";

export interface SupportingObservation {
  sourceType: StructuralFindingType;
  plainLanguageKey: "two_salary_groups" | "recent_hire_gap_repeats" | "level_order_conflict";
  affectedRowIds: string[];
}

export interface StructuralTheme {
  id: string;
  roleGroup: string;
  archetype: ThemeArchetype;
  dataStatus: ThemeDataStatus;
  patternKind: ThemePatternKind;
  findingIds: string[];
  headlinePair?: StructuralFindingPair;
  comparisonPairs: StructuralFindingPair[];
  affectedRowIds: string[];
  supportingObservations: SupportingObservation[];
  metrics: FindingMetricSet;
  normalizedHeadlineGap: number;
}
