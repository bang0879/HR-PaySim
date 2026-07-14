import type { PrototypePresentation } from "./prototypeViewModel.ts";

export interface MemoPreviewInput {
  currentIssue: string;
  selectedScenarioTitle: string;
  reason: string;
  gains: string[];
  tradeoffs: string[];
  nextQuestions: string[];
}

export function generateMemoPreviewText(input: MemoPreviewInput): string {
  return [
    "HR PaySim 논의용 메모 preview",
    "",
    "현재 이슈",
    `- ${input.currentIssue}`,
    "",
    "선택한 시나리오",
    `- ${input.selectedScenarioTitle}`,
    "",
    "왜 이 안을 보는지",
    `- ${input.reason}`,
    "",
    "얻는 것",
    ...input.gains.map((item) => `- ${item}`),
    "",
    "감수할 것",
    ...input.tradeoffs.map((item) => `- ${item}`),
    "",
    "다음 질문",
    ...input.nextQuestions.map((item) => `- ${item}`),
    "",
    "이 내용은 정식 문서가 아니라 팀 내부 논의를 돕는 preview입니다.",
  ].join("\n");
}

export function createPrototypeMemoPreviewText(presentation: PrototypePresentation): string {
  return generateMemoPreviewText({
    currentIssue: presentation.memo.currentIssue,
    selectedScenarioTitle: presentation.selectedScenario.title,
    reason: presentation.memo.reason,
    gains: presentation.memo.gains,
    tradeoffs: presentation.memo.tradeoffs,
    nextQuestions: presentation.memo.nextQuestions,
  });
}
