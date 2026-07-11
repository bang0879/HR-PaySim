import assert from "node:assert/strict";
import test from "node:test";
import { sampleRosterRows } from "../../src/lib/hr-paysim/rosterFixtures.ts";
import {
  findObservedPrecedentCandidates,
  selectObservedPrecedent,
} from "../../src/lib/hr-paysim/repeat/selectObservedPrecedent.ts";
import { repeatObservedPrecedent } from "../../src/lib/hr-paysim/repeat/repeatObservedPrecedent.ts";
import { DECISION_ROOM_EXPECTED } from "./fixtures/decision-room-expected.ts";

const PRODUCT_THEME_ID =
  "product_engineer_emergent_structure_row_001_row_002_row_003_row_004_row_005_row_006";

test("finds only the two observed Product Engineer premium precedents", () => {
  const candidates = findObservedPrecedentCandidates(sampleRosterRows, "Product Engineer");

  assert.deepEqual(candidates, [
    {
      sourceRowId: "row_004",
      roleGroup: "Product Engineer",
      referenceRowIds: ["row_006"],
      referenceSalaryKRW: 88_000_000,
      observedSalaryKRW: 95_000_000,
      additionalAmountKRW: 7_000_000,
    },
    {
      sourceRowId: "row_005",
      roleGroup: "Product Engineer",
      referenceRowIds: ["row_006"],
      referenceSalaryKRW: 88_000_000,
      observedSalaryKRW: 90_000_000,
      additionalAmountKRW: 2_000_000,
    },
  ]);
  assert.deepEqual(
    candidates.map((candidate) => candidate.sourceRowId),
    DECISION_ROOM_EXPECTED.productRepeat.eligible,
  );
});

test("requires an explicit precedent selection instead of choosing the highest salary", () => {
  const candidates = findObservedPrecedentCandidates(sampleRosterRows, "Product Engineer");
  const selected = selectObservedPrecedent(
    candidates,
    "row_005",
    "documented_counteroffer",
  );

  assert.equal(selected.candidate.sourceRowId, "row_005");
  assert.equal(selected.candidate.observedSalaryKRW, 90_000_000);
  assert.equal(
    Math.max(...candidates.map((candidate) => candidate.observedSalaryKRW)),
    95_000_000,
  );
});

test("repeats the selected Product Engineer precedent once with exact pair counts", () => {
  const candidates = findObservedPrecedentCandidates(sampleRosterRows, "Product Engineer");
  const selection = selectObservedPrecedent(
    candidates,
    DECISION_ROOM_EXPECTED.productRepeat.selected,
    "documented_hiring_exception",
  );

  const result = repeatObservedPrecedent(PRODUCT_THEME_ID, sampleRosterRows, selection);

  assert.equal(result.themeId, PRODUCT_THEME_ID);
  assert.deepEqual(result.syntheticRow, {
    rowId: "synthetic_repeat_row_004",
    roleGroup: "Product Engineer",
    title: "Product Engineer",
    levelLabel: "none",
    baseSalaryKRW: DECISION_ROOM_EXPECTED.productRepeat.repeatedSalaryKRW,
    tenureMonths: 0,
    exceptionFlag: true,
    counterOfferFlag: false,
  });
  assert.equal(result.currentRosterPairCount, DECISION_ROOM_EXPECTED.productRepeat.currentPairs);
  assert.equal(
    result.baselineCandidatePairCount,
    DECISION_ROOM_EXPECTED.productRepeat.baselineCandidatePairs,
  );
  assert.equal(
    result.repeatedCandidatePairCount,
    DECISION_ROOM_EXPECTED.productRepeat.repeatedCandidatePairs,
  );
  assert.equal(result.combinedPairCount, DECISION_ROOM_EXPECTED.productRepeat.combinedPairs);
  assert.equal(result.maximumGapKRW, DECISION_ROOM_EXPECTED.productRepeat.maximumGapKRW);
  assert.deepEqual(result.affectedRowIds, DECISION_ROOM_EXPECTED.productRepeat.affected);
  assert.equal(result.conclusionKey, "product_engineer_observed_hiring_repeat");
  assert.equal(result.nonClaimKey, "observed_precedent_not_policy");
});

test("fails closed when the facilitator selects an ineligible row", () => {
  const candidates = findObservedPrecedentCandidates(sampleRosterRows, "Product Engineer");

  assert.throws(
    () => selectObservedPrecedent(candidates, "row_006", "facilitator_selected_other"),
    /OBSERVED_PRECEDENT_NOT_FOUND:row_006/,
  );
});
