import assert from "node:assert/strict";
import test from "node:test";

import {
  adaptKoreanRosterTable,
  KOREAN_ROSTER_HEADERS,
} from "../../src/lib/hr-paysim/preparation/koreanRosterAdapter.ts";

const validRows: unknown[][] = [
  [68_000_000, 10, 64, "Product Engineer", "", "아니오", "아니오"],
  ["72,000,000", "9", "56", "", "PE2", "예", ""],
  [76_000_000, 8, 48, "", "", "", "아니오"],
  [95_000_000, 7, 14, "Senior Product Engineer", "", "예", "아니오"],
];

test("normalizes the exact Korean table into local IDs and fixed Product Engineer rows", () => {
  const result = adaptKoreanRosterTable([
    [...KOREAN_ROSTER_HEADERS],
    validRows[0]!,
    [],
    validRows[1]!,
    validRows[2]!,
    validRows[3]!,
  ]);

  assert.equal(result.status, "ready");
  assert.deepEqual(result.rows.map((row) => row.rowId), [
    "file_row_001",
    "file_row_002",
    "file_row_003",
    "file_row_004",
  ]);
  assert.ok(result.rows.every((row) => row.roleGroup === "Product Engineer"));
  assert.equal(result.rows[1]?.baseSalaryKRW, 72_000_000);
  assert.equal(result.rows[1]?.relevantExperienceMonths, 108);
  assert.equal(result.rows[1]?.tenureMonths, 56);
  assert.equal(result.rows[1]?.levelLabel, "PE2");
  assert.equal(result.rows[1]?.levelRank, undefined);
  assert.equal(result.rows[1]?.exceptionFlag, true);
  assert.equal(result.rows[1]?.counterOfferFlag, undefined);
  assert.deepEqual(result.records.map((record) => record.sourceLineNumber), [2, 4, 5, 6]);
});

test("requires per-source consent before stripping any unknown header", () => {
  const table = [
    ["이름", ...KOREAN_ROSTER_HEADERS],
    ...validRows.map((row, index) => ["직원 " + (index + 1), ...row]),
  ];

  const blocked = adaptKoreanRosterTable(table);
  assert.equal(blocked.status, "needs_column_consent");
  assert.deepEqual(blocked.prohibitedColumnHeaders, ["이름"]);
  assert.deepEqual(blocked.rows, []);

  const stripped = adaptKoreanRosterTable(table, { confirmPiiColumnStripping: true });
  assert.equal(stripped.status, "ready");
  assert.equal(stripped.rows.length, 4);
  assert.equal(JSON.stringify(stripped).includes("직원 1"), false);
});

test("fails closed on missing, duplicated, or aliased headers", () => {
  const missing = adaptKoreanRosterTable([
    KOREAN_ROSTER_HEADERS.filter((header) => header !== "관련 경력년수"),
    ...validRows.map((row) => row.filter((_, index) => index !== 1)),
  ]);
  assert.equal(missing.status, "blocked");
  assert.deepEqual(missing.issues, [{ code: "MISSING_HEADER", field: "relevant_experience" }]);

  const duplicated = adaptKoreanRosterTable([
    [...KOREAN_ROSTER_HEADERS, "기본연봉(원)"],
    ...validRows.map((row) => [...row, row[0]]),
  ]);
  assert.equal(duplicated.status, "blocked");
  assert.deepEqual(duplicated.issues, [{ code: "DUPLICATE_HEADER", field: "salary" }]);

  const aliased = adaptKoreanRosterTable([
    ["salary", ...KOREAN_ROSTER_HEADERS.slice(1)],
    ...validRows,
  ], { confirmPiiColumnStripping: true });
  assert.equal(aliased.status, "blocked");
  assert.deepEqual(aliased.issues, [{ code: "MISSING_HEADER", field: "salary" }]);
});

test("applies exact numeric, bounds, yes-no, and formula value rules", () => {
  const cases: Array<{ value: unknown; column: number; field: string }> = [
    { value: "68,000,000원", column: 0, field: "salary" },
    { value: 68_000_000.5, column: 0, field: "salary" },
    { value: "8년", column: 1, field: "relevant_experience" },
    { value: "8%", column: 1, field: "relevant_experience" },
    { value: 60.1, column: 1, field: "relevant_experience" },
    { value: 721, column: 2, field: "company_tenure" },
    { value: 12.5, column: 2, field: "company_tenure" },
    { value: "네", column: 5, field: "documented_exception" },
    { value: "=A2", column: 3, field: "title" },
  ];

  for (const item of cases) {
    const rows = validRows.map((row) => [...row]);
    rows[2]![item.column] = item.value;
    const result = adaptKoreanRosterTable([[...KOREAN_ROSTER_HEADERS], ...rows]);
    assert.equal(result.status, "blocked", item.field + ": " + String(item.value));
    assert.deepEqual(result.issues, [{
      sourceLineNumber: 4,
      code: "INVALID_FIELD_VALUE",
      field: item.field,
    }]);
    assert.deepEqual(result.rows, []);
    assert.equal(JSON.stringify(result).includes(String(item.value)), false);
  }
});

test("reports missing required values and PII by safe source row only", () => {
  const missingRows = validRows.map((row) => [...row]);
  missingRows[1]![1] = "";
  const missing = adaptKoreanRosterTable([
    [...KOREAN_ROSTER_HEADERS],
    missingRows[0]!,
    [],
    missingRows[1]!,
    missingRows[2]!,
    missingRows[3]!,
  ]);
  assert.equal(missing.status, "blocked");
  assert.deepEqual(missing.issues, [{
    sourceLineNumber: 4,
    code: "MISSING_REQUIRED_FIELD",
    field: "relevant_experience",
  }]);

  const piiRows = validRows.map((row) => [...row]);
  piiRows[0]![3] = "person@example.com";
  const pii = adaptKoreanRosterTable([[...KOREAN_ROSTER_HEADERS], ...piiRows]);
  assert.equal(pii.status, "blocked");
  assert.deepEqual(pii.issues, [{ sourceLineNumber: 2, code: "PII_VALUE" }]);
  assert.equal(JSON.stringify(pii).includes("person@example.com"), false);
});

test("requires four accepted rows and keeps generated IDs independent of sheet row numbers", () => {
  const tooFew = adaptKoreanRosterTable([
    [...KOREAN_ROSTER_HEADERS],
    validRows[0]!,
    [],
    validRows[1]!,
    validRows[2]!,
  ]);
  assert.equal(tooFew.status, "blocked");
  assert.deepEqual(tooFew.issues, [{ code: "TOO_FEW_ROWS" }]);
  assert.deepEqual(tooFew.rows, []);
});

test("treats a numeric Excel value as years because cell formatting is unavailable", () => {
  const rows = validRows.map((row) => [...row]);
  rows[0]![1] = 0.5;
  const result = adaptKoreanRosterTable([[...KOREAN_ROSTER_HEADERS], ...rows]);

  assert.equal(result.status, "ready");
  assert.equal(result.rows[0]?.relevantExperienceMonths, 6);
});