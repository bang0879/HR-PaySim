import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("downstream screens render invalidatable headings and status from the view model", () => {
  const rule = readFileSync(
    new URL("../../src/features/company-rule/CompanyRuleScreen.tsx", import.meta.url),
    "utf8",
  );
  const result = readFileSync(
    new URL("../../src/features/session-result/SessionResultScreen.tsx", import.meta.url),
    "utf8",
  );

  assert.match(rule, /model\.observedRepeat\.heading/);
  assert.match(rule, /model\.decision\.heading/);
  assert.doesNotMatch(rule, /기본 연봉이 9,500만원이라고 가정/);
  assert.match(result, /model\.approvalStatus/);
  assert.doesNotMatch(result, />대표님 확인 완료</);
});

test("facilitated components render roster counts from the view model", () => {
  const introduction = readFileSync(
    new URL("../../src/features/session-introduction/SessionIntroductionScreen.tsx", import.meta.url),
    "utf8",
  );
  const evidence = readFileSync(
    new URL("../../src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx", import.meta.url),
    "utf8",
  );
  const distribution = readFileSync(
    new URL("../../src/features/confirmed-pay-differences/SalaryDistribution.tsx", import.meta.url),
    "utf8",
  );
  const sources = [introduction, evidence, distribution].join("\n");

  assert.doesNotMatch(sources, /Product Engineer 6\uBA85/);
  assert.match(introduction, /model\.nextStepSummary/);
  assert.match(evidence, /model\.supportingObservationsHeading/);
  assert.match(distribution, /distributionKicker/);
});

test("decision room keeps the sample marker demo-only and notifies after explicit end", () => {
  const decisionRoom = readFileSync(
    new URL("../../src/features/decision-room/DecisionRoomApp.tsx", import.meta.url),
    "utf8",
  );
  const sessionResult = readFileSync(
    new URL("../../src/features/session-result/SessionResultScreen.tsx", import.meta.url),
    "utf8",
  );

  assert.match(decisionRoom, /state\.mode === "demo"/);
  assert.match(decisionRoom, /onSessionEnd\?\.\(\)/);
  assert.match(decisionRoom, /dispatch\(\{ type: "END_SESSION" \}\)/);
  assert.match(sessionResult, /onClick=\{onEnd\}/);
});
