import type { DiagnosisResult, QuickInputDraft, ScenarioId } from "./domain.ts";

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