# HR PaySim Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build HR PaySim v1.0 as a controlled sibling module of HR Prism, starting with data schema and calculation engine before UI.

**Architecture:** HR PaySim should be implemented as a domain-heavy module with clear boundaries between schemas, calculations, scenario orchestration, UI state, and aggregate logging. The calculation engine must be handcrafted, test-first, and independent from UI rendering so formulas and scenario outputs can be validated before pilot use.

**Tech Stack:** Use the existing HR Prism stack once the real repository is available. The likely implementation target is TypeScript with schema validation, unit tests for pure calculation functions, and HR Prism-compatible frontend components.

---

## Build Strategy

- Do not use generic vibe-coding shortcuts.
- Keep implementation handcrafted and controlled.
- Implement data schema and calculation engine first.
- UI comes only after core formulas and scenario outputs are validated.
- Use synthetic sample data only.
- Do not store employee-level PII.
- Do not persist raw salary files.
- Keep Advanced AI scenarios feature-flagged or visually collapsed.

## Pilot-Linked Deadlines

First build deadline:

- HR Prism must run first.
- HR PaySim should be used only after HR Prism shows high compensation risk, low compensation explainability, or high compensation exception debt.
- The first build should be ready before the first pilot client reaches a high compensation risk diagnosis.

UI deadline:

- Basic input UI, Governance Snapshot, Scenario Builder, Scenario Comparison, and Decision Memo Preview should be complete before the first pilot that has high compensation risk.
- Aggregate Consent can be enabled for the first case-exchange pilot only after privacy copy and logging schema are validated.

## Assumed File Map

These paths are proposed implementation targets. During implementation, align them to the actual HR Prism repository structure while preserving the responsibilities below.

| Area | Likely Files |
| --- | --- |
| Domain schemas | `frontend/lib/hr-paysim/schema/types.ts`, `frontend/lib/hr-paysim/schema/validation.ts` |
| Synthetic examples | `frontend/lib/hr-paysim/examples/syntheticCompanies.ts` |
| Metric engine | `frontend/lib/hr-paysim/metrics/cei.ts`, `ced.ts`, `payInversion.ts`, `salaryBandHealth.ts`, `payrollForecast.ts`, `orchestratorPremium.ts`, `productivityLeakage.ts` |
| Scenario engine | `frontend/lib/hr-paysim/scenarios/baseline.ts`, `payInversionCorrection.ts`, `salaryBandRedesign.ts`, `payrollCostForecast.ts`, `aiToolingHeadcountFreeze.ts`, `seniorOrchestratorPremium.ts`, `compareScenarios.ts` |
| UI state | `frontend/lib/hr-paysim/state/usePaySimSession.ts` or HR Prism's existing state pattern |
| UI screens | `frontend/components/hr-paysim/PaySimIntro.tsx`, `QuickInput.tsx`, `GovernanceSnapshot.tsx`, `ScenarioBuilder.tsx`, `ScenarioComparison.tsx`, `DecisionMemoPreview.tsx`, `AggregateConsent.tsx` |
| Route | HR Prism-compatible route such as `frontend/app/hr-paysim/page.tsx` or the existing module route convention |
| Tests | `frontend/lib/hr-paysim/**/*.test.ts`, `frontend/components/hr-paysim/*.test.tsx` |

## Phase 0: Planning Docs

### Files likely to create or modify

- Existing: `docs/hr-paysim/00_product_thesis.md`
- Existing: `docs/hr-paysim/01_scope_v1.md`
- Existing: `docs/hr-paysim/02_data_schema.md`
- Existing: `docs/hr-paysim/03_metric_formula_spec.md`
- Existing: `docs/hr-paysim/04_scenario_spec.md`
- Existing: `docs/hr-paysim/05_ui_flow.md`
- Existing: `docs/hr-paysim/06_privacy_and_logging.md`
- Existing: `docs/hr-paysim/07_build_plan.md`

### Tests required

- Documentation review only.
- Run link/path check if a docs linter exists.
- Search for forbidden claims:
  - `AI substitution`
  - `Total Work Cost`
  - `attrition probability`
  - `employee-level`
  - `salary calculator`

### Acceptance criteria

- All planning docs exist.
- HR PaySim identity is consistent.
- HR Prism-first pilot flow is consistent.
- Strict exclusions are repeated without contradiction.
- Privacy and logging consent are explicit.

### Manual QA checklist

- Confirm product name is HR PaySim.
- Confirm client-facing label is Compensation Governance Simulator.
- Confirm AI is an Advanced lens only.
- Confirm no doc positions HR PaySim as a salary calculator.
- Confirm no doc allows raw salary file persistence.

### Commit message suggestion

`docs: add HR PaySim planning foundation`

## Phase 1: Data Schema and Sample Data

### Files likely to create or modify

- Create: `frontend/lib/hr-paysim/schema/types.ts`
- Create: `frontend/lib/hr-paysim/schema/validation.ts`
- Create: `frontend/lib/hr-paysim/examples/syntheticCompanies.ts`
- Create: `frontend/lib/hr-paysim/schema/validation.test.ts`
- Create: `frontend/lib/hr-paysim/examples/syntheticCompanies.test.ts`

### Tests required

- Validate required fields for `CompanyContext`.
- Validate aggregate-only `CompensationSnapshot`.
- Reject negative currency values and negative counts.
- Reject employee names, emails, phone numbers, and resident IDs in free-text fields.
- Confirm `AggregateLogEvent` matches `02_data_schema.md`.
- Confirm synthetic examples contain no real company identifiers.

### Acceptance criteria

- Types cover CompanyContext, CompensationSnapshot, HiringPlan, SalaryBandModel, AIScenarioInputs, ScenarioResult, and AggregateLogEvent.
- Validation rules match `02_data_schema.md`.
- Synthetic examples can support baseline, main scenarios, and Advanced scenarios.
- No employee-level PII appears in sample data.

### Manual QA checklist

- Open synthetic sample records and confirm all names are generic or absent.
- Confirm company size is banded.
- Confirm funding stage is categorized.
- Confirm AI fields are optional.
- Confirm optional cash/runway fields are not required.

### Commit message suggestion

`feat: add HR PaySim schemas and synthetic examples`

## Phase 2: Calculation Engine

### Files likely to create or modify

- Create: `frontend/lib/hr-paysim/metrics/cei.ts`
- Create: `frontend/lib/hr-paysim/metrics/ced.ts`
- Create: `frontend/lib/hr-paysim/metrics/payInversion.ts`
- Create: `frontend/lib/hr-paysim/metrics/salaryBandHealth.ts`
- Create: `frontend/lib/hr-paysim/metrics/payrollForecast.ts`
- Create: `frontend/lib/hr-paysim/metrics/orchestratorPremium.ts`
- Create: `frontend/lib/hr-paysim/metrics/productivityLeakage.ts`
- Create: matching `*.test.ts` files for each metric.

### Tests required

- CEI returns score, band, explanation text, confidence, and risk flags.
- CED returns score, band, explanation text, confidence, and risk flags.
- Pay inversion detection returns case count and severity band.
- Salary band health translates technical concepts into internal result fields ready for Korean UX.
- Payroll forecast returns monthly delta, annual delta, increase rate, and optional runway impact only when optional inputs exist.
- Orchestrator Premium Pool refuses to calculate without user-provided hiring delay or budget reallocation assumptions.
- Productivity Leakage Flag returns true/false, reasons, and recommended question.
- Tests confirm no AI substitution percentage, Total Work Cost, attrition probability, or exact productivity gain percentage exists.

### Acceptance criteria

- All metric functions are pure and UI-independent.
- Every metric returns a value and plain-language explanation.
- Scores avoid fake precision and use bands.
- Advanced metrics are marked Advanced-only.
- Formula behavior matches `03_metric_formula_spec.md`.

### Manual QA checklist

- Run metric tests with low, medium, and high-risk synthetic examples.
- Inspect explanations for Korean UX readiness.
- Confirm missing inputs lower confidence instead of fabricating precision.
- Confirm payroll forecast does not include tax, benefits, equity, or vendor cost.
- Confirm AI tooling assumptions never produce replacement counts.

### Commit message suggestion

`feat: implement HR PaySim metric engine`

## Phase 3: Basic Input UI

### Files likely to create or modify

- Create: `frontend/components/hr-paysim/QuickInput.tsx`
- Create: `frontend/components/hr-paysim/CompanyContextSection.tsx`
- Create: `frontend/components/hr-paysim/CompensationSnapshotSection.tsx`
- Create: `frontend/components/hr-paysim/HiringPlanSection.tsx`
- Create: `frontend/components/hr-paysim/ExceptionSignalsSection.tsx`
- Create: `frontend/components/hr-paysim/OptionalAISection.tsx`
- Create: UI tests for input validation and collapsed Advanced section.

### Tests required

- Required aggregate inputs block snapshot generation when missing.
- Optional AI section is collapsed by default.
- Employee-level PII is rejected in free text.
- Currency and count fields validate non-negative values.
- Optional cash/runway fields do not block main flow.

### Acceptance criteria

- Input UI uses HR Prism visual patterns.
- No employee-level sensitive data is requested.
- AI input section is optional and visually Advanced.
- User can proceed with aggregate data only.

### Manual QA checklist

- Fill minimum valid inputs and continue.
- Leave optional fields blank and continue.
- Open and close Advanced section.
- Try entering an email or phone number in free text and confirm rejection.
- Confirm Korean helper copy explains aggregate input.

### Commit message suggestion

`feat: add HR PaySim quick input flow`

## Phase 4: Snapshot UI

### Files likely to create or modify

- Create: `frontend/components/hr-paysim/GovernanceSnapshot.tsx`
- Create: `frontend/components/hr-paysim/MetricCard.tsx`
- Create: `frontend/components/hr-paysim/RiskFlagList.tsx`
- Create: `frontend/components/hr-paysim/InterpretationSentence.tsx`
- Create: component tests for snapshot rendering.

### Tests required

- CEI card renders score, band, and Korean explanation.
- CED card renders score, band, and Korean explanation.
- Pay inversion card renders case count and severity.
- Payroll baseline renders monthly and annual values.
- Low confidence state shows missing input guidance.

### Acceptance criteria

- Snapshot shows CEI, CED, pay inversion risk, payroll baseline, and key interpretation sentence.
- Baseline is generated before scenario comparison.
- Metric cards avoid over-precision.
- User can return to Quick Input.

### Manual QA checklist

- Review snapshot with complete input.
- Review snapshot with partial input.
- Confirm interpretation sentence is not alarmist.
- Confirm no employee-level data appears.
- Confirm labels use Korean UX language.

### Commit message suggestion

`feat: add governance snapshot UI`

## Phase 5: Scenario Builder

### Files likely to create or modify

- Create: `frontend/lib/hr-paysim/scenarios/baseline.ts`
- Create: `frontend/lib/hr-paysim/scenarios/payInversionCorrection.ts`
- Create: `frontend/lib/hr-paysim/scenarios/salaryBandRedesign.ts`
- Create: `frontend/lib/hr-paysim/scenarios/payrollCostForecast.ts`
- Create: `frontend/lib/hr-paysim/scenarios/aiToolingHeadcountFreeze.ts`
- Create: `frontend/lib/hr-paysim/scenarios/seniorOrchestratorPremium.ts`
- Create: `frontend/components/hr-paysim/ScenarioBuilder.tsx`
- Create: scenario tests and UI tests.

### Tests required

- Three main scenarios are available by default.
- Two Advanced scenarios are hidden, collapsed, or feature-flagged.
- Scenario assumptions validate before comparison.
- Salary Band Redesign uses plain Korean translation labels.
- Advanced scenarios reject AI replacement or substitution inputs.

### Acceptance criteria

- Scenario Builder includes exactly three main scenarios and two Advanced scenarios.
- Advanced scenarios do not dominate the product.
- Selected scenarios can be added to comparison.
- Scenario outputs match `04_scenario_spec.md`.

### Manual QA checklist

- Add Pay Inversion Correction.
- Add Salary Band Redesign.
- Add Payroll Cost Forecast.
- Expand Advanced section and inspect copy.
- Confirm no AI substitution percentage input exists.

### Commit message suggestion

`feat: add HR PaySim scenario builder`

## Phase 6: Scenario Comparison

### Files likely to create or modify

- Create: `frontend/lib/hr-paysim/scenarios/compareScenarios.ts`
- Create: `frontend/components/hr-paysim/ScenarioComparison.tsx`
- Create: `frontend/components/hr-paysim/ScenarioComparisonTable.tsx`
- Create: `frontend/components/hr-paysim/TradeoffSummary.tsx`
- Create: comparison tests.

### Tests required

- Comparison includes annual cost delta.
- Comparison includes monthly burn delta.
- Comparison includes CEI change.
- Comparison includes CED change.
- Comparison includes execution difficulty.
- Comparison includes communication difficulty.
- Comparison includes key trade-off.
- Baseline remains visible.
- Advanced scenarios are labeled Advanced.

### Acceptance criteria

- User can compare scenarios against baseline.
- No scenario is presented as universally best.
- Cost and governance metrics are both visible.
- Communication risk is shown alongside execution difficulty.

### Manual QA checklist

- Compare one scenario against baseline.
- Compare three main scenarios.
- Add one Advanced scenario and confirm labeling.
- Confirm best-fit language avoids "perfect answer".
- Confirm cost deltas are formatted in KRW.

### Commit message suggestion

`feat: add HR PaySim scenario comparison`

## Phase 7: Decision Memo Preview

### Files likely to create or modify

- Create: `frontend/lib/hr-paysim/memo/createDecisionMemoPreview.ts`
- Create: `frontend/components/hr-paysim/DecisionMemoPreview.tsx`
- Create: memo preview tests.

### Tests required

- Preview includes current issue.
- Preview includes best-fit scenario.
- Preview includes trade-off.
- Preview includes next question.
- Preview does not generate final formal memo.
- Preview excludes employee-level sensitive data.
- Low confidence input produces question-led preview.

### Acceptance criteria

- Decision Memo Preview is free-preview level only.
- No final paid memo is implemented in v1.0 build.
- Memo copy is executive-readable Korean.
- User can return to Scenario Comparison.

### Manual QA checklist

- Generate preview from each main scenario.
- Generate preview from an Advanced scenario and confirm Advanced caveat.
- Confirm no employee-level data appears.
- Confirm preview does not look like a final signed report.
- Confirm next question is actionable.

### Commit message suggestion

`feat: add decision memo preview`

## Phase 8: Aggregate Logging

### Files likely to create or modify

- Create: `frontend/lib/hr-paysim/logging/aggregateLogEvent.ts`
- Create: `frontend/lib/hr-paysim/logging/anonymizeAggregateEvent.ts`
- Create: `frontend/components/hr-paysim/AggregateConsent.tsx`
- Create: logging tests and consent UI tests.

### Tests required

- No event persists when consent is false.
- Event schema matches `AggregateLogEvent`.
- Company size is stored as band only.
- Funding stage is stored as category only.
- CEI and CED are stored as bands only.
- Company name is not stored in aggregate event.
- Employee-level PII is rejected.

### Acceptance criteria

- Aggregate logging is explicit and opt-in.
- Consent is separable from company name/testimonial permission.
- Logs are anonymized and limited to pattern analysis and LinkedIn/field report insights.
- Declining consent does not block product use.

### Manual QA checklist

- Decline consent and confirm no log event is created.
- Accept consent and inspect anonymized event shape.
- Confirm company name usage is not bundled.
- Confirm public-content copy says no identifying figures.
- Confirm logging does not include raw salary values.

### Commit message suggestion

`feat: add anonymized aggregate consent logging`

## Final Verification Before Pilot

- Run all unit tests for schema, metrics, scenarios, memo preview, and logging.
- Run UI tests for input, snapshot, builder, comparison, memo preview, and consent.
- Perform manual Korean copy review.
- Confirm Advanced scenarios are collapsed or feature-flagged.
- Confirm no employee-level sensitive data is persisted.
- Confirm no raw salary files are persisted.
- Confirm HR Prism-first entry flow is preserved.

## Release Gate

HR PaySim v1.0 is pilot-ready only when:

- HR Prism has already identified high compensation risk for the pilot client.
- HR PaySim can run baseline and three main scenarios with synthetic QA coverage.
- Advanced scenarios are optional and clearly separated.
- Decision Memo Preview is preview-only.
- Aggregate consent is explicit and separable.
- Strict exclusions are verified in tests and manual QA.

