export type ObservedTrendDirection = "increasing" | "decreasing" | "flat";

export interface PlotCoordinate {
  xPercent: number;
  yPercent: number;
}

export interface SalaryCareerPlotPoint<T> extends PlotCoordinate {
  row: T;
  employeeLabel: string;
}

export interface ObservedTrendLine {
  start: PlotCoordinate;
  end: PlotCoordinate;
  direction: ObservedTrendDirection;
  sampleSize: number;
}

export interface SalaryCareerPlot<T> {
  points: SalaryCareerPlotPoint<T>[];
  missingCareer: T[];
  salaryTicksKRW: number[];
  careerTicksMonths: number[];
  observedTrend: ObservedTrendLine | null;
}

export function createSalaryCareerPlot<T extends {
  employeeLabel: string;
  salaryKRW: number;
  relevantExperienceMonths?: number;
}>(distribution: T[]): SalaryCareerPlot<T> {
  const rowsWithSalary = distribution.filter((row) => Number.isFinite(row.salaryKRW));
  const plottable = rowsWithSalary.filter(
    (row): row is T & { relevantExperienceMonths: number } =>
      Number.isFinite(row.relevantExperienceMonths)
      && (row.relevantExperienceMonths ?? -1) >= 0,
  );
  const missingCareer = rowsWithSalary.filter(
    (row) => !plottable.includes(row as T & { relevantExperienceMonths: number }),
  );

  if (plottable.length === 0) {
    return {
      points: [],
      missingCareer,
      salaryTicksKRW: ticks(rowsWithSalary.map((row) => row.salaryKRW)),
      careerTicksMonths: [],
      observedTrend: null,
    };
  }

  const salaries = plottable.map((row) => row.salaryKRW);
  const careers = plottable.map((row) => row.relevantExperienceMonths);
  const minimumSalary = Math.min(...salaries);
  const maximumSalary = Math.max(...salaries);
  const minimumCareer = Math.min(...careers);
  const maximumCareer = Math.max(...careers);

  return {
    points: plottable.map((row) => ({
      row,
      employeeLabel: row.employeeLabel,
      xPercent: coordinate(row.relevantExperienceMonths, minimumCareer, maximumCareer),
      yPercent: coordinate(row.salaryKRW, minimumSalary, maximumSalary),
    })),
    missingCareer,
    salaryTicksKRW: [minimumSalary, (minimumSalary + maximumSalary) / 2, maximumSalary],
    careerTicksMonths: [
      minimumCareer,
      Math.round((minimumCareer + maximumCareer) / 2),
      maximumCareer,
    ],
    observedTrend: createObservedTrend(plottable, {
      minimumSalary,
      maximumSalary,
      minimumCareer,
      maximumCareer,
    }),
  };
}

function createObservedTrend<T extends {
  employeeLabel: string;
  salaryKRW: number;
  relevantExperienceMonths: number;
}>(
  inputRows: T[],
  domain: {
    minimumSalary: number;
    maximumSalary: number;
    minimumCareer: number;
    maximumCareer: number;
  },
): ObservedTrendLine | null {
  if (inputRows.length < 3 || domain.minimumCareer === domain.maximumCareer) return null;

  const rows = [...inputRows].sort((a, b) =>
    a.relevantExperienceMonths - b.relevantExperienceMonths
    || a.salaryKRW - b.salaryKRW
    || compareCodeUnits(a.employeeLabel, b.employeeLabel)
  );
  const meanCareer = rows.reduce((sum, row) => sum + row.relevantExperienceMonths, 0)
    / rows.length;
  const meanSalary = rows.reduce((sum, row) => sum + row.salaryKRW, 0) / rows.length;
  const denominator = rows.reduce(
    (sum, row) => sum + (row.relevantExperienceMonths - meanCareer) ** 2,
    0,
  );
  if (denominator === 0) return null;

  const numerator = rows.reduce(
    (sum, row) => sum
      + (row.relevantExperienceMonths - meanCareer) * (row.salaryKRW - meanSalary),
    0,
  );
  const slope = numerator / denominator;
  const intercept = meanSalary - slope * meanCareer;
  const careerSpan = domain.maximumCareer - domain.minimumCareer;
  const careerStart = domain.minimumCareer + 0.15 * careerSpan;
  const careerEnd = domain.maximumCareer - 0.15 * careerSpan;
  const unclipped = {
    start: {
      xPercent: 15,
      yPercent: coordinateUnclamped(
        intercept + slope * careerStart,
        domain.minimumSalary,
        domain.maximumSalary,
      ),
    },
    end: {
      xPercent: 85,
      yPercent: coordinateUnclamped(
        intercept + slope * careerEnd,
        domain.minimumSalary,
        domain.maximumSalary,
      ),
    },
  };
  const clipped = clipSegmentToPlot(unclipped);
  if (!clipped) return null;

  return {
    ...clipped,
    direction: slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "flat",
    sampleSize: rows.length,
  };
}

function clipSegmentToPlot(line: {
  start: PlotCoordinate;
  end: PlotCoordinate;
}): { start: PlotCoordinate; end: PlotCoordinate } | null {
  const dx = line.end.xPercent - line.start.xPercent;
  const dy = line.end.yPercent - line.start.yPercent;
  const p = [-dx, dx, -dy, dy];
  const q = [
    line.start.xPercent,
    100 - line.start.xPercent,
    line.start.yPercent,
    100 - line.start.yPercent,
  ];
  let startT = 0;
  let endT = 1;

  for (let index = 0; index < p.length; index += 1) {
    const boundaryDelta = p[index]!;
    const boundaryDistance = q[index]!;
    if (boundaryDelta === 0) {
      if (boundaryDistance < 0) return null;
      continue;
    }
    const ratio = boundaryDistance / boundaryDelta;
    if (boundaryDelta < 0) startT = Math.max(startT, ratio);
    else endT = Math.min(endT, ratio);
    if (startT > endT) return null;
  }

  return {
    start: {
      xPercent: line.start.xPercent + startT * dx,
      yPercent: line.start.yPercent + startT * dy,
    },
    end: {
      xPercent: line.start.xPercent + endT * dx,
      yPercent: line.start.yPercent + endT * dy,
    },
  };
}

function coordinate(value: number, minimum: number, maximum: number): number {
  return Math.min(100, Math.max(0, coordinateUnclamped(value, minimum, maximum)));
}

function coordinateUnclamped(value: number, minimum: number, maximum: number): number {
  if (minimum === maximum) return 50;
  return ((value - minimum) / (maximum - minimum)) * 100;
}

function ticks(values: number[]): number[] {
  if (values.length === 0) return [];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  return [minimum, (minimum + maximum) / 2, maximum];
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
