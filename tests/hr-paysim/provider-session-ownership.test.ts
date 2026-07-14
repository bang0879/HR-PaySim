import assert from "node:assert/strict";
import test from "node:test";
import { createSyntheticDemoSession } from "../../src/lib/hr-paysim/contracts/demoContract.ts";
import { initializeDecisionRoomSession } from "../../src/lib/hr-paysim/session/decisionRoomReducer.ts";

test("the provider reducer initializer owns every nested initial-state value", () => {
  const caller = createSyntheticDemoSession();
  const initialized = initializeDecisionRoomSession(caller);
  const themeId = caller.activeThemeId!;
  const salary = initialized.rows[0]!.baseSalaryKRW;
  const gap = initialized.themes[0]!.comparisonPairs[0]!.salaryGapKRW;
  const copyKey = initialized.interpretations[themeId]!.statements[0]!.copyKey;
  const affectedRowId = initialized.repeats[themeId]!.affectedRowIds[0];
  const decisionThemeId = initialized.decisions[0]!.themeIds[0];
  const reportCopyKey = initialized.report!.confirmedResults[0]!.copyKey;

  caller.rows[0]!.baseSalaryKRW = 1;
  caller.themes[0]!.comparisonPairs[0]!.salaryGapKRW = 1;
  caller.selection.selected[0]!.roleGroup = "mutated";
  caller.interpretations[themeId]!.statements[0]!.copyKey = "caller.mutated";
  caller.repeats[themeId]!.affectedRowIds[0] = "caller-mutated";
  caller.decisions[0]!.themeIds[0] = "caller-mutated";
  caller.report!.confirmedResults[0]!.copyKey = "caller.mutated.report";

  assert.equal(initialized.rows[0]!.baseSalaryKRW, salary);
  assert.equal(initialized.themes[0]!.comparisonPairs[0]!.salaryGapKRW, gap);
  assert.equal(initialized.selection.selected[0]!.roleGroup, "Product Engineer");
  assert.equal(initialized.interpretations[themeId]!.statements[0]!.copyKey, copyKey);
  assert.equal(initialized.repeats[themeId]!.affectedRowIds[0], affectedRowId);
  assert.equal(initialized.decisions[0]!.themeIds[0], decisionThemeId);
  assert.equal(initialized.report!.confirmedResults[0]!.copyKey, reportCopyKey);
});
