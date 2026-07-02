import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  ADVANCED_HEADCOUNT_FREEZE_COPY,
  SENIOR_ORCHESTRATOR_PREMIUM_COPY,
  getScenarioBuilderSections,
  getScenarioDefinitions,
  renderScenarioBuilderHtml,
} from "../../frontend/components/hr-paysim/ScenarioBuilder.ts";

const forbiddenTerms = [
  "AI replacement %",
  "AI replacement",
  "AI 대체율",
  "채용을 대체한다",
  "Total Work Cost",
  "attrition probability",
  "이직 확률",
];

test("scenario builder exposes three main and two advanced scenarios in order", () => {
  const sections = getScenarioBuilderSections();

  assert.equal(sections.length, 2);
  assert.equal(sections[0].category, "main");
  assert.deepEqual(
    sections[0].scenarios.map((scenario) => scenario.id),
    ["pay_inversion_correction", "salary_band_redesign", "payroll_cost_forecast"],
  );
  assert.equal(sections[1].category, "advanced");
  assert.deepEqual(
    sections[1].scenarios.map((scenario) => scenario.id),
    ["ai_tooling_headcount_freeze", "senior_orchestrator_premium"],
  );
});

test("each scenario has purpose, adjustable inputs, outputs, trade-off, and warnings", () => {
  for (const scenario of getScenarioDefinitions()) {
    assert.ok(scenario.purpose.length > 0, `${scenario.id} purpose`);
    assert.ok(scenario.adjustableInputs.length > 0, `${scenario.id} adjustable inputs`);
    assert.ok(scenario.expectedOutputs.length > 0, `${scenario.id} expected outputs`);
    assert.ok(scenario.keyTradeOff.length > 0, `${scenario.id} key trade-off`);
    assert.ok(scenario.warningCopy.length > 0, `${scenario.id} warning copy`);
  }
});

test("advanced scenarios are collapsed by default and use required positioning copy", () => {
  const html = renderScenarioBuilderHtml();
  const mainIndex = html.indexOf("기본 보상 시나리오");
  const advancedIndex = html.indexOf("Advanced: AI tooling과 채용 지연 가정");

  assert.ok(mainIndex >= 0);
  assert.ok(advancedIndex > mainIndex);
  assert.match(html, /<details class="scenario-group advanced-scenarios">/);
  assert.doesNotMatch(html, /<details class="scenario-group advanced-scenarios" open>/);
  assert.match(html, new RegExp(ADVANCED_HEADCOUNT_FREEZE_COPY));
  assert.match(html, new RegExp(SENIOR_ORCHESTRATOR_PREMIUM_COPY));
});

test("scenario builder does not show forbidden metrics or standalone AI simulator language", () => {
  const html = renderScenarioBuilderHtml();

  for (const term of forbiddenTerms) {
    assert.doesNotMatch(html, new RegExp(term, "i"));
  }
});

test("static scenario builder preview exists without scenario comparison artifacts", () => {
  const htmlPath = "frontend/hr-paysim/scenario-builder.html";
  const cssPath = "frontend/hr-paysim/scenario-builder.css";
  const jsPath = "frontend/hr-paysim/scenario-builder.js";

  assert.equal(existsSync(htmlPath), true);
  assert.equal(existsSync(cssPath), true);
  assert.equal(existsSync(jsPath), true);

  const html = readFileSync(htmlPath, "utf8");
  assert.match(html, /기본 보상 시나리오/);
  assert.match(html, /Advanced: AI tooling과 채용 지연 가정/);
  assert.match(html, /보상 역전 정리/);
  assert.match(html, /급여 밴드 재설계/);
  assert.match(html, /Payroll 증가 예측/);
  assert.match(html, /AI Tooling \+ Headcount Freeze/);
  assert.match(html, /Senior Orchestrator Premium/);
  assert.doesNotMatch(html, /Scenario Comparison|Decision Memo|Aggregate Consent/);
});
