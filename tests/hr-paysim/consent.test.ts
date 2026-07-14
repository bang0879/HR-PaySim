import assert from "node:assert/strict";
import test from "node:test";
import { createAggregateLogPayload } from "../../src/lib/hr-paysim/consent.ts";

const aggregate = {
  employeeCount: 120,
  plannedHires: 12,
  basePayrollAnnual: 7200000000,
  variablePayAnnual: 800000000,
  benefitsAnnual: 600000000,
  exceptionRaiseCount: 2,
  inversionCaseCount: 1,
  salaryBandExists: true,
  currentAiToolingLevel: "none" as const,
};

test("createAggregateLogPayload returns null without aggregate consent", () => {
  assert.equal(createAggregateLogPayload({ consentForAggregateAnalysis: false, allowCompanyName: true }, aggregate), null);
});

test("createAggregateLogPayload excludes company name unless separately allowed", () => {
  const payload = createAggregateLogPayload(
    { consentForAggregateAnalysis: true, allowCompanyName: false, companyName: "Acme" },
    aggregate,
  );
  assert.ok(payload);
  assert.equal("companyName" in payload, false);
});

test("createAggregateLogPayload excludes sensitive employee-level fields", () => {
  const payload = createAggregateLogPayload(
    { consentForAggregateAnalysis: true, allowCompanyName: true, companyName: "Acme" },
    aggregate,
  );
  assert.ok(payload);
  const serialized = JSON.stringify(payload);
  assert.equal(/employeeName|email|phone|residentId|rawSalary|rawCsv/.test(serialized), false);
});
