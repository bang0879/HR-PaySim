import type { FindingMetricSet } from "./metrics/types.ts";

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

export interface FindingRiskModel {
  /** @deprecated Read StructuralFinding.metrics repair fields instead. */
  correctionFloorKRW?: number;
  exposurePayrollKRW?: number;
  communicationRisk: RiskBand;
  spreadRisk: RiskBand;
  decisionUrgency: RiskBand;
  nonClaim: string;
}

export interface StructuralFindingCluster {
  rowIds: string[];
  minSalaryKRW: number;
  maxSalaryKRW: number;
}

export interface StructuralFindingPair {
  underpaidRowId: string;
  comparatorRowId: string;
  salaryGapKRW: number;
  gapPercentage?: number;
  reasonThisIsHardToDefend: string;
}

export interface StructuralFinding {
  id: string;
  type: StructuralFindingType;
  roleGroup: string;
  title: string;
  defensibilityQuestion: string;
  relationshipSummary: string;
  affectedRowIds: string[];
  headlinePair?: StructuralFindingPair;
  additionalUnderpaidRowCount?: number;
  comparisonPairs: StructuralFindingPair[];
  bandClusters?: StructuralFindingCluster[];
  clusterGapKRW?: number;
  clusterGapRowIds?: [string, string];
  evidence: string[];
  metrics: FindingMetricSet;
  riskModel: FindingRiskModel;
  confidence: ConfidenceBand;
  explanationText: string;
}
