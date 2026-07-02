import type { QuickInputSection } from "./FieldTypes.ts";

export const optionalAISection: QuickInputSection = {
  id: "optional-ai-tooling",
  title: "Advanced: AI tooling 가정 입력",
  description: "Advanced 입력입니다. 기본 보상 시나리오에는 필요하지 않습니다.",
  advanced: true,
  fields: [
    {
      name: "aiScenarioInputs.planned_ai_tool_budget_monthly",
      label: "월 AI 도구 예산",
      type: "number",
      required: false,
      min: 0,
    },
    {
      name: "aiScenarioInputs.planned_ai_tool_budget_annual",
      label: "연 AI 도구 예산",
      type: "number",
      required: false,
      min: 0,
    },
    {
      name: "aiScenarioInputs.hiring_delay_months",
      label: "채용 지연 개월 수",
      type: "number",
      required: false,
      min: 0,
    },
    {
      name: "aiScenarioInputs.affected_roles_or_functions",
      label: "영향을 받는 역할/기능 그룹",
      type: "textarea",
      required: false,
      placeholder: "예: engineering, operations",
      helpText: "개인명이 아니라 역할 또는 기능 그룹으로만 입력합니다.",
    },
    {
      name: "aiScenarioInputs.productivity_leakage_questions",
      label: "Productivity leakage 질문 메모",
      type: "textarea",
      required: false,
      placeholder: "예: 검토 병목 yes, 프로세스 재설계 no",
    },
    {
      name: "aiScenarioInputs.junior_pipeline_risk_questions",
      label: "Junior pipeline 리스크 질문 메모",
      type: "textarea",
      required: false,
      placeholder: "예: junior hiring paused yes",
    },
    {
      name: "aiScenarioInputs.orchestrator_target_count",
      label: "Senior 조율 역할 대상 수",
      type: "number",
      required: false,
      min: 0,
    },
    {
      name: "aiScenarioInputs.premium_pool_allocation_rate",
      label: "프리미엄 풀 배분율",
      type: "number",
      required: false,
      min: 0,
      helpText: "AI 대체율이 아니라 사용자가 제공하는 재배분 가정입니다.",
    },
  ],
};
