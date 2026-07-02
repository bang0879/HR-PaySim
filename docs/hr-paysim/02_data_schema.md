# HR PaySim v1.0 Data Schema

## Goal

Define a privacy-safe v1.0 data model for HR PaySim, a Compensation Governance Simulator for growth-stage Korean startups.

The schema supports the v1.0 scenario set defined in `01_scope_v1.md`:

- Baseline: No-action / current state scenario
- Main: Pay inversion correction
- Main: Salary band redesign
- Main: Payroll cost forecast
- Advanced: AI Tooling + Headcount Freeze
- Advanced: Senior Orchestrator Premium

The data model must keep HR PaySim focused on compensation governance. It must not turn the product into a salary calculator, standalone AI workforce simulator, employee attrition predictor, or legal/tax calculation tool.

## Privacy Rule

HR PaySim v1.0 should avoid storing employee-level sensitive data. Prefer aggregate, banded, grouped, or scenario-level inputs.

If employee-level sample data is needed for calculation testing, it must be synthetic only. Synthetic test data must not be derived from a real company roster, real payroll export, or identifiable employee records.

## Data Classification

Use the following privacy classifications when implementing these schemas later:

- `aggregate`: safe grouped values such as total headcount or average salary by level.
- `banded`: range or category values such as company size band or CEI band.
- `scenario`: user-entered assumptions for simulation.
- `advanced_optional`: optional fields used only when Advanced scenarios are enabled.
- `anonymized_log`: aggregate usage metadata without company or employee identifiers.
- `synthetic_only`: allowed only for generated test fixtures, never for production storage.

## Globally Disallowed Data

Do not include or store the following in v1.0 schemas:

- Employee names
- Emails
- Phone numbers
- Resident IDs
- Exact raw salary by named employee
- Company confidential identifiers unless explicitly consented
- Real employee-level payroll exports
- Free-text notes that identify employees, candidates, founders, investors, or confidential clients

## Field Type Conventions

- `string`: plain text value from a controlled set where possible.
- `enum`: one value from an explicit allowed list.
- `boolean`: true or false.
- `integer`: whole number.
- `number`: numeric value that may include decimals.
- `currency_krw`: non-negative integer amount in KRW.
- `percentage`: number from 0 to 100 unless otherwise stated.
- `array<string>`: list of controlled text values.
- `record<string, number>`: key-value map for grouped numeric values.
- `record<string, currency_krw>`: key-value map for grouped KRW amounts.
- `record<string, integer>`: key-value map for grouped whole-number counts.
- `record<string, enum>`: key-value map for standardized question IDs and controlled answers.
- `datetime`: ISO 8601 timestamp.

## Schema 1: CompanyContext

CompanyContext captures high-level organizational context. It should be used to shape assumptions, warnings, and scenario interpretation without identifying the company.

| Field | Type | Required | Validation Rule | Example Value | Why It Is Needed |
| --- | --- | --- | --- | --- | --- |
| company_size_band | enum | Required | One of `1-10`, `11-30`, `31-50`, `51-100`, `101-300`, `301-500`, `501+`. | `51-100` | Banded company size helps interpret compensation governance maturity without storing exact employee counts as a company identifier. |
| funding_stage | enum | Required | One of `bootstrapped`, `pre_seed`, `seed`, `series_a`, `series_b`, `series_c_plus`, `profitable`, `unknown`. | `series_a` | Funding stage affects hiring pressure, runway sensitivity, and compensation governance expectations. |
| has_hr_owner | boolean | Required | Must be true or false. | `true` | Indicates whether compensation decisions have an accountable HR owner or are founder-led. |
| has_level_system | boolean | Required | Must be true or false. | `false` | Level systems affect CEI, salary band usability, and pay inversion detection quality. |
| has_salary_band | boolean | Required | Must be true or false. | `false` | Determines whether salary band redesign begins from an existing model or informal ranges. |
| has_performance_review | boolean | Required | Must be true or false. | `true` | Review cadence affects raise governance and compensation explainability. |
| has_variable_pay | boolean | Required | Must be true or false. | `true` | Variable pay changes payroll forecasting and compensation explanation complexity. |
| has_equity_plan | boolean | Required | Must be true or false. | `true` | Equity existence affects governance context, while detailed legal/tax equity calculation remains out of scope. |
| current_ai_tooling_level | enum | Required | One of `none`, `ad_hoc`, `team_level`, `company_standard`, `unknown`. | `team_level` | Supports Advanced scenario gating without making AI the core product layer. |

## Schema 2: CompensationSnapshot

CompensationSnapshot captures aggregate compensation data at the current-state baseline. It must not store named employee payroll records.

| Field | Type | Required | Validation Rule | Example Value | Why It Is Needed |
| --- | --- | --- | --- | --- | --- |
| total_headcount | integer | Required | Must be greater than or equal to 1. Should match or fit within company_size_band. | `74` | Provides the aggregate denominator for governance and forecast calculations. |
| total_monthly_base_pay | currency_krw | Required | Must be greater than or equal to 0. | `520000000` | Establishes baseline monthly payroll cost without employee-level salary storage. |
| total_monthly_fixed_allowance | currency_krw | Required | Must be greater than or equal to 0. | `28000000` | Captures recurring fixed allowances that affect monthly burn. |
| total_expected_variable_pay | currency_krw | Optional | Must be greater than or equal to 0 when provided. Define whether monthly or annual in implementation notes. | `180000000` | Supports companies with bonus or incentive plans without modeling employee-specific payouts. |
| average_salary_by_level | record<string, currency_krw> | Optional | Keys must be level labels; values must be non-negative aggregate averages. No employee names as keys. | `{ "L2": 52000000, "L3": 72000000 }` | Supports pay inversion and band analysis using grouped level averages. |
| headcount_by_level | record<string, integer> | Optional | Values must be non-negative integers. Sum should not exceed total_headcount unless explicitly marked as partial data. | `{ "L2": 24, "L3": 18 }` | Supports level-based simulations and validates average salary groups. |
| headcount_by_function | record<string, integer> | Optional | Values must be non-negative integers. Function labels must be generic, such as `engineering`, `sales`, or `operations`. | `{ "engineering": 32, "sales": 14 }` | Supports function-level payroll and Advanced scenario grouping without named teams. |
| recent_raise_budget | currency_krw | Optional | Must be greater than or equal to 0. Recommended to represent latest annual raise pool. | `120000000` | Helps model recent governance pressure from raise cycles. |
| exception_raise_frequency | enum | Required | One of `none`, `rare`, `occasional`, `frequent`, `unknown`. | `frequent` | Feeds CED estimation without storing sensitive exception records. |
| counteroffer_frequency | enum | Required | One of `none`, `rare`, `occasional`, `frequent`, `unknown`. | `occasional` | Signals reactive compensation practices and exception debt risk. |
| new_hire_premium_exists | boolean | Required | Must be true or false. | `true` | Helps identify pay inversion and compression risk from hiring-market pressure. |
| pay_inversion_case_count | integer | Optional | Must be greater than or equal to 0. Use grouped or reviewed case counts only, not employee identities. | `7` | Provides a baseline count for pay inversion correction scenarios. |

## Schema 3: HiringPlan

HiringPlan captures planned hiring assumptions for payroll forecasting and Advanced headcount-freeze scenarios.

| Field | Type | Required | Validation Rule | Example Value | Why It Is Needed |
| --- | --- | --- | --- | --- | --- |
| planned_hires_6m | record<string, integer> | Required | Keys should be level, function, or role-group labels. Values must be non-negative integers. | `{ "L2": 5, "L3": 3 }` | Supports near-term payroll forecast and headcount freeze comparisons. |
| planned_hires_12m | record<string, integer> | Required | Keys should match or map to planned_hires_6m labels. Values must be non-negative integers. | `{ "L2": 9, "L3": 7 }` | Supports annualized payroll planning without becoming full workforce planning. |
| average_expected_salary_by_level | record<string, currency_krw> | Required | Values must be non-negative annual KRW amounts. Keys must not identify candidates or employees. | `{ "L2": 58000000, "L3": 78000000 }` | Converts grouped hiring plans into payroll forecast assumptions. |
| hiring_freeze_toggle | boolean | Required | Must be true or false. Advanced scenario visibility may depend on this value. | `false` | Enables comparison between planned hiring and freeze assumptions. |
| optional_cash_balance | currency_krw | Optional | Must be greater than or equal to 0. Do not require this field for normal operation. | `3500000000` | Allows runway-sensitive preview when the client consents to provide aggregate finance context. |
| optional_runway_months | number | Optional | Must be greater than 0 when provided. Should not be used as a finance-grade forecast. | `13.5` | Helps explain payroll pressure in plain business terms without replacing finance modeling. |

## Schema 4: SalaryBandModel

SalaryBandModel defines one salary band row. A complete band model is an array of SalaryBandModel rows.

| Field | Type | Required | Validation Rule | Example Value | Why It Is Needed |
| --- | --- | --- | --- | --- | --- |
| level | string | Required | Must be a generic level label such as `L1`, `L2`, `Senior`, or `Lead`. Must not include a person name. | `L3` | Identifies the band level used in governance and comparison. |
| min | currency_krw | Required | Must be greater than or equal to 0 and less than or equal to midpoint. | `65000000` | Defines the lower bound for band fit analysis. |
| midpoint | currency_krw | Required | Must be greater than or equal to min and less than or equal to max. | `78000000` | Provides the central reference point for progression and compression checks. |
| max | currency_krw | Required | Must be greater than or equal to midpoint. | `93000000` | Defines the upper bound for out-of-band and exception detection. |
| range_spread | percentage | Optional | Recommended formula: `(max - min) / midpoint * 100`. Must be 0 or greater when provided. | `35.9` | Helps identify whether bands are too narrow, too wide, or inconsistent. |
| midpoint_progression | percentage | Optional | Recommended formula: progression from previous level midpoint. Must be 0 or greater when provided. | `18.2` | Helps evaluate level-to-level pay architecture and explainability. |

## Schema 5: AIScenarioInputs

AIScenarioInputs are Advanced optional inputs only. These fields should be hidden, disabled, or visually separated unless Advanced scenarios are enabled.

| Field | Type | Required | Validation Rule | Example Value | Why It Is Needed |
| --- | --- | --- | --- | --- | --- |
| planned_ai_tool_budget_monthly | currency_krw | Optional | Must be greater than or equal to 0. Advanced only. | `3500000` | Supports AI Tooling + Headcount Freeze as a budget assumption, not a replacement claim. |
| planned_ai_tool_budget_annual | currency_krw | Optional | Must be greater than or equal to 0. May be derived from monthly budget times 12. Advanced only. | `42000000` | Allows annual scenario comparison without creating Total Work Cost. |
| hiring_delay_months | integer | Optional | Must be between 0 and 24. Advanced only. | `6` | Models delayed hiring in a headcount freeze scenario. |
| affected_roles_or_functions | array<string> | Optional | Values must be generic role groups or functions. No person names, emails, or unique team identifiers. Advanced only. | `["engineering", "customer_success"]` | Defines where Advanced assumptions apply without identifying employees. |
| productivity_leakage_questions | record<string, enum> | Optional | Keys must be standardized question IDs. Values should be `yes`, `no`, or `unknown`. Advanced only. | `{ "coordination_overhead_increased": "yes" }` | Supports Productivity Leakage Flag using qualitative governance signals. |
| junior_pipeline_risk_questions | record<string, enum> | Optional | Keys must be standardized question IDs. Values should be `yes`, `no`, or `unknown`. Advanced only. | `{ "junior_hiring_paused": "yes" }` | Captures whether AI/headcount decisions may weaken future talent pipeline. |
| orchestrator_target_count | integer | Optional | Must be greater than or equal to 0. Use grouped target count only, not named individuals. Advanced only. | `4` | Supports Senior Orchestrator Premium sizing without individual premium recommendations. |
| premium_pool_allocation_rate | percentage | Optional | Must be between 0 and 100. Advanced only. | `3.0` | Defines a bounded premium pool assumption as a percentage of relevant grouped payroll. |

## Schema 6: ScenarioResult

ScenarioResult stores outputs from baseline, main, or Advanced scenarios. It should contain only aggregate results, scenario metadata, and explanation text that avoids sensitive identifiers.

| Field | Type | Required | Validation Rule | Example Value | Why It Is Needed |
| --- | --- | --- | --- | --- | --- |
| scenario_id | string | Required | Must be a stable scenario identifier such as `baseline_current_state` or `pay_inversion_correction`. | `pay_inversion_correction` | Enables scenario comparison and memo generation. |
| scenario_name | string | Required | Must match a v1.0 scenario name. | `Pay inversion correction` | Provides readable display text for results. |
| annual_cost_delta | currency_krw | Required | Can be positive, zero, or negative. Must be calculated against baseline assumptions. | `145000000` | Shows annual budget impact of the scenario. |
| monthly_burn_delta | currency_krw | Required | Can be positive, zero, or negative. Must be calculated against baseline assumptions. | `12083333` | Shows monthly burn impact in startup-friendly terms. |
| cei_before | number | Required | Must be between 0 and 100. Should be interpreted directionally. | `42` | Establishes compensation explainability before the scenario. |
| cei_after | number | Required | Must be between 0 and 100. Should be interpreted directionally. | `61` | Shows expected direction of explainability improvement or decline. |
| ced_before | number | Required | Must be between 0 and 100. Higher means more exception debt. | `68` | Establishes compensation exception debt before the scenario. |
| ced_after | number | Required | Must be between 0 and 100. Higher means more exception debt. | `49` | Shows expected direction of exception debt change. |
| pay_inversion_cases_before | integer | Optional | Must be greater than or equal to 0 when provided. | `7` | Captures baseline inversion count for relevant scenarios. |
| pay_inversion_cases_after | integer | Optional | Must be greater than or equal to 0 when provided. | `2` | Captures expected remaining inversion cases after correction. |
| execution_difficulty | enum | Required | One of `low`, `medium`, `high`, `unknown`. | `medium` | Helps leaders evaluate operational feasibility. |
| communication_difficulty | enum | Required | One of `low`, `medium`, `high`, `unknown`. | `high` | Captures how hard the scenario may be to explain internally. |
| risk_flags | array<string> | Required | Values must come from controlled flags such as `budget_pressure`, `low_input_quality`, `productivity_leakage`, `fairness_perception_risk`, `advanced_assumption`. | `["budget_pressure", "fairness_perception_risk"]` | Makes scenario risks explicit for comparison and memo preview. |
| explanation_text | string | Required | Must be plain-language scenario explanation. Must not include employee names or confidential identifiers. | `This scenario reduces exception debt but creates short-term budget pressure.` | Supports Decision Memo preview without employee-facing personalization. |

## Schema 7: AggregateLogEvent

AggregateLogEvent captures anonymized usage metadata only. It must not include company names, user names, employee records, raw payroll exports, or free-text confidential identifiers.

AggregateLogEvent may be persisted only with explicit consent and should be used for anonymized pattern analysis and LinkedIn/field report insights.

| Field | Type | Required | Validation Rule | Example Value | Why It Is Needed |
| --- | --- | --- | --- | --- | --- |
| company_size_band | enum | Required | Same allowed values as CompanyContext.company_size_band. | `51-100` | Supports aggregate analysis by company maturity without exact company identity. |
| funding_stage | enum | Required | Same allowed values as CompanyContext.funding_stage. | `series_a` | Helps understand which startup stages use which scenarios. |
| has_salary_band | boolean | Required | Must be true or false. | `false` | Helps analyze whether band maturity affects scenario usage. |
| cei_band | enum | Required | One of `0-20`, `21-40`, `41-60`, `61-80`, `81-100`, `unknown`. | `41-60` | Logs explainability level as a band, not a precise sensitive score. |
| ced_band | enum | Required | One of `0-20`, `21-40`, `41-60`, `61-80`, `81-100`, `unknown`. | `61-80` | Logs exception debt as a band, not detailed company-specific risk data. |
| selected_scenario | enum | Required | One of `baseline_current_state`, `pay_inversion_correction`, `salary_band_redesign`, `payroll_cost_forecast`, `ai_tooling_headcount_freeze`, `senior_orchestrator_premium`. | `salary_band_redesign` | Tracks scenario usage without storing underlying compensation data. |
| advanced_scenario_viewed | boolean | Required | Must be true or false. | `true` | Measures whether Advanced lenses are being explored. |
| productivity_leakage_flag | boolean | Optional | Must be true or false when applicable. Do not store underlying free-text explanation. | `true` | Supports aggregate insight into Advanced scenario risk patterns. |
| created_at | datetime | Required | Must be ISO 8601 timestamp. | `2026-07-02T15:20:00+09:00` | Provides event timing for aggregate analysis. |
| consent_for_aggregate_analysis | boolean | Required | Must be true before the event is persisted for analytics. | `true` | Ensures aggregate logging only happens with explicit consent. |

## Cross-Schema Validation Rules

- CompensationSnapshot.total_headcount should fit within CompanyContext.company_size_band unless the user marks the size band as approximate.
- SalaryBandModel rows should not be required when CompanyContext.has_salary_band is false, but the Salary Band Redesign scenario may collect proposed bands.
- HiringPlan.average_expected_salary_by_level keys should map to SalaryBandModel.level when a level system exists.
- ScenarioResult.scenario_id must be one of the v1.0 scenarios defined in `01_scope_v1.md`.
- AIScenarioInputs must be ignored unless Advanced scenarios are enabled.
- AggregateLogEvent must store CEI and CED as bands, not exact input details.
- Any free-text field must be filtered or rejected if it contains employee names, emails, phone numbers, resident IDs, or company confidential identifiers without explicit consent.

## Synthetic Data Rule

Synthetic employee-level rows may be created only for calculation testing and examples. They must follow these constraints:

- Use generated names only if names are necessary for test readability; prefer anonymous IDs such as `synthetic_employee_001`.
- Do not copy real payroll distributions from a client file.
- Do not include real emails, phone numbers, resident IDs, or company identifiers.
- Do not persist synthetic employee-level fixtures in production storage.
- Do not use synthetic data to imply predictive accuracy for attrition, productivity, or market salary positioning.

## Storage Guidance for v1.0

The durable v1.0 storage model should prefer:

- CompanyContext as banded context
- CompensationSnapshot as aggregate baseline input
- HiringPlan as grouped planning input
- SalaryBandModel as non-identifying band rows
- AIScenarioInputs only behind Advanced scenario gating
- ScenarioResult as aggregate scenario output
- AggregateLogEvent only with consent and anonymization

The product should avoid storing raw spreadsheets, employee rosters, or identifiable payroll rows. If import workflows are later added, they should transform raw files into aggregate structures and discard the raw source file after processing unless explicit consent and a separate data policy exist.

## Document Acceptance Criteria

This document is acceptable when it:

- Defines a privacy-safe v1.0 data model for HR PaySim.
- Covers CompanyContext, CompensationSnapshot, HiringPlan, SalaryBandModel, AIScenarioInputs, ScenarioResult, and AggregateLogEvent.
- Defines field type, required vs optional status, validation rule, example value, and why each field is needed.
- Avoids employee-level sensitive data storage.
- Explicitly disallows employee names, emails, phone numbers, resident IDs, exact raw salary by named employee, and company confidential identifiers unless explicitly consented.
- Limits employee-level sample data to synthetic calculation testing only.
- Keeps Advanced AI-related inputs optional and gated.
- Supports v1.0 scenarios without adding out-of-scope salary benchmarking, AI substitution, attrition prediction, or legal/tax calculations.


