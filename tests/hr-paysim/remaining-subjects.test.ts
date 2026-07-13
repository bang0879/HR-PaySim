import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { DecisionRoomSessionState } from "../../src/lib/hr-paysim/session/types.ts";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";

const viewModelModule = await import(
  "../../src/features/decision-room/decisionRoomViewModel.ts"
) as unknown as {
  createDecisionRoomViewModel?: (state: DecisionRoomSessionState) => any;
};

function createModel(state: DecisionRoomSessionState) {
  const factory = viewModelModule.createDecisionRoomViewModel;
  assert.equal(typeof factory, "function");
  return factory!(state);
}

function selectRole(roleGroup: string) {
  const state = createSyntheticDemoSession();
  const theme = state.selection.selected.find((item) => item.roleGroup === roleGroup);
  assert.ok(theme);
  state.activeThemeId = theme.id;
  return { state, theme };
}

test("projects all three selected subjects and the bounded Designer clean state", () => {
  const model = createModel(createSyntheticDemoSession());

  assert.deepEqual(
    model.subjects.map(({ roleGroup }: { roleGroup: string }) => roleGroup),
    ["Product Engineer", "Platform Engineer", "GTM"],
  );
  assert.deepEqual(
    model.subjects.map(({ reviewStatus }: { reviewStatus: string }) => reviewStatus),
    ["answered", "pending", "pending"],
  );
  assert.equal(model.cleanState?.roleGroup, "Designer");
  assert.match(model.cleanState.statement, /현재 샘플 자료 범위/);
  assert.match(model.cleanState.statement, /모든 보상 기준이 완전하다는 뜻은 아닙니다/);
});

test("projects Platform comparison as tenure evidence", () => {
  const { state } = selectRole("Platform Engineer");
  const model = createModel(state);

  assert.equal(model.activeRoleGroup, "Platform Engineer");
  assert.equal(model.evidence.visualization.kind, "tenure");
  assert.equal(model.evidence.highlightedPair.difference, "1,800만원");
  assert.match(
    model.evidence.conclusion,
    /근속 60개월인 직원 A.*근속 17개월인 직원 B.*1,800만원/,
  );
  assert.ok(model.evidence.supportingObservations.length <= 2);
});

test("projects GTM level order with exact three metric meanings", () => {
  const { state } = selectRole("GTM");
  const model = createModel(state);

  assert.equal(model.evidence.visualization.kind, "level_order");
  assert.deepEqual(model.evidence.visualization.metrics, [
    { label: "직원 A와 직원 B의 현재 기본 연봉 차이", amount: "400만원" },
    { label: "두 직원의 차이를 0원으로 놓는 계산", amount: "400만원" },
    { label: "AE2 두 명을 가장 높은 AE1과 같은 금액으로 놓는 계산 합계", amount: "500만원" },
  ]);
  assert.match(
    model.evidence.visualization.nonClaim,
    /인상액.*권장 연봉.*승인한 기준이 아닙니다/,
  );
});

test("creates explicit pending rows for unanswered subjects", () => {
  const model = createModel(createSyntheticDemoSession());

  assert.deepEqual(
    model.result.rows.map(({ roleGroup }: { roleGroup: string }) => roleGroup),
    ["Product Engineer", "Platform Engineer", "GTM"],
  );
  assert.equal(model.result.rows[1].founderExplanation, "확인 필요");
  assert.equal(model.result.rows[2].decision, "확인 필요");
  assert.equal(model.result.approvalStatus, "추가 확인 필요");
  assert.match(model.introduction.nextStepSummary, /첫 번째|Product Engineer/);
  assert.doesNotMatch(
    JSON.stringify(model.result.nextActions),
    /Platform Engineer.*확인 완료|GTM.*확인 완료/,
  );
});

test("Screen 2 enables all selected subjects and renders evidence by kind", () => {
  const screen = readFileSync(
    new URL(
      "../../src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const selector = readFileSync(
    new URL("../../src/features/decision-room/SubjectSelector.tsx", import.meta.url),
    "utf8",
  );
  const levelOrder = readFileSync(
    new URL(
      "../../src/features/confirmed-pay-differences/LevelOrderDistribution.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(screen, /<SubjectSelector/);
  assert.match(screen, /visualization\.kind === "tenure"/);
  assert.match(screen, /<LevelOrderDistribution/);
  assert.doesNotMatch(screen, /button type="button" disabled/);
  assert.match(selector, /aria-pressed/);
  assert.match(levelOrder, /model\.metrics/);
  assert.match(levelOrder, /model\.nonClaim/);
});

test("Screen 3 shares the selector and Screen 4 renders subject-scoped rows", () => {
  const rule = readFileSync(
    new URL("../../src/features/company-rule/CompanyRuleScreen.tsx", import.meta.url),
    "utf8",
  );
  const result = readFileSync(
    new URL("../../src/features/session-result/SessionResultScreen.tsx", import.meta.url),
    "utf8",
  );

  assert.match(rule, /<SubjectSelector/);
  assert.match(rule, /model\.variant\.kind === "level_order"/);
  assert.match(rule, /model\.variant\.kind === "pending"/);
  assert.match(result, /row\.roleGroup/);
  assert.match(result, /model\.cleanState/);
  assert.match(result, /model\.unselectedSubjects/);
});

test("remaining subjects never borrow Product repeat or decision copy", () => {
  const platform = createModel(selectRole("Platform Engineer").state);
  assert.equal(platform.rule.variant.kind, "pending");
  assert.doesNotMatch(
    JSON.stringify(platform.rule),
    /9,500만원|2,700만원|추가 보상 기준을 다음 채용/,
  );

  const gtm = createModel(selectRole("GTM").state);
  assert.equal(gtm.rule.variant.kind, "level_order");
  assert.deepEqual(
    gtm.rule.variant.metrics.map(({ amount }: { amount: string }) => amount),
    ["400만원", "400만원", "500만원"],
  );
  assert.doesNotMatch(JSON.stringify(gtm.rule.variant), /다음 채용자|한 번 더 반복/);
});
