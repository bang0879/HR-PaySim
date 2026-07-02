import {
  AI_TOOLING_LEVELS,
  COMPANY_SIZE_BANDS,
  FUNDING_STAGES,
} from "../../lib/hr-paysim/schema/types.ts";
import type { QuickInputSection } from "./FieldTypes.ts";

const labelMap: Record<string, string> = {
  "1-10": "1-10명",
  "11-30": "11-30명",
  "31-50": "31-50명",
  "51-100": "51-100명",
  "101-300": "101-300명",
  "301-500": "301-500명",
  "501+": "501명 이상",
  bootstrapped: "부트스트랩",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  series_c_plus: "Series C+",
  profitable: "흑자 운영",
  unknown: "모름",
  none: "없음",
  ad_hoc: "개별 사용",
  team_level: "팀 단위 사용",
  company_standard: "회사 표준 도구",
};

function options(values: readonly string[]) {
  return values.map((value) => ({
    value,
    label: labelMap[value] ?? value,
  }));
}

export const companyContextSection: QuickInputSection = {
  id: "company-context",
  title: "회사 기본 정보",
  description: "회사 규모와 보상 운영 기반을 구간 값으로 입력합니다.",
  fields: [
    {
      name: "companyContext.company_size_band",
      label: "회사 규모 구간",
      type: "select",
      required: true,
      options: options(COMPANY_SIZE_BANDS),
    },
    {
      name: "companyContext.funding_stage",
      label: "투자 단계",
      type: "select",
      required: true,
      options: options(FUNDING_STAGES),
    },
    {
      name: "companyContext.has_hr_owner",
      label: "HR 담당자가 있습니다",
      type: "checkbox",
      required: true,
    },
    {
      name: "companyContext.has_level_system",
      label: "레벨 체계가 있습니다",
      type: "checkbox",
      required: true,
    },
    {
      name: "companyContext.has_salary_band",
      label: "급여 밴드가 있습니다",
      type: "checkbox",
      required: true,
    },
    {
      name: "companyContext.has_performance_review",
      label: "성과 리뷰가 있습니다",
      type: "checkbox",
      required: true,
    },
    {
      name: "companyContext.has_variable_pay",
      label: "변동 보상이 있습니다",
      type: "checkbox",
      required: true,
    },
    {
      name: "companyContext.has_equity_plan",
      label: "스톡옵션/지분 보상 제도가 있습니다",
      type: "checkbox",
      required: true,
    },
    {
      name: "companyContext.current_ai_tooling_level",
      label: "현재 AI 도구 활용 수준",
      type: "select",
      required: true,
      options: options(AI_TOOLING_LEVELS),
      helpText: "Advanced 시나리오를 열 때만 해석에 사용합니다.",
    },
  ],
};
