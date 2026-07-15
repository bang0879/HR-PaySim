import assert from "node:assert/strict";
import test from "node:test";
import { createDecisionRoomViewModel } from "../../src/features/decision-room/decisionRoomViewModel.ts";
import { createFacilitatorSessionDraft } from "../../src/lib/hr-paysim/preparation/createFacilitatorSessionDraft.ts";
import { prepareFacilitatorRoster } from "../../src/lib/hr-paysim/preparation/prepareFacilitatorRoster.ts";
import { KOREAN_ROSTER_HEADERS } from "../../src/lib/hr-paysim/preparation/koreanRosterAdapter.ts";
import { createEmptyDecisionRoomSession } from "../../src/lib/hr-paysim/session/decisionRoomReducer.ts";
import type { DecisionRoomScreen } from "../../src/lib/hr-paysim/session/types.ts";
import {
  completeGradeMultiRoleRows,
  noGradeMultiRoleRows,
} from "./fixtures/multi-role-roster.ts";

const actualRosterPaste = [
  KOREAN_ROSTER_HEADERS.join("\t"),
  "73000000\t10\t61\tProduct Engineer\t\t\t없음",
  "77000000\t9\t50\tProduct Engineer\t\t\t없음",
  "81000000\t8\t39\tProduct Engineer\t\t\t없음",
  "91000000\t7\t13\tProduct Engineer\t\t\t없음",
  "88000000\t6\t20\tProduct Engineer\t\t\t없음",
].join("\n");

test("facilitated copy derives every roster fact from the current Product Engineer session", () => {
  const prepared = prepareFacilitatorRoster(actualRosterPaste);
  assert.equal(prepared.status, "ready_for_confirmation");
  assert.ok(prepared.draft);

  const model = createDecisionRoomViewModel({
    ...createEmptyDecisionRoomSession("facilitated"),
    ...prepared.draft,
  });
  const rendered = JSON.stringify(model);

  for (const expected of [
    "Product Engineer 5명",
    "7,300만원",
    "9,100만원",
    "1,800만원",
    "관련 경력 10년",
    "관련 경력 7년",
    "회사 근속 61개월",
    "회사 근속 13개월",
  ]) {
    assert.equal(rendered.includes(expected), true, expected);
  }

  for (const syntheticOnly of [
    "Product Engineer 6명",
    "6,800만원",
    "9,500만원",
    "2,700만원",
    "700만원이 추가됐지만",
    "Platform Engineer",
    "GTM",
  ]) {
    assert.equal(rendered.includes(syntheticOnly), false, syntheticOnly);
  }
});

test("facilitated multi-role subjects stay role-local across all four screens", () => {
  const designerRows = noGradeMultiRoleRows.map((row) => ({
    ...row,
    rowId: `designer-${row.rowId}`,
    roleGroup: "Product Designer",
  }));
  const draftResult = createFacilitatorSessionDraft([
    ...completeGradeMultiRoleRows,
    ...designerRows,
  ]);
  assert.equal(draftResult.supported, true);
  if (!draftResult.supported) return;

  const screens: DecisionRoomScreen[] = [
    "introduction",
    "confirmed_pay_differences",
    "company_rule",
    "session_result",
  ];
  const forbiddenFallbacks = ["Product Engineer", "Platform Engineer", "GTM"];

  for (const activeTheme of draftResult.draft.selection.selected) {
    for (const screen of screens) {
      const model = createDecisionRoomViewModel({
        ...createEmptyDecisionRoomSession("facilitated"),
        ...draftResult.draft,
        activeThemeId: activeTheme.id,
        screen,
      });
      const conclusion = model.evidence.conclusion;

      assert.equal(conclusion.includes(activeTheme.roleGroup), true, `${screen}: ${activeTheme.roleGroup}`);
      assert.equal(conclusion.includes("직원 A"), true, `${screen}: 직원 A`);
      assert.equal(conclusion.includes("직원 B"), true, `${screen}: 직원 B`);
      for (const fallback of forbiddenFallbacks) {
        assert.equal(conclusion.includes(fallback), false, `${screen}: ${fallback}`);
      }

      if (activeTheme.archetype === "level_integrity") {
        assert.equal(model.evidence.visualization.kind, "level_order");
      }
    }
  }
});
