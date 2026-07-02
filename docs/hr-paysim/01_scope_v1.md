# HR PaySim v1.0 Scope

## Source Thesis

This scope document is based on the HR PaySim product thesis. HR PaySim is a Compensation Governance Simulator for growth-stage Korean startups. It is a sibling module to HR Prism, not a replacement.

HR PaySim v1.0 must remain centered on compensation governance. It should be triggered only when HR Prism diagnosis shows high compensation inconsistency, high compensation exception debt, or low compensation explainability. AI appears only as an advanced scenario lens inside compensation governance, not as a standalone AI workforce simulator.

## Scope Principle

Version 1.0 includes exactly the following scenarios:

- Baseline scenario: 0. No-action / current state scenario
- Main scenarios: 1. Pay inversion correction, 2. Salary band redesign, 3. Payroll cost forecast
- Advanced scenarios: 4. AI Tooling + Headcount Freeze, 5. Senior Orchestrator Premium

The advanced scenarios must be feature-flagged or visually separated as **Advanced**. They should feel like optional governance lenses for mature client conversations, not like a separate AI workforce product.

## Scenario 0: No-action / Current State Scenario

**Category:** Baseline

### Purpose

Show what happens if the company keeps its current compensation structure, exception pattern, hiring assumptions, and governance rules unchanged.

This scenario creates the comparison anchor for every other scenario. It should make visible the cost of inaction without dramatizing or predicting outcomes beyond the available inputs.

### User Inputs

- Current payroll total by team, level, or role group
- Current salary bands or informal pay ranges, if available
- Known compensation exceptions by category, not employee-sensitive details
- Planned headcount changes, if already approved
- Current compensation policy clarity rating or HR Prism-derived compensation risk signal
- Current explanation quality indicators connected to CEI

### Outputs

- Baseline payroll projection
- Current CEI estimate
- Current CED estimate
- Current compensation inconsistency flags
- Baseline governance risk summary
- Comparison anchor for all other scenarios

### Aha Moment

The user should see that doing nothing is still a compensation decision. The baseline should reveal whether current exceptions and unclear pay logic are already creating governance pressure.

### What It Must NOT Claim

- It must not claim that specific employees will leave.
- It must not claim legal, tax, or compliance conclusions.
- It must not claim market competitiveness.
- It must not assign blame to individual managers or employees.
- It must not produce employee-level recommendations.

### Edge Cases

- The company has no formal salary bands.
- Current pay data is incomplete or grouped inconsistently.
- Known exceptions are described qualitatively, not numerically.
- HR Prism risk signal exists, but detailed compensation inputs are missing.
- Payroll is available only as an aggregate monthly or annual number.

### Acceptance Criteria

- The baseline is always available before scenario comparison.
- It uses only aggregate or role-group inputs.
- It clearly labels assumptions and missing data.
- It produces CEI and CED as governance indicators, not precise scientific scores.
- It does not introduce any scenario beyond current-state continuation.

## Scenario 1: Pay Inversion Correction

**Category:** Main

### Purpose

Help the company evaluate governance-safe ways to correct pay inversion, where newer hires or selected exceptions create compression or inversion against existing employees in comparable roles or levels.

The scenario should focus on correction strategy, budget pressure, and explainability rather than individual salary optimization.

### User Inputs

- Role groups or level groups where inversion is suspected
- Current pay ranges by group
- Target correction rule, such as minimum adjustment threshold or band alignment rule
- Budget ceiling for correction
- Exception categories to include or exclude
- Timing option, such as immediate correction or phased correction

### Outputs

- Estimated correction budget by group
- Number or share of affected grouped records, without employee identity
- CEI impact estimate
- CED reduction estimate
- Budget pressure summary
- Governance notes for explaining the correction principle

### Aha Moment

The user should understand that correcting pay inversion is not only a fairness action. It can reduce future exception debt and make compensation explanations more durable.

### What It Must NOT Claim

- It must not recommend a specific employee's pay.
- It must not claim that inversion correction guarantees retention.
- It must not claim that a single correction eliminates all fairness concerns.
- It must not use external market benchmark data.
- It must not create individual compensation explanations for employees.

### Edge Cases

- The correction budget is lower than the estimated inversion gap.
- Salary bands do not exist or are not trusted.
- Founder-approved exceptions conflict with the correction rule.
- Some roles are too unique to group cleanly.
- Inputs show compression but not true inversion.

### Acceptance Criteria

- The scenario distinguishes inversion, compression, and unclear classification.
- It can show phased correction when immediate correction exceeds budget.
- It outputs governance trade-offs, not employee-level instructions.
- It updates CEI and CED directionally against the baseline.
- It clearly warns when input quality is too weak for confident simulation.

## Scenario 2: Salary Band Redesign

**Category:** Main

### Purpose

Help the company test redesigned salary bands or pay ranges to improve compensation consistency, explainability, and decision discipline.

The scenario should support policy design conversations, especially when current bands are missing, outdated, too wide, too narrow, or frequently overridden.

### User Inputs

- Current band structure or informal pay ranges
- Proposed band structure by role family, level, or team group
- Band width assumptions
- Progression logic, such as level-based movement or promotion-linked movement
- Budget tolerance for band transition
- Existing exception categories that may remain outside the band

### Outputs

- Proposed band map summary
- Employees or records represented as grouped counts, not identifiable profiles
- Band fit and out-of-band count by group
- Estimated transition budget
- CEI impact estimate
- CED impact estimate
- Governance risks created by the proposed design

### Aha Moment

The user should see that salary bands are governance infrastructure, not just pay ranges. A better band design should reduce future ad hoc decisions and make compensation conversations easier to explain.

### What It Must NOT Claim

- It must not claim that the proposed bands are market-correct.
- It must not import or infer external salary benchmarks.
- It must not decide individual placement inside a band.
- It must not claim legal compliance.
- It must not guarantee manager adoption.

### Edge Cases

- Existing pay is too dispersed for simple bands.
- Proposed bands create new inversion or compression.
- A small team has too few people to support meaningful grouping.
- Leadership wants exceptions that contradict the new band logic.
- Band redesign improves CEI but increases short-term payroll pressure.

### Acceptance Criteria

- The scenario allows comparison between current and proposed bands.
- It flags out-of-band groups without exposing sensitive employee-level data.
- It shows transition budget pressure separately from ongoing payroll impact.
- It links band redesign to CEI and CED.
- It prevents claims about market competitiveness unless external benchmark integration exists, which is out of scope for v1.0.

## Scenario 3: Payroll Cost Forecast

**Category:** Main

### Purpose

Help the company forecast payroll cost under compensation governance assumptions, including planned hires, raises, band changes, and exception handling.

The scenario should make budget trade-offs visible while staying within compensation governance. It is not a full workforce planning suite or total company cost model.

### User Inputs

- Current payroll total by team, role group, or level group
- Planned headcount additions by period and group
- Planned compensation adjustment assumptions
- Raise cycle or promotion cycle assumptions
- Known recurring compensation exceptions
- Forecast period, such as 3, 6, or 12 months
- Optional budget ceiling or target payroll envelope

### Outputs

- Payroll forecast by period
- Incremental payroll impact by assumption group
- Budget overrun or underrun flags
- CEI and CED implications of the forecast assumptions
- Scenario comparison against current state
- Decision memo notes for budget governance

### Aha Moment

The user should see that payroll forecasting is not only about affordability. The same budget can create different governance outcomes depending on whether increases follow policy, exception patterns, or unclear one-off decisions.

### What It Must NOT Claim

- It must not calculate Total Work Cost.
- It must not include legal, tax, equity, benefits, or vendor cost modeling as a comprehensive cost formula.
- It must not predict individual employee behavior.
- It must not recommend hiring decisions outside compensation governance.
- It must not replace finance-grade forecasting.

### Edge Cases

- Forecast inputs are available only as annual payroll totals.
- Hiring plans are uncertain or change mid-simulation.
- Promotions and raises occur in the same period.
- Exceptions are recurring but not formally documented.
- Payroll forecast improves affordability but worsens explainability.

### Acceptance Criteria

- The scenario forecasts payroll cost without expanding into Total Work Cost.
- It separates base payroll, planned changes, and exception-driven increases.
- It supports comparison against the baseline.
- It labels uncertainty where input quality is weak.
- It connects forecast assumptions to compensation governance outcomes.

## Scenario 4: AI Tooling + Headcount Freeze

**Category:** Advanced

### Purpose

Evaluate a compensation governance scenario where the company freezes incremental headcount and uses AI tooling assumptions to support productivity, workload management, or execution capacity.

This scenario must be presented as **Advanced** and should be feature-flagged or visually separated from the main compensation scenarios. It exists to clarify workforce investment trade-offs, not to simulate AI replacing people.

### User Inputs

- Team or role group affected by the headcount freeze
- Planned hires deferred or paused, represented by grouped roles only
- AI tooling budget assumption
- Productivity support assumption, expressed qualitatively or as a bounded scenario input
- Compensation pressure created by the freeze, such as retention premium or workload premium
- Governance rule for whether savings can be reallocated to compensation adjustments

### Outputs

- Headcount freeze budget envelope
- AI tooling budget assumption summary
- Compensation reallocation option, if selected
- Productivity Leakage Flag
- CEI impact estimate
- CED impact estimate
- Advanced scenario warning and assumption notes

### Aha Moment

The user should see that an AI tooling decision can create compensation governance questions. If headcount is frozen, the company still needs to decide how workload, accountability, premiums, and explainability will be governed.

### What It Must NOT Claim

- It must not produce an AI substitution percentage.
- It must not claim that AI replaces a specific number of people.
- It must not calculate an AI Cost vs Human Cost Ratio as a standalone metric.
- It must not claim productivity gains as facts.
- It must not make job elimination recommendations.

### Edge Cases

- The company has no reliable way to estimate productivity support.
- AI tooling adds coordination work instead of reducing work.
- Headcount freeze creates unmanaged workload concentration.
- Savings are politically attractive but compensation pressure rises.
- The scenario starts to look like an AI workforce product rather than compensation governance.

### Acceptance Criteria

- The scenario is clearly labeled **Advanced** in scope and future UI.
- It is controlled by a feature flag or equivalent configuration boundary.
- It does not appear as a default main scenario.
- It uses AI only as a compensation governance assumption.
- It includes Productivity Leakage Flag when productivity assumptions may create hidden work or coordination burden.

## Scenario 5: Senior Orchestrator Premium

**Category:** Advanced

### Purpose

Evaluate whether a company should create a defined premium pool for senior orchestrator roles that coordinate human execution, AI tooling, cross-functional workflows, and decision quality.

This scenario must be presented as **Advanced** and should support carefully bounded governance conversations. It should not turn HR PaySim into an AI workforce simulator or a new role taxonomy product.

### User Inputs

- Candidate role groups eligible for orchestrator premium consideration
- Proposed premium pool amount or budget ceiling
- Eligibility principle for the premium
- Expected governance benefit, such as clearer accountability or reduced coordination leakage
- Existing senior compensation exceptions that may be consolidated into the pool
- Review cadence or sunset condition for the premium

### Outputs

- Premium pool budget impact
- Eligible grouped roles or categories
- CED reduction estimate if existing exceptions are consolidated
- CEI impact estimate
- Productivity Leakage Flag where coordination burden is unmanaged
- Governance memo notes for premium eligibility and review

### Aha Moment

The user should see that paying for orchestration can be legitimate only when the premium is explicit, governed, reviewable, and connected to organizational leverage. Hidden premiums create exception debt; governed premiums can improve explainability.

### What It Must NOT Claim

- It must not claim that orchestrator roles are automatically more valuable than other roles.
- It must not create individual premium recommendations.
- It must not claim measurable AI productivity uplift without evidence.
- It must not imply that all AI-adjacent employees deserve a premium.
- It must not define a universal compensation philosophy for every company.

### Edge Cases

- The premium pool becomes a disguised retention exception.
- Eligibility criteria are vague or politically sensitive.
- Senior roles already have high compensation variance.
- The premium increases CEI for selected roles but worsens perceived fairness elsewhere.
- The company cannot distinguish orchestration value from job title seniority.

### Acceptance Criteria

- The scenario is clearly labeled **Advanced** in scope and future UI.
- It is controlled by a feature flag or equivalent configuration boundary.
- It frames the premium as a governed pool, not an individual entitlement.
- It connects the pool to CEI, CED, and Productivity Leakage Flag where relevant.
- It avoids broad claims about AI productivity, replacement, or universal role value.

## Explicitly Out of Scope

HR PaySim v1.0 explicitly excludes:

- AI substitution percentage
- Total Work Cost calculation
- AI Cost vs Human Cost Ratio as a standalone metric
- External salary benchmark integration
- Individual attrition prediction
- Employee-facing compensation explanation generator
- Detailed equity/tax/legal calculations

These exclusions apply across all baseline, main, and advanced scenarios. They protect HR PaySim from becoming a generic salary calculator, a standalone AI workforce simulator, a tax/legal calculator, or a sensitive employee profiling system.

## Build Sequence

### Phase 1: Docs

Create and align planning documents for product thesis, v1.0 scope, scenario definitions, data assumptions, calculation boundaries, decision memo structure, and pilot usage.

### Phase 2: Data Schema + Calculation Engine

Define aggregate data structures and calculation rules for baseline, main scenarios, and feature-flagged advanced scenarios. The schema should avoid employee-level sensitive data storage and support clear assumption labeling.

### Phase 3: Basic UI

Build the first usable interface for entering grouped compensation assumptions, selecting scenarios, and viewing scenario outputs. Advanced scenarios should be hidden, disabled, or visually separated unless explicitly enabled.

### Phase 4: Scenario Comparison

Enable side-by-side comparison against the baseline. The comparison should emphasize CEI, CED, budget pressure, and governance trade-offs rather than individual recommendations.

### Phase 5: Decision Memo Preview

Generate a preview memo that summarizes scenario assumptions, outputs, risks, strict non-claims, and recommended discussion points. The memo preview can support the free preview path and later become a paid or case-exchange deliverable.

### Phase 6: Aggregate Logging

Log aggregate, non-sensitive usage and scenario metadata only with explicit consent. Logs are for anonymized pattern analysis and LinkedIn/field report insights, not for employee-level tracking. Logging should not store employee-level sensitive data.

## Document Acceptance Criteria

This document is acceptable when it:

- Includes exactly the required v1.0 scenarios and no additional scenarios.
- Separates baseline, main, and advanced scenarios.
- Defines purpose, user inputs, outputs, Aha Moment, non-claims, edge cases, and acceptance criteria for each scenario.
- States that advanced scenarios must be feature-flagged or visually separated as **Advanced**.
- Keeps AI as an advanced governance lens rather than a separate workforce simulator.
- Explicitly lists all requested out-of-scope items.
- Includes the required six-phase build sequence.
- Aligns with the HR PaySim product thesis and HR Prism-triggered positioning.

