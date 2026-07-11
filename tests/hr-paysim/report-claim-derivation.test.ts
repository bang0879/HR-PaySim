import assert from "node:assert/strict";
import test from "node:test";
import type { InterpretationClaim } from "../../src/lib/hr-paysim/interpretation/types.ts";
import { buildSessionReport } from "../../src/lib/hr-paysim/report/buildSessionReport.ts";
import type { StructuralTheme } from "../../src/lib/hr-paysim/themes/types.ts";
import type { ThemeReview } from "../../src/lib/hr-paysim/review/types.ts";

const theme = minimalTheme("theme-product", "Product Engineer");
const review: ThemeReview = {
  themeId: theme.id,
  explanationBasis: "market_hiring_additional_pay",
  evidenceStatus: "documented",
  repeatabilityStatus: "conditional_rule",
  outcome: "explained_with_evidence",
  approvedSentenceKey: "market_hiring_additional_pay",
};
const claim: InterpretationClaim = {
  id: "claim-product",
  themeId: theme.id,
  statements: [
    statement("client-surface", "SUPPORTED_BY_CLIENT_DATA", "SURFACE_OBSERVATION"),
    statement("client-mechanism", "SUPPORTED_BY_CLIENT_DATA", "DEEPER_MECHANISM"),
    statement("external-surface", "VERIFIED_EXTERNAL", "SURFACE_OBSERVATION"),
    statement("kyle-surface", "KYLE_EXPERIENCE_BASED", "SURFACE_OBSERVATION"),
    statement("working-hypothesis", "WORKING_HYPOTHESIS", "DEEPER_MECHANISM"),
    statement("unsupported", "UNSUPPORTED_DO_NOT_USE", "SURFACE_OBSERVATION"),
  ],
  founderQuestion: { copyKey: "question.product", supportingStatementIds: [] },
};

test("confirmed results contain only client-data surface observations", () => {
  const report = buildSessionReport({
    themes: [theme],
    reviews: { [theme.id]: review },
    validatedClaims: [claim],
    repeatResults: {},
    decisions: [],
    followUps: [{
      id: "follow-product",
      themeId: theme.id,
      evidenceNeeded: "offer_record",
      ownerRole: "HR",
      dueEvent: "WITHIN_TWO_WEEKS",
    }],
    unselectedSubjects: [],
  });

  assert.deepEqual(report.confirmedResults, [{
    themeId: theme.id,
    statementId: "client-surface",
    copyKey: "copy.client-surface",
  }]);
});

test("working hypotheses appear only inside an evidence follow-up", () => {
  const report = buildSessionReport({
    themes: [theme],
    reviews: { [theme.id]: review },
    validatedClaims: [claim],
    repeatResults: {},
    decisions: [],
    followUps: [{
      id: "follow-product",
      themeId: theme.id,
      evidenceNeeded: "offer_record",
      ownerRole: "HR",
      dueEvent: "WITHIN_TWO_WEEKS",
    }],
    unselectedSubjects: [],
  });

  assert.deepEqual(report.followUps[0]?.statementRefs, [{
    statementId: "working-hypothesis",
    copyKey: "copy.working-hypothesis",
  }]);
  assert.equal(JSON.stringify(report.confirmedResults).includes("working-hypothesis"), false);
});

test("Kyle-experience and unsupported statements never enter confirmed content", () => {
  const report = buildSessionReport({
    themes: [theme],
    reviews: { [theme.id]: review },
    validatedClaims: [claim],
    repeatResults: {},
    decisions: [],
    followUps: [],
    unselectedSubjects: [],
  });
  const confirmed = JSON.stringify(report.confirmedResults);

  assert.equal(confirmed.includes("kyle-surface"), false);
  assert.equal(confirmed.includes("unsupported"), false);
  assert.equal(report.followUps.length, 0);
});

function statement(
  id: string,
  claimStatus: InterpretationClaim["statements"][number]["claimStatus"],
  kind: InterpretationClaim["statements"][number]["kind"],
): InterpretationClaim["statements"][number] {
  return {
    id,
    kind,
    copyKey: `copy.${id}`,
    claimStatus,
    triggerEvidenceIds: [],
    reviewDependencyIds: [theme.id],
    sourceRefs: [],
    mustNotClaimKeys: [],
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
