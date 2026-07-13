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
