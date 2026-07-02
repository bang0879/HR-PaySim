import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateCED,
  calculateCEI,
  calculateOrchestratorPremiumPool,
  detectPayInversion,
  evaluateProductivityLeakageFlag,
  evaluateSalaryBandHealth,
  forecastPayrollCost,
} from "../../frontend/lib/hr-paysim/calculations/engine.ts";

const forbiddenOutputKeys = [
  "aiSubstitutionPercentage",
  "aiReplacementPercentage",
  "totalWorkCost",
  "attritionProbability",
  "productivityGainPercentage",
  "aiCostVsHumanCostRatio",
];

function assertNoForbiddenMetricKeys(value: unknown): void {
  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    assert.equal(
      forbiddenOutputKeys.includes(key),
      false,
      `Forbidden metric key returned: ${key}`,
    );
    assertNoForbiddenMetricKeys(nestedValue);
  }
}

test("CEI decreases when salary band is absent and exceptions are high", () => {
  const strong = calculateCEI({
    has_salary_band: true,
    has_level_system: true,
    has_performance_review: true,
    pay_inversion_case_count: 0,
    exception_raise_frequency: "none",
    counteroffer_frequency: "none",
    variable_pay_linked_to_performance: true,
    manager_can_explain_pay_basis: true,
  });

  const weak = calculateCEI({
    has_salary_band: false,
    has_level_system: true,
    has_performance_review: true,
    pay_inversion_case_count: 8,
    exception_raise_frequency: "frequent",
    counteroffer_frequency: "frequent",
    variable_pay_linked_to_performance: false,
    manager_can_explain_pay_basis: false,
  });

  assert.ok(strong.score > weak.score);
  assert.equal(weak.band, "Low");
  assert.ok(weak.reasons.length >= 3);
  assert.match(weak.explanationText, /설명 가능성|예외|보상/);
});

test("CED increases with counteroffers and exception raises", () => {
  const low = calculateCED({
    counteroffer_frequency: "none",
    exception_raise_frequency: "none",
    new_hire_premium_exists: false,
    pay_inversion_case_count: 0,
    out_of_band_case_count: 0,
    undocumented_negotiation_level: "none",
  });

  const high = calculateCED({
    counteroffer_frequency: "frequent",
    exception_raise_frequency: "frequent",
    new_hire_premium_exists: true,
    pay_inversion_case_count: 7,
    out_of_band_case_count: 12,
    undocumented_negotiation_level: "high",
  });

  assert.ok(high.score > low.score);
  assert.equal(low.band, "Low");
  assert.equal(high.band, "Critical");
  assert.match(high.explanationText, /예외 부채|누적/);
});

test("pay inversion detection returns higher severity when inversion count rises", () => {
  const watch = detectPayInversion({
    pay_inversion_case_count: 1,
    new_hire_premium_exists: false,
    out_of_band_case_count: 0,
  });
  const severe = detectPayInversion({
    pay_inversion_case_count: 8,
    new_hire_premium_exists: true,
    out_of_band_case_count: 4,
  });

  assert.equal(watch.caseCount, 1);
  assert.equal(watch.severity, "Watch");
  assert.equal(severe.caseCount, 8);
  assert.equal(severe.severity, "Severe");
  assert.match(severe.explanationText, /보상 역전|신규/);
});

test("salary band health flags fragile band structure", () => {
  const healthy = evaluateSalaryBandHealth({
    salaryBands: [
      { level: "L1", min: 40000000, midpoint: 50000000, max: 60000000, range_spread: 40 },
      {
        level: "L2",
        min: 52000000,
        midpoint: 65000000,
        max: 78000000,
        range_spread: 40,
        midpoint_progression: 30,
      },
    ],
    out_of_band_case_count: 0,
  });

  const fragile = evaluateSalaryBandHealth({
    salaryBands: [
      { level: "L1", min: 40000000, midpoint: 50000000, max: 100000000, range_spread: 120 },
      {
        level: "L2",
        min: 51000000,
        midpoint: 53000000,
        max: 56000000,
        range_spread: 9,
        midpoint_progression: 6,
      },
    ],
    out_of_band_case_count: 9,
  });

  assert.ok(healthy.score > fragile.score);
  assert.equal(healthy.band, "Healthy");
  assert.equal(fragile.band, "Fragile");
  assert.ok(fragile.issues.length >= 2);
});

test("payroll forecast works without runway inputs", () => {
  const result = forecastPayrollCost({
    compensationSnapshot: {
      total_monthly_base_pay: 100000000,
      total_monthly_fixed_allowance: 0,
      total_expected_variable_pay: 0,
      recent_raise_budget: 0,
    },
    hiringPlan: {
      planned_hires_6m: { L2: 1 },
      planned_hires_12m: { L2: 2 },
      average_expected_salary_by_level: { L2: 60000000 },
      hiring_freeze_toggle: false,
    },
    forecastMonths: 12,
  });

  assert.equal(result.monthlyPayrollDelta, 10000000);
  assert.equal(result.annualPayrollDelta, 120000000);
  assert.equal(result.payrollIncreaseRate, 10);
  assert.equal(Object.hasOwn(result, "optionalRunwayImpact"), false);
});

test("payroll forecast includes runway impact only when optional runway inputs exist", () => {
  const result = forecastPayrollCost({
    compensationSnapshot: {
      total_monthly_base_pay: 100000000,
      total_monthly_fixed_allowance: 0,
    },
    hiringPlan: {
      planned_hires_6m: { L2: 1 },
      planned_hires_12m: { L2: 2 },
      average_expected_salary_by_level: { L2: 60000000 },
      hiring_freeze_toggle: false,
      optional_cash_balance: 1320000000,
      optional_runway_months: 12,
    },
    forecastMonths: 12,
  });

  assert.equal(Object.hasOwn(result, "optionalRunwayImpact"), true);
  assert.equal(result.optionalRunwayImpact?.projectedRunwayMonths, 12);
  assert.equal(result.optionalRunwayImpact?.deltaMonths, 0);
});

test("orchestrator premium pool uses only user-provided allocation assumptions", () => {
  const baseInput = {
    advancedEnabled: true,
    hiringPlan: {
      planned_hires_6m: { L3: 2 },
      planned_hires_12m: { L3: 2 },
      average_expected_salary_by_level: { L3: 96000000 },
      hiring_freeze_toggle: true,
    },
    aiScenarioInputs: {
      planned_ai_tool_budget_monthly: 1000000,
      hiring_delay_months: 6,
      orchestrator_target_count: 4,
      premium_pool_allocation_rate: 25,
    },
    delayedHiresByLevel: { L3: 2 },
  };

  const base = calculateOrchestratorPremiumPool(baseInput);
  const changedToolBudget = calculateOrchestratorPremiumPool({
    ...baseInput,
    aiScenarioInputs: {
      ...baseInput.aiScenarioInputs,
      planned_ai_tool_budget_monthly: 99000000,
    },
  });

  assert.equal(base.premiumPoolBudget, 24000000);
  assert.equal(base.monthlyPremiumPoolDelta, 2000000);
  assert.equal(base.perTargetBudgetHint, 6000000);
  assert.equal(base.premiumPoolBudget, changedToolBudget.premiumPoolBudget);
  assert.equal(base.advancedOnly, true);
});

test("productivity leakage flag is true when diagnostics show no reinvestment of AI-saved time", () => {
  const result = evaluateProductivityLeakageFlag({
    hiring_freeze_toggle: true,
    hiring_delay_months: 6,
    current_ai_tooling_level: "team_level",
    affected_roles_or_functions: ["engineering", "operations"],
    productivity_leakage_questions: {
      coordination_overhead_increased: "yes",
      output_review_bottleneck: "yes",
      individual_speed_not_shared: "yes",
      process_not_redesigned: "yes",
    },
    junior_pipeline_risk_questions: {
      junior_learning_reduced: "yes",
    },
  });

  assert.equal(result.flag, true);
  assert.ok(result.reasons.length >= 2);
  assert.match(result.suggestedQuestions[0], /AI|조직|전환/);
});

test("no calculation function returns forbidden AI replacement or fake precision metrics", () => {
  const outputs = [
    calculateCEI({
      has_salary_band: true,
      has_level_system: true,
      has_performance_review: true,
      pay_inversion_case_count: 0,
      exception_raise_frequency: "none",
      counteroffer_frequency: "none",
      variable_pay_linked_to_performance: true,
      manager_can_explain_pay_basis: true,
    }),
    calculateCED({
      counteroffer_frequency: "none",
      exception_raise_frequency: "none",
      new_hire_premium_exists: false,
      pay_inversion_case_count: 0,
      out_of_band_case_count: 0,
      undocumented_negotiation_level: "none",
    }),
    detectPayInversion({
      pay_inversion_case_count: 0,
      new_hire_premium_exists: false,
      out_of_band_case_count: 0,
    }),
    evaluateSalaryBandHealth({
      salaryBands: [],
      out_of_band_case_count: 0,
    }),
    forecastPayrollCost({
      compensationSnapshot: {
        total_monthly_base_pay: 100000000,
        total_monthly_fixed_allowance: 0,
      },
      hiringPlan: {
        planned_hires_6m: {},
        planned_hires_12m: {},
        average_expected_salary_by_level: {},
        hiring_freeze_toggle: false,
      },
      forecastMonths: 12,
    }),
    calculateOrchestratorPremiumPool({
      advancedEnabled: true,
      hiringPlan: {
        planned_hires_6m: {},
        planned_hires_12m: {},
        average_expected_salary_by_level: {},
        hiring_freeze_toggle: true,
      },
      aiScenarioInputs: {
        hiring_delay_months: 0,
        orchestrator_target_count: 0,
        premium_pool_allocation_rate: 0,
      },
      delayedHiresByLevel: {},
    }),
    evaluateProductivityLeakageFlag({
      hiring_freeze_toggle: false,
      current_ai_tooling_level: "none",
      productivity_leakage_questions: {},
      junior_pipeline_risk_questions: {},
    }),
  ];

  for (const output of outputs) {
    assertNoForbiddenMetricKeys(output);
  }
});
