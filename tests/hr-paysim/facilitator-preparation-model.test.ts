import assert from "node:assert/strict";
import test from "node:test";
import * as preparationModule from "../../src/lib/hr-paysim/preparation/prepareFacilitatorRoster.ts";
import * as draftModule from "../../src/lib/hr-paysim/preparation/createFacilitatorSessionDraft.ts";
import {
  createEmptyPreparationResult,
  prepareFacilitatorRoster,
} from "../../src/lib/hr-paysim/preparation/prepareFacilitatorRoster.ts";
import { createFacilitatorSessionDraft } from "../../src/lib/hr-paysim/preparation/createFacilitatorSessionDraft.ts";
import { ROSTER_HEADERS } from "../../src/lib/hr-paysim/preparation/rosterTemplateContract.ts";

const header = ROSTER_HEADERS.join("\t");
const roleRows = [
  "68000000\t10\t56\tBackend Engineer\t\t\t없음",
  "72000000\t9\t52\tBackend Engineer\t\t\t없음",
  "76000000\t8\t47\tBackend Engineer\t\t\t없음",
  "95000000\t7\t15\tBackend Engineer\t\t\t채용 예외",
  "92000000\t6.7\t21\tBackend Engineer\t\t\t카운터오퍼",
  "88000000\t6.3\t28\tBackend Engineer\t\t\t없음",
];

const cleanPaste = [header, ...roleRows].join("\n");
const multiRolePaste = [
  header,
  "60000000\t10\t60\tBackend Engineer\t\t\t없음",
  "75000000\t7\t12\tBackend Engineer\t\t\t없음",
  "85000000\t5\t10\tBackend Engineer\t\t\t없음",
  "70000000\t8\t50\tBackend Engineer\t\t\t없음",
  "50000000\t4\t20\tOperations\t\t\t없음",
  "51000000\t3\t10\tOperations\t\t\t없음",
].join("\n");

test("exports only role-agnostic facilitator preparation APIs", () => {
  assert.deepEqual(Object.keys(preparationModule).sort(), [
    "createEmptyPreparationResult",
    "prepareFacilitatorKoreanTable",
    "prepareFacilitatorRoster",
  ]);
  assert.deepEqual(Object.keys(draftModule), ["createFacilitatorSessionDraft"]);
});

test("empty input returns a non-startable empty result", () => {
  assert.deepEqual(prepareFacilitatorRoster(""), createEmptyPreparationResult());
});

test("prohibited columns require current-paste consent before rows are parsed", () => {
  const piiHeader = ["이름", "이메일", ...ROSTER_HEADERS].join("\t");
  const piiRows = roleRows.map((row, index) =>
    ["실명" + (index + 1), "employee" + (index + 1) + "@example.com", row].join("\t")
  );
  const blocked = prepareFacilitatorRoster([piiHeader, ...piiRows].join("\n"));

  assert.equal(blocked.status, "needs_column_consent");
  assert.deepEqual(blocked.prohibitedColumnHeaders, ["이름", "이메일"]);
  assert.deepEqual(blocked.rows, []);
  assert.equal(blocked.shouldClearRaw, false);

  const stripped = prepareFacilitatorRoster([piiHeader, ...piiRows].join("\n"), {
    confirmPiiColumnStripping: true,
  });
  assert.equal(stripped.status, "ready_for_confirmation");
  assert.equal(stripped.rows.length, 6);
  assert.equal(JSON.stringify(stripped).includes("실명1"), false);
  assert.equal(JSON.stringify(stripped).includes("employee1@example.com"), false);
});

test("one row-level PII value blocks every row and requests raw clearing", () => {
  const piiRow = roleRows[1]!.replace("Backend Engineer", "person@example.com");
  const result = prepareFacilitatorRoster([header, roleRows[0]!, piiRow, ...roleRows.slice(2)].join("\n"));

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.previewRows, []);
  assert.equal(result.shouldClearRaw, true);
  assert.deepEqual(result.issues, [{ sourceLineNumber: 3, code: "PII_VALUE" }]);
  assert.equal(JSON.stringify(result).includes("person@example.com"), false);
  assert.equal(JSON.stringify(result).includes("file_row_002"), false);
});

test("the guided path generates internal IDs and preserves the explicit normalized role", () => {
  const result = prepareFacilitatorRoster(cleanPaste);

  assert.equal(result.status, "ready_for_confirmation");
  assert.deepEqual(result.rows.map((row) => row.rowId), [
    "file_row_001",
    "file_row_002",
    "file_row_003",
    "file_row_004",
    "file_row_005",
    "file_row_006",
  ]);
  assert.ok(result.rows.every((row) => row.roleGroup === "Backend Engineer"));
  assert.equal(cleanPaste.includes("rowId"), false);
  assert.equal(cleanPaste.includes("roleGroup"), false);
});

test("one malformed required row blocks otherwise valid rows", () => {
  const missingSalary = roleRows[1]!.replace("72000000", "");
  const result = prepareFacilitatorRoster([header, roleRows[0]!, missingSalary, ...roleRows.slice(2)].join("\n"));

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.issues, [{
    sourceLineNumber: 3,
    code: "MISSING_REQUIRED_FIELD",
    field: "salary",
  }]);
});

test("clean role input reaches normalized confirmation with neutral labels and exact reasons", () => {
  const result = prepareFacilitatorRoster(cleanPaste);

  assert.equal(result.status, "ready_for_confirmation");
  assert.equal(result.rows.length, 6);
  assert.equal(result.draft?.selection.selected[0]?.roleGroup, "Backend Engineer");
  assert.equal(result.previewRows.find((row) => row.salaryKRW === 68_000_000)?.employeeLabel, "직원 1");
  assert.equal(result.previewRows.find((row) => row.salaryKRW === 95_000_000)?.employeeLabel, "직원 4");
  assert.equal(result.previewRows[0]?.relevantExperienceMonths, 120);
  assert.equal(
    result.previewRows.find((row) => row.salaryKRW === 95_000_000)?.compensationExceptionReason,
    "hiring_exception",
  );
  assert.equal(result.shouldClearRaw, true);
  assert.equal(JSON.stringify(result).includes(cleanPaste), false);
});

test("prepares a multi-role session and resets preview numbering inside each role", () => {
  const prepared = prepareFacilitatorRoster(multiRolePaste);
  assert.equal(prepared.status, "ready_for_confirmation");
  assert.ok(prepared.draft);
  assert.equal(prepared.draft?.activeThemeId, prepared.draft?.selection.selected[0]?.id);
  assert.equal(prepared.rows.some((row) => row.roleGroup === "Operations"), true);
  assert.equal(
    prepared.draft?.selection.selected.some((theme) => theme.roleGroup === "Operations"),
    false,
  );
  assert.deepEqual(
    prepared.previewRows
      .filter((row) => row.roleGroup === "Backend Engineer")
      .map((row) => row.employeeLabel),
    ["직원 1", "직원 2", "직원 3", "직원 4"],
  );
  assert.deepEqual(
    prepared.previewRows
      .filter((row) => row.roleGroup === "Operations")
      .map((row) => row.employeeLabel),
    ["직원 1", "직원 2"],
  );

  const direct = createFacilitatorSessionDraft(prepared.rows);
  assert.equal(direct.supported, true);
});

test("supported role rows create one owned session draft", () => {
  const rows = prepareFacilitatorRoster(cleanPaste).rows;
  const result = createFacilitatorSessionDraft(rows);

  assert.equal(result.supported, true);
  if (!result.supported) return;
  assert.equal(result.draft.selection.selected.length, 1);
  assert.equal(result.draft.selection.selected[0]?.roleGroup, "Backend Engineer");
  assert.equal(result.draft.activeThemeId, result.draft.selection.selected[0]?.id);
  const originalSalary = result.draft.rows[0]!.baseSalaryKRW;
  rows[0]!.baseSalaryKRW = 1;
  assert.equal(result.draft.rows[0]!.baseSalaryKRW, originalSalary);
});

test("fewer than four rows and rows without a supported comparison fail differently", () => {
  const tooFew = prepareFacilitatorRoster([header, ...roleRows.slice(0, 3)].join("\n"));
  assert.equal(tooFew.status, "blocked");
  assert.deepEqual(tooFew.issues, [{ code: "TOO_FEW_ROWS" }]);

  const closeSalaryRows = roleRows.slice(0, 4).map((row, index) => {
    const cells = row.split("\t");
    cells[0] = String(68_000_000 + index * 1_000_000);
    return cells.join("\t");
  });
  const unsupported = prepareFacilitatorRoster([header, ...closeSalaryRows].join("\n"));
  assert.equal(unsupported.status, "blocked");
  assert.deepEqual(unsupported.issues, [{ code: "NO_SUPPORTED_REVIEW_SUBJECT" }]);
});

test("a level headline pair without tenure is rejected explicitly", () => {
  const rows = prepareFacilitatorRoster(cleanPaste).rows.map((row) => ({ ...row }));
  const lowerRank = rows.find((row) => row.rowId === "file_row_004")!;
  lowerRank.levelLabel = "L1";
  lowerRank.levelRank = 1;
  const higherRank = rows.find((row) => row.rowId === "file_row_001")!;
  higherRank.levelLabel = "L2";
  higherRank.levelRank = 2;
  delete higherRank.tenureMonths;
  const result = createFacilitatorSessionDraft(rows);

  assert.deepEqual(result, { supported: false, reason: "MISSING_HEADLINE_TENURE" });
});
