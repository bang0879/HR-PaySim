import type { QuickInputSection } from "./FieldTypes.ts";

export const compensationSnapshotSection: QuickInputSection = {
  id: "compensation-snapshot",
  title: "현재 보상 구조",
  description: "개인별 급여가 아니라 총액, 레벨, 기능 단위의 집계값만 입력합니다.",
  fields: [
    {
      name: "compensationSnapshot.total_headcount",
      label: "총 인원",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "compensationSnapshot.total_monthly_base_pay",
      label: "월 기본급 총액",
      type: "number",
      required: true,
      min: 0,
      helpText: "KRW 기준 aggregate 월 금액입니다.",
    },
    {
      name: "compensationSnapshot.total_monthly_fixed_allowance",
      label: "월 고정수당 총액",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "compensationSnapshot.total_expected_variable_pay",
      label: "예상 변동 보상 총액",
      type: "number",
      required: false,
      min: 0,
      helpText: "선택 입력입니다. 비워도 기본 흐름은 진행됩니다.",
    },
    {
      name: "compensationSnapshot.grouped_input_notes",
      label: "레벨/기능별 집계 메모",
      type: "textarea",
      required: false,
      placeholder: "예: L2 평균 62000000, L3 평균 82000000 / engineering 32명",
      helpText: "직원명, 이메일, 전화번호, 개인별 원시 급여는 입력하지 마세요.",
    },
  ],
};
