# HR PaySim Strategy To Execution Amendment

## Purpose

This amendment connects `2026-07-08-hr-paysim-strategy-career-cmu-rebuild-v2.md` and the post-document discussion summary to the current HR PaySim repository.

It supersedes the older roster-wedge implementation plan wherever there is conflict. It does not start parser, detector, UI, routing, session, or app code implementation.

## Source Of Truth Order

1. `C:/Users/bang0/Downloads/2026-07-08-hr-paysim-strategy-career-cmu-rebuild-v2.md`
2. Post-document discussion summary attached in this Codex turn
3. `C:/Users/bang0/Downloads/22_findings_algorithm_reconciliation.md` for sample arithmetic and finding-rule reconciliation
4. `C:/Users/bang0/Downloads/10_product_redesign_brief.md`
5. `docs/hr-paysim/11_devils_advocate_product_redesign_review.md`
6. `docs/superpowers/plans/2026-07-08-hr-paysim-roster-wedge-redesign.md`
7. Earlier engine reconciliation and app-build plans

When these documents disagree, use the higher item in the list.

## Current Repository Findings

- This workspace contains HR PaySim as a Vite + React standalone app.
- No HR Prism question, schema, or content files are present in this workspace.
- Existing PaySim docs still describe aggregate input, CEI/CED diagnosis, payroll forecast, and optional `ai_check` as v1 scope.
- Existing code still uses `QuickInputDraft`, `exceptionRaiseCount`, `inversionCaseCount`, CEI/CED bands, aggregate scenario comparisons, and the `ai_check` step.
- Existing session state stores aggregate input only. The old roster plan proposed storing `rosterText`, but this amendment rejects that approach.
- Existing tests are scalar-input tests. They remain useful as regression history but must not define the new product contract.

## Older Plan Sections Superseded

### Superseded In `docs/hr-paysim/10_build_rules.md`

- `Direct aggregate input` is superseded by sample-first, facilitated, de-identified roster analysis.
- `CEI, CED, pay inversion, payroll forecast diagnosis` is superseded as the primary v1 output.
- `Optional AI check as an advanced scenario lens` is deferred outside core PaySim v1.
- `CSV full upload` as deferred scope is superseded. Safe paste/template roster intake becomes core, but full self-serve upload robustness stays deferred.
- `Aggregate consent UI` is superseded by de-identified structure analysis consent plus optional anonymous learning-log consent.

### Superseded In `docs/superpowers/plans/2026-07-08-hr-paysim-roster-wedge-redesign.md`

- Starting implementation at parser/domain work is superseded. Task 0A, Task 0B, Task 0.5, and the model contracts must happen first.
- The vertical slice that excludes `shadow_band` is superseded. `shadow_band` is v1 required because target companies may not have formal levels.
- `estimatedDoNothingCost` is superseded. Use `correctionFloor`, `exposurePayroll`, `communicationRisk`, `spreadRisk`, and `decisionUrgency`.
- Any detector formula using arbitrary multipliers such as `gap * 2`, `overlap * 1.5`, productivity loss, attrition loss, or replacement-cost language is superseded.
- Session fields such as `rosterText` are superseded. Raw pasted roster text must not persist in sessionStorage.
- Findings sorted by do-nothing cost are superseded. Findings should be ranked by defensibility fragility, communication risk, spread risk, decision urgency, and defensible correction floor.
- Generic "do-nothing cost" copy is superseded. Do-nothing is a decision option, not a fake loss prediction.

### Superseded In Current Code Contracts

- `QuickInputDraft` is no longer the target v1 input model.
- `exceptionRaiseCount` and `inversionCaseCount` must not be founder-entered diagnosis fields.
- `CEIBand`, `CEDBand`, and payroll increase rate must not be hero outputs for v1.
- `ScenarioId` values `forecast_payroll_growth`, `ai_tooling_check`, and `senior_orchestrator_premium` are out of core v1 scope.
- `PaySimStep` value `ai_check` is out of core v1 scope.

## Older Plan Sections Still Valid

- Keep Vite + React for this repository until there is concrete evidence that HR Prism and PaySim must share a Next.js route tree.
- Keep PaySim standalone-capable in architecture and messaging.
- Keep URL as the current-step source of truth.
- Keep sensitive company state out of URL parameters.
- Keep client-side processing for roster analysis.
- Keep `PaySimShell + screens` as the target canonical architecture after pre-implementation contracts are complete.
- Keep `PrototypePaySimApp` as temporary reference until the new vertical slice passes QA and Kyle approves deletion.
- Keep copy lint, typecheck, build, and test gates.
- Keep the stop rule: after three loops on the same unresolved implementation failure, stop and report evidence.
- Keep no-main-merge until product contract, implementation slice, QA, and branch strategy are reviewed.

## Revised Implementation Sequence

### Phase 0: Strategy And Contracts Before Code

This phase is documentation and schema-contract work. It must happen before parser, detector, memo, session, or UI implementation.

1. Task 0A: Strategy / GTM / Career Contract
2. Task 0B: HR Prism Compensation Probe Patch
3. Task 0.5: Sample Output Contract
4. Task 0C: Do-Nothing / Correction Floor Model Contract
5. Task 0D: Anonymous Pilot Learning Log Contract
6. Product/data contract revision

### Phase 1: Core Method Build

Only after Phase 0 is complete:

1. Domain type migration
2. Safe roster intake and de-identification
3. Structural finding engine for `shadow_band`, `pay_inversion`, `level_fiction_band_overlap`, and `loyalty_tax`
4. Correction-floor and risk rubric implementation
5. Founder-facing interpretation and decision option generation
6. Memo-as-document generation

### Phase 2: Facilitated Vertical Slice

1. Sample-first entry
2. Facilitated roster intake
3. De-identification confirm
4. Relationship-first findings
5. Decision options
6. Founder memo
7. Optional portfolio demo route using synthetic data

### Phase 3: QA And Review Gate

1. Product aha QA
2. Facilitated-session QA
3. Privacy QA
4. Algorithm contract QA
5. Career / CMU portfolio QA
6. Kyle approval before deleting legacy prototype or merging main

## New Required Task 0A: Strategy / GTM / Career Contract

### File

- Create: `docs/hr-paysim/17_strategy_gtm_career_contract.md`

The v2 strategy suggested `docs/hr-paysim/11_strategy_gtm_career_contract.md`, but `docs/hr-paysim/11_devils_advocate_product_redesign_review.md` already exists in this workspace. Use `17_` to avoid overwriting existing review history.

### Contract Content

The document must lock these decisions:

- HR PaySim v1 is a facilitated diagnostic tool first.
- HR PaySim is standalone-capable in architecture and messaging.
- HR PaySim v1 is not a full self-serve SaaS.
- Near-term GTM is HR Prism warm follow-up plus referral.
- Standalone sample/demo mode exists for portfolio, CMU, LinkedIn, and networking legibility.
- Standalone cold-sales funnel, pricing, payment, and public SaaS conversion are deferred.
- PaySim's core construct is compensation explainability / defensibility.
- Career/CMU framing is construct + method + qualitative case series.
- Near-term KPI is not revenue.

### Acceptance Check

The document must include this sentence verbatim:

> I operationalized compensation explainability: turning a fuzzy defensibility intuition into a computable structure from minimal de-identified rosters, and testing whether founders find it decision-useful.

## New Required Task 0B: HR Prism Compensation Probe Patch

### Repository Status

No HR Prism question/schema/content files were found in this workspace. The amendment must therefore define the patch contract here and apply it in the HR Prism repository or HR Prism docs when that codebase is available.

### Files To Create In This Repository

- Create: `docs/hr-paysim/18_hr_prism_compensation_probe_patch.md`

### Probe Copy

Use these probes in HR Prism before PaySim implementation work begins:

1. Compensation explainability
   - Korean: `비슷한 역할의 두 구성원이 서로 연봉을 비교했을 때, 대표님은 현재 기준을 일관되게 설명할 수 있습니까?`
   - Capture: 1-5 scale plus short note.
2. New-hire premium pressure
   - Korean: `최근 채용 과정에서 기존 구성원보다 높은 조건을 제시해야 했던 경우가 있었습니까?`
   - Capture: yes/no plus short note.
3. Exception compensation record
   - Korean: `예외 인상, counteroffer, founder-approved compensation exception이 발생했을 때 그 이유와 기준이 기록되어 있습니까?`
   - Capture: yes/no plus short note.
4. Informal salary band signal
   - Korean: `공식 salary band는 없더라도, 내부적으로 특정 역할이나 레벨별로 대략적인 연봉 구간이 생겨 있다고 느끼십니까?`
   - Capture: 1-5 scale plus short note.

### Suggested Insertion Point

Insert these probes in HR Prism after the section that surfaces compensation, role clarity, retention, or leadership decision friction. If HR Prism has a modular risk domain structure, place them under a compact `compensationExplainability` sub-domain so they do not take over the broader Prism diagnostic.

### Handoff Context

The HR Prism handoff must produce this shape:

```ts
export interface PaySimPrismHandoffContext {
  sourceMode: "hr_prism_followup";
  pilotCaseId?: string;
  prismSessionIdHash?: string;
  companySizeBand?: "15-30" | "31-50" | "51-80" | "81+";
  stageBand?: "pre_seed" | "seed" | "series_a" | "series_b_plus" | "unknown";
  compensationRiskSignal?: "none" | "watch" | "material" | "high";
  triggerReasons: Array<
    | "low_compensation_explainability"
    | "new_hire_premium_pressure"
    | "exception_compensation"
    | "informal_salary_band"
    | "founder_requested_deep_dive"
  >;
  prismSummaryForPaySim?: string;
  consentForCrossToolLearning?: boolean;
}
```

### PaySim Follow-Up Fit Classification

- A: strong PaySim candidate. Company has 15-80 people, founder is directly involved in compensation decisions, at least one material/high compensation-risk signal, and founder shows curiosity or concern.
- B: watchlist candidate. Some signal exists, but timing, trust, or data readiness is not strong enough for immediate PaySim.
- C: weak fit. Compensation issue is present but not explainability-related, or company is too early to have meaningful roster relationships.
- D: out of scope. Company refuses cross-tool context, has no relevant compensation concern, or asks for market benchmark, legal advice, salary calculation, pricing, payment, or full SaaS workflow instead.

## New Required Task 0.5: Sample Output Contract

### File

- Create: `docs/hr-paysim/19_sample_output_contract.md`

### Purpose

Before building parser or detectors, define exactly what a successful facilitated PaySim session should show using a synthetic sample company.

### Required Sample Artifacts

- Synthetic de-identified roster with enough rows to trigger:
  - `shadow_band`
  - `pay_inversion`
  - `level_fiction_band_overlap`
  - `loyalty_tax`
- Sample `Shadow Band Strip`
- Sample `Comparison Pair Card`
- Sample `Role Ladder`
- Sample decision options
- Sample founder memo
- Sample market benchmark objection response

### Required Aha Mapping

- Entry/demo: `제도가 없다고 구조가 없는 것은 아니다.`
- Entry/demo: `문제는 높은 연봉이 아니라 설명할 수 없는 관계다.`
- Findings: specific row-to-row comparison relationships, not abstract tables.
- Comparison/memo: `방치도 하나의 보상 의사결정이다.`
- Comparison/memo: `보상 조정은 돈 문제가 아니라 언어를 복구하는 문제다.`
- Follow-up hook: loyalty tax / early-member drift.

## New Required Task 0C: Do-Nothing / Correction Floor Model Contract

### File

- Create: `docs/hr-paysim/20_do_nothing_correction_floor_model.md`

### Required Model

Replace fake do-nothing cost with:

```ts
export type RiskBand = "low" | "medium" | "high" | "critical";

export interface FindingRiskModel {
  correctionFloorKRW?: number;
  exposurePayrollKRW?: number;
  communicationRisk: RiskBand;
  spreadRisk: RiskBand;
  decisionUrgency: RiskBand;
  nonClaim: string;
}
```

### Rules

- Show KRW only for defensible values such as correction floor and exposure payroll.
- Do not present correction floor as predicted loss.
- Do not use attrition loss, productivity loss, replacement cost, or arbitrary multipliers.
- Do not use names like `estimatedDoNothingCost`.
- Do-nothing must be presented as a decision option:
  - 얻는 것: immediate cash preservation, no immediate policy disruption.
  - 감수할 것: explanation debt remains, same relation may repeat next hiring/review cycle.

## New Required Task 0D: Anonymous Pilot Learning Log Contract

### File

- Create: `docs/hr-paysim/21_anonymous_pilot_learning_log_contract.md`

### Required Log Shape

```ts
export interface AnonymousPilotLearningLog {
  pilotCaseId: string;
  sourceMode: "hr_prism_followup" | "standalone_referral" | "portfolio_demo" | "direct_private_link";
  operatingMode: "facilitated" | "self_serve_demo";
  companySizeBand?: "15-30" | "31-50" | "51-80" | "81+";
  stageBand?: "pre_seed" | "seed" | "series_a" | "series_b_plus" | "unknown";
  topFindingType?: StructuralFindingType;
  founderAhaMoment?: string;
  founderObjection?: string;
  responseThatWorked?: string;
  selectedDecisionPath?: DecisionOptionId;
  memoExported: boolean;
  followUpRequested: boolean;
  anonymizedQuoteConsent: boolean;
}
```

### Consent Rule

No metadata, anonymous quote, or case-series note is recorded without explicit consent. Raw roster rows, original pasted text, names, emails, phone numbers, employee IDs, resident IDs, and company names must not be stored in this learning log.

## Revised Domain Types Required Before Coding

The implementation plan must define these contracts before code starts.

```ts
export type OperatingMode = "facilitated" | "self_serve_demo";

export type SourceMode =
  | "hr_prism_followup"
  | "standalone_referral"
  | "portfolio_demo"
  | "direct_private_link";

export type StructuralFindingType =
  | "shadow_band"
  | "pay_inversion"
  | "level_fiction_band_overlap"
  | "loyalty_tax";

export type RiskBand = "low" | "medium" | "high" | "critical";
export type ConfidenceBand = "low" | "low_medium" | "medium" | "high";

export interface NormalizedRosterRow {
  rowId: string;
  roleGroup: string;
  title?: string;
  levelLabel?: string;
  levelRank?: number;
  baseSalaryKRW: number;
  startDate?: string;
  tenureMonths?: number;
  latestRaiseDate?: string;
  latestRaiseAmountKRW?: number;
  exceptionFlag?: boolean;
  counterOfferFlag?: boolean;
  managerLabel?: string;
  teamLabel?: string;
}

export interface DeidentificationReport {
  acceptedRowCount: number;
  rejectedColumnHeaders: string[];
  rejectedValuePatterns: string[];
  normalizedManagerLabelCount: number;
  normalizedTeamLabelCount: number;
  rawTextPersisted: false;
}

export interface SeniorityClaim {
  rowId: string;
  roleGroup: string;
  levelRank?: number;
  tenureMonths?: number;
  seniorityScore: number;
  basis: Array<"level_rank" | "tenure" | "title" | "role_group">;
}

export interface FindingRiskModel {
  correctionFloorKRW?: number;
  exposurePayrollKRW?: number;
  communicationRisk: RiskBand;
  spreadRisk: RiskBand;
  decisionUrgency: RiskBand;
  nonClaim: string;
}

export interface StructuralFinding {
  id: string;
  type: StructuralFindingType;
  title: string;
  defensibilityQuestion: string;
  relationshipSummary: string;
  affectedRowIds: string[];
  headlinePair?: {
    underpaidRowId: string;
    comparatorRowId: string;
    salaryGapKRW: number;
    gapPercentage?: number;
    reasonThisIsHardToDefend: string;
  };
  additionalUnderpaidRowCount?: number;
  comparisonPairs: Array<{
    underpaidRowId: string;
    comparatorRowId: string;
    salaryGapKRW: number;
    gapPercentage?: number;
    reasonThisIsHardToDefend: string;
  }>;
  evidence: string[];
  seniorityClaims: SeniorityClaim[];
  riskModel: FindingRiskModel;
  confidence: ConfidenceBand;
  explanationText: string;
}

export type DecisionOptionId =
  | "do_nothing_monitor"
  | "targeted_correction"
  | "principle_first_freeze"
  | "band_reset"
  | "review_cycle_integration";
```

## Algorithm Requirements

### General Requirements

- A finding is a compensation relationship that becomes difficult for the founder to defend when employees compare pay.
- Use role group, level rank when available, tenure, salary relationship, seniority claim, and defensibility relation.
- Do not treat high salary or low salary alone as a finding.
- Do not rely on simple tenure extremes.
- Prefer percentage and median-relative thresholds over absolute KRW thresholds.
- Companies without formal level data must still produce meaningful analysis through `shadow_band`.
- Every finding must include:
  - relationship summary
  - comparison pair or band structure
  - why it is hard to defend
  - confidence
  - risk model
  - non-claim wording

### Finding Set And Lead Ordering

- Findings are non-orthogonal. A role group can legitimately trigger multiple finding types.
- The detector must return all applicable findings as a set per role group.
- The detector must not auto-rank one lead finding for v1.
- `/hr-paysim/demo` uses the sample output contract's lead order for teaching variety.
- Facilitated mode shows all detected findings per group and lets Kyle choose the lead during the session.
- Auto lead-selection heuristics are deferred.
- Fixture tests should assert set membership and headline-pair numbers, not automatic per-group lead ranking.

Demo lead order:

1. Product Engineer leads with `shadow_band`, with the sharpest inversion pair shown as evidence.
2. Platform Engineer leads with `loyalty_tax`, while noting `shadow_band` is also structurally present.
3. GTM leads with `level_fiction_band_overlap`.
4. Designer remains clean or low-signal.

### Required v1 Findings

1. `shadow_band`
   - Detect role groups with no formal level/band but salary distribution suggesting an informal structure.
   - Use role group size, adjacent salary gap percentage, median adjacent gap multiple, and absence of explainable level/tenure/title basis.
2. `pay_inversion`
   - Detect when a lower-seniority or lower-defensibility row earns more than a stronger seniority-claim row in a comparable role group.
3. `level_fiction_band_overlap`
   - Detect when level labels exist but salary ranges overlap enough that level language cannot explain compensation differences.
4. `loyalty_tax`
   - Detect when longer-tenured employees carry systematically weaker compensation position than newer comparable rows without a defensible basis.

### Explicitly Forbidden Algorithm Claims

- Predicted attrition loss
- Productivity loss
- Replacement cost
- Market salary correctness
- Individual salary recommendation
- Legal/tax advice
- AI headcount substitution

## UX Requirements

### Overall Product Mode

- v1 should feel like a facilitated decision tool, not a generic SaaS dashboard.
- Kyle should be able to screen-share the app and explain the result in a 60-90 minute session.
- The standalone demo should be legible for portfolio, CMU, LinkedIn, and networking contexts.
- Do not build a cold conversion funnel, pricing page, payment flow, or public SaaS onboarding in v1.

### Required UI Patterns

- Sample-first CTA.
- Secondary "use my company data" path.
- Relationship-first findings.
- `Comparison Pair Card`.
- `Shadow Band Strip`.
- `Role Ladder`.
- Founder-facing interpretation.
- Memo-as-document layout.
- Decision options with `얻는 것`, `감수할 것`, `언제 맞는가`, `correction floor 영향`, `communication risk 영향`, and `spread risk 영향`.

### Avoid

- Chart clutter.
- Table-first findings.
- Generic dashboard card grids.
- Self-serve onboarding overbuild.
- Hero metrics that look invented before evidence is shown.
- CEI/CED as first-screen hero outputs.

## Privacy Requirements

- Raw pasted roster text must not remain in sessionStorage.
- Store only normalized de-identified rows.
- Scan both headers and values for direct identifiers.
- Reject or strip names, emails, phone numbers, employee IDs, staff IDs, resident IDs, addresses, and other direct identifiers.
- Manager and team labels become opaque labels.
- Opaque labels must work beyond 26 unique labels.
- No roster rows are emitted to a server endpoint.
- No metadata, learning log, quote, or cross-tool join key is stored without explicit consent.
- URL may store only step/route state.
- `pilotCaseId` and `prismSessionIdHash` must be pseudonymous and consent-based.

## HR Prism Probe Insertion Proposal

Because HR Prism files are absent from this workspace, implementation must stop and request the HR Prism repository or file locations before making actual HR Prism code changes.

When HR Prism files are available:

1. Insert probes in the compensation, role clarity, retention, or leadership-decision-risk section.
2. Store probe answers in HR Prism result schema.
3. Derive `compensationRiskSignal`.
4. Generate `triggerReasons`.
5. Classify PaySim follow-up fit as A/B/C/D.
6. Create optional `PaySimPrismHandoffContext` only when cross-tool learning consent exists.

## QA Requirements

### Product Aha QA

- Within 30 seconds of sample-first demo, the user can see: `제도가 없다고 구조가 없는 것은 아니다.`
- The first finding is a relationship or shadow band, not a table or aggregate score.
- The result makes the founder think, "I may not be able to defend this relationship."
- Do-nothing appears as a decision choice, not a free or neutral default.
- Memo reads like expert interpretation, not Excel output.

### Facilitated Session QA

- Kyle can explain each screen during screen share without reading dense instructions.
- A complete sample flow fits a 90-second portfolio demo.
- A complete facilitated pilot can fit a 60-90 minute working session.
- Data errors produce recoverable, human-readable messages.

### Privacy QA

- PII headers are caught.
- PII values are caught.
- SessionStorage contains no raw pasted text.
- SessionStorage contains no names, emails, phone numbers, employee IDs, resident IDs, or company names.
- Manager/team labels are opaque.
- No log payload exists without consent.

### Algorithm QA

- `shadow_band` triggers in a level-less sample company.
- `pay_inversion` requires a defensibility relation, not just a salary gap.
- `level_fiction_band_overlap` uses level rank and overlapping ranges.
- `loyalty_tax` uses comparable role group and tenure relation.
- No test expects `estimatedDoNothingCost`.
- No test includes arbitrary multiplier expectations.

### Career / CMU QA

- The standalone demo explains compensation explainability without HR Prism context.
- The methodology note frames the work as construct + method + qualitative case series.
- It does not imply a large statistical compensation dataset.
- It includes a sample founder memo and anonymous learning-log method.

## Decisions Still Requiring Kyle Approval

1. HR Prism file location or repository access for the compensation probe patch.
2. Whether PII handling should hard-block the whole paste or strip offending columns/values with a warning.
3. The synthetic sample company story used for the portfolio demo.
4. Whether `Task 0C` and `Task 0D` are mandatory before any code or can be completed in parallel with domain typing.
5. Whether CEI/CED disappear entirely from v1 or remain as secondary internal labels after relationship evidence.
6. Whether `shadow_band` should always be the first sample finding when present.
7. Exact A/B/C/D PaySim candidate thresholds in HR Prism.
8. Storage medium for consented anonymous pilot learning logs.
9. Whether to create a separate `/hr-paysim/demo` route in the first vertical slice.
10. Deletion timing for `PrototypePaySimApp`.

## Execution Stop Conditions

Stop and ask Kyle before proceeding if implementation scope expands into:

- full SaaS onboarding,
- market benchmark,
- pricing,
- payment,
- cold public conversion funnel,
- attrition prediction,
- AI workforce planning,
- employee-level salary recommendation,
- named employee reporting,
- main-branch merge.

## Immediate Next Step

Do not execute `docs/superpowers/plans/2026-07-08-hr-paysim-roster-wedge-redesign.md` as written.

The next executable planning task is to create the Phase 0 documents:

1. `docs/hr-paysim/17_strategy_gtm_career_contract.md`
2. `docs/hr-paysim/18_hr_prism_compensation_probe_patch.md`
3. `docs/hr-paysim/19_sample_output_contract.md`
4. `docs/hr-paysim/20_do_nothing_correction_floor_model.md`
5. `docs/hr-paysim/21_anonymous_pilot_learning_log_contract.md`

After those documents are approved, rewrite the implementation plan so parser/domain work starts from these contracts rather than from the older scalar or roster-wedge assumptions.


