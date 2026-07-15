import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  "60000000\t10\t60\tBackend Engineer\tL1\t1\t없음",
  "75000000\t7\t12\tBackend Engineer\tL2\t2\t카운터오퍼",
  "85000000\t5\t10\tBackend Engineer\tL1\t1\t채용 예외",
  "70000000\t8\t50\tBackend Engineer\tL2\t2\t없음",
  "58000000\t10\t54\tData Analyst\tD1\t1\t없음",
  "72000000\t7\t10\tData Analyst\tD2\t2\t기타 문서화된 사유",
  "80000000\t5\t8\tData Analyst\tD1\t1\t채용 예외",
  "66000000\t8\t42\tData Analyst\tD2\t2\t없음",
  "50000000\t3\t12\tCustomer Success\t\t\t없음",
  "55000000\t4\t24\tCustomer Success\t\t\t기타 문서화된 사유",
].join("\n");

const qaSource = readFileSync(
  new URL("../../scripts/qa-decision-room.mjs", import.meta.url),
  "utf8",
);

const levelOrderSource = readFileSync(
  new URL("../../src/features/confirmed-pay-differences/LevelOrderDistribution.tsx", import.meta.url),
  "utf8",
);

test("level-order evidence derives visible role and grade labels from the active subject", () => {
  assert.match(levelOrderSource, /roleGroup: string/);
  assert.match(levelOrderSource, /model\.groups/);
  assert.doesNotMatch(levelOrderSource, /GTM 직급별|AE1과 AE2/);
});
test("facilitated copy derives facts from a complete-grade multi-role roster", () => {
  const prepared = prepareFacilitatorRoster(actualRosterPaste);
  assert.equal(prepared.status, "ready_for_confirmation");
  assert.ok(prepared.draft);
  assert.deepEqual(
    prepared.previewRows.map(({ employeeLabel, roleGroup, compensationExceptionReason }) => ({
      employeeLabel,
      roleGroup,
      compensationExceptionReason,
    })),
    [
      { employeeLabel: "직원 1", roleGroup: "Backend Engineer", compensationExceptionReason: "none" },
      { employeeLabel: "직원 2", roleGroup: "Backend Engineer", compensationExceptionReason: "counteroffer" },
      { employeeLabel: "직원 3", roleGroup: "Backend Engineer", compensationExceptionReason: "hiring_exception" },
      { employeeLabel: "직원 4", roleGroup: "Backend Engineer", compensationExceptionReason: "none" },
      { employeeLabel: "직원 1", roleGroup: "Data Analyst", compensationExceptionReason: "none" },
      { employeeLabel: "직원 2", roleGroup: "Data Analyst", compensationExceptionReason: "other_documented" },
      { employeeLabel: "직원 3", roleGroup: "Data Analyst", compensationExceptionReason: "hiring_exception" },
      { employeeLabel: "직원 4", roleGroup: "Data Analyst", compensationExceptionReason: "none" },
      { employeeLabel: "직원 1", roleGroup: "Customer Success", compensationExceptionReason: "none" },
      { employeeLabel: "직원 2", roleGroup: "Customer Success", compensationExceptionReason: "other_documented" },
    ],
  );
  assert.deepEqual(
    [...new Set(prepared.draft.selection.selected.map(({ roleGroup }) => roleGroup))],
    ["Backend Engineer", "Data Analyst"],
  );

  const model = createDecisionRoomViewModel({
    ...createEmptyDecisionRoomSession("facilitated"),
    ...prepared.draft,
  });
  const rendered = JSON.stringify(model);
  assert.match(rendered, /Backend Engineer/);
  assert.match(rendered, /직원 A/);
  assert.match(rendered, /직원 B/);
  assert.doesNotMatch(rendered, /Product Engineer|Platform Engineer|GTM|Customer Success/);
});

test("browser QA uses the generic workbook and a non-Product multi-role roster", () => {
  assert.match(qaSource, /HR-PaySim-company-roster-template\.xlsx/);
  assert.match(qaSource, /Backend Engineer/);
  assert.match(qaSource, /Customer Success/);
  assert.match(qaSource, /L1\\t1\\t없음/);
  assert.match(qaSource, /카운터오퍼|채용 예외/);
  assert.doesNotMatch(qaSource, /HR-PaySim-Product-Engineer-input-template/);
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
