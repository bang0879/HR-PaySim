import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import test from "node:test";
import {
  findForbiddenPrivacyApis,
  findForbiddenPublicModules,
  normalizeProjectModule,
} from "../../scripts/public-bundle-boundary.ts";

test("module identities normalize to project-relative paths", () => {
  const root = resolve("fixture-project");
  assert.equal(
    normalizeProjectModule(
      root,
      join(root, "src", "surfaces", "PublicDemoApp.tsx") + "?v=1",
    ),
    "src/surfaces/PublicDemoApp.tsx",
  );
});

test("public boundary rejects facilitator, preparation, and legacy modules", () => {
  const root = resolve("fixture-project");
  const ids = [
    join(root, "src", "features", "decision-room", "DecisionRoomApp.tsx"),
    join(
      root,
      "src",
      "features",
      "facilitator-preparation",
      "FacilitatedSessionApp.tsx",
    ),
    join(root, "src", "lib", "hr-paysim", "preparation", "types.ts"),
    join(
      root,
      "src",
      "components",
      "hr-paysim",
      "PrototypePaySimApp.tsx",
    ),
    join(
      root,
      "src",
      "components",
      "hr-paysim",
      "RosterDiagnosticApp.tsx",
    ),
    join(root, "src", "routes", "hr-paysim", "appRoute.ts"),
    join(root, "src", "App.tsx"),
  ];
  assert.deepEqual(findForbiddenPublicModules(root, ids), [
    "src/App.tsx",
    "src/components/hr-paysim/PrototypePaySimApp.tsx",
    "src/components/hr-paysim/RosterDiagnosticApp.tsx",
    "src/features/facilitator-preparation/FacilitatedSessionApp.tsx",
    "src/lib/hr-paysim/preparation/types.ts",
    "src/routes/hr-paysim/appRoute.ts",
  ]);
});

test("privacy API detector covers the full first-party source map", () => {
  assert.deepEqual(
    findForbiddenPrivacyApis({
      "src/a.ts": 'fetch("/emit")',
      "src/b.ts": 'navigator.sendBeacon("/emit", payload)',
      "src/c.ts": 'const socket = new WebSocket(url)',
      "src/d.ts": "localStorage.setItem(key, value)",
      "src/clean.ts": "navigator.clipboard.writeText(text)",
    }),
    [
      "src/a.ts: fetch",
      "src/b.ts: sendBeacon",
      "src/c.ts: WebSocket",
      "src/d.ts: localStorage",
    ],
  );
});
