import assert from "node:assert/strict";
import test from "node:test";
import { parseRosterPaste } from "../../src/lib/hr-paysim/rosterParser.ts";
import { detectStructuralFindings } from "../../src/lib/hr-paysim/structuralFindings.ts";

const cleanPaste = [
  "rowId\troleGroup\ttitle\tlevelLabel\tlevelRank\tbaseSalaryKRW\tstartDate\ttenureMonths\texceptionFlag\tcounterOfferFlag\tmanagerLabel\tteamLabel",
  "row_001\tProduct Engineer\tProduct Engineer\tnone\t\t68000000\t2022-01-01\t54\tfalse\tfalse\tAlice Kim\tProduct Core",
  "row_002\tProduct Engineer\tProduct Engineer\tnone\t\t72000000\t2022-07-01\t48\tfalse\tfalse\tAlice Kim\tProduct Core",
].join("\n");

test("parseRosterPaste normalizes clean sheet paste without retaining raw text", () => {
  const result = parseRosterPaste(cleanPaste);

  assert.deepEqual(result.errors, []);
  assert.equal(result.requiresPiiColumnConfirmation, false);
  assert.equal(result.report.acceptedRowCount, 2);
  assert.equal(result.report.rawTextPersisted, false);
  assert.equal(result.rows[0]?.baseSalaryKRW, 68000000);
  assert.equal(result.rows[0]?.levelRank, undefined);
  assert.equal(result.rows[0]?.managerLabel, "manager_1");
  assert.equal(result.rows[0]?.teamLabel, "team_1");
  assert.equal(JSON.stringify(result).includes("Alice Kim"), false);
  assert.equal(JSON.stringify(result).includes("Product Core"), false);
  assert.equal(JSON.stringify(result).includes(cleanPaste), false);
});

test("parseRosterPaste requires confirmation before stripping PII-like columns", () => {
  const pasteWithPiiColumns = [
    "name\temail\trowId\troleGroup\ttitle\tlevelLabel\tlevelRank\tbaseSalaryKRW\tstartDate\ttenureMonths\texceptionFlag\tcounterOfferFlag\tmanagerLabel\tteamLabel",
    "Jane Founder\tjane@example.com\trow_001\tProduct Engineer\tProduct Engineer\tnone\t\t68000000\t2022-01-01\t54\tfalse\tfalse\tAlice Kim\tProduct Core",
  ].join("\n");

  const blocked = parseRosterPaste(pasteWithPiiColumns);
  assert.equal(blocked.requiresPiiColumnConfirmation, true);
  assert.deepEqual(blocked.rows, []);
  assert.deepEqual(blocked.report.rejectedColumnHeaders, ["name", "email"]);

  const confirmed = parseRosterPaste(pasteWithPiiColumns, { confirmPiiColumnStripping: true });
  assert.equal(confirmed.requiresPiiColumnConfirmation, false);
  assert.equal(confirmed.rows.length, 1);
  assert.deepEqual(confirmed.report.rejectedColumnHeaders, ["name", "email"]);
  assert.ok(confirmed.warnings.some((warning) => warning.includes("PII")));
  assert.equal(JSON.stringify(confirmed).includes("Jane Founder"), false);
  assert.equal(JSON.stringify(confirmed).includes("jane@example.com"), false);
});

test("parseRosterPaste blocks rows with PII-like values in retained fields", () => {
  const pasteWithPiiValue = [
    "rowId\troleGroup\ttitle\tlevelLabel\tlevelRank\tbaseSalaryKRW\tstartDate\ttenureMonths\texceptionFlag\tcounterOfferFlag\tmanagerLabel\tteamLabel",
    "row_001\tProduct Engineer\tProduct Engineer\tnone\t\t68000000\t2022-01-01\t54\tfalse\tfalse\tmanager_raw\tteam_raw",
    "row_002\tProduct Engineer\tperson@example.com\tnone\t\t72000000\t2022-07-01\t48\tfalse\tfalse\tmanager_raw\tteam_raw",
  ].join("\n");

  const result = parseRosterPaste(pasteWithPiiValue);

  assert.equal(result.rows.length, 1);
  assert.deepEqual(result.rows.map((row) => row.rowId), ["row_001"]);
  assert.ok(result.errors.some((error) => error.includes("row_002")));
  assert.deepEqual(result.report.rejectedValuePatterns, ["email"]);
  assert.equal(JSON.stringify(result).includes("person@example.com"), false);
});

test("parseRosterPaste output can feed the structural findings detector", () => {
  const productEngineerPaste = [
    "rowId\troleGroup\ttitle\tlevelLabel\tlevelRank\tbaseSalaryKRW\tstartDate\ttenureMonths\texceptionFlag\tcounterOfferFlag\tmanagerLabel\tteamLabel",
    "row_001\tProduct Engineer\tProduct Engineer\tnone\t\t68000000\t2021-11-01\t56\tfalse\tfalse\tmanager_a\tteam_a",
    "row_002\tProduct Engineer\tProduct Engineer\tnone\t\t72000000\t2022-03-01\t52\tfalse\tfalse\tmanager_a\tteam_a",
    "row_003\tProduct Engineer\tProduct Engineer\tnone\t\t76000000\t2022-08-01\t47\tfalse\tfalse\tmanager_a\tteam_a",
    "row_004\tProduct Engineer\tProduct Engineer\tnone\t\t95000000\t2025-04-01\t15\ttrue\tfalse\tmanager_a\tteam_a",
    "row_005\tProduct Engineer\tProduct Engineer\tnone\t\t92000000\t2024-10-01\t21\tfalse\ttrue\tmanager_a\tteam_a",
    "row_006\tProduct Engineer\tProduct Engineer\tnone\t\t88000000\t2024-03-01\t28\tfalse\tfalse\tmanager_a\tteam_a",
  ].join("\n");

  const parsed = parseRosterPaste(productEngineerPaste);
  const findings = detectStructuralFindings(parsed.rows);

  assert.equal(parsed.rows.length, 6);
  assert.ok(findings.some((finding) => finding.type === "shadow_band" && finding.roleGroup === "Product Engineer"));
});