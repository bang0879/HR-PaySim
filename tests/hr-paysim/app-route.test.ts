import assert from "node:assert/strict";
import test from "node:test";
import { resolveHrPaySimSurface } from "../../src/routes/hr-paysim/appRoute.ts";

test("resolveHrPaySimSurface keeps existing step routes on the prototype app", () => {
  assert.equal(resolveHrPaySimSurface("/hr-paysim/entry"), "prototype");
  assert.equal(resolveHrPaySimSurface("/hr-paysim/intake"), "prototype");
});

test("resolveHrPaySimSurface exposes facilitated roster and synthetic demo routes", () => {
  assert.equal(resolveHrPaySimSurface("/hr-paysim/roster"), "roster");
  assert.equal(resolveHrPaySimSurface("/hr-paysim/demo"), "demo");
});
test("local facilitator paths resolve without changing existing surfaces", () => {
  assert.equal(resolveHrPaySimSurface("/hr-paysim/session/new"), "facilitator_preparation");
  assert.equal(resolveHrPaySimSurface("/hr-paysim/session"), "facilitator_session");
  assert.equal(resolveHrPaySimSurface("/hr-paysim/decision-room-preview"), "decision_room_preview");
});
