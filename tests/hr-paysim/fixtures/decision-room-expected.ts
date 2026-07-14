export const DECISION_ROOM_EXPECTED = {
  sample: {
    rawFindingCount: 7,
    visibleSubjectCount: 3,
    duplicateHeadlinePairCount: 0,
    selectedRoleGroups: ["Product Engineer", "Platform Engineer", "GTM"],
    cleanRoleGroups: ["Designer"],
  },
  gtm: {
    headlineGapKRW: 4_000_000,
    pairRepairFloorKRW: 4_000_000,
    systemRepairFloorKRW: 5_000_000,
    adjustments: [
      { rowId: "row_012", adjustmentKRW: 4_000_000 },
      { rowId: "row_014", adjustmentKRW: 1_000_000 },
    ],
  },
  productRepeat: {
    eligible: ["row_004", "row_005"],
    selected: "row_004",
    referenceRows: ["row_006"],
    referenceSalaryKRW: 88_000_000,
    repeatedSalaryKRW: 95_000_000,
    premiumKRW: 7_000_000,
    currentPairs: 10,
    baselineCandidatePairs: 3,
    repeatedCandidatePairs: 3,
    combinedPairs: 13,
    maximumGapKRW: 27_000_000,
    affected: ["row_001", "row_002", "row_003"],
  },
  selection: {
    maximum: 3,
    unselectedLabel: "이번 세션에서 검토하지 않은 항목",
  },
  demo: {
    screens: [
      "introduction",
      "confirmed_pay_differences",
      "company_rule",
      "session_result",
    ],
    clicks: 3,
    expanded: "Product Engineer",
    collapsed: ["Platform Engineer", "GTM"],
    sampleLabel: "샘플로 입력된 내용",
  },
} as const;
