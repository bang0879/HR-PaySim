import {
  calculateCED,
  calculateCEI,
  detectPayInversion,
  forecastPayrollCost,
} from "../../lib/hr-paysim/calculations/engine.ts";
import type {
  CEDResult,
  CEIResult,
  PayInversionResult,
  PayrollForecastResult,
} from "../../lib/hr-paysim/calculations/engine.ts";
import type { CompanyProfile } from "../../lib/hr-paysim/schema/types.ts";

export const GOVERNANCE_SNAPSHOT_HEADLINE = "현재 보상 구조의 출발점입니다";

export interface GovernanceSnapshotModel {
  headline: string;
  interpretationSentence: string;
  cei: CEIResult;
  ced: CEDResult;
  payInversion: PayInversionResult;
  payroll: PayrollForecastResult;
  baselineMonthlyPayroll: number;
  baselineAnnualizedPayroll: number;
  expectedMonthlyPayrollIncrease: number;
  expectedAnnualPayrollIncrease: number;
  payrollIncreaseRate: number;
  confidence: "high" | "medium" | "low";
  missingInputPrompts: string[];
  riskFlags: string[];
  optionalRunwayImpact?: PayrollForecastResult["optionalRunwayImpact"];
  hasAIInputs: boolean;
}

function formatKrw(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hasAnyAIInputs(profile: CompanyProfile): boolean {
  const input = profile.aiScenarioInputs;
  if (!input) {
    return false;
  }

  return Object.values(input).some((value) => {
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return true;
  });
}

function combineConfidence(values: Array<"high" | "medium" | "low">): "high" | "medium" | "low" {
  if (values.includes("low")) return "low";
  if (values.includes("medium")) return "medium";
  return "high";
}

function interpretationFor(
  cei: CEIResult,
  ced: CEDResult,
  payInversion: PayInversionResult,
): string {
  if ((cei.band === "Low" || cei.band === "Fragile") && (ced.band === "High" || ced.band === "Critical")) {
    return "현재 구조는 보상 기준을 설명하기 어렵고, 예외 인상이 반복될수록 설명 가능성 부채가 커질 수 있습니다.";
  }

  if (payInversion.severity === "Material" || payInversion.severity === "Severe") {
    return "현재 구조는 관리 가능한 수준이지만, 신규 입사자 프리미엄이 계속되면 보상 역전 리스크가 커질 수 있습니다.";
  }

  return "현재 보상 구조는 기본 진단이 가능한 상태입니다. 다음 단계에서는 비용과 설명 가능성이 어떻게 달라지는지 조정안을 비교할 수 있습니다.";
}

export function createGovernanceSnapshotModel(profile: CompanyProfile): GovernanceSnapshotModel {
  const { companyContext, compensationSnapshot, hiringPlan } = profile;

  const cei = calculateCEI({
    has_salary_band: companyContext.has_salary_band,
    has_level_system: companyContext.has_level_system,
    has_performance_review: companyContext.has_performance_review,
    pay_inversion_case_count: compensationSnapshot.pay_inversion_case_count,
    exception_raise_frequency: compensationSnapshot.exception_raise_frequency,
    counteroffer_frequency: compensationSnapshot.counteroffer_frequency,
    variable_pay_linked_to_performance: compensationSnapshot.variable_pay_linked_to_performance,
    manager_can_explain_pay_basis: compensationSnapshot.manager_can_explain_pay_basis,
  });

  const ced = calculateCED({
    counteroffer_frequency: compensationSnapshot.counteroffer_frequency,
    exception_raise_frequency: compensationSnapshot.exception_raise_frequency,
    new_hire_premium_exists: compensationSnapshot.new_hire_premium_exists,
    pay_inversion_case_count: compensationSnapshot.pay_inversion_case_count,
    out_of_band_case_count: compensationSnapshot.out_of_band_case_count,
    undocumented_negotiation_level: compensationSnapshot.undocumented_negotiation_level,
  });

  const payInversion = detectPayInversion({
    pay_inversion_case_count: compensationSnapshot.pay_inversion_case_count,
    new_hire_premium_exists: compensationSnapshot.new_hire_premium_exists,
    out_of_band_case_count: compensationSnapshot.out_of_band_case_count,
  });

  const payroll = forecastPayrollCost({
    compensationSnapshot: {
      total_monthly_base_pay: compensationSnapshot.total_monthly_base_pay,
      total_monthly_fixed_allowance: compensationSnapshot.total_monthly_fixed_allowance,
      total_expected_variable_pay: compensationSnapshot.total_expected_variable_pay,
      recent_raise_budget: compensationSnapshot.recent_raise_budget,
    },
    hiringPlan,
    forecastMonths: 12,
  });

  const missingInputPrompts: string[] = [];
  if (cei.confidence === "low" || ced.confidence === "low") {
    missingInputPrompts.push("현재 결과는 방향성 참고용입니다. 입력이 보강되면 설명 가능성과 예외 부채 판단이 더 안정적입니다.");
  }
  if (compensationSnapshot.pay_inversion_case_count === undefined) {
    missingInputPrompts.push("보상 역전 사례 수가 없으면 보상 역전 위험은 입력 필요 상태로 표시합니다.");
  }

  return {
    headline: GOVERNANCE_SNAPSHOT_HEADLINE,
    interpretationSentence: interpretationFor(cei, ced, payInversion),
    cei,
    ced,
    payInversion,
    payroll,
    baselineMonthlyPayroll: payroll.baselineMonthlyPayroll,
    baselineAnnualizedPayroll: payroll.baselineMonthlyPayroll * 12,
    expectedMonthlyPayrollIncrease: payroll.monthlyPayrollDelta,
    expectedAnnualPayrollIncrease: payroll.annualPayrollDelta,
    payrollIncreaseRate: payroll.payrollIncreaseRate,
    confidence: combineConfidence([cei.confidence, ced.confidence, payInversion.confidence, payroll.confidence]),
    missingInputPrompts,
    riskFlags: [...new Set([...cei.riskFlags, ...ced.riskFlags, ...payInversion.riskFlags, ...payroll.riskFlags])],
    optionalRunwayImpact: payroll.optionalRunwayImpact,
    hasAIInputs: hasAnyAIInputs(profile),
  };
}

function renderMetricCard(label: string, value: string, band: string, body: string): string {
  return `
    <article class="snapshot-card">
      <p class="metric-label">${escapeHtml(label)}</p>
      <div class="metric-value">${escapeHtml(value)}</div>
      <span class="metric-band">${escapeHtml(band)}</span>
      <p>${escapeHtml(body)}</p>
    </article>`;
}

export function renderGovernanceSnapshotHtml(snapshot: GovernanceSnapshotModel): string {
  const runwayCopy = snapshot.optionalRunwayImpact
    ? `${snapshot.optionalRunwayImpact.projectedRunwayMonths.toLocaleString("ko-KR")}개월 예상, 현재 입력 대비 ${snapshot.optionalRunwayImpact.deltaMonths.toLocaleString("ko-KR")}개월`
    : "cash/runway 입력 시 표시";

  const riskFlags =
    snapshot.riskFlags.length > 0
      ? snapshot.riskFlags.map((flag) => `<li>${escapeHtml(flag)}</li>`).join("")
      : "<li>현재 입력 기준 주요 위험 플래그가 낮습니다.</li>";

  const missingPrompts =
    snapshot.missingInputPrompts.length > 0
      ? `<div class="snapshot-note">${snapshot.missingInputPrompts.map(escapeHtml).join("<br />")}</div>`
      : "";

  return `
    <section class="governance-snapshot" aria-labelledby="governance-snapshot-title">
      <div class="snapshot-header">
        <p class="module-label">Governance Snapshot</p>
        <h2 id="governance-snapshot-title">${escapeHtml(snapshot.headline)}</h2>
        <p class="snapshot-interpretation">${escapeHtml(snapshot.interpretationSentence)}</p>
      </div>
      <div class="snapshot-grid">
        ${renderMetricCard(
          "보상 설명 가능성",
          `${snapshot.cei.score}/100`,
          snapshot.cei.band,
          "현재 문제는 보상 수준보다 보상 설명 가능성에 있을 수 있습니다.",
        )}
        ${renderMetricCard(
          "보상 예외 부채",
          `${snapshot.ced.score}/100`,
          snapshot.ced.band,
          "예외는 한 번이면 유연성이지만, 누적되면 보상 부채가 됩니다.",
        )}
        ${renderMetricCard(
          "보상 역전 위험",
          `${snapshot.payInversion.caseCount}건`,
          snapshot.payInversion.severity,
          "신규 입사자 보상이 기존 구성원보다 높아지는 구간이 있어 내부 설명 리스크가 생길 수 있습니다.",
        )}
        ${renderMetricCard(
          "현재 payroll 기준선",
          formatKrw(snapshot.baselineMonthlyPayroll),
          `연환산 ${formatKrw(snapshot.baselineAnnualizedPayroll)}`,
          `현재 채용 계획 유지 시 월 ${formatKrw(snapshot.expectedMonthlyPayrollIncrease)}, 연 ${formatKrw(snapshot.expectedAnnualPayrollIncrease)} 증가 예상입니다.`,
        )}
      </div>
      <div class="snapshot-baseline">
        <div>
          <strong>Payroll 증가율</strong>
          <span>${snapshot.payrollIncreaseRate.toLocaleString("ko-KR")}%</span>
        </div>
        <div>
          <strong>Runway 영향</strong>
          <span>${escapeHtml(runwayCopy)}</span>
        </div>
        <div>
          <strong>결과 확신도</strong>
          <span>${snapshot.confidence}</span>
        </div>
      </div>
      ${missingPrompts}
      <div class="snapshot-risk-flags">
        <strong>리스크 플래그</strong>
        <ul>${riskFlags}</ul>
      </div>
      <div class="snapshot-actions">
        <button type="button">조정 시나리오 만들기</button>
        <a href="./quick-input.html">Quick Input으로 돌아가기</a>
      </div>
    </section>`;
}
