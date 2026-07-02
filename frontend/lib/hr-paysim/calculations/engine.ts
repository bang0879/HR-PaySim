import type {
  AIScenarioInputs,
  AIToolingLevel,
  CompensationSnapshot,
  FrequencyLevel,
  HiringPlan,
  QuestionAnswer,
  SalaryBandModel,
  UndocumentedNegotiationLevel,
} from "../schema/types.ts";

type Confidence = "high" | "medium" | "low";
type CEIBand = "High" | "Manageable" | "Fragile" | "Low";
type CEDBand = "Low" | "Medium" | "High" | "Critical";
type PayInversionSeverity = "None" | "Watch" | "Material" | "Severe";
type SalaryBandHealthBand = "Healthy" | "Needs Review" | "Fragile" | "Not Usable";
type CompaRatioDistribution = "balanced" | "clustered_near_min" | "clustered_near_max" | "unavailable";

export interface CEIInput {
  has_salary_band: boolean;
  has_level_system: boolean;
  has_performance_review: boolean;
  pay_inversion_case_count?: number;
  exception_raise_frequency?: FrequencyLevel;
  counteroffer_frequency?: FrequencyLevel;
  variable_pay_linked_to_performance?: boolean;
  manager_can_explain_pay_basis?: boolean;
}

export interface CEIResult {
  score: number;
  band: CEIBand;
  reasons: string[];
  explanationText: string;
  confidence: Confidence;
  riskFlags: string[];
}

export interface CEDInput {
  counteroffer_frequency?: FrequencyLevel;
  exception_raise_frequency?: FrequencyLevel;
  new_hire_premium_exists: boolean;
  pay_inversion_case_count?: number;
  out_of_band_case_count?: number;
  undocumented_negotiation_level?: UndocumentedNegotiationLevel;
}

export interface CEDResult {
  score: number;
  band: CEDBand;
  reasons: string[];
  explanationText: string;
  confidence: Confidence;
  riskFlags: string[];
}

export interface PayInversionInput {
  pay_inversion_case_count?: number;
  new_hire_premium_exists: boolean;
  out_of_band_case_count?: number;
}

export interface PayInversionResult {
  caseCount: number;
  severity: PayInversionSeverity;
  severityScore: number;
  reasons: string[];
  explanationText: string;
  confidence: Confidence;
  riskFlags: string[];
}

export interface SalaryBandHealthInput {
  salaryBands: SalaryBandModel[];
  out_of_band_case_count?: number;
  compa_ratio_distribution?: CompaRatioDistribution;
}

export interface SalaryBandHealthResult {
  score: number;
  band: SalaryBandHealthBand;
  issues: string[];
  explanationText: string;
  confidence: Confidence;
  riskFlags: string[];
  internalTermsUsed: string[];
}

export interface PayrollForecastInput {
  compensationSnapshot: Pick<
    CompensationSnapshot,
    | "total_monthly_base_pay"
    | "total_monthly_fixed_allowance"
    | "total_expected_variable_pay"
    | "recent_raise_budget"
  >;
  hiringPlan: Pick<
    HiringPlan,
    | "planned_hires_6m"
    | "planned_hires_12m"
    | "average_expected_salary_by_level"
    | "hiring_freeze_toggle"
    | "optional_cash_balance"
    | "optional_runway_months"
  >;
  forecastMonths?: 6 | 12;
  monthlyExceptionDelta?: number;
  monthlyPremiumPoolDelta?: number;
  monthlyDeferredHiringDelta?: number;
}

export interface PayrollForecastResult {
  monthlyPayrollDelta: number;
  annualPayrollDelta: number;
  payrollIncreaseRate: number;
  baselineMonthlyPayroll: number;
  scenarioMonthlyPayroll: number;
  costDrivers: string[];
  explanationText: string;
  confidence: Confidence;
  riskFlags: string[];
  optionalRunwayImpact?: {
    projectedRunwayMonths: number;
    deltaMonths: number;
  };
}

export interface OrchestratorPremiumPoolInput {
  advancedEnabled: boolean;
  hiringPlan: Pick<
    HiringPlan,
    "planned_hires_6m" | "planned_hires_12m" | "average_expected_salary_by_level" | "hiring_freeze_toggle"
  >;
  aiScenarioInputs: Pick<
    AIScenarioInputs,
    | "hiring_delay_months"
    | "orchestrator_target_count"
    | "premium_pool_allocation_rate"
    | "planned_ai_tool_budget_monthly"
    | "planned_ai_tool_budget_annual"
  >;
  delayedHiresByLevel?: Record<string, number>;
  reallocationBudgetCeiling?: number;
  relevantGroupedPayroll?: number;
}

export interface OrchestratorPremiumPoolResult {
  premiumPoolBudget: number;
  monthlyPremiumPoolDelta: number;
  orchestratorTargetCount: number;
  perTargetBudgetHint: number | null;
  deferredHiringBudget: number;
  explanationText: string;
  confidence: Confidence;
  riskFlags: string[];
  advancedOnly: true;
}

export interface ProductivityLeakageInput {
  productivity_leakage_questions?: Record<string, QuestionAnswer>;
  junior_pipeline_risk_questions?: Record<string, QuestionAnswer>;
  affected_roles_or_functions?: string[];
  hiring_freeze_toggle?: boolean;
  hiring_delay_months?: number;
  current_ai_tooling_level?: AIToolingLevel;
}

export interface ProductivityLeakageResult {
  flag: boolean;
  reasons: string[];
  suggestedQuestions: string[];
  explanationText: string;
  confidence: Confidence;
  riskFlags: string[];
}

const ceilikeFrequencyPenalty: Record<FrequencyLevel, number> = {
  none: 0,
  rare: 4,
  occasional: 8,
  frequent: 15,
  unknown: 0,
};

const ceiCounterofferPenalty: Record<FrequencyLevel, number> = {
  none: 0,
  rare: 3,
  occasional: 7,
  frequent: 12,
  unknown: 0,
};

const cedCounterofferPoints: Record<FrequencyLevel, number> = {
  none: 0,
  rare: 6,
  occasional: 12,
  frequent: 20,
  unknown: 0,
};

const cedExceptionPoints: Record<FrequencyLevel, number> = {
  none: 0,
  rare: 6,
  occasional: 14,
  frequent: 24,
  unknown: 0,
};

const undocumentedNegotiationPoints: Record<UndocumentedNegotiationLevel, number> = {
  none: 0,
  low: 5,
  medium: 12,
  high: 20,
  unknown: 0,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function nonNegativeInteger(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value));
}

function countPenalty(count: number, oneToTwo: number, threeToFive: number, sixPlus: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return oneToTwo;
  if (count <= 5) return threeToFive;
  return sixPlus;
}

function outOfBandPenalty(count: number): number {
  if (count <= 0) return 0;
  if (count <= 3) return 8;
  if (count <= 10) return 15;
  return 25;
}

function confidenceFromMissing(missingCount: number): Confidence {
  if (missingCount === 0) return "high";
  if (missingCount <= 2) return "medium";
  return "low";
}

function sumAnnualHireCost(plannedHires: Record<string, number>, salaries: Record<string, number>): number {
  return Object.entries(plannedHires).reduce((total, [level, count]) => {
    const expectedSalary = salaries[level] ?? 0;
    return total + Math.max(0, count) * Math.max(0, expectedSalary);
  }, 0);
}

function frequencyLabel(value: FrequencyLevel | undefined): string {
  switch (value) {
    case "frequent":
      return "반복적";
    case "occasional":
      return "간헐적";
    case "rare":
      return "드문";
    case "none":
      return "없음";
    default:
      return "미확인";
  }
}

function ceilikeBand(score: number): CEIBand {
  if (score >= 80) return "High";
  if (score >= 60) return "Manageable";
  if (score >= 40) return "Fragile";
  return "Low";
}

function cedBand(score: number): CEDBand {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}

function payInversionSeverity(score: number): PayInversionSeverity {
  if (score === 0) return "None";
  if (score < 30) return "Watch";
  if (score < 70) return "Material";
  return "Severe";
}

function salaryBandHealthBand(score: number): SalaryBandHealthBand {
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Needs Review";
  if (score >= 40) return "Fragile";
  return "Not Usable";
}

export function calculateCEI(input: CEIInput): CEIResult {
  let score = 50;
  const reasons: string[] = [];
  const riskFlags: string[] = [];
  let missingInputs = 0;

  if (input.has_salary_band) {
    score += 15;
    reasons.push("급여 밴드가 있어 보상 기준을 설명할 수 있는 기본 언어가 있습니다.");
  } else {
    score -= 10;
    reasons.push("급여 밴드가 없어 보상 기준을 일관되게 설명하기 어렵습니다.");
    riskFlags.push("low_explainability");
  }

  if (input.has_level_system) {
    score += 12;
    reasons.push("레벨 체계가 있어 역할과 보상 기준을 연결할 수 있습니다.");
  } else {
    score -= 8;
    reasons.push("레벨 체계가 없어 보상 차이를 설명할 기준이 약합니다.");
  }

  if (input.has_performance_review) {
    score += 8;
    reasons.push("성과 리뷰가 있어 보상 판단의 근거를 남길 수 있습니다.");
  } else {
    score -= 5;
    reasons.push("성과 리뷰가 없어 보상 결정 근거가 약해질 수 있습니다.");
  }

  if (input.variable_pay_linked_to_performance === true) {
    score += 8;
    reasons.push("변동 보상이 성과 기준과 연결되어 있습니다.");
  } else if (input.variable_pay_linked_to_performance === false) {
    score -= 5;
    reasons.push("변동 보상과 성과 기준의 연결이 약합니다.");
  } else {
    missingInputs += 1;
  }

  if (input.manager_can_explain_pay_basis === true) {
    score += 15;
    reasons.push("관리자가 보상 기준을 설명할 수 있습니다.");
  } else if (input.manager_can_explain_pay_basis === false) {
    score -= 15;
    reasons.push("관리자가 보상 기준을 설명하기 어려운 상태입니다.");
    riskFlags.push("manager_explanation_gap");
  } else {
    missingInputs += 1;
  }

  const inversionCount = nonNegativeInteger(input.pay_inversion_case_count);
  const inversionPenalty = countPenalty(inversionCount, 5, 10, 18);
  score -= inversionPenalty;
  if (inversionPenalty > 0) {
    reasons.push(`보상 역전 사례가 ${inversionCount}건 있어 내부 설명 부담이 커집니다.`);
    riskFlags.push("pay_inversion");
  }

  const exceptionFrequency = input.exception_raise_frequency ?? "unknown";
  const exceptionPenalty = ceilikeFrequencyPenalty[exceptionFrequency];
  score -= exceptionPenalty;
  if (exceptionFrequency === "unknown") {
    missingInputs += 1;
  } else if (exceptionPenalty > 0) {
    reasons.push(`예외 인상이 ${frequencyLabel(exceptionFrequency)}으로 발생해 기준 설명력이 낮아집니다.`);
    if (exceptionFrequency === "frequent") {
      riskFlags.push("high_exception_pressure");
    }
  }

  const counterofferFrequency = input.counteroffer_frequency ?? "unknown";
  const counterofferPenalty = ceiCounterofferPenalty[counterofferFrequency];
  score -= counterofferPenalty;
  if (counterofferFrequency === "unknown") {
    missingInputs += 1;
  } else if (counterofferPenalty > 0) {
    reasons.push(`카운터오퍼가 ${frequencyLabel(counterofferFrequency)}으로 발생해 보상 기준의 일관성이 약해집니다.`);
    if (counterofferFrequency === "frequent") {
      riskFlags.push("counteroffer_pressure");
    }
  }

  const finalScore = clampScore(score);
  const band = ceilikeBand(finalScore);
  const explanationText =
    band === "High" || band === "Manageable"
      ? "현재 보상 구조는 비교적 설명 가능한 기준을 갖고 있습니다. 다만 예외와 보상 역전 신호는 계속 분리해서 관리해야 합니다."
      : "현재 문제는 보상 수준보다 보상 설명 가능성에 있을 수 있습니다. 반복 예외와 보상 역전 신호가 누적되면 내부 커뮤니케이션 부담이 커집니다.";

  if (missingInputs > 0) {
    riskFlags.push("low_input_quality");
  }

  return {
    score: finalScore,
    band,
    reasons,
    explanationText,
    confidence: confidenceFromMissing(missingInputs),
    riskFlags: [...new Set(riskFlags)],
  };
}

export function calculateCED(input: CEDInput): CEDResult {
  const reasons: string[] = [];
  const riskFlags: string[] = [];
  let score = 0;
  let missingInputs = 0;

  const counterofferFrequency = input.counteroffer_frequency ?? "unknown";
  score += cedCounterofferPoints[counterofferFrequency];
  if (counterofferFrequency === "unknown") {
    missingInputs += 1;
  } else if (counterofferFrequency !== "none") {
    reasons.push(`카운터오퍼가 ${frequencyLabel(counterofferFrequency)}으로 발생합니다.`);
  }

  const exceptionFrequency = input.exception_raise_frequency ?? "unknown";
  score += cedExceptionPoints[exceptionFrequency];
  if (exceptionFrequency === "unknown") {
    missingInputs += 1;
  } else if (exceptionFrequency !== "none") {
    reasons.push(`예외 인상이 ${frequencyLabel(exceptionFrequency)}으로 발생합니다.`);
  }

  if (input.new_hire_premium_exists) {
    score += 12;
    reasons.push("신규 입사자 프리미엄이 있어 기존 구성원과의 기준 차이가 누적될 수 있습니다.");
    riskFlags.push("new_hire_premium");
  }

  const inversionCount = nonNegativeInteger(input.pay_inversion_case_count);
  const inversionPoints = countPenalty(inversionCount, 8, 15, 25);
  score += inversionPoints;
  if (inversionPoints > 0) {
    reasons.push(`보상 역전 사례가 ${inversionCount}건 누적되어 있습니다.`);
    riskFlags.push("pay_inversion");
  }

  const outOfBandCount = nonNegativeInteger(input.out_of_band_case_count);
  const outOfBandPoints = outOfBandPenalty(outOfBandCount);
  score += outOfBandPoints;
  if (outOfBandPoints > 0) {
    reasons.push(`밴드 밖 사례가 ${outOfBandCount}건 있어 예외 부채가 커질 수 있습니다.`);
    riskFlags.push("out_of_band_cases");
  }

  const undocumentedLevel = input.undocumented_negotiation_level ?? "unknown";
  score += undocumentedNegotiationPoints[undocumentedLevel];
  if (undocumentedLevel === "unknown") {
    missingInputs += 1;
  } else if (undocumentedLevel !== "none") {
    reasons.push(`문서화되지 않은 협상 수준이 ${undocumentedLevel}입니다.`);
  }

  const finalScore = clampScore(score);
  const band = cedBand(finalScore);
  if (band === "High" || band === "Critical") {
    riskFlags.push(band === "Critical" ? "critical_exception_debt" : "high_exception_debt");
  }

  const explanationText =
    band === "Low"
      ? "현재 입력 기준으로는 보상 예외 부채가 낮은 편입니다. 예외가 생겨도 기준과 기록을 남기면 관리 가능합니다."
      : "예외는 한 번이면 유연성이지만, 누적되면 보상 부채가 됩니다. 현재 입력에서는 예외 인상, 카운터오퍼, 밴드 밖 사례가 함께 누적될 가능성이 보입니다.";

  if (missingInputs > 0) {
    riskFlags.push("low_input_quality");
  }

  return {
    score: finalScore,
    band,
    reasons,
    explanationText,
    confidence: confidenceFromMissing(missingInputs),
    riskFlags: [...new Set(riskFlags)],
  };
}

export function detectPayInversion(input: PayInversionInput): PayInversionResult {
  const caseCount = nonNegativeInteger(input.pay_inversion_case_count);
  const outOfBandCount = nonNegativeInteger(input.out_of_band_case_count);
  const reasons: string[] = [];
  const riskFlags: string[] = [];

  let severityScore = 0;
  if (caseCount <= 0) {
    severityScore += 0;
  } else if (caseCount <= 2) {
    severityScore += 20;
  } else if (caseCount <= 5) {
    severityScore += 45;
  } else {
    severityScore += 70;
  }

  if (input.new_hire_premium_exists) {
    severityScore += 15;
    reasons.push("신규 입사자 프리미엄이 있어 기존 구성원과의 보상 역전 가능성이 커집니다.");
    riskFlags.push("new_hire_premium");
  }

  if (outOfBandCount > 0) {
    severityScore += outOfBandCount <= 3 ? 10 : 20;
    reasons.push(`밴드 밖 사례 ${outOfBandCount}건이 보상 역전 리스크를 키울 수 있습니다.`);
    riskFlags.push("out_of_band_cases");
  }

  if (caseCount > 0) {
    reasons.unshift(`보상 역전 사례가 ${caseCount}건 입력되었습니다.`);
    riskFlags.push("pay_inversion");
  } else {
    reasons.push("현재 입력된 보상 역전 사례는 없습니다.");
  }

  const finalScore = clampScore(severityScore);
  const severity = payInversionSeverity(finalScore);
  const explanationText =
    severity === "None"
      ? "현재 입력 기준으로는 신규 입사자 보상이 기존 구성원보다 높아지는 보상 역전 신호가 확인되지 않습니다."
      : "신규 입사자 보상이 기존 구성원보다 높아지는 구간이 있어 내부 설명 리스크가 생길 수 있습니다. 이 결과는 개인별 급여 판단이 아니라 집계된 리스크 분류입니다.";

  return {
    caseCount,
    severity,
    severityScore: finalScore,
    reasons,
    explanationText,
    confidence: caseCount > 0 ? "medium" : "high",
    riskFlags: [...new Set(riskFlags)],
  };
}

export function evaluateSalaryBandHealth(input: SalaryBandHealthInput): SalaryBandHealthResult {
  const issues: string[] = [];
  const riskFlags: string[] = [];
  const internalTermsUsed = ["range_spread", "midpoint_progression", "out_of_band_case_count"];

  if (input.salaryBands.length === 0) {
    return {
      score: 0,
      band: "Not Usable",
      issues: ["급여 밴드가 없어 밴드 구조 건강도를 평가할 수 없습니다."],
      explanationText: "현재 밴드가 제공되지 않아 보상 설명 기준으로 사용할 수 없습니다.",
      confidence: "low",
      riskFlags: ["low_input_quality"],
      internalTermsUsed,
    };
  }

  const rangePenalties: number[] = [];
  const progressionPenalties: number[] = [];

  input.salaryBands.forEach((band, index) => {
    const rangeSpread =
      typeof band.range_spread === "number" && Number.isFinite(band.range_spread)
        ? band.range_spread
        : band.midpoint > 0
          ? ((band.max - band.min) / band.midpoint) * 100
          : 0;

    if (rangeSpread >= 20 && rangeSpread <= 60) {
      rangePenalties.push(0);
    } else if ((rangeSpread >= 10 && rangeSpread < 20) || (rangeSpread > 60 && rangeSpread <= 80)) {
      rangePenalties.push(10);
      issues.push(`${band.level} 밴드 폭이 조정 검토 구간입니다.`);
      riskFlags.push("band_spread_review");
    } else {
      rangePenalties.push(20);
      issues.push(`${band.level} 밴드 폭이 지나치게 좁거나 넓습니다.`);
      riskFlags.push(rangeSpread > 80 ? "wide_band" : "narrow_band");
    }

    const previousBand = input.salaryBands[index - 1];
    const midpointProgression =
      typeof band.midpoint_progression === "number" && Number.isFinite(band.midpoint_progression)
        ? band.midpoint_progression
        : previousBand && previousBand.midpoint > 0
          ? ((band.midpoint - previousBand.midpoint) / previousBand.midpoint) * 100
          : undefined;

    if (midpointProgression === undefined || index === 0) {
      return;
    }

    if (midpointProgression >= 10 && midpointProgression <= 25) {
      progressionPenalties.push(0);
    } else if (
      (midpointProgression >= 5 && midpointProgression < 10) ||
      (midpointProgression > 25 && midpointProgression <= 35)
    ) {
      progressionPenalties.push(8);
      issues.push(`${band.level} 레벨 간 기준급 차이는 검토가 필요합니다.`);
      riskFlags.push("midpoint_progression_review");
    } else {
      progressionPenalties.push(18);
      issues.push(`${band.level} 레벨 간 기준급 차이가 설명하기 어렵습니다.`);
      riskFlags.push("midpoint_progression_gap");
    }
  });

  const rangePenalty =
    rangePenalties.length > 0
      ? rangePenalties.reduce((sum, penalty) => sum + penalty, 0) / rangePenalties.length
      : 0;
  const progressionPenalty =
    progressionPenalties.length > 0
      ? progressionPenalties.reduce((sum, penalty) => sum + penalty, 0) / progressionPenalties.length
      : 0;

  const outOfBandCount = nonNegativeInteger(input.out_of_band_case_count);
  let outOfBandHealthPenalty = 0;
  if (outOfBandCount > 0 && outOfBandCount <= 3) {
    outOfBandHealthPenalty = 8;
  } else if (outOfBandCount <= 10) {
    outOfBandHealthPenalty = outOfBandCount === 0 ? 0 : 18;
  } else {
    outOfBandHealthPenalty = 30;
  }

  if (outOfBandCount > 0) {
    issues.push(`밴드 밖 사례가 ${outOfBandCount}건 있습니다.`);
    riskFlags.push("out_of_band_cases");
  }

  let compaRatioPenalty = 0;
  if (
    input.compa_ratio_distribution === "clustered_near_min" ||
    input.compa_ratio_distribution === "clustered_near_max"
  ) {
    compaRatioPenalty = 10;
    issues.push("밴드 내 현재 위치가 한쪽으로 몰려 있습니다.");
    riskFlags.push("compa_ratio_concentration");
  }

  const score = clampScore(100 - rangePenalty - progressionPenalty - outOfBandHealthPenalty - compaRatioPenalty);
  const band = salaryBandHealthBand(score);
  const explanationText =
    band === "Healthy"
      ? "현재 밴드 구조는 보상 설명과 운영 기준으로 비교적 안정적입니다."
      : "현재 밴드 구조에는 조정이 필요한 구간이 있습니다. 기술 용어는 내부 계산에만 사용하고, 사용자 화면에서는 밴드 폭과 레벨 간 기준급 차이로 설명해야 합니다.";

  return {
    score,
    band,
    issues,
    explanationText,
    confidence: input.compa_ratio_distribution ? "high" : "medium",
    riskFlags: [...new Set(riskFlags)],
    internalTermsUsed,
  };
}

export function forecastPayrollCost(input: PayrollForecastInput): PayrollForecastResult {
  const snapshot = input.compensationSnapshot;
  const hiringPlan = input.hiringPlan;
  const forecastMonths = input.forecastMonths ?? 12;
  const plannedHires = forecastMonths === 6 ? hiringPlan.planned_hires_6m : hiringPlan.planned_hires_12m;

  const monthlyVariablePay = Math.max(0, snapshot.total_expected_variable_pay ?? 0) / 12;
  const baselineMonthlyPayroll =
    Math.max(0, snapshot.total_monthly_base_pay) +
    Math.max(0, snapshot.total_monthly_fixed_allowance) +
    monthlyVariablePay;

  const monthlyNewHirePay =
    sumAnnualHireCost(plannedHires, hiringPlan.average_expected_salary_by_level) / 12;
  const monthlyRaiseBudgetDelta = Math.max(0, snapshot.recent_raise_budget ?? 0) / 12;
  const monthlyExceptionDelta = input.monthlyExceptionDelta ?? 0;
  const monthlyPremiumPoolDelta = input.monthlyPremiumPoolDelta ?? 0;
  const monthlyDeferredHiringDelta = input.monthlyDeferredHiringDelta ?? 0;

  const monthlyPayrollDelta =
    monthlyNewHirePay +
    monthlyRaiseBudgetDelta +
    monthlyExceptionDelta +
    monthlyPremiumPoolDelta -
    monthlyDeferredHiringDelta;
  const annualPayrollDelta = monthlyPayrollDelta * 12;
  const scenarioMonthlyPayroll = baselineMonthlyPayroll + monthlyPayrollDelta;
  const payrollIncreaseRate =
    baselineMonthlyPayroll > 0 ? round((monthlyPayrollDelta / baselineMonthlyPayroll) * 100) : 0;

  const costDrivers: string[] = [];
  if (monthlyNewHirePay !== 0) costDrivers.push("planned_hiring");
  if (monthlyRaiseBudgetDelta !== 0) costDrivers.push("raise_budget");
  if (monthlyExceptionDelta !== 0) costDrivers.push("exception_delta");
  if (monthlyPremiumPoolDelta !== 0) costDrivers.push("premium_pool_delta");
  if (monthlyDeferredHiringDelta !== 0) costDrivers.push("deferred_hiring_delta");

  const result: PayrollForecastResult = {
    monthlyPayrollDelta: round(monthlyPayrollDelta),
    annualPayrollDelta: round(annualPayrollDelta),
    payrollIncreaseRate,
    baselineMonthlyPayroll: round(baselineMonthlyPayroll),
    scenarioMonthlyPayroll: round(scenarioMonthlyPayroll),
    costDrivers,
    explanationText:
      "이 forecast는 finance-grade 예측이 아니라 현재 채용 및 인상 계획이 payroll에 주는 방향성 있는 변화를 보여주는 보상 거버넌스 시뮬레이션입니다.",
    confidence: costDrivers.length > 0 ? "medium" : "low",
    riskFlags: payrollIncreaseRate >= 10 ? ["payroll_pressure"] : [],
  };

  if (
    typeof hiringPlan.optional_cash_balance === "number" &&
    typeof hiringPlan.optional_runway_months === "number" &&
    scenarioMonthlyPayroll > 0
  ) {
    const projectedRunwayMonths = hiringPlan.optional_cash_balance / scenarioMonthlyPayroll;
    result.optionalRunwayImpact = {
      projectedRunwayMonths: round(projectedRunwayMonths),
      deltaMonths: round(projectedRunwayMonths - hiringPlan.optional_runway_months),
    };
  }

  return result;
}

export function calculateOrchestratorPremiumPool(
  input: OrchestratorPremiumPoolInput,
): OrchestratorPremiumPoolResult {
  const targetCount = nonNegativeInteger(input.aiScenarioInputs.orchestrator_target_count);
  const allocationRate = Math.max(0, Math.min(100, input.aiScenarioInputs.premium_pool_allocation_rate ?? 0));
  const hiringDelayMonths = Math.max(0, input.aiScenarioInputs.hiring_delay_months ?? 0);
  const delayedHires = input.delayedHiresByLevel ?? {};
  const deferredHiringBudget =
    hiringDelayMonths > 0
      ? (sumAnnualHireCost(delayedHires, input.hiringPlan.average_expected_salary_by_level) / 12) *
        hiringDelayMonths
      : 0;

  const budgetBase =
    typeof input.reallocationBudgetCeiling === "number"
      ? Math.max(0, input.reallocationBudgetCeiling)
      : typeof input.relevantGroupedPayroll === "number"
        ? Math.max(0, input.relevantGroupedPayroll)
        : deferredHiringBudget;

  const premiumPoolBudget = input.advancedEnabled ? budgetBase * (allocationRate / 100) : 0;
  const monthlyPremiumPoolDelta = premiumPoolBudget / 12;
  const perTargetBudgetHint = targetCount > 0 ? premiumPoolBudget / targetCount : null;
  const riskFlags = ["advanced_assumption"];

  if (!input.advancedEnabled) {
    riskFlags.push("advanced_disabled");
  }
  if (targetCount === 0 || allocationRate === 0) {
    riskFlags.push("low_input_quality");
  }

  return {
    premiumPoolBudget: round(premiumPoolBudget),
    monthlyPremiumPoolDelta: round(monthlyPremiumPoolDelta),
    orchestratorTargetCount: targetCount,
    perTargetBudgetHint: perTargetBudgetHint === null ? null : round(perTargetBudgetHint),
    deferredHiringBudget: round(deferredHiringBudget),
    explanationText:
      "이 결과는 사용자가 제공한 채용 지연 또는 재배분 예산 가정에서 Senior 조율 역할 프리미엄 풀 규모를 검토하는 값입니다. 개인별 보상 추천이나 AI 대체율 계산이 아닙니다.",
    confidence: input.advancedEnabled && budgetBase > 0 && allocationRate > 0 ? "medium" : "low",
    riskFlags,
    advancedOnly: true,
  };
}

export function evaluateProductivityLeakageFlag(
  input: ProductivityLeakageInput,
): ProductivityLeakageResult {
  const leakageQuestions = input.productivity_leakage_questions ?? {};
  const juniorQuestions = input.junior_pipeline_risk_questions ?? {};
  const allQuestions = { ...leakageQuestions, ...juniorQuestions };
  const yesCount = Object.values(leakageQuestions).filter((answer) => answer === "yes").length;
  const unknownCount = Object.values(allQuestions).filter((answer) => answer === "unknown").length;
  const reasons: string[] = [];

  if (leakageQuestions.coordination_overhead_increased === "yes") {
    reasons.push("AI 도구 사용 이후 조율하거나 검토해야 할 일이 늘어난 신호가 있습니다.");
  }
  if (leakageQuestions.output_review_bottleneck === "yes") {
    reasons.push("결과물 검토 병목이 senior에게 집중될 수 있습니다.");
  }
  if (leakageQuestions.individual_speed_not_shared === "yes") {
    reasons.push("개인 작업 속도 개선이 팀 단위 산출로 전환되지 않을 수 있습니다.");
  }
  if (leakageQuestions.accountability_unclear === "yes") {
    reasons.push("AI 사용 결과의 책임 소재가 불명확합니다.");
  }
  if (leakageQuestions.process_not_redesigned === "yes") {
    reasons.push("업무 프로세스 재설계 없이 도구만 추가된 상태일 수 있습니다.");
  }
  if (input.hiring_freeze_toggle && juniorQuestions.junior_learning_reduced === "yes") {
    reasons.push("선택 채용 지연과 함께 junior learning 기회가 줄어들 수 있습니다.");
  }

  const flag =
    yesCount >= 2 ||
    leakageQuestions.output_review_bottleneck === "yes" ||
    (leakageQuestions.accountability_unclear === "yes" &&
      leakageQuestions.process_not_redesigned === "yes") ||
    (input.hiring_freeze_toggle === true && juniorQuestions.junior_learning_reduced === "yes");

  const answeredCount = Object.keys(allQuestions).length;
  const confidence: Confidence = answeredCount >= 4 && unknownCount <= 1 ? "medium" : answeredCount > 0 ? "low" : "low";

  return {
    flag,
    reasons,
    suggestedQuestions: [
      "AI 도구로 줄어든 개인 작업 시간을 팀 단위 산출, 책임, 검토 흐름으로 어떻게 전환하고 있습니까?",
      "선택 채용 지연 기간 동안 junior pipeline과 senior review 부담을 어떻게 관리할 예정입니까?",
    ],
    explanationText: flag
      ? "현재 입력 기준으로 AI 기반 생산성 신호가 개인 수준에 머물고 조직 산출로 전환되지 않을 가능성이 있습니다."
      : "현재 입력 기준으로는 생산성 누수 신호가 강하지 않습니다. 다만 이 결과는 생산성 향상률 검증이 아니라 질문 기반 리스크 플래그입니다.",
    confidence,
    riskFlags: flag ? ["productivity_leakage", "advanced_assumption"] : ["advanced_assumption"],
  };
}
