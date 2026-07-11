import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createSyntheticDemoSession,
  DECISION_ROOM_DEMO_CONTRACT,
} from "../../src/lib/hr-paysim/contracts/demoContract.ts";
import {
  createEmptyDecisionRoomSession,
  decisionRoomReducer,
} from "../../src/lib/hr-paysim/session/decisionRoomReducer.ts";
import { resolveHrPaySimSurface } from "../../src/routes/hr-paysim/appRoute.ts";

test("demo contract fixes four screens, three clicks, and a visible synthetic label", () => {
  assert.deepEqual(DECISION_ROOM_DEMO_CONTRACT.screens, [
    "introduction",
    "confirmed_pay_differences",
    "company_rule",
    "session_result",
  ]);
  assert.equal(DECISION_ROOM_DEMO_CONTRACT.clicksToResult, 3);
  assert.equal(DECISION_ROOM_DEMO_CONTRACT.syntheticOnly, true);
  assert.equal(DECISION_ROOM_DEMO_CONTRACT.sampleLabel, "샘플로 입력된 내용");
  assert.equal(DECISION_ROOM_DEMO_CONTRACT.route, "/hr-paysim/decision-room-preview");
});

test("synthetic demo prefills only the Product Engineer reviewed path", () => {
  const session = createSyntheticDemoSession();
  const product = session.selection.selected.find((theme) => theme.roleGroup === "Product Engineer");
  assert.ok(product);

  assert.equal(session.mode, "demo");
  assert.equal(session.screen, "introduction");
  assert.equal(session.rows.length, 16);
  assert.equal(session.activeThemeId, product.id);
  assert.deepEqual(Object.keys(session.reviews), [product.id]);
  assert.deepEqual(Object.keys(session.interpretations), [product.id]);
  assert.deepEqual(Object.keys(session.repeats), [product.id]);
  assert.equal(session.decisions.length, 1);
  assert.deepEqual(session.decisions[0]?.themeIds, [product.id]);
  assert.ok(session.report);
});

test("four-screen navigation is guarded and subject switching does not change routes", () => {
  let session = createSyntheticDemoSession();
  session = decisionRoomReducer(session, { type: "GO_TO_SCREEN", screen: "session_result" });
  assert.equal(session.screen, "introduction");

  session = decisionRoomReducer(session, {
    type: "GO_TO_SCREEN",
    screen: "confirmed_pay_differences",
  });
  const platform = session.selection.selected.find((theme) => theme.roleGroup === "Platform Engineer");
  assert.ok(platform);
  const beforeScreen = session.screen;
  session = decisionRoomReducer(session, { type: "SELECT_THEME", themeId: platform.id });
  assert.equal(session.activeThemeId, platform.id);
  assert.equal(session.screen, beforeScreen);

  session = decisionRoomReducer(session, { type: "GO_TO_SCREEN", screen: "company_rule" });
  session = decisionRoomReducer(session, { type: "GO_TO_SCREEN", screen: "session_result" });
  assert.equal(session.screen, "session_result");
});

test("validated recalculation actions repopulate derivatives without restoring an old report", () => {
  let session = createSyntheticDemoSession();
  const themeId = session.activeThemeId!;
  const claim = session.interpretations[themeId]!;
  const repeat = session.repeats[themeId]!;
  const decision = session.decisions[0]!;

  session = decisionRoomReducer(session, {
    type: "UPDATE_REVIEW",
    themeId,
    patch: { evidenceStatus: "leader_assertion_only" },
  });
  session = decisionRoomReducer(session, { type: "SET_INTERPRETATIONS", claims: [claim] });
  session = decisionRoomReducer(session, { type: "SET_REPEAT", repeat });
  session = decisionRoomReducer(session, { type: "APPROVE_DECISION", decision });

  assert.equal(session.interpretations[themeId]?.id, claim.id);
  assert.equal(session.repeats[themeId]?.themeId, themeId);
  assert.deepEqual(session.decisions, [decision]);
  assert.equal(session.report, undefined);
});

test("setting a recalculated derivative clears an older report", () => {
  const demo = createSyntheticDemoSession();
  const themeId = demo.activeThemeId!;
  const changed = decisionRoomReducer(demo, {
    type: "SET_REPEAT",
    repeat: demo.repeats[themeId]!,
  });

  assert.equal(changed.report, undefined);
});

test("unknown runtime actions do not behave like explicit session end", () => {
  const demo = createSyntheticDemoSession();
  const changed = decisionRoomReducer(demo, { type: "UNKNOWN" } as never);

  assert.equal(changed, demo);
});

test("explicit session end clears every in-memory field", () => {
  const ended = decisionRoomReducer(createSyntheticDemoSession(), { type: "END_SESSION" });

  assert.equal(ended.mode, "demo");
  assert.equal(ended.screen, "introduction");
  assert.deepEqual(ended.rows, []);
  assert.deepEqual(ended.themes, []);
  assert.deepEqual(ended.selection.selected, []);
  assert.equal(ended.activeThemeId, undefined);
  assert.deepEqual(ended.reviews, {});
  assert.deepEqual(ended.interpretations, {});
  assert.deepEqual(ended.repeats, {});
  assert.deepEqual(ended.decisions, []);
  assert.equal(ended.report, undefined);
});

test("START_SESSION replaces prior state without retaining derived demo data", () => {
  const demo = createSyntheticDemoSession();
  const started = decisionRoomReducer(demo, {
    type: "START_SESSION",
    mode: "facilitated",
    rows: [],
    themes: [],
    selection: { selected: [], unselected: [], recommendedIds: [], wasOverridden: false },
  });

  assert.deepEqual(started, createEmptyDecisionRoomSession("facilitated"));
});

test("preview route is added without replacing old prototype, roster, or demo surfaces", () => {
  assert.equal(
    resolveHrPaySimSurface("/hr-paysim/decision-room-preview"),
    "decision_room_preview",
  );
  assert.equal(resolveHrPaySimSurface("/hr-paysim/entry"), "prototype");
  assert.equal(resolveHrPaySimSurface("/hr-paysim/roster"), "roster");
  assert.equal(resolveHrPaySimSurface("/hr-paysim/demo"), "demo");
});

test("new decision-room session modules contain no browser-storage or JSON persistence helpers", () => {
  const source = [
    "src/lib/hr-paysim/session/types.ts",
    "src/lib/hr-paysim/session/decisionRoomReducer.ts",
    "src/lib/hr-paysim/contracts/demoContract.ts",
    "src/app/PaySimSessionProvider.tsx",
  ].map((file) => readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(source, /localStorage|sessionStorage|PAY_SIM_SESSION_STORAGE_KEY/);
  assert.doesNotMatch(source, /JSON\.(?:parse|stringify)/);
});
