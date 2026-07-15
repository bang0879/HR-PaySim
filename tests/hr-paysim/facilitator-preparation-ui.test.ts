import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const preparation = readFileSync(
  new URL("../../src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx", import.meta.url),
  "utf8",
);
const shell = readFileSync(
  new URL("../../src/features/facilitator-preparation/FacilitatedSessionApp.tsx", import.meta.url),
  "utf8",
);
const qaSource = readFileSync(new URL("../../scripts/qa-decision-room.mjs", import.meta.url), "utf8");
const app = readFileSync(new URL("../../src/surfaces/FacilitatorLocalApp.tsx", import.meta.url), "utf8");
const provider = readFileSync(
  new URL("../../src/app/PaySimSessionProvider.tsx", import.meta.url),
  "utf8",
);
const sessionTypes = readFileSync(
  new URL("../../src/lib/hr-paysim/session/types.ts", import.meta.url),
  "utf8",
);

test("the preparation component owns raw paste only until safe normalization", () => {
  assert.match(preparation, /useState\(".*"\)/);
  assert.match(preparation, /rawPaste/);
  assert.match(preparation, /setRawPaste\(""\)/);
  assert.match(preparation, /prepareFacilitatorRoster/);
  assert.match(preparation, /confirmPiiColumnStripping/);
  assert.match(preparation, /value=\{rawPaste\}/);
  assert.match(preparation, /FOUNDER_COPY\[\"preparation\.ready\.action\"\]/);

  assert.doesNotMatch(preparation, /detectStructuralFindings|buildStructuralThemes|selectReviewSubjects/);
  assert.doesNotMatch(preparation, /localStorage|sessionStorage|fetch\(|sendBeacon|XMLHttpRequest/);
  assert.doesNotMatch(preparation, /rowId|rejectedValuePatterns|\.errors/);
  assert.doesNotMatch(provider + sessionTypes, /rawPaste|confirmPiiColumnStripping/);
});

test("the preparation screen leads with one guided Excel workflow", () => {
  const requiredFields = preparation.indexOf("기본연봉(원)");
  const example = preparation.indexOf("작성 예시");
  const download = preparation.indexOf('FOUNDER_COPY["preparation.download.action"]');
  const importFile = preparation.indexOf('FOUNDER_COPY["preparation.file.action"]');
  assert.ok(requiredFields >= 0);
  assert.ok(example > requiredFields);
  assert.ok(download > example);
  assert.ok(importFile > download);
  assert.match(preparation, /관련 경력년수/);
  assert.match(preparation, /직무/);
  assert.match(preparation, /직급/);
  assert.match(preparation, /직급 순서/);
  assert.match(preparation, /처우 예외적용 사유/);
  assert.match(preparation, /ROSTER_HEADERS/);
  assert.match(preparation, /ROSTER_EXAMPLE_ROWS/);
  assert.match(preparation, /COMPENSATION_EXCEPTION_LABELS\[item\.compensationExceptionReason\]/);
  assert.doesNotMatch(preparation, /const exampleRows\s*=/);
  assert.doesNotMatch(preparation, /Product Engineer 직원 자료를 최소 4행/);
  assert.match(preparation, /FOUNDER_COPY\["preparation\.guide\.career_definition"\]/);
  assert.match(preparation, /합성/);
  assert.match(preparation, /\.xlsx · 최대 5 MB/);
  assert.match(preparation, /accept="\.xlsx"/);
  assert.match(preparation, /readFacilitatorWorkbook/);
  assert.match(preparation, /createWorkbookReadCoordinator/);
  assert.match(preparation, /requestConsent/);
  assert.match(preparation, /disabled={isFileReading}/);
  assert.doesNotMatch(preparation, /confirmedFileHeaders|setConfirmedFileHeaders|fileConsentResolverRef/);
  assert.match(preparation, /finally\s*\{[\s\S]*input\.value\s*=\s*""/);
  assert.match(preparation, /<details/);
  assert.match(preparation, /FOUNDER_COPY\["preparation\.paste\.heading"\]/);
  assert.doesNotMatch(preparation, /row_id|role_group|base_salary_krw/);
  assert.doesNotMatch(preparation, /file\.name|selected\.sheet/);
});
test("one provider shell owns start, unload warning, direct-load fallback, and explicit end", () => {
  assert.match(shell, /type: "START_SESSION"/);
  assert.match(shell, /mode: "facilitated"/);
  assert.match(shell, /history\.replaceState/);
  assert.match(shell, /beforeunload/);
  assert.match(shell, /<DecisionRoomApp onSessionEnd=/);
  assert.match(shell, /\/hr-paysim\/session\/new/);
  assert.match(shell, /\/hr-paysim\/session/);
  assert.match(shell, /data-no-active-session="true"/);
  assert.doesNotMatch(shell, /localStorage|sessionStorage|fetch\(|sendBeacon|XMLHttpRequest/);

  assert.match(app, /resolveSurfaceRoute\(\s*"FACILITATOR_LOCAL"/);
  assert.match(app, /<PaySimSessionProvider>/);
  assert.match(app, /<FacilitatedSessionApp/);
});

test("browser QA owns facilitator privacy and lifecycle evidence", () => {
  for (const measurement of [
    "columnConsentRequired",
    "rowPiiBlocksAll",
    "preparationHierarchy",
    "fileInputReset",
    "sourceDataAbsent",
    "rawTextareaCleared",
    "facilitatedSampleLabelHidden",
    "sessionUrlContainsRosterData",
    "directSessionFailsClosed",
    "explicitEndClearsRows",
  ]) {
    assert.match(qaSource, new RegExp(measurement));
  }
});
