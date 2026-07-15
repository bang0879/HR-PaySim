import type { NormalizedRosterRow } from "../domain.ts";

export function createPreparationLabels(
  rows: NormalizedRosterRow[],
): Map<string, string> {
  const countsByRole = new Map<string, number>();
  const labels = new Map<string, string>();

  for (const row of rows) {
    const next = (countsByRole.get(row.roleGroup) ?? 0) + 1;
    countsByRole.set(row.roleGroup, next);
    labels.set(row.rowId, `직원 ${next}`);
  }

  return labels;
}
