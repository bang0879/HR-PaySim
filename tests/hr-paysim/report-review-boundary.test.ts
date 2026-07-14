import assert from "node:assert/strict";
import test from "node:test";
import type { InterpretationClaim } from "../../src/lib/hr-paysim/interpretation/types.ts";
import { buildSessionReport } from "../../src/lib/hr-paysim/report/buildSessionReport.ts";
import type { StructuralTheme } from "../../src/lib/hr-paysim/themes/types.ts";

const theme: StructuralTheme = {
  id: "theme-product",
  roleGroup: "Product Engineer",
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
const claim: InterpretationClaim = {
  id: "claim-product",
  themeId: theme.id,
  statements: [{
    id: "product-surface",
    kind: "SURFACE_OBSERVATION",
    copyKey: "copy.product-surface",
    claimStatus: "SUPPORTED_BY_CLIENT_DATA",
    triggerEvidenceIds: [],
    reviewDependencyIds: [theme.id],
    sourceRefs: [],
    mustNotClaimKeys: [],
  }],
  founderQuestion: { copyKey: "question.product", supportingStatementIds: ["product-surface"] },
};

test("drops dependent report content when the current theme review is missing", () => {
  const report = buildSessionReport({
    themes: [theme],
    reviews: {},
    validatedClaims: [claim],
    repeatResults: {},
    decisions: [{
      id: "decision-product",
      themeIds: [theme.id],
      actionKey: "collect_evidence",
      ownerRole: "HR",
      dueEvent: "WITHIN_TWO_WEEKS",
      status: "draft",
    }],
    followUps: [{
      id: "follow-product",
      themeId: theme.id,
      evidenceNeeded: "offer_record",
      ownerRole: "HR",
      dueEvent: "WITHIN_TWO_WEEKS",
    }],
    unselectedSubjects: [],
  });

  assert.deepEqual(report.reviewedSubjects, []);
  assert.deepEqual(report.confirmedResults, []);
  assert.deepEqual(report.decisions, []);
  assert.deepEqual(report.followUps, []);
});
