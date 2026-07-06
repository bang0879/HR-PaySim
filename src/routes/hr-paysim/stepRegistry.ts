import type { PaySimStepDefinition } from "../../lib/hr-paysim/domain";

export const PAY_SIM_STEPS: PaySimStepDefinition[] = [
  { id: "entry", route: "/hr-paysim/entry", title: "시작", subtitle: "모드 선택" },
  { id: "intake", route: "/hr-paysim/intake", title: "입력", subtitle: "데이터 입력" },
  { id: "aggregate_review", route: "/hr-paysim/aggregate-review", title: "확인", subtitle: "입력 내용 확인" },
  { id: "diagnosis", route: "/hr-paysim/diagnosis", title: "진단", subtitle: "보상 진단" },
  { id: "interpretation", route: "/hr-paysim/interpretation", title: "해석", subtitle: "전문가 해석" },
  { id: "recommendations", route: "/hr-paysim/recommendations", title: "시나리오", subtitle: "추천 시나리오" },
  { id: "ai_check", route: "/hr-paysim/ai-check", title: "AI 확인", subtitle: "추가 검토" },
  { id: "comparison", route: "/hr-paysim/comparison", title: "비교", subtitle: "의사결정 비교" },
  { id: "memo_preview", route: "/hr-paysim/memo-preview", title: "메모", subtitle: "의사결정 메모" },
];
