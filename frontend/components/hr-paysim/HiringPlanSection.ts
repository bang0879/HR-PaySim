import type { QuickInputSection } from "./FieldTypes.ts";

export const hiringPlanSection: QuickInputSection = {
  id: "hiring-plan",
  title: "채용 계획",
  description: "6개월/12개월 예정 채용을 레벨 또는 역할 그룹 단위로 입력합니다.",
  fields: [
    {
      name: "hiringPlan.planned_hires_6m",
      label: "6개월 채용 계획",
      type: "textarea",
      required: true,
      placeholder: "예: L2: 4, L3: 2",
    },
    {
      name: "hiringPlan.planned_hires_12m",
      label: "12개월 채용 계획",
      type: "textarea",
      required: true,
      placeholder: "예: L2: 8, L3: 4",
    },
    {
      name: "hiringPlan.average_expected_salary_by_level",
      label: "레벨별 예상 평균 연봉",
      type: "textarea",
      required: true,
      placeholder: "예: L2: 70000000, L3: 93000000",
    },
    {
      name: "hiringPlan.hiring_freeze_toggle",
      label: "선택 채용 지연 가정을 검토 중입니다",
      type: "checkbox",
      required: true,
    },
    {
      name: "hiringPlan.optional_cash_balance",
      label: "선택 입력: 현금 잔고",
      type: "number",
      required: false,
      min: 0,
    },
    {
      name: "hiringPlan.optional_runway_months",
      label: "선택 입력: runway 개월 수",
      type: "number",
      required: false,
      min: 0,
      helpText: "비워도 기본 보상 시뮬레이션은 진행됩니다.",
    },
  ],
};
