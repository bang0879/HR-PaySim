import assert from "node:assert/strict";
import test from "node:test";
import {
  createPrototypePresentation,
  prototypeSampleForm,
  scenarioKeyToScenarioId,
  type PrototypeFormState,
} from "../../src/lib/hr-paysim/prototypeViewModel.ts";

test("prototype form values drive diagnosis and recommendations", () => {
  const healthy = createPrototypePresentation({
    form: {
      ...prototypeSampleForm,
      companySize: "50~199명",
      plannedHires: "5",
      basePayrollEok: "72",
      variablePayEok: "8",
      benefitsEok: "6",
      inversionSignal: "없음",
      attritionSignal: "없음",
      hiringDifficultySignal: "없음",
      salaryBandExists: true,
      aiAutomationLevel: "",
    },
    mode: "direct",
    selectedScenarioKey: "current",
  });

  const risky = createPrototypePresentation({
    form: {
      ...prototypeSampleForm,
      companySize: "50~199명",
      plannedHires: "36",
      basePayrollEok: "72",
      variablePayEok: "8",
      benefitsEok: "6",
      inversionSignal: "명확히 있음",
      attritionSignal: "일부 있음",
      hiringDifficultySignal: "명확히 있음",
      salaryBandExists: false,
      aiAutomationLevel: "중간",
    },
    mode: "direct",
    selectedScenarioKey: "band",
  });

  assert.ok(risky.diagnosis.ceiScore < healthy.diagnosis.ceiScore);
  assert.ok(risky.diagnosis.cedScore > healthy.diagnosis.cedScore);
  assert.ok(risky.recommendations.some((item) => item.scenarioId === "resolve_pay_inversion"));
  assert.equal(risky.summary.plannedHires.value, "36명");
  assert.equal(risky.summary.aiTooling.value, "제공됨");
});

test("comparison and memo derive from the selected final-design scenario", () => {
  const presentation = createPrototypePresentation({
    form: prototypeSampleForm,
    mode: "sample",
    selectedScenarioKey: "band",
  });

  assert.equal(scenarioKeyToScenarioId("band"), "redesign_salary_bands");
  assert.equal(presentation.selectedScenario.id, "redesign_salary_bands");
  assert.equal(presentation.selectedScenario.title, "연봉 밴드 재설계");
  assert.equal(presentation.comparison.bestFitScenarioId, "redesign_salary_bands");
  assert.match(presentation.memo.currentIssue, /역전|보상|예외/);
  assert.ok(presentation.memo.gains.length > 0);
  assert.ok(presentation.memo.tradeoffs.length > 0);
});

test("changing hiring plan changes derived baseline cost", () => {
  const lowHireForm: PrototypeFormState = { ...prototypeSampleForm, plannedHires: "5" };
  const highHireForm: PrototypeFormState = { ...prototypeSampleForm, plannedHires: "50" };

  const low = createPrototypePresentation({
    form: lowHireForm,
    mode: "direct",
    selectedScenarioKey: "current",
  });
  const high = createPrototypePresentation({
    form: highHireForm,
    mode: "direct",
    selectedScenarioKey: "current",
  });

  const lowBaseline = low.comparison.rows.find((row) => row.scenarioId === "baseline_current_state");
  const highBaseline = high.comparison.rows.find((row) => row.scenarioId === "baseline_current_state");

  assert.ok(lowBaseline);
  assert.ok(highBaseline);
  assert.ok(highBaseline.annualCostImpact > lowBaseline.annualCostImpact);
});
