import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateDiagnosis,
  compareScenarios,
  deriveBaselineScenario,
} from "../../src/lib/hr-paysim/calculations.ts";
import { recommendScenarios } from "../../src/lib/hr-paysim/recommendations.ts";
import type { QuickInputDraft } from "../../src/lib/hr-paysim/domain.ts";

const healthyInput: QuickInputDraft = {
  employeeCount: 120,
  plannedHires: 5,
  basePayrollAnnual: 7200000000,
  variablePayAnnual: 800000000,
  benefitsAnnual: 600000000,
  exceptionRaiseCount: 1,
  inversionCaseCount: 0,
  salaryBandExists: true,
  currentAiToolingLevel: "unanswered",
};

const riskyInput: QuickInputDraft = {
  employeeCount: 120,
  plannedHires: 36,
  basePayrollAnnual: 7200000000,
  variablePayAnnual: 800000000,
  benefitsAnnual: 600000000,
  exceptionRaiseCount: 18,
  inversionCaseCount: 14,
  salaryBandExists: false,
  currentAiToolingLevel: "medium",
};

test("calculateDiagnosis scores healthy inputs as manageable", () => {
  const result = calculateDiagnosis(healthyInput);
  assert.equal(result.ceiBand, "healthy");
  assert.equal(result.cedBand, "low");
  assert.equal(result.payInversionSeverity, "none");
});

test("calculateDiagnosis identifies compensation governance risk", () => {
  const result = calculateDiagnosis(riskyInput);
  assert.equal(result.ceiBand, "risk");
  assert.equal(result.cedBand, "high");
  assert.equal(result.payInversionSeverity, "high");
  assert.ok(result.payrollIncreaseRate > 0.2);
});

test("recommendScenarios returns current state as primary when signals are healthy", () => {
  const diagnosis = calculateDiagnosis(healthyInput);
  const recommendations = recommendScenarios(healthyInput, diagnosis);
  assert.equal(recommendations[0]?.scenarioId, "baseline_current_state");
  assert.equal(recommendations[0]?.priority, "primary");
});

test("recommendScenarios includes baseline even when unhealthy", () => {
  const diagnosis = calculateDiagnosis(riskyInput);
  const recommendations = recommendScenarios(riskyInput, diagnosis);
  assert.ok(recommendations.some((item) => item.scenarioId === "baseline_current_state"));
  assert.ok(recommendations.some((item) => item.scenarioId === "resolve_pay_inversion"));
  assert.ok(recommendations.some((item) => item.scenarioId === "redesign_salary_bands"));
});

test("deriveBaselineScenario is derived from current input", () => {
  const first = deriveBaselineScenario(healthyInput);
  const second = deriveBaselineScenario({ ...healthyInput, plannedHires: 20 });
  assert.notEqual(first.annualCostImpact, second.annualCostImpact);
});

test("compareScenarios does not choose cheapest as best fit automatically", () => {
  const comparison = compareScenarios(riskyInput, [
    "baseline_current_state",
    "redesign_salary_bands",
  ]);
  assert.equal(comparison.bestFitScenarioId, "redesign_salary_bands");
});
