import assert from "node:assert/strict";
import test from "node:test";
import type { StructuralTheme } from "../../src/lib/hr-paysim/themes/types.ts";
import { buildStructuralThemes } from "../../src/lib/hr-paysim/themes/buildStructuralThemes.ts";
import { sampleRosterRows } from "../../src/lib/hr-paysim/rosterFixtures.ts";
import { detectStructuralFindings } from "../../src/lib/hr-paysim/structuralFindings.ts";
import {
  recommendReviewSubjectOrder,
  selectReviewSubjects,
} from "../../src/lib/hr-paysim/themes/selectReviewSubjects.ts";

test("selects the three sample subjects in Product, Platform, then GTM order", () => {
  const themes = buildStructuralThemes(
    sampleRosterRows,
    detectStructuralFindings(sampleRosterRows),
  );

  const selection = selectReviewSubjects(themes);

  assert.deepEqual(
    selection.selected.map((theme) => theme.roleGroup),
    ["Product Engineer", "Platform Engineer", "GTM"],
  );
  assert.deepEqual(selection.recommendedIds, selection.selected.map((theme) => theme.id));
  assert.deepEqual(selection.unselected, []);
  assert.equal(selection.wasOverridden, false);
});

test("orders by the frozen tuple and caps recommendations at three", () => {
  const themes = [
    theme("partial-systematic", "A", "partial", "systematic", 0.9, 4),
    theme("sufficient-isolated", "A", "sufficient", "isolated", 0.9, 4),
    theme("sufficient-systematic-low", "A", "sufficient", "systematic", 0.1, 4),
    theme("sufficient-systematic-one-pair", "Z", "sufficient", "systematic", 0.2, 1),
    theme("sufficient-systematic-two-pairs-z", "Z", "sufficient", "systematic", 0.2, 2),
    theme("sufficient-systematic-two-pairs-a2", "A", "sufficient", "systematic", 0.2, 2),
    theme("sufficient-systematic-two-pairs-a1", "A", "sufficient", "systematic", 0.2, 2),
  ];

  const recommended = recommendReviewSubjectOrder(themes);
  const selection = selectReviewSubjects(themes);

  assert.deepEqual(recommended.map((item) => item.id), [
    "sufficient-systematic-two-pairs-a1",
    "sufficient-systematic-two-pairs-a2",
    "sufficient-systematic-two-pairs-z",
    "sufficient-systematic-one-pair",
    "sufficient-systematic-low",
    "sufficient-isolated",
    "partial-systematic",
  ]);
  assert.deepEqual(selection.recommendedIds, recommended.slice(0, 3).map((item) => item.id));
  assert.deepEqual(selection.selected, recommended.slice(0, 3));
  assert.deepEqual(selection.unselected, recommended.slice(3));
});

test("keeps valid facilitator overrides in override order and retains unselected themes", () => {
  const themes = [
    theme("recommended-first", "A", "sufficient", "systematic", 0.3, 2),
    theme("recommended-second", "B", "sufficient", "systematic", 0.2, 2),
    theme("override-first", "C", "partial", "isolated", 0.1, 1),
    theme("override-second", "D", "partial", "isolated", 0.1, 1),
  ];

  const selection = selectReviewSubjects(themes, [
    "override-second",
    "unknown",
    "override-first",
    "recommended-second",
    "recommended-first",
  ]);

  assert.deepEqual(selection.selected.map((item) => item.id), [
    "override-second",
    "override-first",
    "recommended-second",
  ]);
  assert.deepEqual(selection.unselected.map((item) => item.id), ["recommended-first"]);
  assert.deepEqual(selection.recommendedIds, ["recommended-first", "recommended-second", "override-first"]);
  assert.equal(selection.wasOverridden, true);
});

function theme(
  id: string,
  roleGroup: string,
  dataStatus: StructuralTheme["dataStatus"],
  patternKind: StructuralTheme["patternKind"],
  normalizedHeadlineGap: number,
  comparisonPairCount: number,
): StructuralTheme {
  return {
    id,
    roleGroup,
    archetype: patternKind === "systematic" ? "emergent_structure" : "isolated_relationship",
    dataStatus,
    patternKind,
    findingIds: [],
    comparisonPairs: Array.from({ length: comparisonPairCount }, (_, index) => ({
      underpaidRowId: `${id}-underpaid-${index}`,
      comparatorRowId: `${id}-comparator-${index}`,
      salaryGapKRW: 1,
      reasonThisIsHardToDefend: "test",
    })),
    affectedRowIds: [],
    supportingObservations: [],
    metrics: { nonClaim: "test" },
    normalizedHeadlineGap,
  };
}
