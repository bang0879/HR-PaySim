import { createDecisionRecord } from "../decisions/decisionRecords.ts";
import { createThemeReview, updateThemeReview } from "../review/updateThemeReview.ts";
import type { ReviewSubjectSelection } from "../themes/selectReviewSubjects.ts";
import type {
  DecisionRoomAction,
  DecisionRoomScreen,
  DecisionRoomSessionState,
} from "./types.ts";

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
  if (action.type === "START_SESSION") {
    const selectedIds = new Set(action.selection.selected.map((theme) => theme.id));
    const activeThemeId = action.activeThemeId && selectedIds.has(action.activeThemeId)
      ? action.activeThemeId
      : action.selection.selected[0]?.id;
    return {
      ...createEmptyDecisionRoomSession(action.mode),
      rows: action.rows.map((row) => ({ ...row })),
      themes: [...action.themes],
      selection: cloneSelection(action.selection),
      ...(activeThemeId ? { activeThemeId } : {}),
    };
  }

  if (action.type === "SELECT_THEME") {
    return state.selection.selected.some((theme) => theme.id === action.themeId)
      ? { ...state, activeThemeId: action.themeId }
      : state;
  }

  if (action.type === "UPDATE_REVIEW") {
    const currentReview = state.reviews[action.themeId] ?? createThemeReview(action.themeId);
    const changesDependency = (
      action.patch.explanationBasis !== undefined
      && action.patch.explanationBasis !== currentReview.explanationBasis
    ) || (
      action.patch.evidenceStatus !== undefined
      && action.patch.evidenceStatus !== currentReview.evidenceStatus
    );
    const base = changesDependency
      ? invalidateThemeDerivations(state, action.themeId)
      : state;
    const review = updateThemeReview({ review: currentReview }, action.patch).review;
    return {
      ...base,
      reviews: { ...base.reviews, [action.themeId]: review },
    };
  }

  if (action.type === "SET_INTERPRETATIONS") {
    const interpretations = { ...state.interpretations };
    for (const claim of [...action.claims].sort((a, b) => compareCodeUnits(a.id, b.id))) {
      if (!state.reviews[claim.themeId]) continue;
      interpretations[claim.themeId] = claim;
    }
    return { ...state, interpretations, report: undefined };
  }

  if (action.type === "SET_REPEAT") {
    if (!state.reviews[action.repeat.themeId]) return state;
    return {
      ...state,
      repeats: { ...state.repeats, [action.repeat.themeId]: action.repeat },
      report: undefined,
    };
  }

  if (action.type === "APPROVE_DECISION") {
    if (action.decision.status !== "approved") return state;
    const validThemeIds = new Set(Object.keys(state.reviews));
    const result = createDecisionRecord(action.decision, validThemeIds);
    if (result.status !== "ready") return state;
    return {
      ...state,
      decisions: [
        ...state.decisions.filter((decision) => decision.id !== result.decision.id),
        result.decision,
      ].sort((a, b) => compareCodeUnits(a.id, b.id)),
      report: undefined,
    };
  }

  if (action.type === "GO_TO_SCREEN") {
    const currentIndex = screenOrder.indexOf(state.screen);
    const targetIndex = screenOrder.indexOf(action.screen);
    if (targetIndex < 0 || targetIndex > currentIndex + 1) return state;
    return { ...state, screen: action.screen };
  }

  if (action.type === "END_SESSION") {
    return createEmptyDecisionRoomSession(state.mode);
  }

  return state;
}

function emptySelection(): ReviewSubjectSelection {
  return { selected: [], unselected: [], recommendedIds: [], wasOverridden: false };
}

function cloneSelection(selection: ReviewSubjectSelection): ReviewSubjectSelection {
  return {
    selected: [...selection.selected],
    unselected: [...selection.unselected],
    recommendedIds: [...selection.recommendedIds],
    wasOverridden: selection.wasOverridden,
  };
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
