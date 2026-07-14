# HR PaySim Career-Aware Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace tenure-only salary comparisons with role/level/relevant-career/tenure evidence and add the guided local Excel preparation workflow without changing the four-screen decision flow or repeat-calculation amounts.

**Architecture:** Extend the canonical roster row with optional normalized relevant-experience months, then isolate one deterministic comparable-pair policy used only by tenure-based findings. Project that evidence through a career-salary plot and the existing decision-room view model. Keep workbook reading inside the facilitator-local feature boundary; both Excel and paste convert through one Korean-table adapter before entering the existing all-or-nothing preparation pipeline.

**Tech Stack:** TypeScript 6, React 19, Node test runner, Vite 8, `read-excel-file`, Playwright QA, `@oai/artifact-tool` for the committed XLSX template.

## Global Constraints

- Work only in `C:\tmp\hr-paysim-facilitated-decision-room` on `codex/facilitated-decision-room`; do not create another branch or worktree.
- Preserve the four founder-facing screens, routes, review state, repeat amounts, materiality threshold, in-memory lifecycle, and report derivation unless explicitly named by the approved supplements.
- Never infer relevant experience from age, dates, title, tenure, level, or prose.
- Never present market salary, normal raise rate, recommended salary, approved company policy, performance, employee intent, or a legal conclusion.
- `levelRank` increases with organizational level. No ranks means career-plus-tenure comparison; complete shared ranks activate the level predicate; partial or incompatible ranks fail closed.
- Exception and counteroffer flags remain evidence and never remove a raw comparison.
- Excel and paste accept the same seven exact Korean headers and normalize through one adapter. Raw source objects, filenames, workbook rows, and canonical text never enter provider state, storage, URLs, telemetry, or public builds.
- Product code follows strict RED → GREEN → REFACTOR. Run each named test in RED and GREEN before moving on.
- Do not start Task 12, deployment, authentication, public self-service, or pilot evidence work.

---

### Task 1: Relevant-experience domain and fixture contract

**Files:**
- Modify: `src/lib/hr-paysim/domain.ts`
- Modify: `src/lib/hr-paysim/rosterParser.ts`
- Modify: `src/lib/hr-paysim/rosterFixtures.ts`
- Modify: `src/lib/hr-paysim/session/runtimeValidation.ts`
- Test: `tests/hr-paysim/roster-parser.test.ts`
- Test: `tests/hr-paysim/session-runtime-boundaries.test.ts`
- Test: `tests/hr-paysim/decision-room-contract.test.ts`

**Interfaces:**
- Produces: `NormalizedRosterRow.relevantExperienceMonths?: number`
- Preserves: all existing canonical parser aliases and session row ownership.

- [ ] **Step 1: Write failing domain/parser/runtime tests**

```ts
assert.equal(parseRosterPaste([
  "rowId\troleGroup\tbaseSalaryKRW\trelevantExperienceMonths\ttenureMonths",
  "row_1\tProduct Engineer\t68000000\t96\t64",
].join("\n")).rows[0]?.relevantExperienceMonths, 96);

const started = decisionRoomReducer(initialState, {
  type: "START_SESSION",
  mode: "facilitated",
  rows: [{ rowId: "row_1", roleGroup: "Product Engineer", baseSalaryKRW: 68_000_000, relevantExperienceMonths: 96, tenureMonths: 64 }],
  themes: [],
  selection: { selected: [], unselected: [], recommendedIds: [], wasOverridden: false },
});
assert.equal(started.rows[0]?.relevantExperienceMonths, 96);
```

- [ ] **Step 2: Run RED**

Run: `npm.cmd test -- tests/hr-paysim/roster-parser.test.ts tests/hr-paysim/session-runtime-boundaries.test.ts tests/hr-paysim/decision-room-contract.test.ts`

Expected: FAIL because the field is not parsed, owned, or present in the fixture contract.

- [ ] **Step 3: Implement the minimal field path**

```ts
export interface NormalizedRosterRow {
  // existing fields
  relevantExperienceMonths?: number;
}

const headerAliases = {
  // existing aliases
  relevantexperiencemonths: "relevantExperienceMonths",
};

const rowKeys = new Set([
  // existing keys
  "relevantExperienceMonths",
]);
```

Add explicit relevant-experience months to every synthetic row while preserving seven findings, three selected subjects, Designer clean state, existing headline gaps, and exception flags.

- [ ] **Step 4: Run GREEN and regression**

Run: `npm.cmd test -- tests/hr-paysim/roster-parser.test.ts tests/hr-paysim/session-runtime-boundaries.test.ts tests/hr-paysim/decision-room-contract.test.ts tests/hr-paysim/structural-findings.test.ts tests/hr-paysim/structural-themes.test.ts`

Expected: PASS with the fixture counts and amounts unchanged.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/hr-paysim/domain.ts src/lib/hr-paysim/rosterParser.ts src/lib/hr-paysim/rosterFixtures.ts src/lib/hr-paysim/session/runtimeValidation.ts tests/hr-paysim/roster-parser.test.ts tests/hr-paysim/session-runtime-boundaries.test.ts tests/hr-paysim/decision-room-contract.test.ts
git commit -m "feat: add relevant experience evidence"
```

---

### Task 2: Career-aware comparable-pair detector

**Files:**
- Create: `src/lib/hr-paysim/detectors/careerComparablePairs.ts`
- Modify: `src/lib/hr-paysim/structuralFindings.ts`
- Modify: `src/lib/hr-paysim/themes/buildStructuralThemes.ts`
- Modify: `src/lib/hr-paysim/preparation/createProductEngineerSessionDraft.ts`
- Test: `tests/hr-paysim/career-comparable-pairs.test.ts`
- Test: `tests/hr-paysim/structural-findings.test.ts`
- Test: `tests/hr-paysim/structural-themes.test.ts`
- Test: `tests/hr-paysim/facilitator-preparation-model.test.ts`

**Interfaces:**
- Produces: `buildMaterialCareerPairs(rows): StructuralFindingPair[]`
- Produces: `resolveOrderedLevelPolicy(rows): "none" | "complete" | "partial"`
- Consumes: finite salary, nonnegative relevant experience and tenure, optional shared `levelRank`.
- Does not change: `buildMaterialTenurePairs()` used by observed-repeat calculations.

- [ ] **Step 1: Write failing pair-policy tests**

```ts
test("rejects a higher-career new hire without a tenure-only fallback", () => {
  const pairs = buildMaterialCareerPairs([
    row("long", 70_000_000, 48, 48),
    row("new", 90_000_000, 120, 2),
  ]);
  assert.deepEqual(pairs, []);
});

test("activates complete ranks and fails closed on partial ranks", () => {
  assert.deepEqual(resolveOrderedLevelPolicy([ranked("a", 1), ranked("b", 2)]), "complete");
  assert.deepEqual(resolveOrderedLevelPolicy([ranked("a", 1), unranked("b")]), "partial");
});
```

Also assert that exception/counteroffer flags do not delete pairs and input order does not affect output.

- [ ] **Step 2: Run RED**

Run: `npm.cmd test -- tests/hr-paysim/career-comparable-pairs.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement one shared predicate**

```ts
export function buildMaterialCareerPairs(rows: NormalizedRosterRow[]): StructuralFindingPair[] {
  const policy = resolveOrderedLevelPolicy(rows);
  if (policy === "partial") return [];
  return rows.flatMap((underpaid) => rows.flatMap((comparator) => {
    if (!hasComparableEvidence(underpaid, comparator)) return [];
    if (underpaid.relevantExperienceMonths! < comparator.relevantExperienceMonths!) return [];
    if (underpaid.tenureMonths! <= comparator.tenureMonths!) return [];
    if (policy === "complete" && underpaid.levelRank! < comparator.levelRank!) return [];
    return materialSalaryPair(underpaid, comparator);
  })).sort(pairPriority);
}
```

Reuse the existing 8% materiality and deterministic priority without applying exception flags.

- [ ] **Step 4: Connect findings and repeated-pattern rules**

Use the shared career pairs for `pay_inversion` and filter `loyalty_tax` pairs to the existing tenure windows. Require at least two distinct supported endpoints on each side, derive affected rows and averages from those endpoints, remove the formal-level early return, and keep GTM's ordered-level finding.

Update theme data status so career-backed relationship themes require relevant career and tenure.

- [ ] **Step 5: Run GREEN and fixture regression**

Run: `npm.cmd test -- tests/hr-paysim/career-comparable-pairs.test.ts tests/hr-paysim/structural-findings.test.ts tests/hr-paysim/structural-themes.test.ts tests/hr-paysim/facilitator-preparation-model.test.ts`

Expected: PASS; sample remains 7 raw findings, 3 visible subjects, zero duplicate headline pairs, Designer clean.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/hr-paysim/detectors/careerComparablePairs.ts src/lib/hr-paysim/structuralFindings.ts src/lib/hr-paysim/themes/buildStructuralThemes.ts src/lib/hr-paysim/preparation/createProductEngineerSessionDraft.ts tests/hr-paysim/career-comparable-pairs.test.ts tests/hr-paysim/structural-findings.test.ts tests/hr-paysim/structural-themes.test.ts tests/hr-paysim/facilitator-preparation-model.test.ts
git commit -m "feat: compare salary with relevant experience"
```

---

### Task 3: Career-salary evidence model and plot

**Files:**
- Rename/Modify: `src/features/confirmed-pay-differences/salaryTenurePlot.ts` → `salaryCareerPlot.ts`
- Modify: `src/features/confirmed-pay-differences/SalaryDistribution.tsx`
- Modify: `src/features/decision-room/decisionRoomViewModel.ts`
- Modify: `src/features/confirmed-pay-differences/EvidenceTable.tsx`
- Modify: `src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx`
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `src/features/decision-room/decisionRoom.css`
- Test: `tests/hr-paysim/salary-career-plot.test.ts`
- Test: `tests/hr-paysim/tenure-axis-neutral-copy.test.ts`
- Test: `tests/hr-paysim/task10-copy-visual-coherence.test.ts`
- Test: `tests/hr-paysim/decision-room-ui.test.ts`
- Test: `tests/hr-paysim/remaining-subjects.test.ts`
- Test: `tests/hr-paysim/founder-copy.test.ts`

**Interfaces:**
- Produces: `createSalaryCareerPlot(distribution)` with `points`, `missingCareer`, `careerTicksMonths`, and optional `observedTrend`.
- Changes relationship visualization kind from `"tenure"` to `"career"`; keeps `"level_order"` unchanged for GTM.
- Evidence rows expose relevant career before company tenure.

- [ ] **Step 1: Write failing plot tests**

```ts
const plot = createSalaryCareerPlot(rows);
assert.equal(plot.points.find(p => p.employeeLabel === "직원 A")?.xPercent, 100);
assert.equal(plot.observedTrend?.start.xPercent, 15);
assert.equal(plot.observedTrend?.end.xPercent, 85);
assert.deepEqual(createSalaryCareerPlot([...rows].reverse()).observedTrend, plot.observedTrend);
assert.deepEqual(plot.missingCareer.map(row => row.employeeLabel), ["직원 G"]);
assert.equal("directionGuide" in plot, false);
```

Add a boundary-crossing dataset and assert the clipped endpoints remain on the same fitted slope rather than independently clamped.

- [ ] **Step 2: Run RED**

Run: `npm.cmd test -- tests/hr-paysim/salary-career-plot.test.ts`

Expected: FAIL because the new module and contract do not exist.

- [ ] **Step 3: Implement OLS and geometric clipping**

```ts
const xStart = minX + 0.15 * (maxX - minX);
const xEnd = maxX - 0.15 * (maxX - minX);
const segment = {
  start: toPlot(xStart, intercept + slope * xStart),
  end: toPlot(xEnd, intercept + slope * xEnd),
};
return clipSegmentToUnitRectangle(segment);
```

Require three rows and two distinct x values; keep input-order determinism and centered zero-width coordinates.

- [ ] **Step 4: Project relevant career through the view model and UI**

Add `relevantExperience` and `relevantExperienceMonths` to distribution, highlighted-pair, and evidence rows. Product and Platform use `kind: "career"`; GTM remains `kind: "level_order"`. Replace tenure-axis copy, remove the blue direction guide and its legend/non-claim, add `관련 경력 확인 필요`, and retain every selected-role employee either as a point or missing-career item.

- [ ] **Step 5: Run GREEN and focused UI/copy regression**

Run: `npm.cmd test -- tests/hr-paysim/salary-career-plot.test.ts tests/hr-paysim/tenure-axis-neutral-copy.test.ts tests/hr-paysim/task10-copy-visual-coherence.test.ts tests/hr-paysim/decision-room-ui.test.ts tests/hr-paysim/remaining-subjects.test.ts tests/hr-paysim/founder-copy.test.ts`

Expected: PASS; no fixed direction guide or benchmark-like copy remains.

- [ ] **Step 6: Commit**

```powershell
git add src/features/confirmed-pay-differences src/features/decision-room/decisionRoomViewModel.ts src/features/decision-room/decisionRoom.css src/lib/hr-paysim/copy/founderCopy.ts tests/hr-paysim
git commit -m "feat: show salary by relevant experience"
```

---

### Task 4: One Korean-table adapter for paste and Excel

**Files:**
- Create: `src/lib/hr-paysim/preparation/koreanRosterAdapter.ts`
- Modify: `src/lib/hr-paysim/preparation/types.ts`
- Modify: `src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts`
- Test: `tests/hr-paysim/korean-roster-adapter.test.ts`
- Test: `tests/hr-paysim/facilitator-preparation-model.test.ts`
- Test: `tests/hr-paysim/decision-room-real-input.test.ts`

**Interfaces:**
- Produces: `adaptKoreanRosterTable(rows, options): KoreanRosterAdaptResult`
- Produces: `prepareProductEngineerKoreanTable(rows, options): ProductEngineerPreparationResult`
- Exact headers: `기본연봉(원)`, `관련 경력년수`, `회사 근속개월`, `직함`, `레벨`, `문서화된 예외`, `카운터오퍼 여부`.

- [ ] **Step 1: Write failing adapter tests**

```ts
const result = adaptKoreanRosterTable([
  HEADERS,
  [68_000_000, 8, 64, "Product Engineer", "", "아니오", "아니오"],
  [],
  ["72,000,000", "7.5", "56", "", "L2", "예", ""],
]);
assert.equal(result.status, "ready");
assert.equal(result.rows[0]?.rowId, "file_row_001");
assert.equal(result.rows[1]?.rowId, "file_row_002");
assert.equal(result.rows[1]?.relevantExperienceMonths, 90);
assert.equal(result.rows[1]?.levelRank, undefined);
```

Cover exact headers, duplicates, unknowns, blank/malformed values, percentages, unit text, bounds, Korean yes/no, source row numbers, and four-row minimum.

- [ ] **Step 2: Run RED**

Run: `npm.cmd test -- tests/hr-paysim/korean-roster-adapter.test.ts`

Expected: FAIL because the adapter does not exist.

- [ ] **Step 3: Implement typed all-or-nothing normalization**

```ts
const normalized: NormalizedRosterRow = {
  rowId: `file_row_${String(index + 1).padStart(3, "0")}`,
  roleGroup: "Product Engineer",
  baseSalaryKRW: parseWholeSalary(value),
  relevantExperienceMonths: Math.round(parseCareerYears(value) * 12),
  tenureMonths: parseWholeTenure(value),
  // optional display/evidence fields only
};
```

Return only rows, safe issue codes, safe source row numbers, and safe unknown header names. Never return rejected cell values or raw table arrays.

- [ ] **Step 4: Converge paste on the Korean adapter**

Replace the preparation textarea's canonical English schema with exact Korean TSV parsing. Feed adapted rows through the existing Product Engineer draft builder and PII checks without reintroducing raw text into provider state.

- [ ] **Step 5: Run GREEN and preparation regression**

Run: `npm.cmd test -- tests/hr-paysim/korean-roster-adapter.test.ts tests/hr-paysim/facilitator-preparation-model.test.ts tests/hr-paysim/decision-room-real-input.test.ts tests/hr-paysim/privacy-lifecycle-audit.test.ts`

Expected: PASS; Excel-ready rows and pasted rows normalize identically.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/hr-paysim/preparation tests/hr-paysim/korean-roster-adapter.test.ts tests/hr-paysim/facilitator-preparation-model.test.ts tests/hr-paysim/decision-room-real-input.test.ts
git commit -m "feat: normalize guided roster tables"
```

---

### Task 5: Facilitator-local XLSX reader, template, and linear preparation UI

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/features/facilitator-preparation/readProductEngineerWorkbook.ts`
- Create: `src/features/facilitator-preparation/assets/HR-PaySim-Product-Engineer-input-template.xlsx`
- Modify: `src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx`
- Modify: `src/features/facilitator-preparation/facilitatorPreparation.css`
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `scripts/verify-facilitator-privacy.ts`
- Test: `tests/hr-paysim/local-workbook-reader.test.ts`
- Test: `tests/hr-paysim/facilitator-preparation-ui.test.ts`
- Test: `tests/hr-paysim/public-bundle-boundary.test.ts`
- Test: `tests/hr-paysim/privacy-lifecycle-audit.test.ts`

**Interfaces:**
- Produces: `readProductEngineerWorkbook(file): Promise<ProductEngineerPreparationResult>`
- Uses `read-excel-file/browser` only inside the facilitator-local feature.
- Enforces: `.xlsx`, 5 MB, `입력 양식` priority, one non-empty sheet fallback, ambiguous workbook rejection, and input reset in `finally`.

- [ ] **Step 1: Install the pinned runtime dependency**

Run: `npm.cmd install read-excel-file@9.3.1 --save-exact`

Expected: package and lockfile contain one exact dependency; no unrelated upgrades.

- [ ] **Step 2: Write failing reader and boundary tests**

```ts
assert.equal(selectWorkbookSheet([
  { sheet: "기타", data: [] },
  { sheet: "입력 양식", data: [HEADERS, ...ROWS] },
])?.sheet, "입력 양식");

assert.throws(
  () => selectWorkbookSheet([
    { sheet: "A", data: [HEADERS, ...ROWS] },
    { sheet: "B", data: [HEADERS, ...ROWS] },
  ]),
  /AMBIGUOUS_WORKBOOK/,
);
```

Assert the public entry graph contains neither `read-excel-file` nor the XLSX asset and that the reader exposes no filename or rows.

- [ ] **Step 3: Run RED**

Run: `npm.cmd test -- tests/hr-paysim/local-workbook-reader.test.ts tests/hr-paysim/public-bundle-boundary.test.ts tests/hr-paysim/privacy-lifecycle-audit.test.ts`

Expected: FAIL because the reader, dependency boundary, and template are absent.

- [ ] **Step 4: Build and verify the blank template**

Use the spreadsheet skill's bundled `@oai/artifact-tool` runtime. Create one visible sheet named `입력 양식`, seven headers in contract order, no data rows/formulas/links/hidden sheets, frozen header, clear widths, validation/help messages, and neutral HR PaySim styling. Inspect `A1:G5`, scan formula errors, render the sheet, visually inspect it, then export the verified workbook to the committed asset path.

- [ ] **Step 5: Implement local reading and UI hierarchy**

Render required/optional fields and a synthetic example before actions; show:

```text
1. Excel 입력 양식 내려받기
2. 작성한 Excel 파일 불러오기
```

Keep paste in a closed `<details>` fallback. The file input accepts only `.xlsx`, clears in `finally`, and never renders filename/sheet/generated IDs. Both sources reach the same safe confirmation, which shows relevant career before company tenure.

- [ ] **Step 6: Run GREEN and build-boundary checks**

Run:
- `npm.cmd test -- tests/hr-paysim/local-workbook-reader.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts tests/hr-paysim/public-bundle-boundary.test.ts tests/hr-paysim/privacy-lifecycle-audit.test.ts`
- `npm.cmd run build`
- `npm.cmd run build:facilitator`
- `node --experimental-strip-types scripts/verify-facilitator-privacy.ts`
- `node scripts/verify-route-exposure.mjs`

Expected: all pass; public output excludes facilitator reader/template and facilitator output contains the local workflow.

- [ ] **Step 7: Commit**

```powershell
git add package.json package-lock.json src/features/facilitator-preparation src/lib/hr-paysim/copy/founderCopy.ts scripts/verify-facilitator-privacy.ts tests/hr-paysim
git commit -m "feat: add guided local Excel preparation"
```

---

### Task 6: Browser QA, full regression, and completion evidence

**Files:**
- Modify: `scripts/qa-decision-room.mjs`
- Modify: focused QA tests only if fresh failures identify missing assertions.
- Verify: all files changed by Tasks 1–5.

**Interfaces:**
- Browser QA proves career-axis comprehension, missing-career coverage, Excel/paste privacy lifecycle, four-screen continuity, accessibility, focus, keyboard, console, and overflow.

- [ ] **Step 1: Add failing browser-source assertions**

Assert the QA script measures:
- relevant-career axis and no fixed blue guide;
- all selected-role employees accounted for;
- required-field/example-first preparation hierarchy;
- file input reset and no filename/sheet/raw source in DOM, storage, URL, or requests;
- GTM level visualization remains active.

- [ ] **Step 2: Run RED**

Run: `npm.cmd test -- tests/hr-paysim/qa-evidence-policy.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts tests/hr-paysim/decision-room-ui.test.ts`

Expected: FAIL until the new measurements are wired.

- [ ] **Step 3: Implement minimal QA measurements and run GREEN**

Run the same focused command and expect PASS.

- [ ] **Step 4: Run the complete fresh verification suite**

Run:
- `npm.cmd run lint`
- `npm.cmd test`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run build:facilitator`
- `node --experimental-strip-types scripts/verify-facilitator-privacy.ts`
- `node scripts/verify-route-exposure.mjs`
- `node scripts/qa-decision-room.mjs --surface=facilitator-local`
- `python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .`
- `git diff --check`

Expected: every command exits 0 using the current tree; do not reuse the 222-test baseline as completion evidence.

- [ ] **Step 5: Self-review against the approved spec**

Confirm line by line:
- every headline and supporting pair is career-aware;
- no partial-level or tenure-only fallback;
- exception flags stay visible evidence;
- plot is career-based, shortened, slope-preserving, and guide-free;
- every employee is a point or missing-career item;
- GTM stays level-based;
- template/reader/paste share the contract and remain facilitator-local;
- no Task 12 or deployment work entered the diff.

- [ ] **Step 6: Request independent review and address findings**

Use `superpowers:requesting-code-review`, verify any fixes with RED/GREEN tests, then rerun affected and full verification.

- [ ] **Step 7: Finish the branch without automatic merge or Task 12**

Use `superpowers:finishing-a-development-branch`. Present the verified branch state and integration options; do not push, merge, or start Task 12 without the user's choice.
