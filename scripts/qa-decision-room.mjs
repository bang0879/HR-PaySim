import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import {
  collectSensitiveTokens,
  findBlockedPaySimHrefs,
  findSensitivePayloadTokens,
} from "./qa-evidence-policy.mjs";

const surfaceArgument = process.argv.find((value) => value.startsWith("--surface="));
const qaSurface = surfaceArgument?.slice("--surface=".length) ?? "public";
if (!["public", "facilitator-local"].includes(qaSurface)) {
  throw new Error(`UNKNOWN_QA_SURFACE: ${qaSurface}`);
}

const url = process.env.HR_PAYSIM_URL
  ?? "http://127.0.0.1:5173/hr-paysim/demo";
const origin = new URL(url).origin;
const facilitatorHeader =
  "기본연봉(원)\t관련 경력년수\t회사 근속개월\t직무\t직급\t직급 순서\t처우 예외적용 사유";
const facilitatorRows = [
  "60000000\t10\t60\tBackend Engineer\tL1\t1\t없음",
  "75000000\t7\t12\tBackend Engineer\tL2\t2\t카운터오퍼",
  "85000000\t5\t10\tBackend Engineer\tL1\t1\t채용 예외",
  "70000000\t8\t50\tBackend Engineer\tL2\t2\t없음",
  "58000000\t10\t54\tData Analyst\tD1\t1\t없음",
  "72000000\t7\t10\tData Analyst\tD2\t2\t기타 문서화된 사유",
  "80000000\t5\t8\tData Analyst\tD1\t1\t채용 예외",
  "66000000\t8\t42\tData Analyst\tD2\t2\t없음",
  "50000000\t3\t12\tCustomer Success\t\t\t없음",
  "55000000\t4\t24\tCustomer Success\t\t\t기타 문서화된 사유",
];
const supportedFacilitatorPaste = [facilitatorHeader, ...facilitatorRows].join("\n");
const piiColumnPaste = [
  "이름\t이메일\t메모\t" + facilitatorHeader,
  ...facilitatorRows.map((row, index) =>
    "Private " + index + "\tprivate" + index + "@example.com\tunapproved" + index + "@example.com\t" + row
  ),
].join("\n");
const rowPiiPaste = [
  facilitatorHeader,
  ...facilitatorRows.map((row, index) =>
    index === 1 ? row.replace("Backend Engineer", "person@example.com") : row
  ),
].join("\n");
const invalidCareerPaste = [
  facilitatorHeader,
  ...facilitatorRows.map((row, index) =>
    index === 1 ? row.replace("75000000\t7\t12", "75000000\t경력 7년\t12") : row
  ),
].join("\n");
const blankTemplateBuffer = readFileSync(
  new URL("../src/features/facilitator-preparation/assets/HR-PaySim-company-roster-template.xlsx", import.meta.url),
);
const formulaWorkbookFilename = "formula-roster.xlsx";
const formulaTexts = [
  "QA_FORMULA_SALARY_SNAPSHOT",
  "QA_FORMULA_GRADE_SNAPSHOT",
];
const formulaRosterRows = [
  [60_000_000, 10, 60, "Backend Engineer", "L1", 1, "없음"],
  [75_000_000, 7, 12, "Backend Engineer", "L2", 2, "카운터오퍼"],
  [85_000_000, 5, 10, "Backend Engineer", "L1", 1, "채용 예외"],
  [70_000_000, 8, 50, "Backend Engineer", "L2", 2, "없음"],
];
const formulaRosterBuffer = buildFormulaRosterWorkbook(blankTemplateBuffer);
const formulaRawRowTokens = formulaRosterRows.map((row) => row.join("\t"));
const sensitiveRequestTokens = collectSensitiveTokens(
  facilitatorHeader,
  ...facilitatorRows,
  piiColumnPaste,
  rowPiiPaste,
  invalidCareerPaste,
  formulaWorkbookFilename,
  ...formulaTexts,
  ...formulaRawRowTokens,
  "private-roster.xlsx\ttiming_context\tdocumented",
);

function buildFormulaRosterWorkbook(templateBuffer) {
  const archive = unzipSync(new Uint8Array(templateBuffer));
  const workbookXml = strFromU8(archive["xl/workbook.xml"]);
  const relationshipsXml = strFromU8(archive["xl/_rels/workbook.xml.rels"]);
  const sheetTag = [...workbookXml.matchAll(/<sheet\b[^>]*\/?\s*>/g)]
    .map((match) => match[0])
    .find((tag) => readXmlAttributes(tag).name === "입력 양식");
  if (!sheetTag) throw new Error("QA_INPUT_SHEET_MISSING");
  const relationshipId = readXmlAttributes(sheetTag)["r:id"];
  const relationshipTag = [...relationshipsXml.matchAll(/<Relationship\b[^>]*\/?\s*>/g)]
    .map((match) => match[0])
    .find((tag) => readXmlAttributes(tag).Id === relationshipId);
  if (!relationshipTag) throw new Error("QA_INPUT_SHEET_RELATIONSHIP_MISSING");
  const target = readXmlAttributes(relationshipTag).Target;
  if (!target) throw new Error("QA_INPUT_SHEET_TARGET_MISSING");
  const worksheetPath = new URL(target, "https://ooxml.local/xl/workbook.xml")
    .pathname.slice(1);
  const worksheetEntry = archive[worksheetPath];
  if (!worksheetEntry) throw new Error("QA_INPUT_WORKSHEET_MISSING");

  let worksheetXml = strFromU8(worksheetEntry);
  formulaRosterRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const rowXml = buildFormulaRosterRow(rowNumber, row);
    const existingRow = new RegExp(
      `<row\\b(?=[^>]*\\br="${rowNumber}")[^>]*(?:\\/>|>[\\s\\S]*?<\\/row>)`,
    );
    worksheetXml = existingRow.test(worksheetXml)
      ? worksheetXml.replace(existingRow, rowXml)
      : worksheetXml.replace("</sheetData>", `${rowXml}</sheetData>`);
  });
  archive[worksheetPath] = strToU8(worksheetXml);
  return zipSync(archive, { level: 0 });
}

function buildFormulaRosterRow(rowNumber, values) {
  const [salary, experience, tenure, role, grade, gradeRank, reason] = values;
  const formulaCells = [
    numericFormulaCell(`A${rowNumber}`, formulaTexts[0], salary),
    numericCell(`B${rowNumber}`, experience),
    numericCell(`C${rowNumber}`, tenure),
    inlineStringCell(`D${rowNumber}`, role),
    inlineStringCell(`E${rowNumber}`, grade),
    numericFormulaCell(`F${rowNumber}`, formulaTexts[1], gradeRank),
    inlineStringCell(`G${rowNumber}`, reason),
  ];
  return `<row r="${rowNumber}">${formulaCells.join("")}</row>`;
}

function numericCell(reference, value) {
  return `<c r="${reference}"><v>${value}</v></c>`;
}

function numericFormulaCell(reference, formula, value) {
  return `<c r="${reference}"><f>${formula}</f><v>${value}</v></c>`;
}

function inlineStringCell(reference, value) {
  return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
}

function readXmlAttributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:.-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]),
  );
}

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

const viewports = [
  { name: "desktop-1280", width: 1280, height: 720 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];
const facilitatorViewports = [viewports[0], viewports[2]];
const expectedScreens = [
  "introduction",
  "confirmed_pay_differences",
  "company_rule",
  "session_result",
];
const forbiddenVisibleTerms = [
  "finding",
  "theme",
  "relationship",
  "shadow band",
  "pay inversion",
  "loyalty tax",
  "level fiction",
  "correction floor",
  "severity",
  "confidence",
  "stale",
  "memo",
  "대표님",
  "장기 근속",
  "최근 입사",
  "오래 근무",
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  permissions: ["clipboard-read", "clipboard-write"],
  viewport: viewports[0],
});
const page = await context.newPage();
const consoleIssues = [];
page.on("console", (message) => {
  if (["error", "warning"].includes(message.type())) {
    consoleIssues.push(`${message.type()}: ${message.text()}`);
  }
});
page.on("pageerror", (error) => consoleIssues.push(`pageerror: ${error.message}`));

const result = {
  qaSurface,
  publicFacilitatorRoutesBlocked: false,
  externalRosterEmissions: [],
  screensByViewport: {},
  clicksToResult: 0,
  focusMoves: [],
  keyboardCompleted: false,
  forbiddenVisibleTerms: [],
  rowIdsVisible: false,
  overflow: {},
  screen2GazeOrder: {},
  screen2FirstViewport: {},
  pointAlignment: {},
  careerCoverage: {},
  trendEvidence: {},
  visualHierarchy: {},
  subjectSwitch: {},
  gtmLevelVisualization: {},
  screen3SubjectSwitch: {},
  invalidation: {},
  copySucceeded: false,
  sessionCleared: false,
  storage: {},
  consoleIssues,
  screenshots: {},
  errors: [],
  facilitatorByViewport: {},
  facilitatorConfirmation: {},
  facilitatorSubjectLabels: {},
  columnConsentRequired: {},
  rowPiiBlocksAll: {},
  preparationHierarchy: {},
  fileInputReset: {},
  sourceDataAbsent: {},
  rawTextareaCleared: {},
  facilitatedSampleLabelHidden: {},
  sessionUrlContainsRosterData: {},
  directSessionFailsClosed: {},
  explicitEndClearsRows: {},
  formulaSnapshotNotice: {},
};

async function assertNoBlockedPaySimLinks(targetPage, label) {
  if (qaSurface !== "public") return;
  const hrefs = await targetPage.locator("a[href]").evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute("href") ?? "")
  );
  const blocked = findBlockedPaySimHrefs(hrefs, origin);
  if (blocked.length > 0) {
    throw new Error(`${label} advertises blocked PaySim links: ${blocked.join(", ")}`);
  }
}

async function openFresh(viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator('[data-decision-room="true"]').waitFor({ timeout: 5000 });
  await assertNoBlockedPaySimLinks(page, `${viewport.name}/initial`);
}

function ensureNoFounderLeaks(visibleText) {
  const forbidden = forbiddenVisibleTerms.filter((term) =>
    visibleText.toLocaleLowerCase("en-US").includes(term.toLocaleLowerCase("en-US"))
  );
  if (forbidden.length) throw new Error(`forbidden visible terms: ${forbidden.join(", ")}`);
  if (/row_\d+/i.test(visibleText)) throw new Error("system row IDs are visible");
}

async function inspectScreen2(viewport) {
  const conclusion = page.locator('[data-screen="confirmed_pay_differences"] [data-conclusion-heading="true"]');
  const supporting = page.locator(
    '[data-screen="confirmed_pay_differences"] .dr-evidence-hero .dr-lead',
  );
  const taskPrompt = page.locator(
    '[data-screen="confirmed_pay_differences"] .dr-screen-task',
  );
  const distribution = page.locator(".dr-distribution");
  const comparison = page.locator(".dr-highlight-card");
  const observations = page.locator(".dr-observations");
  const question = page.locator(".dr-question-card");
  const evidence = page.locator(".dr-evidence-table");
  const action = page.locator(".dr-action-bar");
  const conclusionText = await conclusion.innerText();
  const supportingText = await supporting.innerText();
  const taskText = await taskPrompt.innerText();
  for (const required of [
    "Product Engineer 6명",
    "관련 경력 10년·회사 근속 64개월인 직원 A",
    "관련 경력 7년·회사 근속 14개월인 직원 B",
    "2,700만원",
  ]) {
    if (!conclusionText.includes(required)) {
      throw new Error(`screen 2 title is missing: ${required}`);
    }
  }
  for (const required of ["직원 6명의 기본 연봉을 관련 경력과 함께 비교", "직원 A와 직원 B"]) {
    if (!supportingText.includes(required)) {
      throw new Error(`screen 2 supporting copy is missing: ${required}`);
    }
  }
  const distributionText = await distribution.innerText();
  for (const required of [
    "가로축 · 관련 경력년수",
    "세로축 · 기본 연봉",
    "현재 자료의 관찰 추세 · 직원 6명",
    "관련 경력이 늘어나는 쪽에서 기본 연봉이 낮아지는 방향입니다",
    "이 자료만으로 원인이나 적정 연봉을 판단할 수는 없습니다",
  ]) {
    if (!distributionText.includes(required)) {
      throw new Error(`screen 2 distribution is missing: ${required}`);
    }
  }
  for (const removed of [
    "가로축 · 근속 개월",
    "세로축 · 관련 경력년수",
    "파란 점선",
    "시장 평균",
    "통상 인상률",
    "권장 연봉",
    "승인된 회사 기준",
  ]) {
    if (distributionText.includes(removed)) {
      throw new Error(`screen 2 distribution retains removed guidance: ${removed}`);
    }
  }  const pointAlignment = await page.evaluate(() => {
    const plot = document.querySelector(".dr-salary-plot");
    if (!(plot instanceof HTMLElement)) {
      return { checked: 0, maximumDeltaPx: null, aligned: false };
    }
    const plotRect = plot.getBoundingClientRect();
    let maximumDeltaPx = 0;
    const points = [...document.querySelectorAll(".dr-salary-person")];

    for (const point of points) {
      if (!(point instanceof HTMLElement)) continue;
      const dot = point.querySelector(".dr-salary-person-dot");
      if (!(dot instanceof HTMLElement)) continue;
      const xPercent = Number(point.dataset.xPercent);
      const yPercent = Number(point.dataset.yPercent);
      const dotRect = dot.getBoundingClientRect();
      const actualX = dotRect.left + dotRect.width / 2;
      const actualY = dotRect.top + dotRect.height / 2;
      const expectedX = plotRect.left + plotRect.width * xPercent / 100;
      const expectedY = plotRect.bottom - plotRect.height * yPercent / 100;
      maximumDeltaPx = Math.max(
        maximumDeltaPx,
        Math.abs(actualX - expectedX),
        Math.abs(actualY - expectedY),
      );
    }

    return {
      checked: points.length,
      maximumDeltaPx,
      aligned: points.length > 0 && maximumDeltaPx <= 2.5,
    };
  });
  result.pointAlignment[viewport.name] = pointAlignment;
  if (!pointAlignment.aligned || pointAlignment.checked !== 6) {
    throw new Error(
      `screen 2 point alignment failed: ${pointAlignment.checked} points, ${pointAlignment.maximumDeltaPx}px`,
    );
  }
  const missingCareerCount = await page.locator(".dr-missing-career li").count();
  const careerCoverage = {
    pointCount: pointAlignment.checked,
    missingCareerCount,
    accountedEmployeeCount: pointAlignment.checked + missingCareerCount,
  };
  result.careerCoverage[viewport.name] = careerCoverage;
  if (careerCoverage.accountedEmployeeCount !== 6) {
    throw new Error(`screen 2 career coverage mismatch: ${JSON.stringify(careerCoverage)}`);
  }
  const trendEvidence = {
    observedLineCount: await page.locator(".dr-observed-trend-line").count(),
    directionGuideLineCount: await page.locator(".dr-direction-guide-line").count(),
    observedLegendCount: await page.locator(".dr-trend-legend .is-observed").count(),
  };
  result.trendEvidence[viewport.name] = trendEvidence;
  if (
    trendEvidence.observedLineCount !== 1
    || trendEvidence.directionGuideLineCount !== 0
    || trendEvidence.observedLegendCount !== 1
  ) {
    throw new Error(`screen 2 trend evidence mismatch: ${JSON.stringify(trendEvidence)}`);
  }
  const visualHierarchy = await page.evaluate(() => {
    const plot = document.querySelector(".dr-salary-plot");
    const observed = document.querySelector(".dr-observed-trend-line");
    const standardPoint = document.querySelector(
      ".dr-salary-person:not(.is-highlighted) .dr-salary-person-dot",
    );
    const highlightedPoint = document.querySelector(
      ".dr-salary-person.is-highlighted .dr-salary-person-dot",
    );
    const label = document.querySelector(".dr-salary-person-label");
    const observedKey = document.querySelector(".dr-trend-legend .is-observed");
    if (!(plot instanceof HTMLElement)
      || !(observed instanceof SVGElement)
      || !(standardPoint instanceof HTMLElement)
      || !(highlightedPoint instanceof HTMLElement)
      || !(label instanceof HTMLElement)
      || !(observedKey instanceof HTMLElement)) {
      return { complete: false };
    }
    const plotStyle = getComputedStyle(plot);
    const observedStyle = getComputedStyle(observed);
    const standardRect = standardPoint.getBoundingClientRect();
    const highlightedRect = highlightedPoint.getBoundingClientRect();
    const labelStyle = getComputedStyle(label);
    return {
      complete: true,
      observedLineStartXPercent: Number.parseFloat(observed.getAttribute("x1") ?? "NaN"),
      observedLineEndXPercent: Number.parseFloat(observed.getAttribute("x2") ?? "NaN"),
      plotRadiusPx: Number.parseFloat(plotStyle.borderTopLeftRadius),
      observedStrokeWidth: Number.parseFloat(observedStyle.strokeWidth),
      observedStrokeLinecap: observedStyle.strokeLinecap,
      standardPointDiameter: standardRect.width,
      highlightedPointDiameter: highlightedRect.width,
      labelBackgroundColor: labelStyle.backgroundColor,
      observedKeyVisible: observedKey.getBoundingClientRect().width > 0,
    };
  });
  result.visualHierarchy[viewport.name] = visualHierarchy;
  if (!visualHierarchy.complete
    || Math.abs(visualHierarchy.observedLineStartXPercent - 15) > 0.01
    || Math.abs(visualHierarchy.observedLineEndXPercent - 85) > 0.01
    || visualHierarchy.plotRadiusPx !== 14
    || visualHierarchy.observedStrokeWidth !== 3
    || visualHierarchy.observedStrokeLinecap !== "round"
    || visualHierarchy.highlightedPointDiameter <= visualHierarchy.standardPointDiameter
    || visualHierarchy.labelBackgroundColor === "rgba(0, 0, 0, 0)"
    || !visualHierarchy.observedKeyVisible) {
    throw new Error(`screen 2 visual hierarchy mismatch: ${JSON.stringify(visualHierarchy)}`);
  }  for (const required of ["지금 확인해 봐야 할 기준", "이유를 하나 선택", "확인할 기록"]) {
    if (!taskText.includes(required)) {
      throw new Error(`screen 2 task prompt is missing: ${required}`);
    }
  }
  const boxes = await Promise.all(
    [conclusion, distribution, comparison, observations, question, evidence, action]
      .map((locator) => locator.boundingBox()),
  );
  if (boxes.some((box) => box === null)) throw new Error("screen 2 gaze target is missing");
  const y = boxes.map((box) => box.y);
  if (!y.every((value, index) => index === 0 || value > y[index - 1])) {
    throw new Error(`screen 2 gaze order is not vertical: ${y.join(",")}`);
  }
  result.screen2GazeOrder[viewport.name] = y;
  const firstViewportBoxes = await Promise.all([
    conclusion.boundingBox(),
    supporting.boundingBox(),
    taskPrompt.boundingBox(),
  ]);
  if (firstViewportBoxes.some((box) => box === null)) {
    throw new Error("screen 2 first-viewport cue is missing");
  }
  const cuesFullyVisible = viewport.width < 1280 || firstViewportBoxes.every(
    (box) => box.y >= 0 && box.y + box.height <= viewport.height,
  );
  result.screen2FirstViewport[viewport.name] = {
    cuesFullyVisible,
    distributionStartsInViewport: boxes[1].y < viewport.height,
  };
  if (!cuesFullyVisible) {
    throw new Error(`${viewport.name} hides a Screen 2 comprehension cue`);
  }
  const subjectButtons = page.locator(".dr-subject-row button");
  const enabledSubjectCount = await subjectButtons.count();
  const disabledSubjectCount = await page.locator(".dr-subject-row button:disabled").count();
  if (enabledSubjectCount !== 3 || disabledSubjectCount !== 0) {
    throw new Error("all three selected subjects must be enabled");
  }
  await subjectButtons.filter({ hasText: "Platform Engineer" }).click();
  await page.waitForFunction(() =>
    document.activeElement?.getAttribute("data-conclusion-heading") === "true"
  );
  const platformText = await page.locator('[data-screen="confirmed_pay_differences"]').innerText();
  await subjectButtons.filter({ hasText: "GTM" }).click();
  await page.waitForFunction(() =>
    document.activeElement?.getAttribute("data-conclusion-heading") === "true"
  );
  const gtmText = await page.locator('[data-screen="confirmed_pay_differences"]').innerText();
  const gtmLevelVisualization = await page.locator(".dr-level-order").count() === 1;
  result.gtmLevelVisualization[viewport.name] = gtmLevelVisualization;
  const switched = gtmLevelVisualization
    && platformText.includes("1,800만원")
    && platformText.includes("60개월")
    && platformText.includes("17개월")
    && gtmText.includes("400만원")
    && gtmText.includes("500만원")
    && gtmText.includes("권장 연봉 또는 회사가 승인한 기준이 아닙니다")
    && gtmText.includes("Designer 2명");
  result.subjectSwitch[viewport.name] = switched;
  if (!switched) throw new Error(`${viewport.name} remaining-subject switch failed`);
  await subjectButtons.filter({ hasText: "Product Engineer" }).click();
  if (!(await page.locator(".dr-evidence-question").isVisible())) {
    throw new Error("the conditional evidence question is not visible for the prefilled explanation");
  }
}

async function inspectScreen3(viewport) {
  const subjectButtons = page.locator(".dr-subject-row button");
  await subjectButtons.filter({ hasText: "Platform Engineer" }).click();
  await page.waitForFunction(() =>
    document.activeElement?.getAttribute("data-conclusion-heading") === "true"
  );
  const platformText = await page.locator('[data-screen="company_rule"]').innerText();
  await subjectButtons.filter({ hasText: "GTM" }).click();
  await page.waitForFunction(() =>
    document.activeElement?.getAttribute("data-conclusion-heading") === "true"
  );
  const gtmText = await page.locator('[data-screen="company_rule"]').innerText();
  const switched = platformText.includes("계산 전에 확인할 내용")
    && platformText.includes("확인 필요")
    && (gtmText.match(/400만원/g) ?? []).length >= 2
    && gtmText.includes("500만원")
    && gtmText.includes("권장 연봉 또는 회사가 승인한 기준이 아닙니다");
  result.screen3SubjectSwitch[viewport.name] = switched;
  if (!switched) throw new Error(`${viewport.name} Screen 3 subject switch failed`);
  await subjectButtons.filter({ hasText: "Product Engineer" }).click();
}

async function runFacilitatorQa(viewport) {
  if (qaSurface !== "facilitator-local") return;
  const facilitatorContext = await browser.newContext({ viewport });
  const facilitatorPage = await facilitatorContext.newPage();
  const requestInspectionTasks = [];
  const recordSensitiveEmission = (channel, metadata, payload) => {
    const matches = findSensitivePayloadTokens(payload, sensitiveRequestTokens);
    if (matches.length > 0) {
      result.externalRosterEmissions.push({ channel, ...metadata, matches });
    }
  };
  facilitatorPage.on("request", (request) => {
    const inspection = (async () => {
      const headers = await request.allHeaders();
      const metadataPayload = `${request.url()}\n${JSON.stringify(headers)}`;
      const bodyPayload = request.postData() ?? "";
      const matches = [
        ...findSensitivePayloadTokens(
          metadataPayload,
          sensitiveRequestTokens,
          false,
        ),
        ...findSensitivePayloadTokens(bodyPayload, sensitiveRequestTokens, true),
      ];
      if (matches.length > 0) {
        result.externalRosterEmissions.push({
          channel: "request",
          method: request.method(),
          url: request.url(),
          matches: [...new Set(matches)],
        });
      }
    })();
    requestInspectionTasks.push(inspection);
  });
  facilitatorPage.on("websocket", (socket) => {
    socket.on("framesent", (event) => {
      const payload = typeof event.payload === "string"
        ? event.payload
        : event.payload.toString("utf8");
      recordSensitiveEmission("websocket", { url: socket.url() }, payload);
    });
  });
  facilitatorPage.on("console", (message) => {
    recordSensitiveEmission("console", { viewport: viewport.name, type: message.type() }, message.text());
    if (["error", "warning"].includes(message.type())) {
      consoleIssues.push("facilitator/" + viewport.name + "/" + message.type() + ": " + message.text());
    }
  });
  facilitatorPage.on("pageerror", (error) => {
    recordSensitiveEmission("pageerror", { viewport: viewport.name }, error.message);
    consoleIssues.push("facilitator/" + viewport.name + "/pageerror: " + error.message);
  });

  const preparationUrl = origin + "/hr-paysim/session/new";
  const sessionUrl = origin + "/hr-paysim/session";
  const inspect = async (paste) => {
    const fallback = facilitatorPage.locator(".fp-paste-fallback");
    if (!(await fallback.evaluate((element) => element.open))) {
      await fallback.locator("summary").click();
    }
    const textarea = fallback.locator("textarea");
    await textarea.fill(paste);
    await fallback.locator(".fp-input-actions .fp-primary").click();
  };

  await facilitatorPage.goto(preparationUrl, { waitUntil: "networkidle" });
  const preparationCopy = await facilitatorPage.locator("body").innerText();
  const preparationOrder = [
    "필수 항목",
    "작성 예시",
    "1. Excel 입력 양식 내려받기",
    "2. 작성한 Excel 파일 불러오기",
    "파일을 사용하지 않고 표 붙여넣기",
  ].map((copy) => preparationCopy.indexOf(copy));
  const pasteClosed = !(await facilitatorPage.locator(".fp-paste-fallback").evaluate((element) => element.open));
  const downloadHref = await facilitatorPage.locator(".fp-secondary-action").getAttribute("href");
  const fileAccept = await facilitatorPage.locator('input[type="file"]').getAttribute("accept");
  const preparationHierarchy = preparationOrder.every((position) => position >= 0)
    && preparationOrder.every((position, index) => index === 0 || position > preparationOrder[index - 1])
    && pasteClosed
    && downloadHref?.includes("HR-PaySim-company-roster-template")
    && downloadHref?.includes(".xlsx")
    && fileAccept === ".xlsx"
    && preparationCopy.includes("관련 경력년수")
    && preparationCopy.includes("형식만 보여주는 합성 자료")
    && preparationCopy.includes("Backend Engineer")
    && preparationCopy.includes("카운터오퍼")
    && !/row_id|role_group|base_salary_krw/.test(preparationCopy);
  result.preparationHierarchy[viewport.name] = preparationHierarchy;
  if (!preparationHierarchy) {
    throw new Error(`${viewport.name} preparation hierarchy failed: ${JSON.stringify({ preparationOrder, pasteClosed, downloadHref, fileAccept })}`);
  }

  const fileInput = facilitatorPage.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "private-roster.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: blankTemplateBuffer,
  });
  await facilitatorPage.locator('[data-preparation-blocked="true"]').waitFor();
  const fileInputReset = (await fileInput.inputValue()) === "";
  const fileBody = await facilitatorPage.locator("body").innerText();
  const sourceDataAbsent = fileInputReset
    && !fileBody.includes("private-roster.xlsx")
    && !/file_row_\d+/.test(fileBody)
    && !facilitatorPage.url().includes("private-roster");
  result.fileInputReset[viewport.name] = fileInputReset;
  result.sourceDataAbsent[viewport.name] = sourceDataAbsent;
  if (!fileInputReset || !sourceDataAbsent) {
    throw new Error(`${viewport.name} file source did not clear safely`);
  }

  await facilitatorPage.goto(preparationUrl, { waitUntil: "networkidle" });
  const formulaFileInput = facilitatorPage.locator('input[type="file"]');
  await formulaFileInput.setInputFiles({
    name: formulaWorkbookFilename,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: formulaRosterBuffer,
  });
  await facilitatorPage.locator('[data-preparation-confirmation="true"]').waitFor();
  const formulaSnapshotNoticeVisible = await facilitatorPage
    .locator('[data-formula-snapshot-notice="true"]')
    .isVisible();
  const formulaPageText = await facilitatorPage.locator("body").innerText();
  const formulaUrl = facilitatorPage.url();
  const formulaStorage = await facilitatorPage.evaluate(() => ({
    localStorageKeys: localStorage.length,
    sessionStorageKeys: sessionStorage.length,
  }));
  const formulaSnapshotNotice = formulaSnapshotNoticeVisible
    && (await formulaFileInput.inputValue()) === ""
    && ![formulaWorkbookFilename, ...formulaTexts, ...formulaRawRowTokens]
      .some((token) => formulaPageText.includes(token) || formulaUrl.includes(token))
    && formulaStorage.localStorageKeys === 0
    && formulaStorage.sessionStorageKeys === 0;
  result.formulaSnapshotNotice[viewport.name] = formulaSnapshotNotice;
  if (!formulaSnapshotNotice) {
    throw new Error(`${viewport.name} saved formula result notice or privacy boundary failed`);
  }

  await facilitatorPage.goto(preparationUrl, { waitUntil: "networkidle" });
  await inspect(piiColumnPaste);
  const consentVisible = await facilitatorPage.locator('[data-column-consent-required="true"]').isVisible();
  const consentText = await facilitatorPage.locator('[data-column-consent-required="true"]').innerText();
  const consentBody = await facilitatorPage.locator("body").innerText();
  const columnConsentRequired = consentVisible
    && consentText.includes("이름")
    && consentText.includes("이메일")
    && consentText.includes("메모")
    && !consentBody.includes("Private 0")
    && !consentBody.includes("private0@example.com")
    && !consentBody.includes("unapproved0@example.com");
  result.columnConsentRequired[viewport.name] = columnConsentRequired;
  if (!columnConsentRequired) throw new Error(viewport.name + " PII column consent failed");

  await facilitatorPage.goto(preparationUrl, { waitUntil: "networkidle" });
  await inspect(rowPiiPaste);
  const blockedVisible = await facilitatorPage.locator('[data-preparation-blocked="true"]').isVisible();
  const rowPiiRawCleared = (await facilitatorPage.locator("textarea").inputValue()) === "";
  const rowPiiBody = await facilitatorPage.locator("body").innerText();
  const rowPiiBlocksAll = blockedVisible
    && await facilitatorPage.locator('[data-start-facilitated-session="true"]').count() === 0
    && !rowPiiBody.includes("person@example.com")
    && !rowPiiBody.includes("file_row_002");
  result.rowPiiBlocksAll[viewport.name] = rowPiiBlocksAll;
  if (!rowPiiBlocksAll || !rowPiiRawCleared) {
    throw new Error(viewport.name + " row PII did not block and clear all");
  }

  await facilitatorPage.goto(preparationUrl, { waitUntil: "networkidle" });
  await inspect(invalidCareerPaste);
  const invalidCareerText = await facilitatorPage.locator('[data-preparation-blocked="true"]').innerText();
  if (!invalidCareerText.includes("입력 3행")
    || !invalidCareerText.includes("관련 경력년수")
    || await facilitatorPage.locator('[data-start-facilitated-session="true"]').count() !== 0) {
    throw new Error(viewport.name + " invalid career row did not fail closed");
  }

  await facilitatorPage.goto(preparationUrl, { waitUntil: "networkidle" });
  await inspect(supportedFacilitatorPaste);
  await facilitatorPage.locator('[data-preparation-confirmation="true"]').waitFor();
  const confirmationText = await facilitatorPage.locator('[data-preparation-confirmation="true"]').innerText();
  const confirmationContract = [
    "Backend Engineer",
    "Data Analyst",
    "Customer Success",
    "L1 · 순서 1",
    "D2 · 순서 2",
    "카운터오퍼",
    "채용 예외",
    "기타 문서화된 사유",
  ].every((expected) => confirmationText.includes(expected))
    && !confirmationText.includes("private-roster.xlsx")
    && !confirmationText.includes("file_row_")
    && !confirmationText.includes(supportedFacilitatorPaste);
  result.facilitatorConfirmation[viewport.name] = confirmationContract;
  const supportedRawCleared = (await facilitatorPage.locator("textarea").inputValue()) === "";
  const startCount = await facilitatorPage.locator('[data-start-facilitated-session="true"]').count();
  const preparationOverflow = await facilitatorPage.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  const overflowDetails = preparationOverflow
    ? await facilitatorPage.evaluate(() => [...document.querySelectorAll("body *")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > document.documentElement.clientWidth + 1;
      })
      .slice(0, 8)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, className: element.className, right: rect.right, width: rect.width };
      }))
    : [];
  if (!supportedRawCleared || !confirmationContract || startCount !== 1 || preparationOverflow) {
    throw new Error(viewport.name + " supported confirmation failed: " + JSON.stringify({
      supportedRawCleared,
      confirmationContract,
      startCount,
      preparationOverflow,
      overflowDetails,
    }));
  }
  result.rawTextareaCleared[viewport.name] = rowPiiRawCleared && supportedRawCleared;

  await facilitatorPage.locator('[data-start-facilitated-session="true"]').click();
  await facilitatorPage.locator('[data-decision-room="true"]').waitFor();
  const rosterDataInUrl = /60000000|58000000|private-roster|file_row|Backend%20Engineer|Data%20Analyst/.test(facilitatorPage.url());
  result.sessionUrlContainsRosterData[viewport.name] = rosterDataInUrl;
  if (new URL(facilitatorPage.url()).pathname !== "/hr-paysim/session" || rosterDataInUrl) {
    throw new Error(viewport.name + " session URL leaked roster data");
  }

  const sampleLabelHidden = await facilitatorPage.locator(".dr-sample-label").count() === 0;
  result.facilitatedSampleLabelHidden[viewport.name] = sampleLabelHidden;
  if (!sampleLabelHidden) throw new Error(viewport.name + " facilitated sample label is visible");

  const introPrimary = facilitatorPage.locator('[data-screen="introduction"] [data-primary-action="true"]');
  await introPrimary.focus();
  await facilitatorPage.keyboard.press("Enter");
  await facilitatorPage.locator('[data-screen="confirmed_pay_differences"]').waitFor();
  const evidenceText = await facilitatorPage.locator('[data-screen="confirmed_pay_differences"]').innerText();
  const subjectButtons = facilitatorPage.locator(".dr-subject-row button");
  const subjectRoles = await subjectButtons.locator("span").allInnerTexts();
  if (subjectRoles.length !== 2
    || !subjectRoles.includes("Backend Engineer")
    || !subjectRoles.includes("Data Analyst")
    || subjectRoles.includes("Customer Success")) {
    throw new Error(viewport.name + " selected facilitator subjects are incorrect: " + JSON.stringify(subjectRoles));
  }
  const subjectLocalLabels = {};
  for (const [roleGroup, expectedGrades, expectedGap] of [
    ["Backend Engineer", ["L1", "L2"], "1,500만원"],
    ["Data Analyst", ["D1", "D2"], "1,400만원"],
  ]) {
    await subjectButtons.filter({ hasText: roleGroup }).click();
    const conclusionText = await facilitatorPage.locator(
      '[data-screen="confirmed_pay_differences"] [data-conclusion-heading="true"]',
    ).innerText();
    const levelText = await facilitatorPage.locator(".dr-level-order").innerText();
    const local = conclusionText.includes(`${roleGroup} 4명`)
      && conclusionText.includes("직원 A")
      && conclusionText.includes("직원 B")
      && conclusionText.includes(expectedGap)
      && expectedGrades.every((grade) => levelText.includes(grade))
      && levelText.includes(`${roleGroup} 직급별 기본 연봉`)
      && !/Product Engineer|Platform Engineer|GTM/.test(conclusionText + levelText);
    subjectLocalLabels[roleGroup] = local;
    if (!local) {
      throw new Error(viewport.name + " subject-local labels failed for " + roleGroup);
    }
  }
  result.facilitatorSubjectLabels[viewport.name] = subjectLocalLabels;
  await subjectButtons.filter({ hasText: "Backend Engineer" }).click();
  if (!evidenceText.includes("Backend Engineer") || /Product Engineer 5명/.test(evidenceText)) {
    throw new Error(viewport.name + " real-input facts are missing");
  }
  const focusMoved = await facilitatorPage.evaluate(() =>
    document.activeElement?.getAttribute("data-conclusion-heading") === "true"
  );
  if (!focusMoved) throw new Error(viewport.name + " facilitated focus did not move");

  await facilitatorPage.locator('input[name="explanation"][value="timing_context"]').check();
  await facilitatorPage.locator('input[name="evidence"][value="documented"]').check();
  const evidencePrimary = facilitatorPage.locator(
    '[data-screen="confirmed_pay_differences"] [data-primary-action="true"]',
  );
  await evidencePrimary.focus();
  await facilitatorPage.keyboard.press("Enter");
  await facilitatorPage.locator('[data-screen="company_rule"]').waitFor();
  const rulePrimary = facilitatorPage.locator('[data-screen="company_rule"] [data-primary-action="true"]');
  await rulePrimary.focus();
  await facilitatorPage.keyboard.press("Enter");
  await facilitatorPage.locator('[data-screen="session_result"]').waitFor();

  const storage = await facilitatorPage.evaluate(() => ({
    localStorageKeys: localStorage.length,
    sessionStorageKeys: sessionStorage.length,
  }));
  if (storage.localStorageKeys !== 0 || storage.sessionStorageKeys !== 0) {
    throw new Error(viewport.name + " facilitated session wrote browser storage");
  }

  await facilitatorPage.locator(".dr-danger").click();
  await facilitatorPage.locator('[data-facilitator-preparation="true"]').waitFor();
  const explicitEndClearsRows =
    await facilitatorPage.locator('[data-decision-room="true"]').count() === 0
    && await facilitatorPage.locator('[data-preparation-confirmation="true"]').count() === 0
    && (await facilitatorPage.locator("textarea").inputValue()) === ""
    && new URL(facilitatorPage.url()).pathname === "/hr-paysim/session/new";
  result.explicitEndClearsRows[viewport.name] = explicitEndClearsRows;
  if (!explicitEndClearsRows) throw new Error(viewport.name + " explicit end did not clear rows");

  const directContext = await browser.newContext({ viewport });
  const directPage = await directContext.newPage();
  directPage.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleIssues.push("direct/" + viewport.name + "/" + message.type() + ": " + message.text());
    }
  });
  directPage.on("pageerror", (error) => {
    consoleIssues.push("direct/" + viewport.name + "/pageerror: " + error.message);
  });
  await directPage.goto(sessionUrl, { waitUntil: "networkidle" });
  const directSessionFailsClosed = await directPage.locator('[data-no-active-session="true"]').isVisible();
  result.directSessionFailsClosed[viewport.name] = directSessionFailsClosed;
  if (!directSessionFailsClosed) throw new Error(viewport.name + " direct session did not fail closed");
  await directContext.close();

  result.facilitatorByViewport[viewport.name] = {
    columnConsentRequired,
    confirmationContract,
    subjectLocalLabels: result.facilitatorSubjectLabels[viewport.name],
    rowPiiBlocksAll,
    preparationHierarchy,
    fileInputReset,
    sourceDataAbsent,
    rawTextareaCleared: result.rawTextareaCleared[viewport.name],
    facilitatedSampleLabelHidden: sampleLabelHidden,
    sessionUrlContainsRosterData: rosterDataInUrl,
    directSessionFailsClosed,
    explicitEndClearsRows,
    formulaSnapshotNotice,
  };
  await Promise.all(requestInspectionTasks);
  if (result.externalRosterEmissions.length > 0) {
    throw new Error(
      "facilitator roster data entered an external request or WebSocket frame: "
        + JSON.stringify(result.externalRosterEmissions),
    );
  }
  await facilitatorContext.close();
}
async function inspectPublicBlockedRoutes(viewport) {
  if (qaSurface !== "public") return;
  const blockedContext = await browser.newContext({ viewport });
  const blockedPage = await blockedContext.newPage();
  for (const path of [
    "/hr-paysim/decision-room-preview",
    "/hr-paysim/entry",
    "/hr-paysim/roster",
    "/hr-paysim/session/new",
    "/hr-paysim/session",
  ]) {
    await blockedPage.goto(origin + path, { waitUntil: "networkidle" });
    await assertNoBlockedPaySimLinks(blockedPage, `blocked route ${path}`);
    const unavailable = await blockedPage
      .locator('[data-route-unavailable="true"]')
      .isVisible();
    const textareaCount = await blockedPage.locator("textarea").count();
    const body = await blockedPage.locator("body").innerText();
    if (
      !unavailable
      || textareaCount !== 0
      || /row_id|role_group|base_salary_krw|data-no-active-session/.test(body)
    ) {
      throw new Error(`public route did not fail closed: ${path}`);
    }
  }
  await blockedContext.close();
  result.publicFacilitatorRoutesBlocked = true;
}
try {
  for (const viewport of facilitatorViewports) {
    await runFacilitatorQa(viewport);
  }
  await inspectPublicBlockedRoutes(viewports[0]);
  for (const viewport of viewports) {
    await openFresh(viewport);
    const visited = [];
    result.overflow[viewport.name] = {};

    for (let index = 0; index < expectedScreens.length; index += 1) {
      const screen = expectedScreens[index];
      const current = page.locator(`[data-screen="${screen}"]`);
      await current.waitFor({ state: "visible" });
      visited.push(screen);
      await assertNoBlockedPaySimLinks(page, `${viewport.name}/${screen}`);

      const primaryCount = await current.locator('[data-primary-action="true"]').count();
      if (primaryCount !== 1) throw new Error(`${screen} must expose exactly one primary action`);

      const visibleText = await current.innerText();
      ensureNoFounderLeaks(visibleText);
      const hasOverflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      result.overflow[viewport.name][screen] = hasOverflow;
      if (hasOverflow) throw new Error(`${viewport.name}/${screen} has horizontal overflow`);

      if (screen === "confirmed_pay_differences") {
        await inspectScreen2(viewport);
        if (viewport.name === "desktop-1280") {
          result.screenshots.screen2 = "C:/tmp/decision-room-screen2-1280.png";
          result.screenshots.screen2Viewport = "C:/tmp/decision-room-screen2-viewport.jpg";
          await page.screenshot({ path: result.screenshots.screen2, fullPage: true });
          await page.screenshot({
            path: result.screenshots.screen2Viewport,
            type: "jpeg",
            quality: 60,
            fullPage: false,
          });
        }
      }

      if (screen === "company_rule") await inspectScreen3(viewport);

      if (index === expectedScreens.length - 1) break;
      await current.locator('[data-primary-action="true"]').click();
      if (viewport.name === "desktop-1280") {
        result.clicksToResult += 1;
        const focused = await page.evaluate(() =>
          document.activeElement?.getAttribute("data-conclusion-heading")
        );
        result.focusMoves.push(focused === "true");
      }
    }
    result.screensByViewport[viewport.name] = visited;
  }

  if (result.clicksToResult !== 3) throw new Error("demo did not reach the result in three clicks");
  if (result.focusMoves.some((moved) => !moved)) throw new Error("focus did not move to a conclusion heading");

  await openFresh(viewports[0]);
  await page.locator('[data-primary-action="true"]').click();
  await page.locator('input[name="explanation"][value="timing_context"]').check();
  await page.locator('[data-screen="confirmed_pay_differences"] [data-primary-action="true"]').click();
  const recalculatedRuleText = await page.locator('[data-screen="company_rule"]').innerText();
  result.invalidation.ruleRemoved = !/9,500만원|현재 사례에서 700만원|대표 · HR/.test(recalculatedRuleText);
  if (!result.invalidation.ruleRemoved) throw new Error("invalidated repeat or decision copy survived on screen 3");
  await page.locator('[data-screen="company_rule"] [data-primary-action="true"]').click();
  const recalculatedResultText = await page.locator('[data-screen="session_result"]').innerText();
  result.invalidation.resultRemoved = !/확인 완료|다음 채용 전 추가 보상 기준/.test(recalculatedResultText);
  if (!result.invalidation.resultRemoved) throw new Error("invalidated decision copy survived on screen 4");

  await openFresh(viewports[0]);
  for (let index = 0; index < 3; index += 1) {
    const primary = page.locator('[data-primary-action="true"]');
    await primary.focus();
    await page.keyboard.press("Enter");
  }
  result.keyboardCompleted = await page.locator('[data-screen="session_result"]').isVisible();
  if (!result.keyboardCompleted) throw new Error("keyboard flow did not reach the result");

  await page.locator('[data-screen="session_result"] [data-primary-action="true"]').click();
  await page.locator('[aria-live="polite"] p').waitFor({ state: "visible" });
  result.copySucceeded = (await page.locator('[aria-live="polite"]').innerText())
    .includes("클립보드에 복사했습니다");
  if (!result.copySucceeded) throw new Error("copy success feedback is not visible");
  result.storage = await page.evaluate(() => ({
    localStorageKeys: localStorage.length,
    sessionStorageKeys: sessionStorage.length,
  }));
  if (result.storage.localStorageKeys !== 0 || result.storage.sessionStorageKeys !== 0) {
    throw new Error("browser storage contains decision-room state");
  }
  await page.locator(".dr-danger").click();
  result.sessionCleared = await page.locator('[data-decision-room-ended="true"]').isVisible();
  if (!result.sessionCleared) throw new Error("explicit session end did not clear the UI state");

  if (consoleIssues.length) throw new Error(`console issues found: ${consoleIssues.join("; ")}`);
} catch (error) {
  result.errors.push(error instanceof Error ? error.message : String(error));
} finally {
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

if (result.errors.length) process.exit(1);
