import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  CHEAPEST_NOT_ALWAYS_BEST_COPY,
  HEADCOUNT_SLOWDOWN_COPY,
  SHORT_TERM_COST_EXPLAINABILITY_COPY,
  getScenarioComparisonModel,
  pickBestFitScenario,
  renderScenarioComparisonHtml,
} from "../../frontend/components/hr-paysim/ScenarioComparison.ts";

const requiredFields = [
  "연간 비용 변화",
  "월 burn 변화",
  "Payroll 증가율",
  "CEI before/after",
  "CED before/after",
  "보상 역전 사례 변화",
  "실행 난이도",
  "커뮤니케이션 난이도",
  "핵심 trade-off",
  "risk flags",
];

const forbiddenTerms = [
  "AI substitution %",
  "AI replacement %",
  "AI replacement",
  "AI 대체율",
  "Total Work Cost",
  "attrition probability",
  "이직 확률",
  "productivity gain %",
  "생산성 향상 %",
];

test("scenario comparison model keeps baseline first and exposes all comparison fields", () => {
  const model = getScenarioComparisonModel();

  assert.equal(model.baseline.scenario_id, "baseline_current_state");
  assert.equal(model.scenarios[0].scenario_id, "baseline_current_state");
  assert.ok(model.scenarios.length >= 6);

  for (const scenario of model.scenarios) {
    assert.equal(typeof scenario.annual_cost_delta, "number", scenario.scenario_id);
    assert.equal(typeof scenario.monthly_burn_delta, "number", scenario.scenario_id);
    assert.equal(typeof scenario.payroll_increase_rate, "number", scenario.scenario_id);
    assert.equal(typeof scenario.cei_before, "number", scenario.scenario_id);
    assert.equal(typeof scenario.cei_after, "number", scenario.scenario_id);
    assert.equal(typeof scenario.ced_before, "number", scenario.scenario_id);
    assert.equal(typeof scenario.ced_after, "number", scenario.scenario_id);
    assert.equal(typeof scenario.pay_inversion_cases_before, "number", scenario.scenario_id);
    assert.equal(typeof scenario.pay_inversion_cases_after, "number", scenario.scenario_id);
    assert.ok(scenario.execution_difficulty.length > 0, scenario.scenario_id);
    assert.ok(scenario.communication_difficulty.length > 0, scenario.scenario_id);
    assert.ok(scenario.key_trade_off.length > 0, scenario.scenario_id);
    assert.ok(scenario.founder_gain.length > 0, scenario.scenario_id);
    assert.ok(scenario.founder_loss.length > 0, scenario.scenario_id);
    assert.ok(Array.isArray(scenario.risk_flags), scenario.scenario_id);
  }
});

test("scenario comparison does not simply choose the cheapest scenario", () => {
  const model = getScenarioComparisonModel();
  const selectedScenarios = model.scenarios.filter(
    (scenario) => scenario.scenario_id !== "baseline_current_state",
  );
  const cheapest = [...selectedScenarios].sort(
    (left, right) => left.annual_cost_delta - right.annual_cost_delta,
  )[0];
  const bestFit = pickBestFitScenario(selectedScenarios);

  assert.notEqual(bestFit?.scenario_id, cheapest.scenario_id);
  assert.equal(bestFit?.scenario_id, "pay_inversion_correction");
  assert.match(model.decisionPrinciple, new RegExp(CHEAPEST_NOT_ALWAYS_BEST_COPY));
});

test("rendered scenario comparison includes required copy and metrics", () => {
  const html = renderScenarioComparisonHtml();

  assert.match(html, /어떤 조정안이 비용과 설명 가능성을 어떻게 바꾸나요/);
  assert.match(html, new RegExp(CHEAPEST_NOT_ALWAYS_BEST_COPY));
  assert.match(html, new RegExp(SHORT_TERM_COST_EXPLAINABILITY_COPY));
  assert.match(html, new RegExp(HEADCOUNT_SLOWDOWN_COPY));

  for (const field of requiredFields) {
    assert.match(html, new RegExp(field));
  }

  assert.match(html, /창업자가 얻는 것/);
  assert.match(html, /창업자가 감수할 것/);
  assert.match(html, /Best-fit 후보/);
  assert.match(html, /Advanced/);
});

test("scenario comparison does not show forbidden metrics", () => {
  const html = renderScenarioComparisonHtml();

  for (const term of forbiddenTerms) {
    assert.doesNotMatch(html, new RegExp(term, "i"));
  }
});

test("static scenario comparison preview exists and does not implement later screens", () => {
  const htmlPath = "frontend/hr-paysim/scenario-comparison.html";
  const cssPath = "frontend/hr-paysim/scenario-comparison.css";
  const jsPath = "frontend/hr-paysim/scenario-comparison.js";

  assert.equal(existsSync(htmlPath), true);
  assert.equal(existsSync(cssPath), true);
  assert.equal(existsSync(jsPath), true);

  const html = readFileSync(htmlPath, "utf8");
  assert.match(html, /Scenario Comparison/);
  assert.match(html, /가장 비용이 낮은 안이 항상 가장 좋은 안은 아닙니다/);
  assert.match(html, /연간 비용 변화/);
  assert.match(html, /월 burn 변화/);
  assert.match(html, /Payroll 증가율/);
  assert.match(html, /CEI before\/after/);
  assert.match(html, /CED before\/after/);
  assert.doesNotMatch(html, /Decision Memo|Aggregate Consent|PDF|정식 메모|익명 aggregate/);
});
