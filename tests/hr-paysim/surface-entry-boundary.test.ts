import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("public entry owns only synthetic dependencies", () => {
  const source = read("src/surfaces/PublicDemoApp.tsx");
  assert.match(source, /createSyntheticDemoSession/);
  assert.match(source, /resolveSurfaceRoute\("PUBLIC_DEMO"/);
  assert.match(source, /UnavailableSurface/);
  assert.doesNotMatch(
    source,
    /facilitator-preparation|hr-paysim\/preparation|PrototypePaySimApp|RosterDiagnosticApp|appRoute/,
  );
});

test("main imports only the selected alias", () => {
  const source = read("src/main.tsx");
  assert.match(source, /from "@paysim-surface-entry"/);
  assert.doesNotMatch(source, /from "\.\/App"/);
});

test("local entry owns the existing local flow", () => {
  const source = read("src/surfaces/FacilitatorLocalApp.tsx");
  assert.match(source, /FacilitatedSessionApp/);
  assert.match(source, /resolveSurfaceRoute\(\s*"FACILITATOR_LOCAL"/);
  assert.match(source, /PaySimSessionProvider/);
});

test("public discovery checks rendered anchors, manifest sources, and sitemaps", () => {
  const qa = read("scripts/qa-decision-room.mjs");
  const verifier = read("scripts/verify-route-exposure.mjs");
  assert.match(qa, /locator\(["']a\[href\]["']\)/);
  assert.match(qa, /assertNoBlockedPaySimLinks/);
  assert.match(verifier, /manifest\.modules/);
  assert.match(verifier, /sitemap/i);
});
