import assert from "node:assert/strict";
import test from "node:test";
import { repeatFounderBoundedHiringRule } from "../../src/lib/hr-paysim/repeat/founderBoundedRuleRepeat.ts";
import type { FounderBoundedHiringRule } from "../../src/lib/hr-paysim/repeat/types.ts";

const approvedRule: FounderBoundedHiringRule = {
  themeId: "theme-product",
  roleGroup: "Product Engineer",
  trigger: "hard_to_fill_role",
  referenceSalaryKRW: 88_000_000,
  additionalAmountKRW: 7_000_000,
  maximumSalaryKRW: 93_000_000,
  approverRole: "CEO_AND_HR",
  reviewEvent: "BEFORE_NEXT_OFFER",
};

test("returns insufficient parameters instead of inventing missing rule fields", () => {
  const { maximumSalaryKRW: _missing, ...incomplete } = approvedRule;

  assert.deepEqual(repeatFounderBoundedHiringRule(incomplete), {
    status: "insufficient_parameters",
    invalidFields: ["maximumSalaryKRW"],
  });
});

test("rejects malformed runtime enum and numeric fields fail-closed", () => {
  const hostileRules = [
    { ...approvedRule, trigger: "market_pressure" },
    { ...approvedRule, approverRole: "FOUNDER" },
    { ...approvedRule, reviewEvent: "WHEN_CONVENIENT" },
    { ...approvedRule, referenceSalaryKRW: Number.NaN },
    { ...approvedRule, additionalAmountKRW: Number.POSITIVE_INFINITY },
    { ...approvedRule, additionalAmountKRW: -1 },
    { ...approvedRule, maximumSalaryKRW: -1 },
    { ...approvedRule, referenceSalaryKRW: "88000000" },
  ];

  for (const hostileRule of hostileRules) {
    assert.equal(
      repeatFounderBoundedHiringRule(hostileRule).status,
      "insufficient_parameters",
    );
  }
});

test("calculates only the founder-approved bounded salary", () => {
  const result = repeatFounderBoundedHiringRule(approvedRule);

  assert.deepEqual(result, {
    status: "ready",
    themeId: "theme-product",
    roleGroup: "Product Engineer",
    trigger: "hard_to_fill_role",
    referenceSalaryKRW: 88_000_000,
    additionalAmountKRW: 7_000_000,
    maximumSalaryKRW: 93_000_000,
    syntheticSalaryKRW: 93_000_000,
    approverRole: "CEO_AND_HR",
    reviewEvent: "BEFORE_NEXT_OFFER",
    conclusionKey: "founder_bounded_hiring_rule_repeat",
    nonClaimKey: "bounded_rule_not_salary_recommendation",
  });
});

test("zero additional amount reproduces the reference baseline", () => {
  const result = repeatFounderBoundedHiringRule({
    ...approvedRule,
    additionalAmountKRW: 0,
    maximumSalaryKRW: 100_000_000,
  });

  assert.equal(result.status, "ready");
  if (result.status === "ready") assert.equal(result.syntheticSalaryKRW, 88_000_000);
});

test("a stricter cap never raises the synthetic salary", () => {
  const permissive = repeatFounderBoundedHiringRule({
    ...approvedRule,
    maximumSalaryKRW: 100_000_000,
  });
  const strict = repeatFounderBoundedHiringRule({
    ...approvedRule,
    maximumSalaryKRW: 85_000_000,
  });

  assert.equal(permissive.status, "ready");
  assert.equal(strict.status, "ready");
  if (permissive.status === "ready" && strict.status === "ready") {
    assert.equal(permissive.syntheticSalaryKRW, 95_000_000);
    assert.equal(strict.syntheticSalaryKRW, 85_000_000);
    assert.ok(strict.syntheticSalaryKRW <= permissive.syntheticSalaryKRW);
  }
});

test("does not retain unapproved runtime fields", () => {
  const hostile = {
    ...approvedRule,
    freeText: "private founder explanation",
    rosterRows: [{ rowId: "row_private", baseSalaryKRW: 999_000_000 }],
  };

  const serialized = JSON.stringify(repeatFounderBoundedHiringRule(hostile));

  assert.equal(serialized.includes("freeText"), false);
  assert.equal(serialized.includes("rosterRows"), false);
  assert.equal(serialized.includes("row_private"), false);
});
