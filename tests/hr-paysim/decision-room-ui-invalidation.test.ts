import assert from "node:assert/strict";
import test from "node:test";
import { createProductEngineerDecisionRoomViewModel } from "../../src/features/decision-room/decisionRoomViewModel.ts";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";
import { decisionRoomReducer } from "../../src/lib/hr-paysim/session/decisionRoomReducer.ts";

test("changed explanations do not revive removed repeat or decision copy", () => {
  const demo = createSyntheticDemoSession();
  const changed = decisionRoomReducer(demo, {
    type: "UPDATE_REVIEW",
    themeId: demo.activeThemeId!,
    patch: { explanationBasis: "timing_context" },
  });
  const model = createProductEngineerDecisionRoomViewModel(changed);
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
  assert.equal(model.result.rows[0]?.decision, "결정 확인 필요");
  assert.doesNotMatch(model.result.conclusion, /문서로 정하기로 했습니다/);
  assert.equal(model.result.approvalStatus, "결정사항 다시 확인 필요");
  assert.deepEqual(model.result.nextActions, [{
    period: "다음 확인",
    action: "변경된 설명을 확인한 뒤 근거와 회사 행동을 다시 정합니다.",
  }]);
});
