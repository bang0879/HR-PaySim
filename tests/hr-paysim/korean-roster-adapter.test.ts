import assert from "node:assert/strict";
import test from "node:test";

import { adaptKoreanRosterTable } from "../../src/lib/hr-paysim/preparation/koreanRosterAdapter.ts";
import { ROSTER_HEADERS } from "../../src/lib/hr-paysim/preparation/rosterTemplateContract.ts";

const validRows: unknown[][] = [
  [68_000_000, 10, 64, "Product Engineer", "", "", "없음"],
  ["72,000,000", "9", "56", "Product Engineer", "", "", "채용 예외"],
  [76_000_000, 8, 48, "Product Engineer", "", "", "카운터오퍼"],
  [95_000_000, 7, 14, "Software Engineer", "", "", "기타 문서화된 사유"],
];

test("uses the exact seven-column facilitator schema", () => {
  assert.deepEqual(ROSTER_HEADERS, [
    "기본연봉(원)",
    "관련 경력년수",
    "회사 근속개월",
    "직무",
    "직급",
    "직급 순서",
    "처우 예외적용 사유",
  ]);
});

test("normalizes superficial job variants without semantic role guessing", () => {
  const result = adaptKoreanRosterTable([
    [...ROSTER_HEADERS],
    [60_000_000, 2.5, 36, " Product  Engineer ", "L1", 1, "없음"],
    [68_000_000, 2, 12, "product engineer", "L1", 1, "카운터오퍼"],
    [72_000_000, 4, 48, "프로덕트 엔지니어", "L2", 2, "채용 예외"],
    [76_000_000, 3, 18, "Software Engineer", "L2", 2, "기타 문서화된 사유"],
  ]);

  assert.equal(result.status, "ready");
  assert.deepEqual(result.rows.map((row) => row.roleGroup), [
    "Product Engineer",
    "Product Engineer",
    "프로덕트 엔지니어",
    "Software Engineer",
  ]);
  assert.equal(result.rows[0]?.relevantExperienceMonths, 30);
  assert.equal(result.rows[0]?.levelLabel, "L1");
  assert.equal(result.rows[0]?.levelRank, 1);
  assert.deepEqual(
    result.records.map((record) => record.compensationExceptionReason),
    ["none", "counteroffer", "hiring_exception", "other_documented"],
  );
  assert.equal(result.rows[1]?.counterOfferFlag, true);
  assert.equal(result.rows[2]?.exceptionFlag, true);
  assert.equal(result.rows[3]?.exceptionFlag, true);
});

test("leaves grade evidence undefined when the whole job has no formal grades", () => {
  const result = adaptKoreanRosterTable([[...ROSTER_HEADERS], ...validRows]);

  assert.equal(result.status, "ready");
  assert.ok(result.rows.every((row) => row.levelLabel === undefined));
  assert.ok(result.rows.every((row) => row.levelRank === undefined));
});

test("blocks partial grade mappings without returning raw job or grade text", () => {
  const rows = [
    [68_000_000, 10, 64, "Sensitive Role", "Secret L1", 1, "없음"],
    [72_000_000, 9, 56, "Sensitive Role", "", "", "없음"],
    [76_000_000, 8, 48, "Sensitive Role", "Secret L2", 2, "없음"],
    [95_000_000, 7, 14, "Sensitive Role", "Secret L2", 2, "없음"],
  ];
  const result = adaptKoreanRosterTable([[...ROSTER_HEADERS], ...rows]);

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.issues, [{ code: "PARTIAL_GRADE_MAPPING" }]);
  assert.equal(JSON.stringify(result).includes("Sensitive Role"), false);
  assert.equal(JSON.stringify(result).includes("Secret L1"), false);
});

test("blocks contradictory grade mappings without returning raw job or grade text", () => {
  const rows = [
    [68_000_000, 10, 64, "Sensitive Role", "Secret L1", 1, "없음"],
    [72_000_000, 9, 56, "Sensitive Role", "Secret L1", 2, "없음"],
    [76_000_000, 8, 48, "Sensitive Role", "Secret L2", 3, "없음"],
    [95_000_000, 7, 14, "Sensitive Role", "Secret L2", 3, "없음"],
  ];
  const result = adaptKoreanRosterTable([[...ROSTER_HEADERS], ...rows]);

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.issues, [{ code: "CONTRADICTORY_GRADE_MAPPING" }]);
  assert.equal(JSON.stringify(result).includes("Sensitive Role"), false);
  assert.equal(JSON.stringify(result).includes("Secret L1"), false);
});

test("requires per-source consent before stripping any unknown header", () => {
  const table = [
    ["이름", ...ROSTER_HEADERS],
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
    ROSTER_HEADERS.filter((header) => header !== "관련 경력년수"),
    ...validRows.map((row) => row.filter((_, index) => index !== 1)),
  ]);
  assert.equal(missing.status, "blocked");
  assert.deepEqual(missing.issues, [{ code: "MISSING_HEADER", field: "relevant_experience" }]);

  const duplicated = adaptKoreanRosterTable([
    [...ROSTER_HEADERS, "기본연봉(원)"],
    ...validRows.map((row) => [...row, row[0]]),
  ]);
  assert.equal(duplicated.status, "blocked");
  assert.deepEqual(duplicated.issues, [{ code: "DUPLICATE_HEADER", field: "salary" }]);

  const aliased = adaptKoreanRosterTable([
    ["salary", ...ROSTER_HEADERS.slice(1)],
    ...validRows,
  ], { confirmPiiColumnStripping: true });
  assert.equal(aliased.status, "blocked");
  assert.deepEqual(aliased.issues, [{ code: "MISSING_HEADER", field: "salary" }]);
});

test("applies exact numeric, bounds, controlled-category, and formula value rules", () => {
  const cases: Array<{ value: unknown; column: number; field: string }> = [
    { value: "68,000,000원", column: 0, field: "salary" },
    { value: 68_000_000.5, column: 0, field: "salary" },
    { value: "8년", column: 1, field: "relevant_experience" },
    { value: "8%", column: 1, field: "relevant_experience" },
    { value: 60.1, column: 1, field: "relevant_experience" },
    { value: 721, column: 2, field: "company_tenure" },
    { value: 12.5, column: 2, field: "company_tenure" },
    { value: 1.5, column: 5, field: "grade_rank" },
    { value: "임의 사유", column: 6, field: "compensation_exception_reason" },
    { value: "=A2", column: 3, field: "job" },
  ];

  for (const item of cases) {
    const rows = validRows.map((row) => [...row]);
    rows[2]![item.column] = item.value;
    const result = adaptKoreanRosterTable([[...ROSTER_HEADERS], ...rows]);
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
    [...ROSTER_HEADERS],
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
  const pii = adaptKoreanRosterTable([[...ROSTER_HEADERS], ...piiRows]);
  assert.equal(pii.status, "blocked");
  assert.deepEqual(pii.issues, [{ sourceLineNumber: 2, code: "PII_VALUE" }]);
  assert.equal(JSON.stringify(pii).includes("person@example.com"), false);
});

test("requires four accepted rows and keeps generated IDs independent of sheet row numbers", () => {
  const tooFew = adaptKoreanRosterTable([
    [...ROSTER_HEADERS],
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
  const result = adaptKoreanRosterTable([[...ROSTER_HEADERS], ...rows]);

  assert.equal(result.status, "ready");
  assert.equal(result.rows[0]?.relevantExperienceMonths, 6);
});