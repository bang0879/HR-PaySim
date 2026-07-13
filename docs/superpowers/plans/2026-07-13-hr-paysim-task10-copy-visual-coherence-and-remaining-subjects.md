# HR PaySim Task 10 Copy, Visual Coherence, And Remaining Subjects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make facilitator preparation and the four-screen Decision Room read as one product, then connect Platform Engineer, GTM, and the Designer clean state without changing existing calculations, routes, privacy, or Product Engineer chart coordinates.

**Architecture:** Keep the current reducer, theme selection, metrics, repeat engine, report builder, and four screen components. Add a shared visual foundation, generalize the Product-only view model into an active-subject projection, render tenure and level-order evidence through separate components, and keep all founder-facing conclusion/state/action copy in `founderCopy.ts`.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Node test runner, Playwright, CSS.

## Global Constraints

- Work only in `C:\tmp\hr-paysim-facilitated-decision-room` on `codex/facilitated-decision-room`; do not create another branch or worktree.
- Preserve the four top-level screens, route behavior, reducer ownership, dependency invalidation, session clearing, and in-memory privacy lifecycle.
- Preserve all salary, tenure, level, finding, theme, selection, repeat, decision, and report calculations.
- Preserve Task 9 Product Engineer chart coordinates and line inset ratios: observed trend `0.12`, direction guide `0.18`.
- Keep facilitator intake Product Engineer-only; Task 10 does not add file upload or broaden real-roster intake.
- Keep important conclusions, states, non-claims, questions, and actions in `src/lib/hr-paysim/copy/founderCopy.ts`.
- Never render detector labels, row IDs, market-average language, normal raise rate, salary recommendations, or approved-policy implications.
- Use HR Prism only through Adapter-approved `DP-*` and `CASE-*` patterns; do not copy Prism product copy, components, glossary, formulas, or screen flow.
- Platform and GTM remain unprefilled in the synthetic demo; visiting a subject does not mark it reviewed.
- GTM preserves the exact `4,000,000 / 4,000,000 / 5,000,000` contract with three different labels and an adjacent non-claim.
- Designer is a bounded clean state, not a selectable subject and not proof that the whole pay system is correct.
- Supporting observations are capped at two per selected subject.
- This is a synthetic-sample first draft, not PILOT-1 evidence and not a learning-log record.
- Use TDD for each behavior change: failing focused test, observed failure, minimal implementation, focused pass.
- Do not use stale Task 9 or P11-B0 results as completion evidence.
- Stage and commit the Task 10 product package only after all fresh verification commands pass.

---

## File Structure

### Create

- `src/features/decision-room/decisionRoomFoundation.css` — shared tokens and base focus/background treatment for preparation and Decision Room only.
- `src/features/decision-room/SubjectSelector.tsx` — selected-theme buttons and dispatch-neutral `onSelect(themeId)` interface.
- `src/features/confirmed-pay-differences/LevelOrderDistribution.tsx` — GTM AE1/AE2 salary visualization and exact metric labels.
- `tests/hr-paysim/remaining-subjects.test.ts` — active-subject view-model, subject copy, GTM values, Designer state, pending result rows.
- `tests/hr-paysim/task10-copy-visual-coherence.test.ts` — preparation/Decision Room copy ownership, shared tokens, component structure.

### Modify

- `src/lib/hr-paysim/copy/founderCopy.ts` — preparation, multi-subject, Platform, GTM, Designer, pending, and non-claim copy SSOT.
- `src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx` — revised copy hierarchy and allowed-column reference.
- `src/features/facilitator-preparation/facilitatorPreparation.css` — Decision Room-aligned preparation styling.
- `src/features/decision-room/decisionRoom.css` — import shared foundation and add selector/level-order/clean-state styles.
- `src/features/decision-room/decisionRoomViewModel.ts` — general active-subject projection and role-specific evidence/rule/result variants.
- `src/features/decision-room/DecisionRoomApp.tsx` — call the active-subject factory and dispatch subject selection.
- `src/features/session-introduction/SessionIntroductionScreen.tsx` — render multi-subject scope from model only.
- `src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx` — enabled selector, visualization switch, clean state.
- `src/features/confirmed-pay-differences/SalaryDistribution.tsx` — consume generic tenure evidence type without changing plot math.
- `src/features/company-rule/CompanyRuleScreen.tsx` — subject selector and observed-precedent/level-order/pending variants.
- `src/features/session-result/SessionResultScreen.tsx` — three subject rows, pending states, Designer clean context, unselected appendix.
- `tests/hr-paysim/facilitator-preparation-ui.test.ts` — exact first-pass preparation copy and shared-style assertions.
- `tests/hr-paysim/decision-room-ui.test.ts` — active-subject factory and Product regression assertions.
- `tests/hr-paysim/decision-room-real-input.test.ts` — updated factory name with unchanged Product-only facilitated behavior.
- `tests/hr-paysim/decision-room-ui-invalidation.test.ts` — updated factory name and subject-scoped stale-output assertions.
- `tests/hr-paysim/tenure-axis-neutral-copy.test.ts` — updated factory name; Task 9 plot assertions remain exact.
- `tests/hr-paysim/demo-runtime-contract.test.ts` — assert Platform/GTM still start unanswered.
- `scripts/qa-decision-room.mjs` — enabled subject switching, focus, GTM values/non-claim, Designer state, preparation visual/copy QA.

### Explicitly Do Not Modify

- `src/lib/hr-paysim/metrics/*`
- `src/lib/hr-paysim/structuralFindings.ts`
- `src/lib/hr-paysim/themes/buildStructuralThemes.ts`
- `src/lib/hr-paysim/themes/selectReviewSubjects.ts`
- `src/lib/hr-paysim/session/decisionRoomReducer.ts`
- `src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts`
- `src/lib/hr-paysim/report/buildSessionReport.ts`
- `src/features/confirmed-pay-differences/salaryTenurePlot.ts`
- `src/lib/hr-paysim/rosterFixtures.ts`

---

### Task 1: Align Preparation Copy And Visual Foundation

**Files:**
- Create: `src/features/decision-room/decisionRoomFoundation.css`
- Create: `tests/hr-paysim/task10-copy-visual-coherence.test.ts`
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx`
- Modify: `src/features/facilitator-preparation/facilitatorPreparation.css`
- Modify: `src/features/decision-room/decisionRoom.css`
- Modify: `tests/hr-paysim/facilitator-preparation-ui.test.ts`

**Interfaces:**
- Consumes: existing `FOUNDER_COPY`, `PreparationIssueCode`, `PreparationPreviewRow`, `ProductEngineerSessionDraft`.
- Produces: `FOUNDER_COPY` keys prefixed `preparation.`, shared `--dr-*` CSS tokens available under `.dr-app` and `.fp-app`.

- [ ] **Step 1: Write failing copy and shared-style tests**

Create `tests/hr-paysim/task10-copy-visual-coherence.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { FOUNDER_COPY } from "../../src/lib/hr-paysim/copy/founderCopy.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("preparation copy states what is used, where it is checked, and that headers are required", () => {
  assert.equal(FOUNDER_COPY["preparation.heading"], "이번 세션에 사용할 익명 자료를 먼저 확인합니다.");
  assert.equal(FOUNDER_COPY["preparation.paste.heading"], "첫 행에 열 이름이 포함된 표를 붙여넣어 주세요.");
  assert.equal(FOUNDER_COPY["preparation.paste.action"], "자료 형식 확인");
  assert.equal(FOUNDER_COPY["preparation.ready.action"], "이 자료로 세션 시작");
  assert.match(FOUNDER_COPY["preparation.privacy"], /브라우저.*세션을 종료하면 지워집니다/);
});

test("preparation and Decision Room import one scoped visual foundation", () => {
  const foundation = read("../../src/features/decision-room/decisionRoomFoundation.css");
  const preparation = read("../../src/features/facilitator-preparation/facilitatorPreparation.css");
  const decisionRoom = read("../../src/features/decision-room/decisionRoom.css");
  assert.match(foundation, /:where\(\.dr-app, \.fp-app\)/);
  for (const token of ["--dr-ink", "--dr-muted", "--dr-line", "--dr-soft", "--dr-blue", "--dr-blue-deep", "--dr-blue-soft"]) {
    assert.match(foundation, new RegExp(token));
  }
  assert.match(preparation, /decisionRoomFoundation\.css/);
  assert.match(decisionRoom, /decisionRoomFoundation\.css/);
  assert.doesNotMatch(preparation, /--fp-/);
});
```

Extend `tests/hr-paysim/facilitator-preparation-ui.test.ts` with exact source assertions:

```ts
assert.match(preparation, /FOUNDER_COPY\["preparation\.heading"\]/);
assert.match(preparation, /필수 열 이름/);
assert.match(preparation, /row_id/);
assert.match(preparation, /role_group/);
assert.match(preparation, /base_salary_krw/);
assert.doesNotMatch(preparation, /Product Engineer roster/);
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/task10-copy-visual-coherence.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts
```

Expected: FAIL because the `preparation.*` keys and `decisionRoomFoundation.css` do not exist and old preparation copy remains.

- [ ] **Step 3: Add centralized preparation copy**

Add these exact entries to `FOUNDER_COPY`:

```ts
"preparation.eyebrow": "HR PaySim · 진행자 준비",
"preparation.heading": "이번 세션에 사용할 익명 자료를 먼저 확인합니다.",
"preparation.privacy": "붙여넣은 자료는 이 브라우저에서만 검사하며, 세션을 종료하면 지워집니다. 이름·연락처처럼 개인을 식별할 수 있는 정보는 사용하지 않습니다.",
"preparation.paste.kicker": "자료 준비",
"preparation.paste.heading": "첫 행에 열 이름이 포함된 표를 붙여넣어 주세요.",
"preparation.paste.label": "익명 직원 자료",
"preparation.paste.helper": "엑셀에서 열 이름을 포함한 전체 범위를 복사해 붙여넣습니다.",
"preparation.paste.badge": "브라우저 안에서만 확인",
"preparation.paste.action": "자료 형식 확인",
"preparation.consent.kicker": "제외할 열 확인",
"preparation.consent.heading": "개인을 식별할 수 있는 열은 제외한 뒤 계속합니다.",
"preparation.consent.support": "아래에는 열 이름만 표시됩니다. 해당 열의 값은 미리 보거나 세션에 사용하지 않습니다.",
"preparation.consent.action": "표시된 열을 제외하고 확인",
"preparation.blocked.kicker": "자료 형식을 확인해 주세요",
"preparation.blocked.heading": "아래 항목을 수정한 뒤 표 전체를 다시 붙여넣어 주세요.",
"preparation.ready.kicker": "세션 자료 확인",
"preparation.ready.heading": "이번 세션에 사용할 익명 자료입니다.",
"preparation.ready.support": "아래 항목만 세션에 사용하며 원본 이름이나 연락처는 표시하거나 저장하지 않습니다.",
"preparation.ready.action": "이 자료로 세션 시작",
```

Keep issue meanings unchanged, but move the four issue labels into `FOUNDER_COPY` using keys `preparation.issue.<lowercase-code>`.

- [ ] **Step 4: Add the scoped visual foundation**

Create `decisionRoomFoundation.css`:

```css
:where(.dr-app, .fp-app) {
  --dr-ink: #172033;
  --dr-muted: #667085;
  --dr-line: #e3e8ef;
  --dr-soft: #f6f8fb;
  --dr-blue: #2563eb;
  --dr-blue-deep: #1746a2;
  --dr-blue-soft: #edf4ff;
  min-width: 0;
  min-height: 100vh;
  color: var(--dr-ink);
  background:
    radial-gradient(circle at 92% 3%, rgba(37, 99, 235, 0.09), transparent 340px),
    #f4f6f9;
}

:where(.dr-app, .fp-app) :where(button, input, textarea):focus-visible,
:where(.dr-app, .fp-app) h1:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.38);
  outline-offset: 4px;
}
```

Import it as the first line of both feature CSS files:

```css
@import "../decision-room/decisionRoomFoundation.css";
```

For `decisionRoom.css`, use:

```css
@import "./decisionRoomFoundation.css";
```

Remove local `--fp-*` and duplicated `--dr-*` declarations, then replace `--fp-*` references with their `--dr-*` equivalents. Keep all selectors scoped to `.fp-*` or `.dr-*`.

- [ ] **Step 5: Render the approved preparation hierarchy**

Import `FOUNDER_COPY` and replace hard-coded important copy. Add this allowed-column reference immediately above the textarea:

```tsx
<div className="fp-column-reference" aria-label="붙여넣을 수 있는 열 이름">
  <strong>필수 열 이름</strong>
  <div>{["row_id", "role_group", "base_salary_krw"].map((header) => <code key={header}>{header}</code>)}</div>
  <span>선택 열은 title, level_label, level_rank, start_date, tenure_months, latest_raise_date, latest_raise_amount_krw, exception_flag, counter_offer_flag, manager_label, team_label입니다.</span>
</div>
```

Use these model-owned expressions:

```tsx
<p className="fp-eyebrow">{FOUNDER_COPY["preparation.eyebrow"]}</p>
<h1>{FOUNDER_COPY["preparation.heading"]}</h1>
<p>{FOUNDER_COPY["preparation.privacy"]}</p>
```

Keep `rawPaste`, clearing, consent, block, preview, and `onStart` logic byte-for-byte except for copy lookup and markup placement.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run the Step 2 command.

Expected: PASS. Then run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/founder-copy-scanner-boundary.test.ts
```

Expected: PASS with no new forbidden founder terms.

---

### Task 2: Generalize The Active-Subject View Model

**Files:**
- Create: `tests/hr-paysim/remaining-subjects.test.ts`
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `src/features/decision-room/decisionRoomViewModel.ts`
- Modify: `tests/hr-paysim/decision-room-ui.test.ts`
- Modify: `tests/hr-paysim/decision-room-real-input.test.ts`
- Modify: `tests/hr-paysim/decision-room-ui-invalidation.test.ts`
- Modify: `tests/hr-paysim/tenure-axis-neutral-copy.test.ts`

**Interfaces:**
- Consumes: `DecisionRoomSessionState`, `StructuralTheme`, `createEmployeeLabels`, existing metrics and repeats.
- Produces: `createDecisionRoomViewModel(state): DecisionRoomViewModel`, `DecisionRoomSubjectOption`, discriminated `evidence.visualization`, role-specific rule variant, three result rows.

- [ ] **Step 1: Write failing active-subject tests**

Create `remaining-subjects.test.ts` with these core assertions:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createDecisionRoomViewModel } from "../../src/features/decision-room/decisionRoomViewModel.ts";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";

function selectRole(roleGroup: string) {
  const state = createSyntheticDemoSession();
  const theme = state.selection.selected.find((item) => item.roleGroup === roleGroup);
  assert.ok(theme);
  state.activeThemeId = theme.id;
  return { state, theme };
}

test("projects all three selected subjects from activeThemeId", () => {
  const model = createDecisionRoomViewModel(createSyntheticDemoSession());
  assert.deepEqual(model.subjects.map(({ roleGroup }) => roleGroup), ["Product Engineer", "Platform Engineer", "GTM"]);
  assert.equal(model.cleanState?.roleGroup, "Designer");
  assert.match(model.cleanState!.statement, /현재 샘플 자료 범위/);
  assert.match(model.cleanState!.statement, /모든 보상 기준이 완전하다는 뜻은 아닙니다/);
});

test("projects Platform comparison as tenure evidence", () => {
  const { state } = selectRole("Platform Engineer");
  const model = createDecisionRoomViewModel(state);
  assert.equal(model.activeRoleGroup, "Platform Engineer");
  assert.equal(model.evidence.visualization.kind, "tenure");
  assert.equal(model.evidence.highlightedPair.difference, "1,800만원");
  assert.match(model.evidence.conclusion, /근속 60개월인 직원 A.*근속 17개월인 직원 B.*1,800만원/);
  assert.ok(model.evidence.supportingObservations.length <= 2);
});

test("projects GTM level order with exact three metric meanings", () => {
  const { state } = selectRole("GTM");
  const model = createDecisionRoomViewModel(state);
  assert.equal(model.evidence.visualization.kind, "level_order");
  assert.deepEqual(model.evidence.visualization.metrics, [
    { label: "직원 A와 직원 B의 현재 기본 연봉 차이", amount: "400만원" },
    { label: "두 직원의 차이를 0원으로 놓는 계산", amount: "400만원" },
    { label: "AE2 두 명을 가장 높은 AE1과 같은 금액으로 놓는 계산 합계", amount: "500만원" },
  ]);
  assert.match(model.evidence.visualization.nonClaim, /인상액.*권장 연봉.*승인한 기준이 아닙니다/);
});

test("creates explicit pending rows for unanswered subjects", () => {
  const model = createDecisionRoomViewModel(createSyntheticDemoSession());
  assert.deepEqual(model.result.rows.map((row) => row.roleGroup), ["Product Engineer", "Platform Engineer", "GTM"]);
  assert.equal(model.result.rows[1]!.founderExplanation, "확인 필요");
  assert.equal(model.result.rows[2]!.decision, "확인 필요");
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/remaining-subjects.test.ts
```

Expected: FAIL because `createDecisionRoomViewModel` and role-specific projections do not exist.

- [ ] **Step 3: Add exact role copy keys**

Add these keys to `FOUNDER_COPY`:

```ts
"screen.introduction.conclusion": "이번 세션에서는 같은 역할 안에서 확인된 연봉 차이를 비교하고, 다음 채용과 인사평가 전에 회사가 정할 기준을 정리합니다.",
"screen.introduction.first_action": "첫 번째 연봉 비교 보기",
"screen.evidence.platform.review_focus": "최근 채용 조건과 기존 직원의 연봉 검토 기준이 다르게 적용되었는지 확인합니다.",
"screen.evidence.platform.explanation_question": "근속이 짧은 직원의 연봉이 더 높은 가장 가까운 이유를 하나 선택해 주세요.",
"screen.evidence.gtm.review_focus": "직급별 역할 기준과 연봉 결정 기준이 같은 순서로 적용되는지 확인합니다.",
"screen.evidence.gtm.explanation_question": "AE1과 AE2의 연봉 순서가 일부 다른 가장 가까운 이유를 하나 선택해 주세요.",
"screen.evidence.gtm.non_claim": "이 계산은 현재 직급 순서와 기본 연봉을 비교하기 위한 가정입니다. 인상액, 권장 연봉 또는 회사가 승인한 기준이 아닙니다.",
"screen.evidence.designer.clean": "Designer 2명은 현재 샘플 자료 범위에서 별도로 설명이 필요한 연봉 차이가 확인되지 않았습니다. 회사의 모든 보상 기준이 완전하다는 뜻은 아닙니다.",
"state.review_pending": "확인 필요",
```

Add small formatter functions rather than hard-coding dynamic employee labels:

```ts
export function formatTenureEvidenceTitle(input: {
  roleGroup: string;
  employeeCount: number;
  lowerPaidLabel: string;
  lowerPaidTenureMonths: number;
  higherPaidLabel: string;
  higherPaidTenureMonths: number;
  headlineGapKRW: number;
}): string;

export function formatGtmEvidenceTitle(input: {
  employeeCount: number;
  lowerPaidLabel: string;
  lowerPaidLevel: string;
  higherPaidLabel: string;
  higherPaidLevel: string;
  headlineGapKRW: number;
}): string;
```

Both functions reuse the existing safe amount, label, count, and tenure validators.

- [ ] **Step 4: Define active-subject model types**

Export these types from `decisionRoomViewModel.ts`:

```ts
export interface DecisionRoomSubjectOption {
  id: string;
  roleGroup: string;
  reviewStatus: "answered" | "pending";
}

export type EvidenceVisualization =
  | {
      kind: "tenure";
      distribution: Array<{
        employeeLabel: string;
        salary: string;
        salaryKRW: number;
        tenure: string;
        tenureMonths?: number;
        highlighted: boolean;
      }>;
      kicker: string;
      heading: string;
    }
  | {
      kind: "level_order";
      groups: Array<{
        levelLabel: string;
        employees: Array<{ employeeLabel: string; salary: string; salaryKRW: number; highlighted: boolean }>;
      }>;
      metrics: Array<{ label: string; amount: string }>;
      nonClaim: string;
    };
```

Export `createDecisionRoomViewModel\u0060 with exactly one \u0060DecisionRoomSessionState\u0060 parameter and let TypeScript infer the complete projection return type. Do not add a circular explicit return alias.

Remove the Product-only export after updating all repository imports in this task.

- [ ] **Step 5: Implement active theme and role projections**

Resolve the active theme exactly:

```ts
const activeTheme = state.selection.selected.find((item) => item.id === state.activeThemeId)
  ?? state.selection.selected[0];
if (!activeTheme?.headlinePair) throw new Error("ACTIVE_COMPARISON_REQUIRED");
```

Build subjects without mutating review state:

```ts
const subjects = state.selection.selected.map((theme) => ({
  id: theme.id,
  roleGroup: theme.roleGroup,
  reviewStatus: state.reviews[theme.id]?.explanationBasis !== undefined
    && state.reviews[theme.id]?.explanationBasis !== "unanswered"
    ? "answered" as const
    : "pending" as const,
}));
```

Use `activeTheme.archetype === "level_integrity"` for GTM level-order evidence. Use the existing tenure distribution path for Product and Platform. Read GTM values only from:

```ts
activeTheme.metrics.headlineGapKRW
activeTheme.metrics.pairRepairFloorKRW
activeTheme.metrics.systemRepairFloorKRW
```

Never call metric calculators from the view model.

Build Designer clean state only when sample rows include Designer and no theme uses that role group:

```ts
const designerRows = state.rows.filter((row) => row.roleGroup === "Designer");
const cleanState = designerRows.length > 0 && !state.themes.some((theme) => theme.roleGroup === "Designer")
  ? { roleGroup: "Designer", statement: FOUNDER_COPY["screen.evidence.designer.clean"] }
  : undefined;
```

Cap each role's supporting observations with `.slice(0, 2)` after translating them into plain Korean.

- [ ] **Step 6: Build three result rows without inferred review content**

Map every selected theme to one result row. Use `확인 필요` for missing review/evidence/decision and never borrow the active subject's values:

```ts
const pending = FOUNDER_COPY["state.review_pending"];
const resultRows = state.selection.selected.map((theme) => {
  const review = state.reviews[theme.id];
  const decision = state.decisions.find((item) => item.themeIds.includes(theme.id));
  return {
    roleGroup: theme.roleGroup,
    confirmed: buildObservedConclusion(state.rows, theme),
    founderExplanation: review?.explanationBasis && review.explanationBasis !== "unanswered"
      ? explanationLabels[review.explanationBasis]
      : pending,
    evidence: review?.evidenceStatus && review.evidenceStatus !== "unanswered"
      ? evidenceLabels[review.evidenceStatus]
      : pending,
    decision: decision ? actionLabels[decision.actionKey] : pending,
    owner: decision ? ownerLabels[decision.ownerRole] : pending,
    due: decision ? dueLabels[decision.dueEvent] : pending,
  };
});
```

`buildObservedConclusion(rows, theme)` must derive only the role's current headline pair and role rows.

- [ ] **Step 7: Update imports and verify Product regression**

Replace all `createProductEngineerDecisionRoomViewModel` imports in the files listed for this task with `createDecisionRoomViewModel`. Keep exact existing Product assertions for:

- employee A/B labels;
- 2,700만원 gap;
- observed repeat values;
- Task 9 plot line ratios and styles;
- real-input Product-only behavior;
- dependency invalidation.

- [ ] **Step 8: Run focused tests and verify GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/remaining-subjects.test.ts tests/hr-paysim/decision-room-ui.test.ts tests/hr-paysim/decision-room-real-input.test.ts tests/hr-paysim/decision-room-ui-invalidation.test.ts tests/hr-paysim/tenure-axis-neutral-copy.test.ts
```

Expected: PASS.

---

### Task 3: Add Subject Selector And GTM Level-Order Evidence

**Files:**
- Create: `src/features/decision-room/SubjectSelector.tsx`
- Create: `src/features/confirmed-pay-differences/LevelOrderDistribution.tsx`
- Modify: `src/features/decision-room/DecisionRoomApp.tsx`
- Modify: `src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx`
- Modify: `src/features/confirmed-pay-differences/SalaryDistribution.tsx`
- Modify: `src/features/decision-room/decisionRoom.css`
- Modify: `tests/hr-paysim/remaining-subjects.test.ts`
- Modify: `tests/hr-paysim/decision-room-ui.test.ts`

**Interfaces:**
- Consumes: `DecisionRoomSubjectOption[]`, `EvidenceVisualization`, `dispatch({type:"SELECT_THEME"})`.
- Produces: accessible in-place subject switching and role-appropriate Screen 2 evidence.

- [ ] **Step 1: Write failing component-source tests**

Append to `remaining-subjects.test.ts`:

```ts
import { readFileSync } from "node:fs";

test("Screen 2 enables all selected subjects and renders evidence by kind", () => {
  const screen = readFileSync(new URL("../../src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx", import.meta.url), "utf8");
  const selector = readFileSync(new URL("../../src/features/decision-room/SubjectSelector.tsx", import.meta.url), "utf8");
  const levelOrder = readFileSync(new URL("../../src/features/confirmed-pay-differences/LevelOrderDistribution.tsx", import.meta.url), "utf8");
  assert.match(screen, /<SubjectSelector/);
  assert.match(screen, /visualization\.kind === "tenure"/);
  assert.match(screen, /<LevelOrderDistribution/);
  assert.doesNotMatch(screen, /button type="button" disabled/);
  assert.match(selector, /aria-pressed/);
  assert.match(levelOrder, /model\.metrics/);
  assert.match(levelOrder, /model\.nonClaim/);
});
```

- [ ] **Step 2: Run focused test and verify RED**

Run the Task 2 Step 8 command.

Expected: FAIL because both new components are absent and Screen 2 still hard-codes disabled buttons.

- [ ] **Step 3: Implement `SubjectSelector`**

Create:

```tsx
import type { DecisionRoomSubjectOption } from "./decisionRoomViewModel.ts";

export function SubjectSelector({
  subjects,
  activeId,
  onSelect,
}: {
  subjects: DecisionRoomSubjectOption[];
  activeId: string;
  onSelect(themeId: string): void;
}) {
  return (
    <div className="dr-subject-row" aria-label="금번 화면에서 검토할 역할">
      {subjects.map((subject, index) => {
        const active = subject.id === activeId;
        return (
          <button
            key={subject.id}
            type="button"
            className={active ? "is-active" : ""}
            aria-pressed={active}
            onClick={() => onSelect(subject.id)}
          >
            <span>{subject.roleGroup}</span>
            <small>{active ? `${index + 1}/${subjects.length} 확인 중` : subject.reviewStatus === "answered" ? "답변 있음" : "확인 필요"}</small>
          </button>
        );
      })}
    </div>
  );
}
```

Do not use visited state or mark a subject answered on click.

- [ ] **Step 4: Implement `LevelOrderDistribution`**

Create a component that receives the level-order branch only:

```tsx
import type { EvidenceVisualization } from "../decision-room/decisionRoomViewModel.ts";

type LevelOrderModel = Extract<EvidenceVisualization, { kind: "level_order" }>;

export function LevelOrderDistribution({ model }: { model: LevelOrderModel }) {
  return (
    <section className="dr-panel dr-level-order" aria-labelledby="level-order-title">
      <div className="dr-panel-heading">
        <div>
          <p className="dr-section-kicker">GTM 직급별 기본 연봉</p>
          <h2 id="level-order-title">AE1과 AE2의 기본 연봉을 직급별로 나누어 표시했습니다.</h2>
        </div>
        <span>직원 4명 전체</span>
      </div>
      <div className="dr-level-groups" role="img" aria-label="AE1과 AE2 직원의 기본 연봉 분포">
        {model.groups.map((group) => (
          <section key={group.levelLabel} aria-label={group.levelLabel}>
            <h3>{group.levelLabel}</h3>
            {group.employees.map((employee) => (
              <article className={employee.highlighted ? "is-highlighted" : ""} key={employee.employeeLabel}>
                <span>{employee.employeeLabel}</span>
                <strong>{employee.salary}</strong>
              </article>
            ))}
          </section>
        ))}
      </div>
      <dl className="dr-level-metrics">
        {model.metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.amount}</dd></div>)}
      </dl>
      <p className="dr-trend-non-claim">{model.nonClaim}</p>
    </section>
  );
}
```

Do not import or invoke any metric calculator.

- [ ] **Step 5: Wire Screen 2 and DecisionRoomApp**

In `DecisionRoomApp`, replace the old factory and pass:

```tsx
onSubjectSelect={(themeId) => dispatch({ type: "SELECT_THEME", themeId })}
```

In `ConfirmedPayDifferencesScreen`, replace the hard-coded row with:

```tsx
<SubjectSelector
  subjects={model.subjects}
  activeId={subjectId}
  onSelect={onSubjectSelect}
/>
```

Render evidence by discriminator:

```tsx
{model.visualization.kind === "tenure" ? (
  <SalaryDistribution
    distribution={model.visualization.distribution}
    distributionKicker={model.visualization.kicker}
    distributionHeading={model.visualization.heading}
  />
) : (
  <LevelOrderDistribution model={model.visualization} />
)}
```

Render `model.cleanState` after evidence using `.dr-clean-state`. Keep the current evidence DOM order and action bar.

- [ ] **Step 6: Add selector, level-order, and clean-state CSS**

Use existing tokens and component radii. Required structural rules:

```css
.dr-subject-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.dr-subject-row button { min-width: 0; min-height: 58px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border: 1px solid var(--dr-line); border-radius: 12px; color: #475467; background: #fff; cursor: pointer; }
.dr-subject-row button.is-active { border-color: #9abcf8; color: var(--dr-ink); background: var(--dr-blue-soft); box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.05); }
.dr-level-groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.dr-level-groups > section { padding: 18px; border: 1px solid var(--dr-line); border-radius: 14px; background: var(--dr-soft); }
.dr-level-groups article.is-highlighted { border-color: var(--dr-blue); background: var(--dr-blue-soft); }
.dr-level-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.dr-clean-state { padding: 16px 18px; border: 1px solid var(--dr-line); border-left: 3px solid #98a2b3; border-radius: 0 12px 12px 0; background: #fff; }
```

At `max-width: 640px`, make selector, level groups, and metrics one column.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run the Task 2 Step 8 command plus:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-component-state.test.ts
```

Expected: PASS.

---

### Task 4: Connect Subject-Scoped Rule And Result Screens

**Files:**
- Modify: `src/features/company-rule/CompanyRuleScreen.tsx`
- Modify: `src/features/session-result/SessionResultScreen.tsx`
- Modify: `src/features/decision-room/DecisionRoomApp.tsx`
- Modify: `src/features/decision-room/decisionRoomViewModel.ts`
- Modify: `src/features/decision-room/decisionRoom.css`
- Modify: `tests/hr-paysim/remaining-subjects.test.ts`
- Modify: `tests/hr-paysim/decision-room-ui-invalidation.test.ts`
- Modify: `tests/hr-paysim/demo-runtime-contract.test.ts`

**Interfaces:**
- Consumes: subject selector, active-subject rule variant, three result rows, existing reducer invalidation.
- Produces: Screen 3 subject switching and Screen 4 subject-isolated rows with pending states.

- [ ] **Step 1: Write failing rule/result tests**

Append:

```ts
test("GTM rule uses level-order comparison and never calls it a repeat", () => {
  const { state } = selectRole("GTM");
  const model = createDecisionRoomViewModel(state);
  assert.equal(model.rule.variant.kind, "level_order");
  assert.deepEqual(model.rule.variant.metrics.map((item) => item.amount), ["400만원", "400만원", "500만원"]);
  assert.doesNotMatch(JSON.stringify(model.rule.variant), /다음 채용자|한 번 더 반복/);
});

test("subject switch does not borrow Product repeat or decision", () => {
  const { state } = selectRole("Platform Engineer");
  const model = createDecisionRoomViewModel(state);
  assert.equal(model.rule.variant.kind, "pending");
  assert.doesNotMatch(JSON.stringify(model.rule), /9,500만원|2,700만원|추가 보상 기준을 다음 채용/);
});
```

Extend source tests to require `<SubjectSelector` in `CompanyRuleScreen.tsx` and `row.roleGroup` in `SessionResultScreen.tsx`.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/remaining-subjects.test.ts tests/hr-paysim/decision-room-ui-invalidation.test.ts tests/hr-paysim/demo-runtime-contract.test.ts
```

Expected: FAIL because Screen 3 remains Product-specific and Screen 4 has one row.

- [ ] **Step 3: Add discriminated Screen 3 variants**

Define:

```ts
type RuleVariant =
  | { kind: "observed_precedent"; heading: string; metrics: Array<{ label: string; value: string }>; nonClaim: string }
  | { kind: "level_order"; heading: string; metrics: Array<{ label: string; amount: string }>; nonClaim: string }
  | { kind: "pending"; heading: string; missing: string[] };
```

Rules:

- Product with its canonical repeat renders `observed_precedent` unchanged.
- Platform without a theme-scoped repeat renders `pending`.
- GTM always renders `level_order` from its theme metric fields and the GTM non-claim.
- A repeat or decision must match `activeTheme.id`; never fall back to another theme.

- [ ] **Step 4: Render the same selector on Screen 3**

Pass `subjects`, `subjectId`, and `onSubjectSelect` into `CompanyRuleScreen` and render `SubjectSelector` before the hero. Branch only on `model.variant.kind`; each branch renders its own heading and metrics. The shared missing-condition and decision areas use only the active theme's decision.

Keep one primary action at the bottom.

- [ ] **Step 5: Render all selected subjects on Screen 4**

Add role group to each record row:

```tsx
<div className="dr-record-row" role="row" key={row.roleGroup}>
  <div role="rowheader" className="dr-record-subject"><strong>{row.roleGroup}</strong></div>
  {[row.confirmed, row.founderExplanation, row.evidence, row.decision, row.owner, row.due].map(/* existing cell mapping */)}
</div>
```

Render bounded context below the record:

```tsx
{model.cleanState ? <aside className="dr-clean-state"><strong>{model.cleanState.roleGroup}</strong><p>{model.cleanState.statement}</p></aside> : null}
{model.unselectedSubjects.length > 0 ? (
  <section className="dr-unselected"><h2>이번 세션에서 검토하지 않은 항목</h2><ul>{model.unselectedSubjects.map((item) => <li key={item.id}>{item.roleGroup}</li>)}</ul></section>
) : null}
```

Do not describe an unanswered row as confirmed, explained, or approved.

- [ ] **Step 6: Preserve subject-scoped invalidation**

Add a regression test that changes Platform review state and asserts Product repeat/decision survive while Platform-derived content is absent; then change Product review state and assert only Product repeat/decision disappear. Do not modify `decisionRoomReducer.ts` because its current `invalidateThemeDerivations` contract already provides this behavior.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run the Step 2 command plus:

```powershell
node --experimental-strip-types --test tests/hr-paysim/dependency-invalidation.test.ts tests/hr-paysim/session-report.test.ts tests/hr-paysim/report-review-boundary.test.ts
```

Expected: PASS.

---

### Task 5: Browser QA, Full Verification, And Product Commit

**Files:**
- Modify: `scripts/qa-decision-room.mjs`
- Modify: any Task 10 test file only when a fresh check exposes a genuine contract mismatch.
- Verify: all Task 10 product files from Tasks 1–4.

**Interfaces:**
- Consumes: completed Task 10 UI and exact accepted copy/metric contracts.
- Produces: fresh automated evidence, clean diff, one Task 10 product commit ready for independent review.

- [ ] **Step 1: Update QA expectations from disabled to enabled subjects**

Replace the old disabled-subject assertion with exact enabled-role checks:

```js
const subjectButtons = page.locator(".dr-subject-row button");
if (await subjectButtons.count() !== 3) throw new Error("Decision Room must expose three selected subjects");
if (await page.locator(".dr-subject-row button:disabled").count() !== 0) throw new Error("Selected subjects must be enabled");
```

Click Platform and assert:

```js
await page.getByRole("button", { name: /Platform Engineer/ }).click();
await page.locator('[data-conclusion-heading="true"]').waitFor();
const platformText = await page.locator('[data-screen="confirmed_pay_differences"]').innerText();
if (!/1,800만원/.test(platformText) || !/근속 60개월/.test(platformText) || !/근속 17개월/.test(platformText)) {
  throw new Error("Platform evidence contract mismatch");
}
```

Click GTM and assert:

```js
await page.getByRole("button", { name: /^GTM/ }).click();
const gtmText = await page.locator('[data-screen="confirmed_pay_differences"]').innerText();
for (const expected of ["400만원", "500만원", "권장 연봉", "승인한 기준이 아닙니다"]) {
  if (!gtmText.includes(expected)) throw new Error(`GTM visible contract missing: ${expected}`);
}
```

Assert the active conclusion owns focus after both switches and `Designer 2명` plus the bounded non-claim are visible.

- [ ] **Step 2: Add preparation visual/copy QA**

At both facilitator viewports, assert:

```js
const preparationText = await facilitatorPage.locator('[data-facilitator-preparation="true"]').innerText();
for (const expected of ["익명 자료", "첫 행에 열 이름", "브라우저 안에서만", "필수 열 이름"]) {
  if (!preparationText.includes(expected)) throw new Error(`Preparation copy missing: ${expected}`);
}
```

Keep all existing raw clearing, PII column/value blocking, unsupported role, no-storage, no-URL-data, focus, overflow, session-end, and console assertions.

- [ ] **Step 3: Run focused Task 10 tests**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/task10-copy-visual-coherence.test.ts tests/hr-paysim/remaining-subjects.test.ts tests/hr-paysim/facilitator-preparation-ui.test.ts tests/hr-paysim/decision-room-ui.test.ts tests/hr-paysim/decision-room-ui-invalidation.test.ts tests/hr-paysim/tenure-axis-neutral-copy.test.ts
```

Expected: all focused tests PASS.

- [ ] **Step 4: Run fresh full verification**

Run each command from the current state; do not reuse output from another task:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

Expected:

- lint exits 0 with no forbidden founder copy;
- every test passes;
- TypeScript exits 0;
- Vite production build exits 0;
- browser QA exits 0 at 1280x720, 1440x900, and 390px with no console error or overflow;
- governance verifier prints `[OK]`;
- `git diff --check` prints nothing.

- [ ] **Step 5: Inspect final scope before staging**

Run:

```powershell
git status --short
git diff --stat
git diff -- src/lib/hr-paysim/metrics src/lib/hr-paysim/structuralFindings.ts src/lib/hr-paysim/themes/buildStructuralThemes.ts src/lib/hr-paysim/session/decisionRoomReducer.ts src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts src/lib/hr-paysim/rosterFixtures.ts
```

Expected: only planned Task 10 files changed; the explicit no-modify diff prints nothing.

- [ ] **Step 6: Stage the exact Task 10 product scope and verify staged diff**

Stage only the files listed under Create/Modify in this plan, excluding the already committed design and plan documents. Then run:

```powershell
git diff --cached --check
git diff --cached --name-status
```

Expected: no unrelated file, no governance upstream file, no raw roster, no generated QA artifact.

- [ ] **Step 7: Commit the verified Task 10 package**

Commit once with:

```powershell
git commit -m "feat: connect remaining decision-room subjects"
```

- [ ] **Step 8: Request independent review and stop before Task 11/12**

Review against:

- the approved design spec;
- this plan;
- exact Platform 1,800만원 and GTM 400만/400만/500만원 meanings;
- Designer bounded clean state;
- Product chart coordinate regression;
- no copied HR Prism literals;
- fresh verification evidence.

Do not automatically start Task 11, Task 12, a real-roster pilot, deployment work, or a pull request.
