# HR PaySim Task 9 Screen 2 Comprehension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the existing Product Engineer four-screen vertical slice by making Screen 2 immediately understandable, proving the 27 million won headline is data-derived, passing fresh automated verification, and passing a multi-participant human comprehension gate before the Task 9 commit.

**Architecture:** Keep the existing Task 8 session and invalidation model unchanged. Centralize the new title, supporting copy, and action prompt in the founder-copy module; derive the title amount from `StructuralTheme.metrics.headlineGapKRW`; expose the resulting fields through `createProductEngineerDecisionRoomViewModel()`; and render a simplified Screen 2 hierarchy without changing routes or adding screens. Governance Adapter and root work-guide work are explicitly deferred to a separate plan after the upstream governance schema has a stable verified commit SHA.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Node test runner with `--experimental-strip-types`, Playwright 1.61, CSS.

## Global Constraints

- Work only in `C:\tmp\hr-paysim-facilitated-decision-room` on branch `codex/facilitated-decision-room`.
- Preserve commits `6a25893`, `b28d0d8`, and `48b6b3c`; do not weaken Task 8 ownership, invalidation, cloning, or runtime validation.
- Preserve the existing uncommitted Task 9 files; do not reset, clean, or overwrite unrelated work.
- The four-screen UX SSOT remains `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`.
- The integration design remains `docs/superpowers/specs/2026-07-12-hr-paysim-governance-task9-integration-design.md`.
- Do not modify the shared Constitution, shared casebook, HR Prism code, PaySim Adapter, root `AGENTS.md`, or legacy authority notes in this plan.
- Screen 2 must expose exactly one primary action and the demo must reach Screen 4 in exactly three primary actions.
- The 27 million won headline must be derived from `selectedTheme.metrics.headlineGapKRW`; do not hard-code it in the view model or component.
- Important conclusion, state, non-claim, and action copy belongs in `src/lib/hr-paysim/copy/founderCopy.ts`.
- Changing `ExplanationBasis` or `EvidenceStatus` must remove dependent interpretations, repeat results, decisions, report copy, and export copy before rendering again.
- Observed hiring precedent is not an approved company rule; `repeatabilityStatus: unanswered` must never render as reusable policy.
- Founder-facing output must not contain employee row IDs or internal detector terms.
- At 1280 x 720 and 1440 x 900, the first Screen 2 viewport must show the compared cohorts, the maximum gap, and the requested founder action.
- At 390 px, require non-breaking reflow and no horizontal page overflow; do not require desktop feature-density parity.
- Do not commit any Task 9 implementation file before every automated check passes and the human gate passes for at least two participants.
- At least one human-gate participant must be reasonably close to the target audience, such as a growth-stage founder or operator.
- Task 10 is out of scope and requires a new explicit approval.

---

## File Responsibility Map

- `src/lib/hr-paysim/copy/founderCopy.ts`: founder-facing Screen 2 copy and the deterministic headline formatter.
- `src/features/decision-room/decisionRoomViewModel.ts`: resolves the Product Engineer theme, validates `headlineGapKRW`, and supplies Screen 2 display fields.
- `src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx`: renders the title, supporting explanation, above-the-fold action prompt, evidence, controls, and single primary CTA.
- `src/features/decision-room/decisionRoom.css`: reduces decorative containers and establishes the desktop and mobile visual hierarchy.
- `tests/hr-paysim/founder-copy.test.ts`: locks the new copy keys and deterministic headline formatter boundaries.
- `tests/hr-paysim/decision-room-ui.test.ts`: locks data derivation, copy ownership, component field usage, and reading order.
- `tests/hr-paysim/decision-room-component-state.test.ts`: preserves model-owned invalidatable downstream state.
- `tests/hr-paysim/decision-room-ui-invalidation.test.ts`: proves changed explanations do not revive old repeat or decision copy.
- `scripts/qa-decision-room.mjs`: verifies desktop first-viewport comprehension cues, three-action navigation, focus, overflow, keyboard flow, invalidation, copy, storage, session end, and console cleanliness.
- `docs/hr-paysim/validation/task9-screen2-comprehension.md`: stores only real, de-identified participant answers after the human test occurs.

### Task 1: Lock The Data-Derived Screen 2 Copy Contract

**Files:**
- Modify: `tests/hr-paysim/founder-copy.test.ts`
- Modify: `tests/hr-paysim/decision-room-ui.test.ts`
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `src/features/decision-room/decisionRoomViewModel.ts`

**Interfaces:**
- Consumes: `DecisionRoomSessionState`, `StructuralTheme.metrics.headlineGapKRW`, and existing `FOUNDER_COPY` values.
- Produces: `formatProductEngineerEvidenceTitle(headlineGapKRW: number): string` and `evidence.supportingCopy`, `evidence.actionPrompt`, and `evidence.explanationQuestion` fields.

- [ ] **Step 1: Add a failing view-model test for the short title and data-derived amount**

Add this test to `tests/hr-paysim/decision-room-ui.test.ts`:

```ts
test("derives the Screen 2 title and action from the Product Engineer headline gap", () => {
  const demo = createSyntheticDemoSession();
  const model = createProductEngineerDecisionRoomViewModel(demo);

  assert.equal(
    model.evidence.conclusion,
    "Product Engineer 장기 근속자와 최근 입사자의 연봉은 최대 2,700만원 차이납니다.",
  );
  assert.equal(
    model.evidence.supportingCopy,
    "장기 근속자 3명은 6,800만~7,600만원, 최근 입사자 3명은 8,800만~9,500만원입니다. 현재 자료에 기록된 역할·근속 기간·채용 예외 기록만으로는 이 차이를 직원들에게 일관되게 설명할 기준을 확인하기 어렵습니다.",
  );
  assert.equal(
    model.evidence.actionPrompt,
    "이 차이가 생긴 가장 가까운 이유를 하나 선택하고, 그 설명을 확인할 기록이 있는지 이어서 답해 주세요.",
  );
  assert.equal(
    model.evidence.explanationQuestion,
    "이 차이가 생긴 가장 가까운 이유를 하나 선택해 주세요.",
  );

  const changed = structuredClone(demo);
  const product = changed.selection.selected.find(
    (item) => item.roleGroup === "Product Engineer",
  );
  assert.ok(product);
  product.metrics.headlineGapKRW = 5_000_000;

  assert.equal(
    createProductEngineerDecisionRoomViewModel(changed).evidence.conclusion,
    "Product Engineer 장기 근속자와 최근 입사자의 연봉은 최대 500만원 차이납니다.",
  );
});
```

Also update the import in `tests/hr-paysim/founder-copy.test.ts` to include `formatProductEngineerEvidenceTitle`, and replace the old `screen.evidence.product_engineer.conclusion` assertion with:

```ts
test("locks the Product Engineer supporting copy, prompt, and title formatter", () => {
  assert.match(
    FOUNDER_COPY["screen.evidence.product_engineer.supporting"],
    /장기 근속자 3명.*6,800만~7,600만원.*최근 입사자 3명.*8,800만~9,500만원/,
  );
  assert.equal(
    FOUNDER_COPY["screen.evidence.product_engineer.action_prompt"],
    "이 차이가 생긴 가장 가까운 이유를 하나 선택하고, 그 설명을 확인할 기록이 있는지 이어서 답해 주세요.",
  );
  assert.equal(
    formatProductEngineerEvidenceTitle(27_000_000),
    "Product Engineer 장기 근속자와 최근 입사자의 연봉은 최대 2,700만원 차이납니다.",
  );
  assert.throws(
    () => formatProductEngineerEvidenceTitle(-1),
    /INVALID_PRODUCT_ENGINEER_HEADLINE_GAP/,
  );
  assert.match(FOUNDER_COPY["non_claim.higher_salary"], /높은 직원.*잘못됐다는 뜻은 아닙니다/);
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-ui.test.ts
```

Expected: FAIL because the new copy keys and formatter do not exist, `supportingCopy` and `actionPrompt` are absent, and the current conclusion is the long paragraph.

- [ ] **Step 3: Add the centralized copy and deterministic title formatter**

In `src/lib/hr-paysim/copy/founderCopy.ts`, replace the existing Product Engineer conclusion key with these values and add the formatter after `FounderCopyKey`:

```ts
"screen.evidence.product_engineer.supporting":
  "장기 근속자 3명은 6,800만~7,600만원, 최근 입사자 3명은 8,800만~9,500만원입니다. 현재 자료에 기록된 역할·근속 기간·채용 예외 기록만으로는 이 차이를 직원들에게 일관되게 설명할 기준을 확인하기 어렵습니다.",
"screen.evidence.product_engineer.action_prompt":
  "이 차이가 생긴 가장 가까운 이유를 하나 선택하고, 그 설명을 확인할 기록이 있는지 이어서 답해 주세요.",
"screen.evidence.product_engineer.explanation_question":
  "이 차이가 생긴 가장 가까운 이유를 하나 선택해 주세요.",
```

```ts
export function formatProductEngineerEvidenceTitle(headlineGapKRW: number): string {
  if (
    !Number.isSafeInteger(headlineGapKRW)
    || headlineGapKRW < 0
    || headlineGapKRW % 10_000 !== 0
  ) {
    throw new Error("INVALID_PRODUCT_ENGINEER_HEADLINE_GAP");
  }
  const amount = (headlineGapKRW / 10_000).toLocaleString("ko-KR");
  return `Product Engineer 장기 근속자와 최근 입사자의 연봉은 최대 ${amount}만원 차이납니다.`;
}
```

Do not retain `screen.evidence.product_engineer.conclusion`; the view model must not have two competing title sources.

- [ ] **Step 4: Resolve the new fields from the Product Engineer theme**

Update the import in `src/features/decision-room/decisionRoomViewModel.ts`:

```ts
import {
  FOUNDER_COPY,
  formatProductEngineerEvidenceTitle,
} from "../../lib/hr-paysim/copy/founderCopy.ts";
```

After the `selectedTheme.headlinePair` guard, add:

```ts
const headlineGapKRW = selectedTheme.metrics.headlineGapKRW;
if (typeof headlineGapKRW !== "number") {
  throw new Error("PRODUCT_ENGINEER_HEADLINE_GAP_REQUIRED");
}
```

Replace the Screen 2 copy fields with:

```ts
conclusion: formatProductEngineerEvidenceTitle(headlineGapKRW),
supportingCopy: FOUNDER_COPY["screen.evidence.product_engineer.supporting"],
actionPrompt: FOUNDER_COPY["screen.evidence.product_engineer.action_prompt"],
explanationQuestion:
  FOUNDER_COPY["screen.evidence.product_engineer.explanation_question"],
```

- [ ] **Step 5: Run copy and view-model tests**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/decision-room-ui.test.ts
```

Expected: PASS. `model.evidence.conclusion` changes from `2,700만원` to `500만원` when only `metrics.headlineGapKRW` changes.

- [ ] **Step 6: Keep the change uncommitted**

Run:

```powershell
git status --short
```

Expected: the Task 9 working files remain modified or untracked; no commit is created before the human gate.

### Task 2: Rebuild Screen 2 Information Hierarchy Without Adding A Screen

**Files:**
- Modify: `tests/hr-paysim/decision-room-ui.test.ts`
- Modify: `src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx`
- Modify: `src/features/decision-room/decisionRoom.css`

**Interfaces:**
- Consumes: Task 1 `EvidenceModel` fields `conclusion`, `supportingCopy`, `actionPrompt`, and `explanationQuestion`.
- Produces: `.dr-evidence-hero`, `.dr-screen-task`, and a stable source order of hero, distribution, highlighted comparison, observations, question, evidence table, and primary action.

- [ ] **Step 1: Add failing component-ownership and order assertions**

Extend the existing `screen components render model-owned evidence and centralized result feedback` test in `tests/hr-paysim/decision-room-ui.test.ts`:

```ts
assert.match(evidence, /model\.supportingCopy/);
assert.match(evidence, /model\.actionPrompt/);
assert.match(evidence, /dr-evidence-hero/);
assert.match(evidence, /dr-screen-task/);

const evidenceOrder = [
  "dr-evidence-hero",
  "<SalaryDistribution",
  "dr-highlight-card",
  "dr-observations",
  "dr-question-card",
  "<EvidenceTable",
  "dr-action-bar",
].map((token) => evidence.indexOf(token));
assert.ok(evidenceOrder.every((position) => position >= 0));
assert.ok(evidenceOrder.every(
  (position, index) => index === 0 || position > evidenceOrder[index - 1]!,
));
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-ui.test.ts
```

Expected: FAIL because the component does not render `supportingCopy`, `actionPrompt`, `.dr-evidence-hero`, or `.dr-screen-task`.

- [ ] **Step 3: Render the concise hero and visible action prompt**

Replace the Screen 2 header in `ConfirmedPayDifferencesScreen.tsx` with:

```tsx
<header className="dr-hero dr-evidence-hero">
  <div>
    <p className="dr-eyebrow">{model.heading} · Product Engineer</p>
    <h1 ref={headingRef} tabIndex={-1} data-conclusion-heading="true">
      {model.conclusion}
    </h1>
    <p className="dr-lead">{model.supportingCopy}</p>
    <p className="dr-non-claim">{model.nonClaim}</p>
    <p className="dr-screen-task">
      <strong>지금 대표님이 하실 일</strong>
      <span>{model.actionPrompt}</span>
    </p>
  </div>
</header>
```

Keep the existing control order and one primary action. Do not move the explanation controls above the evidence or add a modal.

- [ ] **Step 4: Simplify containers and preserve the downward gaze path**

Update `src/features/decision-room/decisionRoom.css` with these focused rules, replacing the existing decorative values for the same selectors:

```css
.dr-evidence-hero {
  padding: 4px 0 20px;
  border-bottom: 1px solid #dfe5ed;
}

.dr-evidence-hero h1 { max-width: 960px; }
.dr-evidence-hero .dr-lead { max-width: 930px; margin-top: 12px; }

.dr-screen-task {
  max-width: 930px;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 12px;
  margin: 16px 0 0;
  padding: 12px 14px;
  border-left: 3px solid var(--dr-blue);
  color: #344054;
  background: #f5f8ff;
  font-size: 13px;
  line-height: 1.55;
}

.dr-screen-task strong { color: var(--dr-blue-deep); }

.dr-highlight-card {
  padding: 24px 0 8px;
  border: 0;
  border-top: 1px solid #dfe5ed;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.dr-observations {
  padding: 18px 20px;
  border-left: 3px solid #9dbbf4;
  border-radius: 0 12px 12px 0;
  background: #f8faff;
}

.dr-question-card {
  padding: 24px 0 0;
  border: 0;
  border-top: 1px solid #dfe5ed;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
```

Inside the existing `@media (max-width: 640px)` block, add:

```css
.dr-screen-task { grid-template-columns: 1fr; gap: 4px; }
.dr-evidence-hero { padding-bottom: 16px; }
```

Remove `.dr-highlight-card` and `.dr-question-card` from the mobile rule that re-adds `padding: 18px` and `border-radius: 14px`; otherwise the simplified desktop hierarchy is accidentally reversed on mobile.

- [ ] **Step 5: Run focused UI and state tests**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-ui.test.ts tests/hr-paysim/decision-room-component-state.test.ts tests/hr-paysim/decision-room-ui-invalidation.test.ts
```

Expected: PASS. The source order is unchanged, downstream copy remains model-owned, and changed explanations do not revive old results.

- [ ] **Step 6: Keep the change uncommitted**

Run `git status --short` and confirm no Task 9 implementation commit exists.

### Task 3: Strengthen Browser QA And Run Fresh Project Verification

**Files:**
- Modify: `scripts/qa-decision-room.mjs`
- Verify: all Task 9 source and tests listed in the global constraints

**Interfaces:**
- Consumes: `.dr-evidence-hero`, `.dr-lead`, `.dr-screen-task`, existing screen `data-*` markers, and the live Vite preview.
- Produces: JSON QA evidence for first-viewport cues, vertical gaze order, three actions, focus, keyboard completion, invalidation, copy, session clearing, storage, overflow, and console issues.

- [ ] **Step 1: Update the Screen 2 QA assertions before changing expected output**

In `inspectScreen2(viewport)`, add these locators:

```js
const supporting = page.locator(
  '[data-screen="confirmed_pay_differences"] .dr-evidence-hero .dr-lead'
);
const taskPrompt = page.locator(
  '[data-screen="confirmed_pay_differences"] .dr-screen-task'
);
```

Replace the old long-conclusion string loop with:

```js
const conclusionText = await conclusion.innerText();
const supportingText = await supporting.innerText();
const taskText = await taskPrompt.innerText();

for (const required of [
  "Product Engineer 장기 근속자와 최근 입사자",
  "2,700만원",
]) {
  if (!conclusionText.includes(required)) {
    throw new Error(`screen 2 title is missing: ${required}`);
  }
}
for (const required of ["6,800만~7,600만원", "8,800만~9,500만원"]) {
  if (!supportingText.includes(required)) {
    throw new Error(`screen 2 supporting copy is missing: ${required}`);
  }
}
for (const required of ["이유를 하나 선택", "확인할 기록"]) {
  if (!taskText.includes(required)) {
    throw new Error(`screen 2 task prompt is missing: ${required}`);
  }
}
```

After the existing `boxes` calculation, add desktop-only first-viewport checks:

```js
const firstViewportBoxes = await Promise.all([
  conclusion.boundingBox(),
  supporting.boundingBox(),
  taskPrompt.boundingBox(),
]);
if (firstViewportBoxes.some((box) => box === null)) {
  throw new Error("screen 2 first-viewport cue is missing");
}
if (viewport.width >= 1280) {
  const firstViewportVisible = firstViewportBoxes.every(
    (box) => box.y >= 0 && box.y + box.height <= viewport.height
  );
  if (!firstViewportVisible) {
    throw new Error(`${viewport.name} hides a Screen 2 comprehension cue`);
  }
}
```

Keep the 390 px page-overflow and reflow checks, but do not require the whole desktop hero to fit in 844 px.

- [ ] **Step 2: Run focused non-browser tests before starting a server**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-ui.test.ts tests/hr-paysim/decision-room-component-state.test.ts tests/hr-paysim/decision-room-ui-invalidation.test.ts tests/hr-paysim/decision-room-session.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run the four project commands and read fresh output**

Run:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Expected: every command exits `0`; do not use earlier 165-test results as evidence.

- [ ] **Step 4: Start the local Vite server in a dedicated terminal**

Run:

```powershell
npm.cmd run dev -- --port 5173
```

Expected: Vite reports `http://127.0.0.1:5173/` and remains running.

- [ ] **Step 5: Run the browser QA from a second terminal**

Run:

```powershell
node scripts/qa-decision-room.mjs
```

Expected JSON conditions:

- `errors` is empty;
- `clicksToResult` equals `3`;
- every `focusMoves` value is `true`;
- all overflow values are `false`;
- desktop first-viewport cues are visible;
- invalidated rule and result copy are removed;
- keyboard completion, copy feedback, and session clearing are `true`;
- browser storage counts are `0`;
- `consoleIssues` is empty.

- [ ] **Step 6: Stop the local server without changing files**

Use `Ctrl+C` in the Vite terminal. Do not kill unrelated Node processes.

- [ ] **Step 7: Inspect the complete uncommitted Task 9 diff**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors. Only the known Task 9 files and no governance artifacts are modified or untracked.

### Task 4: Run The Human Gate, Commit Task 9, And Request Independent Review

**Files:**
- Create after real responses exist: `docs/hr-paysim/validation/task9-screen2-comprehension.md`
- Stage after the gate: exact Task 9 files only

**Interfaces:**
- Consumes: the verified live Screen 2 at 1280 x 720, at least two real participants, and the automated evidence from Task 3.
- Produces: a de-identified human-gate record and commit `feat: build Product Engineer decision-room slice` only if every participant passes all three questions.

- [ ] **Step 1: Prepare the live Screen 2 without explaining it**

Start the Vite server with `npm.cmd run dev -- --port 5173`, open:

```text
http://127.0.0.1:5173/hr-paysim/decision-room-preview
```

Use a 1280 x 720 viewport. Click the single primary action on Screen 1, then show Screen 2 for five seconds. Do not explain the comparison, amount, or requested action.

- [ ] **Step 2: Collect answers from at least two participants**

Ask each participant exactly:

1. 무엇과 무엇을 비교하는 화면인가?
2. 어떤 연봉 차이가 확인됐는가?
3. 대표가 지금 무엇을 설명하거나 선택해야 하는가?

At least one participant must be reasonably close to a growth-stage founder or operator. Record no names, emails, company names, or identifying details.

- [ ] **Step 3: Apply the pass/fail rule without self-certification**

Pass only when every participant states all three meanings:

- long-tenured Product Engineers versus recent hires;
- a maximum annual salary difference of 27 million won;
- select the closest reason for the difference and identify whether supporting evidence exists.

If any participant misses any meaning, stop. Keep Task 9 uncommitted, return to Task 1 or Task 2, rerun all Task 3 verification, and repeat the full human test with at least two participants.

- [ ] **Step 4: Write the human-gate record using only real responses**

Create `docs/hr-paysim/validation/task9-screen2-comprehension.md` only after the test. It must contain:

- test date and 1280 x 720 viewport;
- anonymized labels `Participant 1`, `Participant 2`, and additional sequential labels if used;
- a non-identifying target-proximity description for each participant;
- each participant's verbatim answers to Questions 1-3;
- an itemized pass/fail result for each answer;
- the overall gate result;
- a statement that no explanatory prompt was given before the five-second exposure.

Do not add example, invented, summarized, or stand-in responses.

- [ ] **Step 5: Reconfirm the automated state has not changed**

If no code or copy changed after Task 3, run:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
```

Expected: all commands exit `0`. If the server is not running for the final command, start it first as described in Task 3.

- [ ] **Step 6: Stage only the Task 9 files after the human gate passes**

Run:

```powershell
git add -- src/App.tsx src/lib/hr-paysim/copy/founderCopy.ts scripts/qa-decision-room.mjs src/features/decision-room src/features/session-introduction src/features/confirmed-pay-differences src/features/company-rule src/features/session-result tests/hr-paysim/decision-room-component-state.test.ts tests/hr-paysim/decision-room-ui-invalidation.test.ts tests/hr-paysim/decision-room-ui.test.ts docs/hr-paysim/validation/task9-screen2-comprehension.md
git diff --cached --check
git diff --cached --name-status
```

Expected: only Task 9 implementation, tests, QA, and the real human-gate record are staged. Integration design commits and unrelated files are absent from the staged diff.

- [ ] **Step 7: Commit Task 9 with the locked message**

Run:

```powershell
git commit -m "feat: build Product Engineer decision-room slice"
```

Expected: commit succeeds only after the automated and human gates pass.

- [ ] **Step 8: Request an independent code review and stop**

The review must inspect the committed Task 9 diff for:

- specification compliance;
- data-derived headline amount;
- founder-copy ownership;
- invalidation and session-state preservation;
- three-action navigation;
- desktop first-viewport cues;
- 390 px non-breaking reflow;
- human-gate evidence integrity;
- accidental Task 10 or governance scope.

Do not start Task 10. Report the review outcome and request explicit approval for any next product task.

## Deferred Follow-Up

After Task 9 is independently reviewed, inspect the shared governance session. If and only if its Adapter schema has a stable verified commit SHA, write a separate implementation plan for the thin PaySim Adapter, root work guide, and legacy document authority notes. That governance plan is not a prerequisite for Task 9 completion or the Task 10 approval decision.
