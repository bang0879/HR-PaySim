# HR PaySim Task 11 Public Surface Isolation And Privacy Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a shareable public synthetic demo whose bundles contain no facilitator/roster-preparation code, while freshly proving the existing local facilitated privacy lifecycle.

**Architecture:** Vite resolves one stable app-entry alias to either a public-only entry or a loopback-only facilitator entry. A Rollup module-boundary plugin fails public builds that include forbidden source modules, while a pure route policy independently fails closed at runtime. Existing P11-B0 data handling is audited rather than rewritten.

**Tech Stack:** React 19, TypeScript 6, Vite 8/Rollup, Node test runner, Playwright.

## Global Constraints

- Work only in the current existing worktree on `codex/facilitated-decision-room`; create no branch or worktree.
- Canonical design: `docs/superpowers/specs/2026-07-14-hr-paysim-task11-route-exposure-and-privacy-verification-design.md`.
- Default, missing, empty, and unknown modes resolve to `PUBLIC_DEMO`; only exact Vite mode `facilitator-local` selects `FACILITATOR_LOCAL`.
- Public source graphs exclude facilitator-preparation, roster preparation, legacy prototype/roster apps, `src/App.tsx`, and the legacy resolver.
- `noindex`, no facilitator links, runtime blocking, and module-graph exclusion are separate assertions.
- Facilitator-local binds only to `127.0.0.1`; add no deployment, tunnel, auth, provider config, attestation, telemetry, persistence, or secrets.
- Preserve calculations, coordinates, state lineage, four-screen flow, fixtures, and Task 10 copy.
- Use TDD. Do not reuse Task 10 or P11-B0 verification output.
- Keep product work uncommitted until final fresh verification, then make one commit: `feat: isolate public demo and verify privacy`.
- Stop before Task 12, deployment, and PILOT-1.

---

### Task 1: Lock fail-closed build and route contracts

**Files:**
- Create: `src/lib/hr-paysim/access/buildSurface.ts`
- Create: `src/lib/hr-paysim/access/routePolicy.ts`
- Create: `tests/hr-paysim/route-access.test.ts`

**Interfaces:**
- Produces: `BuildSurface`, `resolveBuildSurface(mode)`, `SurfaceRoute`, and `resolveSurfaceRoute(surface, pathname)`.
- Consumed by: Vite config and both surface entries.

- [ ] **Step 1: Write the failing test**

Create `tests/hr-paysim/route-access.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { resolveBuildSurface } from "../../src/lib/hr-paysim/access/buildSurface.ts";
import { resolveSurfaceRoute } from "../../src/lib/hr-paysim/access/routePolicy.ts";

test("only exact facilitator-local opens the local surface", () => {
  assert.equal(resolveBuildSurface("facilitator-local"), "FACILITATOR_LOCAL");
  for (const value of [undefined, "", "production", "public-demo", "FACILITATOR_LOCAL", "facilitator"]) {
    assert.equal(resolveBuildSurface(value), "PUBLIC_DEMO");
  }
});

test("public permits only the synthetic preview", () => {
  assert.equal(resolveSurfaceRoute("PUBLIC_DEMO", "/hr-paysim/decision-room-preview"), "decision_room_preview");
  for (const path of ["/hr-paysim/session/new", "/hr-paysim/session", "/hr-paysim/roster", "/hr-paysim/demo", "/hr-paysim/entry", "/unknown"]) {
    assert.equal(resolveSurfaceRoute("PUBLIC_DEMO", path), "unavailable");
  }
});

test("facilitator-local permits preview and local session routes only", () => {
  assert.equal(resolveSurfaceRoute("FACILITATOR_LOCAL", "/hr-paysim/decision-room-preview"), "decision_room_preview");
  assert.equal(resolveSurfaceRoute("FACILITATOR_LOCAL", "/hr-paysim/session/new"), "facilitator_preparation");
  assert.equal(resolveSurfaceRoute("FACILITATOR_LOCAL", "/hr-paysim/session"), "facilitator_session");
  for (const path of ["/hr-paysim/roster", "/hr-paysim/demo", "/hr-paysim/entry", "/unknown"]) {
    assert.equal(resolveSurfaceRoute("FACILITATOR_LOCAL", path), "unavailable");
  }
});
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test tests/hr-paysim/route-access.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `buildSurface.ts`.

- [ ] **Step 3: Implement the pure contracts**

Create `buildSurface.ts`:

```ts
export type BuildSurface = "PUBLIC_DEMO" | "FACILITATOR_LOCAL";
export function resolveBuildSurface(mode: string | undefined): BuildSurface {
  return mode === "facilitator-local" ? "FACILITATOR_LOCAL" : "PUBLIC_DEMO";
}
```

Create `routePolicy.ts`:

```ts
import type { BuildSurface } from "./buildSurface.ts";
export type SurfaceRoute =
  | "decision_room_preview"
  | "facilitator_preparation"
  | "facilitator_session"
  | "unavailable";

export function resolveSurfaceRoute(surface: BuildSurface, pathname: string): SurfaceRoute {
  if (pathname === "/hr-paysim/decision-room-preview") return "decision_room_preview";
  if (surface === "FACILITATOR_LOCAL") {
    if (pathname === "/hr-paysim/session/new") return "facilitator_preparation";
    if (pathname === "/hr-paysim/session") return "facilitator_session";
  }
  return "unavailable";
}
```

- [ ] **Step 4: Verify GREEN and checkpoint**

Run the Step 2 command, then `git diff --check` and `git status --short`.

Expected: 3 tests pass; only Task 1 files are new; nothing staged or committed.

---

### Task 2: Split public and facilitator-local entries

**Files:**
- Create: `src/surfaces/PublicDemoApp.tsx`
- Create: `src/surfaces/FacilitatorLocalApp.tsx`
- Create: `src/surface-entry.d.ts`
- Create: `src/features/route-access/UnavailableSurface.tsx`
- Create: `src/features/route-access/routeAccess.css`
- Create: `tests/hr-paysim/surface-entry-boundary.test.ts`
- Modify: `src/main.tsx`
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `tests/hr-paysim/facilitator-preparation-ui.test.ts`

**Interfaces:**
- Consumes: Task 1 route contract.
- Produces: named `SurfaceApp` and `data-route-unavailable="true"`.

- [ ] **Step 1: Write failing static tests**

Create `surface-entry-boundary.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("public entry owns only synthetic dependencies", () => {
  const source = read("src/surfaces/PublicDemoApp.tsx");
  assert.match(source, /createSyntheticDemoSession/);
  assert.match(source, /resolveSurfaceRoute\("PUBLIC_DEMO"/);
  assert.match(source, /UnavailableSurface/);
  assert.doesNotMatch(source, /facilitator-preparation|hr-paysim\/preparation|PrototypePaySimApp|RosterDiagnosticApp|appRoute/);
});
test("main imports only the selected alias", () => {
  const source = read("src/main.tsx");
  assert.match(source, /from "@paysim-surface-entry"/);
  assert.doesNotMatch(source, /from "\.\/App"/);
});
test("local entry owns the existing local flow", () => {
  const source = read("src/surfaces/FacilitatorLocalApp.tsx");
  assert.match(source, /FacilitatedSessionApp/);
  assert.match(source, /resolveSurfaceRoute\("FACILITATOR_LOCAL"/);
  assert.match(source, /PaySimSessionProvider/);
});
```

In `facilitator-preparation-ui.test.ts`, make the `app` fixture read `FacilitatorLocalApp.tsx` and assert:

```ts
assert.match(app, /resolveSurfaceRoute\("FACILITATOR_LOCAL"/);
assert.match(app, /<PaySimSessionProvider>/);
assert.match(app, /<FacilitatedSessionApp/);
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test tests/hr-paysim/surface-entry-boundary.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts`

Expected: FAIL because the two entry files do not exist.

- [ ] **Step 3: Add governed blocked-state copy and UI**

Add to `FOUNDER_COPY`:

```ts
"route.unavailable.eyebrow": "HR PaySim · 공개 데모",
"route.unavailable.heading": "이 주소에서는 화면을 열 수 없습니다.",
"route.unavailable.support": "공개 데모에서 확인할 수 있는 화면으로 돌아가 주세요.",
"route.unavailable.action": "공개 데모로 돌아가기",
```

Create `UnavailableSurface.tsx`:

```tsx
import { FOUNDER_COPY } from "../../lib/hr-paysim/copy/founderCopy.ts";
import "./routeAccess.css";
export function UnavailableSurface() {
  return (
    <main className="route-access-shell" data-route-unavailable="true">
      <section className="route-access-card">
        <p className="route-access-eyebrow">{FOUNDER_COPY["route.unavailable.eyebrow"]}</p>
        <h1>{FOUNDER_COPY["route.unavailable.heading"]}</h1>
        <p>{FOUNDER_COPY["route.unavailable.support"]}</p>
        <a href="/hr-paysim/decision-room-preview">{FOUNDER_COPY["route.unavailable.action"]}</a>
      </section>
    </main>
  );
}
```

Create `routeAccess.css`:

```css
.route-access-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f4f6f8; color: #18202a; }
.route-access-card { width: min(100%, 640px); padding: clamp(28px, 5vw, 48px); border: 1px solid #dfe4ea; border-radius: 20px; background: #fff; box-shadow: 0 18px 48px rgba(28,39,54,.08); }
.route-access-eyebrow { margin: 0 0 12px; color: #536273; font-size: .82rem; font-weight: 700; letter-spacing: .04em; }
.route-access-card h1 { margin: 0; font-size: clamp(1.75rem, 5vw, 2.5rem); line-height: 1.18; }
.route-access-card > p:not(.route-access-eyebrow) { margin: 18px 0 28px; color: #536273; line-height: 1.65; }
.route-access-card a { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; border-radius: 999px; padding: 0 20px; background: #173f73; color: #fff; font-weight: 700; text-decoration: none; }
```

- [ ] **Step 4: Add both entries and switch main**

Create `PublicDemoApp.tsx`:

```tsx
import { PaySimSessionProvider } from "../app/PaySimSessionProvider.tsx";
import { DecisionRoomApp } from "../features/decision-room/DecisionRoomApp.tsx";
import { UnavailableSurface } from "../features/route-access/UnavailableSurface.tsx";
import { resolveSurfaceRoute } from "../lib/hr-paysim/access/routePolicy.ts";
import { createSyntheticDemoSession } from "../lib/hr-paysim/contracts/demoContract.ts";
export function SurfaceApp() {
  if (resolveSurfaceRoute("PUBLIC_DEMO", window.location.pathname) !== "decision_room_preview") {
    return <UnavailableSurface />;
  }
  return <PaySimSessionProvider initialState={createSyntheticDemoSession()}><DecisionRoomApp /></PaySimSessionProvider>;
}
```

Create `FacilitatorLocalApp.tsx`:

```tsx
import { PaySimSessionProvider } from "../app/PaySimSessionProvider.tsx";
import { DecisionRoomApp } from "../features/decision-room/DecisionRoomApp.tsx";
import { FacilitatedSessionApp } from "../features/facilitator-preparation/FacilitatedSessionApp.tsx";
import { UnavailableSurface } from "../features/route-access/UnavailableSurface.tsx";
import { resolveSurfaceRoute } from "../lib/hr-paysim/access/routePolicy.ts";
import { createSyntheticDemoSession } from "../lib/hr-paysim/contracts/demoContract.ts";
export function SurfaceApp() {
  const route = resolveSurfaceRoute("FACILITATOR_LOCAL", window.location.pathname);
  if (route === "decision_room_preview") {
    return <PaySimSessionProvider initialState={createSyntheticDemoSession()}><DecisionRoomApp /></PaySimSessionProvider>;
  }
  if (route === "facilitator_preparation" || route === "facilitator_session") {
    return <PaySimSessionProvider><FacilitatedSessionApp /></PaySimSessionProvider>;
  }
  return <UnavailableSurface />;
}
```

Create `surface-entry.d.ts`:

```ts
declare module "@paysim-surface-entry" {
  import type { ComponentType } from "react";
  export const SurfaceApp: ComponentType;
}
```

Replace `main.tsx` with:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { SurfaceApp } from "@paysim-surface-entry";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode><SurfaceApp /></React.StrictMode>,
);
```

- [ ] **Step 5: Verify GREEN and checkpoint**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/route-access.test.ts tests/hr-paysim/surface-entry-boundary.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts tests/hr-paysim/founder-copy.test.ts
npm.cmd run lint
git diff --check
git status --short
```

Expected: focused tests and lint pass; Task 1–2 files only; nothing staged or committed.

---

### Task 3: Enforce public module exclusion in Vite

**Files:**
- Create: `scripts/public-bundle-boundary.ts`
- Create: `tests/hr-paysim/public-bundle-boundary.test.ts`
- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `index.html`

**Interfaces:**
- Consumes: `BuildSurface`.
- Produces: `paysim-module-manifest.json` per outDir and a hard public-build failure on forbidden modules.

- [ ] **Step 1: Write the failing detector test**

Create `public-bundle-boundary.test.ts`:

```ts
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import test from "node:test";
import { findForbiddenPublicModules, normalizeProjectModule } from "../../scripts/public-bundle-boundary.ts";

test("module identities normalize to project-relative paths", () => {
  const root = resolve("fixture-project");
  assert.equal(
    normalizeProjectModule(root, join(root, "src", "surfaces", "PublicDemoApp.tsx") + "?v=1"),
    "src/surfaces/PublicDemoApp.tsx",
  );
});

test("public boundary rejects facilitator, preparation, and legacy modules", () => {
  const root = resolve("fixture-project");
  const ids = [
    join(root, "src", "features", "decision-room", "DecisionRoomApp.tsx"),
    join(root, "src", "features", "facilitator-preparation", "FacilitatedSessionApp.tsx"),
    join(root, "src", "lib", "hr-paysim", "preparation", "types.ts"),
    join(root, "src", "components", "hr-paysim", "PrototypePaySimApp.tsx"),
    join(root, "src", "components", "hr-paysim", "RosterDiagnosticApp.tsx"),
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
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test tests/hr-paysim/public-bundle-boundary.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement detector and build plugin**

Create `public-bundle-boundary.ts`:

```ts
import { relative } from "node:path";
import type { Plugin } from "vite";
import type { BuildSurface } from "../src/lib/hr-paysim/access/buildSurface.ts";

const prefixes = ["src/features/facilitator-preparation/", "src/lib/hr-paysim/preparation/"];
const exact = new Set([
  "src/App.tsx",
  "src/components/hr-paysim/PrototypePaySimApp.tsx",
  "src/components/hr-paysim/RosterDiagnosticApp.tsx",
  "src/routes/hr-paysim/appRoute.ts",
]);

export function normalizeProjectModule(root: string, moduleId: string): string {
  return relative(root, moduleId.split("?")[0] ?? moduleId).replaceAll("\\", "/");
}

export function findForbiddenPublicModules(root: string, moduleIds: readonly string[]): string[] {
  return [...new Set(moduleIds
    .map((id) => normalizeProjectModule(root, id))
    .filter((path) => exact.has(path) || prefixes.some((prefix) => path.startsWith(prefix))))].sort();
}

export function publicBundleBoundaryPlugin(root: string, surface: BuildSurface): Plugin {
  return {
    name: "paysim-public-bundle-boundary",
    apply: "build",
    generateBundle(_options, bundle) {
      const moduleIds = Object.values(bundle)
        .filter((output) => output.type === "chunk")
        .flatMap((output) => Object.keys(output.modules));
      const modules = [...new Set(moduleIds
        .map((id) => normalizeProjectModule(root, id))
        .filter((path) => !path.startsWith("../")))].sort();
      if (surface === "PUBLIC_DEMO") {
        const forbidden = findForbiddenPublicModules(root, moduleIds);
        if (forbidden.length) this.error(`PUBLIC_DEMO contains forbidden modules:\n${forbidden.join("\n")}`);
      }
      this.emitFile({
        type: "asset",
        fileName: "paysim-module-manifest.json",
        source: JSON.stringify({ surface, modules }, null, 2),
      });
    },
  };
}
```

- [ ] **Step 4: Configure alias, distinct builds, scripts, and noindex**

Replace `vite.config.ts`:

```ts
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { publicBundleBoundaryPlugin } from "./scripts/public-bundle-boundary.ts";
import { resolveBuildSurface } from "./src/lib/hr-paysim/access/buildSurface.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig(({ mode }) => {
  const surface = resolveBuildSurface(mode);
  const entry = surface === "FACILITATOR_LOCAL"
    ? "src/surfaces/FacilitatorLocalApp.tsx"
    : "src/surfaces/PublicDemoApp.tsx";
  return {
    plugins: [react(), publicBundleBoundaryPlugin(root, surface)],
    resolve: { alias: { "@paysim-surface-entry": resolve(root, entry) } },
    build: {
      outDir: surface === "FACILITATOR_LOCAL" ? "dist/facilitator-local" : "dist/public",
    },
  };
});
```

Set these package scripts:

```json
"dev": "vite --mode public-demo --host 127.0.0.1",
"dev:facilitator": "vite --mode facilitator-local --host 127.0.0.1",
"build": "vite build --mode public-demo",
"build:facilitator": "vite build --mode facilitator-local",
"start": "vite preview --mode public-demo --host 127.0.0.1",
"start:facilitator": "vite preview --mode facilitator-local --host 127.0.0.1"
```

Add inside `index.html <head>`:

```html
<meta name="robots" content="noindex,nofollow" />
```

- [ ] **Step 5: Verify GREEN with both builds**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/public-bundle-boundary.test.ts
npm.cmd run typecheck
npm.cmd run build
npm.cmd run build:facilitator
Get-Content -Raw dist\public\paysim-module-manifest.json
Get-Content -Raw dist\facilitator-local\paysim-module-manifest.json
```

Expected: public manifest has `PUBLIC_DEMO` and no forbidden path; local manifest has `FACILITATOR_LOCAL` and includes `FacilitatedSessionApp.tsx`.

- [ ] **Step 6: Checkpoint**

Run `git diff --check` and `git status --short`. Do not stage or commit.

---

### Task 4: Add static route-exposure and privacy evidence

**Files:**
- Create: `scripts/verify-route-exposure.mjs`
- Create: `tests/hr-paysim/privacy-lifecycle-audit.test.ts`
- Modify: `tests/hr-paysim/facilitator-preparation-ui.test.ts`

**Interfaces:**
- Consumes: Task 3 public manifest.
- Produces: CLI verification independent of browser route checks and static privacy evidence independent of route access.

- [ ] **Step 1: Write the privacy audit**

Create `privacy-lifecycle-audit.test.ts`:

```ts
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
  assert.match(owners[0] ?? "", /setRawPaste\("")/);
  assert.doesNotMatch(owners[2] ?? "", /rawPaste|confirmPiiColumnStripping/);
});
```

- [ ] **Step 2: Run the fresh focused audit**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/privacy-lifecycle-audit.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts
```

Expected: pass against existing P11-B0 behavior. If it fails, inspect the exact owner and change product logic only for a proven persistence/emission violation.

- [ ] **Step 3: Create the public verifier**

Create `verify-route-exposure.mjs`:

```js
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const outDir = "dist/public";
const html = readFileSync(join(outDir, "index.html"), "utf8");
const manifest = JSON.parse(readFileSync(join(outDir, "paysim-module-manifest.json"), "utf8"));
const fail = (message) => { throw new Error(message); };

if (!/<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["']\s*\/?>/i.test(html)) {
  fail("public HTML is missing noindex,nofollow");
}
if (/href=["'][^"']*\/hr-paysim\/session(?:\/new)?/i.test(html)) {
  fail("public HTML advertises a facilitator route");
}
if (manifest.surface !== "PUBLIC_DEMO") fail(`unexpected surface: ${manifest.surface}`);

const forbidden = manifest.modules.filter((path) =>
  path === "src/App.tsx"
  || path === "src/routes/hr-paysim/appRoute.ts"
  || path === "src/components/hr-paysim/PrototypePaySimApp.tsx"
  || path === "src/components/hr-paysim/RosterDiagnosticApp.tsx"
  || path.startsWith("src/features/facilitator-preparation/")
  || path.startsWith("src/lib/hr-paysim/preparation/")
);
if (forbidden.length) fail(`forbidden public modules:\n${forbidden.join("\n")}`);

function filesUnder(path) {
  return statSync(path).isDirectory()
    ? readdirSync(path).flatMap((entry) => filesUnder(join(path, entry)))
    : [path];
}
const secrets = filesUnder("src")
  .filter((path) => /\.(ts|tsx|js|jsx)$/.test(path))
  .flatMap((path) => {
    const matches = readFileSync(path, "utf8").match(/VITE_[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD)[A-Z0-9_]*/g);
    return matches ? matches.map((match) => `${path}: ${match}`) : [];
  });
if (secrets.length) fail(`client secret-like contracts:\n${secrets.join("\n")}`);

console.log("[OK] public noindex, link, module, and client-secret checks passed");
```

- [ ] **Step 4: Verify the public output**

Run:

```powershell
npm.cmd run build
node scripts/verify-route-exposure.mjs
git diff --check
git status --short
```

Expected: verifier prints `[OK]`; no staged files or commit.

---

### Task 5: Split browser QA by surface and prove no roster emission

**Files:**
- Modify: `scripts/qa-decision-room.mjs`

**Interfaces:**
- Consumes: `--surface=public` or `--surface=facilitator-local`.
- Produces: separate JSON evidence for public route blocking and local privacy/lifecycle behavior.

- [ ] **Step 1: Add the CLI contract and verify its failure**

After the Playwright import, add:

```js
const surfaceArgument = process.argv.find((value) => value.startsWith("--surface="));
const qaSurface = surfaceArgument?.slice("--surface=".length) ?? "public";
if (!["public", "facilitator-local"].includes(qaSurface)) {
  throw new Error(`UNKNOWN_QA_SURFACE: ${qaSurface}`);
}
```

Run: `node scripts/qa-decision-room.mjs --surface=invalid`

Expected: FAIL immediately with `UNKNOWN_QA_SURFACE: invalid`.

- [ ] **Step 2: Make facilitator QA conditional and collect network evidence**

Add `qaSurface` and `externalRosterEmissions: []` to the result object.

At the start of `runFacilitatorQa`, add:

```js
if (qaSurface !== "facilitator-local") return;
```

After creating `facilitatorPage`, add:

```js
const rosterLeakPattern = /actual_|73000000|manager_private|team_private|person@example\.com/;
facilitatorPage.on("request", (request) => {
  const payload = `${request.url()}\n${request.postData() ?? ""}`;
  if (rosterLeakPattern.test(payload)) {
    result.externalRosterEmissions.push({ method: request.method(), url: request.url() });
  }
});
```

Before closing its context, add:

```js
if (result.externalRosterEmissions.length) {
  throw new Error(
    "facilitator roster data entered a network request: "
      + JSON.stringify(result.externalRosterEmissions),
  );
}
```

- [ ] **Step 3: Add public direct-route blocking**

Add:

```js
async function inspectPublicBlockedRoutes(viewport) {
  if (qaSurface !== "public") return;
  const blockedContext = await browser.newContext({ viewport });
  const blockedPage = await blockedContext.newPage();
  for (const path of ["/hr-paysim/session/new", "/hr-paysim/session"]) {
    await blockedPage.goto(origin + path, { waitUntil: "networkidle" });
    const unavailable = await blockedPage.locator('[data-route-unavailable="true"]').isVisible();
    const textareaCount = await blockedPage.locator("textarea").count();
    const body = await blockedPage.locator("body").innerText();
    if (!unavailable
      || textareaCount !== 0
      || /row_id|role_group|base_salary_krw|진행 중인 세션/.test(body)) {
      throw new Error(`public route did not fail closed: ${path}`);
    }
  }
  await blockedContext.close();
  result.publicFacilitatorRoutesBlocked = true;
}
```

Immediately after the existing facilitator viewport loop in the main `try`, add:

```js
await inspectPublicBlockedRoutes(viewports[0]);
```

Keep the existing public four-screen assertions active in both modes: the local entry intentionally keeps the synthetic preview for rehearsal.

- [ ] **Step 4: Run public QA freshly**

```powershell
npm.cmd run build
$publicServer = Start-Process -FilePath npm.cmd -ArgumentList @("run","start","--","--port","4173") -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 4
$env:HR_PAYSIM_URL = "http://127.0.0.1:4173/hr-paysim/decision-room-preview"
node scripts/qa-decision-room.mjs --surface=public
Stop-Process -Id $publicServer.Id
Remove-Item Env:HR_PAYSIM_URL
```

Expected: `errors: []`, `publicFacilitatorRoutesBlocked: true`, complete four-screen viewports, empty storage, and no console issue.

- [ ] **Step 5: Run facilitator-local QA freshly**

```powershell
npm.cmd run build:facilitator
$facilitatorServer = Start-Process -FilePath npm.cmd -ArgumentList @("run","start:facilitator","--","--port","4174") -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 4
$env:HR_PAYSIM_URL = "http://127.0.0.1:4174/hr-paysim/decision-room-preview"
node scripts/qa-decision-room.mjs --surface=facilitator-local
Stop-Process -Id $facilitatorServer.Id
Remove-Item Env:HR_PAYSIM_URL
```

Expected: `errors: []`; PII consent, value blocking, raw clearing, real-input session, reload failure, explicit end, empty storage, and `externalRosterEmissions: []`.

- [ ] **Step 6: Checkpoint**

Run `git diff --check` and `git status --short`. Do not stage or commit.

---

### Task 6: Fresh verification, exact staging, one commit, and review

**Files:**
- Verify: every Task 11 file from Tasks 1–5.
- Exclude: Task 12, deployment, and pilot artifacts.

**Interfaces:**
- Produces: fresh evidence and one Task 11 product commit.

- [ ] **Step 1: Run fresh static verification**

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/verify-route-exposure.mjs
npm.cmd run build:facilitator
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

Expected: every command exits 0. Record the new test count; do not reuse 206 or any earlier result.

- [ ] **Step 2: Run both browser modes again**

Repeat Task 5 Steps 4 and 5 after Step 1.

Expected: both JSON outputs have `errors: []` and no console, overflow, storage, URL, or roster-emission failure.

- [ ] **Step 3: Inspect exact scope**

```powershell
git status --short
git diff --stat
git diff -- src/lib/hr-paysim/calculations.ts src/features/confirmed-pay-differences/salaryTenurePlot.ts
```

Expected: the last command is empty; no calculations, coordinates, fixtures, or Task 12 paths changed.

- [ ] **Step 4: Stage only Task 11 files**

```powershell
git add -- index.html package.json vite.config.ts scripts/public-bundle-boundary.ts scripts/verify-route-exposure.mjs scripts/qa-decision-room.mjs src/main.tsx src/surface-entry.d.ts src/surfaces/PublicDemoApp.tsx src/surfaces/FacilitatorLocalApp.tsx src/lib/hr-paysim/access/buildSurface.ts src/lib/hr-paysim/access/routePolicy.ts src/lib/hr-paysim/copy/founderCopy.ts src/features/route-access/UnavailableSurface.tsx src/features/route-access/routeAccess.css tests/hr-paysim/route-access.test.ts tests/hr-paysim/surface-entry-boundary.test.ts tests/hr-paysim/public-bundle-boundary.test.ts tests/hr-paysim/privacy-lifecycle-audit.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts
git diff --cached --name-only
git diff --cached --check
```

Expected: only listed Task 11 files are staged. If TDD proved another file necessary, stop and reconcile it with the design before adding it.

- [ ] **Step 5: Create the single product commit**

Run:

```powershell
git commit -m "feat: isolate public demo and verify privacy"
git status --short --branch
```

Expected: commit succeeds and worktree is clean.

- [ ] **Step 6: Request independent review**

Use `superpowers:requesting-code-review` against:

- design commit `e73193a`;
- this plan commit;
- the final product commit;
- both module manifests;
- fresh static output;
- both browser QA outputs.

Review must check actual build-time exclusion, privacy independence from route access, no Task 12/deployment/pilot expansion, and exact commit scope. Apply `superpowers:receiving-code-review` before any review fix.

- [ ] **Step 7: Stop**

Do not start Task 12, deploy a facilitator surface, or run/claim PILOT-1.