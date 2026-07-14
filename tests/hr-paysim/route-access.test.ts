import assert from "node:assert/strict";
import test from "node:test";
import { resolveBuildSurface } from "../../src/lib/hr-paysim/access/buildSurface.ts";
import { resolveSurfaceRoute } from "../../src/lib/hr-paysim/access/routePolicy.ts";

test("only exact facilitator-local opens the local surface", () => {
  assert.equal(resolveBuildSurface("facilitator-local"), "FACILITATOR_LOCAL");
  for (const value of [
    undefined,
    "",
    "production",
    "public-demo",
    "FACILITATOR_LOCAL",
    "facilitator",
  ]) {
    assert.equal(resolveBuildSurface(value), "PUBLIC_DEMO");
  }
});

test("public permits only the canonical synthetic demo", () => {
  assert.equal(
    resolveSurfaceRoute("PUBLIC_DEMO", "/hr-paysim/demo"),
    "demo",
  );
  for (const path of [
    "/hr-paysim/decision-room-preview",
    "/hr-paysim/session/new",
    "/hr-paysim/session",
    "/hr-paysim/roster",
    "/hr-paysim/entry",
    "/unknown",
  ]) {
    assert.equal(resolveSurfaceRoute("PUBLIC_DEMO", path), "unavailable");
  }
});

test("facilitator-local permits demo and local session routes only", () => {
  assert.equal(
    resolveSurfaceRoute("FACILITATOR_LOCAL", "/hr-paysim/demo"),
    "demo",
  );
  assert.equal(
    resolveSurfaceRoute("FACILITATOR_LOCAL", "/hr-paysim/session/new"),
    "facilitator_preparation",
  );
  assert.equal(
    resolveSurfaceRoute("FACILITATOR_LOCAL", "/hr-paysim/session"),
    "facilitator_session",
  );
  for (const path of [
    "/hr-paysim/decision-room-preview",
    "/hr-paysim/roster",
    "/hr-paysim/entry",
    "/unknown",
  ]) {
    assert.equal(resolveSurfaceRoute("FACILITATOR_LOCAL", path), "unavailable");
  }
});