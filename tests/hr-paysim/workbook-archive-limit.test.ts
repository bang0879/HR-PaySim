import assert from "node:assert/strict";
import test from "node:test";
import { strToU8, zipSync } from "fflate";

import { snapshotWorkbookFormulaValues } from "../../src/features/facilitator-preparation/snapshotWorkbookFormulaValues.ts";

test("rejects aggregate non-worksheet archive inflation before reconstruction", async () => {
  const bytes = zipSync({
    "xl/workbook.xml": strToU8([
      '<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
      '<sheets><sheet name="입력 양식" sheetId="1" r:id="rId1"/></sheets>',
      "</workbook>",
    ].join("")),
    "xl/_rels/workbook.xml.rels": strToU8([
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
      '<Relationship Id="rId1" Target="worksheets/sheet1.xml"/>',
      "</Relationships>",
    ].join("")),
    "xl/worksheets/sheet1.xml": strToU8("<worksheet><sheetData/></worksheet>"),
    "xl/media/inflated.bin": new Uint8Array(40 * 1024 * 1024 + 1),
  });

  await assert.rejects(
    snapshotWorkbookFormulaValues(binaryFile(bytes)),
    /WORKBOOK_ARCHIVE_TOTAL_LIMIT/,
  );
});

function binaryFile(bytes: Uint8Array): File {
  return {
    name: "inflated.xlsx",
    size: bytes.byteLength,
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    arrayBuffer: async () => bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
  } as File;
}
