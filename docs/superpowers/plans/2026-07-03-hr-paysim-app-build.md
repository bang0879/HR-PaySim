# HR PaySim App Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the approved HR PaySim static prototype into a buildable Vite + React + TypeScript app with real wizard state, calculation tests, route guards, copy guardrails, consent separation, and QA gates.

**Architecture:** Preserve the static prototype under `prototypes/hr-paysim-redesign/` as the visual reference. Build a new root React app in `src/`, with domain logic in `src/lib/hr-paysim/`, route-level screens in `src/routes/hr-paysim/`, reusable components in `src/components/hr-paysim/`, and Node test files in `tests/hr-paysim/`. Keep URL state limited to the current wizard step and store sensitive session data only in `sessionStorage`.

**Tech Stack:** Vite, React, TypeScript, native History API routing, sessionStorage, Node test runner with `--experimental-strip-types`, and static browser QA.

---

## Current Codebase Map

- Read/reference: `prototypes/hr-paysim-redesign/index.html`
  - Current persistent shell and static app chrome.
- Read/reference: `prototypes/hr-paysim-redesign/app.js`
  - Current 8-step prototype renderer and click-based state machine.
- Read/reference: `prototypes/hr-paysim-redesign/styles.css`
  - Approved visual tokens and layout styles to migrate into React CSS.
- Read/reference: `prototypes/hr-paysim-redesign/design-references/*.png`
  - Approved desktop references.
- Read: `docs/hr-paysim/00_product_thesis.md`
  - Product guardrails and strict exclusions.
- Created: `docs/superpowers/specs/2026-07-03-hr-paysim-app-build-design.md`
  - Build design spec for this implementation.
- Create: `docs/hr-paysim/09_stack_decision.md`
  - Vite vs Next.js decision record.
- Create: `docs/hr-paysim/10_build_rules.md`
  - v1.0 scope, exclusions, QA gates, and stop rules.
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`
  - Root app build setup.
- Create: `src/`
  - Real React app source.
- Create: `tests/hr-paysim/`
  - Calculation, session, copy, and payload tests.
- Create: `scripts/check-forbidden-copy.ts`
  - Local lint script for prohibited wording and framing.

## Global Execution Rules

- Run `npm test`, `npm run typecheck`, and `npm run build` after each functional task once package setup exists.
- If a failure appears, attempt at most three fix loops for that task.
- Stop and report if the same blocker remains after three loops.
- Do not implement CSV upload in v1.0.
- Do not implement PDF generation in v1.0.
- Do not emit server-side aggregate logs in v1.0.
- Do not store employee-level data, raw salary rows, raw CSV, or company name in log payloads.
- Keep Korean founder-facing copy centralized in `src/lib/hr-paysim/copy.ts`.

## Task 0: Build Rule And Stack Decision Docs

**Files:**
- Create: `docs/hr-paysim/09_stack_decision.md`
- Create: `docs/hr-paysim/10_build_rules.md`

- [ ] **Step 1: Write the stack decision document**

Create `docs/hr-paysim/09_stack_decision.md`:

```markdown
# HR PaySim Stack Decision

## Decision

Decision: Vite + React

## Reason

- HR Prism stack alignment: This repository currently contains HR PaySim as a standalone static prototype. No shared HR Prism Next.js app, layout package, route tree, or deployment target is present in this workspace.
- API route need: v1.0 does not require a server route. Aggregate logging server emission is deferred until endpoint, storage, retention, and revoke/decline policy exist.
- Deployment target: v1.0 can run as a client-side wizard and can be statically hosted after `npm run build`.
- Trade-off accepted: If HR PaySim must later live inside HR Prism or share a Next.js deployment, the React domain modules and components should be portable, but the Vite shell will need integration work.

## Revisit Trigger

Revisit this decision if any of the following becomes true:

- HR Prism and HR PaySim must share one deployed app.
- Auth, API routes, server actions, or server-side aggregate logging become v1.0 requirements.
- HR Prism exposes a shared component system that HR PaySim must import directly.
```

- [ ] **Step 2: Write the build rules document**

Create `docs/hr-paysim/10_build_rules.md`:

```markdown
# HR PaySim Build Rules

## v1.0 Scope

- Direct aggregate input.
- Sample data preview.
- Session-restored wizard flow.
- Aggregate review.
- CEI, CED, pay inversion, payroll forecast diagnosis.
- Founder-facing Korean interpretation.
- Scenario recommendations with `baseline_current_state` as a first-class option.
- Optional AI check as an advanced scenario lens.
- Calculated comparison with derived baseline.
- Memo preview with plain-text copy.
- Aggregate consent UI and local payload validator.

## Deferred Scope

- CSV full upload.
- PDF generation.
- Server-side aggregate logging endpoint.
- Legal/tax-grade stock option calculation.
- External salary market data integration.

## Strict Exclusions

- No salary calculator framing.
- No employee-level pay recommendation.
- No AI substitution percentage.
- No job replacement claims.
- No fake attrition probability.
- No `Total Work Cost` metric.
- No employee-level sensitive data storage.
- No raw CSV persistence.

## Privacy Rules

- URL stores only the current step.
- Session data stays in `sessionStorage`.
- Aggregate log payloads exclude employee names, emails, phone numbers, resident IDs, raw salaries, raw CSV rows, and company name unless a later policy explicitly allows a separate company-name permission.
- Declining aggregate analysis consent must not block memo preview.

## Korean Copy Rules

- Use plain Korean.
- Use `얻는 것` and `감수할 것`.
- Avoid consulting-heavy exaggeration.
- Do not say AI replaces people.
- Do not use `이직 확률`, `생산성 향상률`, or `Total Work Cost`.

## Build Gate

The app cannot move to the next implementation task while any of these fail:

```text
npm test
npm run typecheck
npm run build
```

## Risk Loop

For each task, try at most three fix loops for the same failure. If the failure remains, stop and report the blocker with evidence.
```

- [ ] **Step 3: Verify docs**

Run:

```bash
rg -n "Decision: Vite \\+ React|CSV full upload|No AI substitution percentage|npm run build" docs/hr-paysim
```

Expected: each phrase appears in either `09_stack_decision.md` or `10_build_rules.md`.

## Task 1: Initialize Vite React App Shell

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/lib/hr-paysim/domain.ts`
- Create: `src/routes/hr-paysim/stepRegistry.ts`
- Create: `scripts/check-forbidden-copy.ts`

- [ ] **Step 1: Install app dependencies**

Run:

```bash
npm install react react-dom
npm install --save-dev vite @vitejs/plugin-react typescript @types/react @types/react-dom
```

Expected: `package.json` and `package-lock.json` are created or updated.

- [ ] **Step 2: Create package scripts**

Create `package.json` with these scripts:

```json
{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "start": "vite preview --host 127.0.0.1",
    "typecheck": "tsc --noEmit",
    "lint": "node --experimental-strip-types scripts/check-forbidden-copy.ts",
    "test": "node --experimental-strip-types --test tests/hr-paysim/*.test.ts"
  }
}
```

Preserve the dependency entries generated by npm.

- [ ] **Step 3: Create Vite and TypeScript config**

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "tests", "scripts"],
  "references": []
}
```

- [ ] **Step 4: Create minimal app entry**

Create `index.html`:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HR PaySim</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell" aria-label="HR PaySim">
      <h1>HR PaySim</h1>
      <p>보상 거버넌스 시뮬레이터 빌드가 시작되었습니다.</p>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  font-family: Inter, Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif;
  color: #101318;
  background: #e9edf3;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  background: #e9edf3;
}

.app-shell {
  width: min(1120px, calc(100vw - 32px));
  margin: 32px auto;
  padding: 32px;
  border: 1px solid #e6eaf0;
  border-radius: 18px;
  background: #ffffff;
}
```

- [ ] **Step 5: Create initial step registry**

Create `src/lib/hr-paysim/domain.ts`:

```ts
export type PaySimStep =
  | "entry"
  | "intake"
  | "aggregate_review"
  | "diagnosis"
  | "interpretation"
  | "recommendations"
  | "ai_check"
  | "comparison"
  | "memo_preview";

export interface PaySimStepDefinition {
  id: PaySimStep;
  route: string;
  title: string;
  subtitle: string;
}
```

Create `src/routes/hr-paysim/stepRegistry.ts`:

```ts
import type { PaySimStepDefinition } from "../../lib/hr-paysim/domain";

export const PAY_SIM_STEPS: PaySimStepDefinition[] = [
  { id: "entry", route: "/hr-paysim/entry", title: "시작", subtitle: "모드 선택" },
  { id: "intake", route: "/hr-paysim/intake", title: "입력", subtitle: "데이터 입력" },
  { id: "aggregate_review", route: "/hr-paysim/aggregate-review", title: "확인", subtitle: "입력 내용 확인" },
  { id: "diagnosis", route: "/hr-paysim/diagnosis", title: "진단", subtitle: "보상 진단" },
  { id: "interpretation", route: "/hr-paysim/interpretation", title: "해석", subtitle: "전문가 해석" },
  { id: "recommendations", route: "/hr-paysim/recommendations", title: "시나리오", subtitle: "추천 시나리오" },
  { id: "ai_check", route: "/hr-paysim/ai-check", title: "AI 확인", subtitle: "추가 검토" },
  { id: "comparison", route: "/hr-paysim/comparison", title: "비교", subtitle: "의사결정 비교" },
  { id: "memo_preview", route: "/hr-paysim/memo-preview", title: "메모", subtitle: "의사결정 메모" },
];
```

- [ ] **Step 6: Create copy lint script**

Create `scripts/check-forbidden-copy.ts`:

```ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src", "docs/hr-paysim"];
const forbidden = [
  "AI substitution",
  "job replacement",
  "Total Work Cost",
  "attrition probability",
  "salary calculator",
  "이직 확률",
  "생산성 향상률",
  "대체율",
];

function filesUnder(path: string): string[] {
  const stat = statSync(path);
  if (stat.isFile()) return [path];
  return readdirSync(path).flatMap((entry) => filesUnder(join(path, entry)));
}

const violations = roots
  .flatMap((root) => filesUnder(root))
  .filter((file) => /\.(ts|tsx|md|html|css)$/.test(file))
  .flatMap((file) => {
    const body = readFileSync(file, "utf8");
    return forbidden
      .filter((term) => body.includes(term))
      .map((term) => `${file}: forbidden term "${term}"`);
  });

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}
```

- [ ] **Step 7: Verify shell**

Run:

```bash
npm run typecheck
npm run build
```

Expected: both commands pass.

## Task 1.5: Migrate Calculation Tests And CI Gates

**Files:**
- Modify: `src/lib/hr-paysim/domain.ts`
- Create: `src/lib/hr-paysim/calculations.ts`
- Create: `src/lib/hr-paysim/copy.ts`
- Create: `src/lib/hr-paysim/recommendations.ts`
- Create: `tests/hr-paysim/calculations.test.ts`
- Create: `tests/hr-paysim/copy.test.ts`
- Modify: `scripts/check-forbidden-copy.ts`

- [ ] **Step 1: Add domain types for calculations**

Extend `src/lib/hr-paysim/domain.ts` with these exported types:

```ts
export type CEIBand = "healthy" | "manageable" | "watch" | "risk";
export type CEDBand = "low" | "manageable" | "high" | "critical";
export type PayInversionSeverity = "none" | "low" | "medium" | "high";
export type ScenarioId =
  | "baseline_current_state"
  | "resolve_pay_inversion"
  | "redesign_salary_bands"
  | "forecast_payroll_growth"
  | "ai_tooling_check"
  | "senior_orchestrator_premium";

export interface QuickInputDraft {
  employeeCount: number;
  plannedHires: number;
  basePayrollAnnual: number;
  variablePayAnnual: number;
  benefitsAnnual: number;
  exceptionRaiseCount: number;
  inversionCaseCount: number;
  salaryBandExists: boolean;
  currentAiToolingLevel: "unanswered" | "none" | "low" | "medium" | "high";
}

export interface DiagnosisResult {
  ceiScore: number;
  ceiBand: CEIBand;
  cedScore: number;
  cedBand: CEDBand;
  payInversionSeverity: PayInversionSeverity;
  payrollIncreaseRate: number;
}

export interface ScenarioRecommendation {
  scenarioId: ScenarioId;
  priority: "primary" | "secondary" | "optional";
  reason: string;
  whatItChecks: string;
  whatItWillNotClaim: string;
  expectedDecisionOutput: string;
}
```

- [ ] **Step 2: Write failing calculation tests**

Create `tests/hr-paysim/calculations.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateDiagnosis,
  compareScenarios,
  deriveBaselineScenario,
} from "../../src/lib/hr-paysim/calculations";
import { recommendScenarios } from "../../src/lib/hr-paysim/recommendations";
import type { QuickInputDraft } from "../../src/lib/hr-paysim/domain";

const healthyInput: QuickInputDraft = {
  employeeCount: 120,
  plannedHires: 5,
  basePayrollAnnual: 7200000000,
  variablePayAnnual: 800000000,
  benefitsAnnual: 600000000,
  exceptionRaiseCount: 1,
  inversionCaseCount: 0,
  salaryBandExists: true,
  currentAiToolingLevel: "unanswered",
};

const riskyInput: QuickInputDraft = {
  employeeCount: 120,
  plannedHires: 36,
  basePayrollAnnual: 7200000000,
  variablePayAnnual: 800000000,
  benefitsAnnual: 600000000,
  exceptionRaiseCount: 18,
  inversionCaseCount: 14,
  salaryBandExists: false,
  currentAiToolingLevel: "medium",
};

test("calculateDiagnosis scores healthy inputs as manageable", () => {
  const result = calculateDiagnosis(healthyInput);
  assert.equal(result.ceiBand, "healthy");
  assert.equal(result.cedBand, "low");
  assert.equal(result.payInversionSeverity, "none");
});

test("calculateDiagnosis identifies compensation governance risk", () => {
  const result = calculateDiagnosis(riskyInput);
  assert.equal(result.ceiBand, "risk");
  assert.equal(result.cedBand, "high");
  assert.equal(result.payInversionSeverity, "high");
  assert.ok(result.payrollIncreaseRate > 0.2);
});

test("recommendScenarios returns current state as primary when signals are healthy", () => {
  const diagnosis = calculateDiagnosis(healthyInput);
  const recommendations = recommendScenarios(healthyInput, diagnosis);
  assert.equal(recommendations[0]?.scenarioId, "baseline_current_state");
  assert.equal(recommendations[0]?.priority, "primary");
});

test("recommendScenarios includes baseline even when unhealthy", () => {
  const diagnosis = calculateDiagnosis(riskyInput);
  const recommendations = recommendScenarios(riskyInput, diagnosis);
  assert.ok(recommendations.some((item) => item.scenarioId === "baseline_current_state"));
  assert.ok(recommendations.some((item) => item.scenarioId === "resolve_pay_inversion"));
  assert.ok(recommendations.some((item) => item.scenarioId === "redesign_salary_bands"));
});

test("deriveBaselineScenario is derived from current input", () => {
  const first = deriveBaselineScenario(healthyInput);
  const second = deriveBaselineScenario({ ...healthyInput, plannedHires: 20 });
  assert.notEqual(first.annualCostImpact, second.annualCostImpact);
});

test("compareScenarios does not choose cheapest as best fit automatically", () => {
  const comparison = compareScenarios(riskyInput, [
    "baseline_current_state",
    "redesign_salary_bands",
  ]);
  assert.equal(comparison.bestFitScenarioId, "redesign_salary_bands");
});
```

- [ ] **Step 3: Implement calculations**

Create `src/lib/hr-paysim/calculations.ts` with pure functions:

```ts
import type { DiagnosisResult, QuickInputDraft, ScenarioId } from "./domain";

export interface ScenarioComparisonRow {
  scenarioId: ScenarioId;
  annualCostImpact: number;
  explainabilityChange: number;
  exceptionDebtChange: number;
  implementationBurden: "low" | "medium" | "high";
  gain: string;
  tradeoff: string;
}

export interface ScenarioComparisonResult {
  rows: ScenarioComparisonRow[];
  bestFitScenarioId: ScenarioId;
}

export function calculateDiagnosis(input: QuickInputDraft): DiagnosisResult {
  const exceptionRate = safeRate(input.exceptionRaiseCount, input.employeeCount);
  const inversionRate = safeRate(input.inversionCaseCount, input.employeeCount);
  const hiringPressure = safeRate(input.plannedHires, input.employeeCount);
  const ceiScore = clamp(
    92 - exceptionRate * 180 - inversionRate * 220 - (input.salaryBandExists ? 0 : 22),
    0,
    100,
  );
  const cedScore = clamp(exceptionRate * 260 + inversionRate * 180 + (input.salaryBandExists ? 0 : 12), 0, 100);
  return {
    ceiScore,
    ceiBand: bandCEI(ceiScore),
    cedScore,
    cedBand: bandCED(cedScore),
    payInversionSeverity: inversionSeverity(input.inversionCaseCount, input.employeeCount),
    payrollIncreaseRate: hiringPressure,
  };
}

export function deriveBaselineScenario(input: QuickInputDraft): ScenarioComparisonRow {
  return {
    scenarioId: "baseline_current_state",
    annualCostImpact: Math.round(input.plannedHires * averageNewHireCost(input)),
    explainabilityChange: input.salaryBandExists ? 0 : -4,
    exceptionDebtChange: input.exceptionRaiseCount > 0 ? 4 : 0,
    implementationBurden: "low",
    gain: "단기 비용과 조직 혼선을 줄입니다.",
    tradeoff: "설명하기 어려운 예외가 누적될 수 있습니다.",
  };
}

export function compareScenarios(input: QuickInputDraft, scenarioIds: ScenarioId[]): ScenarioComparisonResult {
  const rows = scenarioIds.map((scenarioId) => scenarioRow(input, scenarioId));
  const bestFit = [...rows].sort((a, b) => scoreRow(b) - scoreRow(a))[0];
  return {
    rows,
    bestFitScenarioId: bestFit?.scenarioId ?? "baseline_current_state",
  };
}

function scenarioRow(input: QuickInputDraft, scenarioId: ScenarioId): ScenarioComparisonRow {
  if (scenarioId === "baseline_current_state") return deriveBaselineScenario(input);
  if (scenarioId === "resolve_pay_inversion") {
    return {
      scenarioId,
      annualCostImpact: input.inversionCaseCount * averageEmployeeCost(input) * 0.08,
      explainabilityChange: 12,
      exceptionDebtChange: -10,
      implementationBurden: "medium",
      gain: "급여 역전 구간을 줄여 내부 설명 가능성을 높입니다.",
      tradeoff: "단기 보상 조정 예산이 필요합니다.",
    };
  }
  if (scenarioId === "redesign_salary_bands") {
    return {
      scenarioId,
      annualCostImpact: input.employeeCount * averageEmployeeCost(input) * 0.035,
      explainabilityChange: 18,
      exceptionDebtChange: -16,
      implementationBurden: "medium",
      gain: "역할과 레벨 기준을 명확히 해 반복 의사결정을 줄입니다.",
      tradeoff: "정책 설계와 커뮤니케이션 부담이 생깁니다.",
    };
  }
  if (scenarioId === "forecast_payroll_growth") {
    return {
      scenarioId,
      annualCostImpact: input.plannedHires * averageNewHireCost(input),
      explainabilityChange: 6,
      exceptionDebtChange: -2,
      implementationBurden: "low",
      gain: "채용 계획이 급여 총액에 주는 영향을 먼저 확인합니다.",
      tradeoff: "보상 구조 자체를 고치지는 않습니다.",
    };
  }
  if (scenarioId === "ai_tooling_check") {
    return {
      scenarioId,
      annualCostImpact: input.employeeCount * 450000,
      explainabilityChange: 5,
      exceptionDebtChange: -1,
      implementationBurden: "high",
      gain: "채용과 도구 예산을 함께 검토합니다.",
      tradeoff: "성과 가정과 운영 책임을 명확히 해야 합니다.",
    };
  }
  return {
    scenarioId,
    annualCostImpact: input.employeeCount * averageEmployeeCost(input) * 0.015,
    explainabilityChange: 8,
    exceptionDebtChange: -4,
    implementationBurden: "high",
    gain: "조율 역할의 책임과 보상 기준을 분리해 봅니다.",
    tradeoff: "역할 정의와 승인 기준이 필요합니다.",
  };
}

function scoreRow(row: ScenarioComparisonRow): number {
  const burdenPenalty = row.implementationBurden === "high" ? 8 : row.implementationBurden === "medium" ? 4 : 0;
  return row.explainabilityChange + Math.abs(Math.min(row.exceptionDebtChange, 0)) - burdenPenalty;
}

function averageEmployeeCost(input: QuickInputDraft): number {
  return (input.basePayrollAnnual + input.variablePayAnnual + input.benefitsAnnual) / Math.max(input.employeeCount, 1);
}

function averageNewHireCost(input: QuickInputDraft): number {
  return averageEmployeeCost(input) * 0.92;
}

function safeRate(value: number, total: number): number {
  return total <= 0 ? 0 : value / total;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function bandCEI(score: number) {
  if (score >= 80) return "healthy";
  if (score >= 65) return "manageable";
  if (score >= 50) return "watch";
  return "risk";
}

function bandCED(score: number) {
  if (score < 25) return "low";
  if (score < 50) return "manageable";
  if (score < 80) return "high";
  return "critical";
}

function inversionSeverity(count: number, employeeCount: number) {
  const rate = safeRate(count, employeeCount);
  if (count === 0) return "none";
  if (rate < 0.03) return "low";
  if (rate < 0.08) return "medium";
  return "high";
}
```

- [ ] **Step 4: Implement recommendation engine**

Create `src/lib/hr-paysim/recommendations.ts`:

```ts
import type { DiagnosisResult, QuickInputDraft, ScenarioId, ScenarioRecommendation } from "./domain";

const copy: Record<ScenarioId, Omit<ScenarioRecommendation, "priority">> = {
  baseline_current_state: {
    scenarioId: "baseline_current_state",
    reason: "현재 구조를 유지하되 다음 점검 조건을 둡니다.",
    whatItChecks: "단기 비용 부담 없이 운영할 수 있는지 확인합니다.",
    whatItWillNotClaim: "아무것도 하지 않아도 된다고 판단하지 않습니다.",
    expectedDecisionOutput: "현 상태 유지 조건과 다음 점검 시점",
  },
  resolve_pay_inversion: {
    scenarioId: "resolve_pay_inversion",
    reason: "신규 입사자와 기존 구성원 사이의 설명 어려움을 먼저 줄입니다.",
    whatItChecks: "역전 구간 해소 비용과 내부 설명 가능성을 확인합니다.",
    whatItWillNotClaim: "개인별 적정 연봉을 정하지 않습니다.",
    expectedDecisionOutput: "역전 구간 정리 범위",
  },
  redesign_salary_bands: {
    scenarioId: "redesign_salary_bands",
    reason: "역할과 레벨 기준을 다시 세워 반복 예외를 줄입니다.",
    whatItChecks: "밴드 재설계 비용과 실행 부담을 확인합니다.",
    whatItWillNotClaim: "시장 연봉 데이터를 대체하지 않습니다.",
    expectedDecisionOutput: "급여 밴드 재설계 방향",
  },
  forecast_payroll_growth: {
    scenarioId: "forecast_payroll_growth",
    reason: "채용 계획이 급여 총액에 주는 영향을 먼저 봅니다.",
    whatItChecks: "다음 12개월 급여 총액 압력을 확인합니다.",
    whatItWillNotClaim: "매출이나 생산성을 예측하지 않습니다.",
    expectedDecisionOutput: "채용 계획별 급여 총액 범위",
  },
  ai_tooling_check: {
    scenarioId: "ai_tooling_check",
    reason: "AI 도구가 채용과 보상 예산 판단에 주는 영향을 추가로 점검합니다.",
    whatItChecks: "도구 예산, 채용 속도, 운영 책임의 관계를 확인합니다.",
    whatItWillNotClaim: "AI가 몇 명을 대체한다고 말하지 않습니다.",
    expectedDecisionOutput: "AI 도구 검토 조건",
  },
  senior_orchestrator_premium: {
    scenarioId: "senior_orchestrator_premium",
    reason: "조율 역할의 부담이 커질 때 별도 프리미엄 기준을 검토합니다.",
    whatItChecks: "조율 책임과 보상 기준을 분리할 필요가 있는지 확인합니다.",
    whatItWillNotClaim: "임원 보상을 자동 산정하지 않습니다.",
    expectedDecisionOutput: "조율 역할 보상 기준",
  },
};

export function recommendScenarios(input: QuickInputDraft, diagnosis: DiagnosisResult): ScenarioRecommendation[] {
  const ids: ScenarioId[] = ["baseline_current_state"];
  const healthy =
    diagnosis.ceiBand === "healthy" &&
    diagnosis.cedBand === "low" &&
    diagnosis.payInversionSeverity === "none";

  if (!healthy && diagnosis.payInversionSeverity !== "none") ids.push("resolve_pay_inversion");
  if (!healthy && (!input.salaryBandExists || diagnosis.ceiBand === "risk")) ids.push("redesign_salary_bands");
  if (input.plannedHires / Math.max(input.employeeCount, 1) > 0.15) ids.push("forecast_payroll_growth");
  if (input.currentAiToolingLevel !== "unanswered" && input.currentAiToolingLevel !== "none") ids.push("ai_tooling_check");
  if (!healthy && input.employeeCount >= 80) ids.push("senior_orchestrator_premium");

  return ids.map((scenarioId, index) => ({
    ...copy[scenarioId],
    priority: index === 0 && healthy ? "primary" : index <= 2 ? "secondary" : "optional",
  }));
}
```

- [ ] **Step 5: Implement copy module and copy tests**

Create `src/lib/hr-paysim/copy.ts` and `tests/hr-paysim/copy.test.ts` so `getInterpretation()` returns Korean headline/body/supporting points for CEI/CED/inversion combinations and the forbidden wording list is exported as `FORBIDDEN_PAY_SIM_WORDING`.

- [ ] **Step 6: Verify gate**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: all commands pass. Do not proceed to UI component migration until this passes.

## Task 2: Convert Static Design Into React Component Shells

**Files:**
- Create: `src/components/hr-paysim/PaySimShell.tsx`
- Create: `src/components/hr-paysim/PaySimStepper.tsx`
- Create: `src/components/hr-paysim/screens/*.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/lib/hr-paysim/fixtures.ts`

- [ ] **Step 1: Create sample fixture state**

Create `src/lib/hr-paysim/fixtures.ts` with a safe aggregate sample based on the prototype numbers. Do not include names, emails, employee rows, raw salary rows, or company names.

- [ ] **Step 2: Create `PaySimStepper`**

Implement a component that receives `steps`, `currentStep`, `completedSteps`, `staleSteps`, and `onStepSelect`. It must render `aria-current="step"` on the active step, disable inaccessible steps, and show readable text like `4 / 9`.

- [ ] **Step 3: Create screen shell components**

Create screen components for:

```text
EntryGate
IntakeMethodSelector
QuickInput
AggregateReview
GovernanceDiagnosis
ExpertInterpretation
ScenarioRecommendations
AIAdditionalCheck
ScenarioComparison
MemoPreview
AggregateConsent
```

Use stub props from fixtures only. Do not connect session state yet.

- [ ] **Step 4: Migrate approved visual CSS**

Move the relevant visual tokens and layout rules from `prototypes/hr-paysim-redesign/styles.css` into `src/styles.css`, adapting selectors to React component class names. Keep the approved cobalt/white/gray direction.

- [ ] **Step 5: Verify shell**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: all commands pass and the app renders all 9 shells from stub state.

## Task 3: Implement URL-Driven Wizard State

**Files:**
- Create: `src/lib/hr-paysim/session.ts`
- Create: `src/routes/hr-paysim/router.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/hr-paysim/PaySimShell.tsx`
- Create: `tests/hr-paysim/session.test.ts`

- [ ] **Step 1: Write session tests**

Test default session creation, step completion, first incomplete step detection, inaccessible route redirect target, input stale invalidation, scenario assumption stale invalidation, and JSON restore fallback.

- [ ] **Step 2: Implement session model**

Implement `PaySimSessionState` with `currentStep`, `completedSteps`, `mode`, optional input/results fields, and stale flags for diagnosis, recommendations, comparison, and memo preview.

- [ ] **Step 3: Implement router helpers**

Use the native History API. Implement:

```ts
routeForStep(step: PaySimStep): string
stepFromPath(pathname: string): PaySimStep
replaceStep(step: PaySimStep): void
pushStep(step: PaySimStep): void
```

- [ ] **Step 4: Connect focus management**

After each step transition, focus the route heading if present. If the heading is not focusable, focus the primary CTA.

- [ ] **Step 5: Verify gate**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: route guard and stale tests pass.

## Task 4: Direct Input And Sample Preview Intake

**Files:**
- Modify: `src/components/hr-paysim/screens/QuickInput.tsx`
- Modify: `src/components/hr-paysim/screens/AggregateReview.tsx`
- Create: `src/lib/hr-paysim/validation.ts`
- Create: `tests/hr-paysim/validation.test.ts`

- [ ] **Step 1: Write validation tests**

Test negative numbers, missing required fields, PII-like free text, `currentAiToolingLevel: "unanswered"` vs `"none"`, and CSV disabled scope.

- [ ] **Step 2: Implement validation**

Implement `validateQuickInput()` and `containsPiiLikeText()` with plain Korean errors.

- [ ] **Step 3: Connect direct and sample flows**

Direct mode writes an input draft. Sample mode loads the fixture. Both proceed to aggregate review only when validation passes.

- [ ] **Step 4: Verify gate**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: direct input and sample preview both reach aggregate review.

## Task 5: Diagnosis, Interpretation, And Recommendations

**Files:**
- Modify: `src/components/hr-paysim/screens/GovernanceDiagnosis.tsx`
- Modify: `src/components/hr-paysim/screens/ExpertInterpretation.tsx`
- Modify: `src/components/hr-paysim/screens/ScenarioRecommendations.tsx`
- Modify: `src/lib/hr-paysim/session.ts`
- Modify: `src/lib/hr-paysim/copy.ts`

- [ ] **Step 1: Connect calculations**

When aggregate review is accepted, calculate diagnosis, generate interpretation, and generate recommendations from current input.

- [ ] **Step 2: Render founder-facing labels**

Show these four diagnosis categories:

```text
보상 설명 가능성
반복된 예외 인상
신규 입사자와 기존 구성원 간 보상 역전
현재 매달 나가는 인건비
```

- [ ] **Step 3: Render recommendations**

Show 2-3 primary/secondary recommendations first and keep optional scenarios collapsed behind “다른 선택지도 보기”. Always include `baseline_current_state`.

- [ ] **Step 4: Verify gate**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: diagnosis, interpretation, and recommendation screens use real calculated values.

## Task 6: Scenario Comparison And Memo Preview

**Files:**
- Modify: `src/components/hr-paysim/screens/ScenarioComparison.tsx`
- Modify: `src/components/hr-paysim/screens/MemoPreview.tsx`
- Modify: `src/lib/hr-paysim/calculations.ts`
- Create: `src/lib/hr-paysim/memo.ts`
- Create: `tests/hr-paysim/memo.test.ts`

- [ ] **Step 1: Write memo tests**

Test that generated memo text includes current issue, selected scenarios, why this option is considered, `얻는 것`, `감수할 것`, and next questions. Test that it excludes PDF/legal/tax/salary-calculator claims.

- [ ] **Step 2: Connect scenario assumptions and comparison**

Selected scenarios plus assumptions produce a comparison result. Baseline is derived from current input every time and is never stored as independent state.

- [ ] **Step 3: Implement copy button**

Use `navigator.clipboard.writeText()` when available and show a fallback plain-text textarea if clipboard write fails.

- [ ] **Step 4: Verify gate**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: comparison and memo preview use calculated session data.

## Task 7: Aggregate Consent And Log Payload Validator

**Files:**
- Create: `src/lib/hr-paysim/consent.ts`
- Create: `tests/hr-paysim/consent.test.ts`
- Create/modify: `src/components/hr-paysim/screens/AggregateConsent.tsx`
- Modify: `src/lib/hr-paysim/session.ts`

- [ ] **Step 1: Write consent tests**

Test that payload generation returns `null` unless `consentForAggregateAnalysis` is true. Test that company name permission is separate. Test that payload excludes employee names, emails, phone numbers, resident IDs, raw salaries, raw CSV rows, and company name by default.

- [ ] **Step 2: Implement local payload validator**

Implement payload generation only. Do not transmit data to a server.

- [ ] **Step 3: Connect decline path**

Declining consent must keep memo preview available.

- [ ] **Step 4: Verify gate**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: consent is separated from memo preview and no server emission exists.

## Task 8: Browser QA And Responsive Verification

**Files:**
- Create/modify: `prototypes/hr-paysim-redesign/qa/README.md` or `docs/hr-paysim/app-build-qa.md`
- Modify app files only if QA finds defects.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

Expected: local Vite URL is available.

- [ ] **Step 2: Run desktop smoke flow**

Verify:

```text
entry -> intake -> aggregate review -> diagnosis -> interpretation -> recommendations -> ai check -> comparison -> memo preview
```

Expected: all steps work with direct input and sample data.

- [ ] **Step 3: Run route and refresh QA**

Verify direct access to a locked future route redirects to the first incomplete step, browser back works, and refresh restores the available session.

- [ ] **Step 4: Run accessibility QA**

Verify keyboard-only navigation, `aria-current="step"`, focus movement after step transition, visible disabled reasons, error messages, loading state, and stale state.

- [ ] **Step 5: Run mobile QA**

Verify at `390x844` that text does not overlap, footer controls remain reachable, stepper can be read, and the full flow works.

- [ ] **Step 6: Run final gate**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: all commands pass.

- [ ] **Step 7: Write QA notes**

Record:

```text
- Commands run
- Desktop flow result
- Mobile flow result
- Keyboard/accessibility result
- Remaining known issues
- Whether any 3-loop blocker occurred
```

## Task 9: Final Handoff

**Files:**
- Read: `docs/hr-paysim/09_stack_decision.md`
- Read: `docs/hr-paysim/10_build_rules.md`
- Read: QA notes file
- Run: final npm gate

- [ ] **Step 1: Confirm final scope**

Confirm v1.0 includes direct input and sample preview, not CSV upload or PDF export.

- [ ] **Step 2: Confirm app behavior**

Confirm the app is not only clickable; it calculates diagnosis, recommendations, comparison, memo text, stale flags, and consent payload validation from current session state.

- [ ] **Step 3: Report final status**

Final report must include:

```text
- Files changed
- Commands run
- Full-flow QA result
- Mobile/accessibility QA result
- Remaining risks
- Any task stopped due to the 3-loop rule
```

