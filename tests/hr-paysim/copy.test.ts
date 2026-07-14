import assert from "node:assert/strict";
import test from "node:test";
import { FORBIDDEN_PAY_SIM_WORDING, getInterpretation } from "../../src/lib/hr-paysim/copy.ts";

test("getInterpretation returns founder-facing Korean interpretation", () => {
  const interpretation = getInterpretation({
    ceiBand: "risk",
    cedBand: "high",
    payInversionSeverity: "high",
    payrollIncreaseRate: 0.3,
  });

  assert.match(interpretation.headline, /설명|보상/);
  assert.ok(interpretation.body.length > 20);
  assert.ok(interpretation.supportingPoints.length >= 3);
  assert.ok(interpretation.caution);
});

test("forbidden wording list covers v1.0 strict exclusions", () => {
  assert.ok(FORBIDDEN_PAY_SIM_WORDING.includes("Total Work Cost"));
  assert.ok(FORBIDDEN_PAY_SIM_WORDING.includes("이직 확률"));
  assert.ok(FORBIDDEN_PAY_SIM_WORDING.includes("생산성 향상률"));
  assert.ok(FORBIDDEN_PAY_SIM_WORDING.includes("AI substitution"));
});

test("interpretation copy uses gain and tradeoff framing without forbidden terms", () => {
  const interpretation = getInterpretation({
    ceiBand: "healthy",
    cedBand: "low",
    payInversionSeverity: "none",
    payrollIncreaseRate: 0.04,
  });
  const fullCopy = [
    interpretation.headline,
    interpretation.body,
    ...interpretation.supportingPoints,
    interpretation.caution ?? "",
  ].join(" ");

  assert.match(fullCopy, /얻는 것|감수할 것/);
  for (const forbidden of FORBIDDEN_PAY_SIM_WORDING) {
    assert.equal(fullCopy.includes(forbidden), false, `${forbidden} should not appear`);
  }
});
