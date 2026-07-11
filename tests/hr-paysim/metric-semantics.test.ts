import assert from "node:assert/strict";
import test from "node:test";
import type { NormalizedRosterRow, StructuralFindingPair } from "../../src/lib/hr-paysim/domain.ts";
import {
  calculateMinimumOrdinalRestoration,
  calculatePairRepairFloor,
  isMaterialLevelOrderViolation,
} from "../../src/lib/hr-paysim/metrics/compensationMetrics.ts";
import { sampleRosterRows } from "../../src/lib/hr-paysim/rosterFixtures.ts";
import { DECISION_ROOM_EXPECTED } from "./fixtures/decision-room-expected.ts";

test("GTM restoration separates the headline, pair, and system repair amounts", () => {
  const gtmRows = sampleRosterRows.filter((row) => row.roleGroup === "GTM");
  const result = calculateMinimumOrdinalRestoration(gtmRows);

  assert.equal(result.headlineGapKRW, DECISION_ROOM_EXPECTED.gtm.headlineGapKRW);
  assert.equal(result.pairRepairFloorKRW, DECISION_ROOM_EXPECTED.gtm.pairRepairFloorKRW);
  assert.equal(result.systemRepairFloorKRW, DECISION_ROOM_EXPECTED.gtm.systemRepairFloorKRW);
  assert.deepEqual(
    result.adjustments.map(({ rowId, adjustmentKRW }) => ({ rowId, adjustmentKRW })),
    DECISION_ROOM_EXPECTED.gtm.adjustments,
  );
  assert.deepEqual(result.adjustments, [
    { rowId: "row_012", fromSalaryKRW: 66_000_000, toSalaryKRW: 70_000_000, adjustmentKRW: 4_000_000 },
    { rowId: "row_014", fromSalaryKRW: 69_000_000, toSalaryKRW: 70_000_000, adjustmentKRW: 1_000_000 },
  ]);
});

test("equal salaries across adjacent ranks require no restoration", () => {
  const rows = [rosterRow("lower", 1, 70_000_000), rosterRow("higher", 2, 70_000_000)];

  assert.deepEqual(calculateMinimumOrdinalRestoration(rows), {
    headlineGapKRW: 0,
    pairRepairFloorKRW: 0,
    systemRepairFloorKRW: 0,
    adjustments: [],
  });
});

test("restoration targets the maximum lower-rank salary and adjusts each higher-rank row once", () => {
  const rows = [
    rosterRow("lower_max", 1, 80_000_000),
    rosterRow("lower_other", 1, 75_000_000),
    rosterRow("higher", 2, 70_000_000),
  ];
  const result = calculateMinimumOrdinalRestoration(rows);

  assert.equal(result.systemRepairFloorKRW, 10_000_000);
  assert.deepEqual(result.adjustments, [
    { rowId: "higher", fromSalaryKRW: 70_000_000, toSalaryKRW: 80_000_000, adjustmentKRW: 10_000_000 },
  ]);
});

test("level-order materiality uses either the absolute or percentage threshold", () => {
  const gtmRows = sampleRosterRows.filter((row) => row.roleGroup === "GTM");
  const row012Pair = pair("row_012", "row_013", 4_000_000);
  const row014Pair = pair("row_014", "row_013", 1_000_000);

  assert.equal(calculatePairRepairFloor(row012Pair), 4_000_000);
  assert.equal(isMaterialLevelOrderViolation(row012Pair, gtmRows), true);
  assert.equal(isMaterialLevelOrderViolation(row014Pair, gtmRows), false);
});

function rosterRow(rowId: string, levelRank: number, baseSalaryKRW: number): NormalizedRosterRow {
  return { rowId, roleGroup: "Test Role", levelLabel: `L${levelRank}`, levelRank, baseSalaryKRW };
}

function pair(underpaidRowId: string, comparatorRowId: string, salaryGapKRW: number): StructuralFindingPair {
  return { underpaidRowId, comparatorRowId, salaryGapKRW, reasonThisIsHardToDefend: "test pair" };
}
