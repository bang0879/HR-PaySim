import assert from "node:assert/strict";
import test from "node:test";
import { strToU8, zipSync } from "fflate";

import {
  MAX_WORKBOOK_BYTES,
  readFacilitatorWorkbook,
  selectWorkbookSheet,
  workbookContainsFormula,
} from "../../src/features/facilitator-preparation/readFacilitatorWorkbook.ts";
import { KOREAN_ROSTER_HEADERS } from "../../src/lib/hr-paysim/preparation/koreanRosterAdapter.ts";

const rows = [
  [...KOREAN_ROSTER_HEADERS],
  [68_000_000, 10, 64, "Backend Engineer", "", "", "없음"],
  [72_000_000, 9, 56, "Backend Engineer", "", "", "없음"],
  [76_000_000, 8, 48, "Backend Engineer", "", "", "카운터오퍼"],
  [95_000_000, 7, 14, "Backend Engineer", "", "", "채용 예외"],
];

test("prefers 입력 양식 and otherwise accepts exactly one non-empty sheet", () => {
  assert.equal(selectWorkbookSheet([
    { sheet: "작성 예시", data: [["합성 예시"], [...KOREAN_ROSTER_HEADERS], ...rows.slice(1)] },
    { sheet: "입력 양식", data: rows },
  ]).sheet, "입력 양식");

  assert.equal(selectWorkbookSheet([
    { sheet: "작성 예시", data: [["합성 예시"], [...KOREAN_ROSTER_HEADERS], ...rows.slice(1)] },
    { sheet: "입력 양식", data: [[...KOREAN_ROSTER_HEADERS]] },
  ]).sheet, "입력 양식");

  assert.equal(selectWorkbookSheet([
    { sheet: "빈 시트", data: [[]] },
    { sheet: "회사 양식", data: rows },
  ]).sheet, "회사 양식");

  assert.throws(() => selectWorkbookSheet([
    { sheet: "A", data: rows },
    { sheet: "B", data: rows },
  ]), /AMBIGUOUS_WORKBOOK/);
  assert.throws(() => selectWorkbookSheet([
    { sheet: "A", data: [[]] },
  ]), /EMPTY_WORKBOOK/);
});

test("rejects unsupported type and size without invoking the workbook reader", async () => {
  let reads = 0;
  const readWorkbook = async () => {
    reads += 1;
    return [{ sheet: "입력 양식", data: rows }];
  };

  const wrongType = await readFacilitatorWorkbook(
    fakeFile("roster.xls", 100),
    { readWorkbook },
  );
  assert.deepEqual(wrongType.issues, [{ code: "UNSUPPORTED_FILE_TYPE" }]);

  const tooLarge = await readFacilitatorWorkbook(
    fakeFile("roster.xlsx", MAX_WORKBOOK_BYTES + 1),
    { readWorkbook },
  );
  assert.deepEqual(tooLarge.issues, [{ code: "FILE_TOO_LARGE" }]);
  assert.equal(reads, 0);
});

test("normalizes a selected workbook without returning filename, sheet, or raw rows", async () => {
  const result = await readFacilitatorWorkbook(
    fakeFile("private-roster.xlsx", 100),
    { readWorkbook: async () => [
      { sheet: "메모", data: [["이 값은 선택되지 않습니다"]] },
      { sheet: "입력 양식", data: rows },
    ] },
  );

  assert.equal(result.status, "ready_for_confirmation");
  assert.equal(result.rows.length, 4);
  const rendered = JSON.stringify(result);
  assert.equal(rendered.includes("private-roster.xlsx"), false);
  assert.equal(rendered.includes("입력 양식"), false);
  assert.equal(rendered.includes("이 값은 선택되지 않습니다"), false);
});

test("file-column consent applies only inside the current read invocation", async () => {
  const withName = rows.map((row, index) => index === 0 ? [...row, "이름"] : [...row, `직원 ${index}`]);
  let reviewedHeaders: readonly string[] = [];
  const confirmed = await readFacilitatorWorkbook(
    fakeFile("roster.xlsx", 100),
    {
      readWorkbook: async () => [{ sheet: "입력 양식", data: withName }],
      confirmProhibitedHeaders: async (headers) => {
        reviewedHeaders = [...headers];
        return true;
      },
    },
  );
  assert.deepEqual(reviewedHeaders, ["이름"]);
  assert.equal(confirmed.status, "ready_for_confirmation");

  const notConfirmed = await readFacilitatorWorkbook(
    fakeFile("other-roster.xlsx", 100),
    {
      readWorkbook: async () => [{ sheet: "입력 양식", data: withName }],
      confirmProhibitedHeaders: async () => false,
    },
  );
  assert.equal(notConfirmed.status, "needs_column_consent");
  assert.deepEqual(notConfirmed.prohibitedColumnHeaders, ["이름"]);
});
test("blocks real SpreadsheetML formula cells before cached values reach the adapter", async () => {
  const workbookBytes = zipSync({
    "xl/worksheets/sheet1.xml": strToU8([
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
      '<sheetData><row r="2"><c r="A2"><f>SUM(1,2)</f><v>3</v></c></row></sheetData>',
      '</worksheet>',
    ].join("")),
  });
  const file = binaryFile("formula.xlsx", workbookBytes);
  assert.equal(await workbookContainsFormula(file), true);

  let reads = 0;
  const blocked = await readFacilitatorWorkbook(file, {
    readWorkbook: async () => {
      reads += 1;
      return [{ sheet: "입력 양식", data: rows }];
    },
    inspectWorkbookFormulas: workbookContainsFormula,
  });
  assert.deepEqual(blocked.issues, [{ code: "UNREADABLE_WORKBOOK" }]);
  assert.equal(reads, 0);
});
test("detects self-closing and namespaced shared formula elements", async () => {
  for (const formulaElement of [
    "<f/>",
    '<x:f t="shared" si="0"/>',
  ]) {
    const bytes = zipSync({
      "xl/worksheets/sheet1.xml": strToU8(
        `<worksheet xmlns:x="urn:formula"><sheetData><c>${formulaElement}<v>3</v></c></sheetData></worksheet>`,
      ),
    });
    assert.equal(await workbookContainsFormula(binaryFile("formula.xlsx", bytes)), true);
  }
});

test("rejects excessive aggregate worksheet inflation and worksheet counts", async () => {
  const largeWorksheet = strToU8(
    `<worksheet>${"x".repeat(10 * 1024 * 1024 + 1)}</worksheet>`,
  );
  const aggregateBytes = zipSync({
    "xl/worksheets/sheet1.xml": largeWorksheet,
    "xl/worksheets/sheet2.xml": largeWorksheet,
  });
  await assert.rejects(
    workbookContainsFormula(binaryFile("aggregate.xlsx", aggregateBytes)),
    /WORKSHEET_XML_TOTAL_LIMIT/,
  );

  const manyWorksheets = Object.fromEntries(
    Array.from({ length: 33 }, (_, index) => [
      `xl/worksheets/sheet${index + 1}.xml`,
      strToU8("<worksheet/>"),
    ]),
  );
  await assert.rejects(
    workbookContainsFormula(binaryFile("many-sheets.xlsx", zipSync(manyWorksheets))),
    /WORKSHEET_COUNT_LIMIT/,
  );
});
test("maps sheet selection and parser failures to safe workbook issue codes", async () => {
  const ambiguous = await readFacilitatorWorkbook(
    fakeFile("roster.xlsx", 100),
    { readWorkbook: async () => [
      { sheet: "A", data: rows },
      { sheet: "B", data: rows },
    ] },
  );
  assert.deepEqual(ambiguous.issues, [{ code: "AMBIGUOUS_WORKBOOK" }]);

  const unreadable = await readFacilitatorWorkbook(
    fakeFile("roster.xlsx", 100),
    { readWorkbook: async () => {
      throw new Error("secret parser detail");
    } },
  );
  assert.deepEqual(unreadable.issues, [{ code: "UNREADABLE_WORKBOOK" }]);
  assert.equal(JSON.stringify(unreadable).includes("secret parser detail"), false);
});

function fakeFile(name: string, size: number): File {
  return { name, size } as File;
}
function binaryFile(name: string, bytes: Uint8Array): File {
  return {
    name,
    size: bytes.byteLength,
    arrayBuffer: async () => bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
  } as File;
}
