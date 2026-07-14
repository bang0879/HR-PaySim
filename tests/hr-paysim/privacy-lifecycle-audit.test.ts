import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const owners = [
  "../../src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx",
  "../../src/features/facilitator-preparation/FacilitatedSessionApp.tsx",
  "../../src/app/PaySimSessionProvider.tsx",
  "../../src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts",
  "../../src/lib/hr-paysim/preparation/createProductEngineerSessionDraft.ts",
].map((path) => readFileSync(new URL(path, import.meta.url), "utf8"));

test("roster and session owners contain no persistence or emission API", () => {
  assert.doesNotMatch(
    owners.join("\n"),
    /localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/,
  );
});

test("raw paste clears and never enters provider state", () => {
  assert.match(owners[0] ?? "", /setRawPaste\(""\)/);
  assert.doesNotMatch(
    owners[2] ?? "",
    /rawPaste|confirmPiiColumnStripping/,
  );
});

test("facilitator privacy verifier scans the built local module graph", () => {
  const verifier = readFileSync(
    new URL("../../scripts/verify-facilitator-privacy.ts", import.meta.url),
    "utf8",
  );
  assert.match(verifier, /dist\/facilitator-local\/paysim-module-manifest\.json/);
  assert.match(verifier, /findForbiddenPrivacyApis/);
});
