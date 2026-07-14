import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyPreparationResult,
  prepareProductEngineerRoster,
} from "../../src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts";
import { createProductEngineerSessionDraft } from "../../src/lib/hr-paysim/preparation/createProductEngineerSessionDraft.ts";

const header = "rowId\troleGroup\ttitle\tlevelLabel\tlevelRank\tbaseSalaryKRW\tstartDate\ttenureMonths\texceptionFlag\tcounterOfferFlag\tmanagerLabel\tteamLabel";
const productRows = [
  "row_001\tProduct Engineer\tProduct Engineer\tnone\t\t68000000\t2021-11-01\t56\tfalse\tfalse\tmanager_a\tteam_a",
  "row_002\tProduct Engineer\tProduct Engineer\tnone\t\t72000000\t2022-03-01\t52\tfalse\tfalse\tmanager_a\tteam_a",
  "row_003\tProduct Engineer\tProduct Engineer\tnone\t\t76000000\t2022-08-01\t47\tfalse\tfalse\tmanager_a\tteam_a",
  "row_004\tProduct Engineer\tProduct Engineer\tnone\t\t95000000\t2025-04-01\t15\ttrue\tfalse\tmanager_a\tteam_a",
  "row_005\tProduct Engineer\tProduct Engineer\tnone\t\t92000000\t2024-10-01\t21\tfalse\ttrue\tmanager_a\tteam_a",
  "row_006\tProduct Engineer\tProduct Engineer\tnone\t\t88000000\t2024-03-01\t28\tfalse\tfalse\tmanager_a\tteam_a",
];

const cleanPaste = [header, ...productRows].join("\n");

test("empty input returns a non-startable empty result", () => {
  assert.deepEqual(prepareProductEngineerRoster(""), createEmptyPreparationResult());
});

test("prohibited columns require current-paste consent before rows are parsed", () => {
  const piiHeader = `name\temail\t${header}`;
  const piiRows = productRows.map((row, index) => `Employee ${index + 1}\temployee${index + 1}@example.com\t${row}`);
  const blocked = prepareProductEngineerRoster([piiHeader, ...piiRows].join("\n"));

  assert.equal(blocked.status, "needs_column_consent");
  assert.deepEqual(blocked.prohibitedColumnHeaders, ["name", "email"]);
  assert.deepEqual(blocked.rows, []);
  assert.equal(blocked.shouldClearRaw, false);

  const stripped = prepareProductEngineerRoster([piiHeader, ...piiRows].join("\n"), {
    confirmPiiColumnStripping: true,
  });
  assert.equal(stripped.status, "ready_for_confirmation");
  assert.equal(stripped.rows.length, 6);
  assert.equal(JSON.stringify(stripped).includes("Employee 1"), false);
  assert.equal(JSON.stringify(stripped).includes("employee1@example.com"), false);
});

test("one row-level PII value blocks every row and requests raw clearing", () => {
  const piiRow = productRows[1]!.replace("Product Engineer\tnone", "person@example.com\tnone");
  const result = prepareProductEngineerRoster([header, productRows[0]!, piiRow].join("\n"));

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.previewRows, []);
  assert.equal(result.shouldClearRaw, true);
  assert.deepEqual(result.issues, [{ sourceLineNumber: 3, code: "PII_VALUE" }]);
  assert.equal(JSON.stringify(result).includes("person@example.com"), false);
  assert.equal(JSON.stringify(result).includes("row_002"), false);
});

test("one non-Product Engineer row blocks the whole pilot input", () => {
  const mixedRow = productRows[1]!.replaceAll("Product Engineer", "Platform Engineer");
  const result = prepareProductEngineerRoster([header, productRows[0]!, mixedRow].join("\n"));

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.issues, [{ sourceLineNumber: 3, code: "UNSUPPORTED_ROLE" }]);
  assert.equal(result.shouldClearRaw, false);
});

test("one malformed required row blocks otherwise valid rows", () => {
  const missingSalary = productRows[1]!.replace("72000000", "");
  const result = prepareProductEngineerRoster([header, productRows[0]!, missingSalary].join("\n"));

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.issues, [{ sourceLineNumber: 3, code: "MISSING_REQUIRED_FIELD" }]);
});

test("clean Product Engineer input reaches normalized confirmation without raw text", () => {
  const result = prepareProductEngineerRoster(cleanPaste);

  assert.equal(result.status, "ready_for_confirmation");
  assert.equal(result.rows.length, 6);
  assert.equal(result.draft?.selection.selected[0]?.roleGroup, "Product Engineer");
  assert.equal(result.previewRows.find((row) => row.salaryKRW === 68_000_000)?.employeeLabel, "\uC9C1\uC6D0 A");
  assert.equal(result.previewRows.find((row) => row.salaryKRW === 95_000_000)?.employeeLabel, "\uC9C1\uC6D0 B");
  assert.equal(result.shouldClearRaw, true);
  assert.equal(JSON.stringify(result).includes(cleanPaste), false);
});

test("supported Product Engineer rows create one owned session draft", () => {
  const rows = prepareProductEngineerRoster(cleanPaste).rows;
  const result = createProductEngineerSessionDraft(rows);

  assert.equal(result.supported, true);
  if (!result.supported) return;
  assert.equal(result.draft.selection.selected.length, 1);
  assert.equal(result.draft.selection.selected[0]?.roleGroup, "Product Engineer");
  assert.equal(result.draft.activeThemeId, result.draft.selection.selected[0]?.id);
  const originalSalary = result.draft.rows[0]!.baseSalaryKRW;
  rows[0]!.baseSalaryKRW = 1;
  assert.equal(result.draft.rows[0]!.baseSalaryKRW, originalSalary);
});

test("rows without a supported comparison cannot start a session", () => {
  const sparsePaste = [header, productRows[0]!, productRows[1]!].join("\n");
  const prepared = prepareProductEngineerRoster(sparsePaste);

  assert.equal(prepared.status, "blocked");
  assert.deepEqual(prepared.rows, []);
  assert.deepEqual(prepared.issues, [{ code: "UNSUPPORTED_PRODUCT_ENGINEER_COMPARISON" }]);
});

test("a headline pair without tenure is rejected explicitly", () => {
  const rows = prepareProductEngineerRoster(cleanPaste).rows.map((row) => ({ ...row }));
  const lowerRank = rows.find((row) => row.rowId === "row_004")!;
  lowerRank.levelLabel = "L1";
  lowerRank.levelRank = 1;
  const higherRank = rows.find((row) => row.rowId === "row_001")!;
  higherRank.levelLabel = "L2";
  higherRank.levelRank = 2;
  delete higherRank.tenureMonths;
  const result = createProductEngineerSessionDraft(rows);

  assert.deepEqual(result, { supported: false, reason: "MISSING_HEADLINE_TENURE" });
});
