import assert from "node:assert/strict";
import test from "node:test";
import {
  findForbiddenCopyValues,
  findForbiddenRenderedCopy,
} from "../../scripts/check-forbidden-copy.ts";
import {
  FOUNDER_COPY,
  formatFounderAmount,
  formatObservedTrendLabel,
  formatObservedTrendSummary,
  formatProductEngineerEvidenceTitle,
  resolveFounderCopy,
} from "../../src/lib/hr-paysim/copy/founderCopy.ts";
import { FORBIDDEN_FOUNDER_TERMS } from "../../src/lib/hr-paysim/copy/forbiddenFounderTerms.ts";
import { INTERPRETATION_CLAIM_REGISTRY } from "../../src/lib/hr-paysim/interpretation/claimRegistry.ts";

test("locks the four founder headings and action-specific buttons", () => {
  assert.equal(FOUNDER_COPY["screen.introduction.heading"], "금번 진단 안내");
  assert.equal(FOUNDER_COPY["screen.evidence.heading"], "확인된 연봉 차이");
  assert.equal(FOUNDER_COPY["screen.rule.heading"], "앞으로 적용할 회사 기준");
  assert.equal(FOUNDER_COPY["screen.result.heading"], "금번 진단 결과와 결정사항");
  assert.deepEqual([
    FOUNDER_COPY["action.view_evidence"],
    FOUNDER_COPY["action.review_reason"],
    FOUNDER_COPY["action.repeat_practice"],
    FOUNDER_COPY["action.organize_decisions"],
    FOUNDER_COPY["action.copy_result"],
  ], [
    "실제 연봉 분포와 비교 사례 보기",
    "이 차이가 생긴 이유 확인하기",
    "같은 채용 방식을 다음에도 적용해 보기",
    "금번 진단에서 결정한 내용 정리하기",
    "확인한 내용 복사하기",
  ]);
});

test("locks the Product Engineer supporting copy, prompt, and title formatter", () => {
  assert.equal(
    FOUNDER_COPY["screen.evidence.product_engineer.supporting"],
    "직원 6명의 기본 연봉과 근속 개월을 함께 비교했습니다.",
  );
  assert.equal(
    FOUNDER_COPY["screen.evidence.product_engineer.action_prompt"],
    "이 차이가 생긴 가장 가까운 이유를 하나 선택하고, 그 설명을 확인할 기록이 있는지 이어서 답해 주세요.",
  );
  assert.equal(
    formatProductEngineerEvidenceTitle({
      employeeCount: 6,
      lowerPaidLabel: "직원 A",
      lowerPaidTenureMonths: 64,
      higherPaidLabel: "직원 B",
      higherPaidTenureMonths: 14,
      headlineGapKRW: 27_000_000,
    }),
    "Product Engineer 6명 중 근속 64개월인 직원 A와 근속 14개월인 직원 B의 연봉은 2,700만원 차이납니다.",
  );
  assert.throws(
    () => formatProductEngineerEvidenceTitle({
      employeeCount: 6,
      lowerPaidLabel: "직원 A",
      lowerPaidTenureMonths: 64,
      higherPaidLabel: "직원 B",
      higherPaidTenureMonths: 14,
      headlineGapKRW: -1,
    }),
    /INVALID_PRODUCT_ENGINEER_HEADLINE_GAP/,
  );
  assert.match(FOUNDER_COPY["non_claim.higher_salary"], /높은 직원.*잘못됐다는 뜻은 아닙니다/);
  assert.equal(
    FOUNDER_COPY["non_claim.observed_repeat"],
    "현재 확인된 사례가 한 번 더 반복된다고 가정한 결과이며, 회사의 확정된 정책이 아닙니다.",
  );
  assert.match(FOUNDER_COPY["non_claim.bounded_rule"], /개인별 권장 연봉이 아닙니다/);
  assert.match(FOUNDER_COPY["state.empty"], /현재 입력된 자료 범위/);
  assert.match(FOUNDER_COPY["state.insufficient_sample"], /Product Engineer 자료가 2명.*최소 4명/);
  assert.equal(
    FOUNDER_COPY["state.recalculated"],
    "앞서 선택한 설명이 변경되어 이후 계산과 결정사항을 다시 확인했습니다.",
  );
  assert.match(resolveFounderCopy("state.personal_information_detected") ?? "", /열 이름.*행 번호/);
  assert.match(resolveFounderCopy("state.copy_failed") ?? "", /복사.*다시/);
});

test("keeps the observed trend and neutral guide in the founder copy SSOT", () => {
  assert.equal(formatObservedTrendLabel(6), "현재 6명의 관찰 추세");
  assert.equal(
    formatObservedTrendSummary({ employeeCount: 6, direction: "decreasing" }),
    "현재 6명의 점을 한 줄로 요약하면, 근속 개월이 늘어나는 쪽에서 기본 연봉이 낮아지는 방향입니다. 이 자료만으로 그 원인이나 적정 연봉을 판단할 수는 없습니다.",
  );
  assert.equal(
    formatObservedTrendSummary({ employeeCount: 3, direction: "increasing" }),
    "현재 3명의 점을 한 줄로 요약하면, 근속 개월이 늘어나는 쪽에서 기본 연봉도 높아지는 방향입니다. 이 자료만으로 그 원인이나 적정 연봉을 판단할 수는 없습니다.",
  );
  assert.equal(
    formatObservedTrendSummary({ employeeCount: 4, direction: "flat" }),
    "현재 4명의 점을 한 줄로 요약하면, 근속 개월에 따라 기본 연봉이 높아지거나 낮아지는 뚜렷한 방향이 없습니다. 이 자료만으로 그 원인이나 적정 연봉을 판단할 수는 없습니다.",
  );
  assert.equal(
    FOUNDER_COPY["screen.evidence.trend.guide_label"],
    "근속 개월과 기본 연봉이 함께 증가하는 방향",
  );
  assert.equal(
    FOUNDER_COPY["screen.evidence.trend.guide_non_claim"],
    "파란 점선은 시장 평균이나 권장 연봉, 회사의 연봉 기준이 아닙니다. 근속 개월과 기본 연봉이 함께 증가하는 방향을 읽기 위한 시각적 안내입니다.",
  );
  assert.equal(
    FOUNDER_COPY["screen.evidence.trend.unavailable"],
    "현재 표시된 직원만으로는 근속 개월과 기본 연봉의 관찰 추세를 계산하기 어렵습니다.",
  );
  assert.doesNotMatch(
    FOUNDER_COPY["screen.evidence.trend.guide_label"],
    /정상|통상|시장|기대|권장|적정|회사 기준/,
  );
  assert.throws(() => formatObservedTrendLabel(0), /OBSERVED_TREND_EMPLOYEE_COUNT_INVALID/);
});

test("every claim and founder-question copy key resolves from the founder SSOT", () => {
  const registryKeys = INTERPRETATION_CLAIM_REGISTRY.flatMap((claim) => [
    ...claim.statements.map((statement) => statement.copyKey),
    claim.founderQuestion.copyKey,
  ]);

  for (const copyKey of registryKeys) {
    assert.equal(typeof resolveFounderCopy(copyKey), "string", `missing copy key: ${copyKey}`);
    assert.ok((resolveFounderCopy(copyKey) ?? "").length > 0);
  }
  assert.equal(resolveFounderCopy("unknown.copy.key"), undefined);
});

test("founder amounts always include a won unit and comparison context", () => {
  assert.equal(
    formatFounderAmount(27_000_000, "Product Engineer 직원 간 최대 차이"),
    "27,000,000원 · Product Engineer 직원 간 최대 차이",
  );
  assert.throws(() => formatFounderAmount(27_000_000, " "), /COMPARISON_CONTEXT_REQUIRED/);
  assert.throws(() => formatFounderAmount(-1, "직원 간 차이"), /INVALID_FOUNDER_AMOUNT/);
  assert.throws(() => formatFounderAmount(1.5, "직원 간 차이"), /INVALID_FOUNDER_AMOUNT/);
  assert.throws(() => formatFounderAmount(Number.MAX_SAFE_INTEGER + 1, "직원 간 차이"), /INVALID_FOUNDER_AMOUNT/);
  assert.throws(
    () => formatFounderAmount(1_000_000, undefined as unknown as string),
    /COMPARISON_CONTEXT_REQUIRED/,
  );
});

test("founder copy values contain none of the forbidden founder terms", () => {
  assert.ok(FORBIDDEN_FOUNDER_TERMS.includes("finding"));
  assert.ok(FORBIDDEN_FOUNDER_TERMS.includes("stale"));
  assert.ok(FORBIDDEN_FOUNDER_TERMS.includes("AI substitution"));
  assert.deepEqual(findForbiddenCopyValues(FOUNDER_COPY), []);
});

test("lint allows internal identifiers but rejects the same words in rendered JSX", () => {
  const internalSource = `type Theme = { relationship: string }; const finding = "internal-key";`;
  const genericBoundarySource = `
    const current = steps.find((step) => step.id === currentId);
    const isLast = current.id === "memo";
    return (<div>안내</div>);
  `;
  const renderedSource = `export function View() { return <p>theme relationship</p>; }`;
  const quotedAttribute = `export function Button() { return <button aria-label="memo">복사</button>; }`;
  const conditionalRenderedSource = `
    export function View({ active }: { active: boolean }) {
      return <p>{active ? "memo" : \`relationship\`}</p>;
    }
  `;

  assert.deepEqual(findForbiddenRenderedCopy(internalSource), []);
  assert.deepEqual(findForbiddenRenderedCopy(genericBoundarySource), []);
  assert.deepEqual(findForbiddenRenderedCopy(renderedSource), ["theme", "relationship"]);
  assert.deepEqual(findForbiddenRenderedCopy(quotedAttribute), ["memo"]);
  assert.deepEqual(findForbiddenRenderedCopy(conditionalRenderedSource), ["relationship", "memo"]);
});
