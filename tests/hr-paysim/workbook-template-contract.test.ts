import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import readXlsxFile from "read-excel-file/node";
import { strFromU8, unzipSync } from "fflate";

import {
  ROSTER_EXAMPLE_ROWS,
  ROSTER_HEADERS,
} from "../../src/lib/hr-paysim/preparation/rosterTemplateContract.ts";

const asset = fileURLToPath(new URL(
  "../../src/features/facilitator-preparation/assets/HR-PaySim-company-roster-template.xlsx",
  import.meta.url,
));
const oldAsset = fileURLToPath(new URL(
  "../../src/features/facilitator-preparation/assets/HR-PaySim-Product-Engineer-input-template.xlsx",
  import.meta.url,
));
const screen = readFileSync(
  new URL("../../src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx", import.meta.url),
  "utf8",
);

test("the committed workbook matches the canonical two-sheet roster contract", async () => {
  assert.equal(existsSync(asset), true);
  assert.equal(existsSync(oldAsset), false);
  assert.match(screen, /HR-PaySim-company-roster-template\.xlsx\?url/);
  assert.doesNotMatch(screen, /HR-PaySim-Product-Engineer-input-template/);

  const sheets = await readXlsxFile(asset);
  const inputRows = sheets.find(({ sheet }) => sheet === "입력 양식")?.data;
  assert.ok(inputRows);
  assert.deepEqual(inputRows[0]?.slice(0, 7), [...ROSTER_HEADERS]);
  assert.equal(
    inputRows.slice(1).some((row) => row.some((cell) => cell !== null && cell !== "")),
    false,
  );

  const exampleRows = sheets.find(({ sheet }) => sheet === "작성 예시")?.data;
  assert.ok(exampleRows);
  assert.deepEqual(
    exampleRows.slice(3, 8).map((row) => row.slice(0, 7)),
    [[...ROSTER_HEADERS], ...ROSTER_EXAMPLE_ROWS.map((row) => [...row])],
  );

  const files = unzipSync(readFileSync(asset));
  const workbookXml = strFromU8(files["xl/workbook.xml"]!);
  assert.deepEqual(
    [...workbookXml.matchAll(/<(?:[A-Za-z_][\w.-]*:)?sheet\b[^>]*name="([^"]+)"/g)].map((match) => match[1]),
    ["작성 예시", "입력 양식"],
  );
  const exampleXml = strFromU8(files["xl/worksheets/sheet1.xml"]!);
  const inputXml = strFromU8(files["xl/worksheets/sheet2.xml"]!);
  assert.equal(/<(?:[A-Za-z_][\w.-]*:)?f(?:\s|\/?>)/.test(exampleXml + inputXml), false);
  assert.match(inputXml, /<(?:[A-Za-z_][\w.-]*:)?pane\b[^>]*state="frozen"/);
  assert.equal((inputXml.match(/<(?:[A-Za-z_][\w.-]*:)?dataValidation\b/g) ?? []).length, 5);
});
