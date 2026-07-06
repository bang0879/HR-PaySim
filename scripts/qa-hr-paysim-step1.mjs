import { chromium } from "playwright";

const url = process.env.HR_PAYSIM_URL ?? "http://127.0.0.1:5173/hr-paysim/entry";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  permissions: ["clipboard-read", "clipboard-write"],
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const consoleIssues = [];
page.on("console", (message) => {
  if (["error", "warning"].includes(message.type())) {
    consoleIssues.push(`${message.type()}: ${message.text()}`);
  }
});
page.on("pageerror", (error) => {
  consoleIssues.push(`pageerror: ${error.message}`);
});

const result = {
  identity: null,
  reachedMemo: false,
  hasCopyButton: false,
  copiedTextHasScenario: false,
  hasConsentControl: false,
  consentDeclineKeepsMemo: false,
  consentPayloadPreview: false,
  desktopOverflow: false,
  mobileOverflow: false,
  iframeCount: 0,
  consoleIssues,
  screenshots: {
    desktop: "C:/tmp/hr-paysim-step1-desktop.png",
    mobile: "C:/tmp/hr-paysim-step1-mobile.png",
  },
  errors: [],
};

try {
  await page.goto(url, { waitUntil: "networkidle" });
  result.identity = {
    title: await page.title(),
    url: page.url(),
  };
  await page.locator('[data-mode="sample"]').click();
  for (let i = 0; i < 6; i += 1) {
    await page.locator('footer [data-action="next"]').click();
    await page.waitForTimeout(50);
  }

  await page.waitForSelector(".memo-preview", { timeout: 5000 });
  result.reachedMemo = true;
  result.iframeCount = await page.locator("iframe").count();

  const copyButton = page.locator('[data-action="copy-memo"]');
  result.hasCopyButton = await copyButton.count().then((count) => count > 0);
  if (!result.hasCopyButton) throw new Error("memo copy button missing");

  await copyButton.click();
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  result.copiedTextHasScenario = /선택한 시나리오|연봉 밴드|급여 밴드/.test(clipboardText);
  if (!result.copiedTextHasScenario) throw new Error("copied memo text does not include scenario context");

  const consent = page.locator('input[name="consentForAggregateAnalysis"]');
  result.hasConsentControl = await consent.count().then((count) => count > 0);
  if (!result.hasConsentControl) throw new Error("aggregate consent control missing");

  result.consentDeclineKeepsMemo = await page.locator(".memo-preview").isVisible();
  if (!result.consentDeclineKeepsMemo) throw new Error("memo preview disappeared without aggregate consent");

  await consent.check();
  await page.waitForTimeout(50);
  result.consentPayloadPreview = await page.locator('[data-testid="aggregate-payload-status"]').textContent()
    .then((text) => Boolean(text && /생성됨|로컬/.test(text)));
  if (!result.consentPayloadPreview) throw new Error("aggregate payload status did not update after consent");

  result.desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  await page.screenshot({ path: result.screenshots.desktop, fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  result.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  await page.screenshot({ path: result.screenshots.mobile, fullPage: false });

  if (result.desktopOverflow) throw new Error("desktop viewport has horizontal overflow");
  if (result.mobileOverflow) throw new Error("mobile viewport has horizontal overflow");
  if (result.iframeCount !== 0) throw new Error("prototype app should not render in an iframe");
  if (consoleIssues.length) throw new Error(`console issues found: ${consoleIssues.join("; ")}`);
} catch (error) {
  result.errors.push(error instanceof Error ? error.message : String(error));
} finally {
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

if (result.errors.length) process.exit(1);
