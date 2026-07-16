import assert from "node:assert/strict";
import test from "node:test";
import {
  strFromU8,
  strToU8,
  unzipSync,
  zipSync,
} from "fflate";

import {
  snapshotWorkbookFormulaValues,
} from "../../src/features/facilitator-preparation/snapshotWorkbookFormulaValues.ts";

test("replaces formula elements with their saved scalar values", async () => {
  const file = workbookFile({
    inputCells: [
      '<c r="A2" t="n"><f>RANDBETWEEN(50000000,90000000)</f><v>65000000</v></c>',
      '<c r="F2" t="n"><f t="shared" si="0"/><v>2</v></c>',
      '<c r="G2" t="str"><x:f>RIGHT(&quot;없음&quot;,2)</x:f><v>없음</v></c>',
    ],
  });

  const snapshot = await snapshotWorkbookFormulaValues(file);
  const archive = unzipSync(new Uint8Array(await snapshot.file.arrayBuffer()));
  const inputXml = strFromU8(archive["xl/worksheets/sheet2.xml"]!);

  assert.equal(snapshot.sheetFormulaStatus.get("작성 예시"), "none");
  assert.equal(snapshot.sheetFormulaStatus.get("입력 양식"), "saved_values");
  assert.doesNotMatch(inputXml, /<(?:[A-Za-z_][\w.-]*:)?f(?:\s|\/?>)/);
  assert.match(inputXml, /<c r="A2" t="n"><v>65000000<\/v><\/c>/);
  assert.match(inputXml, /<c r="F2" t="n"><v>2<\/v><\/c>/);
  assert.match(inputXml, /<c r="G2" t="str"><v>없음<\/v><\/c>/);
});

test("marks missing and error cached results unavailable without exposing formula text", async () => {
  const snapshot = await snapshotWorkbookFormulaValues(workbookFile({
    inputCells: [
      '<c r="A2" t="n"><f>SUM(1,2)</f></c>',
      '<c r="F2" t="e"><f>1/0</f><v>#DIV/0!</v></c>',
    ],
  }));

  assert.equal(snapshot.sheetFormulaStatus.get("입력 양식"), "unavailable");
  assert.equal(JSON.stringify([...snapshot.sheetFormulaStatus]).includes("SUM"), false);
  assert.equal(JSON.stringify([...snapshot.sheetFormulaStatus]).includes("DIV"), false);
});

test("tracks formula availability independently for each named sheet", async () => {
  const snapshot = await snapshotWorkbookFormulaValues(workbookFile({
    exampleCells: ['<c r="A1"><f>1+1</f></c>'],
    inputCells: ['<c r="A2" t="n"><f>1+2</f><v>3</v></c>'],
  }));

  assert.equal(snapshot.sheetFormulaStatus.get("작성 예시"), "unavailable");
  assert.equal(snapshot.sheetFormulaStatus.get("입력 양식"), "saved_values");
});

test("returns the original file when no worksheet contains formulas", async () => {
  const file = workbookFile({
    inputCells: ['<c r="A2" t="n"><v>65000000</v></c>'],
  });

  const snapshot = await snapshotWorkbookFormulaValues(file);

  assert.equal(snapshot.file, file);
  assert.deepEqual([...snapshot.sheetFormulaStatus], [
    ["작성 예시", "none"],
    ["입력 양식", "none"],
  ]);
});

test("returns a browser-compatible File after formula transformation", async () => {
  const file = workbookFile({
    inputCells: ['<c r="A2" t="n"><f>64000000+1000000</f><v>65000000</v></c>'],
  });

  const snapshot = await snapshotWorkbookFormulaValues(file);

  assert.ok(snapshot.file instanceof File);
  assert.equal(snapshot.file.name, file.name);
  assert.equal(snapshot.file.type, file.type);
});

test("rejects worksheet count and aggregate worksheet inflation before transformation", async () => {
  const manyWorksheets = Object.fromEntries(
    Array.from({ length: 33 }, (_, index) => [
      `xl/worksheets/sheet${index + 1}.xml`,
      strToU8("<worksheet/>"),
    ]),
  );
  await assert.rejects(
    snapshotWorkbookFormulaValues(binaryFile("many.xlsx", zipSync(manyWorksheets))),
    /WORKSHEET_COUNT_LIMIT/,
  );

  const largeWorksheet = strToU8(
    `<worksheet>${"x".repeat(10 * 1024 * 1024 + 1)}</worksheet>`,
  );
  await assert.rejects(
    snapshotWorkbookFormulaValues(binaryFile("aggregate.xlsx", zipSync({
      "xl/worksheets/sheet1.xml": largeWorksheet,
      "xl/worksheets/sheet2.xml": largeWorksheet,
    }))),
    /WORKSHEET_XML_TOTAL_LIMIT/,
  );
});

function workbookFile({
  exampleCells = [],
  inputCells = [],
}: {
  exampleCells?: readonly string[];
  inputCells?: readonly string[];
}): File {
  return binaryFile("roster.xlsx", zipSync({
    "xl/workbook.xml": strToU8([
      '<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
      "<sheets>",
      '<sheet name="작성 예시" sheetId="1" r:id="rId1"/>',
      '<sheet name="입력 양식" sheetId="2" r:id="rId2"/>',
      "</sheets>",
      "</workbook>",
    ].join("")),
    "xl/_rels/workbook.xml.rels": strToU8([
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
      '<Relationship Id="rId1" Target="worksheets/sheet1.xml"/>',
      '<Relationship Id="rId2" Target="worksheets/sheet2.xml"/>',
      "</Relationships>",
    ].join("")),
    "xl/worksheets/sheet1.xml": worksheet(exampleCells),
    "xl/worksheets/sheet2.xml": worksheet(inputCells),
  }));
}

function worksheet(cells: readonly string[]): Uint8Array {
  return strToU8([
    '<worksheet xmlns:x="urn:formula">',
    `<sheetData><row r="1">${cells.join("")}</row></sheetData>`,
    "</worksheet>",
  ].join(""));
}

function binaryFile(name: string, bytes: Uint8Array): File {
  return {
    name,
    size: bytes.byteLength,
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    arrayBuffer: async () => bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
  } as File;
}
