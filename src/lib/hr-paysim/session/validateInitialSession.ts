import { buildSessionReport } from "../report/buildSessionReport.ts";
import { createThemeReview, updateThemeReview } from "../review/updateThemeReview.ts";
import type { ThemeReview } from "../review/types.ts";
import {
  clonePlainData,
  hasOnlyKeys,
  isKnownScreen,
  isRecord,
  parseReviewUpdate,
  parseStartSessionAction,
  plainDataEqual,
  resolveCanonicalClaims,
  resolveCanonicalDecision,
  resolveCanonicalRepeat,
} from "./runtimeValidation.ts";
import { isPlainDataArray, ownDataValue } from "./safePlainData.ts";
import type { DecisionRoomScreen, DecisionRoomSessionState } from "./types.ts";

const stateKeys = [
  "mode", "screen", "rows", "themes", "selection", "activeThemeId", "reviews",
  "interpretations", "repeats", "decisions", "report",
] as const;
const requiredStateKeys = [
  "mode", "screen", "rows", "themes", "selection", "reviews", "interpretations",
  "repeats", "decisions",
] as const;

export function resolveCanonicalInitialSession(
  value: unknown,
): DecisionRoomSessionState | undefined {
  if (!isRecord(value) || !hasOnlyKeys(value, stateKeys, requiredStateKeys)) return undefined;
  if (!isKnownScreen(value.screen)) return undefined;
  const start = parseStartSessionAction({
    type: "START_SESSION",
    mode: value.mode,
    rows: value.rows,
    themes: value.themes,
    selection: value.selection,
    ...(Object.hasOwn(value, "activeThemeId") ? { activeThemeId: value.activeThemeId } : {}),
  });
  if (!start || !isRecord(value.reviews) || !isRecord(value.interpretations)
    || !isRecord(value.repeats) || !isPlainDataArray(value.decisions)) return undefined;

  const reviews = canonicalReviews(value.reviews, start);
  if (!reviews) return undefined;
  const base: DecisionRoomSessionState = {
    mode: start.mode,
    screen: value.screen as DecisionRoomScreen,
    rows: start.rows,
    themes: start.themes,
    selection: start.selection,
    ...(start.activeThemeId ? { activeThemeId: start.activeThemeId } : {}),
    reviews,
    interpretations: {},
    repeats: {},
    decisions: [],
  };

  const claimValues = Object.keys(value.interpretations)
    .map((key) => ownDataValue(value.interpretations as Record<string, unknown>, key));
  const claims = resolveCanonicalClaims(claimValues, base);
  if (!claims) return undefined;
  const interpretations = Object.fromEntries(claims.map((claim) => [claim.themeId, claim]));
  if (!plainDataEqual(value.interpretations, interpretations)) return undefined;
  base.interpretations = interpretations;

  const repeats: DecisionRoomSessionState["repeats"] = {};
  for (const key of Object.keys(value.repeats)) {
    const repeat = resolveCanonicalRepeat(
      ownDataValue(value.repeats as Record<string, unknown>, key),
      base,
    );
    if (!repeat || repeat.themeId !== key) return undefined;
    repeats[key] = repeat;
  }
  if (!plainDataEqual(value.repeats, repeats)) return undefined;
  base.repeats = repeats;

  const decisions = value.decisions.map((item) => resolveCanonicalDecision(item, base));
  if (decisions.some((item) => item === undefined)) return undefined;
  base.decisions = decisions.filter((item) => item !== undefined)
    .sort((a, b) => compareCodeUnits(a.id, b.id));
  if (!plainDataEqual(value.decisions, base.decisions)) return undefined;

  if (Object.hasOwn(value, "report") && value.report !== undefined) {
    const report = buildSessionReport({
      themes: base.themes,
      reviews: base.reviews,
      validatedClaims: Object.values(base.interpretations),
      repeatResults: base.repeats,
      decisions: base.decisions,
      followUps: Object.values(base.reviews).flatMap((review) => (
        review.evidenceFollowUp ? [review.evidenceFollowUp] : []
      )),
      unselectedSubjects: base.selection.unselected,
    });
    if (!plainDataEqual(value.report, report)) return undefined;
    base.report = report;
  }
  return clonePlainData(base);
}

function canonicalReviews(
  value: Record<string, unknown>,
  start: Pick<DecisionRoomSessionState, "themes" | "selection">,
): Record<string, ThemeReview> | undefined {
  const validIds = new Set(start.themes.map((theme) => theme.id));
  const selectedIds = new Set(start.selection.selected.map((theme) => theme.id));
  const reviews: Record<string, ThemeReview> = {};
  for (const themeId of Object.keys(value)) {
    const supplied = ownDataValue(value, themeId);
    if (!validIds.has(themeId) || !selectedIds.has(themeId) || !isRecord(supplied)) return undefined;
    if (!hasOnlyKeys(
      supplied,
      ["themeId", "explanationBasis", "evidenceStatus", "repeatabilityStatus", "outcome", "approvedSentenceKey", "evidenceFollowUp"],
      ["themeId", "explanationBasis", "evidenceStatus", "repeatabilityStatus", "outcome"],
    )) return undefined;
    if (supplied.themeId !== themeId) return undefined;
    const patch = parseReviewUpdate({
      explanationBasis: supplied.explanationBasis,
      evidenceStatus: supplied.evidenceStatus,
      repeatabilityStatus: supplied.repeatabilityStatus,
      ...(Object.hasOwn(supplied, "evidenceFollowUp")
        ? { evidenceFollowUp: supplied.evidenceFollowUp }
        : {}),
    }, themeId);
    if (!patch) return undefined;
    const canonical = updateThemeReview({ review: createThemeReview(themeId) }, patch).review;
    if (!plainDataEqual(supplied, canonical)) return undefined;
    reviews[themeId] = canonical;
  }
  return reviews;
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
