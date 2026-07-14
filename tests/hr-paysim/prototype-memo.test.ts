import assert from "node:assert/strict";
import test from "node:test";
import { createPrototypeMemoPreviewText } from "../../src/lib/hr-paysim/memo.ts";
import { createPrototypePresentation, prototypeSampleForm } from "../../src/lib/hr-paysim/prototypeViewModel.ts";
import { createAggregateLogPayload } from "../../src/lib/hr-paysim/consent.ts";

test("createPrototypeMemoPreviewText turns the calculated prototype state into copyable memo text", () => {
  const presentation = createPrototypePresentation({
    form: prototypeSampleForm,
    mode: "sample",
    selectedScenarioKey: "band",
  });

  const text = createPrototypeMemoPreviewText(presentation);

  assert.match(text, /HR PaySim 논의용 메모 preview/);
  assert.match(text, /선택한 시나리오/);
  assert.match(text, new RegExp(presentation.selectedScenario.title));
  assert.match(text, new RegExp(presentation.memo.currentIssue));
  assert.match(text, new RegExp(presentation.memo.gains[0]));
  assert.match(text, new RegExp(presentation.memo.tradeoffs[0]));
  assert.equal(/PDF|법률|세무|연봉 추천/.test(text), false);
});

test("calculated prototype aggregate can create a local consent payload without salary totals", () => {
  const presentation = createPrototypePresentation({
    form: prototypeSampleForm,
    mode: "sample",
    selectedScenarioKey: "band",
  });

  const payload = createAggregateLogPayload(
    { consentForAggregateAnalysis: true, allowCompanyName: false, companyName: "Acme Tech" },
    presentation.input,
  );

  assert.ok(payload);
  assert.equal("companyName" in payload, false);
  assert.equal("basePayrollAnnual" in payload.aggregate, false);
  assert.equal("variablePayAnnual" in payload.aggregate, false);
  assert.equal("benefitsAnnual" in payload.aggregate, false);
});
