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
  const missingTenure = distribution.filter(
    (row) => !plottable.includes(row as T & { tenureMonths: number }),
  );

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
  const denominator = rows.reduce(
    (sum, row) => sum + (row.tenureMonths - meanTenure) ** 2,
    0,
  );
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
