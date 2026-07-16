# HR PaySim Safe Formula Snapshot Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow facilitator-local roster workbooks with saved formula results to reach confirmation without evaluating formulas, while returning specific errors for unusable formula results.

**Architecture:** A focused OOXML transformer reads the workbook under bounded ZIP limits, maps worksheet parts to sheet names, removes formula elements from an in-memory copy, and records whether each sheet has usable or unavailable saved results. The existing workbook reader parses only that in-memory value snapshot, then preserves the current adapter, privacy, and session contracts while adding one safe result flag and one specific error code.

**Tech Stack:** TypeScript 6, React 19, `fflate` 0.8.3, `read-excel-file` 9.3.1, Node test runner, Vite 8, Playwright 1.61.

## Global Constraints

- Work only in `C:\tmp\hr-paysim-facilitated-decision-room` on `codex/task12-runtime-convergence`; do not create a branch or worktree.
- Do not reset, checkout, stash, overwrite, or discard existing user changes.
- Do not execute, recalculate, log, persist, upload, or follow external dependencies from formulas.
- Consume only the scalar result last saved in the `.xlsx` worksheet XML.
- Keep the 5 MB source limit, 32 worksheet limit, 20 MB per-worksheet XML limit, and 20 MB aggregate worksheet XML limit.
- Keep raw roster values, formula text, workbook name, and sheet contents out of returned errors, logs, URLs, storage, requests, and public bundles.
- Keep the seven-column roster schema, calculations, thresholds, claims, selection, and four-screen session behavior unchanged.
- Do not stop or reuse the user's `127.0.0.1:5176` or `127.0.0.1:5182` server. Use port 5181 with `--strictPort` for fresh facilitator QA if it is free.
- Do not push, create a PR, merge, deploy, or start a pilot before fresh verification and independent review.

---

### Task 1: Build The Bounded Formula Snapshot Transformer

**Files:**
- Create: `src/features/facilitator-preparation/snapshotWorkbookFormulaValues.ts`
- Create: `tests/hr-paysim/workbook-formula-snapshot.test.ts`

**Interfaces:**
- Consumes: a browser-compatible `File` whose compressed size has already passed `MAX_WORKBOOK_BYTES`.
- Produces: `snapshotWorkbookFormulaValues(file): Promise<WorkbookFormulaSnapshot>`.
- Produces: `FormulaSnapshotStatus = "none" | "saved_values" | "unavailable"`.
- Produces: `{ file: File; sheetFormulaStatus: ReadonlyMap<string, FormulaSnapshotStatus> }` where `file` is an in-memory workbook with formula elements removed and cached scalar values preserved.

- [ ] **Step 1: Write failing transformer tests**

Create a synthetic OOXML ZIP with `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, and two worksheet parts. Cover a normal formula, a self-closing shared formula, a formula without `<v>`, an Excel error cell, a formula-free sheet, and the existing worksheet count/XML inflation limits.

```ts
test("replaces formula elements with their saved scalar values", async () => {
  const file = workbookFile({
    inputCells: [
      '<c r="A2" t="n"><f>RANDBETWEEN(50000000,90000000)</f><v>65000000</v></c>',
      '<c r="F2" t="n"><f t="shared" si="0"/><v>2</v></c>',
    ],
  });

  const snapshot = await snapshotWorkbookFormulaValues(file);
  const archive = unzipSync(new Uint8Array(await snapshot.file.arrayBuffer()));
  const inputXml = strFromU8(archive["xl/worksheets/sheet2.xml"]!);

  assert.equal(snapshot.sheetFormulaStatus.get("입력 양식"), "saved_values");
  assert.doesNotMatch(inputXml, /<(?:[A-Za-z_][\w.-]*:)?f(?:\s|\/?>)/);
  assert.match(inputXml, /<c r="A2" t="n"><v>65000000<\/v><\/c>/);
  assert.match(inputXml, /<c r="F2" t="n"><v>2<\/v><\/c>/);
});

test("marks missing and error cached results unavailable without exposing formula text", async () => {
  const snapshot = await snapshotWorkbookFormulaValues(workbookFile({
    inputCells: [
      '<c r="A2" t="n"><f>SUM(1,2)</f></c>',
      '<c r="F2" t="e"><f>1/0</f><v>#DIV/0!</v></c>',
    ],
  }));

  assert.equal(snapshot.sheetFormulaStatus.get("입력 양식"), "unavailable");
  assert.equal(JSON.stringify(snapshot.sheetFormulaStatus).includes("SUM"), false);
});
```

- [ ] **Step 2: Run the transformer test and observe RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/workbook-formula-snapshot.test.ts
```

Expected: FAIL because `snapshotWorkbookFormulaValues.ts` does not exist.

- [ ] **Step 3: Implement the bounded transformer**

Use `unzipSync`, `zipSync`, `strFromU8`, and `strToU8`. Apply the limits in the unzip filter before transforming any worksheet. Resolve worksheet names through workbook relationships; never infer sheet order.

```ts
export type FormulaSnapshotStatus = "none" | "saved_values" | "unavailable";

export interface WorkbookFormulaSnapshot {
  file: File;
  sheetFormulaStatus: ReadonlyMap<string, FormulaSnapshotStatus>;
}

export async function snapshotWorkbookFormulaValues(
  file: File,
): Promise<WorkbookFormulaSnapshot> {
  const archive = unzipBoundedWorkbook(new Uint8Array(await file.arrayBuffer()));
  const sheetParts = mapSheetNamesToParts(archive);
  const partStatus = new Map<string, FormulaSnapshotStatus>();

  for (const partName of worksheetPartNames(archive)) {
    const transformed = snapshotWorksheet(strFromU8(archive[partName]!));
    archive[partName] = strToU8(transformed.xml);
    partStatus.set(partName, transformed.status);
  }

  const sheetFormulaStatus = new Map(
    [...sheetParts].map(([sheetName, partName]) => [
      sheetName,
      partStatus.get(partName) ?? "none",
    ] as const),
  );
  if (![...sheetFormulaStatus.values()].some((status) => status !== "none")) {
    return { file, sheetFormulaStatus };
  }

  return {
    file: inMemoryFile(file, zipSync(archive)),
    sheetFormulaStatus,
  };
}
```

`snapshotWorksheet()` must treat `<v>0</v>` as usable, treat a missing/empty `<v>` or `t="e"` as unavailable, remove both paired and self-closing namespaced formula tags, and never return addresses, formulas, or values.

- [ ] **Step 4: Run transformer tests and observe GREEN**

Run the Step 2 command again.

Expected: all transformer tests pass, including limit tests and namespaced/shared formula shapes.

- [ ] **Step 5: Commit the transformer boundary**

```powershell
git add src/features/facilitator-preparation/snapshotWorkbookFormulaValues.ts tests/hr-paysim/workbook-formula-snapshot.test.ts
git commit -m "feat: snapshot saved workbook formula values"
```

---

### Task 2: Integrate Formula Snapshots Into The Facilitator Reader

**Files:**
- Modify: `src/features/facilitator-preparation/readFacilitatorWorkbook.ts`
- Modify: `src/lib/hr-paysim/preparation/types.ts`
- Modify: `src/lib/hr-paysim/preparation/prepareFacilitatorRoster.ts`
- Modify: `tests/hr-paysim/local-workbook-reader.test.ts`

**Interfaces:**
- Consumes: `snapshotWorkbookFormulaValues(file)` and its sheet-name status map from Task 1.
- Produces: `FacilitatorPreparationResult.usedFormulaSnapshot: boolean`.
- Produces: `PreparationIssueCode | "FORMULA_RESULT_UNAVAILABLE"`.
- Keeps: all existing adapter issues, PII consent behavior, raw clearing, and reader exception redaction.

- [ ] **Step 1: Replace the old formula-block test with RED integration tests**

Add an injectable `snapshotWorkbookFormulas` option so the reader contract can be tested without duplicating OOXML fixtures.

```ts
test("uses saved formula values on the selected input sheet", async () => {
  let reads = 0;
  const result = await readFacilitatorWorkbook(fakeFile("roster.xlsx", 100), {
    snapshotWorkbookFormulas: async (file) => ({
      file,
      sheetFormulaStatus: new Map([
        ["작성 예시", "none"],
        ["입력 양식", "saved_values"],
      ]),
    }),
    readWorkbook: async () => {
      reads += 1;
      return [{ sheet: "입력 양식", data: rows }];
    },
  });

  assert.equal(reads, 1);
  assert.equal(result.status, "ready_for_confirmation");
  assert.equal(result.usedFormulaSnapshot, true);
});

test("blocks only unavailable formulas on the selected sheet", async () => {
  const result = await readFacilitatorWorkbook(fakeFile("roster.xlsx", 100), {
    snapshotWorkbookFormulas: async (file) => ({
      file,
      sheetFormulaStatus: new Map([
        ["작성 예시", "saved_values"],
        ["입력 양식", "unavailable"],
      ]),
    }),
    readWorkbook: async () => [{ sheet: "입력 양식", data: rows }],
  });

  assert.deepEqual(result.issues, [{ code: "FORMULA_RESULT_UNAVAILABLE" }]);
});
```

Also assert that an unavailable formula on `작성 예시` does not block a valid preferred `입력 양식`, and that file-column consent preserves `usedFormulaSnapshot` after approval.

- [ ] **Step 2: Run reader tests and observe RED**

```powershell
node --experimental-strip-types --test tests/hr-paysim/local-workbook-reader.test.ts tests/hr-paysim/workbook-formula-snapshot.test.ts
```

Expected: FAIL because the result flag, issue code, and snapshot injection do not exist and formulas still map to `UNREADABLE_WORKBOOK`.

- [ ] **Step 3: Add the result flag and issue code**

```ts
export type PreparationIssueCode =
  | KoreanRosterAdapterIssueCode
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "EMPTY_WORKBOOK"
  | "AMBIGUOUS_WORKBOOK"
  | "FORMULA_RESULT_UNAVAILABLE"
  | "UNREADABLE_WORKBOOK"
  | "NO_SUPPORTED_REVIEW_SUBJECT";

export interface FacilitatorPreparationResult {
  status: PreparationStatus;
  prohibitedColumnHeaders: string[];
  issues: SafePreparationIssue[];
  previewRows: PreparationPreviewRow[];
  rows: NormalizedRosterRow[];
  draft?: FacilitatorSessionDraft;
  shouldClearRaw: boolean;
  usedFormulaSnapshot: boolean;
}
```

Set `usedFormulaSnapshot: false` in `createEmptyPreparationResult()` so paste input and every blocked/empty path are explicit and type-safe.

- [ ] **Step 4: Route the in-memory snapshot through the existing parser**

Replace the boolean formula preflight with:

```ts
const snapshotWorkbook = options.snapshotWorkbookFormulas
  ?? (options.readWorkbook
    ? async (sourceFile) => ({
        file: sourceFile,
        sheetFormulaStatus: new Map(),
      })
    : snapshotWorkbookFormulaValues);
const snapshot = await snapshotWorkbook(file);
const sheets = await (options.readWorkbook ?? readXlsxFile)(snapshot.file);
const selected = selectWorkbookSheet(sheets);
const formulaStatus = snapshot.sheetFormulaStatus.get(selected.sheet) ?? "none";
if (formulaStatus === "unavailable") {
  return workbookBlocked("FORMULA_RESULT_UNAVAILABLE");
}
const usedFormulaSnapshot = formulaStatus === "saved_values";
```

Apply the flag to the initial adapter result and the consent-approved second pass with one helper:

```ts
function withFormulaSnapshot(
  result: FacilitatorPreparationResult,
  usedFormulaSnapshot: boolean,
): FacilitatorPreparationResult {
  return { ...result, usedFormulaSnapshot };
}
```

Remove `workbookContainsFormula` and `inspectWorkbookFormulas`; limit coverage now belongs to the transformer tests. Keep parser exceptions mapped to `UNREADABLE_WORKBOOK` without returning exception details.

- [ ] **Step 5: Run reader and preparation suites and observe GREEN**

```powershell
node --experimental-strip-types --test tests/hr-paysim/local-workbook-reader.test.ts tests/hr-paysim/workbook-formula-snapshot.test.ts tests/hr-paysim/facilitator-preparation-model.test.ts
npm.cmd run typecheck
```

Expected: all selected tests pass and TypeScript reports no errors.

- [ ] **Step 6: Commit reader integration**

```powershell
git add src/features/facilitator-preparation/readFacilitatorWorkbook.ts src/features/facilitator-preparation/snapshotWorkbookFormulaValues.ts src/lib/hr-paysim/preparation/types.ts src/lib/hr-paysim/preparation/prepareFacilitatorRoster.ts tests/hr-paysim/local-workbook-reader.test.ts tests/hr-paysim/workbook-formula-snapshot.test.ts
git commit -m "feat: accept saved workbook formula results"
```

---

### Task 3: Show Specific Formula Guidance And Lock Browser Privacy

**Files:**
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx`
- Modify: `src/features/facilitator-preparation/facilitatorPreparation.css`
- Modify: `tests/hr-paysim/founder-copy.test.ts`
- Modify: `tests/hr-paysim/facilitator-preparation-ui.test.ts`
- Modify: `tests/hr-paysim/privacy-lifecycle-audit.test.ts`
- Modify: `scripts/qa-decision-room.mjs`

**Interfaces:**
- Consumes: `usedFormulaSnapshot` and `FORMULA_RESULT_UNAVAILABLE` from Task 2.
- Produces: `FOUNDER_COPY["preparation.formula_snapshot.notice"]` and dedicated issue copy.
- Produces: confirmation marker `[data-formula-snapshot-notice="true"]` for browser QA.
- Preserves: one-action confirmation, raw file clearing, no filename/raw-value rendering, and zero persistence/emission.

- [ ] **Step 1: Write RED copy and UI assertions**

```ts
test("formula snapshot copy distinguishes saved values from unreadable files", () => {
  assert.equal(
    FOUNDER_COPY["preparation.formula_snapshot.notice"],
    "수식이 포함된 셀은 엑셀에 마지막으로 저장된 값으로 읽었습니다. 현재 값이 맞는지 확인한 뒤 세션을 시작해 주세요.",
  );
  assert.match(
    PREPARATION_ISSUE_COPY.FORMULA_RESULT_UNAVAILABLE,
    /엑셀에서 다시 계산해 저장하거나 값만 붙여넣어 주세요/,
  );
  assert.doesNotMatch(
    PREPARATION_ISSUE_COPY.UNREADABLE_WORKBOOK,
    /수식/,
  );
});
```

In `facilitator-preparation-ui.test.ts`, require the `usedFormulaSnapshot` condition, `data-formula-snapshot-notice`, and the founder-copy key. In the privacy audit, add the Task 1 transformer to the scanned owner list and assert that neither the transformer nor reader contains persistence/emission APIs or logging calls.

- [ ] **Step 2: Run copy/UI/privacy tests and observe RED**

```powershell
node --experimental-strip-types --test tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts tests/hr-paysim/privacy-lifecycle-audit.test.ts tests/hr-paysim/public-bundle-boundary.test.ts
```

Expected: FAIL because the notice, error code copy, UI marker, and transformer privacy owner are missing.

- [ ] **Step 3: Add exact copy and confirmation notice**

Add:

```ts
"preparation.formula_snapshot.notice":
  "수식이 포함된 셀은 엑셀에 마지막으로 저장된 값으로 읽었습니다. 현재 값이 맞는지 확인한 뒤 세션을 시작해 주세요.",
"preparation.issue.formula_result_unavailable":
  "저장된 결과가 없는 수식 셀이 있습니다. 엑셀에서 다시 계산해 저장하거나 값만 붙여넣어 주세요.",
```

Map `FORMULA_RESULT_UNAVAILABLE` in `PREPARATION_ISSUE_COPY`. Keep `UNREADABLE_WORKBOOK` limited to unreadable/encrypted workbook structure.

Render the notice between the confirmation heading and preview:

```tsx
{result.usedFormulaSnapshot ? (
  <p className="fp-formula-notice" data-formula-snapshot-notice="true">
    {FOUNDER_COPY["preparation.formula_snapshot.notice"]}
  </p>
) : null}
```

Style `.fp-formula-notice` as a restrained informational callout with existing blue/neutral tokens, readable wrapping, and no new action.

- [ ] **Step 4: Extend facilitator browser QA with a formula workbook fixture**

Build an in-memory synthetic workbook from the committed blank template by replacing only `입력 양식` rows 2–5 with anonymous Backend Engineer rows. Use cached numeric values with formula elements in salary and grade-order cells. Upload it through the real file input and assert:

```js
await formulaFileInput.setInputFiles({
  name: "formula-roster.xlsx",
  mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  buffer: formulaRosterBuffer,
});
await facilitatorPage.locator('[data-preparation-confirmation="true"]').waitFor();
const formulaSnapshotNotice = await facilitatorPage
  .locator('[data-formula-snapshot-notice="true"]')
  .isVisible();
if (!formulaSnapshotNotice) throw new Error("saved formula result notice is missing");
```

Add `formulaSnapshotNotice` to the QA result contract. Verify the formula text, filename, and raw row tokens are absent from visible text, URL, storage, requests, WebSockets, console, and page errors. Keep the existing blank-template rejection and paste flow.

- [ ] **Step 5: Run focused UI/privacy tests and both builds**

```powershell
node --experimental-strip-types --test tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts tests/hr-paysim/privacy-lifecycle-audit.test.ts tests/hr-paysim/public-bundle-boundary.test.ts
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd run build:facilitator
node scripts/verify-route-exposure.mjs
node --experimental-strip-types scripts/verify-facilitator-privacy.ts
```

Expected: every command exits 0; the public manifest excludes the transformer/reader; the facilitator privacy verifier finds no persistence or emission API.

- [ ] **Step 6: Commit user guidance and QA**

```powershell
git add src/lib/hr-paysim/copy/founderCopy.ts src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx src/features/facilitator-preparation/facilitatorPreparation.css tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts tests/hr-paysim/privacy-lifecycle-audit.test.ts scripts/qa-decision-room.mjs
git commit -m "fix: guide saved formula workbook imports"
```

---

### Task 4: Verify The Reported Workbook And Review The Branch

**Files:**
- Modify only when an observed RED/GREEN failure or independent review finding requires a focused correction.
- Never add `C:\Users\bang0\Downloads\HR-PaySim-company-roster-template.xlsx` to Git.

**Interfaces:**
- Consumes: the exact reader, UI, QA, and supplied local workbook.
- Produces: fresh verification evidence with only safe metadata: status, accepted row count, issue codes, and formula-snapshot flag.

- [ ] **Step 1: Invoke verification-before-completion and run all non-browser gates freshly**

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

Expected: every command exits 0 and the fresh full-suite count is recorded.

- [ ] **Step 2: Run the supplied workbook through the exact reader without logging values**

Create `C:\\Users\\bang0\\OneDrive\\Documents\\HR Paysim\\_codex_audit\\verify-formula-import.mjs` as a temporary, uncommitted verifier:

```ts
import { readFileSync } from "node:fs";
import { File } from "node:buffer";
import { readFacilitatorWorkbook } from "file:///C:/tmp/hr-paysim-facilitated-decision-room/src/features/facilitator-preparation/readFacilitatorWorkbook.ts";

const bytes = readFileSync(process.argv[2]);
const file = new File([bytes], "local-roster.xlsx");
const result = await readFacilitatorWorkbook(file);
console.log(JSON.stringify({
  status: result.status,
  rowCount: result.rows.length,
  issueCodes: result.issues.map(({ code }) => code),
  usedFormulaSnapshot: result.usedFormulaSnapshot,
}));
```

Run it against:

```powershell
node --experimental-strip-types "C:\Users\bang0\OneDrive\Documents\HR Paysim\_codex_audit\verify-formula-import.mjs" "C:\Users\bang0\Downloads\HR-PaySim-company-roster-template.xlsx"
```

Expected exact safe output:

```json
{"status":"ready_for_confirmation","rowCount":26,"issueCodes":[],"usedFormulaSnapshot":true}
```

- [ ] **Step 3: Run fresh facilitator browser QA on port 5181**

First confirm 5181 is unused. Start a new facilitator server with `--strictPort`; do not stop or reuse 5176 or 5182.

```powershell
npm.cmd run dev:facilitator -- --port 5181 --strictPort
```

In a second process:

```powershell
$env:HR_PAYSIM_URL="http://127.0.0.1:5181/hr-paysim/demo"
node scripts/qa-decision-room.mjs --surface=facilitator-local
```

Expected: formula snapshot notice, blank workbook, consent, PII, multi-role confirmation, four-screen flow, subject switching, session clearing, overflow, and zero-emission checks all pass. Stop only the 5181 process started by this step.

- [ ] **Step 4: Invoke requesting-code-review for independent review**

Review the design and implementation for:

- cached-value presence and error detection across normal, shared, self-closing, and namespaced formula tags;
- correct sheet-name-to-part mapping and non-selected sheet isolation;
- ZIP inflation fail-closed behavior;
- zero formula execution, external-link resolution, persistence, or raw-value logging;
- consent-path preservation of `usedFormulaSnapshot`;
- public-bundle isolation and exact founder copy;
- no changes to roster calculations or decision-room behavior.

Expected: findings include severity and exact files/lines. No response is not approval.

- [ ] **Step 5: Resolve each actionable finding with its own RED-GREEN cycle**

For each finding: add one failing regression test, run it and observe the expected failure, implement the smallest correction, rerun the focused test to GREEN, then rerun Steps 1–3. Commit each logically independent correction with a specific message.

- [ ] **Step 6: Confirm final branch scope and stop before publication**

```powershell
git status -sb
git log --oneline --decorate origin/main..HEAD
git diff --stat origin/main...HEAD
```

Expected: a clean worktree containing the approved design, this plan, the three implementation commits, and any reviewed focused fix commits. Stop for user direction before push, PR, merge, deployment, or pilot work.
