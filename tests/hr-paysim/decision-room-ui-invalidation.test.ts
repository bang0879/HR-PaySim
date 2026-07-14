import assert from "node:assert/strict";
import test from "node:test";
import { createDecisionRoomViewModel } from "../../src/features/decision-room/decisionRoomViewModel.ts";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";
import { decisionRoomReducer } from "../../src/lib/hr-paysim/session/decisionRoomReducer.ts";

test("changed explanations do not revive removed repeat or decision copy", () => {
  const demo = createSyntheticDemoSession();
  const changed = decisionRoomReducer(demo, {
    type: "UPDATE_REVIEW",
    themeId: demo.activeThemeId!,
    patch: { explanationBasis: "timing_context" },
  });
  const model = createDecisionRoomViewModel(changed);
  const downstreamCopy = JSON.stringify({ rule: model.rule, result: model.result });

  assert.equal(model.rule.observedRepeat.nextHireSalary, "계산 전");
  assert.doesNotMatch(model.rule.conclusion, /2,700만원/);
  assert.doesNotMatch(model.rule.observedRepeat.heading, /9,500만원/);
  assert.doesNotMatch(
    downstreamCopy,
    /현재 사례에서 700만원|대표 · HR|다음 채용 전 추가 보상 기준/,
  );
  assert.equal(model.rule.decision.companyAction, "이번에 정한 사항이 없습니다.");
  assert.equal(model.rule.decision.heading, "설명과 근거를 다시 확인한 뒤 회사 행동을 정합니다.");
  assert.equal(model.result.rows[0]?.decision, "확인 필요");
  assert.doesNotMatch(model.result.conclusion, /문서로 정하기로 했습니다/);
  assert.equal(model.result.approvalStatus, "추가 확인 필요");
  assert.deepEqual(model.result.nextActions.map(({ action }) => action), [
    "Product Engineer의 설명과 확인 기록을 다시 확인한 뒤 회사 행동을 정합니다.",
    "Platform Engineer의 연봉 차이를 설명할 기록과 적용 조건을 확인합니다.",
    "GTM의 직급별 역할 기준과 연봉 결정 기준이 같은 순서로 적용되는지 확인합니다.",
  ]);
});
