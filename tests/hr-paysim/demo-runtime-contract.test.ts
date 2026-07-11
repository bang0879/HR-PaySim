import assert from "node:assert/strict";
import test from "node:test";
import {
  createSyntheticDemoSession,
  DECISION_ROOM_DEMO_CONTRACT,
} from "../../src/lib/hr-paysim/contracts/demoContract.ts";

test("synthetic demo uses the exact visible sample label and fixed review roles", () => {
  const session = createSyntheticDemoSession();
  assert.equal(DECISION_ROOM_DEMO_CONTRACT.sampleLabel, "샘플로 입력한 내용");
  assert.deepEqual(
    session.selection.selected.map((theme) => theme.roleGroup),
    ["Product Engineer", "Platform Engineer", "GTM"],
  );
});

test("Product demo preserves observed precedent facts without inventing repeatability", () => {
  const session = createSyntheticDemoSession();
  const product = session.selection.selected.find((theme) => theme.roleGroup === "Product Engineer");
  assert.ok(product);
  const review = session.reviews[product.id];
  const repeat = session.repeats[product.id];
  assert.ok(review);
  assert.ok(repeat);

  assert.equal(review.repeatabilityStatus, "unanswered");
  assert.equal(repeat.syntheticRow.roleGroup, "Product Engineer");
  assert.equal(repeat.syntheticRow.baseSalaryKRW, 95_000_000);
  assert.equal(repeat.currentRosterPairCount, 10);
  assert.equal(repeat.baselineCandidatePairCount, 3);
  assert.equal(repeat.repeatedCandidatePairCount, 3);
  assert.equal(repeat.combinedPairCount, 13);
  assert.equal(repeat.maximumGapKRW, 27_000_000);
  assert.equal(repeat.nonClaimKey, "observed_precedent_not_policy");
  assert.equal(session.decisions.length, 1);
});

test("Platform Engineer and GTM remain entirely unprefilled", () => {
  const session = createSyntheticDemoSession();
  for (const roleGroup of ["Platform Engineer", "GTM"]) {
    const theme = session.selection.selected.find((item) => item.roleGroup === roleGroup);
    assert.ok(theme);
    assert.equal(session.reviews[theme.id], undefined);
    assert.equal(session.interpretations[theme.id], undefined);
    assert.equal(session.repeats[theme.id], undefined);
    assert.equal(session.decisions.some((decision) => decision.themeIds.includes(theme.id)), false);
  }
});
