import type { DiagnosisResult, QuickInputDraft, ScenarioId, ScenarioRecommendation } from "./domain.ts";

const scenarioCopy: Record<ScenarioId, Omit<ScenarioRecommendation, "priority">> = {
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
    ...scenarioCopy[scenarioId],
    priority: index === 0 && healthy ? "primary" : index <= 2 ? "secondary" : "optional",
  }));
}