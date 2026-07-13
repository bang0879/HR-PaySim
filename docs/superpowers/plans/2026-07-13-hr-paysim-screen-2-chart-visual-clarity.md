# HR PaySim Screen 2 Chart Visual Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the existing Screen 2 salary-tenure chart so its plot, employee points, observed trend, direction guide, labels, legend, summary, and non-claim match the current HR PaySim decision-room tone without changing any factual coordinate or claim meaning.

**Architecture:** Keep `createSalaryTenurePlot()` and `founderCopy.ts` unchanged. Add only two semantic legend-state classes in `SalaryDistribution.tsx`, express the approved visual hierarchy in the existing bounded CSS module, and extend the existing source and Playwright QA contracts so computed styles and point-center alignment are both verified.

**Tech Stack:** TypeScript, React, CSS, Node test runner, Vite, Playwright QA, diagnostic-product-governance verifier.

## Global Constraints

- Work only in `C:\tmp\hr-paysim-facilitated-decision-room` on `codex/facilitated-decision-room`.
- Preserve all existing Task 9 dirty work; do not reset or rewrite unrelated files.
- Do not modify `salaryTenurePlot.ts`, `founderCopy.ts`, state, calculation, routes, report logic, shared governance, HR Prism, or Task 10 files.
- Keep horizontal tenure, vertical base salary, point-center ownership, OLS calculation, line meanings, and visible non-claim unchanged.
- Do not add a surrounding chart card, coordinate padding, arrowhead, confidence band, benchmark band, red warning, glow, leader line, new founder copy, or shock language.
- Keep the existing plot height: 240px on desktop and 260px at `max-width: 640px`.
- Keep the direction guide distinguishable without color and visually weaker than the observed trend.
- Do not commit any product implementation before the real N≥2 Task 9 human STOP GATE passes.
- The design-only commit `89aed01` remains independent; the eventual locked product commit is still `feat: build Product Engineer decision-room slice`.

---

## File Structure

- Modify `src/features/confirmed-pay-differences/SalaryDistribution.tsx`: add semantic `is-observed` and `is-guide` legend classes only.
- Modify `src/features/decision-room/decisionRoom.css`: own the complete visual hierarchy and responsive chart presentation.
- Modify `tests/hr-paysim/decision-room-ui.test.ts`: lock JSX class ownership, exact CSS tokens, and QA-source ownership.
- Modify `scripts/qa-decision-room.mjs`: measure computed visual hierarchy in every viewport while retaining coordinate and interaction QA.

---

### Task 1: Lock and implement the chart visual hierarchy

**Files:**
- Modify: `tests/hr-paysim/decision-room-ui.test.ts`
- Modify: `src/features/confirmed-pay-differences/SalaryDistribution.tsx`
- Modify: `src/features/decision-room/decisionRoom.css`

**Interfaces:**
- Consumes: existing `.dr-salary-plot`, `.dr-observed-trend-line`, `.dr-direction-guide-line`, `.dr-salary-person-dot`, `.dr-salary-person-label`, `.dr-trend-legend`, `.dr-trend-summary`, and `.dr-trend-non-claim` structure.
- Produces: `.dr-trend-legend .is-observed` and `.dr-trend-legend .is-guide` semantic hooks plus the exact CSS visual contract below.

- [ ] **Step 1: Write failing JSX and CSS source-contract tests**

In the existing `screen components render model-owned evidence and centralized result feedback` test, read the decision-room stylesheet next to the component sources:

```ts
const decisionRoomStyles = readFileSync(
  new URL("../../src/features/decision-room/decisionRoom.css", import.meta.url),
  "utf8",
);
```

Add these assertions after the existing trend-structure assertions:

```ts
assert.match(distribution, /className="is-observed"/);
assert.match(distribution, /className="is-guide"/);

assert.match(
  decisionRoomStyles,
  /\.dr-salary-plot\s*\{[^}]*border:\s*1px solid var\(--dr-line\)[^}]*border-radius:\s*14px[^}]*background-color:\s*var\(--dr-soft\)[^}]*background-size:\s*25% 25%/s,
);
assert.match(
  decisionRoomStyles,
  /\.dr-observed-trend-line\s*\{[^}]*stroke:\s*var\(--dr-ink\)[^}]*stroke-width:\s*3[^}]*stroke-linecap:\s*round/s,
);
assert.match(
  decisionRoomStyles,
  /\.dr-direction-guide-line\s*\{[^}]*stroke:\s*var\(--dr-blue\)[^}]*stroke-width:\s*2[^}]*stroke-dasharray:\s*7 6[^}]*stroke-linecap:\s*round[^}]*opacity:\s*0\.72/s,
);
assert.match(
  decisionRoomStyles,
  /\.dr-salary-person-label\s*\{[^}]*padding:\s*5px 7px[^}]*border:\s*1px solid var\(--dr-line\)[^}]*border-radius:\s*9px[^}]*background:\s*rgba\(255, 255, 255, 0\.94\)/s,
);
assert.match(
  decisionRoomStyles,
  /\.dr-salary-person\.is-highlighted \.dr-salary-person-label\s*\{[^}]*border-color:\s*var\(--dr-blue\)/s,
);
assert.match(
  decisionRoomStyles,
  /\.dr-trend-legend span\s*\{[^}]*border-radius:\s*999px[^}]*background:\s*#fff/s,
);
```

These tests intentionally check the approved visual tokens. They do not inspect screenshot pixels or alter product semantics.

- [ ] **Step 2: Run the focused source test and verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-ui.test.ts
```

Expected: FAIL because the legend state classes and approved plot, line, label, and legend styles do not yet exist.

- [ ] **Step 3: Add semantic legend-state classes only**

In `SalaryDistribution.tsx`, replace the two legend item openings without changing their copy or order:

```tsx
{plot.observedTrend ? (
  <span className="is-observed">
    <i className="is-solid" />
    {formatObservedTrendLabel(plot.observedTrend.sampleSize)}
  </span>
) : null}
<span className="is-guide">
  <i className="is-dashed" />
  {FOUNDER_COPY["screen.evidence.trend.guide_label"]}
</span>
```

- [ ] **Step 4: Replace only the chart presentation rules**

In `decisionRoom.css`, preserve selectors outside the chart block and implement these exact rules:

```css
.dr-salary-plot {
  position: relative;
  height: 240px;
  margin-inline: 44px;
  border: 1px solid var(--dr-line);
  border-radius: 14px;
  background-color: var(--dr-soft);
  background-image:
    linear-gradient(to right, rgba(227, 232, 239, 0.82) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(227, 232, 239, 0.82) 1px, transparent 1px);
  background-size: 25% 25%;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
}
.dr-observed-trend-line {
  stroke: var(--dr-ink);
  stroke-width: 3;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
.dr-direction-guide-line {
  stroke: var(--dr-blue);
  stroke-width: 2;
  stroke-dasharray: 7 6;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  opacity: 0.72;
}
.dr-salary-person-dot {
  position: absolute;
  left: 0;
  top: 0;
  width: 12px;
  height: 12px;
  transform: translate(-50%, -50%);
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--dr-muted);
  box-shadow: 0 0 0 2px var(--dr-muted), 0 4px 10px rgba(23, 32, 51, 0.1);
}
.dr-salary-person-label {
  position: absolute;
  left: 12px;
  top: -46px;
  display: grid;
  gap: 2px;
  min-width: 64px;
  padding: 5px 7px;
  border: 1px solid var(--dr-line);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 5px 14px rgba(23, 32, 51, 0.08);
  white-space: nowrap;
}
.dr-salary-person.is-label-left .dr-salary-person-label {
  left: auto;
  right: 12px;
  text-align: right;
}
.dr-salary-person.is-label-below .dr-salary-person-label {
  top: 12px;
}
.dr-salary-person.is-highlighted .dr-salary-person-dot {
  width: 16px;
  height: 16px;
  background: var(--dr-blue);
  box-shadow: 0 0 0 3px var(--dr-ink), 0 6px 14px rgba(37, 99, 235, 0.18);
}
.dr-salary-person.is-highlighted .dr-salary-person-label {
  border-color: var(--dr-blue);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.12);
}
.dr-salary-person.is-highlighted .dr-salary-person-label strong {
  color: var(--dr-blue-deep);
  font-weight: 900;
}
.dr-trend-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  color: #344054;
  font-size: 11px;
  font-weight: 800;
}
.dr-trend-legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 6px 10px;
  border: 1px solid var(--dr-line);
  border-radius: 999px;
  background: #fff;
}
.dr-trend-legend .is-observed {
  color: var(--dr-ink);
  border-color: #cfd7e3;
  box-shadow: 0 4px 12px rgba(23, 32, 51, 0.06);
}
.dr-trend-legend .is-guide {
  color: #44546a;
  border-color: #cfe0ff;
  background: var(--dr-blue-soft);
}
.dr-trend-legend i {
  width: 28px;
  border-top: 3px solid var(--dr-ink);
}
.dr-trend-legend i.is-dashed {
  border-top: 2px dashed var(--dr-blue);
  opacity: 0.72;
}
.dr-trend-summary,
.dr-trend-non-claim {
  margin: 10px 0 0;
  padding: 12px 14px;
  color: #526071;
  font-size: 12px;
  line-height: 1.55;
}
.dr-trend-summary {
  border: 1px solid #e7ebf1;
  border-radius: 12px;
  background: #fbfcfe;
}
.dr-trend-non-claim {
  border: 1px solid #d7e4fb;
  border-left: 3px solid #7ca4ee;
  border-radius: 0 12px 12px 0;
  background: var(--dr-blue-soft);
}
```

Replace only the relevant mobile label rule inside `@media (max-width: 640px)`:

```css
.dr-salary-person-label {
  min-width: 48px;
  padding: 4px 6px;
}
```

Keep the existing mobile plot margin `18px`, height `260px`, and tenure-axis margin unchanged.

- [ ] **Step 5: Run focused UI and type checks and verify GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-ui.test.ts tests/hr-paysim/salary-tenure-plot.test.ts tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/tenure-axis-neutral-copy.test.ts
npm.cmd run typecheck
git diff --check -- src/features/confirmed-pay-differences/SalaryDistribution.tsx src/features/decision-room/decisionRoom.css tests/hr-paysim/decision-room-ui.test.ts
```

Expected: all focused tests pass, TypeScript exits 0, and diff check exits 0.

- [ ] **Step 6: Review checkpoint without committing**

Inspect the three file diffs. Confirm no copy, coordinates, model, or state changed. Do not stage or commit.

---

### Task 2: Measure the intended visual hierarchy in the browser

**Files:**
- Modify: `tests/hr-paysim/decision-room-ui.test.ts`
- Modify: `scripts/qa-decision-room.mjs`

**Interfaces:**
- Consumes: computed styles of the existing chart elements and the two Task 1 legend-state classes.
- Produces: `result.visualHierarchy[viewport.name]` with `plotRadiusPx`, line widths, guide dash/opacity, point diameters, label opacity, and legend visibility.

- [ ] **Step 1: Write a failing QA-source ownership test**

Read the QA script in the same source-ownership test:

```ts
const decisionRoomQa = readFileSync(
  new URL("../../scripts/qa-decision-room.mjs", import.meta.url),
  "utf8",
);
```

Add:

```ts
assert.match(decisionRoomQa, /visualHierarchy/);
assert.match(decisionRoomQa, /observedStrokeWidth/);
assert.match(decisionRoomQa, /highlightedPointDiameter/);
assert.match(decisionRoomQa, /standardPointDiameter/);
assert.match(decisionRoomQa, /guideStrokeDasharray/);
```

- [ ] **Step 2: Run the focused source test and verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-ui.test.ts
```

Expected: FAIL because the QA script does not yet produce `visualHierarchy`.

- [ ] **Step 3: Add the computed-style browser measurement**

Add `visualHierarchy: {}` beside `pointAlignment` and `trendGuide` in the QA result. After the existing `trendGuide` assertions in `inspectScreen2()`, add:

```js
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
```

- [ ] **Step 4: Run the focused source test and verify GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-ui.test.ts
git diff --check -- scripts/qa-decision-room.mjs tests/hr-paysim/decision-room-ui.test.ts
```

Expected: source test and diff check pass.

- [ ] **Step 5: Start one exact hidden QA server and run browser QA**

Verify port 5173 has no listener. Start Vite with `--port 5173 --strictPort` using `Start-Process -WindowStyle Hidden`, then record the actual listener PID. Run:

```powershell
node scripts/qa-decision-room.mjs
```

Expected for all three viewports:

- `visualHierarchy.complete: true`;
- plot radius 14;
- observed/guide widths 3 and 2;
- both line caps `round`;
- guide dash and 0.72 opacity present;
- highlighted point diameter greater than standard;
- opaque label chip and visible observed/guide legend keys;
- point alignment remains at most 2.5px;
- no overflow, console issue, interaction failure, storage, or stale output.

- [ ] **Step 6: Stop only the recorded listener PID**

Stop the exact listener PID, then verify `Get-NetTCPConnection -LocalPort 5173 -State Listen` returns no object. Do not treat `TIME_WAIT` as a listener. Do not commit.

---

### Task 3: Run the full Task 9 regression suite and return to the human gate

**Files:**
- Test: all current Task 9 implementation files and tests.
- Generate outside the repository: `C:\tmp\decision-room-screen2-viewport.jpg`.

**Interfaces:**
- Consumes: Tasks 1 and 2 final working tree.
- Produces: fresh automated evidence and a new first-viewport image for real participants; no validation record without real responses.

- [ ] **Step 1: Run the complete fresh automated suite**

Run and read every command:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

Expected: every command exits 0; all Node tests have 0 failures; browser QA covers all four screens at 1280×720, 1440×900, and 390px; `errors` and `consoleIssues` are empty.

- [ ] **Step 2: Verify approved scope and preserve the STOP GATE**

Run:

```powershell
git status --short --branch
git diff --check
```

Confirm the visual pass changed only:

- `SalaryDistribution.tsx`;
- `decisionRoom.css`;
- `decision-room-ui.test.ts`;
- `qa-decision-room.mjs`.

Other pre-existing Task 9 files remain unchanged from their current dirty state. Do not stage or commit.

- [ ] **Step 3: Run the real N≥2 five-second gate**

Show the newly generated 1280×720 first-viewport image without explanation to at least two non-HR participants, including at least one target-adjacent founder or operator. Record each participant's verbatim answer and role proximity for:

1. 무엇과 무엇을 비교하는가?
2. 어떤 연봉 차이가 확인됐는가?
3. 지금 무엇을 확인하거나 선택해야 하는가?
4. 파란 점선은 무엇을 뜻하는가?

The gate fails if any participant treats a point label as the coordinate, misses the 2,700만원 comparison or next check, or treats the guide as a market average, normal raise rate, recommended salary, or approved company rule.

- [ ] **Step 4: Stop without a product commit unless the real gate passes**

If real responses are unavailable or any participant fails, do not create a passing validation record, stage product files, or commit Task 9. Report the exact remaining gate. If every participant passes, follow the already approved Task 9 plan to create the real validation record, rerun the complete suite, stage the exact Task 9 scope, and commit once as:

```powershell
git commit -m "feat: build Product Engineer decision-room slice"
```

Stop before Task 10 and request independent review.
