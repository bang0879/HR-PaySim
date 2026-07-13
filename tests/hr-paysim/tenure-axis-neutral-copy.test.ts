import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  FOUNDER_COPY,
  formatProductEngineerEvidenceSupporting,
  formatProductEngineerEvidenceTitle,
} from "../../src/lib/hr-paysim/copy/founderCopy.ts";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";
import { createProductEngineerDecisionRoomViewModel } from "../../src/features/decision-room/decisionRoomViewModel.ts";

test("describes the highlighted pair with factual tenure months", () => {
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
  assert.equal(
    formatProductEngineerEvidenceSupporting({
      employeeCount: 6,
      lowerPaidLabel: "직원 A",
      higherPaidLabel: "직원 B",
    }),
    "직원 6명의 기본 연봉과 근속 개월을 함께 비교했습니다. 현재 자료에 기록된 역할·근속 기간·채용 예외 기록만으로는 직원 A와 직원 B의 차이를 일관되게 설명할 기준을 확인하기 어렵습니다.",
  );
});

test("exposes numeric tenure for every synthetic Product Engineer", () => {
  const model = createProductEngineerDecisionRoomViewModel(createSyntheticDemoSession());
  assert.deepEqual(
    model.evidence.distribution.map(({ employeeLabel, tenureMonths }) => ({ employeeLabel, tenureMonths })),
    [
      { employeeLabel: "직원 A", tenureMonths: 64 },
      { employeeLabel: "직원 C", tenureMonths: 56 },
      { employeeLabel: "직원 D", tenureMonths: 48 },
      { employeeLabel: "직원 E", tenureMonths: 22 },
      { employeeLabel: "직원 F", tenureMonths: 18 },
      { employeeLabel: "직원 B", tenureMonths: 14 },
    ],
  );
});

test("labels the direction guide without turning it into a benchmark", () => {
  assert.doesNotMatch(
    FOUNDER_COPY["screen.evidence.trend.guide_label"],
    /정상|통상|시장|기대|권장|적정|회사 기준/,
  );
  assert.match(
    FOUNDER_COPY["screen.evidence.trend.guide_non_claim"],
    /시장 평균이나 권장 연봉, 회사의 연봉 기준이 아닙니다/,
  );
});

test("four-screen visible copy uses no actor-specific or tenure-category labels", () => {
  for (const value of Object.values(FOUNDER_COPY)) {
    assert.doesNotMatch(value, /대표님|장기 근속|최근 입사|오래 근무/);
  }

  const files = [
    "../../src/features/session-introduction/SessionIntroductionScreen.tsx",
    "../../src/features/confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx",
    "../../src/features/confirmed-pay-differences/SalaryDistribution.tsx",
    "../../src/features/company-rule/CompanyRuleScreen.tsx",
    "../../src/features/session-result/SessionResultScreen.tsx",
    "../../src/features/decision-room/DecisionRoomApp.tsx",
    "../../src/features/decision-room/decisionRoomViewModel.ts",
  ];
  for (const relativePath of files) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    assert.doesNotMatch(source, /["'`]([^"'`]|\\.)*(대표님|장기 근속|최근 입사|오래 근무)/);
  }
});
