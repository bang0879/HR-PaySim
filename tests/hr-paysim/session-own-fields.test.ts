import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";
import {
  createEmptyDecisionRoomSession,
  decisionRoomReducer,
  initializeDecisionRoomSession,
} from "../../src/lib/hr-paysim/session/decisionRoomReducer.ts";
import { clonePlainData } from "../../src/lib/hr-paysim/session/runtimeValidation.ts";

const actionTypes = [
  "START_SESSION",
  "SELECT_THEME",
  "UPDATE_REVIEW",
  "SET_INTERPRETATIONS",
  "SET_REPEAT",
  "APPROVE_DECISION",
  "GO_TO_SCREEN",
] as const;

test("an inherited action discriminant is rejected without invoking its getter", () => {
  const state = createSyntheticDemoSession();
  for (const actionType of actionTypes) {
    let getterCalls = 0;
    const action = Object.create({
      get type() {
        getterCalls += 1;
        return actionType;
      },
    });
    assert.equal(decisionRoomReducer(state, action as never), state);
    assert.equal(getterCalls, 0, actionType);
  }
});

test("every recognized action requires own payload fields without invoking inherited getters", () => {
  const state = createSyntheticDemoSession();
  const inheritedFieldByType = {
    START_SESSION: "rows",
    SELECT_THEME: "themeId",
    UPDATE_REVIEW: "patch",
    SET_INTERPRETATIONS: "claims",
    SET_REPEAT: "repeat",
    APPROVE_DECISION: "decision",
    GO_TO_SCREEN: "screen",
  } as const;

  for (const actionType of actionTypes) {
    let getterCalls = 0;
    const field = inheritedFieldByType[actionType];
    const prototype = Object.create(null);
    Object.defineProperty(prototype, field, {
      enumerable: true,
      get() {
        getterCalls += 1;
        return undefined;
      },
    });
    const action = Object.create(prototype) as Record<string, unknown>;
    Object.defineProperty(action, "type", { enumerable: true, value: actionType });
    if (actionType === "START_SESSION") {
      Object.assign(action, {
        mode: "demo",
        themes: state.themes,
        selection: state.selection,
      });
    } else if (actionType === "UPDATE_REVIEW") {
      Object.defineProperty(action, "themeId", { enumerable: true, value: state.activeThemeId });
    }

    assert.doesNotThrow(() => decisionRoomReducer(state, action as never));
    assert.equal(decisionRoomReducer(state, action as never), state);
    assert.equal(getterCalls, 0, `${actionType}.${field}`);
  }
});

test("nested patch, claim, repeat, and decision prototypes are rejected without getters", () => {
  const state = createSyntheticDemoSession();
  const themeId = state.activeThemeId!;
  let getterCalls = 0;
  const hostile = (key: string, value: unknown) => {
    const prototype = Object.create(null);
    Object.defineProperty(prototype, key, {
      enumerable: true,
      get() {
        getterCalls += 1;
        return value;
      },
    });
    return Object.create(prototype);
  };
  const actions = [
    { type: "UPDATE_REVIEW", themeId, patch: hostile("evidenceStatus", "documented") },
    { type: "SET_INTERPRETATIONS", claims: [hostile("themeId", themeId)] },
    { type: "SET_REPEAT", repeat: hostile("themeId", themeId) },
    { type: "APPROVE_DECISION", decision: hostile("status", "approved") },
  ];

  for (const action of actions) {
    assert.equal(decisionRoomReducer(state, action as never), state);
  }
  assert.equal(getterCalls, 0);
});

test("an empty review patch is an exact no-op and never creates a review", () => {
  const state = createSyntheticDemoSession();
  const platform = state.selection.selected.find((theme) => theme.roleGroup === "Platform Engineer")!;
  const changed = decisionRoomReducer(state, {
    type: "UPDATE_REVIEW",
    themeId: platform.id,
    patch: {},
  });
  assert.equal(changed, state);
  assert.equal(changed.reviews[platform.id], undefined);
});

test("START_SESSION caps selected and recommended review subjects at three", () => {
  const state = createSyntheticDemoSession();
  const fourthTheme = structuredClone(state.themes[2]!);
  fourthTheme.id = "fourth-valid-theme";
  fourthTheme.roleGroup = "Fourth Role";
  const themes = [...structuredClone(state.themes), fourthTheme];
  const selectedFour = [...structuredClone(state.selection.selected), fourthTheme];
  const fourSelectedAction = {
    type: "START_SESSION",
    mode: "facilitated",
    rows: structuredClone(state.rows),
    themes,
    selection: {
      selected: selectedFour,
      unselected: [] as typeof themes,
      recommendedIds: selectedFour.slice(0, 3).map((theme) => theme.id),
      wasOverridden: true,
    },
  };
  assert.equal(decisionRoomReducer(state, fourSelectedAction as never), state);

  const fourRecommendedAction = structuredClone(fourSelectedAction);
  fourRecommendedAction.selection.selected = fourRecommendedAction.selection.selected.slice(0, 3);
  fourRecommendedAction.selection.unselected = [structuredClone(fourthTheme)];
  fourRecommendedAction.selection.recommendedIds = themes.map((theme) => theme.id);
  assert.equal(decisionRoomReducer(state, fourRecommendedAction as never), state);
});

test("plain-data cloning preserves an own __proto__ key without prototype pollution", () => {
  const source = Object.create(null) as Record<string, unknown>;
  Object.defineProperty(source, "__proto__", {
    enumerable: true,
    value: { pollutedBySession: true },
  });
  Object.defineProperty(source, "safe", { enumerable: true, value: "value" });

  const cloned = clonePlainData(source) as Record<string, unknown>;
  assert.equal(Object.getPrototypeOf(cloned), Object.prototype);
  assert.equal(Object.hasOwn(cloned, "__proto__"), true);
  assert.deepEqual(cloned.__proto__, { pollutedBySession: true });
  assert.equal(({} as { pollutedBySession?: boolean }).pollutedBySession, undefined);
});

test("the provider initializer rejects malformed state and preserves a canonical demo clone", () => {
  const malformedStates: unknown[] = [
    null,
    {},
    { ...createSyntheticDemoSession(), rows: null },
    { ...createSyntheticDemoSession(), themes: {} },
    { ...createSyntheticDemoSession(), selection: { selected: null } },
  ];
  const empty = createEmptyDecisionRoomSession("facilitated");
  for (const malformed of malformedStates) {
    assert.deepEqual(initializeDecisionRoomSession(malformed as never), empty);
  }

  const demo = createSyntheticDemoSession();
  const initialized = initializeDecisionRoomSession(demo);
  assert.deepEqual(initialized, demo);
  assert.notEqual(initialized, demo);
  assert.notEqual(initialized.rows, demo.rows);
  assert.notEqual(initialized.report, demo.report);
});

test("all canonical entry modules contain no persistence, URL-state, or network calls", () => {
  const files = [
    "src/surfaces/PublicDemoApp.tsx",
    "src/surfaces/FacilitatorLocalApp.tsx",
    "src/lib/hr-paysim/access/routePolicy.ts",
    "src/app/PaySimSessionProvider.tsx",
    "src/lib/hr-paysim/contracts/demoContract.ts",
    "src/lib/hr-paysim/session/types.ts",
    "src/lib/hr-paysim/session/decisionRoomReducer.ts",
    "src/lib/hr-paysim/session/runtimeValidation.ts",
  ];
  const source = files.map((file) => readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(source, /(?:localStorage|sessionStorage)\s*[.[]/);
  assert.doesNotMatch(source, /(?:history\s*\.\s*(?:pushState|replaceState)|location\s*\.\s*(?:search|hash)|new\s+URLSearchParams\s*\()/);
  assert.doesNotMatch(source, /(?:\bfetch\s*\(|\.sendBeacon\s*\(|new\s+XMLHttpRequest\s*\(|\btelemetry\s*\.\s*(?:track|send|emit)\s*\()/i);
  assert.doesNotMatch(source, /\b(?:JSON\s*\.\s*(?:parse|stringify)|(?:serialize|deserialize|restore|hydrate|persist|refresh)Session)\s*\(/i);
});
