import { createThemeReview, updateThemeReview } from "../review/updateThemeReview.ts";
import type { ReviewSubjectSelection } from "../themes/selectReviewSubjects.ts";
import {
  clonePlainData,
  hasOnlyKeys,
  isKnownScreen,
  isRecord,
  parseReviewUpdate,
  parseStartSessionAction,
  resolveCanonicalClaims,
  resolveCanonicalDecision,
  resolveCanonicalRepeat,
} from "./runtimeValidation.ts";
import type {
  DecisionRoomAction,
  DecisionRoomScreen,
  DecisionRoomSessionState,
} from "./types.ts";
import { resolveCanonicalInitialSession } from "./validateInitialSession.ts";

const screenOrder: DecisionRoomScreen[] = [
  "introduction",
  "confirmed_pay_differences",
  "company_rule",
  "session_result",
];

export function createEmptyDecisionRoomSession(
  mode: DecisionRoomSessionState["mode"] = "facilitated",
): DecisionRoomSessionState {
  return {
    mode,
    screen: "introduction",
    rows: [],
    themes: [],
    selection: emptySelection(),
    reviews: {},
    interpretations: {},
    repeats: {},
    decisions: [],
  };
}

export function initializeDecisionRoomSession(initialState: unknown): DecisionRoomSessionState {
  return resolveCanonicalInitialSession(initialState)
    ?? createEmptyDecisionRoomSession("facilitated");
}

export function invalidateThemeDerivations(
  state: DecisionRoomSessionState,
  themeId: string,
): DecisionRoomSessionState {
  const { [themeId]: _claim, ...interpretations } = state.interpretations;
  const { [themeId]: _repeat, ...repeats } = state.repeats;
  return {
    ...state,
    interpretations,
    repeats,
    decisions: state.decisions.filter((decision) => !decision.themeIds.includes(themeId)),
    report: undefined,
  };
}

export function decisionRoomReducer(
  state: DecisionRoomSessionState,
  action: DecisionRoomAction,
): DecisionRoomSessionState {
  const runtimeAction: unknown = action;
  if (
    !isRecord(runtimeAction)
    || !Object.hasOwn(runtimeAction, "type")
    || typeof runtimeAction.type !== "string"
  ) return state;

  if (runtimeAction.type === "START_SESSION") {
    const parsed = parseStartSessionAction(runtimeAction);
    if (!parsed) return state;
    const activeThemeId = parsed.activeThemeId ?? parsed.selection.selected[0]?.id;
    return {
      ...createEmptyDecisionRoomSession(parsed.mode),
      rows: parsed.rows,
      themes: parsed.themes,
      selection: parsed.selection,
      ...(activeThemeId ? { activeThemeId } : {}),
    };
  }

  if (runtimeAction.type === "SELECT_THEME") {
    if (
      !hasOnlyKeys(runtimeAction, ["type", "themeId"], ["type", "themeId"])
      || typeof runtimeAction.themeId !== "string"
    ) return state;
    return state.selection.selected.some((theme) => theme.id === runtimeAction.themeId)
      ? { ...state, activeThemeId: runtimeAction.themeId }
      : state;
  }

  if (runtimeAction.type === "UPDATE_REVIEW") {
    if (
      !hasOnlyKeys(
        runtimeAction,
        ["type", "themeId", "patch"],
        ["type", "themeId", "patch"],
      )
      || typeof runtimeAction.themeId !== "string"
      || !state.selection.selected.some((theme) => theme.id === runtimeAction.themeId)
      || !state.themes.some((theme) => theme.id === runtimeAction.themeId)
    ) return state;
    const patch = parseReviewUpdate(runtimeAction.patch, runtimeAction.themeId);
    if (!patch) return state;
    const currentReview = state.reviews[runtimeAction.themeId]
      ?? createThemeReview(runtimeAction.themeId);
    const changesDependency = (
      patch.explanationBasis !== undefined
      && patch.explanationBasis !== currentReview.explanationBasis
    ) || (
      patch.evidenceStatus !== undefined
      && patch.evidenceStatus !== currentReview.evidenceStatus
    );
    const base = changesDependency
      ? invalidateThemeDerivations(state, runtimeAction.themeId)
      : state;
    const review = updateThemeReview({ review: currentReview }, patch).review;
    return { ...base, reviews: { ...base.reviews, [runtimeAction.themeId]: review } };
  }

  if (runtimeAction.type === "SET_INTERPRETATIONS") {
    if (!hasOnlyKeys(runtimeAction, ["type", "claims"], ["type", "claims"])) return state;
    const claims = resolveCanonicalClaims(runtimeAction.claims, state);
    if (!claims) return state;
    const interpretations = { ...state.interpretations };
    for (const claim of claims) interpretations[claim.themeId] = claim;
    return { ...state, interpretations, report: undefined };
  }

  if (runtimeAction.type === "SET_REPEAT") {
    if (!hasOnlyKeys(runtimeAction, ["type", "repeat"], ["type", "repeat"])) return state;
    const repeat = resolveCanonicalRepeat(runtimeAction.repeat, state);
    if (!repeat) return state;
    return {
      ...state,
      repeats: { ...state.repeats, [repeat.themeId]: repeat },
      report: undefined,
    };
  }

  if (runtimeAction.type === "APPROVE_DECISION") {
    if (!hasOnlyKeys(runtimeAction, ["type", "decision"], ["type", "decision"])) return state;
    const decision = resolveCanonicalDecision(runtimeAction.decision, state);
    if (!decision) return state;
    return {
      ...state,
      decisions: [
        ...state.decisions.filter((item) => item.id !== decision.id),
        decision,
      ].sort((a, b) => compareCodeUnits(a.id, b.id)),
      report: undefined,
    };
  }

  if (runtimeAction.type === "GO_TO_SCREEN") {
    if (
      !hasOnlyKeys(runtimeAction, ["type", "screen"], ["type", "screen"])
      || !isKnownScreen(runtimeAction.screen)
    ) return state;
    const target = runtimeAction.screen as DecisionRoomScreen;
    const currentIndex = screenOrder.indexOf(state.screen);
    const targetIndex = screenOrder.indexOf(target);
    if (targetIndex < 0 || targetIndex > currentIndex + 1) return state;
    return { ...state, screen: target };
  }

  if (runtimeAction.type === "END_SESSION") {
    return hasOnlyKeys(runtimeAction, ["type"])
      ? createEmptyDecisionRoomSession(state.mode)
      : state;
  }

  return state;
}

function emptySelection(): ReviewSubjectSelection {
  return { selected: [], unselected: [], recommendedIds: [], wasOverridden: false };
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
