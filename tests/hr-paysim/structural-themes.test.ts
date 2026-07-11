import assert from "node:assert/strict";
import test from "node:test";
import type {
  NormalizedRosterRow,
  StructuralFinding,
  StructuralFindingPair,
} from "../../src/lib/hr-paysim/domain.ts";
import { sampleRosterRows } from "../../src/lib/hr-paysim/rosterFixtures.ts";
import { detectStructuralFindings } from "../../src/lib/hr-paysim/structuralFindings.ts";
import { buildStructuralThemes } from "../../src/lib/hr-paysim/themes/buildStructuralThemes.ts";

test("subsumes the seven sample findings into three founder-reviewable themes", () => {
  const findings = detectStructuralFindings(sampleRosterRows);
  const themes = buildStructuralThemes(sampleRosterRows, findings);

  assert.equal(findings.length, 7);
  assert.equal(themes.length, 3);

  const product = themes.find((theme) => theme.roleGroup === "Product Engineer");
  assert.ok(product);
  assert.deepEqual(product.findingIds, [
    "product_engineer_shadow_band",
    "product_engineer_pay_inversion",
    "product_engineer_loyalty_tax",
  ]);
  assert.deepEqual(
    [product.headlinePair?.underpaidRowId, product.headlinePair?.comparatorRowId],
    ["row_001", "row_004"],
  );
  assert.deepEqual(
    product.supportingObservations.map((observation) => observation.plainLanguageKey),
    ["two_salary_groups", "recent_hire_gap_repeats"],
  );

  const platform = themes.find((theme) => theme.roleGroup === "Platform Engineer");
  assert.ok(platform);
  assert.deepEqual(platform.findingIds, [
    "platform_engineer_shadow_band",
    "platform_engineer_pay_inversion",
    "platform_engineer_loyalty_tax",
  ]);
  assert.deepEqual(
    [platform.headlinePair?.underpaidRowId, platform.headlinePair?.comparatorRowId],
    ["row_008", "row_009"],
  );

  const gtm = themes.find((theme) => theme.roleGroup === "GTM");
  assert.ok(gtm);
  assert.equal(gtm.archetype, "level_integrity");
  assert.deepEqual(gtm.findingIds, ["gtm_level_fiction_band_overlap"]);
  assert.deepEqual(
    gtm.supportingObservations.map((observation) => observation.plainLanguageKey),
    ["level_order_conflict"],
  );

  assert.equal(themes.some((theme) => theme.roleGroup === "Designer"), false);
  assert.equal(countDuplicateHeadlinePairs(themes), 0);
});

test("is deterministic when finding input order is reversed", () => {
  const findings = detectStructuralFindings(sampleRosterRows);

  assert.deepEqual(
    buildStructuralThemes(sampleRosterRows, [...findings].reverse()),
    buildStructuralThemes(sampleRosterRows, findings),
  );
});

test("keeps disconnected relationship graphs as separate themes", () => {
  const rows = [
    rosterRow("row_a", 60_000_000),
    rosterRow("row_b", 70_000_000),
    rosterRow("row_c", 80_000_000),
    rosterRow("row_d", 90_000_000),
  ];
  const finding = relationshipFinding("ops_pay_inversion", [
    pair("row_a", "row_b", 10_000_000),
    pair("row_c", "row_d", 10_000_000),
  ]);

  const themes = buildStructuralThemes(rows, [finding]);

  assert.equal(themes.length, 2);
  assert.deepEqual(
    themes.map((theme) => theme.affectedRowIds),
    [["row_a", "row_b"], ["row_c", "row_d"]],
  );
  assert.ok(themes.every((theme) => theme.archetype === "isolated_relationship"));
});

test("keeps disconnected level-order graphs as separate level-integrity themes", () => {
  const rows = [
    rankedRosterRow("row_a", 2, 60_000_000),
    rankedRosterRow("row_b", 1, 70_000_000),
    rankedRosterRow("row_c", 3, 80_000_000),
    rankedRosterRow("row_d", 2, 90_000_000),
  ];
  const finding = levelFinding([
    pair("row_a", "row_b", 10_000_000),
    pair("row_c", "row_d", 10_000_000),
  ]);

  const themes = buildStructuralThemes(rows, [finding]);

  assert.equal(themes.length, 2);
  assert.deepEqual(
    themes.map((theme) => theme.affectedRowIds),
    [["row_a", "row_b"], ["row_c", "row_d"]],
  );
  assert.deepEqual(
    themes.map((theme) => theme.comparisonPairs.map(pairKey)),
    [["row_a->row_b"], ["row_c->row_d"]],
  );
  assert.deepEqual(
    themes.map((theme) => [
      theme.metrics.headlineGapKRW,
      theme.metrics.pairRepairFloorKRW,
      theme.metrics.systemRepairFloorKRW,
    ]),
    [[10_000_000, 10_000_000, 10_000_000], [10_000_000, 10_000_000, 10_000_000]],
  );
  assert.equal(new Set(themes.map((theme) => theme.id)).size, 2);
  assert.ok(themes.every((theme) => theme.archetype === "level_integrity"));
});

function rosterRow(rowId: string, baseSalaryKRW: number): NormalizedRosterRow {
  return { rowId, roleGroup: "Ops", levelLabel: "none", baseSalaryKRW, tenureMonths: 24 };
}

function rankedRosterRow(rowId: string, levelRank: number, baseSalaryKRW: number): NormalizedRosterRow {
  return { rowId, roleGroup: "Ops", levelLabel: `L${levelRank}`, levelRank, baseSalaryKRW };
}

function pair(
  underpaidRowId: string,
  comparatorRowId: string,
  salaryGapKRW: number,
): StructuralFindingPair {
  return {
    underpaidRowId,
    comparatorRowId,
    salaryGapKRW,
    gapPercentage: salaryGapKRW / 60_000_000,
    reasonThisIsHardToDefend: "test relationship",
  };
}

function relationshipFinding(id: string, comparisonPairs: StructuralFindingPair[]): StructuralFinding {
  const headlinePair = comparisonPairs[0]!;
  return {
    id,
    type: "pay_inversion",
    roleGroup: "Ops",
    title: "test",
    defensibilityQuestion: "test",
    relationshipSummary: "test",
    affectedRowIds: comparisonPairs.flatMap((item) => [item.underpaidRowId, item.comparatorRowId]),
    headlinePair,
    comparisonPairs,
    evidence: [],
    metrics: {
      headlineGapKRW: headlinePair.salaryGapKRW,
      pairRepairFloorKRW: headlinePair.salaryGapKRW,
      roleGroupPayrollContextKRW: 300_000_000,
      nonClaim: "test",
    },
    riskModel: {
      communicationRisk: "medium",
      spreadRisk: "medium",
      decisionUrgency: "medium",
      nonClaim: "test",
    },
    confidence: "medium",
    explanationText: "test",
  };
}

function levelFinding(comparisonPairs: StructuralFindingPair[]): StructuralFinding {
  return {
    id: "ops_level_fiction_band_overlap",
    type: "level_fiction_band_overlap",
    roleGroup: "Ops",
    title: "test",
    defensibilityQuestion: "test",
    relationshipSummary: "test",
    affectedRowIds: comparisonPairs.flatMap((item) => [item.underpaidRowId, item.comparatorRowId]),
    comparisonPairs,
    evidence: [],
    metrics: {
      headlineGapKRW: 10_000_000,
      pairRepairFloorKRW: 10_000_000,
      systemRepairFloorKRW: 20_000_000,
      roleGroupPayrollContextKRW: 300_000_000,
      nonClaim: "test",
    },
    riskModel: {
      communicationRisk: "medium",
      spreadRisk: "medium",
      decisionUrgency: "medium",
      nonClaim: "test",
    },
    confidence: "medium",
    explanationText: "test",
  };
}

function countDuplicateHeadlinePairs(
  themes: ReturnType<typeof buildStructuralThemes>,
): number {
  const keys = themes
    .flatMap((theme) => theme.headlinePair ? [pairKey(theme.headlinePair)] : []);
  return keys.length - new Set(keys).size;
}

function pairKey(item: StructuralFindingPair): string {
  return `${item.underpaidRowId}->${item.comparatorRowId}`;
}
