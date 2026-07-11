import assert from "node:assert/strict";
import test from "node:test";
import {
  findForbiddenCopyValues,
  findForbiddenRenderedCopy,
} from "../../scripts/check-forbidden-copy.ts";
import {
  FOUNDER_COPY,
  formatFounderAmount,
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
    "대표님이 확인한 내용 복사하기",
  ]);
});

test("locks the Product Engineer conclusion, non-claims, and required states", () => {
  assert.match(
    FOUNDER_COPY["screen.evidence.product_engineer.conclusion"],
    /Product Engineer 6명.*6,800만~7,600만원.*8,800만~9,500만원/,
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
});

test("founder copy values contain none of the forbidden founder terms", () => {
  assert.ok(FORBIDDEN_FOUNDER_TERMS.includes("finding"));
  assert.ok(FORBIDDEN_FOUNDER_TERMS.includes("stale"));
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

  assert.deepEqual(findForbiddenRenderedCopy(internalSource), []);
  assert.deepEqual(findForbiddenRenderedCopy(genericBoundarySource), []);
  assert.deepEqual(findForbiddenRenderedCopy(renderedSource), ["theme", "relationship"]);
  assert.deepEqual(findForbiddenRenderedCopy(quotedAttribute), ["memo"]);
});
