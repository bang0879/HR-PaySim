import assert from "node:assert/strict";
import test from "node:test";
import { createRosterDiagnosticViewModel } from "../../src/lib/hr-paysim/rosterDiagnosticViewModel.ts";
import { sampleRosterPaste } from "../../src/lib/hr-paysim/rosterFixtures.ts";

test("createRosterDiagnosticViewModel starts in an empty facilitated paste state", () => {
  const viewModel = createRosterDiagnosticViewModel("");

  assert.equal(viewModel.status, "empty");
  assert.equal(viewModel.canShowFindings, false);
  assert.equal(viewModel.primaryActionLabel, "샘플 데이터 불러오기");
  assert.equal(viewModel.summary.acceptedRowCount, 0);
  assert.deepEqual(viewModel.previewRows, []);
});

test("createRosterDiagnosticViewModel gates PII-like columns before showing preview or findings", () => {
  const paste = [
    "name\temail\trowId\troleGroup\ttitle\tlevelLabel\tlevelRank\tbaseSalaryKRW\tstartDate\ttenureMonths\texceptionFlag\tcounterOfferFlag\tmanagerLabel\tteamLabel",
    "Jane Founder\tjane@example.com\trow_001\tProduct Engineer\tProduct Engineer\tnone\t\t68000000\t2022-01-01\t54\tfalse\tfalse\tAlice Kim\tProduct Core",
  ].join("\n");

  const viewModel = createRosterDiagnosticViewModel(paste);

  assert.equal(viewModel.status, "needs_pii_confirmation");
  assert.equal(viewModel.canShowFindings, false);
  assert.equal(viewModel.primaryActionLabel, "PII 컬럼 제거 후 계속");
  assert.deepEqual(viewModel.summary.rejectedColumnHeaders, ["name", "email"]);
  assert.deepEqual(viewModel.previewRows, []);
  assert.deepEqual(viewModel.findingCards, []);
});

test("createRosterDiagnosticViewModel strips confirmed PII columns and shows de-identified findings", () => {
  const viewModel = createRosterDiagnosticViewModel(sampleRosterPaste, { confirmPiiColumnStripping: true });

  assert.equal(viewModel.status, "ready");
  assert.equal(viewModel.canShowFindings, true);
  assert.equal(viewModel.summary.acceptedRowCount, 16);
  assert.equal(viewModel.summary.findingCount, 7);
  assert.equal(viewModel.summary.roleGroupCount, 4);
  assert.ok(viewModel.findingCards.some((card) => card.type === "shadow_band" && card.roleGroup === "Product Engineer"));
  assert.ok(viewModel.findingCards.some((card) => card.type === "loyalty_tax" && card.roleGroup === "Platform Engineer"));
  assert.equal(viewModel.findingCards.some((card) => card.title.includes("CEI") || card.title.includes("CED")), false);
  assert.equal(viewModel.previewRows[0]?.managerLabel, "manager_1");
  assert.equal(viewModel.previewRows[0]?.teamLabel, "team_1");
  assert.equal(JSON.stringify(viewModel).includes("manager_a"), false);
  assert.equal(JSON.stringify(viewModel).includes("team_a"), false);
});

test("createRosterDiagnosticViewModel surfaces blocked rows without leaking PII values", () => {
  const paste = [
    "rowId\troleGroup\ttitle\tlevelLabel\tlevelRank\tbaseSalaryKRW\tstartDate\ttenureMonths\texceptionFlag\tcounterOfferFlag\tmanagerLabel\tteamLabel",
    "row_001\tProduct Engineer\tProduct Engineer\tnone\t\t68000000\t2022-01-01\t54\tfalse\tfalse\tmanager_raw\tteam_raw",
    "row_002\tProduct Engineer\tperson@example.com\tnone\t\t72000000\t2022-07-01\t48\tfalse\tfalse\tmanager_raw\tteam_raw",
  ].join("\n");

  const viewModel = createRosterDiagnosticViewModel(paste);

  assert.equal(viewModel.status, "partial_blocked");
  assert.equal(viewModel.summary.acceptedRowCount, 1);
  assert.equal(viewModel.summary.blockedRowCount, 1);
  assert.ok(viewModel.errors.some((error) => error.includes("\uC785\uB825 3\uD589")));
  assert.equal(JSON.stringify(viewModel).includes("row_002"), false);
  assert.equal(JSON.stringify(viewModel).includes("person@example.com"), false);
});