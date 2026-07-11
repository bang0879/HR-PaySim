import assert from "node:assert/strict";
import test from "node:test";
import type { DecisionRecord } from "../../src/lib/hr-paysim/decisions/types.ts";
import type { InterpretationClaim } from "../../src/lib/hr-paysim/interpretation/types.ts";
import type { PrecedentRepeatResult } from "../../src/lib/hr-paysim/repeat/types.ts";
import type { SessionReport } from "../../src/lib/hr-paysim/report/types.ts";
import {
  decisionRoomReducer,
  invalidateThemeDerivations,
} from "../../src/lib/hr-paysim/session/decisionRoomReducer.ts";
import type { DecisionRoomSessionState } from "../../src/lib/hr-paysim/session/types.ts";

test("changing explanation or EvidenceStatus removes every stale derivative before render", () => {
  const populated = fixtureSession();
  const changed = decisionRoomReducer(populated, {
    type: "UPDATE_REVIEW",
    themeId: "theme-product",
    patch: {
      explanationBasis: "timing_context",
      evidenceStatus: "leader_assertion_only",
    },
  });

  assert.equal(changed.interpretations["theme-product"], undefined);
  assert.equal(changed.repeats["theme-product"], undefined);
  assert.equal(
    changed.decisions.some((item) => item.themeIds.includes("theme-product")),
    false,
  );
  assert.equal(changed.report, undefined);
  assert.equal(changed.reviews["theme-product"]?.explanationBasis, "timing_context");
  assert.equal(changed.reviews["theme-product"]?.evidenceStatus, "leader_assertion_only");
  assert.doesNotMatch(
    JSON.stringify(changed),
    /product\.premium_hypothesis|row-product|define_hiring_additional_pay/,
  );
});

test("invalidation removes only the changed theme while clearing the shared report", () => {
  const populated = fixtureSession();
  const changed = invalidateThemeDerivations(populated, "theme-product");

  assert.ok(changed.interpretations["theme-platform"]);
  assert.ok(changed.repeats["theme-platform"]);
  assert.equal(changed.decisions.map((item) => item.id).includes("decision-platform"), true);
  assert.equal(changed.report, undefined);
});

test("changing repeatability alone keeps already validated derivatives", () => {
  const populated = fixtureSession();
  const changed = decisionRoomReducer(populated, {
    type: "UPDATE_REVIEW",
    themeId: "theme-product",
    patch: { repeatabilityStatus: "one_time_exception" },
  });

  assert.ok(changed.interpretations["theme-product"]);
  assert.ok(changed.repeats["theme-product"]);
  assert.equal(changed.decisions.some((item) => item.id === "decision-product"), true);
  assert.ok(changed.report);
});

function fixtureSession(): DecisionRoomSessionState {
  const productClaim = claim("theme-product", "product.premium_hypothesis");
  const platformClaim = claim("theme-platform", "platform.salary_fact");
  const productRepeat = repeat("theme-product", "row-product");
  const platformRepeat = repeat("theme-platform", "row-platform");
  const decisions: DecisionRecord[] = [
    decision("decision-product", "theme-product", "define_hiring_additional_pay"),
    decision("decision-platform", "theme-platform", "collect_evidence"),
  ];
  const report: SessionReport = {
    reviewedSubjects: [],
    confirmedResults: [{
      themeId: "theme-product",
      statementId: "product-statement",
      copyKey: "product.export_copy",
    }],
    decisions,
    followUps: [],
    unselectedSubjectAppendix: [],
  };

  return {
    mode: "facilitated",
    screen: "company_rule",
    rows: [],
    themes: [],
    selection: {
      selected: [],
      unselected: [],
      recommendedIds: [],
      wasOverridden: false,
    },
    activeThemeId: "theme-product",
    reviews: {
      "theme-product": {
        themeId: "theme-product",
        explanationBasis: "market_hiring_additional_pay",
        evidenceStatus: "documented",
        repeatabilityStatus: "conditional_rule",
        outcome: "explained_with_evidence",
        approvedSentenceKey: "market_hiring_additional_pay",
      },
    },
    interpretations: {
      "theme-product": productClaim,
      "theme-platform": platformClaim,
    },
    repeats: {
      "theme-product": productRepeat,
      "theme-platform": platformRepeat,
    },
    decisions,
    report,
  };
}

function claim(themeId: string, copyKey: string): InterpretationClaim {
  return {
    id: `claim-${themeId}`,
    themeId,
    statements: [{
      id: `statement-${themeId}`,
      kind: "DEEPER_MECHANISM",
      copyKey,
      claimStatus: "WORKING_HYPOTHESIS",
      triggerEvidenceIds: [],
      reviewDependencyIds: [themeId],
      sourceRefs: [],
      mustNotClaimKeys: [],
    }],
    founderQuestion: { copyKey: `question-${themeId}`, supportingStatementIds: [] },
  };
}

function repeat(themeId: string, rowId: string): PrecedentRepeatResult {
  return {
    themeId,
    syntheticRow: { rowId, roleGroup: "Engineering", baseSalaryKRW: 95_000_000 },
    currentRosterPairCount: 1,
    baselineCandidatePairCount: 1,
    repeatedCandidatePairCount: 1,
    combinedPairCount: 2,
    maximumGapKRW: 10_000_000,
    affectedRowIds: [rowId],
    conclusionKey: "product_engineer_observed_hiring_repeat",
    nonClaimKey: "observed_precedent_not_policy",
  };
}

function decision(
  id: string,
  themeId: string,
  actionKey: DecisionRecord["actionKey"],
): DecisionRecord {
  return {
    id,
    themeIds: [themeId],
    actionKey,
    ownerRole: "CEO_AND_HR",
    dueEvent: "BEFORE_NEXT_OFFER",
    status: "approved",
  };
}
