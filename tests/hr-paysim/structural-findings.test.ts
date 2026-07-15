import assert from "node:assert/strict";
import test from "node:test";
import { sampleRosterRows } from "../../src/lib/hr-paysim/rosterFixtures.ts";
import { detectStructuralFindings } from "../../src/lib/hr-paysim/structuralFindings.ts";
import type { StructuralFinding, StructuralFindingType } from "../../src/lib/hr-paysim/domain.ts";
import {
  completeGradeMultiRoleRows,
  noGradeMultiRoleRows,
} from "./fixtures/multi-role-roster.ts";

function findByRoleAndType(
  findings: StructuralFinding[],
  roleGroup: string,
  type: StructuralFindingType,
): StructuralFinding {
  const finding = findings.find((item) => item.roleGroup === roleGroup && item.type === type);
  assert.ok(finding, `Expected ${roleGroup} ${type} finding`);
  return finding;
}

test("detectStructuralFindings finds the Product Engineer shadow band without a correction floor", () => {
  const findings = detectStructuralFindings(sampleRosterRows);
  const finding = findByRoleAndType(findings, "Product Engineer", "shadow_band");

  assert.deepEqual(finding.affectedRowIds, [
    "row_001",
    "row_002",
    "row_003",
    "row_004",
    "row_005",
    "row_006",
  ]);
  assert.deepEqual(
    finding.bandClusters?.map((cluster) => [cluster.minSalaryKRW, cluster.maxSalaryKRW]),
    [
      [68000000, 76000000],
      [88000000, 95000000],
    ],
  );
  assert.equal(finding.clusterGapKRW, 12000000);
  assert.equal(finding.metrics.headlineGapKRW, 12000000);
  assert.equal(finding.metrics.pairRepairFloorKRW, undefined);
  assert.equal(finding.metrics.systemRepairFloorKRW, undefined);
  assert.equal(finding.riskModel.exposurePayrollKRW, 489000000);
  assert.equal(finding.riskModel.correctionFloorKRW, undefined);
  assert.equal(finding.riskModel.communicationRisk, "high");
  assert.equal(finding.confidence, "medium");
});

test("detectStructuralFindings uses the Product Engineer headline pair for pay inversion", () => {
  const findings = detectStructuralFindings(sampleRosterRows);
  const finding = findByRoleAndType(findings, "Product Engineer", "pay_inversion");

  assert.deepEqual(finding.affectedRowIds, [
    "row_001",
    "row_002",
    "row_003",
    "row_004",
    "row_005",
    "row_006",
  ]);
  assert.equal(finding.headlinePair?.underpaidRowId, "row_001");
  assert.equal(finding.headlinePair?.comparatorRowId, "row_004");
  assert.equal(finding.headlinePair?.salaryGapKRW, 27000000);
  assert.equal(roundPercent(finding.headlinePair?.gapPercentage), 0.397);
  assert.equal(finding.metrics.headlineGapKRW, 27000000);
  assert.equal(finding.metrics.pairRepairFloorKRW, 27000000);
  assert.equal(finding.metrics.systemRepairFloorKRW, undefined);
  assert.equal(finding.riskModel.correctionFloorKRW, 27000000);
  assert.equal(finding.additionalUnderpaidRowCount, 2);
});

test("detectStructuralFindings keeps Platform shadow band present but leads the sample with loyalty tax data", () => {
  const findings = detectStructuralFindings(sampleRosterRows);
  const platformTypes = findings
    .filter((finding) => finding.roleGroup === "Platform Engineer")
    .map((finding) => finding.type)
    .sort();

  assert.ok(platformTypes.includes("loyalty_tax"));
  assert.ok(platformTypes.includes("shadow_band"));

  const loyaltyTax = findByRoleAndType(findings, "Platform Engineer", "loyalty_tax");
  assert.equal(loyaltyTax.headlinePair?.underpaidRowId, "row_008");
  assert.equal(loyaltyTax.headlinePair?.comparatorRowId, "row_009");
  assert.equal(loyaltyTax.headlinePair?.salaryGapKRW, 18000000);
  assert.equal(roundPercent(loyaltyTax.headlinePair?.gapPercentage), 0.214);
  assert.equal(loyaltyTax.metrics.headlineGapKRW, 18000000);
  assert.equal(loyaltyTax.metrics.pairRepairFloorKRW, 18000000);
  assert.equal(loyaltyTax.metrics.systemRepairFloorKRW, undefined);
  assert.equal(loyaltyTax.riskModel.correctionFloorKRW, 18000000);
  assert.equal(loyaltyTax.riskModel.exposurePayrollKRW, 370000000);
  assert.equal(loyaltyTax.additionalUnderpaidRowCount, 1);

  const shadowBand = findByRoleAndType(findings, "Platform Engineer", "shadow_band");
  assert.deepEqual(
    shadowBand.bandClusters?.map((cluster) => [cluster.minSalaryKRW, cluster.maxSalaryKRW]),
    [
      [84000000, 86000000],
      [98000000, 102000000],
    ],
  );
  assert.equal(shadowBand.clusterGapKRW, 12000000);
  assert.equal(shadowBand.metrics.headlineGapKRW, 12000000);
  assert.equal(shadowBand.metrics.pairRepairFloorKRW, undefined);
  assert.equal(shadowBand.metrics.systemRepairFloorKRW, undefined);
  assert.equal(shadowBand.riskModel.correctionFloorKRW, undefined);
});

test("detectStructuralFindings uses ordinal restoration for GTM level fiction", () => {
  const findings = detectStructuralFindings(sampleRosterRows);
  const finding = findByRoleAndType(findings, "GTM", "level_fiction_band_overlap");

  assert.deepEqual(finding.affectedRowIds, ["row_012", "row_013", "row_014"]);
  assert.equal(finding.metrics.headlineGapKRW, 4000000);
  assert.equal(finding.metrics.pairRepairFloorKRW, 4000000);
  assert.equal(finding.metrics.systemRepairFloorKRW, 5000000);
  assert.equal(finding.riskModel.correctionFloorKRW, 5000000);
  assert.deepEqual(
    finding.comparisonPairs.map((pair) => [pair.underpaidRowId, pair.comparatorRowId, pair.salaryGapKRW]),
    [
      ["row_012", "row_013", 4000000],
      ["row_014", "row_013", 1000000],
    ],
  );
});

test("complete grade evidence activates and suppresses the locked finding pairs", () => {
  const summarize = (rows: typeof completeGradeMultiRoleRows) =>
    detectStructuralFindings(rows).map((finding) => ({
      type: finding.type,
      pairs: finding.comparisonPairs.map((pair) => [
        pair.underpaidRowId,
        pair.comparatorRowId,
        pair.salaryGapKRW,
      ]),
    }));

  assert.deepEqual(summarize(completeGradeMultiRoleRows), [
    {
      type: "pay_inversion",
      pairs: [
        ["be-a", "be-c", 25_000_000],
        ["be-d", "be-c", 15_000_000],
        ["be-b", "be-c", 10_000_000],
      ],
    },
    {
      type: "level_fiction_band_overlap",
      pairs: [
        ["be-b", "be-c", 10_000_000],
        ["be-d", "be-c", 15_000_000],
      ],
    },
  ]);
  assert.deepEqual(summarize(noGradeMultiRoleRows), [
    {
      type: "pay_inversion",
      pairs: [
        ["be-a", "be-c", 25_000_000],
        ["be-a", "be-b", 15_000_000],
        ["be-d", "be-c", 15_000_000],
        ["be-a", "be-d", 10_000_000],
        ["be-b", "be-c", 10_000_000],
      ],
    },
    {
      type: "loyalty_tax",
      pairs: [
        ["be-a", "be-c", 25_000_000],
        ["be-a", "be-b", 15_000_000],
        ["be-d", "be-c", 15_000_000],
      ],
    },
  ]);
});

test("detectStructuralFindings leaves the Designer sample group clean below materiality", () => {
  const findings = detectStructuralFindings(sampleRosterRows);
  assert.equal(findings.some((finding) => finding.roleGroup === "Designer"), false);
});

function roundPercent(value: number | undefined): number {
  if (value === undefined) {
    throw new Error("Expected gapPercentage to be defined");
  }

  return Math.round(value * 1000) / 1000;
}


