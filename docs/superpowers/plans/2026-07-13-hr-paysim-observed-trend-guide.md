# HR PaySim Observed Trend Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct Screen 2 point alignment, swap the chart to tenure-on-x and salary-on-y, and add a data-derived observed trend plus a separately limited direction guide without inventing a benchmark.

**Architecture:** Extend the existing pure `createSalaryTenurePlot()` model so it owns every factual coordinate, least-squares line, direction state, and normalized guide endpoint. Keep important meanings in `founderCopy.ts`; let `SalaryDistribution.tsx` render those model outputs with zero-size point anchors so label dimensions cannot change factual positions. Extend the existing browser QA to measure point-center alignment, visible claim boundaries, first-viewport cues, and the unchanged four-screen flow.

**Tech Stack:** TypeScript, React, CSS, Node test runner, Vite, Playwright QA, diagnostic-product-governance verifier.

## Global Constraints

- Work only in `C:\tmp\hr-paysim-facilitated-decision-room` on `codex/facilitated-decision-room`.
- Preserve the existing Task 9 dirty implementation; do not reset or rewrite unrelated files.
- Horizontal axis is actual tenure months; vertical axis is current base salary KRW formatted in 만원.
- The point center owns the factual coordinate. Label dimensions or collision offsets must not move the point.
- The solid line is ordinary least squares over currently plotted rows and describes current data only.
- The dashed guide is a normalized lower-left-to-upper-right reading aid. It contains no salary, annual raise, percentage, midpoint, intercept, benchmark, or company-rule parameter.
- Founder-facing copy must not call the guide `정상`, `통상`, `시장`, `기대`, `권장`, `적정`, or `회사 기준`, except inside the approved separate negating non-claim.
- Keep the observed line and direction guide distinct without relying on color alone.
- Preserve all-employee coverage, missing-tenure listing, four screens, exactly three primary actions, focus movement, invalidation, copy, storage, and session clearing.
- Styling details remain bounded to a functional accessible implementation; visual polish is a separate later design pass.
- Do not commit any Task 9 implementation before the repeated N≥2 human STOP GATE passes.
- Task 10 remains blocked until Task 9 passes, is committed as `feat: build Product Engineer decision-room slice`, and receives independent review.

---

## File Structure

- Modify `src/features/confirmed-pay-differences/salaryTenurePlot.ts`: pure coordinates, trend calculation, direction state, and normalized guide.
- Modify `tests/hr-paysim/salary-tenure-plot.test.ts`: pure-model TDD for swapped axes, least squares, edge states, and order independence.
- Modify `src/lib/hr-paysim/copy/founderCopy.ts`: labels, observed-direction formatter, insufficient-trend copy, and separate non-claim.
- Modify `tests/hr-paysim/founder-copy.test.ts`: dynamic trend and non-claim SSOT contract.
- Modify `tests/hr-paysim/tenure-axis-neutral-copy.test.ts`: visible-source and risky-label regression checks.
- Modify `src/features/confirmed-pay-differences/SalaryDistribution.tsx`: semantic axes, SVG lines, factual zero-size point anchors, labels, summary, and visible non-claim.
- Modify `src/features/decision-room/decisionRoom.css`: functional line/point/label layout and responsive containment only.
- Modify `tests/hr-paysim/decision-room-ui.test.ts`: source ownership and Screen 2 structural cues.
- Modify `scripts/qa-decision-room.mjs`: coordinate measurement, line/non-claim cues, first viewport, and unchanged interaction QA.
- Create only after real participants respond: `docs/hr-paysim/validation/2026-07-13-task-9-screen-2-comprehension.md`.

---

### Task 1: Make the plot model own factual axes and observed trend

**Files:**
- Modify: `tests/hr-paysim/salary-tenure-plot.test.ts`
- Modify: `src/features/confirmed-pay-differences/salaryTenurePlot.ts`

**Interfaces:**
- Consumes: rows shaped as `{ employeeLabel: string; salaryKRW: number; tenureMonths?: number }`.
- Produces: `createSalaryTenurePlot<T>(distribution: T[]): SalaryTenurePlot<T>`.
- Produces: `points[].xPercent` from tenure and `points[].yPercent` from salary.
- Produces: `observedTrend: ObservedTrendLine | null` and a parameter-free `directionGuide`.

- [ ] **Step 1: Replace the focused tests with failing axis and trend expectations**

Add these imports and assertions while retaining the existing empty-input and missing-tenure coverage:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createSalaryTenurePlot } from "../../src/features/confirmed-pay-differences/salaryTenurePlot.ts";

const rows = [
  { employeeLabel: "직원 A", salaryKRW: 68_000_000, tenureMonths: 64 },
  { employeeLabel: "직원 C", salaryKRW: 72_000_000, tenureMonths: 56 },
  { employeeLabel: "직원 D", salaryKRW: 76_000_000, tenureMonths: 48 },
  { employeeLabel: "직원 E", salaryKRW: 88_000_000, tenureMonths: 22 },
  { employeeLabel: "직원 F", salaryKRW: 90_000_000, tenureMonths: 18 },
  { employeeLabel: "직원 B", salaryKRW: 95_000_000, tenureMonths: 14 },
];

test("maps tenure to x and salary to y", () => {
  const plot = createSalaryTenurePlot(rows);
  const employeeA = plot.points.find((point) => point.employeeLabel === "직원 A");
  const employeeB = plot.points.find((point) => point.employeeLabel === "직원 B");

  assert.equal(employeeA?.xPercent, 100);
  assert.equal(employeeA?.yPercent, 0);
  assert.equal(employeeB?.xPercent, 0);
  assert.equal(employeeB?.yPercent, 100);
});

test("derives an order-independent downward observed trend", () => {
  const forward = createSalaryTenurePlot(rows).observedTrend;
  const reversed = createSalaryTenurePlot([...rows].reverse()).observedTrend;

  assert.deepEqual(reversed, forward);
  assert.equal(forward?.sampleSize, 6);
  assert.equal(forward?.direction, "decreasing");
  assert.equal(forward?.start.xPercent, 0);
  assert.equal(forward?.end.xPercent, 100);
  assert.ok((forward?.start.yPercent ?? 0) > (forward?.end.yPercent ?? 100));
});

test("keeps the direction guide normalized and parameter-free", () => {
  const guide = createSalaryTenurePlot(rows).directionGuide;
  assert.deepEqual(guide, {
    start: { xPercent: 8, yPercent: 8 },
    end: { xPercent: 92, yPercent: 92 },
  });
});

test("does not invent a trend from too few or single-tenure rows", () => {
  assert.equal(createSalaryTenurePlot(rows.slice(0, 2)).observedTrend, null);
  assert.equal(createSalaryTenurePlot([
    { employeeLabel: "직원 A", salaryKRW: 68_000_000, tenureMonths: 12 },
    { employeeLabel: "직원 B", salaryKRW: 72_000_000, tenureMonths: 12 },
    { employeeLabel: "직원 C", salaryKRW: 76_000_000, tenureMonths: 12 },
  ]).observedTrend, null);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/salary-tenure-plot.test.ts
```

Expected: FAIL because the current model maps salary to `x`, tenure to `y`, and exposes neither `observedTrend` nor `directionGuide`.

- [ ] **Step 3: Implement the minimal pure model**

Use these exact public types and helpers in `salaryTenurePlot.ts`:

```ts
export type ObservedTrendDirection = "increasing" | "decreasing" | "flat";

export interface PlotCoordinate {
  xPercent: number;
  yPercent: number;
}

export interface SalaryTenurePlotPoint<T> extends PlotCoordinate {
  row: T;
  employeeLabel: string;
}

export interface ObservedTrendLine {
  start: PlotCoordinate;
  end: PlotCoordinate;
  direction: ObservedTrendDirection;
  sampleSize: number;
}

export interface SalaryTenurePlot<T> {
  points: SalaryTenurePlotPoint<T>[];
  missingTenure: T[];
  salaryTicksKRW: number[];
  tenureTicksMonths: number[];
  observedTrend: ObservedTrendLine | null;
  directionGuide: {
    start: PlotCoordinate;
    end: PlotCoordinate;
  };
}

const DIRECTION_GUIDE = {
  start: { xPercent: 8, yPercent: 8 },
  end: { xPercent: 92, yPercent: 92 },
} as const;

export function createSalaryTenurePlot<T extends {
  employeeLabel: string;
  salaryKRW: number;
  tenureMonths?: number;
}>(distribution: T[]): SalaryTenurePlot<T> {
  const plottable = distribution.filter(
    (row): row is T & { tenureMonths: number } =>
      Number.isFinite(row.salaryKRW) &&
      Number.isFinite(row.tenureMonths) &&
      (row.tenureMonths ?? -1) >= 0,
  );
  const missingTenure = distribution.filter((row) => !plottable.includes(row as T & { tenureMonths: number }));

  if (plottable.length === 0) {
    return {
      points: [],
      missingTenure,
      salaryTicksKRW: [],
      tenureTicksMonths: [],
      observedTrend: null,
      directionGuide: cloneGuide(),
    };
  }

  const salaries = plottable.map((row) => row.salaryKRW);
  const tenures = plottable.map((row) => row.tenureMonths);
  const minimumSalary = Math.min(...salaries);
  const maximumSalary = Math.max(...salaries);
  const minimumTenure = Math.min(...tenures);
  const maximumTenure = Math.max(...tenures);

  return {
    points: plottable.map((row) => ({
      row,
      employeeLabel: row.employeeLabel,
      xPercent: coordinate(row.tenureMonths, minimumTenure, maximumTenure),
      yPercent: coordinate(row.salaryKRW, minimumSalary, maximumSalary),
    })),
    missingTenure,
    salaryTicksKRW: [minimumSalary, (minimumSalary + maximumSalary) / 2, maximumSalary],
    tenureTicksMonths: [minimumTenure, Math.round((minimumTenure + maximumTenure) / 2), maximumTenure],
    observedTrend: createObservedTrend(plottable, {
      minimumSalary,
      maximumSalary,
      minimumTenure,
      maximumTenure,
    }),
    directionGuide: cloneGuide(),
  };
}

function createObservedTrend<T extends { salaryKRW: number; tenureMonths: number }>(
  rows: T[],
  domain: {
    minimumSalary: number;
    maximumSalary: number;
    minimumTenure: number;
    maximumTenure: number;
  },
): ObservedTrendLine | null {
  if (rows.length < 3 || domain.minimumTenure === domain.maximumTenure) return null;

  const meanTenure = rows.reduce((sum, row) => sum + row.tenureMonths, 0) / rows.length;
  const meanSalary = rows.reduce((sum, row) => sum + row.salaryKRW, 0) / rows.length;
  const denominator = rows.reduce((sum, row) => sum + (row.tenureMonths - meanTenure) ** 2, 0);
  if (denominator === 0) return null;

  const numerator = rows.reduce(
    (sum, row) => sum + (row.tenureMonths - meanTenure) * (row.salaryKRW - meanSalary),
    0,
  );
  const slope = numerator / denominator;
  const intercept = meanSalary - slope * meanTenure;
  const salaryAtMinimumTenure = intercept + slope * domain.minimumTenure;
  const salaryAtMaximumTenure = intercept + slope * domain.maximumTenure;

  return {
    start: {
      xPercent: 0,
      yPercent: coordinate(salaryAtMinimumTenure, domain.minimumSalary, domain.maximumSalary),
    },
    end: {
      xPercent: 100,
      yPercent: coordinate(salaryAtMaximumTenure, domain.minimumSalary, domain.maximumSalary),
    },
    direction: slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "flat",
    sampleSize: rows.length,
  };
}

function coordinate(value: number, minimum: number, maximum: number): number {
  if (minimum === maximum) return 50;
  return Math.min(100, Math.max(0, ((value - minimum) / (maximum - minimum)) * 100));
}

function cloneGuide() {
  return {
    start: { ...DIRECTION_GUIDE.start },
    end: { ...DIRECTION_GUIDE.end },
  };
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the same command. Expected: all `salary-tenure-plot` tests PASS.

- [ ] **Step 5: Review checkpoint without committing**

Run:

```powershell
git diff --check -- src/features/confirmed-pay-differences/salaryTenurePlot.ts tests/hr-paysim/salary-tenure-plot.test.ts
```

Expected: exit 0. Do not commit; the Task 9 STOP GATE still applies.

---

### Task 2: Centralize observed-trend and guide copy

**Files:**
- Modify: `src/lib/hr-paysim/copy/founderCopy.ts`
- Modify: `tests/hr-paysim/founder-copy.test.ts`
- Modify: `tests/hr-paysim/tenure-axis-neutral-copy.test.ts`

**Interfaces:**
- Consumes: `{ employeeCount: number; direction: "increasing" | "decreasing" | "flat" }`.
- Produces: `formatObservedTrendLabel(employeeCount)`.
- Produces: `formatObservedTrendSummary({ employeeCount, direction })`.
- Produces: `FOUNDER_COPY` keys for the guide label, separate non-claim, and unavailable state.

- [ ] **Step 1: Write failing SSOT tests**

Add:

```ts
import {
  FOUNDER_COPY,
  formatObservedTrendLabel,
  formatObservedTrendSummary,
} from "../../src/lib/hr-paysim/copy/founderCopy.ts";

test("keeps the observed trend and neutral guide in the founder copy SSOT", () => {
  assert.equal(formatObservedTrendLabel(6), "현재 6명의 관찰 추세");
  assert.equal(
    formatObservedTrendSummary({ employeeCount: 6, direction: "decreasing" }),
    "현재 6명의 점을 한 줄로 요약하면, 근속 개월이 늘어나는 쪽에서 기본 연봉이 낮아지는 방향입니다. 이 자료만으로 그 원인이나 적정 연봉을 판단할 수는 없습니다.",
  );
  assert.equal(
    FOUNDER_COPY["screen.evidence.trend.guide_label"],
    "근속 개월과 기본 연봉이 함께 증가하는 방향",
  );
  assert.equal(
    FOUNDER_COPY["screen.evidence.trend.guide_non_claim"],
    "파란 점선은 시장 평균이나 권장 연봉, 회사의 연봉 기준이 아닙니다. 근속 개월과 기본 연봉이 함께 증가하는 방향을 읽기 위한 시각적 안내입니다.",
  );
  assert.doesNotMatch(
    FOUNDER_COPY["screen.evidence.trend.guide_label"],
    /정상|통상|시장|기대|권장|적정|회사 기준/,
  );
});
```

- [ ] **Step 2: Run focused copy tests and verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/tenure-axis-neutral-copy.test.ts
```

Expected: FAIL because the new keys and formatters do not exist.

- [ ] **Step 3: Add the exact founder-copy contract**

Add these entries to `FOUNDER_COPY`:

```ts
"screen.evidence.trend.guide_label": "근속 개월과 기본 연봉이 함께 증가하는 방향",
"screen.evidence.trend.guide_non_claim": "파란 점선은 시장 평균이나 권장 연봉, 회사의 연봉 기준이 아닙니다. 근속 개월과 기본 연봉이 함께 증가하는 방향을 읽기 위한 시각적 안내입니다.",
"screen.evidence.trend.unavailable": "현재 표시된 직원만으로는 근속 개월과 기본 연봉의 관찰 추세를 계산하기 어렵습니다.",
```

Add these exported formatters next to the existing Product Engineer dynamic formatters:

```ts
export function formatObservedTrendLabel(employeeCount: number): string {
  assertPositiveCount(employeeCount, "OBSERVED_TREND_EMPLOYEE_COUNT_INVALID");
  return `현재 ${employeeCount}명의 관찰 추세`;
}

export function formatObservedTrendSummary({
  employeeCount,
  direction,
}: {
  employeeCount: number;
  direction: "increasing" | "decreasing" | "flat";
}): string {
  assertPositiveCount(employeeCount, "OBSERVED_TREND_EMPLOYEE_COUNT_INVALID");
  const directionCopy = direction === "increasing"
    ? "근속 개월이 늘어나는 쪽에서 기본 연봉도 높아지는 방향입니다."
    : direction === "decreasing"
      ? "근속 개월이 늘어나는 쪽에서 기본 연봉이 낮아지는 방향입니다."
      : "근속 개월에 따라 기본 연봉이 높아지거나 낮아지는 뚜렷한 방향이 없습니다.";
  return `현재 ${employeeCount}명의 점을 한 줄로 요약하면, ${directionCopy} 이 자료만으로 그 원인이나 적정 연봉을 판단할 수는 없습니다.`;
}
```

If `assertPositiveCount` is not already reusable, extract the current employee-count validation into that helper without changing its existing error codes.

- [ ] **Step 4: Run focused copy tests and verify GREEN**

Run the same command. Expected: all focused copy tests PASS.

- [ ] **Step 5: Review checkpoint without committing**

Run `git diff --check` for the three Task 2 files. Expected: exit 0. Do not commit.

---

### Task 3: Render factual point anchors, two line meanings, and separate limits

**Files:**
- Modify: `src/features/confirmed-pay-differences/SalaryDistribution.tsx`
- Modify: `src/features/decision-room/decisionRoom.css`
- Modify: `tests/hr-paysim/decision-room-ui.test.ts`

**Interfaces:**
- Consumes: Task 1 `points`, `observedTrend`, `directionGuide`, salary ticks, tenure ticks, and missing-tenure rows.
- Consumes: Task 2 labels, summary formatter, non-claim, and unavailable copy.
- Produces: `.dr-salary-plot`, `.dr-salary-person`, `.dr-salary-person-dot`, `.dr-observed-trend-line`, and `.dr-direction-guide-line` for QA.

- [ ] **Step 1: Write failing source-ownership and structural tests**

Extend `decision-room-ui.test.ts` to assert:

```ts
assert.match(salaryDistributionSource, /formatObservedTrendLabel/);
assert.match(salaryDistributionSource, /formatObservedTrendSummary/);
assert.match(salaryDistributionSource, /screen\.evidence\.trend\.guide_non_claim/);
assert.match(salaryDistributionSource, /dr-observed-trend-line/);
assert.match(salaryDistributionSource, /dr-direction-guide-line/);
assert.match(salaryDistributionSource, /가로축 · 근속 개월/);
assert.match(salaryDistributionSource, /세로축 · 기본 연봉/);
assert.doesNotMatch(salaryDistributionSource, /시장 평균이나 권장 연봉/);
```

The final assertion proves the important sentence comes from `FOUNDER_COPY`, not duplicated JSX.

- [ ] **Step 2: Run the focused UI test and verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-ui.test.ts
```

Expected: FAIL on the new line classes, swapped axis copy, and SSOT usage.

- [ ] **Step 3: Replace the chart structure with zero-size factual anchors**

Import the Task 2 copy and render the plot using this structure:

```tsx
import {
  FOUNDER_COPY,
  formatObservedTrendLabel,
  formatObservedTrendSummary,
} from "../../lib/hr-paysim/copy/founderCopy.ts";

const trendSummary = plot.observedTrend
  ? formatObservedTrendSummary({
      employeeCount: plot.observedTrend.sampleSize,
      direction: plot.observedTrend.direction,
    })
  : FOUNDER_COPY["screen.evidence.trend.unavailable"];

<p className="dr-plot-description" id="salary-tenure-description">
  가로 위치는 근속 개월, 세로 위치는 기본 연봉을 뜻합니다. 근속 개월을 확인할 수 있는 직원 전체를 표시합니다.
</p>
<div className="dr-scatter-layout">
  <div className="dr-salary-axis-vertical" aria-hidden="true">
    <strong>세로축 · 기본 연봉</strong>
    <div>
      <span>{formatSalaryTick(maximumSalary)}</span>
      <span>{formatSalaryTick(midpointSalary)}</span>
      <span>{formatSalaryTick(minimumSalary)}</span>
    </div>
  </div>
  <div>
    <div
      className="dr-salary-plot"
      role="img"
      aria-label="직원별 근속 개월과 기본 연봉 분포"
      aria-describedby="salary-tenure-description salary-tenure-summary salary-tenure-guide-limit"
    >
      <svg className="dr-plot-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {plot.observedTrend ? (
          <line
            className="dr-observed-trend-line"
            x1={plot.observedTrend.start.xPercent}
            y1={100 - plot.observedTrend.start.yPercent}
            x2={plot.observedTrend.end.xPercent}
            y2={100 - plot.observedTrend.end.yPercent}
          />
        ) : null}
        <line
          className="dr-direction-guide-line"
          x1={plot.directionGuide.start.xPercent}
          y1={100 - plot.directionGuide.start.yPercent}
          x2={plot.directionGuide.end.xPercent}
          y2={100 - plot.directionGuide.end.yPercent}
        />
      </svg>
      {plot.points.map(({ row, employeeLabel, xPercent, yPercent }) => (
        <div
          className={[
            "dr-salary-person",
            row.highlighted ? "is-highlighted" : "",
            xPercent > 75 ? "is-label-left" : "",
            yPercent > 78 ? "is-label-below" : "",
          ].filter(Boolean).join(" ")}
          key={employeeLabel}
          style={{ left: `${xPercent}%`, bottom: `${yPercent}%` }}
          data-x-percent={xPercent}
          data-y-percent={yPercent}
          aria-label={`${employeeLabel}, 근속 ${row.tenureMonths}개월, 기본 연봉 ${row.salary}`}
        >
          <span className="dr-salary-person-dot" aria-hidden="true" />
          <span className="dr-salary-person-label" aria-hidden="true">
            <strong>{employeeLabel}</strong>
            <small>{row.salary}</small>
          </span>
        </div>
      ))}
    </div>
    <div className="dr-tenure-axis-horizontal" aria-hidden="true">
      <span>{minimumTenure}개월</span>
      <span>{midpointTenure}개월</span>
      <span>{maximumTenure}개월</span>
    </div>
    <strong className="dr-tenure-axis-label">가로축 · 근속 개월</strong>
  </div>
</div>
<div className="dr-trend-legend">
  {plot.observedTrend ? <span><i className="is-solid" />{formatObservedTrendLabel(plot.observedTrend.sampleSize)}</span> : null}
  <span><i className="is-dashed" />{FOUNDER_COPY["screen.evidence.trend.guide_label"]}</span>
</div>
<p className="dr-trend-summary" id="salary-tenure-summary">{trendSummary}</p>
<p className="dr-trend-non-claim" id="salary-tenure-guide-limit">
  {FOUNDER_COPY["screen.evidence.trend.guide_non_claim"]}
</p>
```

Retain the existing missing-tenure list and highlighted-pair legend below this block.

- [ ] **Step 4: Replace coordinate-sensitive CSS with functional layout rules**

Use zero-size anchors and independent labels:

```css
.dr-scatter-layout {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
  margin-top: 18px;
}
.dr-salary-axis-vertical {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  color: #667085;
  font-size: 10px;
  font-weight: 800;
}
.dr-salary-axis-vertical > div {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-block: 8px;
  text-align: right;
}
.dr-salary-plot {
  position: relative;
  height: 240px;
  margin-inline: 44px;
  border-left: 1px solid #cfd7e3;
  border-bottom: 1px solid #cfd7e3;
}
.dr-plot-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.dr-observed-trend-line {
  stroke: #172033;
  stroke-width: 2.5;
  vector-effect: non-scaling-stroke;
}
.dr-direction-guide-line {
  stroke: #5b8def;
  stroke-width: 2;
  stroke-dasharray: 6 5;
  vector-effect: non-scaling-stroke;
}
.dr-salary-person {
  position: absolute;
  width: 0;
  height: 0;
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
  background: #8693a6;
  box-shadow: 0 0 0 2px #8693a6;
}
.dr-salary-person-label {
  position: absolute;
  left: 10px;
  top: -17px;
  display: grid;
  gap: 2px;
  min-width: 64px;
  white-space: nowrap;
}
.dr-salary-person.is-label-left .dr-salary-person-label {
  left: auto;
  right: 10px;
  text-align: right;
}
.dr-salary-person.is-label-below .dr-salary-person-label {
  top: 10px;
}
.dr-tenure-axis-horizontal {
  display: flex;
  justify-content: space-between;
  margin: 8px 44px 0;
  color: #7b8798;
  font-size: 10px;
  font-weight: 800;
}
.dr-tenure-axis-label {
  display: block;
  margin-top: 8px;
  color: #344054;
  font-size: 10px;
  text-align: center;
}
.dr-trend-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 16px;
  color: #344054;
  font-size: 11px;
  font-weight: 800;
}
.dr-trend-legend span { display: inline-flex; align-items: center; gap: 8px; }
.dr-trend-legend i { width: 28px; border-top: 3px solid #172033; }
.dr-trend-legend i.is-dashed { border-top: 2px dashed #5b8def; }
.dr-trend-summary,
.dr-trend-non-claim {
  margin: 12px 0 0;
  color: #526071;
  font-size: 12px;
  line-height: 1.55;
}
.dr-trend-non-claim {
  padding: 12px 14px;
  border-left: 3px solid #9dbbf4;
  background: #f8faff;
}
```

Update the existing 390px rules only to reduce plot margins and keep labels inside the card. Do not perform unrelated visual redesign.

- [ ] **Step 5: Run focused UI, plot, and copy tests**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/salary-tenure-plot.test.ts tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/tenure-axis-neutral-copy.test.ts tests/hr-paysim/decision-room-ui.test.ts
npm.cmd run typecheck
```

Expected: all focused tests PASS and typecheck exits 0.

- [ ] **Step 6: Review checkpoint without committing**

Run `git diff --check` for the Task 3 files. Expected: exit 0. Do not commit.

---

### Task 4: Measure alignment and preserve the complete Task 9 contract

**Files:**
- Modify: `scripts/qa-decision-room.mjs`
- Test: all `tests/hr-paysim/*.test.ts`

**Interfaces:**
- Consumes: `.dr-salary-plot`, `.dr-salary-person`, `.dr-salary-person-dot`, and each point's `data-x-percent`/`data-y-percent`.
- Produces: QA JSON fields `pointAlignment`, `trendGuide`, and the existing interaction/layout results.

- [ ] **Step 1: Add point-center and claim-boundary browser assertions**

After Screen 2 renders, add this browser measurement:

```js
const pointAlignment = await page.evaluate(() => {
  const plot = document.querySelector(".dr-salary-plot");
  if (!(plot instanceof HTMLElement)) return { checked: 0, maximumDeltaPx: null, aligned: false };
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
    maximumDeltaPx = Math.max(maximumDeltaPx, Math.abs(actualX - expectedX), Math.abs(actualY - expectedY));
  }

  return {
    checked: points.length,
    maximumDeltaPx,
    aligned: points.length > 0 && maximumDeltaPx <= 2.5,
  };
});
```

Add visible-text assertions for:

```js
[
  "가로축 · 근속 개월",
  "세로축 · 기본 연봉",
  "현재 6명의 관찰 추세",
  "근속 개월과 기본 연봉이 함께 증가하는 방향",
  "시장 평균이나 권장 연봉, 회사의 연봉 기준이 아닙니다",
]
```

Fail the script if alignment is false, either line is missing, the non-claim is hidden, or the old axis orientation text remains.

- [ ] **Step 2: Run the existing browser QA with the new alignment assertion**

Use the existing hidden Vite launch pattern, then run:

```powershell
node scripts/qa-decision-room.mjs
```

Expected: `pointAlignment.aligned: true`, 6 points checked, all three viewport suites complete, and `errors: []`. Do not revert or otherwise disturb the existing dirty Task 9 implementation to manufacture a failing browser run; the pure model and source tests already provide the TDD RED evidence for the implementation change.

- [ ] **Step 3: Run the full fresh automated suite**

Run and read every result:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

Expected:

- forbidden-copy lint exits 0;
- all Node tests pass with 0 failures;
- TypeScript exits 0;
- Vite build exits 0;
- QA covers four screens at 1280×720, 1440×900, and 390px with 3 clicks, focus movement, no overflow, aligned points, visible line limits, invalidation, copy, session clearing, empty storage, and no console errors;
- governance verification prints `[OK]`;
- `git diff --check` exits 0.

- [ ] **Step 4: Stop the exact QA server and verify no listener remains**

Capture the listener PID before QA, stop only that PID, and verify `Get-NetTCPConnection -LocalPort 5173 -State Listen` returns no object. Do not treat `TIME_WAIT` as a listener.

- [ ] **Step 5: Review checkpoint without committing**

Inspect `git status --short`, confirm the approved Task 9 scope only, and leave every implementation change uncommitted for the human gate.

---

### Task 5: Repeat the human gate, then create the single Task 9 commit

**Files:**
- Create after real responses only: `docs/hr-paysim/validation/2026-07-13-task-9-screen-2-comprehension.md`
- Stage: exact Task 9 implementation, tests, QA, and validation record only.

**Interfaces:**
- Consumes: the freshly generated 1280×720 Screen 2 first-viewport image.
- Produces: actual participant wording and a pass/fail record; never synthetic or agent-authored participant answers.

- [ ] **Step 1: Generate a fresh first-viewport image**

Use the updated QA script. Do not reuse the earlier failed-gate screenshot.

- [ ] **Step 2: Run the five-second gate with N≥2**

Show Screen 2 without explanation for five seconds to at least two non-HR participants, including at least one target-adjacent founder or operator. Ask:

1. 무엇과 무엇을 비교하는가?
2. 어떤 연봉 차이가 확인됐는가?
3. 지금 무엇을 확인하거나 선택해야 하는가?
4. 파란 점선은 무엇을 뜻하는가?

Record each participant's actual words and role proximity. Do not paraphrase into a pass.

- [ ] **Step 3: Apply the fail criteria**

The gate fails if any participant:

- cannot identify tenure and base salary as the chart axes;
- misses the 2,700만원 highlighted gap;
- cannot identify the explanation/evidence check;
- treats a point label as the factual point position;
- treats the dashed guide as a market average, normal raise rate, recommended salary, or approved company rule.

If it fails, do not create a passing validation record or commit. Return to the smallest failed requirement, revise, rerun the complete automated suite, and repeat N≥2 with the new screen.

- [ ] **Step 4: Write the real validation record only after a pass**

Create `docs/hr-paysim/validation/2026-07-13-task-9-screen-2-comprehension.md` only when the real responses are available. Use the title `Task 9 Screen 2 Comprehension Validation`, followed by the current commit parent, QA artifact timestamp, participant count, and whether a target-adjacent participant was included. Add one section per participant containing the non-identifying role proximity and the verbatim answers to comparison, salary gap, next check, and dashed-guide meaning. End with `Result: PASS` and the exact reason that every participant identified all four required meanings without facilitator explanation. Write real values directly; do not place bracket markers, synthetic responses, or agent-authored paraphrases in the file.

- [ ] **Step 5: Rerun verification in the exact final state**
Run the complete Task 4 suite again after adding the validation record. All commands must pass in the state that will be committed.

- [ ] **Step 6: Stage the exact Task 9 scope and inspect it**

Run `git add` with explicit file paths only. Then run:

```powershell
git diff --cached --name-status
git diff --cached --check
```

Expected: only Task 9 Product Engineer slice files, tests, QA, and the real comprehension record. No governance upstream files, Transition Gap files, `.governance` links, visual-companion files, build output, or unrelated changes.

- [ ] **Step 7: Create the locked Task 9 commit**

```powershell
git commit -m "feat: build Product Engineer decision-room slice"
```

- [ ] **Step 8: Verify the commit and stop before Task 10**

Run:

```powershell
git log -1 --oneline
git status --short --branch
```

Expected: HEAD is the locked Task 9 commit and no intended Task 9 change remains uncommitted. Request independent review; do not start Task 10 without explicit approval.
