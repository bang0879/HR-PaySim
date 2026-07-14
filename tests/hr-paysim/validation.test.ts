import assert from "node:assert/strict";
import test from "node:test";
import { containsPiiLikeText, validateQuickInput } from "../../src/lib/hr-paysim/validation.ts";

const validInput = {
  employeeCount: 120,
  plannedHires: 12,
  basePayrollAnnual: 7200000000,
  variablePayAnnual: 800000000,
  benefitsAnnual: 600000000,
  exceptionRaiseCount: 2,
  inversionCaseCount: 1,
  salaryBandExists: true,
  currentAiToolingLevel: "unanswered" as const,
};

test("validateQuickInput accepts aggregate values", () => {
  assert.deepEqual(validateQuickInput(validInput), []);
});

test("validateQuickInput rejects negative numbers in plain Korean", () => {
  const errors = validateQuickInput({ ...validInput, plannedHires: -1 });
  assert.ok(errors.some((error) => error.includes("음수")));
});

test("validateQuickInput distinguishes unanswered AI from explicit none", () => {
  assert.deepEqual(validateQuickInput({ ...validInput, currentAiToolingLevel: "unanswered" }), []);
  assert.deepEqual(validateQuickInput({ ...validInput, currentAiToolingLevel: "none" }), []);
});

test("containsPiiLikeText blocks obvious personal data", () => {
  assert.equal(containsPiiLikeText("대표 연락처 010-1234-5678"), true);
  assert.equal(containsPiiLikeText("person@example.com"), true);
  assert.equal(containsPiiLikeText("집계 수준 메모"), false);
});
