import { chromium } from "playwright";

const url = process.env.HR_PAYSIM_URL
  ?? "http://127.0.0.1:5173/hr-paysim/decision-room-preview";
const viewports = [
  { name: "desktop-1280", width: 1280, height: 720 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];
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
  trendGuide: {},
  visualHierarchy: {},
  invalidation: {},
  copySucceeded: false,
  sessionCleared: false,
  storage: {},
  consoleIssues,
  screenshots: {},
  errors: [],
};

async function openFresh(viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator('[data-decision-room="true"]').waitFor({ timeout: 5000 });
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
    "근속 64개월인 직원 A",
    "근속 14개월인 직원 B",
    "2,700만원",
  ]) {
    if (!conclusionText.includes(required)) {
      throw new Error(`screen 2 title is missing: ${required}`);
    }
  }
  for (const required of ["직원 6명의 기본 연봉과 근속 개월", "직원 A와 직원 B"]) {
    if (!supportingText.includes(required)) {
      throw new Error(`screen 2 supporting copy is missing: ${required}`);
    }
  }
  const distributionText = await distribution.innerText();
  for (const required of [
    "가로축 · 근속 개월",
    "세로축 · 기본 연봉",
    "현재 6명의 관찰 추세",
    "근속 개월과 기본 연봉이 함께 증가하는 방향",
    "시장 평균이나 권장 연봉, 회사의 연봉 기준이 아닙니다",
  ]) {
    if (!distributionText.includes(required)) {
      throw new Error(`screen 2 distribution is missing: ${required}`);
    }
  }
  for (const oldOrientation of ["가로축 · 기본 연봉", "세로축 · 근속 개월"]) {
    if (distributionText.includes(oldOrientation)) {
      throw new Error(`screen 2 distribution retains the old orientation: ${oldOrientation}`);
    }
  }
  const pointAlignment = await page.evaluate(() => {
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
  const trendGuide = {
    observedLineCount: await page.locator(".dr-observed-trend-line").count(),
    directionGuideLineCount: await page.locator(".dr-direction-guide-line").count(),
    nonClaimVisible: await page.locator(".dr-trend-non-claim").isVisible(),
  };
  result.trendGuide[viewport.name] = trendGuide;
  if (trendGuide.observedLineCount !== 1 || trendGuide.directionGuideLineCount !== 1) {
    throw new Error("screen 2 observed trend or direction guide line is missing");
  }
  if (!trendGuide.nonClaimVisible) throw new Error("screen 2 direction-guide non-claim is hidden");
  const visualHierarchy = await page.evaluate(() => {
    const plot = document.querySelector(".dr-salary-plot");
    const observed = document.querySelector(".dr-observed-trend-line");
    const guide = document.querySelector(".dr-direction-guide-line");
    const standardPoint = document.querySelector(
      ".dr-salary-person:not(.is-highlighted) .dr-salary-person-dot",
    );
    const highlightedPoint = document.querySelector(
      ".dr-salary-person.is-highlighted .dr-salary-person-dot",
    );
    const label = document.querySelector(".dr-salary-person-label");
    const observedKey = document.querySelector(".dr-trend-legend .is-observed");
    const guideKey = document.querySelector(".dr-trend-legend .is-guide");
    if (!(plot instanceof HTMLElement)
      || !(observed instanceof SVGElement)
      || !(guide instanceof SVGElement)
      || !(standardPoint instanceof HTMLElement)
      || !(highlightedPoint instanceof HTMLElement)
      || !(label instanceof HTMLElement)
      || !(observedKey instanceof HTMLElement)
      || !(guideKey instanceof HTMLElement)) {
      return { complete: false };
    }
    const plotStyle = getComputedStyle(plot);
    const observedStyle = getComputedStyle(observed);
    const guideStyle = getComputedStyle(guide);
    const standardRect = standardPoint.getBoundingClientRect();
    const highlightedRect = highlightedPoint.getBoundingClientRect();
    const labelStyle = getComputedStyle(label);
    return {
      complete: true,
      observedLineStartXPercent: Number.parseFloat(observed.getAttribute("x1") ?? "NaN"),
      observedLineEndXPercent: Number.parseFloat(observed.getAttribute("x2") ?? "NaN"),
      guideLineStartXPercent: Number.parseFloat(guide.getAttribute("x1") ?? "NaN"),
      guideLineEndXPercent: Number.parseFloat(guide.getAttribute("x2") ?? "NaN"),
      plotRadiusPx: Number.parseFloat(plotStyle.borderTopLeftRadius),
      observedStrokeWidth: Number.parseFloat(observedStyle.strokeWidth),
      observedStrokeLinecap: observedStyle.strokeLinecap,
      guideStrokeWidth: Number.parseFloat(guideStyle.strokeWidth),
      guideStrokeDasharray: guideStyle.strokeDasharray,
      guideStrokeLinecap: guideStyle.strokeLinecap,
      guideOpacity: Number.parseFloat(guideStyle.opacity),
      standardPointDiameter: standardRect.width,
      highlightedPointDiameter: highlightedRect.width,
      labelBackgroundColor: labelStyle.backgroundColor,
      observedKeyVisible: observedKey.getBoundingClientRect().width > 0,
      guideKeyVisible: guideKey.getBoundingClientRect().width > 0,
    };
  });
  result.visualHierarchy[viewport.name] = visualHierarchy;
  if (!visualHierarchy.complete
    || Math.abs(visualHierarchy.observedLineStartXPercent - 12) > 0.01
    || Math.abs(visualHierarchy.observedLineEndXPercent - 88) > 0.01
    || Math.abs(visualHierarchy.guideLineStartXPercent - 23.12) > 0.01
    || Math.abs(visualHierarchy.guideLineEndXPercent - 76.88) > 0.01
    || visualHierarchy.plotRadiusPx !== 14
    || visualHierarchy.observedStrokeWidth !== 3
    || visualHierarchy.guideStrokeWidth !== 2
    || visualHierarchy.observedStrokeLinecap !== "round"
    || visualHierarchy.guideStrokeLinecap !== "round"
    || !visualHierarchy.guideStrokeDasharray.includes("7")
    || Math.abs(visualHierarchy.guideOpacity - 0.72) > 0.01
    || visualHierarchy.highlightedPointDiameter <= visualHierarchy.standardPointDiameter
    || visualHierarchy.labelBackgroundColor === "rgba(0, 0, 0, 0)"
    || !visualHierarchy.observedKeyVisible
    || !visualHierarchy.guideKeyVisible) {
    throw new Error(`screen 2 visual hierarchy mismatch: ${JSON.stringify(visualHierarchy)}`);
  }
  for (const required of ["지금 확인해 봐야 할 기준", "이유를 하나 선택", "확인할 기록"]) {
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
  const disabledSubjects = await page.locator(".dr-subject-row button:disabled").count();
  if (disabledSubjects !== 2) throw new Error("Platform and GTM must remain visibly unavailable");
  if (!(await page.locator(".dr-evidence-question").isVisible())) {
    throw new Error("the conditional evidence question is not visible for the prefilled explanation");
  }
}

try {
  for (const viewport of viewports) {
    await openFresh(viewport);
    const visited = [];
    result.overflow[viewport.name] = {};

    for (let index = 0; index < expectedScreens.length; index += 1) {
      const screen = expectedScreens[index];
      const current = page.locator(`[data-screen="${screen}"]`);
      await current.waitFor({ state: "visible" });
      visited.push(screen);

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
