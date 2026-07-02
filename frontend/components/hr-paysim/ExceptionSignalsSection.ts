import {
  FREQUENCY_LEVELS,
  UNDOCUMENTED_NEGOTIATION_LEVELS,
} from "../../lib/hr-paysim/schema/types.ts";
import type { QuickInputSection } from "./FieldTypes.ts";

const frequencyLabels: Record<string, string> = {
  none: "없음",
  rare: "드묾",
  occasional: "가끔 있음",
  frequent: "자주 있음",
  unknown: "모름",
};

const negotiationLabels: Record<string, string> = {
  none: "없음",
  low: "낮음",
  medium: "보통",
  high: "높음",
  unknown: "모름",
};

export const exceptionSignalsSection: QuickInputSection = {
  id: "exception-signals",
  title: "예외 보상 신호",
  description: "예외 인상, 카운터오퍼, 신규 입사자 프리미엄 같은 거버넌스 신호를 입력합니다.",
  fields: [
    {
      name: "compensationSnapshot.recent_raise_budget",
      label: "최근 인상 예산",
      type: "number",
      required: false,
      min: 0,
    },
    {
      name: "compensationSnapshot.exception_raise_frequency",
      label: "예외 인상 빈도",
      type: "select",
      required: true,
      options: FREQUENCY_LEVELS.map((value) => ({ value, label: frequencyLabels[value] })),
    },
    {
      name: "compensationSnapshot.counteroffer_frequency",
      label: "카운터오퍼 빈도",
      type: "select",
      required: true,
      options: FREQUENCY_LEVELS.map((value) => ({ value, label: frequencyLabels[value] })),
    },
    {
      name: "compensationSnapshot.new_hire_premium_exists",
      label: "신규 입사자 프리미엄이 있습니다",
      type: "checkbox",
      required: true,
    },
    {
      name: "compensationSnapshot.pay_inversion_case_count",
      label: "보상 역전 사례 수",
      type: "number",
      required: false,
      min: 0,
      helpText: "개인명 없이 검토된 사례 수만 입력합니다.",
    },
    {
      name: "compensationSnapshot.out_of_band_case_count",
      label: "밴드 밖 사례 수",
      type: "number",
      required: false,
      min: 0,
    },
    {
      name: "compensationSnapshot.undocumented_negotiation_level",
      label: "문서화되지 않은 협상 수준",
      type: "select",
      required: false,
      options: UNDOCUMENTED_NEGOTIATION_LEVELS.map((value) => ({
        value,
        label: negotiationLabels[value],
      })),
    },
  ],
};
