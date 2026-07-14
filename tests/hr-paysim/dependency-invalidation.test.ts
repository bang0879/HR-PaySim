import assert from "node:assert/strict";
import test from "node:test";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";
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
  const productThemeId = populated.activeThemeId!;
  const changed = decisionRoomReducer(populated, {
    type: "UPDATE_REVIEW",
    themeId: productThemeId,
    patch: {
      explanationBasis: "timing_context",
      evidenceStatus: "leader_assertion_only",
    },
  });

  assert.equal(changed.interpretations[productThemeId], undefined);
  assert.equal(changed.repeats[productThemeId], undefined);
  assert.equal(changed.decisions.some((item) => item.themeIds.includes(productThemeId)), false);
  assert.equal(changed.report, undefined);
  assert.equal(changed.reviews[productThemeId]?.explanationBasis, "timing_context");
  assert.equal(changed.reviews[productThemeId]?.evidenceStatus, "leader_assertion_only");
  assert.doesNotMatch(
    JSON.stringify({
      interpretation: changed.interpretations[productThemeId],
      repeat: changed.repeats[productThemeId],
      decisions: changed.decisions.filter((item) => item.themeIds.includes(productThemeId)),
      report: changed.report,
    }),
    /product\.premium_hypothesis|observed_precedent_not_policy|define_hiring_additional_pay|product\.export_copy/,
  );
});

test("invalidation removes only the changed theme while clearing the shared report", () => {
  const populated = fixtureSession();
  const productThemeId = populated.activeThemeId!;
  const platformThemeId = populated.selection.selected.find(
    (theme) => theme.roleGroup === "Platform Engineer",
  )!.id;
  const changed = invalidateThemeDerivations(populated, productThemeId);

  assert.ok(changed.interpretations[platformThemeId]);
  assert.ok(changed.repeats[platformThemeId]);
  assert.equal(changed.decisions.some((item) => item.id === "decision-platform"), true);
  assert.equal(changed.report, undefined);
});

test("changing repeatability alone keeps already validated derivatives", () => {
  const populated = fixtureSession();
  const productThemeId = populated.activeThemeId!;
  const changed = decisionRoomReducer(populated, {
    type: "UPDATE_REVIEW",
    themeId: productThemeId,
    patch: { repeatabilityStatus: "one_time_exception" },
  });

  assert.ok(changed.interpretations[productThemeId]);
  assert.ok(changed.repeats[productThemeId]);
  assert.equal(changed.decisions.some((item) => item.id === "decision-product"), true);
  assert.ok(changed.report);
});

function fixtureSession(): DecisionRoomSessionState {
  const demo = createSyntheticDemoSession();
  const productThemeId = demo.activeThemeId!;
  const platformThemeId = demo.selection.selected.find(
    (theme) => theme.roleGroup === "Platform Engineer",
  )!.id;
  const productClaim = claim(productThemeId, "product.premium_hypothesis");
  const platformClaim = claim(platformThemeId, "platform.salary_fact");
  const productRepeat = structuredClone(demo.repeats[productThemeId]!);
  const platformRepeat = repeat(platformThemeId, "row-platform");
  const decisions: DecisionRecord[] = [
    decision("decision-product", productThemeId, "define_hiring_additional_pay"),
    decision("decision-platform", platformThemeId, "collect_evidence"),
  ];
  const report: SessionReport = {
    reviewedSubjects: [],
    confirmedResults: [{
      themeId: productThemeId,
      statementId: "product-statement",
      copyKey: "product.export_copy",
    }],
    decisions,
    followUps: [],
    unselectedSubjectAppendix: [],
  };

  return {
    ...demo,
    screen: "company_rule",
    reviews: {
      [productThemeId]: demo.reviews[productThemeId]!,
      [platformThemeId]: {
        themeId: platformThemeId,
        explanationBasis: "timing_context",
        evidenceStatus: "observable",
        repeatabilityStatus: "unanswered",
        outcome: "explained_with_evidence",
        approvedSentenceKey: "timing_context",
      },
    },
    interpretations: {
      [productThemeId]: productClaim,
      [platformThemeId]: platformClaim,
    },
    repeats: {
      [productThemeId]: productRepeat,
      [platformThemeId]: platformRepeat,
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
    syntheticRow: { rowId, roleGroup: "Platform Engineer", baseSalaryKRW: 95_000_000 },
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
