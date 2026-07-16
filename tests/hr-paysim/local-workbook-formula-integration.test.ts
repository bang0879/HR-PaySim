import assert from "node:assert/strict";
import test from "node:test";

import { readFacilitatorWorkbook } from "../../src/features/facilitator-preparation/readFacilitatorWorkbook.ts";
import { KOREAN_ROSTER_HEADERS } from "../../src/lib/hr-paysim/preparation/koreanRosterAdapter.ts";

const rows = [
  [...KOREAN_ROSTER_HEADERS],
  [68_000_000, 10, 64, "Backend Engineer", "", "", "없음"],
  [72_000_000, 9, 56, "Backend Engineer", "", "", "없음"],
  [76_000_000, 8, 48, "Backend Engineer", "", "", "카운터오퍼"],
  [95_000_000, 7, 14, "Backend Engineer", "", "", "채용 예외"],
];

test("uses saved formula values on the selected input sheet", async () => {
  let reads = 0;
  const result = await readFacilitatorWorkbook(fakeFile("roster.xlsx", 100), {
    snapshotWorkbookFormulas: async (file) => ({
      file,
      sheetFormulaStatus: new Map([
        ["작성 예시", "none"],
        ["입력 양식", "saved_values"],
      ]),
    }),
    readWorkbook: async () => {
      reads += 1;
      return [{ sheet: "입력 양식", data: rows }];
    },
  });

  assert.equal(reads, 1);
  assert.equal(result.status, "ready_for_confirmation");
  assert.equal(result.usedFormulaSnapshot, true);
});

test("blocks unavailable formulas only when they belong to the selected sheet", async () => {
  const result = await readFacilitatorWorkbook(fakeFile("roster.xlsx", 100), {
    snapshotWorkbookFormulas: async (file) => ({
      file,
      sheetFormulaStatus: new Map([
        ["작성 예시", "saved_values"],
        ["입력 양식", "unavailable"],
      ]),
    }),
    readWorkbook: async () => [{ sheet: "입력 양식", data: rows }],
  });

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.issues, [{ code: "FORMULA_RESULT_UNAVAILABLE" }]);
});

test("ignores unavailable formulas on a non-selected sheet", async () => {
  const result = await readFacilitatorWorkbook(fakeFile("roster.xlsx", 100), {
    snapshotWorkbookFormulas: async (file) => ({
      file,
      sheetFormulaStatus: new Map([
        ["작성 예시", "unavailable"],
        ["입력 양식", "none"],
      ]),
    }),
    readWorkbook: async () => [
      { sheet: "작성 예시", data: [["안내"]] },
      { sheet: "입력 양식", data: rows },
    ],
  });

  assert.equal(result.status, "ready_for_confirmation");
  assert.equal(result.usedFormulaSnapshot, false);
});

test("preserves the formula snapshot flag through file-column consent", async () => {
  const withName = rows.map((row, index) =>
    index === 0 ? [...row, "이름"] : [...row, `직원 ${index}`]
  );
  const result = await readFacilitatorWorkbook(fakeFile("roster.xlsx", 100), {
    snapshotWorkbookFormulas: async (file) => ({
      file,
      sheetFormulaStatus: new Map([["입력 양식", "saved_values"]]),
    }),
    readWorkbook: async () => [{ sheet: "입력 양식", data: withName }],
    confirmProhibitedHeaders: async () => true,
  });

  assert.equal(result.status, "ready_for_confirmation");
  assert.equal(result.usedFormulaSnapshot, true);
});

function fakeFile(name: string, size: number): File {
  return { name, size } as File;
}
