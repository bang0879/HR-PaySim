# HR PaySim Tenure-Axis And Neutral Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ambiguous Screen 2 salary plot with a data-derived salary×tenure scatter, remove tenure-category labels, and neutralize every visible `대표님` reference across the four-screen runtime before repeating the human gate.

**Architecture:** Extend the existing decision-room view model with numeric tenure and data-derived pair copy. A focused pure plot-model helper owns salary/tenure domains, coordinates, ticks, and missing-tenure rows; the React component only renders that model. Central founder copy and visible JSX are neutralized without renaming internal state fields.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Node built-in test runner, Playwright 1.61, CSS.

## Global Constraints

- Work in the existing `codex/facilitated-decision-room` linked worktree.
- Preserve every existing Task 8 ownership, runtime validation, cloning, and invalidation guarantee.
- Keep exactly four screens and exactly three primary actions to the synthetic result.
- Do not change detector selection, headline-pair selection, repeat math, decision state, report derivation, privacy, storage, copy, print, or explicit session-end behavior.
- Do not display `대표님`, `장기 근속`, `최근 입사`, or `오래 근무` in the four-screen runtime.
- Internal names containing `founder` remain valid and must not be renamed merely for display copy.
- Plot every row with numeric tenure; list every row without tenure immediately below the plot.
- Horizontal position means base salary; vertical position means actual tenure months.
- Do not hard-code salary or tenure axis ticks to the synthetic fixture.
- Important conclusions, states, non-claims, actions, and result-column copy belong to `FOUNDER_COPY` or its exported formatters.
- Keep all Task 9 implementation changes uncommitted until the repeated N≥2 human comprehension gate passes.
- Do not start Task 10.

---

## File Responsibility Map

- `src/lib/hr-paysim/copy/founderCopy.ts`: dynamic pair headline/supporting formatters and neutral visible copy.
- `src/features/decision-room/decisionRoomViewModel.ts`: numeric tenure, neutral observations/states, and formatter inputs.
- `src/features/confirmed-pay-differences/salaryTenurePlot.ts`: pure scatter domains, ticks, coordinates, and missing-tenure partition.
- `src/features/confirmed-pay-differences/SalaryDistribution.tsx`: semantic salary×tenure plot rendering.
- `src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx`: neutral Screen 2 labels and actions.
- `src/features/session-introduction/SessionIntroductionScreen.tsx`: neutral Screen 1 copy.
- `src/features/company-rule/CompanyRuleScreen.tsx`: neutral Screen 3 copy.
- `src/features/session-result/SessionResultScreen.tsx`: neutral Screen 4 and copied-result labels.
- `src/features/decision-room/DecisionRoomApp.tsx`: neutral ended-session message.
- `src/features/decision-room/decisionRoom.css`: semantic two-axis layout and responsive reflow.
- `tests/hr-paysim/founder-copy.test.ts`: dynamic copy and forbidden visible terms.
- `tests/hr-paysim/decision-room-ui.test.ts`: view-model evidence, neutral runtime copy, and component ownership.
- `tests/hr-paysim/salary-tenure-plot.test.ts`: pure scatter behavior.
- `scripts/qa-decision-room.mjs`: new visible cues and forbidden-copy browser assertions.

### Task 1: Lock Dynamic Pair Copy And Four-Screen Neutral Language

**Files:**
- Modify: `tests/hr-paysim/founder-copy.test.ts`
- Modify: `tests/hr-paysim/decision-room-ui.test.ts`
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `src/features/decision-room/decisionRoomViewModel.ts`
- Modify: `src/features/session-introduction/SessionIntroductionScreen.tsx`
- Modify: `src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx`
- Modify: `src/features/company-rule/CompanyRuleScreen.tsx`
- Modify: `src/features/session-result/SessionResultScreen.tsx`
- Modify: `src/features/decision-room/DecisionRoomApp.tsx`

**Interfaces:**
- Consumes: selected Product Engineer rows and existing headline pair.
- Produces: `formatProductEngineerEvidenceTitle(input)`, `formatProductEngineerEvidenceSupporting(input)`, `distribution[].tenureMonths`, neutral `FOUNDER_COPY`, and no visible actor-specific copy.

- [ ] **Step 1: Write failing dynamic-copy and forbidden-visible-copy tests**

Update `tests/hr-paysim/founder-copy.test.ts` to import both formatters and assert:

```ts
assert.equal(
  formatProductEngineerEvidenceTitle({
    employeeCount: 6,
    lowerPaidLabel: "직원 A",
    lowerPaidTenureMonths: 64,
    higherPaidLabel: "직원 B",
    higherPaidTenureMonths: 14,
    headlineGapKRW: 27_000_000,
  }),
  "Product Engineer 6명 중 근속 64개월인 직원 A와 근속 14개월인 직원 B의 연봉은 2,700만원 차이납니다.",
);
assert.equal(
  formatProductEngineerEvidenceSupporting({
    employeeCount: 6,
    lowerPaidLabel: "직원 A",
    higherPaidLabel: "직원 B",
  }),
  "직원 6명의 기본 연봉과 근속 개월을 함께 비교했습니다. 현재 자료에 기록된 역할·근속 기간·채용 예외 기록만으로는 직원 A와 직원 B의 차이를 일관되게 설명할 기준을 확인하기 어렵습니다.",
);
for (const value of Object.values(FOUNDER_COPY)) {
  assert.doesNotMatch(value, /대표님|장기 근속|최근 입사|오래 근무/);
}
```

Update the Product Engineer view-model assertions in `tests/hr-paysim/decision-room-ui.test.ts` to the same title/supporting copy and assert:

```ts
assert.deepEqual(
  model.evidence.distribution.map(({ employeeLabel, tenureMonths }) => ({ employeeLabel, tenureMonths })),
  [
    { employeeLabel: "직원 A", tenureMonths: 64 },
    { employeeLabel: "직원 C", tenureMonths: 56 },
    { employeeLabel: "직원 D", tenureMonths: 48 },
    { employeeLabel: "직원 E", tenureMonths: 22 },
    { employeeLabel: "직원 F", tenureMonths: 18 },
    { employeeLabel: "직원 B", tenureMonths: 14 },
  ],
);
```

Add a source scan test over the five screen components and `decisionRoomViewModel.ts` that permits identifiers but rejects quoted visible strings containing the four forbidden expressions.

- [ ] **Step 2: Run focused tests and verify red**

```powershell
node --experimental-strip-types --test tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/decision-room-ui.test.ts
```

Expected: FAIL because the new formatter signatures, numeric tenure, and neutral strings do not exist.

- [ ] **Step 3: Implement dynamic formatters and neutral central copy**

In `founderCopy.ts`, define:

```ts
interface ProductEngineerEvidenceTitleInput {
  employeeCount: number;
  lowerPaidLabel: string;
  lowerPaidTenureMonths: number;
  higherPaidLabel: string;
  higherPaidTenureMonths: number;
  headlineGapKRW: number;
}

export function formatProductEngineerEvidenceTitle(input: ProductEngineerEvidenceTitleInput): string {
  const amount = formatHeadlineGap(input.headlineGapKRW);
  return `Product Engineer ${input.employeeCount}명 중 근속 ${input.lowerPaidTenureMonths}개월인 ${input.lowerPaidLabel}와 근속 ${input.higherPaidTenureMonths}개월인 ${input.higherPaidLabel}의 연봉은 ${amount}만원 차이납니다.`;
}

export function formatProductEngineerEvidenceSupporting(input: {
  employeeCount: number;
  lowerPaidLabel: string;
  higherPaidLabel: string;
}): string {
  return `직원 ${input.employeeCount}명의 기본 연봉과 근속 개월을 함께 비교했습니다. 현재 자료에 기록된 역할·근속 기간·채용 예외 기록만으로는 ${input.lowerPaidLabel}와 ${input.higherPaidLabel}의 차이를 일관되게 설명할 기준을 확인하기 어렵습니다.`;
}
```

Validate every integer, tenure, count, label, and gap before interpolation. Retain the existing invalid-gap error code. Replace visible `대표님` values with neutral equivalents from the approved design.

- [ ] **Step 4: Wire view-model inputs and neutral runtime strings**

Pass `rows.length`, both employee labels, both tenure values, and `headlineGapKRW` into the formatters. Add `tenureMonths: row.tenureMonths` to each distribution item. Replace cohort observations with factual employee-range observations and neutralize every visible string identified by the source scan.

Required result-column and status values:

```ts
"result.column.founder_explanation": "확인한 설명",
"action.copy_result": "확인한 내용 복사하기",
approvalStatus: decision ? "확인 완료" : "결정사항 다시 확인 필요",
```

- [ ] **Step 5: Run focused tests and verify green**

Run the Step 2 command. Expected: both test files pass.

- [ ] **Step 6: Keep changes uncommitted**

Run `git status --short`. Do not create the Task 9 commit.

### Task 2: Build The Pure Salary×Tenure Plot Model

**Files:**
- Create: `src/features/confirmed-pay-differences/salaryTenurePlot.ts`
- Create: `tests/hr-paysim/salary-tenure-plot.test.ts`

**Interfaces:**
- Consumes: `EvidenceModel["distribution"]` items containing salary and optional numeric tenure.
- Produces: `createSalaryTenurePlot(distribution)` with `points`, `missingTenure`, `salaryTicksKRW`, and `tenureTicksMonths`.

- [ ] **Step 1: Write failing pure-model tests**

Create tests that assert:

```ts
const plot = createSalaryTenurePlot([
  { employeeLabel: "직원 A", salary: "6,800만원", salaryKRW: 68_000_000, tenure: "64개월 근속", tenureMonths: 64, highlighted: true },
  { employeeLabel: "직원 B", salary: "9,500만원", salaryKRW: 95_000_000, tenure: "14개월 근속", tenureMonths: 14, highlighted: true },
  { employeeLabel: "직원 C", salary: "7,200만원", salaryKRW: 72_000_000, tenure: "근속 기간 확인 필요", tenureMonths: undefined, highlighted: false },
]);

assert.deepEqual(plot.salaryTicksKRW, [68_000_000, 81_500_000, 95_000_000]);
assert.deepEqual(plot.tenureTicksMonths, [14, 39, 64]);
assert.deepEqual(plot.points.map(({ employeeLabel, xPercent, yPercent }) => ({ employeeLabel, xPercent, yPercent })), [
  { employeeLabel: "직원 A", xPercent: 0, yPercent: 100 },
  { employeeLabel: "직원 B", xPercent: 100, yPercent: 0 },
]);
assert.deepEqual(plot.missingTenure.map((row) => row.employeeLabel), ["직원 C"]);
```

Also test equal salary and equal tenure domains place points at `50` rather than dividing by zero, and empty input returns empty ticks and points.

- [ ] **Step 2: Run the focused test and verify red**

```powershell
node --experimental-strip-types --test tests/hr-paysim/salary-tenure-plot.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the pure plot model**

Use this public shape:

```ts
export interface SalaryTenurePlotPoint<T> {
  row: T;
  employeeLabel: string;
  xPercent: number;
  yPercent: number;
}

export function createSalaryTenurePlot<T extends {
  employeeLabel: string;
  salaryKRW: number;
  tenureMonths?: number;
}>(distribution: T[]): {
  points: SalaryTenurePlotPoint<T>[];
  missingTenure: T[];
  salaryTicksKRW: number[];
  tenureTicksMonths: number[];
}
```

Sort nothing; preserve view-model order. Compute `[min, midpoint, max]`, with integer tenure midpoint rounded to the nearest month. Use `50` for a zero-width domain.

- [ ] **Step 4: Run plot tests and verify green**

Run the Step 2 command. Expected: all plot tests pass.

- [ ] **Step 5: Keep changes uncommitted**

Run `git status --short`. Do not commit before the human gate.

### Task 3: Render The Semantic Scatter And Update Browser QA

**Files:**
- Modify: `src/features/confirmed-pay-differences/SalaryDistribution.tsx`
- Modify: `src/features/decision-room/decisionRoom.css`
- Modify: `tests/hr-paysim/decision-room-ui.test.ts`
- Modify: `scripts/qa-decision-room.mjs`

**Interfaces:**
- Consumes: `createSalaryTenurePlot()` and neutral Screen 2 model.
- Produces: visible salary and tenure axes, semantic point coordinates, missing-tenure list, neutral QA cues, and unchanged four-screen flow.

- [ ] **Step 1: Add failing component and QA contract assertions**

Assert `SalaryDistribution.tsx` contains:

```ts
/createSalaryTenurePlot/
/가로축 · 기본 연봉/
/세로축 · 근속 개월/
/근속 개월 확인 필요/
/style=\{\{ left:.*bottom:/s
```

Assert it does not contain `nth-child(even)`, `장기 근속`, or `최근 입사`. Update browser QA required title cues to `직원 A`, `직원 B`, `64개월`, `14개월`, and `2,700만원`; add the four forbidden expressions to visible-term checks.

- [ ] **Step 2: Run UI tests and verify red**

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-ui.test.ts tests/hr-paysim/salary-tenure-plot.test.ts
```

Expected: FAIL because the component still renders the old one-dimensional staggered plot.

- [ ] **Step 3: Render the scatter**

Use `createSalaryTenurePlot(distribution)`. Render:

- visible y-axis ticks and `세로축 · 근속 개월`;
- a relative plot region with point `left` and `bottom` percentages;
- visible x-axis ticks and `가로축 · 기본 연봉`;
- an accessible plot description;
- a missing-tenure list when non-empty.

Format salary ticks from the numeric model. Remove hard-coded `6,800만원`, `8,150만원`, `9,500만원` tick JSX and both cohort legends.

- [ ] **Step 4: Replace ambiguous CSS**

Remove `.dr-salary-person:nth-child(even)` and its mobile override. Add plot grid, y-axis, x-axis, point-coordinate, and mobile rules. Point coordinates remain semantic at every viewport; only label alignment may change responsively.

- [ ] **Step 5: Run focused tests and verify green**

Run the Step 2 command plus `tests/hr-paysim/founder-copy.test.ts`. Expected: all pass.

- [ ] **Step 6: Run full automated verification**

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

Expected: every command exits `0`; browser QA shows four screens, three clicks, focus, keyboard, no overflow, no forbidden visible terms, invalidation, copy, empty storage, session clearing, and no console issues.

- [ ] **Step 7: Generate the new human-gate image and stop**

Use the browser QA 1280×720 viewport image. Do not create a comprehension record without real responses. Keep every Task 9 file uncommitted and request N≥2 answers.
