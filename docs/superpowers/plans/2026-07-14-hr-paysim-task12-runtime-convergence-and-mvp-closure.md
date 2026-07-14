# HR PaySim Task 12 Runtime Convergence And MVP Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/hr-paysim/demo` the sole public four-screen Decision Room route, remove the proven obsolete nine-step production runtime, and publish an evidence-backed pre-pilot MVP documentation package.

**Architecture:** Keep the current build-time split between `PublicDemoApp` and `FacilitatorLocalApp`, while both compose the same `PaySimSessionProvider` and `DecisionRoomApp`. Converge executable route policy on `/demo`, `/session/new`, and `/session`; then delete only the legacy source cluster that is unreachable from both entries and not required by canonical type imports. Verify the canonical behavior before and after cleanup, then write documentation from the fresh final outputs.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Node test runner, Playwright, Python governance verifier.

## Global Constraints

- Authority: `docs/diagnostic-product-adapter.md`, the Adapter-pinned Constitution baseline `790eb99`, and `docs/superpowers/specs/2026-07-14-hr-paysim-task12-runtime-convergence-and-mvp-closure-design.md`.
- Classification: `PRODUCT_IMPLEMENTATION`.
- Preserve DP-01 through DP-05 and the current four-screen evidence → review → rule → result sequence.
- Do not change chart coordinates, calculations, copy, decision state, session lifecycle, or screen order.
- Do not add deployment, authentication, persistence, telemetry, market data, salary recommendations, or self-service behavior.
- Do not delete `prototypes/**`, historical design documents, canonical roster/finding types, or `correctionFloorKRW` while canonical imports remain.
- `PILOT-1` is not run in this task. Every portfolio document must state the evidence limitation without implying participant validation.
- All behavior changes use RED → GREEN → REFACTOR; each RED test must be observed failing for the intended reason.
- Public and facilitator browser QA must use newly started servers and current artifacts; previous 250-test or QA results are not completion evidence.

---

### Task 1: Converge The Supported Route Contract

**Files:**
- Modify: `tests/hr-paysim/route-access.test.ts`
- Modify: `tests/hr-paysim/decision-room-session.test.ts`
- Modify: `tests/hr-paysim/qa-evidence-policy.test.ts`
- Modify: `src/lib/hr-paysim/access/routePolicy.ts`
- Modify: `src/lib/hr-paysim/contracts/demoContract.ts`
- Modify: `src/surfaces/PublicDemoApp.tsx`
- Modify: `src/surfaces/FacilitatorLocalApp.tsx`
- Modify: `src/features/route-access/UnavailableSurface.tsx`
- Modify: `scripts/qa-evidence-policy.mjs`
- Modify: `scripts/qa-decision-room.mjs`

**Interfaces:**
- Consumes: `resolveSurfaceRoute(surface: BuildSurface, pathname: string): SurfaceRoute` and `DECISION_ROOM_DEMO_CONTRACT`.
- Produces: `SurfaceRoute = "demo" | "facilitator_preparation" | "facilitator_session" | "unavailable"`; canonical public path `/hr-paysim/demo`.

- [ ] **Step 1: Write failing route-policy tests**

Replace the preview assertions in `tests/hr-paysim/route-access.test.ts` with:

```ts
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
```

In `tests/hr-paysim/decision-room-session.test.ts`, remove the `appRoute.ts` import and obsolete route-switching test, and change the contract assertion to:

```ts
assert.equal(DECISION_ROOM_DEMO_CONTRACT.route, "/hr-paysim/demo");
```

In `tests/hr-paysim/qa-evidence-policy.test.ts`, use `/demo` as the allowed literal and expect preview, facilitator, and unknown links to be blocked:

```ts
const source = `
  <a href="/hr-paysim/demo">allowed</a>
  <a href="/hr-paysim/session/new">blocked direct</a>
  <a href={'/hr-paysim/decision-room-preview'}>blocked preview</a>
  <a href={"/hr-paysim/unknown"}>blocked unknown</a>
  <a href={enabled ? "/hr-paysim/session" : "/hr-paysim/demo"}>conditional</a>
  <a href="https://example.com/hr-paysim/session">external</a>
`;
assert.deepEqual(findBlockedLiteralPaySimHrefs(source), [
  "/hr-paysim/session/new",
  "/hr-paysim/decision-room-preview",
  "/hr-paysim/unknown",
  "/hr-paysim/session",
]);
```

- [ ] **Step 2: Run focused tests and observe RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/route-access.test.ts tests/hr-paysim/decision-room-session.test.ts tests/hr-paysim/qa-evidence-policy.test.ts
```

Expected: FAIL because `/demo` currently resolves to `unavailable`, the demo contract still names `/decision-room-preview`, and the link policy still treats `/demo` as blocked.

- [ ] **Step 3: Implement the minimal canonical route change**

Change `SurfaceRoute` and `resolveSurfaceRoute` to:

```ts
export type SurfaceRoute =
  | "demo"
  | "facilitator_preparation"
  | "facilitator_session"
  | "unavailable";

export function resolveSurfaceRoute(
  surface: BuildSurface,
  pathname: string,
): SurfaceRoute {
  if (pathname === "/hr-paysim/demo") return "demo";
  if (surface === "FACILITATOR_LOCAL") {
    if (pathname === "/hr-paysim/session/new") return "facilitator_preparation";
    if (pathname === "/hr-paysim/session") return "facilitator_session";
  }
  return "unavailable";
}
```

In both surface entries, replace route comparisons against `"decision_room_preview"` with `"demo"`.

Change `DECISION_ROOM_DEMO_CONTRACT.route`, `UnavailableSurface`'s action link, `scripts/qa-decision-room.mjs`'s default URL, and the allowed path constant in `scripts/qa-evidence-policy.mjs` to `/hr-paysim/demo`.

Add `/hr-paysim/decision-room-preview`, `/hr-paysim/entry`, and `/hr-paysim/roster` to the public blocked-route browser loop in `scripts/qa-decision-room.mjs` so the removed contracts are checked through the rendered unavailable surface.

- [ ] **Step 4: Run focused tests and observe GREEN**

Run the same focused command from Step 2.

Expected: all selected tests pass with zero failures.

- [ ] **Step 5: Run route-adjacent regression tests**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/surface-entry-boundary.test.ts tests/hr-paysim/public-bundle-boundary.test.ts tests/hr-paysim/provider-session-ownership.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts
```

Expected: all selected tests pass; public entry remains free of facilitator and legacy imports.

- [ ] **Step 6: Commit route convergence**

```powershell
git add tests/hr-paysim/route-access.test.ts tests/hr-paysim/decision-room-session.test.ts tests/hr-paysim/qa-evidence-policy.test.ts src/lib/hr-paysim/access/routePolicy.ts src/lib/hr-paysim/contracts/demoContract.ts src/surfaces/PublicDemoApp.tsx src/surfaces/FacilitatorLocalApp.tsx src/features/route-access/UnavailableSurface.tsx scripts/qa-evidence-policy.mjs scripts/qa-decision-room.mjs
git commit -m "feat: converge HR PaySim decision-room routes"
```

---

### Task 2: Establish Fresh Pre-Cleanup Runtime Evidence

**Files:**
- Read: `dist/public/paysim-module-manifest.json`
- Read: `dist/facilitator-local/paysim-module-manifest.json`
- Read: browser QA JSON output

**Interfaces:**
- Consumes: the canonical route contract from Task 1.
- Produces: fresh pre-cleanup command outputs used as the behavioral baseline for Task 3 and summarized later in `25_algorithm_and_qa_appendix.md`.

- [ ] **Step 1: Run the complete automated baseline**

Run freshly:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run build:facilitator
node scripts/verify-route-exposure.mjs
node --experimental-strip-types scripts/verify-facilitator-privacy.ts
```

Expected: every command exits 0. Record the actual test count from `npm.cmd test`; do not reuse the previous 250-test count.

- [ ] **Step 2: Inspect both module manifests**

Run:

```powershell
Get-Content -Raw dist/public/paysim-module-manifest.json
Get-Content -Raw dist/facilitator-local/paysim-module-manifest.json
```

Expected: public manifest is `PUBLIC_DEMO` and contains no facilitator-preparation, workbook reader, `src/App.tsx`, or legacy components. Facilitator manifest is `FACILITATOR_LOCAL` and contains preparation/workbook owners but no legacy runtime entry.

- [ ] **Step 3: Run fresh public browser QA**

Start a current public server on port 5173 and run QA inside a `try/finally` block so the exact Node process is stopped:

```powershell
$node=(Get-Command node).Source
$public=Start-Process -FilePath $node -ArgumentList "node_modules/vite/bin/vite.js","--mode","public-demo","--host","127.0.0.1","--port","5173","--strictPort" -WorkingDirectory (Get-Location) -PassThru -WindowStyle Hidden
try {
  Start-Sleep -Seconds 3
  $env:HR_PAYSIM_URL="http://127.0.0.1:5173/hr-paysim/demo"
  node scripts/qa-decision-room.mjs --surface=public
  if ($LASTEXITCODE -ne 0) { throw "PUBLIC_QA_FAILED" }
} finally {
  Stop-Process -Id $public.Id -Force -ErrorAction SilentlyContinue
  Remove-Item Env:HR_PAYSIM_URL -ErrorAction SilentlyContinue
}
```

Expected: exit 0; all four screens pass at desktop and mobile viewports; preview, entry, roster, and facilitator routes show the unavailable surface; no console, storage, or link-policy errors.

- [ ] **Step 4: Run fresh facilitator browser QA**

Start the facilitator-local server using the same bounded process pattern:

```powershell
$node=(Get-Command node).Source
$facilitator=Start-Process -FilePath $node -ArgumentList "node_modules/vite/bin/vite.js","--mode","facilitator-local","--host","127.0.0.1","--port","5173","--strictPort" -WorkingDirectory (Get-Location) -PassThru -WindowStyle Hidden
try {
  Start-Sleep -Seconds 3
  $env:HR_PAYSIM_URL="http://127.0.0.1:5173/hr-paysim/demo"
  node scripts/qa-decision-room.mjs --surface=facilitator-local
  if ($LASTEXITCODE -ne 0) { throw "FACILITATOR_QA_FAILED" }
} finally {
  Stop-Process -Id $facilitator.Id -Force -ErrorAction SilentlyContinue
  Remove-Item Env:HR_PAYSIM_URL -ErrorAction SilentlyContinue
}
```

Expected: exit 0; synthetic demo and preparation/session lifecycle pass; local roster values do not enter URLs, storage, external requests, or visible raw-source remnants.

- [ ] **Step 5: Stop the QA server and confirm a clean tree**

Run:

```powershell
git status --short
```

Expected: no generated or product-source changes from the verification run.

---

### Task 3: Remove Only The Proven Legacy Production Runtime

**Files:**
- Create: `tests/hr-paysim/runtime-convergence.test.ts`
- Delete: `src/App.tsx`
- Delete: `src/components/hr-paysim/PaySimShell.tsx`
- Delete: `src/components/hr-paysim/PaySimStepper.tsx`
- Delete: `src/components/hr-paysim/PrototypePaySimApp.tsx`
- Delete: `src/components/hr-paysim/RosterDiagnosticApp.tsx`
- Delete: `src/components/hr-paysim/screens/index.tsx`
- Delete: `src/routes/hr-paysim/appRoute.ts`
- Delete: `src/routes/hr-paysim/router.ts`
- Delete: `src/routes/hr-paysim/stepRegistry.ts`
- Delete: `src/lib/hr-paysim/calculations.ts`
- Delete: `src/lib/hr-paysim/consent.ts`
- Delete: `src/lib/hr-paysim/copy.ts`
- Delete: `src/lib/hr-paysim/fixtures.ts`
- Delete: `src/lib/hr-paysim/memo.ts`
- Delete: `src/lib/hr-paysim/prototypeViewModel.ts`
- Delete: `src/lib/hr-paysim/recommendations.ts`
- Delete: `src/lib/hr-paysim/rosterDiagnosticViewModel.ts`
- Delete: `src/lib/hr-paysim/rosterParser.ts`
- Delete: `src/lib/hr-paysim/session.ts`
- Delete: `src/lib/hr-paysim/validation.ts`
- Delete: `scripts/qa-hr-paysim-step1.mjs`
- Modify: `src/lib/hr-paysim/domain.ts`
- Delete: `tests/hr-paysim/app-route.test.ts`
- Delete: `tests/hr-paysim/calculations.test.ts`
- Delete: `tests/hr-paysim/consent.test.ts`
- Delete: `tests/hr-paysim/copy.test.ts`
- Delete: `tests/hr-paysim/memo.test.ts`
- Delete: `tests/hr-paysim/prototype-memo.test.ts`
- Delete: `tests/hr-paysim/prototype-view-model.test.ts`
- Delete: `tests/hr-paysim/roster-diagnostic-view-model.test.ts`
- Delete: `tests/hr-paysim/roster-parser.test.ts`
- Delete: `tests/hr-paysim/session.test.ts`
- Delete: `tests/hr-paysim/validation.test.ts`

**Interfaces:**
- Consumes: two green runtime manifests and the pre-cleanup E2E baseline from Task 2.
- Produces: no alternate runtime selector or nine-step production contract; canonical `domain.ts` begins with `StructuralFindingType` and retains all roster/finding/risk types.

- [ ] **Step 1: Prove the candidate cluster has no canonical reverse imports**

Run:

```powershell
rg -n 'PrototypePaySimApp|RosterDiagnosticApp|PaySimShell|PaySimStepper|resolveHrPaySimSurface|PAY_SIM_STEPS|createInitialSession|createPrototypePresentation|createRosterDiagnosticViewModel|parseRosterPaste|calculateDiagnosis|recommendScenarios|validateQuickInput' src tests scripts
```

Expected: matches are limited to the listed legacy source cluster, its listed legacy tests, and boundary scripts/tests that intentionally forbid reintroduction. If any canonical feature, surface, provider, preparation, session reducer, theme, report, or current QA module imports a candidate, stop and remove that file from the deletion list.

- [ ] **Step 2: Write the failing runtime-convergence test**

Create `tests/hr-paysim/runtime-convergence.test.ts`:

```ts
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const removedRuntimeFiles = [
  "src/App.tsx",
  "src/components/hr-paysim/PrototypePaySimApp.tsx",
  "src/components/hr-paysim/RosterDiagnosticApp.tsx",
  "src/components/hr-paysim/PaySimShell.tsx",
  "src/components/hr-paysim/PaySimStepper.tsx",
  "src/components/hr-paysim/screens/index.tsx",
  "src/routes/hr-paysim/appRoute.ts",
  "src/routes/hr-paysim/router.ts",
  "src/routes/hr-paysim/stepRegistry.ts",
  "src/lib/hr-paysim/session.ts",
  "src/lib/hr-paysim/prototypeViewModel.ts",
  "src/lib/hr-paysim/rosterDiagnosticViewModel.ts",
] as const;

test("obsolete alternate runtime files are absent", () => {
  assert.deepEqual(
    removedRuntimeFiles.filter((path) => existsSync(path)),
    [],
  );
});

test("shared domain exposes canonical roster evidence without nine-step scenario types", () => {
  const source = readFileSync("src/lib/hr-paysim/domain.ts", "utf8");
  assert.doesNotMatch(
    source,
    /PaySimStep|QuickInputDraft|DiagnosisResult|ScenarioId|ScenarioRecommendation|CEIBand|CEDBand|PayInversionSeverity/,
  );
  assert.match(source, /export interface NormalizedRosterRow/);
  assert.match(source, /export interface StructuralFinding/);
  assert.match(source, /correctionFloorKRW\?: number/);
});
```

- [ ] **Step 3: Run the convergence test and observe RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/runtime-convergence.test.ts
```

Expected: FAIL listing the still-existing alternate runtime files and legacy scenario types.

- [ ] **Step 4: Delete the proven legacy cluster**

Delete exactly the source, script, and test files listed in this task. Do not delete `src/lib/hr-paysim/domain.ts`, `src/lib/hr-paysim/copy/forbiddenFounderTerms.ts`, current preparation modules, Decision Room modules, static prototypes, or current QA scripts.

In `src/lib/hr-paysim/domain.ts`, delete only the declarations from `PaySimStep` through `ScenarioRecommendation`. Keep the `FindingMetricSet` import and every declaration from `StructuralFindingType` onward unchanged, including `FindingRiskModel.correctionFloorKRW`.

- [ ] **Step 5: Run convergence and type checks and observe GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/runtime-convergence.test.ts
npm.cmd run typecheck
npm.cmd test
```

Expected: all commands exit 0; the new convergence tests pass; the full suite reports zero failures with a newly reduced test count caused only by removal of obsolete contracts.

- [ ] **Step 6: Rebuild both surfaces and compare manifests**

Run:

```powershell
npm.cmd run build
npm.cmd run build:facilitator
node scripts/verify-route-exposure.mjs
node --experimental-strip-types scripts/verify-facilitator-privacy.ts
```

Expected: all commands exit 0. The supported runtime module sets remain equivalent to the pre-cleanup manifests except for route-name/source edits; no canonical runtime module disappears.

- [ ] **Step 7: Commit the proven cleanup**

Stage only the files listed in Task 3 and commit:

```powershell
git commit -m "refactor: remove obsolete HR PaySim runtime"
```

---

### Task 4: Create The Honest MVP Evidence Package

**Files:**
- Create: `docs/hr-paysim/22_methodology_note.md`
- Create: `docs/hr-paysim/23_sample_founder_result.md`
- Create: `docs/hr-paysim/24_privacy_and_non_claims.md`
- Create: `docs/hr-paysim/25_algorithm_and_qa_appendix.md`

**Interfaces:**
- Consumes: final canonical code, sample fixture, route matrix, manifest contents, actual command outputs, screenshots, and governance status.
- Produces: a portfolio evidence package that labels synthetic evidence and states `PILOT-1: NOT RUN`.

- [ ] **Step 1: Write methodology assertions before documentation**

Create `tests/hr-paysim/portfolio-evidence.test.ts` with file-existence and required/non-claim checks:

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name: string) => readFileSync(`docs/hr-paysim/${name}`, "utf8");

test("portfolio evidence labels synthetic and unrun pilot evidence", () => {
  const files = [
    read("22_methodology_note.md"),
    read("23_sample_founder_result.md"),
    read("24_privacy_and_non_claims.md"),
    read("25_algorithm_and_qa_appendix.md"),
  ];
  const combined = files.join("\n");
  assert.match(combined, /synthetic|합성/);
  assert.match(combined, /PILOT-1:\s*NOT RUN/);
  assert.match(combined, /market benchmark|시장 벤치마크/);
  assert.match(combined, /salary recommendation|연봉 추천/);
  assert.doesNotMatch(combined, /pilot (?:passed|validated)|파일럿 (?:통과|검증 완료)/i);
});

test("QA appendix records both build surfaces and all final gates", () => {
  const appendix = read("25_algorithm_and_qa_appendix.md");
  for (const required of [
    "PUBLIC_DEMO",
    "FACILITATOR_LOCAL",
    "npm.cmd run lint",
    "npm.cmd test",
    "npm.cmd run typecheck",
    "npm.cmd run build",
    "npm.cmd run build:facilitator",
    "qa-decision-room.mjs",
    "verify-route-exposure.mjs",
    "verify-facilitator-privacy.ts",
    "verify_diagnostic_governance.py",
    "git diff --check",
  ]) assert.match(appendix, new RegExp(required.replaceAll(".", "\\.")));
});
```

- [ ] **Step 2: Run the portfolio test and observe RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/portfolio-evidence.test.ts
```

Expected: FAIL with `ENOENT` because documents 22–25 do not exist.

- [ ] **Step 3: Write documents 22–24 from canonical contracts**

Write:

- `22_methodology_note.md`: comparable hierarchy `same role → level → relevant experience → company tenure`, observed/calculated/confirmed distinctions, deterministic fixture rules, review gates, limits, and no market/salary recommendation.
- `23_sample_founder_result.md`: label the Product Engineer data as synthetic; describe the fixed 6-person comparison, employee labels A/B, relevant-experience context, confirmed KRW difference, selected explanation basis, company rule, owner/event, and non-claims using values read from the final fixture and report.
- `24_privacy_and_non_claims.md`: local file read, column consent, memory-only lifecycle, no URL/storage/network/telemetry emission, public build exclusion, no authentication/deployment attestation, no market benchmark, no salary recommendation, and `PILOT-1: NOT RUN`.

Do not copy historical CEI/CED or prototype claims into these documents.

- [ ] **Step 4: Write the QA appendix from fresh outputs**

Write `25_algorithm_and_qa_appendix.md` with:

- final commit/branch lineage and route matrix;
- public and facilitator manifest boundary summary;
- actual full-suite test count from this task;
- every final command, exit status, and important observed count;
- browser viewports and screenshot paths produced by current QA;
- before/after cleanup equivalence statement limited to verified behaviors;
- known limitations: localhost-only, refresh clears session, no deployment, no external access attestation, no market data, no pilot evidence;
- exact line `PILOT-1: NOT RUN`.

- [ ] **Step 5: Run portfolio and copy-governance tests and observe GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/portfolio-evidence.test.ts tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/founder-copy-scanner-boundary.test.ts
npm.cmd run lint
```

Expected: all selected tests and lint pass with zero failures.

- [ ] **Step 6: Commit evidence documents**

```powershell
git add docs/hr-paysim/22_methodology_note.md docs/hr-paysim/23_sample_founder_result.md docs/hr-paysim/24_privacy_and_non_claims.md docs/hr-paysim/25_algorithm_and_qa_appendix.md tests/hr-paysim/portfolio-evidence.test.ts
git commit -m "docs: record HR PaySim MVP evidence"
```

---

### Task 5: Run Final Verification And Independent Review

**Files:**
- Modify only if a failing verification or actionable review finding requires a focused TDD fix.
- Update: `docs/hr-paysim/25_algorithm_and_qa_appendix.md` only when final evidence differs from its recorded values.

**Interfaces:**
- Consumes: the completed route, cleanup, and documentation commits.
- Produces: fresh final evidence and an independently reviewed Task 12 branch ready for user-directed push/PR.

- [ ] **Step 1: Run the complete non-browser verification set freshly**

Run:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run build:facilitator
node scripts/verify-route-exposure.mjs
node --experimental-strip-types scripts/verify-facilitator-privacy.ts
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

Expected: every command exits 0 with zero test failures and no diff-check output.

- [ ] **Step 2: Run fresh public browser QA**

Run:

```powershell
$node=(Get-Command node).Source
$public=Start-Process -FilePath $node -ArgumentList "node_modules/vite/bin/vite.js","--mode","public-demo","--host","127.0.0.1","--port","5173","--strictPort" -WorkingDirectory (Get-Location) -PassThru -WindowStyle Hidden
try {
  Start-Sleep -Seconds 3
  $env:HR_PAYSIM_URL="http://127.0.0.1:5173/hr-paysim/demo"
  node scripts/qa-decision-room.mjs --surface=public
  if ($LASTEXITCODE -ne 0) { throw "PUBLIC_QA_FAILED" }
} finally {
  Stop-Process -Id $public.Id -Force -ErrorAction SilentlyContinue
  Remove-Item Env:HR_PAYSIM_URL -ErrorAction SilentlyContinue
}
```

Expected: exit 0 with the canonical four-screen result, blocked obsolete/public-facilitator routes, zero console issues, and zero browser-storage writes.

- [ ] **Step 3: Run fresh facilitator browser QA**

Run:

```powershell
$node=(Get-Command node).Source
$facilitator=Start-Process -FilePath $node -ArgumentList "node_modules/vite/bin/vite.js","--mode","facilitator-local","--host","127.0.0.1","--port","5173","--strictPort" -WorkingDirectory (Get-Location) -PassThru -WindowStyle Hidden
try {
  Start-Sleep -Seconds 3
  $env:HR_PAYSIM_URL="http://127.0.0.1:5173/hr-paysim/demo"
  node scripts/qa-decision-room.mjs --surface=facilitator-local
  if ($LASTEXITCODE -ne 0) { throw "FACILITATOR_QA_FAILED" }
} finally {
  Stop-Process -Id $facilitator.Id -Force -ErrorAction SilentlyContinue
  Remove-Item Env:HR_PAYSIM_URL -ErrorAction SilentlyContinue
}
```

Expected: exit 0 with synthetic and local-file flows, zero external roster emissions, zero storage writes, and the same four-screen behavior as the pre-cleanup baseline.

- [ ] **Step 4: Reconcile the QA appendix**

Compare the final command outputs, test count, manifest modules, viewport observations, screenshot paths, and commit SHA with `25_algorithm_and_qa_appendix.md`. If any value differs, update the appendix and rerun `portfolio-evidence.test.ts`, lint, and `git diff --check` before committing the evidence correction.

- [ ] **Step 5: Request independent code review**

Review against:

- the Task 12 design and this plan;
- route exposure and public bundle isolation;
- privacy lifecycle and non-claims;
- legacy deletion proof and preserved canonical imports;
- documentation accuracy relative to command outputs.

Expected: findings are reported by severity with exact files/lines. Do not treat “no review response” as approval.

- [ ] **Step 6: Resolve actionable findings with TDD and rerun final gates**

For each product-code finding, first add a focused failing test, observe RED, implement the minimal correction, observe GREEN, then rerun Step 1 and the affected browser QA. Documentation-only factual corrections require the portfolio test and full final verification rerun.

- [ ] **Step 7: Confirm the final branch state**

Run:

```powershell
git status -sb
git log --oneline --decorate origin/main..HEAD
git diff --stat origin/main...HEAD
```

Expected: clean worktree; only Task 12 design, plan, route convergence, proven legacy cleanup, and evidence-package commits are ahead of `origin/main`. Stop for user direction before push, PR, merge, deployment, pilot, or any next task.
