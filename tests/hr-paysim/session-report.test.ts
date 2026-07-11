import assert from "node:assert/strict";
import test from "node:test";
import type { InterpretationClaim } from "../../src/lib/hr-paysim/interpretation/types.ts";
import type { PrecedentRepeatResult } from "../../src/lib/hr-paysim/repeat/types.ts";
import type { ThemeReview } from "../../src/lib/hr-paysim/review/types.ts";
import { buildSessionReport } from "../../src/lib/hr-paysim/report/buildSessionReport.ts";
import type { BuildSessionReportInput } from "../../src/lib/hr-paysim/report/types.ts";
import type { StructuralTheme } from "../../src/lib/hr-paysim/themes/types.ts";

const product = minimalTheme("theme-product", "Product Engineer");
const platform = minimalTheme("theme-platform", "Platform Engineer");
const stale = minimalTheme("theme-stale", "Stale");
const productReview = reviewFor(product.id);
const platformReview = reviewFor(platform.id);

test("includes reviewed decisions and an unselected-subject appendix without inferred prose", () => {
  const report = buildSessionReport(baseInput());

  assert.deepEqual(report.decisions, [{
    id: "decision-product",
    themeIds: [product.id],
    actionKey: "define_hiring_additional_pay",
    ownerRole: "CEO_AND_HR",
    dueEvent: "BEFORE_NEXT_OFFER",
    status: "approved",
  }]);
  assert.deepEqual(report.unselectedSubjectAppendix, [{
    themeId: platform.id,
    roleGroup: "Platform Engineer",
  }]);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes("generatedProse"), false);
  assert.equal(serialized.includes("recommend"), false);
  assert.equal(serialized.includes("syntheticRow"), false);
  assert.equal(serialized.includes("row_001"), false);
});

test("ignores stale claim, repeat, decision, follow-up, and appendix references fail-closed", () => {
  const input = baseInput();
  input.validatedClaims.push(claimFor(stale.id, "stale-statement"));
  input.repeatResults[stale.id] = repeatFor(stale.id);
  input.decisions.push({
    id: "decision-stale",
    themeIds: [stale.id],
    actionKey: "collect_evidence",
    ownerRole: "HR",
    dueEvent: "WITHIN_TWO_WEEKS",
    status: "draft",
  });
  input.followUps.push({
    id: "follow-stale",
    themeId: stale.id,
    evidenceNeeded: "offer_record",
    ownerRole: "HR",
    dueEvent: "WITHIN_TWO_WEEKS",
  });
  input.unselectedSubjects.push(stale);

  const serialized = JSON.stringify(buildSessionReport(input));

  assert.equal(serialized.includes("theme-stale"), false);
  assert.equal(serialized.includes("stale-statement"), false);
  assert.equal(serialized.includes("decision-stale"), false);
  assert.equal(serialized.includes("follow-stale"), false);
});

test("is pure and deterministic across reversed input order", () => {
  const canonical = baseInput();
  const snapshot = structuredClone(canonical);
  const reversed: BuildSessionReportInput = {
    ...canonical,
    themes: [...canonical.themes].reverse(),
    validatedClaims: [...canonical.validatedClaims].reverse(),
    decisions: [...canonical.decisions].reverse(),
    followUps: [...canonical.followUps].reverse(),
    unselectedSubjects: [...canonical.unselectedSubjects].reverse(),
    reviews: Object.fromEntries(Object.entries(canonical.reviews).reverse()),
    repeatResults: Object.fromEntries(Object.entries(canonical.repeatResults).reverse()),
  };

  assert.deepEqual(buildSessionReport(reversed), buildSessionReport(canonical));
  assert.deepEqual(canonical, snapshot);
});

function baseInput(): BuildSessionReportInput {
  return {
    themes: [product, platform],
    reviews: { [platform.id]: platformReview, [product.id]: productReview },
    validatedClaims: [claimFor(platform.id, "platform-surface"), claimFor(product.id, "product-surface")],
    repeatResults: { [product.id]: repeatFor(product.id) },
    decisions: [{
      id: "decision-product",
      themeIds: [product.id],
      actionKey: "define_hiring_additional_pay",
      ownerRole: "CEO_AND_HR",
      dueEvent: "BEFORE_NEXT_OFFER",
      status: "approved",
    }],
    followUps: [{
      id: "follow-product",
      themeId: product.id,
      evidenceNeeded: "offer_record",
      ownerRole: "HR",
      dueEvent: "WITHIN_TWO_WEEKS",
    }],
    unselectedSubjects: [platform],
  };
}

function claimFor(themeId: string, statementId: string): InterpretationClaim {
  return {
    id: `claim-${themeId}`,
    themeId,
    statements: [{
      id: statementId,
      kind: "SURFACE_OBSERVATION",
      copyKey: `copy.${statementId}`,
      claimStatus: "SUPPORTED_BY_CLIENT_DATA",
      triggerEvidenceIds: [],
      reviewDependencyIds: [themeId],
      sourceRefs: [],
      mustNotClaimKeys: [],
    }],
    founderQuestion: { copyKey: `question.${themeId}`, supportingStatementIds: [statementId] },
  };
}

function repeatFor(themeId: string): PrecedentRepeatResult {
  return {
    themeId,
    syntheticRow: {
      rowId: "synthetic",
      roleGroup: "Product Engineer",
      baseSalaryKRW: 95_000_000,
      tenureMonths: 0,
    },
    currentRosterPairCount: 10,
    baselineCandidatePairCount: 3,
    repeatedCandidatePairCount: 3,
    combinedPairCount: 13,
    maximumGapKRW: 27_000_000,
    affectedRowIds: ["row_001"],
    conclusionKey: "product_engineer_observed_hiring_repeat",
    nonClaimKey: "observed_precedent_not_policy",
  };
}

function reviewFor(themeId: string): ThemeReview {
  return {
    themeId,
    explanationBasis: "market_hiring_additional_pay",
    evidenceStatus: "documented",
    repeatabilityStatus: "conditional_rule",
    outcome: "explained_with_evidence",
    approvedSentenceKey: "market_hiring_additional_pay",
  };
}

function minimalTheme(id: string, roleGroup: string): StructuralTheme {
  return {
    id,
    roleGroup,
    archetype: "isolated_relationship",
    dataStatus: "sufficient",
    patternKind: "isolated",
    findingIds: [],
    comparisonPairs: [],
    affectedRowIds: [],
    supportingObservations: [],
    metrics: { nonClaim: "not a recommendation" },
    normalizedHeadlineGap: 0,
  };
}
