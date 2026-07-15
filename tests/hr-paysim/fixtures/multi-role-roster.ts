import type { NormalizedRosterRow } from "../../../src/lib/hr-paysim/domain.ts";

export const completeGradeMultiRoleRows: NormalizedRosterRow[] = [
  backendRow("be-a", 60_000_000, 120, 60, "L1", 1),
  backendRow("be-b", 75_000_000, 84, 12, "L2", 2),
  backendRow("be-c", 85_000_000, 60, 10, "L1", 1),
  backendRow("be-d", 70_000_000, 96, 50, "L2", 2),
];

export const noGradeMultiRoleRows: NormalizedRosterRow[] =
  completeGradeMultiRoleRows.map(({ levelLabel: _label, levelRank: _rank, ...row }) => ({
    ...row,
  }));

function backendRow(
  rowId: string,
  baseSalaryKRW: number,
  relevantExperienceMonths: number,
  tenureMonths: number,
  levelLabel: string,
  levelRank: number,
): NormalizedRosterRow {
  return {
    rowId,
    roleGroup: "Backend Engineer",
    baseSalaryKRW,
    relevantExperienceMonths,
    tenureMonths,
    levelLabel,
    levelRank,
  };
}
