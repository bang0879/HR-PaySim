# HR PaySim Engine Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recover or consciously replace the lost HR PaySim calculation depth, then make one UI architecture canonical before merging the branch.

**Architecture:** Keep the Vite + React app. Treat calculation output as the domain contract, `PaySimShell + screens + PaySimStepper` as the target UI architecture, and `PrototypePaySimApp` as a temporary runnable adapter until parity is proven. Do not merge to main until engine depth, tests, accessibility, and duplicate UI ownership are resolved.

**Tech Stack:** Vite, React, TypeScript, Node test runner, Playwright QA, git history/remote branch archaeology.

---

## File Structure

- `docs/hr-paysim/engine-reconciliation-audit.md`
  - Create. Records where the old engine/tests were searched for, what was found, and whether the rich engine can be recovered.
- `docs/hr-paysim/engine-policy.md`
  - Create. Records the explicit product decision: restore rich engine, keep simplified engine, or ship staged hybrid.
- `src/lib/hr-paysim/domain.ts`
  - Modify. Expand the HR PaySim domain contract if the rich engine is restored.
- `src/lib/hr-paysim/calculations.ts`
  - Modify or replace. Owns the canonical calculation API used by UI, tests, memo, and recommendation code.
- `src/lib/hr-paysim/recommendations.ts`
  - Modify. Remove fixed recommendation assumptions that should come from calculation output.
- `src/lib/hr-paysim/prototypeViewModel.ts`
  - Modify. Keep presentation mapping only; no independent business rules.
- `src/components/hr-paysim/PaySimShell.tsx`
  - Modify. Becomes the single mounted app shell after parity.
- `src/components/hr-paysim/PaySimStepper.tsx`
  - Modify if needed. Becomes the single stepper implementation.
- `src/components/hr-paysim/screens/index.tsx`
  - Modify. Owns screen rendering by step.
- `src/components/hr-paysim/PrototypePaySimApp.tsx`
  - Delete only after `PaySimShell` parity and QA pass.
- `tests/hr-paysim/calculations.test.ts`
  - Modify. Restore rich engine contract tests.
- `tests/hr-paysim/engine-guards.test.ts`
  - Create. Restores forbidden output-key/copy/data guard tests.
- `tests/hr-paysim/shell-flow.test.ts`
  - Create. Verifies the canonical shell renders all 9 steps with calculated state.
- `tests/hr-paysim/accessibility.test.ts`
  - Create. Verifies route changes, focus handling, and keyboard stepper behavior where possible in unit/DOM tests.

---

## Decision Gates

Stop and report to the user at these points:

- After three search loops if the 822-line engine or old 38-test suite cannot be found.
- If recovered engine code conflicts materially with current Vite domain types.
- If rich engine restoration changes visible numbers enough that current demo screenshots no longer match accepted design intent.
- Before deleting `PrototypePaySimApp.tsx`.
- Before merging or rebasing against main.

---

### Task 1: Remote And History Archaeology

**Files:**
- Create: `docs/hr-paysim/engine-reconciliation-audit.md`

- [ ] **Step 1: Confirm current branch state**

Run:

```powershell
git status --short --branch
git branch -a --verbose
git remote -v
```

Expected:

```text
Current branch is codex/final-design-pixel-sync.
Working tree is clean before archaeology begins.
origin points to https://github.com/bang0879/HR-PaySim.git.
```

- [ ] **Step 2: Fetch remote refs**

Run:

```powershell
git fetch --all --prune
git branch -a --verbose
```

Expected:

```text
Remote branches include origin/main or another branch containing older frontend history.
```

If `git fetch` cannot run because network access is blocked, stop and ask the user to approve network access for fetch.

- [ ] **Step 3: Search for deleted frontend and rich engine names**

Run:

```powershell
git log --all --name-status -- frontend
git log --all --name-status -- "*calculations*" "*engine*" "*pay*"
git log --all -G "riskFlags|explanationText|compa|premium pool|band health|orchestrator|confidence|forbidden output" -- .
```

Expected:

```text
At least one commit or branch identifies the old frontend folder, old engine file, or old tests.
```

- [ ] **Step 4: Inspect candidate old files without changing the worktree**

Run one or more of these after identifying candidate commits:

```powershell
git show <commit>:frontend/<path-to-engine-file>
git show <commit>:frontend/<path-to-test-file>
git ls-tree -r --name-only <commit> | Select-String "frontend|calculations|engine|pay|test"
```

Expected:

```text
Candidate files can be viewed through git show.
No checkout or reset is performed.
```

- [ ] **Step 5: Write the archaeology audit**

Create `docs/hr-paysim/engine-reconciliation-audit.md`:

```markdown
# HR PaySim Engine Reconciliation Audit

## Current Branch

- Branch: codex/final-design-pixel-sync
- Current mounted app: src/App.tsx -> PrototypePaySimApp
- Current calculation file: src/lib/hr-paysim/calculations.ts
- Current test count: 31 passing tests before reconciliation

## Search Loops

### Loop 1: Remote refs

- Command: git fetch --all --prune
- Result:

### Loop 2: Deleted frontend history

- Command: git log --all --name-status -- frontend
- Result:

### Loop 3: Rich engine/test keywords

- Command: git log --all -G "riskFlags|explanationText|compa|premium pool|band health|orchestrator|confidence|forbidden output" -- .
- Result:

## Recovered Assets

- Engine file:
- Test files:
- Copy/guard files:
- Docs/spec files:

## Recommendation

- Decision: restore-rich-engine | keep-simplified-v1 | staged-hybrid
- Reason:
```

- [ ] **Step 6: Commit audit if it records useful findings**

Run:

```powershell
git add docs/hr-paysim/engine-reconciliation-audit.md
git commit -m "docs: audit HR PaySim engine history"
```

Expected:

```text
Commit succeeds only if the audit contains real findings.
```

---

### Task 2: Engine Policy Decision

**Files:**
- Create: `docs/hr-paysim/engine-policy.md`

- [ ] **Step 1: Write the decision document**

Create `docs/hr-paysim/engine-policy.md`:

```markdown
# HR PaySim Engine Policy

## Decision

HR PaySim uses a rich calculation contract for v1.0 pilot demos.

## Required Outputs

The canonical engine must return:

- CEI score and band
- CED score and band
- Payroll increase rate
- Pay inversion severity
- Confidence level
- Band-level reasons
- Founder-facing explanation text
- Risk flags
- Salary band health
- Senior orchestrator premium pool estimate when relevant
- Productivity leakage flag when relevant
- Compa-ratio signal when relevant
- Scenario assumptions including cleanup budget, salary band width, and premium pool allocation ratio when relevant

## URL And Session State

Step route is the URL source of truth. Form and calculation state remain in sessionStorage because aggregate compensation data should not be encoded into shareable URLs. Link sharing can be added later through an opaque saved-session id or explicit export/import flow.

## UI Ownership

PaySimShell, PaySimStepper, and screens/index.tsx are the target canonical UI. PrototypePaySimApp remains temporary until parity, then it is deleted.

## Main Merge Policy

Do not merge this branch into main until:

- Rich engine policy is implemented or explicitly rejected.
- Duplicate UI architecture is removed.
- Accessibility/focus QA passes.
- Tests, lint, typecheck, and build pass.
```

- [ ] **Step 2: Commit the policy**

Run:

```powershell
git add docs/hr-paysim/engine-policy.md
git commit -m "docs: define HR PaySim engine policy"
```

Expected:

```text
Policy commit succeeds.
```

---

### Task 3: Restore The Rich Calculation Contract Tests

**Files:**
- Modify: `src/lib/hr-paysim/domain.ts`
- Modify: `tests/hr-paysim/calculations.test.ts`
- Create: `tests/hr-paysim/engine-guards.test.ts`

- [ ] **Step 1: Add rich output types**

Modify `src/lib/hr-paysim/domain.ts` so the diagnosis contract includes these fields:

```ts
export type DiagnosisBand = "low" | "medium" | "high" | "critical";

export type DiagnosisReason = {
  code: string;
  label: string;
  detail: string;
};

export type RiskFlag =
  | "pay_inversion"
  | "exception_debt"
  | "band_drift"
  | "hiring_pressure"
  | "productivity_leakage"
  | "orchestrator_premium_gap"
  | "low_confidence";

export type SalaryBandHealth = {
  status: DiagnosisBand;
  widthPct: number;
  midpointCompaRatio: number;
  reasons: DiagnosisReason[];
};

export type OrchestratorPremiumPool = {
  eligibleHeadcount: number;
  allocationRatio: number;
  annualPoolEok: number;
};

export type ScenarioAssumptions = {
  cleanupBudgetEok: number;
  salaryBandWidthPct: number;
  premiumPoolAllocationRatio: number;
};

export type DiagnosisResult = {
  ceiScore: number;
  ceiBand: DiagnosisBand;
  cedScore: number;
  cedBand: DiagnosisBand;
  payrollIncreaseRate: number;
  payInversionSeverity: DiagnosisBand;
  confidence: "low" | "medium" | "high";
  reasons: DiagnosisReason[];
  explanationText: string;
  riskFlags: RiskFlag[];
  salaryBandHealth: SalaryBandHealth;
  orchestratorPremiumPool?: OrchestratorPremiumPool;
  productivityLeakageFlag: boolean;
  compaRatioSignal: "below_band" | "within_band" | "above_band" | "unknown";
  scenarioAssumptions: ScenarioAssumptions;
};
```

- [ ] **Step 2: Write failing rich contract tests**

Add or modify `tests/hr-paysim/calculations.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { calculateDiagnosis } from "../../src/lib/hr-paysim/calculations.ts";
import type { QuickInputDraft } from "../../src/lib/hr-paysim/domain.ts";

const riskyInput: QuickInputDraft = {
  employeeCount: 120,
  annualPayrollEok: 96,
  avgSalaryManwon: 8000,
  plannedHires: 24,
  avgNewHireSalaryManwon: 9500,
  hasSalaryBands: false,
  payInversionCases: 14,
  exceptionRaiseCases: 18,
  criticalAttritionCases: 7,
  aiToolBudgetEok: 1.8,
  aiAutomationCoveragePct: 35,
};

test("calculateDiagnosis returns rich explainable engine fields", () => {
  const result = calculateDiagnosis(riskyInput);

  assert.equal(typeof result.ceiScore, "number");
  assert.equal(typeof result.cedScore, "number");
  assert.ok(["low", "medium", "high", "critical"].includes(result.ceiBand));
  assert.ok(["low", "medium", "high", "critical"].includes(result.cedBand));
  assert.ok(["low", "medium", "high"].includes(result.confidence));
  assert.ok(result.reasons.length >= 3);
  assert.ok(result.explanationText.length >= 20);
  assert.ok(result.riskFlags.includes("pay_inversion"));
  assert.equal(result.salaryBandHealth.status, "critical");
  assert.equal(result.productivityLeakageFlag, true);
  assert.ok(["below_band", "within_band", "above_band", "unknown"].includes(result.compaRatioSignal));
  assert.ok(result.scenarioAssumptions.cleanupBudgetEok > 0);
  assert.ok(result.scenarioAssumptions.salaryBandWidthPct > 0);
});

test("calculateDiagnosis estimates orchestrator premium pool when AI and hiring pressure are material", () => {
  const result = calculateDiagnosis(riskyInput);

  assert.ok(result.orchestratorPremiumPool);
  assert.ok(result.orchestratorPremiumPool.eligibleHeadcount > 0);
  assert.ok(result.orchestratorPremiumPool.allocationRatio > 0);
  assert.ok(result.orchestratorPremiumPool.annualPoolEok > 0);
});
```

Expected before implementation:

```text
Tests fail because the current simplified DiagnosisResult lacks rich fields.
```

- [ ] **Step 3: Restore forbidden output guard tests**

Create `tests/hr-paysim/engine-guards.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { calculateDiagnosis } from "../../src/lib/hr-paysim/calculations.ts";
import { FORBIDDEN_PAY_SIM_WORDING } from "../../src/lib/hr-paysim/copy.ts";
import type { QuickInputDraft } from "../../src/lib/hr-paysim/domain.ts";

const input: QuickInputDraft = {
  employeeCount: 80,
  annualPayrollEok: 52,
  avgSalaryManwon: 6500,
  plannedHires: 8,
  avgNewHireSalaryManwon: 7200,
  hasSalaryBands: true,
  payInversionCases: 3,
  exceptionRaiseCases: 4,
  criticalAttritionCases: 1,
  aiToolBudgetEok: 0.6,
  aiAutomationCoveragePct: 15,
};

test("engine output does not expose forbidden payload keys", () => {
  const result = calculateDiagnosis(input);
  const serialized = JSON.stringify(result);

  for (const key of ["employeeName", "email", "phone", "residentId", "rawSalary", "rawCsv", "individualSalary"]) {
    assert.equal(serialized.includes(key), false, `${key} should not appear in engine output`);
  }
});

test("engine explanation avoids forbidden wording", () => {
  const result = calculateDiagnosis(input);

  for (const forbidden of FORBIDDEN_PAY_SIM_WORDING) {
    assert.equal(result.explanationText.includes(forbidden), false, `${forbidden} should not appear`);
  }
});
```

- [ ] **Step 4: Run tests and confirm failure**

Run:

```powershell
npm test -- tests/hr-paysim/calculations.test.ts tests/hr-paysim/engine-guards.test.ts
```

Expected:

```text
FAIL because rich output has not been implemented yet.
```

Do not proceed to implementation until the failure confirms the missing depth.

---

### Task 4: Reconnect Or Rebuild The Engine Behind The Existing API

**Files:**
- Modify: `src/lib/hr-paysim/calculations.ts`
- Modify: `src/lib/hr-paysim/recommendations.ts`
- Modify: `src/lib/hr-paysim/prototypeViewModel.ts`

- [ ] **Step 1: If old engine was found, extract it without changing UI**

Run:

```powershell
git show <commit>:<old-engine-path> > C:\tmp\hr-paysim-old-engine.ts
```

Expected:

```text
C:\tmp\hr-paysim-old-engine.ts contains the recovered engine for manual comparison.
```

Then copy only the calculation logic into `src/lib/hr-paysim/calculations.ts` through a normal patch. Do not import from `C:\tmp`.

- [ ] **Step 2: If old engine was not found after three loops, implement the rich contract directly**

Use the current simplified formulas as the baseline but add deterministic rich fields in `src/lib/hr-paysim/calculations.ts`. The implementation must keep this public API:

```ts
export function calculateDiagnosis(input: QuickInputDraft): DiagnosisResult;
export function compareScenarios(input: QuickInputDraft, scenarioIds: ScenarioId[]): ScenarioComparisonResult;
```

Expected behavior:

```text
calculateDiagnosis returns every required DiagnosisResult field.
compareScenarios derives recommendation deltas from DiagnosisResult and scenario assumptions.
```

- [ ] **Step 3: Remove recommendation hardcoding that duplicates calculation decisions**

Modify `src/lib/hr-paysim/recommendations.ts` so recommendation rank reasons are derived from `DiagnosisResult.riskFlags`, `DiagnosisResult.salaryBandHealth`, and `DiagnosisResult.scenarioAssumptions`.

Expected behavior:

```text
Recommendation card copy can still be stable, but ranking and reason selection come from engine output.
```

- [ ] **Step 4: Keep presentation mapping thin**

Modify `src/lib/hr-paysim/prototypeViewModel.ts` so it reads rich calculation output instead of re-deriving confidence or scenario implications.

Expected behavior:

```text
prototypeViewModel contains formatting and screen mapping only.
```

- [ ] **Step 5: Run calculation tests**

Run:

```powershell
npm test -- tests/hr-paysim/calculations.test.ts tests/hr-paysim/engine-guards.test.ts tests/hr-paysim/prototype-view-model.test.ts
```

Expected:

```text
All selected tests pass.
```

- [ ] **Step 6: Commit engine reconciliation**

Run:

```powershell
git add src/lib/hr-paysim/domain.ts src/lib/hr-paysim/calculations.ts src/lib/hr-paysim/recommendations.ts src/lib/hr-paysim/prototypeViewModel.ts tests/hr-paysim/calculations.test.ts tests/hr-paysim/engine-guards.test.ts
git commit -m "feat: restore HR PaySim rich engine contract"
```

Expected:

```text
Commit succeeds with rich calculation tests passing.
```

---

### Task 5: Make PaySimShell The Canonical UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/hr-paysim/PaySimShell.tsx`
- Modify: `src/components/hr-paysim/PaySimStepper.tsx`
- Modify: `src/components/hr-paysim/screens/index.tsx`
- Create: `tests/hr-paysim/shell-flow.test.ts`
- Delete: `src/components/hr-paysim/PrototypePaySimApp.tsx` after parity only

- [ ] **Step 1: Write shell flow test before switching App**

Create `tests/hr-paysim/shell-flow.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { PAY_SIM_STEPS } from "../../src/routes/hr-paysim/stepRegistry.ts";

test("canonical step registry keeps the 9-step HR PaySim flow", () => {
  assert.deepEqual(
    PAY_SIM_STEPS.map((step) => step.id),
    ["entry", "intake", "aggregate-review", "diagnosis", "interpretation", "recommendations", "ai-check", "comparison", "memo-preview"],
  );
});
```

- [ ] **Step 2: Wire `src/App.tsx` to `PaySimShell`**

Modify `src/App.tsx`:

```tsx
import { PaySimShell } from "./components/hr-paysim/PaySimShell.tsx";

export default function App() {
  return <PaySimShell />;
}
```

- [ ] **Step 3: Move missing behavior from PrototypePaySimApp into shell/screens**

Ensure `PaySimShell` owns:

```text
- Current step from URL route
- sessionStorage restore and persistence
- guarded future-step redirect without stored session
- input validation
- calculation execution
- stale flags
- scenario selection
- consent payload state
```

Ensure `screens/index.tsx` owns:

```text
- Entry screen
- Intake screen
- Aggregate review
- Diagnosis
- Interpretation
- Recommendations
- AI check
- Comparison
- Memo preview
```

- [ ] **Step 4: Run parity checks before deleting PrototypePaySimApp**

Run:

```powershell
npm test
npm run lint
npm run typecheck
npm run build
```

Expected:

```text
All commands pass with App mounted through PaySimShell.
```

- [ ] **Step 5: Delete PrototypePaySimApp after parity approval**

Delete `src/components/hr-paysim/PrototypePaySimApp.tsx` only after the user agrees that the shell-rendered app is visually and behaviorally acceptable.

- [ ] **Step 6: Commit canonical shell**

Run:

```powershell
git add src/App.tsx src/components/hr-paysim/PaySimShell.tsx src/components/hr-paysim/PaySimStepper.tsx src/components/hr-paysim/screens/index.tsx tests/hr-paysim/shell-flow.test.ts
git add -u src/components/hr-paysim/PrototypePaySimApp.tsx
git commit -m "refactor: make PaySimShell canonical"
```

Expected:

```text
Commit succeeds after PrototypePaySimApp is removed or explicitly retained with a documented reason.
```

---

### Task 6: Accessibility And Focus Closure

**Files:**
- Modify: `src/components/hr-paysim/PaySimShell.tsx`
- Modify: `src/components/hr-paysim/PaySimStepper.tsx`
- Create: `tests/hr-paysim/accessibility.test.ts`
- Modify: `docs/hr-paysim/app-build-qa.md`

- [ ] **Step 1: Add focus requirements**

Create `tests/hr-paysim/accessibility.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { PAY_SIM_STEPS } from "../../src/routes/hr-paysim/stepRegistry.ts";

test("each step has stable route, title, and subtitle for accessible navigation", () => {
  for (const step of PAY_SIM_STEPS) {
    assert.match(step.route, /^\/hr-paysim\//);
    assert.ok(step.title.length > 0);
    assert.ok(step.subtitle.length > 0);
  }
});
```

- [ ] **Step 2: Implement route-change focus target**

Ensure the shell renders a single main heading target:

```tsx
<main className="pay-sim-main" tabIndex={-1} ref={mainRef}>
  <h1>{currentStep.title}</h1>
  {screen}
</main>
```

Expected behavior:

```text
When current step changes, focus moves to the main region or first screen heading.
```

- [ ] **Step 3: Verify keyboard stepper behavior**

Expected behavior:

```text
Stepper buttons are real button elements.
Current step exposes aria-current="step".
Disabled future steps expose disabled or aria-disabled consistently.
```

- [ ] **Step 4: Update QA doc**

Add to `docs/hr-paysim/app-build-qa.md`:

```markdown
## Accessibility And Focus

- Step changes move focus to the main content region.
- The current step exposes `aria-current="step"`.
- Future locked steps are not keyboard-activatable.
- Primary forward/backward actions are reachable by keyboard.
```

- [ ] **Step 5: Commit accessibility closure**

Run:

```powershell
git add src/components/hr-paysim/PaySimShell.tsx src/components/hr-paysim/PaySimStepper.tsx tests/hr-paysim/accessibility.test.ts docs/hr-paysim/app-build-qa.md
git commit -m "fix: close HR PaySim accessibility focus gaps"
```

Expected:

```text
Commit succeeds.
```

---

### Task 7: Final Verification And Merge Strategy

**Files:**
- Modify: `docs/hr-paysim/app-build-qa.md`

- [ ] **Step 1: Run full local gates**

Run:

```powershell
npm test
npm run lint
npm run typecheck
npm run build
```

Expected:

```text
All gates pass.
```

- [ ] **Step 2: Run browser QA**

Run or manually verify at:

```text
http://127.0.0.1:5173/hr-paysim/entry
```

Expected:

```text
The app advances through all 9 steps.
Numbers are calculated from current input.
Reload restores sessionStorage state.
Direct future route without session redirects to entry.
No console errors.
Desktop and mobile screenshots have no broken layout or text overlap.
```

- [ ] **Step 3: Push branch**

Run:

```powershell
git status --short --branch
git push
```

Expected:

```text
Branch is clean and pushed to origin/codex/final-design-pixel-sync.
```

- [ ] **Step 4: Stop before main merge**

Report to the user:

```text
Engine reconciliation, canonical shell, accessibility QA, and build gates are complete. The branch is pushed. Main merge is still pending approval.
```

Do not merge to main until the user explicitly approves the merge strategy.

---

## Self-Review

- Spec coverage: The plan covers engine recovery, calculation depth, duplicated UI architecture, session URL policy, accessibility/focus, branch push, and main merge hold.
- Placeholder scan: There are no implementation placeholders. Unknown recovered engine paths are isolated to archaeology commands and decision gates.
- Type consistency: Rich `DiagnosisResult` fields are defined before tests and implementation tasks reference them.

