# HR PaySim Multi-role Roster Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a facilitator upload one de-identified company roster containing many explicit jobs and grades, then open the existing four-screen decision room without any Product Engineer runtime dependency.

**Architecture:** Keep the existing normalized roster, detector, theme, review, repeat, and session models. Replace only the facilitator intake boundary with a seven-column role-aware adapter, add a diversity-first facilitator subject selector, and make facilitated view-model composition depend on theme archetype and evidence capability instead of named demo roles. Preserve the two canonical exception flags in the engine while carrying the exact controlled reason only through preparation confirmation.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Node test runner, Playwright, `read-excel-file`, `fflate`, and `@oai/artifact-tool` for the committed workbook asset.

## Global Constraints

- Authority: `docs/diagnostic-product-adapter.md`, Constitution baseline `790eb99`, `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`, and `docs/superpowers/specs/2026-07-15-hr-paysim-multi-role-roster-input-design.md`.
- Classification: `PRODUCT_IMPLEMENTATION`.
- Preserve DP-01 through DP-05, in-memory lifecycle, four-screen order, reviewed-state invalidation, and current detector formulas and thresholds.
- Do not add fuzzy job mapping, inferred grade order, market data, salary recommendations, fairness judgments, authentication, persistence, telemetry, deployment, or self-service behavior.
- Compare rows only inside the same normalized `직무`; normalize NFKC, surrounding/internal whitespace, and Latin case only.
- `직급` and `직급 순서` are both blank for a no-grade job or both complete and consistent for every row in that job.
- `처우 예외적용 사유` accepts only `없음`, `채용 예외`, `카운터오퍼`, or `기타 문서화된 사유`; no free-form exception text enters the session.
- Facilitator input may activate `level_integrity` findings and may suppress or reprioritize career pairs; do not claim output equivalence with the old Product Engineer-only adapter.
- Demo-only named fixture copy may remain named. Facilitated mode must not depend on `Product Engineer`, `Platform Engineer`, or `GTM` literals.
- All behavior changes use RED → GREEN → REFACTOR. Observe every RED failure for the intended reason before implementation.
- The current server on port 5176 belongs to the user. Do not stop or reuse it; final QA starts new strict-port servers on unused ports.

---

### Task 1: Establish The Seven-column Adapter Contract

**Files:**
- Create: `src/lib/hr-paysim/preparation/rosterTemplateContract.ts`
- Modify: `src/lib/hr-paysim/preparation/koreanRosterAdapter.ts`
- Modify: `src/lib/hr-paysim/preparation/types.ts`
- Modify: `tests/hr-paysim/korean-roster-adapter.test.ts`
- Modify: `tests/hr-paysim/facilitator-preparation-model.test.ts`

**Interfaces:**
- Produces: `ROSTER_HEADERS`, `COMPENSATION_EXCEPTION_LABELS`, `ROSTER_EXAMPLE_ROWS`, `CompensationExceptionReason`, `normalizeFacilitatorJob`, and adapter records that preserve the controlled exception reason.
- Produces: `PreparationPreviewRow.roleGroup: string`, optional `levelLabel`/`levelRank`, and `compensationExceptionReason: CompensationExceptionReason`.
- Consumes later: Tasks 2, 4, and 5 use these constants and types as the only facilitator input contract.

- [ ] **Step 1: Write failing exact-schema and normalization tests**

Replace the old fixed-role fixtures in `tests/hr-paysim/korean-roster-adapter.test.ts` with seven-column rows and add:

```ts
assert.deepEqual(ROSTER_HEADERS, [
  "기본연봉(원)",
  "관련 경력년수",
  "회사 근속개월",
  "직무",
  "직급",
  "직급 순서",
  "처우 예외적용 사유",
]);

test("normalizes superficial job variants without semantic role guessing", () => {
  const result = adaptKoreanRosterTable([
    [...ROSTER_HEADERS],
    [60_000_000, 2.5, 36, " Product  Engineer ", "L1", 1, "없음"],
    [68_000_000, 2, 12, "product engineer", "L1", 1, "카운터오퍼"],
    [72_000_000, 4, 48, "프로덕트 엔지니어", "L2", 2, "채용 예외"],
    [76_000_000, 3, 18, "Software Engineer", "L2", 2, "기타 문서화된 사유"],
  ]);
  assert.equal(result.status, "ready");
  assert.deepEqual(result.rows.map((row) => row.roleGroup), [
    "Product Engineer",
    "Product Engineer",
    "프로덕트 엔지니어",
    "Software Engineer",
  ]);
  assert.equal(result.rows[0]?.relevantExperienceMonths, 30);
  assert.equal(result.rows[0]?.levelLabel, "L1");
  assert.equal(result.rows[0]?.levelRank, 1);
  assert.deepEqual(
    result.records.map((record) => record.compensationExceptionReason),
    ["none", "counteroffer", "hiring_exception", "other_documented"],
  );
  assert.equal(result.rows[1]?.counterOfferFlag, true);
  assert.equal(result.rows[2]?.exceptionFlag, true);
  assert.equal(result.rows[3]?.exceptionFlag, true);
});
```

Add tests proving that all-blank grade fields produce `levelLabel === undefined` and `levelRank === undefined`, while a partially populated job and a repeated grade label mapped to two ranks return safe `PARTIAL_GRADE_MAPPING` and `CONTRADICTORY_GRADE_MAPPING` issues without raw job or grade text in the result.

- [ ] **Step 2: Run the adapter tests and observe RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/korean-roster-adapter.test.ts tests/hr-paysim/facilitator-preparation-model.test.ts
```

Expected: FAIL because the old headers, fixed role assignment, boolean columns, preview literal type, and missing rank validation remain.

- [ ] **Step 3: Add the canonical template contract**

Create `rosterTemplateContract.ts` with the exact exported contract:

```ts
export const ROSTER_HEADERS = [
  "기본연봉(원)", "관련 경력년수", "회사 근속개월",
  "직무", "직급", "직급 순서", "처우 예외적용 사유",
] as const;

export type CompensationExceptionReason =
  | "none"
  | "hiring_exception"
  | "counteroffer"
  | "other_documented";

export const COMPENSATION_EXCEPTION_LABELS: Record<CompensationExceptionReason, string> = {
  none: "없음",
  hiring_exception: "채용 예외",
  counteroffer: "카운터오퍼",
  other_documented: "기타 문서화된 사유",
};

export const ROSTER_EXAMPLE_ROWS = [
  [68_000_000, 8, 36, "Product Engineer", "L1", 1, "없음"],
  [74_000_000, 7.5, 24, "Product Engineer", "L2", 2, "카운터오퍼"],
  [82_000_000, 10, 18, "Product Engineer", "L3", 3, "채용 예외"],
  [79_000_000, 6, 12, "Product Engineer", "L2", 2, "없음"],
] as const;
```

- [ ] **Step 4: Implement role, grade, and exception adaptation**

Replace the old header/field map and parse the new cells. Use this deterministic role helper:

```ts
export function normalizeFacilitatorJob(value: string): { key: string; display: string } {
  const display = value.normalize("NFKC").trim().replace(/\s+/g, " ");
  return { key: display.toLowerCase(), display };
}
```

Maintain `Map<string, string>` from normalized key to first accepted display spelling while parsing. Map reason labels to the two existing flags, store the enum on each adapter record, and validate grade completeness after every row is parsed but before returning `ready`.

Extend issue and preview types with:

```ts
export type KoreanRosterAdapterIssueCode =
  | "MISSING_HEADER"
  | "DUPLICATE_HEADER"
  | "MISSING_REQUIRED_FIELD"
  | "INVALID_FIELD_VALUE"
  | "PII_VALUE"
  | "TOO_FEW_ROWS"
  | "PARTIAL_GRADE_MAPPING"
  | "CONTRADICTORY_GRADE_MAPPING";

export interface PreparationPreviewRow {
  employeeLabel: string;
  roleGroup: string;
  salaryKRW: number;
  relevantExperienceMonths?: number;
  tenureMonths?: number;
  levelLabel?: string;
  levelRank?: number;
  compensationExceptionReason: CompensationExceptionReason;
}
```

Keep `Math.round(relevantExperienceYears * 12)` unchanged and remove the imported `title` mapping from facilitator rows.

- [ ] **Step 5: Run focused tests and observe GREEN**

Run the Step 2 command.

Expected: all selected tests pass; PII, formula, missing-header, numeric-bound, and minimum-row cases remain fail-closed.

- [ ] **Step 6: Commit the adapter contract**

```powershell
git add src/lib/hr-paysim/preparation/rosterTemplateContract.ts src/lib/hr-paysim/preparation/koreanRosterAdapter.ts src/lib/hr-paysim/preparation/types.ts tests/hr-paysim/korean-roster-adapter.test.ts tests/hr-paysim/facilitator-preparation-model.test.ts
git commit -m "feat: accept explicit job and grade evidence"
```

---

### Task 2: Build Role-agnostic Selection And Session Drafts

**Files:**
- Create: `tests/hr-paysim/fixtures/multi-role-roster.ts`
- Modify: `src/lib/hr-paysim/themes/selectReviewSubjects.ts`
- Modify: `src/lib/hr-paysim/preparation/createProductEngineerSessionDraft.ts`
- Modify: `src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts`
- Modify: `src/lib/hr-paysim/preparation/types.ts`
- Modify: `tests/hr-paysim/review-subject-selection.test.ts`
- Modify: `tests/hr-paysim/facilitator-preparation-model.test.ts`
- Modify: `tests/hr-paysim/structural-findings.test.ts`
- Modify: `tests/hr-paysim/structural-themes.test.ts`

**Interfaces:**
- Produces: `selectFacilitatorReviewSubjects(themes): ReviewSubjectSelection` selecting at most one theme per role and three distinct roles.
- Produces: `createFacilitatorSessionDraft(rows): FacilitatorSessionDraftResult` with no named-role filter.
- Produces: complete-grade and no-grade paired fixtures with locked finding/theme differences.

- [ ] **Step 1: Write failing diversity-first selection tests**

Add to `review-subject-selection.test.ts`:

```ts
test("facilitator selection chooses one representative from each of the top three roles", () => {
  const themes = [
    theme("a-strong", "A", "sufficient", "systematic", 0.9, 4),
    theme("a-second", "A", "sufficient", "systematic", 0.8, 3),
    theme("b", "B", "sufficient", "systematic", 0.7, 2),
    theme("c", "C", "sufficient", "systematic", 0.6, 2),
    theme("d", "D", "sufficient", "systematic", 0.5, 2),
  ];
  const selection = selectFacilitatorReviewSubjects(themes);
  assert.deepEqual(selection.selected.map((item) => item.id), ["a-strong", "b", "c"]);
  assert.deepEqual(selection.unselected.map((item) => item.id), ["a-second", "d"]);
});
```

Keep existing `selectReviewSubjects` tests unchanged to lock the demo contract separately.

- [ ] **Step 2: Write the role-agnostic draft RED test**

Add a paste fixture containing only `Backend Engineer` and `Operations` rows. Assert:

```ts
const prepared = prepareFacilitatorRoster(nonProductEngineerPaste);
assert.equal(prepared.status, "ready_for_confirmation");
assert.ok(prepared.draft);
assert.equal(
  prepared.draft.selection.selected.some((theme) => theme.roleGroup === "Product Engineer"),
  false,
);
assert.equal(prepared.draft.activeThemeId, prepared.draft.selection.selected[0]?.id);
```

- [ ] **Step 3: Add paired grade-activation fixtures and RED snapshots**

Create four `Backend Engineer` rows named `be-a` through `be-d` with salaries `60m, 75m, 85m, 70m`, relevant experience `120, 84, 60, 96` months, and tenure `60, 12, 10, 50` months. The complete fixture uses ranks `1, 2, 1, 2`; the paired no-grade fixture removes labels and ranks.

Assert the complete fixture has `pay_inversion` and `level_fiction_band_overlap`, excludes the no-grade-only `be-a → be-b` career pair, and creates a `level_integrity` theme. Assert the no-grade fixture has no level-integrity finding and retains `be-a → be-b`.

- [ ] **Step 4: Run focused tests and observe RED**

```powershell
node --experimental-strip-types --test tests/hr-paysim/review-subject-selection.test.ts tests/hr-paysim/facilitator-preparation-model.test.ts tests/hr-paysim/structural-findings.test.ts tests/hr-paysim/structural-themes.test.ts
```

Expected: FAIL because facilitator diversity selection and role-agnostic drafts do not exist and the adapter path still searches for Product Engineer.

- [ ] **Step 5: Implement facilitator selection and generic draft validation**

Add:

```ts
export function selectFacilitatorReviewSubjects(
  themes: StructuralTheme[],
): ReviewSubjectSelection {
  const ordered = recommendReviewSubjectOrder(themes);
  const representatives = ordered.filter((theme, index) =>
    ordered.findIndex((candidate) => candidate.roleGroup === theme.roleGroup) === index
  );
  const selected = representatives.slice(0, 3);
  const selectedIds = new Set(selected.map((theme) => theme.id));
  return {
    selected,
    unselected: ordered.filter((theme) => !selectedIds.has(theme.id)),
    recommendedIds: selected.map((theme) => theme.id),
    wasOverridden: false,
  };
}
```

Change the draft builder to use this selector, validate every selected theme's headline pair and required pair evidence, and return all selected themes rather than wrapping one Product Engineer theme. Rename exported draft/result types to `FacilitatorSessionDraft` and `FacilitatorSessionDraftResult`; retain no compatibility alias in facilitator imports.

- [ ] **Step 6: Run focused tests and observe GREEN**

Run Step 4 again.

Expected: all selected tests pass and the demo selector tests remain unchanged.

- [ ] **Step 7: Commit role-agnostic analysis entry**

```powershell
git add src/lib/hr-paysim/themes/selectReviewSubjects.ts src/lib/hr-paysim/preparation/createProductEngineerSessionDraft.ts src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts src/lib/hr-paysim/preparation/types.ts tests/hr-paysim/fixtures/multi-role-roster.ts tests/hr-paysim/review-subject-selection.test.ts tests/hr-paysim/facilitator-preparation-model.test.ts tests/hr-paysim/structural-findings.test.ts tests/hr-paysim/structural-themes.test.ts
git commit -m "feat: build multi-role facilitator sessions"
```

---

### Task 3: Make Facilitated View Models And Labels Subject-local

**Files:**
- Modify: `src/lib/hr-paysim/presentation/createEmployeeLabels.ts`
- Modify: `src/features/decision-room/decisionRoomViewModel.ts`
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `tests/hr-paysim/decision-room-real-input.test.ts`
- Modify: `tests/hr-paysim/remaining-subjects.test.ts`
- Modify: `tests/hr-paysim/decision-room-ui.test.ts`
- Create: `tests/hr-paysim/employee-labels.test.ts`

**Interfaces:**
- Produces: unbounded `createEmployeeLabels(rows, lowerPaidRowId, higherPaidRowId)` scoped to the rows passed by the active subject.
- Produces: facilitated view-model dispatch by `StructuralTheme.archetype`, never by named role.
- Consumes: `FacilitatorSessionDraft` and diversity selection from Task 2.

- [ ] **Step 1: Write failing label tests**

Create `employee-labels.test.ts` proving the pair is A/B, ten same-role rows receive `A` through `J` without numeric fallback, and a second role receives its own A/B pair when passed separately.

Use an Excel-style suffix helper expectation:

```ts
assert.deepEqual([...labels.values()], [
  "직원 A", "직원 B", "직원 C", "직원 D", "직원 E",
  "직원 F", "직원 G", "직원 H", "직원 I", "직원 J",
]);
```

- [ ] **Step 2: Write a no-Product-Engineer four-screen RED test**

In `decision-room-real-input.test.ts`, prepare the multi-role fixture, create facilitated state, switch through every selected theme, and assert each evidence conclusion contains that active role, its own `직원 A`/`직원 B`, and no `Product Engineer`, `Platform Engineer`, or `GTM` fallback literal.

Add a complete-grade role and assert `visualization.kind === "level_order"` when its active theme archetype is `level_integrity`.

- [ ] **Step 3: Run view-model tests and observe RED**

```powershell
node --experimental-strip-types --test tests/hr-paysim/employee-labels.test.ts tests/hr-paysim/decision-room-real-input.test.ts tests/hr-paysim/remaining-subjects.test.ts tests/hr-paysim/decision-room-ui.test.ts
```

Expected: FAIL because the product template is still required, GTM/name branches determine visualization, and labels fall back to numbers after H.

- [ ] **Step 4: Implement unbounded subject-local labels**

Replace the fixed alphabet with:

```ts
function alphabeticSuffix(index: number): string {
  let value = index + 1;
  let result = "";
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }
  return result;
}
```

Reserve A/B for the pair and label remaining rows from suffix index 2. Every caller must pass rows filtered to the active role.

- [ ] **Step 5: Refactor facilitated view-model dispatch**

Resolve the active theme once and use:

```ts
const base = state.mode === "demo"
  ? createNamedDemoSubjectViewModel(state, activeTheme)
  : createFacilitatedSubjectViewModel(state, activeTheme);

function createFacilitatedSubjectViewModel(
  state: DecisionRoomSessionState,
  theme: StructuralTheme,
) {
  return theme.archetype === "level_integrity"
    ? createLevelSubjectViewModel(state, theme)
    : createCareerSubjectViewModel(state, theme);
}
```

Extract common introduction, review, rule, and result shells so neither facilitated builder calls `createProductEngineerDecisionRoomViewModel` as a template. Use existing generic formatters (`formatCareerEvidenceTitle`, `formatRoleDistributionHeading`, and `formatRoleDistributionKicker`) and add only missing role-parameterized founder-copy formatters. Keep named demo assertions green.

Select observed-precedent repeat by evidence availability and reviewed explanation, not role literal. Generic level-integrity themes use `level_order`; career themes use `career`.

- [ ] **Step 6: Run focused tests and observe GREEN**

Run Step 3 again.

Expected: all selected tests pass; demo Product/Platform/GTM outputs remain locked by existing tests.

- [ ] **Step 7: Commit role-agnostic presentation**

```powershell
git add src/lib/hr-paysim/presentation/createEmployeeLabels.ts src/features/decision-room/decisionRoomViewModel.ts src/lib/hr-paysim/copy/founderCopy.ts tests/hr-paysim/employee-labels.test.ts tests/hr-paysim/decision-room-real-input.test.ts tests/hr-paysim/remaining-subjects.test.ts tests/hr-paysim/decision-room-ui.test.ts
git commit -m "feat: present facilitator subjects by evidence"
```

---

### Task 4: Converge Facilitator Preparation Names, Copy, And Preview

**Files:**
- Rename: `src/lib/hr-paysim/preparation/createProductEngineerSessionDraft.ts` → `src/lib/hr-paysim/preparation/createFacilitatorSessionDraft.ts`
- Rename: `src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts` → `src/lib/hr-paysim/preparation/prepareFacilitatorRoster.ts`
- Rename: `src/features/facilitator-preparation/readProductEngineerWorkbook.ts` → `src/features/facilitator-preparation/readFacilitatorWorkbook.ts`
- Create: `src/lib/hr-paysim/presentation/createPreparationLabels.ts`
- Modify: `src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx`
- Modify: `src/features/facilitator-preparation/FacilitatedSessionApp.tsx`
- Modify: `src/features/facilitator-preparation/facilitatorPreparation.css`
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `scripts/verify-facilitator-privacy.ts`
- Modify: `tests/hr-paysim/facilitator-preparation-ui.test.ts`
- Modify: `tests/hr-paysim/local-workbook-reader.test.ts`
- Modify: `tests/hr-paysim/privacy-lifecycle-audit.test.ts`
- Modify: `tests/hr-paysim/public-bundle-boundary.test.ts`
- Modify: affected preparation imports under `tests/hr-paysim/**`

**Interfaces:**
- Produces: `prepareFacilitatorRoster`, `prepareFacilitatorKoreanTable`, `readFacilitatorWorkbook`, and `FacilitatorSessionDraft` across the local surface.
- Produces: `createPreparationLabels(rows: NormalizedRosterRow[]): Map<string, string>` with neutral numbering reset inside each role group.
- Consumes: exact headers/example rows and preview reason from Task 1.

- [ ] **Step 1: Write failing preparation UI and reader assertions**

Assert the screen contains `직무`, `직급`, `직급 순서`, and `처우 예외적용 사유`, does not describe Product Engineer-only intake, imports `ROSTER_EXAMPLE_ROWS`, and renders the exact controlled reason in confirmation. Assert the reader still selects only `입력 양식` when `작성 예시` is also non-empty.

- [ ] **Step 2: Run focused tests and observe RED**

```powershell
node --experimental-strip-types --test tests/hr-paysim/facilitator-preparation-ui.test.ts tests/hr-paysim/local-workbook-reader.test.ts tests/hr-paysim/privacy-lifecycle-audit.test.ts tests/hr-paysim/public-bundle-boundary.test.ts
```

Expected: FAIL on old Product Engineer names, copy, example arrays, and privacy-owner paths.

- [ ] **Step 3: Rename the facilitator modules and update exact imports**

Use `git mv` for the three files, rename their exports, update `FacilitatorPreparationScreen`, `FacilitatedSessionApp`, tests, and verifier manifests, and remove the old Product Engineer-named exported types and issue code.

Use `createPreparationLabels(rows)` to group by `roleGroup` and assign neutral `직원 1`, `직원 2`, ... inside each role. Render React row keys as `${roleGroup}:${employeeLabel}`.

- [ ] **Step 4: Update preparation copy and table structure**

Import `ROSTER_HEADERS`, `ROSTER_EXAMPLE_ROWS`, and `COMPENSATION_EXCEPTION_LABELS`; remove the local example constant. Render grade as `직급 · 순서 N`, display the exact reason label, and keep upload primary with paste in the closed fallback.

Do not change the approved visual system. Extend only table width/wrapping needed for seven columns and grouped role headings.

- [ ] **Step 5: Run focused tests and the literal sweep**

```powershell
node --experimental-strip-types --test tests/hr-paysim/facilitator-preparation-ui.test.ts tests/hr-paysim/local-workbook-reader.test.ts tests/hr-paysim/privacy-lifecycle-audit.test.ts tests/hr-paysim/public-bundle-boundary.test.ts
rg -n "ProductEngineer|Product Engineer" src/lib/hr-paysim/preparation src/features/facilitator-preparation scripts/verify-facilitator-privacy.ts tests/hr-paysim/facilitator-preparation-model.test.ts tests/hr-paysim/local-workbook-reader.test.ts
```

Expected: tests pass and the literal sweep returns no facilitator-path matches. Named demo contract and fixture files are outside this sweep.

- [ ] **Step 6: Commit facilitator convergence**

```powershell
git add src/lib/hr-paysim/preparation src/features/facilitator-preparation src/lib/hr-paysim/copy/founderCopy.ts scripts/verify-facilitator-privacy.ts tests/hr-paysim
git commit -m "refactor: generalize facilitator roster preparation"
```

---

### Task 5: Build And Verify The Two-sheet Workbook

**Files:**
- Rename: `src/features/facilitator-preparation/assets/HR-PaySim-Product-Engineer-input-template.xlsx` → `src/features/facilitator-preparation/assets/HR-PaySim-company-roster-template.xlsx`
- Modify: `src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx`
- Create: `tests/hr-paysim/workbook-template-contract.test.ts`

**Interfaces:**
- Consumes: `ROSTER_HEADERS` and `ROSTER_EXAMPLE_ROWS` from Task 1.
- Produces: committed workbook with `작성 예시` and `입력 양식`; only `입력 양식` is analyzed.

- [ ] **Step 1: Write the workbook parity RED test**

Use `read-excel-file/node` to read both named sheets. Assert `입력 양식` row 1 equals `ROSTER_HEADERS`, has no nonblank employee rows, and `작성 예시` cells `A4:G8` equal `[ROSTER_HEADERS, ...ROSTER_EXAMPLE_ROWS]` after numeric normalization.

Also assert the screen imports the renamed asset and the old asset path no longer exists.

- [ ] **Step 2: Run the parity test and observe RED**

```powershell
node --experimental-strip-types --test tests/hr-paysim/workbook-template-contract.test.ts
```

Expected: FAIL because the old workbook has one header-only sheet and the new asset path does not exist.

- [ ] **Step 3: Create the workbook with the Spreadsheets skill**

Read the Spreadsheets skill completely, use `@oai/artifact-tool`, and rebuild the asset with:

- `작성 예시`: title/non-claim in rows 1–2, exact headers in row 4, exact four example rows in rows 5–8, and field/allowed-value notes below;
- `입력 양식`: exact headers in row 1, blank formatted rows 2–201, frozen row 1, number formats, numeric validations, and an exception-reason list validation;
- readable widths, wrapped header text, and no formulas.

Do not add names, employee IDs, company names, hidden raw-data sheets, formulas, or macros.

- [ ] **Step 4: Render and visually inspect both sheets**

Use `workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" })` for both sheets and inspect the PNGs. Confirm no clipped Korean headers, the example/non-claim reads before the sample data, blank input rows remain visibly writable, and dropdown instructions are legible.

- [ ] **Step 5: Run parity, reader, and build checks**

```powershell
node --experimental-strip-types --test tests/hr-paysim/workbook-template-contract.test.ts tests/hr-paysim/local-workbook-reader.test.ts
npm.cmd run typecheck
npm.cmd run build:facilitator
```

Expected: all commands pass; the built facilitator asset uses the generic filename; the public build boundary remains unchanged.

- [ ] **Step 6: Commit workbook and parity evidence**

```powershell
git add src/features/facilitator-preparation/assets/HR-PaySim-company-roster-template.xlsx src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx tests/hr-paysim/workbook-template-contract.test.ts
git commit -m "feat: provide guided company roster workbook"
```

---

### Task 6: Lock The End-to-end Multi-role And Privacy Contract

**Files:**
- Modify: `scripts/qa-decision-room.mjs`
- Modify: `tests/hr-paysim/decision-room-real-input.test.ts`
- Modify: `tests/hr-paysim/privacy-lifecycle-audit.test.ts`
- Modify: `tests/hr-paysim/public-bundle-boundary.test.ts`
- Modify: `tests/hr-paysim/runtime-convergence.test.ts`
- Modify: `tests/hr-paysim/founder-copy.test.ts`
- Modify: other tests only when old facilitator names or old seven-column fixtures require exact migration.

**Interfaces:**
- Produces: automated browser coverage for a non-Product-Engineer multi-role roster, grade-complete evidence, exact exception display, subject switching, session end, and zero emission/storage.

- [ ] **Step 1: Update QA fixtures and write failing assertions**

Replace the old Product Engineer paste with at least two explicit jobs, including a complete-grade `Backend Engineer` group that produces a supported theme and one small accepted-but-unselected group. Update PII, invalid-career, consent, and formula workbook fixtures to the seven-column header.

Assert browser QA sees:

- the on-screen example and generic workbook download;
- accepted job/grade/reason confirmation;
- no raw source text or filename;
- a session at `/hr-paysim/session` without a Product Engineer dependency;
- subject-local A/B labels after each role switch;
- no roster value in URL, storage, request, WebSocket, console, or page error;
- explicit session end returning to `/session/new` with empty state.

- [ ] **Step 2: Run QA-policy and integration tests and observe RED**

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-real-input.test.ts tests/hr-paysim/privacy-lifecycle-audit.test.ts tests/hr-paysim/public-bundle-boundary.test.ts tests/hr-paysim/runtime-convergence.test.ts tests/hr-paysim/founder-copy.test.ts
```

Expected: FAIL until every old facilitator path, fixture, and copy assertion is migrated.

- [ ] **Step 3: Complete the facilitator-only literal and boundary sweep**

Update tests and scripts without changing demo fixture expectations. Run:

```powershell
rg -n "ProductEngineer|UNSUPPORTED_PRODUCT_ENGINEER|HR-PaySim-Product-Engineer-input-template|readProductEngineerWorkbook|prepareProductEngineerRoster|createProductEngineerSessionDraft" src tests scripts
```

Expected: no live facilitator-path references. Any remaining match must be inside historical docs or an intentional named demo assertion; code matches are a blocker.

- [ ] **Step 4: Run all automated tests and both builds**

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run build:facilitator
node scripts/verify-route-exposure.mjs
node --experimental-strip-types scripts/verify-facilitator-privacy.ts
```

Expected: every command exits 0; public manifest contains no facilitator workbook/parser modules; facilitator manifest contains the renamed privacy owners and no persistence/emission APIs.

- [ ] **Step 5: Commit integration and QA migration**

```powershell
git add scripts/qa-decision-room.mjs tests/hr-paysim
git commit -m "test: lock multi-role facilitator flow"
```

---

### Task 7: Run Fresh Verification And Independent Review

**Files:**
- Modify only when a failing gate or actionable review finding requires a focused TDD fix.

**Interfaces:**
- Consumes: Tasks 1–6.
- Produces: fresh completion evidence and an independently reviewed branch; no push, PR, merge, deployment, pilot, or next task.

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

Expected: every command exits 0, the current full-suite count is recorded from this run, and `git diff --check` prints nothing. Previous 210-test or QA results are not evidence.

- [ ] **Step 2: Start a fresh public QA server on an unused port**

Use port 5181 with `--strictPort`, run `node scripts/qa-decision-room.mjs --surface=public`, and stop only the process started by this step in `finally`.

Expected: four-screen demo passes at all configured viewports; facilitator routes remain unavailable; no console, storage, or route exposure errors.

- [ ] **Step 3: Start a fresh facilitator QA server on an unused port**

Use port 5182 with `--strictPort`, set `HR_PAYSIM_URL=http://127.0.0.1:5182/hr-paysim/demo`, and run `node scripts/qa-decision-room.mjs --surface=facilitator-local`. Stop only the new 5182 process in `finally`. Do not stop the user's existing 5176 server.

Expected: workbook/paste safety cases, multi-role confirmation, non-Product-Engineer four-screen flow, subject switching, session clearing, mobile/desktop overflow, and zero emission/storage all pass.

- [ ] **Step 4: Invoke requesting-code-review for an independent review**

Review against the approved design and this plan, focusing on:

- Product Engineer runtime dependence in facilitator mode;
- grade activation/suppression snapshots;
- cross-job comparison isolation and diversity selection;
- exception-category loss or free-text leakage;
- subject-local labels and more-than-eight-row behavior;
- workbook example/input separation and parity;
- privacy, public bundle isolation, copy claims, and session lifecycle.

Expected: findings list severity and exact files/lines. No response is not approval.

- [ ] **Step 5: Resolve findings one at a time with TDD**

For each actionable product finding, add a failing test, observe RED, implement the smallest correction, observe GREEN, then rerun Step 1 and the affected browser surface. Do not batch unverified fixes.

- [ ] **Step 6: Confirm final branch scope**

```powershell
git status -sb
git log --oneline --decorate origin/main..HEAD
git diff --stat origin/main...HEAD
```

Expected: clean worktree containing only the approved multi-role design, this plan, and Tasks 1–6 commits. Stop for user direction before push, PR, merge, deployment, pilot, or any subsequent task.
