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

test("supports namespaced workbook, sheet, cell, formula, and cached-value tags", async () => {
  const file = binaryFile("namespaced.xlsx", zipSync({
    "xl/workbook.xml": strToU8([
      '<x:workbook xmlns:x="urn:sheet" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
      "<x:sheets>",
      '<x:sheet name="입력 양식" sheetId="1" r:id="rId1"/>',
      "</x:sheets>",
      "</x:workbook>",
    ].join("")),
    "xl/_rels/workbook.xml.rels": strToU8([
      '<p:Relationships xmlns:p="urn:package">',
      '<p:Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>',
      "</p:Relationships>",
    ].join("")),
    "xl/worksheets/sheet1.xml": strToU8([
      '<x:worksheet xmlns:x="urn:sheet">',
      '<x:sheetData><x:row r="2">',
      '<x:c r="A2" t="n"><x:f>64000000+1000000</x:f><x:v>65000000</x:v></x:c>',
      "</x:row></x:sheetData>",
      "</x:worksheet>",
    ].join("")),
  }));

  const snapshot = await snapshotWorkbookFormulaValues(file);
  const transformed = unzipSync(new Uint8Array(await snapshot.file.arrayBuffer()));
  const worksheetXml = strFromU8(transformed["xl/worksheets/sheet1.xml"]!);

  assert.equal(snapshot.sheetFormulaStatus.get("입력 양식"), "saved_values");
  assert.doesNotMatch(worksheetXml, /<x:f\b/);
  assert.match(worksheetXml, /<x:v>65000000<\/x:v>/);
});

test("transforms the exact worksheet part targeted by its relationship", async () => {
  const file = binaryFile("custom-target.xlsx", zipSync({
    "xl/workbook.xml": strToU8([
      '<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>',
      '<sheet name="입력 양식" sheetId="1" r:id="rId1"/>',
      "</sheets></workbook>",
    ].join("")),
    "xl/_rels/workbook.xml.rels": strToU8([
      "<Relationships>",
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="custom/input.xml"/>',
      "</Relationships>",
    ].join("")),
    "xl/custom/input.xml": strToU8(
      '<worksheet><sheetData><row r="2"><c r="A2"><f>1+2</f><v>3</v></c></row></sheetData></worksheet>',
    ),
  }));

  const snapshot = await snapshotWorkbookFormulaValues(file);
  const transformed = unzipSync(new Uint8Array(await snapshot.file.arrayBuffer()));

  assert.equal(snapshot.sheetFormulaStatus.get("입력 양식"), "saved_values");
  assert.doesNotMatch(strFromU8(transformed["xl/custom/input.xml"]!), /<f\b/);
});

test("fails closed when a relationship-targeted worksheet part is missing", async () => {
  const file = binaryFile("missing-target.xlsx", zipSync({
    "xl/workbook.xml": strToU8([
      '<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>',
      '<sheet name="입력 양식" sheetId="1" r:id="rId1"/>',
      "</sheets></workbook>",
    ].join("")),
    "xl/_rels/workbook.xml.rels": strToU8([
      "<Relationships>",
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="custom/missing.xml"/>',
      "</Relationships>",
    ].join("")),
  }));

  await assert.rejects(snapshotWorkbookFormulaValues(file), /WORKBOOK_PART_MISSING/);
});

test("fails closed when a sheet relationship omits its worksheet type", async () => {
  const file = binaryFile("missing-type.xlsx", zipSync({
    "xl/workbook.xml": strToU8([
      '<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>',
      '<sheet name="입력 양식" sheetId="1" r:id="rId1"/>',
      "</sheets></workbook>",
    ].join("")),
    "xl/_rels/workbook.xml.rels": strToU8([
      "<Relationships>",
      '<Relationship Id="rId1" Target="worksheets/sheet1.xml"/>',
      "</Relationships>",
    ].join("")),
    "xl/worksheets/sheet1.xml": worksheet([]),
  }));

  await assert.rejects(
    snapshotWorkbookFormulaValues(file),
    /WORKBOOK_RELATIONSHIP_TYPE_INVALID/,
  );
});

test("resolves the workbook relationship id through its declared namespace prefix", async () => {
  const file = binaryFile("alternate-prefix.xlsx", zipSync({
    "xl/workbook.xml": strToU8([
      '<x:workbook xmlns:x="urn:sheet" xmlns:rel="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
      "<x:sheets>",
      '<x:sheet name="입력 양식" sheetId="1" rel:id="rId1"/>',
      "</x:sheets></x:workbook>",
    ].join("")),
    "xl/_rels/workbook.xml.rels": strToU8([
      "<Relationships>",
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>',
      "</Relationships>",
    ].join("")),
    "xl/worksheets/sheet1.xml": worksheet([
      '<c r="A2"><f>1+2</f><v>3</v></c>',
    ]),
  }));

  const snapshot = await snapshotWorkbookFormulaValues(file);

  assert.equal(snapshot.sheetFormulaStatus.get("입력 양식"), "saved_values");
});

test("rejects macro-enabled package markers even when the filename ends in xlsx", async () => {
  const macroMarkers: ReadonlyArray<Readonly<Record<string, Uint8Array>>> = [
    { "xl/vbaProject.bin": new Uint8Array([1, 2, 3]) },
    {
      "[Content_Types].xml": strToU8(
        '<Types><Override PartName="/xl/workbook.xml" ContentType="application/vnd.ms-excel.sheet.macroEnabled.main+xml"/></Types>',
      ),
    },
    {
      "xl/_rels/workbook.xml.rels": strToU8([
        "<Relationships>",
        '<Relationship Id="vba" Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" Target="vbaProject.bin"/>',
        "</Relationships>",
      ].join("")),
    },
  ];
  for (const extraEntries of macroMarkers) {
    await assert.rejects(
      snapshotWorkbookFormulaValues(workbookFile({ extraEntries })),
      /WORKBOOK_MACROS_UNSUPPORTED/,
    );
  }
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
  extraEntries = {},
}: {
  exampleCells?: readonly string[];
  inputCells?: readonly string[];
  extraEntries?: Readonly<Record<string, Uint8Array>>;
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
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>',
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>',
      "</Relationships>",
    ].join("")),
    "xl/worksheets/sheet1.xml": worksheet(exampleCells),
    "xl/worksheets/sheet2.xml": worksheet(inputCells),
    ...extraEntries,
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
