import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyPreparationResult,
  prepareProductEngineerRoster,
} from "../../src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts";
import { createProductEngineerSessionDraft } from "../../src/lib/hr-paysim/preparation/createProductEngineerSessionDraft.ts";
import { ROSTER_HEADERS } from "../../src/lib/hr-paysim/preparation/rosterTemplateContract.ts";

const header = ROSTER_HEADERS.join("\t");
const productRows = [
  "68000000\t10\t56\tProduct Engineer\t\t\t없음",
  "72000000\t9\t52\tProduct Engineer\t\t\t없음",
  "76000000\t8\t47\tProduct Engineer\t\t\t없음",
  "95000000\t7\t15\tProduct Engineer\t\t\t채용 예외",
  "92000000\t6.7\t21\tProduct Engineer\t\t\t카운터오퍼",
  "88000000\t6.3\t28\tProduct Engineer\t\t\t없음",
];

const cleanPaste = [header, ...productRows].join("\n");

test("empty input returns a non-startable empty result", () => {
  assert.deepEqual(prepareProductEngineerRoster(""), createEmptyPreparationResult());
});

test("prohibited columns require current-paste consent before rows are parsed", () => {
  const piiHeader = ["이름", "이메일", ...ROSTER_HEADERS].join("\t");
  const piiRows = productRows.map((row, index) =>
    ["직원 " + (index + 1), "employee" + (index + 1) + "@example.com", row].join("\t")
  );
  const blocked = prepareProductEngineerRoster([piiHeader, ...piiRows].join("\n"));

  assert.equal(blocked.status, "needs_column_consent");
  assert.deepEqual(blocked.prohibitedColumnHeaders, ["이름", "이메일"]);
  assert.deepEqual(blocked.rows, []);
  assert.equal(blocked.shouldClearRaw, false);

  const stripped = prepareProductEngineerRoster([piiHeader, ...piiRows].join("\n"), {
    confirmPiiColumnStripping: true,
  });
  assert.equal(stripped.status, "ready_for_confirmation");
  assert.equal(stripped.rows.length, 6);
  assert.equal(JSON.stringify(stripped).includes("직원 1"), false);
  assert.equal(JSON.stringify(stripped).includes("employee1@example.com"), false);
});

test("one row-level PII value blocks every row and requests raw clearing", () => {
  const piiRow = productRows[1]!.replace("Product Engineer", "person@example.com");
  const result = prepareProductEngineerRoster([header, productRows[0]!, piiRow, ...productRows.slice(2)].join("\n"));

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.previewRows, []);
  assert.equal(result.shouldClearRaw, true);
  assert.deepEqual(result.issues, [{ sourceLineNumber: 3, code: "PII_VALUE" }]);
  assert.equal(JSON.stringify(result).includes("person@example.com"), false);
  assert.equal(JSON.stringify(result).includes("file_row_002"), false);
});

test("the guided path generates internal IDs and preserves the explicit normalized role", () => {
  const result = prepareProductEngineerRoster(cleanPaste);

  assert.equal(result.status, "ready_for_confirmation");
  assert.deepEqual(result.rows.map((row) => row.rowId), [
    "file_row_001",
    "file_row_002",
    "file_row_003",
    "file_row_004",
    "file_row_005",
    "file_row_006",
  ]);
  assert.ok(result.rows.every((row) => row.roleGroup === "Product Engineer"));
  assert.equal(cleanPaste.includes("rowId"), false);
  assert.equal(cleanPaste.includes("roleGroup"), false);
});

test("one malformed required row blocks otherwise valid rows", () => {
  const missingSalary = productRows[1]!.replace("72000000", "");
  const result = prepareProductEngineerRoster([header, productRows[0]!, missingSalary, ...productRows.slice(2)].join("\n"));

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.issues, [{
    sourceLineNumber: 3,
    code: "MISSING_REQUIRED_FIELD",
    field: "salary",
  }]);
});

test("clean Product Engineer input reaches normalized confirmation without raw text", () => {
  const result = prepareProductEngineerRoster(cleanPaste);

  assert.equal(result.status, "ready_for_confirmation");
  assert.equal(result.rows.length, 6);
  assert.equal(result.draft?.selection.selected[0]?.roleGroup, "Product Engineer");
  assert.equal(result.previewRows.find((row) => row.salaryKRW === 68_000_000)?.employeeLabel, "직원 A");
  assert.equal(result.previewRows.find((row) => row.salaryKRW === 95_000_000)?.employeeLabel, "직원 B");
  assert.equal(result.previewRows[0]?.relevantExperienceMonths, 120);
  assert.equal(
    result.previewRows.find((row) => row.salaryKRW === 95_000_000)?.compensationExceptionReason,
    "hiring_exception",
  );
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

test("fewer than four rows and rows without a supported comparison fail differently", () => {
  const tooFew = prepareProductEngineerRoster([header, ...productRows.slice(0, 3)].join("\n"));
  assert.equal(tooFew.status, "blocked");
  assert.deepEqual(tooFew.issues, [{ code: "TOO_FEW_ROWS" }]);

  const closeSalaryRows = productRows.slice(0, 4).map((row, index) => {
    const cells = row.split("\t");
    cells[0] = String(68_000_000 + index * 1_000_000);
    return cells.join("\t");
  });
  const unsupported = prepareProductEngineerRoster([header, ...closeSalaryRows].join("\n"));
  assert.equal(unsupported.status, "blocked");
  assert.deepEqual(unsupported.issues, [{ code: "UNSUPPORTED_PRODUCT_ENGINEER_COMPARISON" }]);
});

test("a level headline pair without tenure is rejected explicitly", () => {
  const rows = prepareProductEngineerRoster(cleanPaste).rows.map((row) => ({ ...row }));
  const lowerRank = rows.find((row) => row.rowId === "file_row_004")!;
  lowerRank.levelLabel = "L1";
  lowerRank.levelRank = 1;
  const higherRank = rows.find((row) => row.rowId === "file_row_001")!;
  higherRank.levelLabel = "L2";
  higherRank.levelRank = 2;
  delete higherRank.tenureMonths;
  const result = createProductEngineerSessionDraft(rows);

  assert.deepEqual(result, { supported: false, reason: "MISSING_HEADLINE_TENURE" });
});