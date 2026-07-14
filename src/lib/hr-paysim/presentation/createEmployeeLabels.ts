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
  const alphabet = ["C", "D", "E", "F", "G", "H"];
  rows
    .filter((row) => !labels.has(row.rowId))
    .forEach((row, index) => labels.set(row.rowId, `직원 ${alphabet[index] ?? index + 3}`));
  return labels;
}
