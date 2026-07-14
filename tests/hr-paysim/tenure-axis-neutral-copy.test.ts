import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  FOUNDER_COPY,
  formatProductEngineerEvidenceSupporting,
  formatProductEngineerEvidenceTitle,
} from "../../src/lib/hr-paysim/copy/founderCopy.ts";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";
import { createDecisionRoomViewModel } from "../../src/features/decision-room/decisionRoomViewModel.ts";

test("describes the highlighted pair with related career before company tenure", () => {
  assert.equal(
    formatProductEngineerEvidenceTitle({
      employeeCount: 6,
      lowerPaidLabel: "직원 A",
      lowerPaidRelevantExperienceMonths: 120,
      lowerPaidTenureMonths: 64,
      higherPaidLabel: "직원 B",
      higherPaidRelevantExperienceMonths: 84,
      higherPaidTenureMonths: 14,
      headlineGapKRW: 27_000_000,
    }),
    "Product Engineer 6명 중 관련 경력 10년·회사 근속 64개월인 직원 A와 관련 경력 7년·회사 근속 14개월인 직원 B의 기본 연봉은 2,700만원 차이 납니다.",
  );
  assert.equal(
    formatProductEngineerEvidenceSupporting({
      employeeCount: 6,
      lowerPaidLabel: "직원 A",
      higherPaidLabel: "직원 B",
    }),
    "직원 6명의 기본 연봉을 관련 경력과 함께 비교하고, 회사 근속과 채용 예외 기록을 보조 근거로 확인했습니다. 현재 자료만으로는 직원 A와 직원 B의 차이를 일관되게 설명할 회사 기준이나 기록을 확인하기 어렵습니다.",
  );
});

test("exposes related career before company tenure for every synthetic Product Engineer", () => {
  const model = createDecisionRoomViewModel(createSyntheticDemoSession());
  assert.deepEqual(
    model.evidence.distribution.map(({ employeeLabel, relevantExperienceMonths, tenureMonths }) => ({
      employeeLabel,
      relevantExperienceMonths,
      tenureMonths,
    })),
    [
      { employeeLabel: "직원 A", relevantExperienceMonths: 120, tenureMonths: 64 },
      { employeeLabel: "직원 C", relevantExperienceMonths: 108, tenureMonths: 56 },
      { employeeLabel: "직원 D", relevantExperienceMonths: 96, tenureMonths: 48 },
      { employeeLabel: "직원 E", relevantExperienceMonths: 76, tenureMonths: 22 },
      { employeeLabel: "직원 F", relevantExperienceMonths: 80, tenureMonths: 18 },
      { employeeLabel: "직원 B", relevantExperienceMonths: 84, tenureMonths: 14 },
    ],
  );
});

test("removes the fixed direction guide and benchmark-like interpretation", () => {
  const copy = FOUNDER_COPY as Record<string, string>;
  assert.equal(copy["screen.evidence.trend.guide_label"], undefined);
  assert.equal(copy["screen.evidence.trend.guide_non_claim"], undefined);
  const distribution = readFileSync(
    new URL("../../src/features/confirmed-pay-differences/SalaryDistribution.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(distribution, /directionGuide|dr-direction-guide-line|is-guide/);
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
