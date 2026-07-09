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