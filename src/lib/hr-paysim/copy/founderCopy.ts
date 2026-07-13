export const FOUNDER_COPY = {
  "screen.introduction.heading": "금번 진단 안내",
  "screen.evidence.heading": "확인된 연봉 차이",
  "screen.rule.heading": "앞으로 적용할 회사 기준",
  "screen.result.heading": "금번 진단 결과와 결정사항",
  "screen.introduction.scope_label": "금번 진단에서 확인할 내용",

  "screen.evidence.product_engineer.supporting":
    "직원 6명의 기본 연봉과 근속 개월을 함께 비교했습니다.",
  "screen.evidence.review_focus_label": "지금 확인해 봐야 할 기준",
  "screen.evidence.product_engineer.action_prompt":
    "이 차이가 생긴 가장 가까운 이유를 하나 선택하고, 그 설명을 확인할 기록이 있는지 이어서 답해 주세요.",
  "screen.evidence.product_engineer.explanation_question":
    "이 차이가 생긴 가장 가까운 이유를 하나 선택해 주세요.",
  "screen.evidence.trend.guide_label":
    "근속 개월과 기본 연봉이 함께 증가하는 방향",
  "screen.evidence.trend.guide_non_claim":
    "파란 점선은 시장 평균이나 권장 연봉, 회사의 연봉 기준이 아닙니다. 근속 개월과 기본 연봉이 함께 증가하는 방향을 읽기 위한 시각적 안내입니다.",
  "screen.evidence.trend.unavailable":
    "현재 표시된 직원만으로는 근속 개월과 기본 연봉의 관찰 추세를 계산하기 어렵습니다.",

  "non_claim.higher_salary": "연봉이 높은 직원의 보상이 잘못됐다는 뜻은 아닙니다.",
  "non_claim.observed_repeat":
    "현재 확인된 사례가 한 번 더 반복된다고 가정한 결과이며, 회사의 확정된 정책이 아닙니다.",
  "non_claim.bounded_rule":
    "이 계산은 이번에 정한 조건을 한 번 적용한 결과이며, 개인별 권장 연봉이 아닙니다.",

  "state.empty":
    "이번에 입력한 자료에서는 같은 역할의 직원들이 서로 연봉을 비교했을 때 별도로 설명이 필요한 큰 차이가 확인되지 않았습니다. 이는 회사의 모든 보상 기준이 완전하다는 뜻이 아니라, 현재 입력된 자료 범위에서 추가 검토가 필요한 사례가 발견되지 않았다는 뜻입니다.",
  "state.insufficient_sample":
    "Product Engineer 자료가 2명뿐이어서 같은 역할 안의 연봉 분포를 판단하기 어렵습니다. 최소 4명의 자료가 있으면 연봉이 여러 그룹으로 나뉘는지 확인할 수 있습니다.",
  "state.recalculated":
    "앞서 선택한 설명이 변경되어 이후 계산과 결정사항을 다시 확인했습니다.",
  "state.explanation_missing_evidence":
    "선택한 설명을 뒷받침할 자료가 아직 확인되지 않았습니다. 확인할 자료와 담당자, 기한을 정리합니다.",
  "state.founder_cannot_explain":
    "현재 자료만으로는 이 차이가 생긴 이유를 설명하기 어렵습니다. 다음으로 확인할 기록을 정리합니다.",
  "state.repeat_insufficient":
    "적용 대상, 금액, 승인자 또는 재검토 시점이 정해지지 않아 같은 방식을 적용한 결과를 계산하지 않았습니다.",
  "state.personal_information_detected":
    "개인정보로 볼 수 있는 항목이 확인되어 계산을 멈췄습니다. 실제 값은 다시 표시하지 않으며, 확인이 필요한 열 이름과 행 번호만 안내합니다.",
  "state.copy_succeeded":
    "확인한 금번 진단 결과와 결정사항을 클립보드에 복사했습니다.",
  "state.copy_failed":
    "금번 진단 결과와 결정사항을 복사하지 못했습니다. 브라우저의 복사 권한을 확인한 뒤 다시 시도해 주세요.",
  "state.export_failed":
    "결과 파일을 만들지 못했습니다. 현재 화면 내용은 유지되어 있으므로 잠시 후 다시 시도해 주세요.",

  "action.view_evidence": "실제 연봉 분포와 비교 사례 보기",
  "action.review_reason": "이 차이가 생긴 이유 확인하기",
  "action.repeat_practice": "같은 채용 방식을 다음에도 적용해 보기",
  "action.organize_decisions": "금번 진단에서 결정한 내용 정리하기",
  "action.copy_result": "확인한 내용 복사하기",
  "action.print_result": "인쇄하거나 PDF로 내보낼 화면 열기",
  "action.end_and_clear": "진단을 종료하고 입력 내용을 지우기",

  "result.column.confirmed": "확인된 내용",
  "result.column.founder_explanation": "확인한 설명",
  "result.column.evidence": "확인된 근거 또는 추가 확인 자료",
  "result.column.decision": "이번에 정한 사항",
  "result.column.owner": "담당자",
  "result.column.due": "완료 또는 재검토 시점",

  "interpretation.product_engineer.salary_observation":
    "Product Engineer 6명 중 근속 48~64개월인 직원 3명의 연봉은 6,800만~7,600만원이고, 근속 14~22개월인 직원 3명의 연봉은 8,800만~9,500만원입니다.",
  "interpretation.product_engineer.hiring_practice_hypothesis":
    "최근 채용 과정에서 추가된 금액이 기존 직원의 연봉 검토 기준과 별도로 운영됐을 가능성을 확인해야 합니다.",
  "interpretation.product_engineer.founder_question":
    "근속 14~22개월인 직원들의 연봉을 정할 때 기존 Product Engineer의 연봉과 별도로 적용한 채용 조건이 있었습니까?",
  "interpretation.platform_engineer.salary_observation":
    "Platform Engineer 4명 중 근속 60~69개월인 직원 2명의 연봉은 근속 17~19개월인 직원 2명보다 1,200만~1,800만원 낮습니다.",
  "interpretation.platform_engineer.hiring_practice_hypothesis":
    "최근 채용 조건과 기존 직원의 연봉 검토 기준이 서로 다르게 적용됐을 가능성을 확인해야 합니다.",
  "interpretation.platform_engineer.founder_question":
    "최근 Platform Engineer 채용에서 기존 직원과 다른 추가 조건을 적용한 사례가 있었습니까?",
  "interpretation.gtm.level_order_observation":
    "GTM에서 AE2 직원 2명의 연봉이 일부 AE1 직원보다 100만~400만원 낮습니다.",
  "interpretation.gtm.level_criteria_hypothesis":
    "현재 직급별 역할 기준과 연봉 결정 기준이 같은 순서로 적용되는지 확인해야 합니다.",
  "interpretation.gtm.founder_question":
    "AE1과 AE2를 구분하는 역할 기준이 실제 연봉 결정에도 동일하게 적용되고 있습니까?",
} as const satisfies Record<string, string>;

export type FounderCopyKey = keyof typeof FOUNDER_COPY;

export function formatProductEngineerEvidenceTitle(input: {
  employeeCount: number;
  lowerPaidLabel: string;
  lowerPaidTenureMonths: number;
  higherPaidLabel: string;
  higherPaidTenureMonths: number;
  headlineGapKRW: number;
}): string {
  validateCount(input.employeeCount);
  validateLabel(input.lowerPaidLabel);
  validateLabel(input.higherPaidLabel);
  validateTenure(input.lowerPaidTenureMonths);
  validateTenure(input.higherPaidTenureMonths);
  const amount = formatHeadlineGap(input.headlineGapKRW);
  return `Product Engineer ${input.employeeCount}명 중 근속 ${input.lowerPaidTenureMonths}개월인 ${input.lowerPaidLabel}와 근속 ${input.higherPaidTenureMonths}개월인 ${input.higherPaidLabel}의 연봉은 ${amount}만원 차이납니다.`;
}

export function formatProductEngineerEvidenceSupporting(input: {
  employeeCount: number;
  lowerPaidLabel: string;
  higherPaidLabel: string;
}): string {
  validateCount(input.employeeCount);
  validateLabel(input.lowerPaidLabel);
  validateLabel(input.higherPaidLabel);
  return `직원 ${input.employeeCount}명의 기본 연봉과 근속 개월을 함께 비교했습니다. 현재 자료에 기록된 역할·근속 기간·채용 예외 기록만으로는 ${input.lowerPaidLabel}와 ${input.higherPaidLabel}의 차이를 일관되게 설명할 기준을 확인하기 어렵습니다.`;
}

export function formatObservedTrendLabel(employeeCount: number): string {
  assertPositiveCount(employeeCount, "OBSERVED_TREND_EMPLOYEE_COUNT_INVALID");
  return `현재 ${employeeCount}명의 관찰 추세`;
}

export function formatObservedTrendSummary({
  employeeCount,
  direction,
}: {
  employeeCount: number;
  direction: "increasing" | "decreasing" | "flat";
}): string {
  assertPositiveCount(employeeCount, "OBSERVED_TREND_EMPLOYEE_COUNT_INVALID");
  const directionCopy = direction === "increasing"
    ? "근속 개월이 늘어나는 쪽에서 기본 연봉도 높아지는 방향입니다."
    : direction === "decreasing"
      ? "근속 개월이 늘어나는 쪽에서 기본 연봉이 낮아지는 방향입니다."
      : "근속 개월에 따라 기본 연봉이 높아지거나 낮아지는 뚜렷한 방향이 없습니다.";
  return `현재 ${employeeCount}명의 점을 한 줄로 요약하면, ${directionCopy} 이 자료만으로 그 원인이나 적정 연봉을 판단할 수는 없습니다.`;
}

function formatHeadlineGap(headlineGapKRW: number): string {
  if (!Number.isSafeInteger(headlineGapKRW) || headlineGapKRW < 0 || headlineGapKRW % 10_000 !== 0) {
    throw new Error("INVALID_PRODUCT_ENGINEER_HEADLINE_GAP");
  }
  return (headlineGapKRW / 10_000).toLocaleString("ko-KR");
}

function validateCount(value: number): void {
  assertPositiveCount(value, "INVALID_EMPLOYEE_COUNT");
}

function assertPositiveCount(value: number, errorCode: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(errorCode);
}

function validateTenure(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("INVALID_TENURE_MONTHS");
}

function validateLabel(value: string): void {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error("INVALID_EMPLOYEE_LABEL");
}

export function resolveFounderCopy(copyKey: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(FOUNDER_COPY, copyKey)
    ? FOUNDER_COPY[copyKey as FounderCopyKey]
    : undefined;
}

export function formatFounderAmount(amountKRW: number, comparisonContext: string): string {
  if (!Number.isSafeInteger(amountKRW) || amountKRW < 0) {
    throw new Error("INVALID_FOUNDER_AMOUNT");
  }
  if (typeof comparisonContext !== "string" || comparisonContext.trim().length === 0) {
    throw new Error("COMPARISON_CONTEXT_REQUIRED");
  }
  const formattedAmount = amountKRW.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formattedAmount}원 · ${comparisonContext.trim()}`;
}
