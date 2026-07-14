import type { InterpretationClaim } from "./types.ts";

const PRODUCT_THEME_ID =
  "product_engineer_emergent_structure_row_001_row_002_row_003_row_004_row_005_row_006";
const PLATFORM_THEME_ID =
  "platform_engineer_emergent_structure_row_007_row_008_row_009_row_010";
const GTM_THEME_ID = "gtm_level_fiction_band_overlap_theme";

export const INTERPRETATION_CLAIM_REGISTRY: InterpretationClaim[] = [
  {
    id: "product-engineer-pay-difference",
    themeId: PRODUCT_THEME_ID,
    statements: [
      clientObservation(
        "product-engineer-salary-observation",
        "interpretation.product_engineer.salary_observation",
        PRODUCT_THEME_ID,
        ["product_engineer_pay_inversion", "product_engineer_loyalty_tax"],
      ),
      workingHypothesis(
        "product-engineer-hiring-practice-hypothesis",
        "interpretation.product_engineer.hiring_practice_hypothesis",
        PRODUCT_THEME_ID,
        ["product_engineer_pay_inversion", "product_engineer_loyalty_tax"],
      ),
    ],
    founderQuestion: {
      copyKey: "interpretation.product_engineer.founder_question",
      supportingStatementIds: [
        "product-engineer-salary-observation",
        "product-engineer-hiring-practice-hypothesis",
      ],
    },
  },
  {
    id: "platform-engineer-pay-difference",
    themeId: PLATFORM_THEME_ID,
    statements: [
      clientObservation(
        "platform-engineer-salary-observation",
        "interpretation.platform_engineer.salary_observation",
        PLATFORM_THEME_ID,
        ["platform_engineer_pay_inversion", "platform_engineer_loyalty_tax"],
      ),
      workingHypothesis(
        "platform-engineer-hiring-practice-hypothesis",
        "interpretation.platform_engineer.hiring_practice_hypothesis",
        PLATFORM_THEME_ID,
        ["platform_engineer_pay_inversion", "platform_engineer_loyalty_tax"],
      ),
    ],
    founderQuestion: {
      copyKey: "interpretation.platform_engineer.founder_question",
      supportingStatementIds: [
        "platform-engineer-salary-observation",
        "platform-engineer-hiring-practice-hypothesis",
      ],
    },
  },
  {
    id: "gtm-level-order-difference",
    themeId: GTM_THEME_ID,
    statements: [
      clientObservation(
        "gtm-level-order-observation",
        "interpretation.gtm.level_order_observation",
        GTM_THEME_ID,
        ["gtm_level_fiction_band_overlap"],
      ),
      workingHypothesis(
        "gtm-level-criteria-hypothesis",
        "interpretation.gtm.level_criteria_hypothesis",
        GTM_THEME_ID,
        ["gtm_level_fiction_band_overlap"],
      ),
    ],
    founderQuestion: {
      copyKey: "interpretation.gtm.founder_question",
      supportingStatementIds: [
        "gtm-level-order-observation",
        "gtm-level-criteria-hypothesis",
      ],
    },
  },
];

function clientObservation(
  id: string,
  copyKey: string,
  themeId: string,
  evidenceIds: string[],
): InterpretationClaim["statements"][number] {
  return {
    id,
    kind: "SURFACE_OBSERVATION",
    copyKey,
    claimStatus: "SUPPORTED_BY_CLIENT_DATA",
    triggerEvidenceIds: evidenceIds,
    reviewDependencyIds: [themeId],
    sourceRefs: [{
      kind: "CLIENT_DATA",
      evidenceIds,
      reviewedStateIds: [themeId],
    }],
    mustNotClaimKeys: ["employee_intent", "unfairness", "confirmed_cause"],
  };
}

function workingHypothesis(
  id: string,
  copyKey: string,
  themeId: string,
  triggerEvidenceIds: string[],
): InterpretationClaim["statements"][number] {
  return {
    id,
    kind: "DEEPER_MECHANISM",
    copyKey,
    claimStatus: "WORKING_HYPOTHESIS",
    triggerEvidenceIds,
    reviewDependencyIds: [themeId],
    sourceRefs: [],
    mustNotClaimKeys: ["confirmed_cause", "employee_intent", "approved_policy"],
  };
}
