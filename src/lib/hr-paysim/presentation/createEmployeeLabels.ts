import type { NormalizedRosterRow } from "../domain.ts";

export function createEmployeeLabels(
  rows: NormalizedRosterRow[],
  lowerPaidRowId: string,
  higherPaidRowId: string,
): Map<string, string> {
  const labels = new Map<string, string>([
    [lowerPaidRowId, "직원 A"],
    [higherPaidRowId, "직원 B"],
  ]);
  rows
    .filter((row) => !labels.has(row.rowId))
    .forEach((row, index) => labels.set(row.rowId, `직원 ${toExcelColumnLabel(index + 3)}`));
  return labels;
}

function toExcelColumnLabel(position: number): string {
  let value = position;
  let label = "";

  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }

  return label;
}
