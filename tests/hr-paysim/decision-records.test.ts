import assert from "node:assert/strict";
import test from "node:test";
import { createDecisionRecord } from "../../src/lib/hr-paysim/decisions/decisionRecords.ts";

const validThemeIds = new Set(["theme-platform", "theme-product"]);
const decision = {
  id: "decision-hiring-rule",
  themeIds: ["theme-product", "theme-platform", "theme-product"],
  actionKey: "define_hiring_additional_pay",
  ownerRole: "CEO_AND_HR",
  dueEvent: "BEFORE_NEXT_OFFER",
  status: "approved",
};

test("creates a canonical enum-backed decision with owner and due event", () => {
  assert.deepEqual(createDecisionRecord(decision, validThemeIds), {
    status: "ready",
    decision: {
      id: "decision-hiring-rule",
      themeIds: ["theme-platform", "theme-product"],
      actionKey: "define_hiring_additional_pay",
      ownerRole: "CEO_AND_HR",
      dueEvent: "BEFORE_NEXT_OFFER",
      status: "approved",
    },
  });
});

test("rejects missing, malformed, empty, and stale decision references fail-closed", () => {
  const invalidInputs = [
    { ...decision, id: "" },
    { ...decision, themeIds: [] },
    { ...decision, themeIds: ["theme-stale"] },
    { ...decision, actionKey: "raise_everyone" },
    { ...decision, ownerRole: "FOUNDER" },
    { ...decision, dueEvent: "SOMEDAY" },
    { ...decision, status: "complete" },
    { ...decision, themeIds: "theme-product" },
    { id: decision.id },
  ];

  for (const invalidInput of invalidInputs) {
    assert.equal(createDecisionRecord(invalidInput, validThemeIds).status, "invalid_decision");
  }
});

test("persists no founder free text or roster rows from hostile runtime input", () => {
  const result = createDecisionRecord({
    ...decision,
    freeText: "raise this person",
    founderApprovedSentence: "invented narrative",
    rosterRows: [{ rowId: "row_private", baseSalaryKRW: 123_000_000 }],
  }, validThemeIds);
  const serialized = JSON.stringify(result);

  assert.equal(result.status, "ready");
  assert.equal(serialized.includes("freeText"), false);
  assert.equal(serialized.includes("founderApprovedSentence"), false);
  assert.equal(serialized.includes("rosterRows"), false);
  assert.equal(serialized.includes("row_private"), false);
});
