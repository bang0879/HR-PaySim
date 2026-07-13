# HR PaySim P11-B0 Facilitator Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the minimum local/private Product Engineer facilitator preparation, PII fail-closed handling, real-input session handoff, and in-memory lifecycle required before PILOT-1.

**Architecture:** A pure preparation model wraps the existing roster parser and deterministic theme pipeline. A dedicated facilitator screen owns raw text only until a safe all-or-nothing parse, then hands a cloned `START_SESSION` payload to the existing provider through one local session shell. The four-screen view model derives factual copy from the current session and keeps the synthetic preview contract separate.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Node test runner, Playwright, existing HR PaySim deterministic engine and reducer.

## Global Constraints

- Work only in `C:\tmp\hr-paysim-facilitated-decision-room` on `codex/facilitated-decision-room`; do not create a worktree or branch.
- Follow `docs/superpowers/specs/2026-07-13-hr-paysim-p11-b0-facilitator-preparation-design.md` and `docs/diagnostic-product-adapter.md`.
- Runtime scope is local/private and Product Engineer-only.
- Do not add Platform Engineer, GTM, Designer clean-state, Task 10, public access control, deployment policy, learning-log storage, telemetry, or network transmission.
- Do not estimate market salary, a recommended salary, attrition, legal exposure, employee intent, or the correct salary for an individual.
- Raw paste never enters provider state, URLs, browser storage, telemetry, requests, export, or logs.
- Prohibited columns require explicit current-paste consent; any row-level PII, unsupported role, or malformed required row blocks the entire start.
- Safe errors contain one-based source line numbers and issue types only; never rejected values or system row IDs.
- The existing four screens, calculation semantics, state invalidation, and Task 9 synthetic preview remain intact.
- Use TDD for every production change. Record fresh RED and GREEN output; do not reuse Task 9 results.
- Keep all P11-B0 product files uncommitted until the final verification step. Commit the exact scoped product change once with `feat: add Product Engineer facilitator preparation`.

## File Structure

### Create

- `src/lib/hr-paysim/preparation/types.ts` — safe preparation, preview, and session-draft contracts.
- `src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts` — all-or-nothing input policy and safe display model.
- `src/lib/hr-paysim/preparation/createProductEngineerSessionDraft.ts` — detector/theme/selection handoff and support gate.
- `src/lib/hr-paysim/presentation/createEmployeeLabels.ts` — shared session-local employee labeling.
- `src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx` — paste, consent, blocked, and confirmation UI.
- `src/features/facilitator-preparation/FacilitatedSessionApp.tsx` — preparation/session shell, history path, unload warning, and no-session state.
- `src/features/facilitator-preparation/facilitatorPreparation.css` — bounded preparation styles.
- `tests/hr-paysim/facilitator-preparation-model.test.ts` — pure input policy and session-draft tests.
- `tests/hr-paysim/facilitator-preparation-ui.test.ts` — source ownership, route, label, and lifecycle contracts.
- `tests/hr-paysim/decision-room-real-input.test.ts` — non-fixture factual-copy and pending-state tests.

### Modify

- `src/lib/hr-paysim/rosterParser.ts` — structured safe issues and accepted-row source line metadata.
- `src/features/decision-room/decisionRoomViewModel.ts` — shared labels and real-input factual copy.
- `src/features/decision-room/DecisionRoomApp.tsx` — mode-specific sample label and optional end callback.
- `src/routes/hr-paysim/appRoute.ts` — local preparation and active-session surfaces.
- `src/App.tsx` — mount one provider/session shell for both facilitator routes.
- `scripts/qa-decision-room.mjs` — local preparation, privacy, lifecycle, and real-input browser assertions.
- Existing parser, route, UI, session, and copy tests only where their exact contracts change.

---

### Task 1: Add Structured Parser Evidence And All-Or-Nothing Preparation

**Files:**
- Create: `src/lib/hr-paysim/preparation/types.ts`
- Create: `src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts`
- Modify: `src/lib/hr-paysim/rosterParser.ts`
- Test: `tests/hr-paysim/roster-parser.test.ts`
- Test: `tests/hr-paysim/facilitator-preparation-model.test.ts`

**Interfaces:**
- Consumes: `parseRosterPaste(rawText, options)` and `NormalizedRosterRow`.
- Produces:

```ts
export type RosterParseIssueCode = "PII_VALUE" | "MISSING_REQUIRED_FIELD";

export interface RosterParseIssue {
  sourceLineNumber: number;
  code: RosterParseIssueCode;
  valuePattern?: "email" | "phone" | "residentId" | "piiText";
}

export interface ParsedRosterRecord {
  sourceLineNumber: number;
  row: NormalizedRosterRow;
}

export type PreparationStatus =
  | "empty"
  | "needs_column_consent"
  | "blocked"
  | "ready_for_confirmation";

export type PreparationIssueCode =
  | RosterParseIssueCode
  | "UNSUPPORTED_ROLE"
  | "UNSUPPORTED_PRODUCT_ENGINEER_COMPARISON";

export interface SafePreparationIssue {
  sourceLineNumber?: number;
  code: PreparationIssueCode;
}

export interface PreparationPreviewRow {
  employeeLabel: string;
  roleGroup: "Product Engineer";
  salaryKRW: number;
  tenureMonths?: number;
  title?: string;
  levelLabel?: string;
  documentedException: boolean;
}

export interface ProductEngineerSessionDraft {
  rows: NormalizedRosterRow[];
  themes: StructuralTheme[];
  selection: ReviewSubjectSelection;
  activeThemeId: string;
}

export interface ProductEngineerPreparationResult {
  status: PreparationStatus;
  prohibitedColumnHeaders: string[];
  issues: SafePreparationIssue[];
  previewRows: PreparationPreviewRow[];
  rows: NormalizedRosterRow[];
  draft?: ProductEngineerSessionDraft;
  shouldClearRaw: boolean;
}

export function prepareProductEngineerRoster(
  rawText: string,
  options?: { confirmPiiColumnStripping?: boolean },
): ProductEngineerPreparationResult;

export function createEmptyPreparationResult(): ProductEngineerPreparationResult;
```

- [ ] **Step 1: Extend parser tests with safe structured evidence**

Add tests proving that clean rows return `records`, row-level PII returns `issues`, error strings contain `입력 3행` rather than `row_002`, and serialized results exclude the rejected value.

```ts
test("row-level PII returns a safe line issue without row IDs or values", () => {
  const result = parseRosterPaste(pasteWithPiiValue);
  assert.deepEqual(result.issues, [{
    sourceLineNumber: 3,
    code: "PII_VALUE",
    valuePattern: "email",
  }]);
  assert.equal(result.errors.some((item) => item.includes("입력 3행")), true);
  assert.equal(JSON.stringify(result).includes("row_002"), false);
  assert.equal(JSON.stringify(result).includes("person@example.com"), false);
});
```

- [ ] **Step 2: Run the focused parser test and confirm RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/roster-parser.test.ts
```

Expected: FAIL because `issues` and `records` do not exist and current errors contain the row ID.

- [ ] **Step 3: Add minimal structured parser metadata**

Update `RosterParseResult` and the row loop:

```ts
const records: ParsedRosterRecord[] = [];
const issues: RosterParseIssue[] = [];

for (const [lineIndex, line] of lines.slice(1).entries()) {
  const sourceLineNumber = lineIndex + 2;
  // parse retained values without retaining them in the result
  if (piiPattern !== undefined) {
    issues.push({ sourceLineNumber, code: "PII_VALUE", valuePattern: piiPattern });
    errors.push(`입력 ${sourceLineNumber}행에 허용되지 않는 개인정보 형식이 있어 전체 입력을 다시 확인해야 합니다.`);
    continue;
  }
  if (row === undefined) {
    issues.push({ sourceLineNumber, code: "MISSING_REQUIRED_FIELD" });
    errors.push(`입력 ${sourceLineNumber}행에 필수 항목이 없습니다.`);
    continue;
  }
  rows.push(row);
  records.push({ sourceLineNumber, row });
}
```

Return empty `records` and `issues` in every early result.

- [ ] **Step 4: Run parser tests and confirm GREEN**

Run the focused command from Step 2.

Expected: all parser tests pass and no serialized result contains a rejected value or row ID from an error.

- [ ] **Step 5: Write failing preparation-policy tests**

Create tests for empty input, column consent, full block on one PII row, full block on one non-Product Engineer row, full block on one missing required field, and clean ready state.

```ts
test("one blocked row prevents every row from reaching confirmation", () => {
  const result = prepareProductEngineerRoster(pasteWithOnePiiRow);
  assert.equal(result.status, "blocked");
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.previewRows, []);
  assert.equal(result.shouldClearRaw, true);
  assert.deepEqual(result.issues.map((item) => item.sourceLineNumber), [3]);
});

test("a non-Product Engineer row blocks the whole pilot input", () => {
  const result = prepareProductEngineerRoster(mixedRolePaste);
  assert.equal(result.status, "blocked");
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.issues, [{ sourceLineNumber: 3, code: "UNSUPPORTED_ROLE" }]);
});
```

- [ ] **Step 6: Run the preparation-model test and confirm RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/facilitator-preparation-model.test.ts
```

Expected: FAIL because the preparation module does not exist.

- [ ] **Step 7: Implement the minimal all-or-nothing preparation policy**

Use parser `records` to preserve safe source line numbers. Return `needs_column_consent` before row analysis, map parser issues without values, append `UNSUPPORTED_ROLE` issues for any record whose `roleGroup !== "Product Engineer"`, and return no rows if any issue exists.

```ts
const blockingIssues: SafePreparationIssue[] = [
  ...parsed.issues.map(({ sourceLineNumber, code }) => ({ sourceLineNumber, code })),
  ...parsed.records
    .filter(({ row }) => row.roleGroup !== "Product Engineer")
    .map(({ sourceLineNumber }) => ({ sourceLineNumber, code: "UNSUPPORTED_ROLE" as const })),
];

if (blockingIssues.length > 0) {
  return {
    status: "blocked",
    prohibitedColumnHeaders: parsed.report.rejectedColumnHeaders,
    issues: blockingIssues,
    previewRows: [],
    rows: [],
    shouldClearRaw: blockingIssues.some((item) => item.code === "PII_VALUE"),
  };
}
```

Do not add detector or theme logic yet.

- [ ] **Step 8: Run focused model and parser tests and confirm GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/roster-parser.test.ts tests/hr-paysim/facilitator-preparation-model.test.ts
```

Expected: all focused tests pass.

- [ ] **Step 9: Checkpoint without committing**

Run `git diff --check` and `git status --short`. Keep the exact Task 1 files uncommitted for the final P11-B0 commit.

---

### Task 2: Build A Supported Product Engineer Session Draft

**Files:**
- Create: `src/lib/hr-paysim/preparation/createProductEngineerSessionDraft.ts`
- Create: `src/lib/hr-paysim/presentation/createEmployeeLabels.ts`
- Modify: `src/lib/hr-paysim/preparation/types.ts`
- Modify: `src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts`
- Modify: `src/features/decision-room/decisionRoomViewModel.ts`
- Test: `tests/hr-paysim/facilitator-preparation-model.test.ts`
- Test: `tests/hr-paysim/decision-room-real-input.test.ts`

**Interfaces:**

```ts
export type ProductEngineerSessionDraftResult =
  | { supported: true; draft: ProductEngineerSessionDraft }
  | { supported: false; reason: "NO_HEADLINE_PAIR" | "NO_HEADLINE_GAP" | "MISSING_HEADLINE_TENURE" };

export function createProductEngineerSessionDraft(
  rows: NormalizedRosterRow[],
): ProductEngineerSessionDraftResult;

export function createEmployeeLabels(
  rows: NormalizedRosterRow[],
  lowerPaidRowId: string,
  higherPaidRowId: string,
): Map<string, string>;
```

- [ ] **Step 1: Write failing session-draft support-gate tests**

Test one supported Product Engineer paste, too few/no-comparison rows, and a headline pair missing tenure.

```ts
test("supported Product Engineer rows create one cloned session draft", () => {
  const result = createProductEngineerSessionDraft(productEngineerRows);
  assert.equal(result.supported, true);
  if (!result.supported) return;
  assert.equal(result.draft.selection.selected.length, 1);
  assert.equal(result.draft.selection.selected[0]?.roleGroup, "Product Engineer");
  assert.equal(result.draft.activeThemeId, result.draft.selection.selected[0]?.id);
});
```

- [ ] **Step 2: Run the model test and confirm RED**

Run the Task 1 model command.

Expected: FAIL because `createProductEngineerSessionDraft` does not exist.

- [ ] **Step 3: Implement the deterministic draft builder**

Build findings, themes, and selection from cloned rows. Select exactly the Product Engineer subject. Check headline pair, numeric headline gap, and both headline rows' tenure. Return no review, interpretation, repeat, decision, or report state.

- [ ] **Step 4: Integrate the support gate into preparation**

For a clean parse, call the draft builder. If unsupported, return `blocked` with one `UNSUPPORTED_PRODUCT_ENGINEER_COMPARISON` issue and no rows. If supported, create preview labels from the same headline pair and attach the draft to the ready result.

- [ ] **Step 5: Run model tests and confirm GREEN**

Expected: preparation becomes ready only for a supported Product Engineer comparison.

- [ ] **Step 6: Write a failing real-input copy test**

Use a Product Engineer roster whose counts and amounts differ from the synthetic fixture. Assert the serialized view model includes the current count/gap and excludes fixture-only factual amounts.

```ts
test("facilitated copy derives facts from current rows instead of demo constants", () => {
  const draftResult = createProductEngineerSessionDraft(realInputRows);
  assert.equal(draftResult.supported, true);
  if (!draftResult.supported) return;
  const state: DecisionRoomSessionState = {
    ...createEmptyDecisionRoomSession("facilitated"),
    ...draftResult.draft,
  };
  const model = createProductEngineerDecisionRoomViewModel(state);
  const source = JSON.stringify(model);
  assert.match(model.introduction.scope, new RegExp(`${realInputRows.length}명`));
  assert.match(model.evidence.conclusion, /1,900만원/);
  assert.equal(source.includes("2,700만원"), false);
  assert.equal(source.includes("700만원"), false);
});
```

- [ ] **Step 7: Run the real-input test and confirm RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-real-input.test.ts
```

Expected: FAIL on hard-coded synthetic counts/amounts.

- [ ] **Step 8: Extract shared employee labels and make factual copy dynamic**

Move the existing label algorithm to `createEmployeeLabels.ts`. In `decisionRoomViewModel.ts`, derive `employeeCount`, headline salaries, tenure, gap, repeat amount, affected count, comparison count, and exception amount from the active state. Replace fixed supporting observations and rule conditions with formatter functions that consume those values.

Never prefill review, claim, repeat, decision, or report for a facilitated draft. Pending states remain pending/non-claim.

- [ ] **Step 9: Run real-input, Task 9 UI, and copy tests and confirm GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-real-input.test.ts tests/hr-paysim/decision-room-ui.test.ts tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/tenure-axis-neutral-copy.test.ts
```

Expected: real-input copy passes and the synthetic Task 9 contract remains unchanged.

- [ ] **Step 10: Checkpoint without committing**

Run typecheck and `git diff --check`; keep changes uncommitted.

---

### Task 3: Add The Facilitator Screen, Session Shell, And Local Routes

**Files:**
- Create: `src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx`
- Create: `src/features/facilitator-preparation/FacilitatedSessionApp.tsx`
- Create: `src/features/facilitator-preparation/facilitatorPreparation.css`
- Modify: `src/features/decision-room/DecisionRoomApp.tsx`
- Modify: `src/routes/hr-paysim/appRoute.ts`
- Modify: `src/App.tsx`
- Test: `tests/hr-paysim/facilitator-preparation-ui.test.ts`
- Test: `tests/hr-paysim/app-route.test.ts`
- Test: `tests/hr-paysim/decision-room-component-state.test.ts`

**Interfaces:**

```ts
export interface FacilitatorPreparationScreenProps {
  onStart: (draft: ProductEngineerSessionDraft) => void;
}

export interface DecisionRoomAppProps {
  onSessionEnd?: () => void;
}
```

- [ ] **Step 1: Write failing route and source-ownership tests**

Assert both new paths resolve distinctly, both mount one provider/session shell, the preparation component owns `rawPaste`, the provider/session types do not, and the component does not import detector, theme, storage, URL-state, or network helpers.

```ts
test("local facilitator paths resolve without changing existing surfaces", () => {
  assert.equal(resolveHrPaySimSurface("/hr-paysim/session/new"), "facilitator_preparation");
  assert.equal(resolveHrPaySimSurface("/hr-paysim/session"), "facilitator_session");
  assert.equal(resolveHrPaySimSurface("/hr-paysim/decision-room-preview"), "decision_room_preview");
});
```

- [ ] **Step 2: Run focused UI/route tests and confirm RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/app-route.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts
```

Expected: FAIL because the surfaces and components do not exist.

- [ ] **Step 3: Implement the four-state preparation component**

Required handlers:

```ts
function inspectPaste() {
  const next = prepareProductEngineerRoster(rawPaste, { confirmPiiColumnStripping });
  setResult(next);
  if (next.shouldClearRaw || next.status === "ready_for_confirmation") setRawPaste("");
}

function changePaste(value: string) {
  setRawPaste(value);
  setConfirmPiiColumnStripping(false);
  setResult(createEmptyPreparationResult());
}

function approveColumnStripping() {
  setConfirmPiiColumnStripping(true);
  const next = prepareProductEngineerRoster(rawPaste, { confirmPiiColumnStripping: true });
  setResult(next);
  if (next.shouldClearRaw || next.status === "ready_for_confirmation") setRawPaste("");
}
```

Render safe issue labels by code and line number. Do not render `rowId`, rejected values, parser error strings, detector names, or finding cards. The only start action is `확인한 자료로 세션 시작` and it is available only when a supported draft exists.

- [ ] **Step 4: Implement the local session shell and lifecycle**

The shell uses provider state to render preparation or `DecisionRoomApp`, changes only the pathname with `history.replaceState`, and registers a `beforeunload` handler only while rows exist.

```ts
useEffect(() => {
  if (!hasActiveSession) return;
  const warn = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = "";
  };
  window.addEventListener("beforeunload", warn);
  return () => window.removeEventListener("beforeunload", warn);
}, [hasActiveSession]);
```

`onStart` dispatches a cloned `START_SESSION` action with mode `facilitated`, then replaces the path with `/hr-paysim/session`. `onSessionEnd` dispatches through `DecisionRoomApp`, replaces the path with `/hr-paysim/session/new`, and renders preparation. Direct `/session` without rows shows a no-session message and one action to preparation.

- [ ] **Step 5: Make the sample label mode-specific**

In `DecisionRoomApp`, render `DECISION_ROOM_DEMO_CONTRACT.sampleLabel` only when `state.mode === "demo"`. Add an optional `onSessionEnd` callback after dispatching `END_SESSION`.

- [ ] **Step 6: Mount both routes under one provider**

Add `facilitator_preparation` and `facilitator_session` to `HrPaySimSurface`. In `App.tsx`, mount `PaySimSessionProvider` with no synthetic initial state and render `FacilitatedSessionApp` for either surface. Preserve every existing route result.

- [ ] **Step 7: Add bounded preparation styles**

Use the existing color/type tokens where available. Keep one high-emphasis action, readable safe-error cards, a horizontally scrollable table only as a last resort, visible focus, and responsive single-column layout below 760px. Do not restyle the four-screen decision room.

- [ ] **Step 8: Run focused UI, route, component-state, and type tests and confirm GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/app-route.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts tests/hr-paysim/decision-room-component-state.test.ts
npm.cmd run typecheck
```

Expected: focused tests and typecheck pass.

- [ ] **Step 9: Checkpoint without committing**

Run `git diff --check` and inspect the exact uncommitted P11-B0 file list.

---

### Task 4: Extend Browser QA For Preparation, Privacy, And Lifecycle

**Files:**
- Modify: `scripts/qa-decision-room.mjs`
- Modify: `tests/hr-paysim/facilitator-preparation-ui.test.ts`

**Interfaces:**
- Consumes: built Vite app on `HR_PAYSIM_URL` origin.
- Produces: browser assertions for `/hr-paysim/session/new`, `/hr-paysim/session`, and the unchanged preview.

- [ ] **Step 1: Write failing QA source contracts**

Require QA ownership of these measurements:

```ts
assert.match(qaSource, /columnConsentRequired/);
assert.match(qaSource, /rowPiiBlocksAll/);
assert.match(qaSource, /rawTextareaCleared/);
assert.match(qaSource, /facilitatedSampleLabelHidden/);
assert.match(qaSource, /sessionUrlContainsRosterData/);
assert.match(qaSource, /directSessionFailsClosed/);
assert.match(qaSource, /explicitEndClearsRows/);
```

- [ ] **Step 2: Run the UI test and confirm RED**

Expected: FAIL because the QA script does not own the new measurements.

- [ ] **Step 3: Implement browser preparation scenarios**

At 1280x720 and 390x844:

1. Open `/hr-paysim/session/new`.
2. Paste a prohibited-column fixture; verify only headers render and explicit consent is required.
3. Paste a row-level email fixture; verify every start/confirmation action is absent, the raw textarea is empty, and neither the email nor row ID appears in body text.
4. Paste a mixed-role fixture; verify full block with safe line numbers.
5. Paste a supported non-synthetic Product Engineer fixture; verify normalized confirmation, no raw text, no overflow, and one start action.
6. Start the session without reload; verify `/hr-paysim/session`, no roster content in the URL, no sample label, current-session amounts, focus, keyboard flow, and zero storage keys.
7. End the session; verify rows and screens are gone and preparation is visible.
8. Open `/hr-paysim/session` in a fresh context; verify the no-session state.
9. Re-run the existing Task 9 preview checks unchanged.

Record errors and console issues; any issue fails the script.

- [ ] **Step 4: Run the browser QA and confirm GREEN**

Start a hidden strict-port Vite server, wait for port 5173 readiness, run:

```powershell
node scripts/qa-decision-room.mjs
```

Expected: both facilitator viewports and all existing preview viewports pass. Stop only the exact listener PID and verify `NO_LISTENER`.

- [ ] **Step 5: Run focused tests after QA changes**

Run the UI and real-input test files. Expected: pass.

---

### Task 5: Fresh Verification, Governance Postflight, One Commit, And Review

**Files:**
- All exact P11-B0 product and test files from Tasks 1 through 4.
- Do not include design/plan commits, Task 10, local paths, pilot notes, or unrelated files in the product commit.

- [ ] **Step 1: Run fresh final verification**

Run in this exact order from the worktree root:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

Expected: every command exits 0. Record the new test count and browser viewport evidence. Do not reuse 178/178 from Task 9.

- [ ] **Step 2: Audit scope and privacy**

Run:

```powershell
git status --short --branch
git diff --name-status
rg -n "localStorage|sessionStorage|fetch\(|sendBeacon|XMLHttpRequest|telemetry" src/features/facilitator-preparation src/lib/hr-paysim/preparation
rg -n "Platform Engineer|GTM|Designer|learning log|pilot quote" src/features/facilitator-preparation src/lib/hr-paysim/preparation
```

Expected: only intended P11-B0 files are dirty; no persistence/network path or Task 10 subject implementation exists. Test fixtures may name unsupported roles only in tests.

- [ ] **Step 3: Stage only exact P11-B0 product scope**

Use an explicit `git add -- <paths>` list. Then run:

```powershell
git diff --cached --name-status
git diff --cached --check
git status --short --branch
```

Expected: no docs, governance links, Task 10 files, or unrelated changes are staged.

- [ ] **Step 4: Commit once**

```powershell
git commit -m "feat: add Product Engineer facilitator preparation"
```

- [ ] **Step 5: Verify commit and clean state**

```powershell
git show --stat --oneline --decorate HEAD
git status --short --branch
```

Expected: the exact P11-B0 product commit is at HEAD and the worktree is clean.

- [ ] **Step 6: Request independent read-only review**

Review the range from the plan commit to the P11-B0 product commit for privacy leakage, partial-row analysis, route reload/state loss, synthetic factual copy, invalidation, Task 10 scope, and verification quality. Resolve only technically valid findings under the approved design.

- [ ] **Step 7: Stop before PILOT-1 execution**

Report readiness for a private Product Engineer-only pilot checkpoint. Do not collect, fabricate, or commit participant evidence, pilot quotes, or learning logs. Do not start Task 10.
