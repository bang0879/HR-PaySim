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