export const FOUNDER_COPY = {
  "screen.introduction.heading": "금번 진단 안내",
  "screen.evidence.heading": "확인된 연봉 차이",
  "screen.rule.heading": "앞으로 적용할 회사 기준",
  "screen.result.heading": "금번 진단 결과와 결정사항",

  "screen.evidence.product_engineer.conclusion":
    "Product Engineer 6명 중 장기 근속자 3명은 6,800만~7,600만원, 최근 입사자 3명은 8,800만~9,500만원입니다. 현재 자료만으로는 같은 역할 안에서 이 차이가 생긴 기준을 확인할 수 없습니다.",

  "non_claim.higher_salary": "연봉이 높은 직원의 보상이 잘못됐다는 뜻은 아닙니다.",
  "non_claim.observed_repeat":
    "현재 확인된 사례가 한 번 더 반복된다고 가정한 결과이며, 회사의 확정된 정책이 아닙니다.",
  "non_claim.bounded_rule":
    "이 계산은 대표님이 정한 조건을 한 번 적용한 결과이며, 개인별 권장 연봉이 아닙니다.",

  "state.empty":
    "이번에 입력한 자료에서는 같은 역할의 직원들이 서로 연봉을 비교했을 때 별도로 설명이 필요한 큰 차이가 확인되지 않았습니다. 이는 회사의 모든 보상 기준이 완전하다는 뜻이 아니라, 현재 입력된 자료 범위에서 추가 검토가 필요한 사례가 발견되지 않았다는 뜻입니다.",
  "state.insufficient_sample":
    "Product Engineer 자료가 2명뿐이어서 같은 역할 안의 연봉 분포를 판단하기 어렵습니다. 최소 4명의 자료가 있으면 연봉이 여러 그룹으로 나뉘는지 확인할 수 있습니다.",
  "state.recalculated":
    "앞서 선택한 설명이 변경되어 이후 계산과 결정사항을 다시 확인했습니다.",
  "state.explanation_missing_evidence":
    "대표님이 선택한 설명을 뒷받침할 자료가 아직 확인되지 않았습니다. 확인할 자료와 담당자, 기한을 정리합니다.",
  "state.founder_cannot_explain":
    "현재 자료만으로는 이 차이가 생긴 이유를 설명하기 어렵습니다. 다음으로 확인할 기록을 정리합니다.",
  "state.repeat_insufficient":
    "적용 대상, 금액, 승인자 또는 재검토 시점이 정해지지 않아 같은 방식을 적용한 결과를 계산하지 않았습니다.",

  "action.view_evidence": "실제 연봉 분포와 비교 사례 보기",
  "action.review_reason": "이 차이가 생긴 이유 확인하기",
  "action.repeat_practice": "같은 채용 방식을 다음에도 적용해 보기",
  "action.organize_decisions": "금번 진단에서 결정한 내용 정리하기",
  "action.copy_result": "대표님이 확인한 내용 복사하기",

  "result.column.confirmed": "확인된 내용",
  "result.column.founder_explanation": "대표님 설명",
  "result.column.evidence": "확인된 근거 또는 추가 확인 자료",
  "result.column.decision": "이번에 정한 사항",
  "result.column.owner": "담당자",
  "result.column.due": "완료 또는 재검토 시점",

  "interpretation.product_engineer.salary_observation":
    "Product Engineer에서 오래 근무한 직원 3명이 최근 입사자보다 1,200만~2,700만원 낮은 연봉을 받고 있습니다.",
  "interpretation.product_engineer.hiring_practice_hypothesis":
    "최근 채용 과정에서 추가된 금액이 기존 직원의 연봉 검토 기준과 별도로 운영됐을 가능성을 확인해야 합니다.",
  "interpretation.product_engineer.founder_question":
    "최근 입사자의 연봉을 정할 때 기존 Product Engineer의 연봉과 별도로 적용한 채용 조건이 있었습니까?",
  "interpretation.platform_engineer.salary_observation":
    "Platform Engineer에서 오래 근무한 직원 2명이 최근 입사자 2명보다 1,200만~1,800만원 낮은 연봉을 받고 있습니다.",
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

export function resolveFounderCopy(copyKey: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(FOUNDER_COPY, copyKey)
    ? FOUNDER_COPY[copyKey as FounderCopyKey]
    : undefined;
}

export function formatFounderAmount(amountKRW: number, comparisonContext: string): string {
  if (!Number.isFinite(amountKRW) || amountKRW < 0) {
    throw new Error("INVALID_FOUNDER_AMOUNT");
  }
  if (comparisonContext.trim().length === 0) {
    throw new Error("COMPARISON_CONTEXT_REQUIRED");
  }
  return `${new Intl.NumberFormat("ko-KR").format(amountKRW)}원 · ${comparisonContext.trim()}`;
}
