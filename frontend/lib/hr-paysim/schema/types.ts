export const COMPANY_SIZE_BANDS = [
  "1-10",
  "11-30",
  "31-50",
  "51-100",
  "101-300",
  "301-500",
  "501+",
] as const;

export const FUNDING_STAGES = [
  "bootstrapped",
  "pre_seed",
  "seed",
  "series_a",
  "series_b",
  "series_c_plus",
  "profitable",
  "unknown",
] as const;

export const AI_TOOLING_LEVELS = [
  "none",
  "ad_hoc",
  "team_level",
  "company_standard",
  "unknown",
] as const;

export const FREQUENCY_LEVELS = [
  "none",
  "rare",
  "occasional",
  "frequent",
  "unknown",
] as const;

export const UNDOCUMENTED_NEGOTIATION_LEVELS = [
  "none",
  "low",
  "medium",
  "high",
  "unknown",
] as const;

export const QUESTION_ANSWERS = ["yes", "no", "unknown"] as const;

export const DIFFICULTY_LEVELS = ["low", "medium", "high", "unknown"] as const;

export const SCORE_BANDS = [
  "0-20",
  "21-40",
  "41-60",
  "61-80",
  "81-100",
  "unknown",
] as const;

export const SCENARIO_IDS = [
  "baseline_current_state",
  "pay_inversion_correction",
  "salary_band_redesign",
  "payroll_cost_forecast",
  "ai_tooling_headcount_freeze",
  "senior_orchestrator_premium",
] as const;

export const RISK_FLAGS = [
  "budget_pressure",
  "low_input_quality",
  "productivity_leakage",
  "fairness_perception_risk",
  "advanced_assumption",
  "communication_risk",
  "junior_pipeline_risk",
  "pay_inversion_risk",
  "exception_debt_risk",
] as const;

export type CompanySizeBand = (typeof COMPANY_SIZE_BANDS)[number];
export type FundingStage = (typeof FUNDING_STAGES)[number];
export type AIToolingLevel = (typeof AI_TOOLING_LEVELS)[number];
export type FrequencyLevel = (typeof FREQUENCY_LEVELS)[number];
export type UndocumentedNegotiationLevel =
  (typeof UNDOCUMENTED_NEGOTIATION_LEVELS)[number];
export type QuestionAnswer = (typeof QUESTION_ANSWERS)[number];
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
export type ScoreBand = (typeof SCORE_BANDS)[number];
export type ScenarioId = (typeof SCENARIO_IDS)[number];
export type RiskFlag = (typeof RISK_FLAGS)[number];
export type CurrencyKrw = number;
export type Percentage = number;

export interface CompanyContext {
  company_size_band: CompanySizeBand;
  funding_stage: FundingStage;
  has_hr_owner: boolean;
  has_level_system: boolean;
  has_salary_band: boolean;
  has_performance_review: boolean;
  has_variable_pay: boolean;
  has_equity_plan: boolean;
  current_ai_tooling_level: AIToolingLevel;
}

export interface CompensationSnapshot {
  total_headcount: number;
  total_monthly_base_pay: CurrencyKrw;
  total_monthly_fixed_allowance: CurrencyKrw;
  total_expected_variable_pay?: CurrencyKrw;
  average_salary_by_level?: Record<string, CurrencyKrw>;
  headcount_by_level?: Record<string, number>;
  headcount_by_function?: Record<string, number>;
  recent_raise_budget?: CurrencyKrw;
  exception_raise_frequency: FrequencyLevel;
  counteroffer_frequency: FrequencyLevel;
  new_hire_premium_exists: boolean;
  pay_inversion_case_count?: number;
  out_of_band_case_count?: number;
  undocumented_negotiation_level?: UndocumentedNegotiationLevel;
  variable_pay_linked_to_performance?: boolean;
  manager_can_explain_pay_basis?: boolean;
}

export interface HiringPlan {
  planned_hires_6m: Record<string, number>;
  planned_hires_12m: Record<string, number>;
  average_expected_salary_by_level: Record<string, CurrencyKrw>;
  hiring_freeze_toggle: boolean;
  optional_cash_balance?: CurrencyKrw;
  optional_runway_months?: number;
}

export interface SalaryBandModel {
  level: string;
  min: CurrencyKrw;
  midpoint: CurrencyKrw;
  max: CurrencyKrw;
  range_spread?: Percentage;
  midpoint_progression?: Percentage;
}

export interface AIScenarioInputs {
  planned_ai_tool_budget_monthly?: CurrencyKrw;
  planned_ai_tool_budget_annual?: CurrencyKrw;
  hiring_delay_months?: number;
  affected_roles_or_functions?: string[];
  productivity_leakage_questions?: Record<string, QuestionAnswer>;
  junior_pipeline_risk_questions?: Record<string, QuestionAnswer>;
  orchestrator_target_count?: number;
  premium_pool_allocation_rate?: Percentage;
}

export interface ScenarioResult {
  scenario_id: ScenarioId;
  scenario_name: string;
  annual_cost_delta: CurrencyKrw;
  monthly_burn_delta: CurrencyKrw;
  cei_before: number;
  cei_after: number;
  ced_before: number;
  ced_after: number;
  pay_inversion_cases_before?: number;
  pay_inversion_cases_after?: number;
  execution_difficulty: DifficultyLevel;
  communication_difficulty: DifficultyLevel;
  risk_flags: RiskFlag[];
  explanation_text: string;
}

export interface AggregateLogEvent {
  company_size_band: CompanySizeBand;
  funding_stage: FundingStage;
  has_salary_band: boolean;
  cei_band: ScoreBand;
  ced_band: ScoreBand;
  selected_scenario: ScenarioId;
  advanced_scenario_viewed: boolean;
  productivity_leakage_flag?: boolean;
  created_at: string;
  consent_for_aggregate_analysis: boolean;
}

export interface CompanyProfile {
  id: string;
  label: string;
  companyContext: CompanyContext;
  compensationSnapshot: CompensationSnapshot;
  hiringPlan: HiringPlan;
  salaryBands?: SalaryBandModel[];
  aiScenarioInputs?: AIScenarioInputs;
  advancedEnabled?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface AIScenarioValidationOptions {
  advancedEnabled: boolean;
}
