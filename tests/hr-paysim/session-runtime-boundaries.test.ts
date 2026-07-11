import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";
import {
  createEmptyDecisionRoomSession,
  decisionRoomReducer,
} from "../../src/lib/hr-paysim/session/decisionRoomReducer.ts";

test("null, unknown, and malformed recognized actions fail closed without throwing", () => {
  const state = createSyntheticDemoSession();
  const hostileActions: unknown[] = [
    null,
    [],
    {},
    { type: null },
    { type: "UNKNOWN" },
    { type: "START_SESSION", mode: "demo", rows: null, themes: [], selection: null },
    { type: "START_SESSION", mode: "invalid", rows: [], themes: [], selection: { selected: [], unselected: [], recommendedIds: [], wasOverridden: false } },
    { type: "SELECT_THEME", themeId: null },
    { type: "UPDATE_REVIEW", themeId: state.activeThemeId, patch: null },
    { type: "SET_INTERPRETATIONS", claims: null },
    { type: "SET_REPEAT", repeat: null },
    { type: "APPROVE_DECISION", decision: null },
    { type: "GO_TO_SCREEN", screen: null },
    { type: "END_SESSION", unexpected: true },
  ];

  for (const action of hostileActions) {
    let result: typeof state | undefined;
    assert.doesNotThrow(() => {
      result = decisionRoomReducer(state, action as never);
    });
    assert.equal(result, state, `action should preserve identity: ${String((action as { type?: unknown } | null)?.type)}`);
  }
});

test("START_SESSION rejects unknown selection IDs and owns all accepted nested input", () => {
  const demo = createSyntheticDemoSession();
  const malformedSelection = structuredClone(demo.selection);
  malformedSelection.recommendedIds.push("ghost-theme");
  const rejected = decisionRoomReducer(demo, {
    type: "START_SESSION",
    mode: "facilitated",
    rows: structuredClone(demo.rows),
    themes: structuredClone(demo.themes),
    selection: malformedSelection,
  });
  assert.equal(rejected, demo);

  const rows = structuredClone(demo.rows);
  const themes = structuredClone(demo.themes);
  const selection = structuredClone(demo.selection);
  const started = decisionRoomReducer(createEmptyDecisionRoomSession(), {
    type: "START_SESSION",
    mode: "facilitated",
    rows,
    themes,
    selection,
    activeThemeId: selection.selected[0]!.id,
  });
  const originalSalary = started.rows[0]!.baseSalaryKRW;
  const originalGap = started.themes[0]!.comparisonPairs[0]!.salaryGapKRW;
  const originalRole = started.selection.selected[0]!.roleGroup;

  rows[0]!.baseSalaryKRW = 1;
  themes[0]!.comparisonPairs[0]!.salaryGapKRW = 1;
  selection.selected[0]!.roleGroup = "mutated";

  assert.equal(started.rows[0]!.baseSalaryKRW, originalSalary);
  assert.equal(started.themes[0]!.comparisonPairs[0]!.salaryGapKRW, originalGap);
  assert.equal(started.selection.selected[0]!.roleGroup, originalRole);
});

test("UPDATE_REVIEW accepts only selected known themes and exact canonical patches", () => {
  const demo = createSyntheticDemoSession();
  const themeId = demo.activeThemeId!;
  const invalidActions: unknown[] = [
    { type: "UPDATE_REVIEW", themeId: "ghost-theme", patch: { evidenceStatus: "documented" } },
    { type: "UPDATE_REVIEW", themeId, patch: { evidenceStatus: "invented" } },
    { type: "UPDATE_REVIEW", themeId, patch: { explanationBasis: "timing_context", freeText: "secret" } },
    { type: "UPDATE_REVIEW", themeId, patch: { evidenceFollowUp: { id: "follow-up", themeId: "ghost-theme", evidenceNeeded: "offer_record", ownerRole: "HR", dueEvent: "BEFORE_NEXT_OFFER" } } },
    { type: "UPDATE_REVIEW", themeId, patch: { evidenceFollowUp: { id: "follow-up", themeId, evidenceNeeded: "invented", ownerRole: "HR", dueEvent: "BEFORE_NEXT_OFFER" } } },
  ];

  for (const action of invalidActions) {
    assert.equal(decisionRoomReducer(demo, action as never), demo);
  }
  assert.equal(demo.reviews["ghost-theme"], undefined);

  const evidenceFollowUp = {
    id: "follow-up-product",
    themeId,
    evidenceNeeded: "offer_record" as const,
    ownerRole: "HR" as const,
    dueEvent: "BEFORE_NEXT_OFFER" as const,
  };
  const changed = decisionRoomReducer(demo, {
    type: "UPDATE_REVIEW",
    themeId,
    patch: { repeatabilityStatus: "one_time_exception", evidenceFollowUp },
  });
  evidenceFollowUp.id = "mutated";
  assert.equal(changed.reviews[themeId]!.evidenceFollowUp?.id, "follow-up-product");
});

test("SET_INTERPRETATIONS accepts only current canonical registry claims and clones them", () => {
  const demo = createSyntheticDemoSession();
  const themeId = demo.activeThemeId!;
  const canonical = structuredClone(demo.interpretations[themeId]!);
  const invented = structuredClone(canonical);
  invented.statements[0]!.copyKey = "invented.copy_key";

  assert.equal(
    decisionRoomReducer(demo, { type: "SET_INTERPRETATIONS", claims: [invented] }),
    demo,
  );
  const stale = structuredClone(canonical);
  stale.themeId = "ghost-theme";
  assert.equal(
    decisionRoomReducer(demo, { type: "SET_INTERPRETATIONS", claims: [canonical, stale] }),
    demo,
  );

  const accepted = decisionRoomReducer(demo, {
    type: "SET_INTERPRETATIONS",
    claims: [canonical],
  });
  const originalCopyKey = accepted.interpretations[themeId]!.statements[0]!.copyKey;
  canonical.statements[0]!.copyKey = "caller.mutated";
  assert.equal(accepted.interpretations[themeId]!.statements[0]!.copyKey, originalCopyKey);
});

test("SET_REPEAT stores only a result reproduced from current roster and theme", () => {
  const demo = createSyntheticDemoSession();
  const themeId = demo.activeThemeId!;
  const canonical = structuredClone(demo.repeats[themeId]!);
  const wrongSalary = structuredClone(canonical);
  wrongSalary.syntheticRow.baseSalaryKRW += 1;
  const wrongRole = structuredClone(canonical);
  wrongRole.syntheticRow.roleGroup = "Platform Engineer";

  assert.equal(decisionRoomReducer(demo, { type: "SET_REPEAT", repeat: wrongSalary }), demo);
  assert.equal(decisionRoomReducer(demo, { type: "SET_REPEAT", repeat: wrongRole }), demo);

  const accepted = decisionRoomReducer(demo, { type: "SET_REPEAT", repeat: canonical });
  const originalAffected = accepted.repeats[themeId]!.affectedRowIds[0];
  canonical.affectedRowIds[0] = "caller-mutated";
  canonical.syntheticRow.baseSalaryKRW = 1;
  assert.equal(accepted.repeats[themeId]!.affectedRowIds[0], originalAffected);
  assert.equal(accepted.repeats[themeId]!.syntheticRow.baseSalaryKRW, 95_000_000);
});

test("APPROVE_DECISION intersects current themes, selected IDs, and existing reviews", () => {
  const demo = createSyntheticDemoSession();
  const withGhostReview = {
    ...demo,
    reviews: {
      ...demo.reviews,
      "ghost-theme": { ...Object.values(demo.reviews)[0]!, themeId: "ghost-theme" },
    },
  };
  const decision = {
    id: "decision-ghost",
    themeIds: ["ghost-theme"],
    actionKey: "collect_evidence" as const,
    ownerRole: "HR" as const,
    dueEvent: "WITHIN_TWO_WEEKS" as const,
    status: "approved" as const,
  };
  assert.equal(
    decisionRoomReducer(withGhostReview, { type: "APPROVE_DECISION", decision }),
    withGhostReview,
  );

  const callerDecision = structuredClone(demo.decisions[0]!);
  const accepted = decisionRoomReducer(demo, {
    type: "APPROVE_DECISION",
    decision: callerDecision,
  });
  callerDecision.themeIds[0] = "caller-mutated";
  assert.deepEqual(accepted.decisions[0]!.themeIds, [demo.activeThemeId]);
});

test("equivalent accepted actions are deterministic and invalid batches fail closed in any order", () => {
  const demo = createSyntheticDemoSession();
  const themeId = demo.activeThemeId!;
  const canonical = structuredClone(demo.interpretations[themeId]!);
  const invalid = structuredClone(canonical);
  invalid.id = "invented-claim";
  const first = decisionRoomReducer(demo, { type: "SET_INTERPRETATIONS", claims: [canonical, invalid] });
  const second = decisionRoomReducer(demo, { type: "SET_INTERPRETATIONS", claims: [invalid, canonical] });
  assert.equal(first, demo);
  assert.equal(second, demo);
});

test("provider initializes through a cloning initializer and session modules expose no persistence path", () => {
  const files = [
    "src/lib/hr-paysim/session/types.ts",
    "src/lib/hr-paysim/session/decisionRoomReducer.ts",
    "src/lib/hr-paysim/session/runtimeValidation.ts",
    "src/lib/hr-paysim/contracts/demoContract.ts",
    "src/app/PaySimSessionProvider.tsx",
  ];
  const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
  const provider = readFileSync("src/app/PaySimSessionProvider.tsx", "utf8");

  assert.match(provider, /useReducer\([\s\S]*initializeDecisionRoomSession[\s\S]*\)/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|PAY_SIM_SESSION_STORAGE_KEY/);
  assert.doesNotMatch(source, /history\.|searchParams|URLSearchParams/);
  assert.doesNotMatch(source, /telemetry|fetch\(|sendBeacon|XMLHttpRequest/);
  assert.doesNotMatch(source, /export\s+(?:function|const)\s+(?:serialize|deserialize|restore|hydrate|persist|refresh)/i);
});
