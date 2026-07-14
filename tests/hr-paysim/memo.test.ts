import assert from "node:assert/strict";
import test from "node:test";
import { generateMemoPreviewText } from "../../src/lib/hr-paysim/memo.ts";

test("generateMemoPreviewText includes discussion memo sections", () => {
  const text = generateMemoPreviewText({
    currentIssue: "보상 역전 구간이 늘고 있습니다.",
    selectedScenarioTitle: "급여 밴드 재설계",
    reason: "설명 가능한 기준을 다시 세우기 위해서입니다.",
    gains: ["보상 기준을 설명하기 쉬워집니다."],
    tradeoffs: ["정책 정리와 커뮤니케이션 부담이 생깁니다."],
    nextQuestions: ["어떤 직군부터 적용할까요?"],
  });

  assert.match(text, /현재 이슈/);
  assert.match(text, /선택한 시나리오/);
  assert.match(text, /왜 이 안을 보는지/);
  assert.match(text, /얻는 것/);
  assert.match(text, /감수할 것/);
  assert.match(text, /다음 질문/);
});

test("generateMemoPreviewText avoids final deliverable framing", () => {
  const text = generateMemoPreviewText({
    currentIssue: "예외 인상이 반복됩니다.",
    selectedScenarioTitle: "현 상태 유지",
    reason: "다음 점검 조건을 두기 위해서입니다.",
    gains: ["단기 혼선을 줄입니다."],
    tradeoffs: ["설명 부담이 남을 수 있습니다."],
    nextQuestions: ["언제 다시 점검할까요?"],
  });

  assert.equal(/PDF|법률|세무|연봉 추천/.test(text), false);
});
