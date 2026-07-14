import assert from "node:assert/strict";
import test from "node:test";

import { createSalaryCareerPlot } from "../../src/features/confirmed-pay-differences/salaryCareerPlot.ts";

const rows = [
  { employeeLabel: "직원 A", salaryKRW: 68_000_000, relevantExperienceMonths: 120 },
  { employeeLabel: "직원 C", salaryKRW: 72_000_000, relevantExperienceMonths: 108 },
  { employeeLabel: "직원 D", salaryKRW: 76_000_000, relevantExperienceMonths: 96 },
  { employeeLabel: "직원 E", salaryKRW: 88_000_000, relevantExperienceMonths: 84 },
  { employeeLabel: "직원 F", salaryKRW: 92_000_000, relevantExperienceMonths: 80 },
  { employeeLabel: "직원 B", salaryKRW: 95_000_000, relevantExperienceMonths: 76 },
];

test("maps relevant career to x and salary to y", () => {
  const plot = createSalaryCareerPlot(rows);
  const employeeA = plot.points.find((point) => point.employeeLabel === "직원 A");
  const employeeB = plot.points.find((point) => point.employeeLabel === "직원 B");

  assert.equal(employeeA?.xPercent, 100);
  assert.equal(employeeA?.yPercent, 0);
  assert.equal(employeeB?.xPercent, 0);
  assert.equal(employeeB?.yPercent, 100);
  assert.deepEqual(plot.careerTicksMonths, [76, 98, 120]);
});

test("uses deterministic OLS only across the central 70 percent of observed career", () => {
  const forward = createSalaryCareerPlot(rows).observedTrend;
  const reversed = createSalaryCareerPlot([...rows].reverse()).observedTrend;

  assert.deepEqual(reversed, forward);
  assert.equal(forward?.sampleSize, 6);
  assert.equal(forward?.direction, "decreasing");
  assert.equal(forward?.start.xPercent, 15);
  assert.equal(forward?.end.xPercent, 85);
  assert.ok((forward?.start.yPercent ?? 0) > (forward?.end.yPercent ?? 100));
});

test("clips a boundary-crossing trend geometrically without changing its slope", () => {
  const trend = createSalaryCareerPlot([
    { employeeLabel: "직원 A", salaryKRW: 50_000_000, relevantExperienceMonths: 0 },
    { employeeLabel: "직원 B", salaryKRW: 50_000_000, relevantExperienceMonths: 12 },
    { employeeLabel: "직원 C", salaryKRW: 150_000_000, relevantExperienceMonths: 24 },
  ]).observedTrend;

  assert.ok(trend);
  assert.ok(Math.abs(trend.start.xPercent - (100 / 6)) < 0.000_001);
  assert.ok(Math.abs(trend.start.yPercent) < 0.000_001);
  assert.equal(trend.end.xPercent, 85);
  const clippedSlope = (trend.end.yPercent - trend.start.yPercent)
    / (trend.end.xPercent - trend.start.xPercent);
  assert.ok(Math.abs(clippedSlope - 1) < 0.000_001);
});

test("does not invent a trend from too few or single-career rows", () => {
  assert.equal(createSalaryCareerPlot(rows.slice(0, 2)).observedTrend, null);
  assert.equal(createSalaryCareerPlot([
    { employeeLabel: "직원 A", salaryKRW: 68_000_000, relevantExperienceMonths: 12 },
    { employeeLabel: "직원 B", salaryKRW: 72_000_000, relevantExperienceMonths: 12 },
    { employeeLabel: "직원 C", salaryKRW: 76_000_000, relevantExperienceMonths: 12 },
  ]).observedTrend, null);
});

test("keeps missing career rows visible without fabricating an x coordinate", () => {
  const plot = createSalaryCareerPlot([
    ...rows,
    { employeeLabel: "직원 G", salaryKRW: 74_000_000, relevantExperienceMonths: undefined },
  ]);

  assert.deepEqual(plot.missingCareer.map((row) => row.employeeLabel), ["직원 G"]);
  assert.equal(plot.points.some((point) => point.employeeLabel === "직원 G"), false);
  assert.equal("directionGuide" in plot, false);
});

test("uses centered coordinates for zero-width salary and career domains", () => {
  const plot = createSalaryCareerPlot([
    { employeeLabel: "직원 A", salaryKRW: 80_000_000, relevantExperienceMonths: 24 },
    { employeeLabel: "직원 B", salaryKRW: 80_000_000, relevantExperienceMonths: 24 },
  ]);
  assert.deepEqual(plot.salaryTicksKRW, [80_000_000, 80_000_000, 80_000_000]);
  assert.deepEqual(plot.careerTicksMonths, [24, 24, 24]);
  assert.ok(plot.points.every((point) => point.xPercent === 50 && point.yPercent === 50));
  assert.equal(plot.observedTrend, null);
});

test("returns an empty plot contract for empty input", () => {
  assert.deepEqual(createSalaryCareerPlot([]), {
    points: [],
    missingCareer: [],
    salaryTicksKRW: [],
    careerTicksMonths: [],
    observedTrend: null,
  });
});
