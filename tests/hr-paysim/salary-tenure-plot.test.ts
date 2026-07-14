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

test("retains missing tenure rows outside the plotted sample", () => {
  const plot = createSalaryTenurePlot([
    ...rows,
    { employeeLabel: "직원 G", salaryKRW: 74_000_000, tenureMonths: undefined },
  ]);

  assert.deepEqual(plot.salaryTicksKRW, [68_000_000, 81_500_000, 95_000_000]);
  assert.deepEqual(plot.tenureTicksMonths, [14, 39, 64]);
  assert.deepEqual(plot.missingTenure.map((row) => row.employeeLabel), ["직원 G"]);
});

test("uses centered coordinates for zero-width salary and tenure domains", () => {
  const plot = createSalaryTenurePlot([
    { employeeLabel: "직원 A", salaryKRW: 80_000_000, tenureMonths: 24 },
    { employeeLabel: "직원 B", salaryKRW: 80_000_000, tenureMonths: 24 },
  ]);
  assert.deepEqual(plot.salaryTicksKRW, [80_000_000, 80_000_000, 80_000_000]);
  assert.deepEqual(plot.tenureTicksMonths, [24, 24, 24]);
  assert.ok(plot.points.every((point) => point.xPercent === 50 && point.yPercent === 50));
  assert.equal(plot.observedTrend, null);
});

test("returns an empty plot for empty input", () => {
  assert.deepEqual(createSalaryTenurePlot([]), {
    points: [],
    missingTenure: [],
    salaryTicksKRW: [],
    tenureTicksMonths: [],
    observedTrend: null,
    directionGuide: {
      start: { xPercent: 8, yPercent: 8 },
      end: { xPercent: 92, yPercent: 92 },
    },
  });
});
