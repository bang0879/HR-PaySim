import type {
  EvidenceFollowUp,
  ReviewDependencyState,
  ReviewOutcome,
  ThemeReview,
} from "./types.ts";

export type ThemeReviewUpdate = Partial<Pick<
  ThemeReview,
  "explanationBasis" | "evidenceStatus" | "repeatabilityStatus"
>> & {
  evidenceFollowUp?: EvidenceFollowUp;
};

export function createThemeReview(themeId: string): ThemeReview {
  return {
    themeId,
    explanationBasis: "unanswered",
    evidenceStatus: "unanswered",
    repeatabilityStatus: "unanswered",
    outcome: "unanswered",
  };
}

export function updateThemeReview(
  state: ReviewDependencyState,
  update: ThemeReviewUpdate,
): ReviewDependencyState {
  const nextAnswers = {
    ...state.review,
    ...update,
  };
  const approvedSentenceKey = nextAnswers.explanationBasis === "unanswered"
    ? undefined
    : nextAnswers.explanationBasis;
  const review: ThemeReview = {
    ...nextAnswers,
    outcome: deriveReviewOutcome(nextAnswers),
    ...(approvedSentenceKey ? { approvedSentenceKey } : {}),
  };
  if (approvedSentenceKey === undefined) delete review.approvedSentenceKey;

  const invalidatesDependencies = review.explanationBasis !== state.review.explanationBasis
    || review.evidenceStatus !== state.review.evidenceStatus;

  return invalidatesDependencies
    ? { review }
    : {
      review,
      ...(state.repeatResult ? { repeatResult: state.repeatResult } : {}),
      ...(state.decision ? { decision: state.decision } : {}),
    };
}

function deriveReviewOutcome(
  review: Pick<ThemeReview, "explanationBasis" | "evidenceStatus" | "repeatabilityStatus">,
): ReviewOutcome {
  if (review.explanationBasis === "founder_cannot_explain") {
    return "founder_cannot_explain";
  }
  if (
    review.evidenceStatus === "insufficient_data"
    || review.repeatabilityStatus === "insufficient_data"
  ) {
    return "insufficient_data";
  }
  if (review.explanationBasis === "unanswered" || review.evidenceStatus === "unanswered") {
    return "unanswered";
  }
  if (review.repeatabilityStatus === "one_time_exception") {
    return "one_time_exception";
  }
  if (review.evidenceStatus === "documented" || review.evidenceStatus === "observable") {
    return "explained_with_evidence";
  }
  return "explained_without_documentation";
}
