import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createDecisionRoomViewModel,
  DECISION_ROOM_PROGRESS,
} from "../../src/features/decision-room/decisionRoomViewModel.ts";
import { FOUNDER_COPY } from "../../src/lib/hr-paysim/copy/founderCopy.ts";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";

test("builds the four founder screens with one concrete action each", () => {
  const model = createDecisionRoomViewModel(createSyntheticDemoSession());

  assert.deepEqual(
    DECISION_ROOM_PROGRESS.map((item) => item.label),
    ["금번 진단 안내", "확인된 연봉 차이", "앞으로 적용할 회사 기준", "금번 진단 결과와 결정사항"],
  );
  assert.deepEqual(
    [model.introduction.primaryAction, model.evidence.primaryAction, model.rule.primaryAction],
    ["첫 번째 연봉 비교 보기", "같은 채용 방식을 다음에도 적용해 보기", "금번 진단에서 결정한 내용 정리하기"],
  );
  assert.equal(model.introduction.sectionLabel, "금번 진단에서 확인할 내용");
  assert.ok(model.introduction.outputs.every((output) => /[.?!]$/.test(output)));
});

test("derives the Screen 2 title and action from the Product Engineer headline gap", () => {
  const demo = createSyntheticDemoSession();
  const model = createDecisionRoomViewModel(demo);

  assert.equal(
    model.evidence.conclusion,
    "Product Engineer 6명 중 근속 64개월인 직원 A와 근속 14개월인 직원 B의 연봉은 2,700만원 차이납니다.",
  );
  assert.equal(
    model.evidence.supportingCopy,
    "직원 6명의 기본 연봉과 근속 개월을 함께 비교했습니다. 현재 자료에 기록된 역할·근속 기간·채용 예외 기록만으로는 직원 A와 직원 B의 차이를 일관되게 설명할 기준을 확인하기 어렵습니다.",
  );
  assert.equal(
    model.evidence.actionPrompt,
    "이 차이가 생긴 가장 가까운 이유를 하나 선택하고, 그 설명을 확인할 기록이 있는지 이어서 답해 주세요.",
  );
  assert.equal(
    model.evidence.explanationQuestion,
    "이 차이가 생긴 가장 가까운 이유를 하나 선택해 주세요.",
  );

  const changed = structuredClone(demo);
  const product = changed.selection.selected.find(
    (item) => item.roleGroup === "Product Engineer",
  );
  assert.ok(product);
  product.metrics.headlineGapKRW = 5_000_000;

  assert.equal(
    createDecisionRoomViewModel(changed).evidence.conclusion,
    "Product Engineer 6명 중 근속 64개월인 직원 A와 근속 14개월인 직원 B의 연봉은 500만원 차이납니다.",
  );
});

test("turns the Product Engineer evidence into anonymous founder-facing comparisons", () => {
  const model = createDecisionRoomViewModel(createSyntheticDemoSession());

  assert.match(model.evidence.supportingCopy, /직원 6명의 기본 연봉과 근속 개월/);
  assert.match(model.evidence.supportingCopy, /직원 A와 직원 B/);
  assert.match(
    model.evidence.supportingCopy,
    /직원 A와 직원 B의 차이.*일관되게 설명할 기준.*확인하기 어렵습니다/,
  );
  assert.equal(
    model.evidence.distributionHeading,
    "Product Engineer 6명의 기본 연봉과 근속 개월을 함께 표시했습니다.",
  );
  assert.deepEqual(model.evidence.highlightedPair, {
    lowerPaidLabel: "직원 A",
    higherPaidLabel: "직원 B",
    lowerPaidSalary: "6,800만원",
    higherPaidSalary: "9,500만원",
    difference: "2,700만원",
    lowerPaidTenure: "64개월 근속",
    higherPaidTenure: "14개월 근속",
    lowerPaidException: "별도 채용 예외 기록 없음",
    higherPaidException: "채용 예외 기록 있음",
  });
  assert.ok(model.evidence.supportingObservations.every((item) => /만원/.test(item)));
  assert.deepEqual(
    model.evidence.distribution.map((item) => item.employeeLabel),
    ["직원 A", "직원 C", "직원 D", "직원 E", "직원 F", "직원 B"],
  );
  assert.doesNotMatch(JSON.stringify(model), /row_\d+/);
});

test("keeps observed precedent, missing rule conditions, and the approved record distinct", () => {
  const model = createDecisionRoomViewModel(createSyntheticDemoSession());

  assert.equal(model.rule.observedRepeat.nextHireSalary, "9,500만원");
  assert.equal(model.rule.observedRepeat.affectedEmployees, "기존 Product Engineer 3명");
  assert.equal(model.rule.observedRepeat.maximumDifference, "최대 2,700만원");
  assert.equal(model.rule.observedRepeat.comparisonCount, "현재와 다음 채용을 합쳐 13개 비교");
  assert.deepEqual(model.rule.missingRuleConditions, ["적용 대상", "금액 또는 범위", "승인자", "재검토 시점"]);
  assert.deepEqual(
    model.rule.ruleConditions.map(({ label, approvalStatus }) => [label, approvalStatus]),
    [
      ["적용 대상", "아직 승인하지 않았습니다."],
      ["금액 또는 범위", "아직 승인하지 않았습니다."],
      ["승인자", "아직 승인하지 않았습니다."],
      ["재검토 시점", "아직 승인하지 않았습니다."],
    ],
  );
  assert.match(model.rule.ruleConditions[1]!.observedContext, /700만원.*앞으로 사용할 금액.*승인하지 않았습니다/);
  assert.doesNotMatch(model.rule.ruleConditions[2]!.observedContext, /대표와 HR/);
  assert.equal(model.rule.decision.companyAction, "다음 채용 전 추가 보상 기준을 문서로 정합니다.");
  assert.equal(model.rule.decision.owner, "대표 · HR");
  assert.equal(model.rule.decision.due, "다음 채용 제안 전");
  assert.equal(model.result.rows.length, 3);
  assert.deepEqual(model.result.rows.map((row) => row.roleGroup), [
    "Product Engineer",
    "Platform Engineer",
    "GTM",
  ]);
  assert.deepEqual(model.result.columns, [
    "확인된 내용",
    "확인한 설명",
    "확인된 근거 또는 추가 확인 자료",
    "이번에 정한 사항",
    "담당자",
    "완료 또는 재검토 시점",
  ]);
  assert.equal(model.result.copySuccess, FOUNDER_COPY["state.copy_succeeded"]);
  assert.equal(model.result.copyFailure, FOUNDER_COPY["state.copy_failed"]);
  assert.equal(model.result.printAction, FOUNDER_COPY["action.print_result"]);
  assert.equal(model.result.endAction, FOUNDER_COPY["action.end_and_clear"]);
});

test("uses expanded founder language instead of compressed design shorthand", () => {
  const model = createDecisionRoomViewModel(createSyntheticDemoSession());
  const renderedModel = JSON.stringify(model);

  for (const compressed of [
    "오늘 남길 결과",
    "오늘 확인할 결과",
    "설명하기 어려운 관계",
    "두 개의 구간",
    "두 개의 연봉 구간",
    "주요 비교 충돌",
    "회의 메모",
  ]) {
    assert.doesNotMatch(renderedModel, new RegExp(compressed));
  }
});

test("screen components render model-owned evidence and centralized result feedback", () => {
  const introduction = readFileSync(
    new URL("../../src/features/session-introduction/SessionIntroductionScreen.tsx", import.meta.url),
    "utf8",
  );
  const evidence = readFileSync(
    new URL("../../src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx", import.meta.url),
    "utf8",
  );
  const distribution = readFileSync(
    new URL("../../src/features/confirmed-pay-differences/SalaryDistribution.tsx", import.meta.url),
    "utf8",
  );
  const decisionRoomStyles = readFileSync(
    new URL("../../src/features/decision-room/decisionRoom.css", import.meta.url),
    "utf8",
  );
  const decisionRoomQa = readFileSync(
    new URL("../../scripts/qa-decision-room.mjs", import.meta.url),
    "utf8",
  );
  const rule = readFileSync(
    new URL("../../src/features/company-rule/CompanyRuleScreen.tsx", import.meta.url),
    "utf8",
  );
  const result = readFileSync(
    new URL("../../src/features/session-result/SessionResultScreen.tsx", import.meta.url),
    "utf8",
  );
  const renderedSources = [introduction, evidence, distribution, rule, result].join("\n");

  assert.doesNotMatch(renderedSources, /오늘 확인할 결과|두 개의 연봉 구간|회의 메모/);
  assert.match(introduction, /model\.sectionLabel/);
  assert.match(distribution, /distributionHeading/);
  assert.match(evidence, /model\.supportingCopy/);
  assert.match(evidence, /model\.actionPrompt/);
  assert.match(evidence, /dr-evidence-hero/);
  assert.match(evidence, /dr-screen-task/);
  assert.match(distribution, /formatObservedTrendLabel/);
  assert.match(distribution, /formatObservedTrendSummary/);
  assert.match(distribution, /screen\.evidence\.trend\.guide_non_claim/);
  assert.match(distribution, /dr-observed-trend-line/);
  assert.match(distribution, /dr-direction-guide-line/);
  assert.match(
    distribution,
    /const observedTrendLine = plot\.observedTrend\s*\?\s*insetPlotLine\(plot\.observedTrend, 0\.12\)/s,
  );
  assert.match(
    distribution,
    /const directionGuideLine = insetPlotLine\(plot\.directionGuide, 0\.18\)/,
  );
  assert.match(distribution, /x1=\{observedTrendLine\.start\.xPercent\}/);
  assert.match(distribution, /x1=\{directionGuideLine\.start\.xPercent\}/);
  assert.match(distribution, /가로축 · 근속 개월/);
  assert.match(distribution, /세로축 · 기본 연봉/);
  assert.doesNotMatch(distribution, /시장 평균이나 권장 연봉/);
  assert.match(distribution, /className="is-observed"/);
  assert.match(distribution, /className="is-guide"/);

  assert.match(
    decisionRoomStyles,
    /\.dr-salary-plot\s*\{[^}]*border:\s*1px solid var\(--dr-line\)[^}]*border-radius:\s*14px[^}]*background-color:\s*var\(--dr-soft\)[^}]*background-size:\s*25% 25%/s,
  );
  assert.match(
    decisionRoomStyles,
    /\.dr-observed-trend-line\s*\{[^}]*stroke:\s*var\(--dr-ink\)[^}]*stroke-width:\s*3[^}]*stroke-linecap:\s*round/s,
  );
  assert.match(
    decisionRoomStyles,
    /\.dr-direction-guide-line\s*\{[^}]*stroke:\s*var\(--dr-blue\)[^}]*stroke-width:\s*2[^}]*stroke-dasharray:\s*7 6[^}]*stroke-linecap:\s*round[^}]*opacity:\s*0\.72/s,
  );
  assert.match(
    decisionRoomStyles,
    /\.dr-salary-person-label\s*\{[^}]*padding:\s*5px 7px[^}]*border:\s*1px solid var\(--dr-line\)[^}]*border-radius:\s*9px[^}]*background:\s*rgba\(255, 255, 255, 0\.94\)/s,
  );
  assert.match(
    decisionRoomStyles,
    /\.dr-salary-person\.is-highlighted \.dr-salary-person-label\s*\{[^}]*border-color:\s*var\(--dr-blue\)/s,
  );
  assert.match(
    decisionRoomStyles,
    /\.dr-trend-legend span\s*\{[^}]*border-radius:\s*999px[^}]*background:\s*#fff/s,
  );
  assert.match(decisionRoomQa, /visualHierarchy/);
  assert.match(decisionRoomQa, /observedStrokeWidth/);
  assert.match(decisionRoomQa, /highlightedPointDiameter/);
  assert.match(decisionRoomQa, /standardPointDiameter/);
  assert.match(decisionRoomQa, /guideStrokeDasharray/);
  assert.match(decisionRoomQa, /observedLineStartXPercent/);
  assert.match(decisionRoomQa, /observedLineEndXPercent/);
  assert.match(decisionRoomQa, /guideLineStartXPercent/);
  assert.match(decisionRoomQa, /guideLineEndXPercent/);


  const evidenceOrder = [
    "dr-evidence-hero",
    "<SalaryDistribution",
    "dr-highlight-card",
    "dr-observations",
    "dr-question-card",
    "<EvidenceTable",
    "dr-action-bar",
  ].map((token) => evidence.indexOf(token));
  assert.ok(evidenceOrder.every((position) => position >= 0));
  assert.ok(evidenceOrder.every(
    (position, index) => index === 0 || position > evidenceOrder[index - 1]!,
  ));
  assert.match(evidence, /lowerPaidTenure/);
  assert.match(evidence, /higherPaidException/);
  assert.doesNotMatch(evidence, />64개월 근속<|>14개월 근속/);
  assert.match(rule, /condition\.observedContext/);
  assert.match(rule, /condition\.approvalStatus/);
  assert.match(result, /model\.copySuccess/);
  assert.match(result, /model\.copyFailure/);
  assert.match(result, /model\.printAction/);
});
