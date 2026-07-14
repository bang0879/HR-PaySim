import type { CEDBand, CEIBand, PayInversionSeverity } from "./domain.ts";

export interface InterpretationText {
  headline: string;
  body: string;
  supportingPoints: string[];
  caution?: string;
}

export const FORBIDDEN_PAY_SIM_WORDING = [
  "AI substitution",
  "job replacement",
  "Total Work Cost",
  "attrition probability",
  "salary calculator",
  "이직 확률",
  "생산성 향상률",
  "대체율",
] as const;

export function getInterpretation(input: {
  ceiBand: CEIBand;
  cedBand: CEDBand;
  payInversionSeverity: PayInversionSeverity;
  payrollIncreaseRate?: number;
}): InterpretationText {
  const hasGovernanceRisk = input.ceiBand === "risk" || input.cedBand === "high" || input.cedBand === "critical";
  const hasInversionRisk = input.payInversionSeverity === "medium" || input.payInversionSeverity === "high";
  const hasHiringPressure = typeof input.payrollIncreaseRate === "number" && input.payrollIncreaseRate >= 0.15;

  if (!hasGovernanceRisk && !hasInversionRisk && !hasHiringPressure) {
    return {
      headline: "현재 보상 구조는 설명 가능한 범위에 있습니다.",
      body:
        "지금 바로 큰 조정을 하기보다 현재 구조를 유지하면서 다음 점검 조건을 정하는 편이 좋습니다. 얻는 것은 단기 안정성이고, 감수할 것은 예외 신호를 계속 관찰해야 한다는 점입니다.",
      supportingPoints: [
        "보상 설명 가능성과 예외 누적 수준이 관리 가능한 범위입니다.",
        "현 상태 유지는 아무것도 하지 않는 선택이 아니라 점검 조건을 둔 운영 선택입니다.",
        "다음 채용이나 보상 조정 전 다시 계산하면 충분합니다.",
      ],
    };
  }

  const supportingPoints = [
    describeCEI(input.ceiBand),
    describeCED(input.cedBand),
    describeInversion(input.payInversionSeverity),
  ];

  if (hasHiringPressure) {
    supportingPoints.push("채용 계획이 급여 총액 부담을 키울 수 있어 예산 범위를 먼저 확인해야 합니다.");
  }

  return {
    headline: "보상 수준보다 설명 가능한 구조를 먼저 봐야 합니다.",
    body:
      "현재 신호는 단순한 급여 인상 문제가 아니라 보상 기준을 설명하고 반복 예외를 줄이는 문제에 가깝습니다. 얻는 것은 내부 설명 가능성이고, 감수할 것은 정책 정리와 커뮤니케이션 부담입니다.",
    supportingPoints,
    caution: "개인별 급여 결론이 아니라 회사의 보상 의사결정 구조를 비교하기 위한 해석입니다.",
  };
}

function describeCEI(band: CEIBand): string {
  if (band === "healthy") return "보상 설명 가능성은 현재 강점으로 볼 수 있습니다.";
  if (band === "manageable") return "보상 설명 가능성은 관리 가능하지만 기준을 문서화할 필요가 있습니다.";
  if (band === "watch") return "보상 설명 가능성이 흔들리고 있어 예외 기준을 점검해야 합니다.";
  return "보상 설명 가능성이 낮아 구성원에게 같은 기준을 설명하기 어려울 수 있습니다.";
}

function describeCED(band: CEDBand): string {
  if (band === "low") return "반복된 예외 인상은 아직 낮은 수준입니다.";
  if (band === "manageable") return "반복된 예외 인상은 관리 가능하지만 누적 여부를 봐야 합니다.";
  if (band === "high") return "반복된 예외 인상이 쌓여 다음 보상 결정의 부담이 커질 수 있습니다.";
  return "반복된 예외 인상이 매우 커서 기준 정리 없이는 설명 부담이 빠르게 커질 수 있습니다.";
}

function describeInversion(severity: PayInversionSeverity): string {
  if (severity === "none") return "신규 입사자와 기존 구성원 사이의 보상 역전 신호는 보이지 않습니다.";
  if (severity === "low") return "일부 보상 역전 신호가 있어 다음 채용 전에 기준 확인이 필요합니다.";
  if (severity === "medium") return "보상 역전 구간이 있어 내부 설명과 조정 범위를 함께 봐야 합니다.";
  return "보상 역전 신호가 커서 조정하지 않을 때의 설명 부담도 함께 비교해야 합니다.";
}