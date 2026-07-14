import assert from "node:assert/strict";
import test from "node:test";
import {
  collectSensitiveTokens,
  findBlockedLiteralPaySimHrefs,
  findSensitivePayloadTokens,
} from "../../scripts/qa-evidence-policy.mjs";

test("public link detector covers direct and JSX brace literals", () => {
  const source = `
    <a href="/hr-paysim/decision-room-preview">allowed</a>
    <a href="/hr-paysim/session/new">blocked direct</a>
    <a href={'/hr-paysim/demo'}>blocked legacy</a>
    <a href={"/hr-paysim/unknown"}>blocked unknown</a>
    <a href={enabled ? "/hr-paysim/session" : "/hr-paysim/decision-room-preview"}>conditional</a>
    <a href="https://example.com/hr-paysim/session">external</a>
  `;
  assert.deepEqual(findBlockedLiteralPaySimHrefs(source), [
    "/hr-paysim/session/new",
    "/hr-paysim/demo",
    "/hr-paysim/unknown",
    "/hr-paysim/session",
  ]);
});

test("sensitive evidence derives every tabular cell and finds omitted roster fields", () => {
  const tokens = collectSensitiveTokens(
    "rowId\ttenureMonths\texceptionFlag\tcounterOfferFlag",
    "actual_001\t61\tfalse\ttrue",
    "timing_context\tdocumented",
  );
  assert.deepEqual(tokens, [
    "rowId",
    "tenureMonths",
    "exceptionFlag",
    "counterOfferFlag",
    "actual_001",
    "61",
    "false",
    "true",
    "timing_context",
    "documented",
  ]);
  assert.deepEqual(
    findSensitivePayloadTokens(
      '{"tenureMonths":61,"counterOfferFlag":true}',
      tokens,
    ),
    ["tenureMonths", "counterOfferFlag", "61", "true"],
  );
});
test("ambiguous cells are excluded from URL and header matching only", () => {
  const tokens = collectSensitiveTokens(
    "tenureMonths\texceptionFlag",
    "61\tfalse",
  );
  assert.deepEqual(
    findSensitivePayloadTokens("content-length: 61; preference: false", tokens, false),
    [],
  );
  assert.deepEqual(
    findSensitivePayloadTokens('{"tenureMonths":61,"exceptionFlag":false}', tokens, false),
    ["tenureMonths", "exceptionFlag"],
  );
  assert.deepEqual(
    findSensitivePayloadTokens("61\tfalse", tokens, true),
    ["61", "false"],
  );
});
