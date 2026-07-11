import assert from "node:assert/strict";
import test from "node:test";
import type { ReviewDependencyState } from "../../src/lib/hr-paysim/review/types.ts";
import {
  createThemeReview,
  updateThemeReview,
} from "../../src/lib/hr-paysim/review/updateThemeReview.ts";

test("creates a review with every founder answer explicitly unanswered", () => {
  assert.deepEqual(createThemeReview("theme-product"), {
    themeId: "theme-product",
    explanationBasis: "unanswered",
    evidenceStatus: "unanswered",
    repeatabilityStatus: "unanswered",
    outcome: "unanswered",
  });
});

test("keeps unanswered, founder cannot explain, and insufficient data distinct", () => {
  const initial: ReviewDependencyState = { review: createThemeReview("theme-product") };

  const cannotExplain = updateThemeReview(initial, {
    explanationBasis: "founder_cannot_explain",
  });
  const insufficientData = updateThemeReview(initial, {
    evidenceStatus: "insufficient_data",
  });

  assert.equal(initial.review.outcome, "unanswered");
  assert.equal(cannotExplain.review.outcome, "founder_cannot_explain");
  assert.equal(insufficientData.review.outcome, "insufficient_data");
});

test("derives evidence outcomes and lets a one-time exception win after answers", () => {
  const initial: ReviewDependencyState = { review: createThemeReview("theme-product") };
  const explained = updateThemeReview(initial, {
    explanationBasis: "market_hiring_additional_pay",
    evidenceStatus: "documented",
  });
  const observable = updateThemeReview(initial, {
    explanationBasis: "role_responsibility_difference",
    evidenceStatus: "observable",
  });
  const asserted = updateThemeReview(initial, {
    explanationBasis: "performance_or_scarce_skill",
    evidenceStatus: "leader_assertion_only",
  });
  const oneTime = updateThemeReview(explained, {
    repeatabilityStatus: "one_time_exception",
  });

  assert.equal(explained.review.outcome, "explained_with_evidence");
  assert.equal(observable.review.outcome, "explained_with_evidence");
  assert.equal(asserted.review.outcome, "explained_without_documentation");
  assert.equal(oneTime.review.outcome, "one_time_exception");
});

test("clears repeat and decision dependencies only when explanation or evidence changes", () => {
  const state: ReviewDependencyState = {
    review: updateThemeReview(
      { review: createThemeReview("theme-product") },
      {
        explanationBasis: "market_hiring_additional_pay",
        evidenceStatus: "documented",
        repeatabilityStatus: "reusable_rule",
      },
    ).review,
    repeatResult: { themeId: "theme-product", status: "ready" },
    decision: { themeId: "theme-product", status: "approved" },
  };

  const repeatabilityOnly = updateThemeReview(state, {
    repeatabilityStatus: "conditional_rule",
  });
  const sameEvidence = updateThemeReview(state, { evidenceStatus: "documented" });
  const changedExplanation = updateThemeReview(state, {
    explanationBasis: "retention_exception",
  });
  const changedEvidence = updateThemeReview(state, {
    evidenceStatus: "leader_assertion_only",
  });

  assert.deepEqual(repeatabilityOnly.repeatResult, state.repeatResult);
  assert.deepEqual(repeatabilityOnly.decision, state.decision);
  assert.deepEqual(sameEvidence.repeatResult, state.repeatResult);
  assert.deepEqual(sameEvidence.decision, state.decision);
  assert.equal(changedExplanation.repeatResult, undefined);
  assert.equal(changedExplanation.decision, undefined);
  assert.equal(changedEvidence.repeatResult, undefined);
  assert.equal(changedEvidence.decision, undefined);
});

test("serializes only enum-backed review state without roster salary or free text", () => {
  const state = updateThemeReview(
    { review: createThemeReview("theme-product") },
    {
      explanationBasis: "timing_context",
      evidenceStatus: "leader_assertion_only",
      repeatabilityStatus: "not_reusable",
      evidenceFollowUp: {
        id: "follow-up-product",
        themeId: "theme-product",
        evidenceNeeded: "offer_record",
        ownerRole: "HR",
        dueEvent: "WITHIN_TWO_WEEKS",
      },
    },
  );

  assert.equal(state.review.approvedSentenceKey, "timing_context");
  assert.equal(JSON.stringify(state).includes("baseSalaryKRW"), false);
  assert.equal(JSON.stringify(state).includes("freeText"), false);
});
