import type { NormalizedRosterRow, StructuralFindingPair } from "../domain.ts";
import type { OrdinalAdjustment, SystemRepairResult } from "./types.ts";

const MATERIAL_GAP_KRW = 3_000_000;
const MATERIAL_GAP_RATE = 0.05;

export function calculatePairRepairFloor(pair: StructuralFindingPair): number {
  return Math.max(0, pair.salaryGapKRW);
}

export function isMaterialLevelOrderViolation(
  pair: StructuralFindingPair,
  rows: NormalizedRosterRow[],
): boolean {
  const higherRankedRow = rows.find((row) => row.rowId === pair.underpaidRowId);
  const lowerRankedRow = rows.find((row) => row.rowId === pair.comparatorRowId);
  if (
    !higherRankedRow
    || !lowerRankedRow
    || higherRankedRow.levelRank === undefined
    || lowerRankedRow.levelRank === undefined
    || higherRankedRow.levelRank <= lowerRankedRow.levelRank
  ) {
    return false;
  }

  const gapKRW = calculatePairRepairFloor(pair);
  if (gapKRW === 0) return false;

  return gapKRW >= MATERIAL_GAP_KRW || gapKRW / higherRankedRow.baseSalaryKRW >= MATERIAL_GAP_RATE;
}

export function calculateMinimumOrdinalRestoration(rows: NormalizedRosterRow[]): SystemRepairResult {
  const levelPairs = findLevelOrderViolations(rows);
  const adjustments = Array.from(groupByRole(rows).values()).flatMap(calculateRoleAdjustments);

  return {
    headlineGapKRW: maximumPairGap(levelPairs),
    pairRepairFloorKRW: maximumPairGap(levelPairs),
    systemRepairFloorKRW: adjustments.reduce((total, item) => total + item.adjustmentKRW, 0),
    adjustments,
  };
}

function calculateRoleAdjustments(rows: NormalizedRosterRow[]): OrdinalAdjustment[] {
  const rankedRows = rows.filter((row) => row.levelRank !== undefined);
  const ranks = Array.from(new Set(rankedRows.map((row) => row.levelRank!))).sort((a, b) => a - b);
  const adjustments: OrdinalAdjustment[] = [];
  let maximumAdjustedLowerRankSalaryKRW: number | undefined;

  for (const rank of ranks) {
    const rowsAtRank = rankedRows
      .filter((row) => row.levelRank === rank)
      .sort((a, b) => a.rowId.localeCompare(b.rowId));
    const adjustedSalaries = rowsAtRank.map((row) => {
      const targetSalaryKRW = maximumAdjustedLowerRankSalaryKRW === undefined
        ? row.baseSalaryKRW
        : Math.max(row.baseSalaryKRW, maximumAdjustedLowerRankSalaryKRW);
      const adjustmentKRW = targetSalaryKRW - row.baseSalaryKRW;
      if (adjustmentKRW > 0) {
        adjustments.push({
          rowId: row.rowId,
          fromSalaryKRW: row.baseSalaryKRW,
          toSalaryKRW: targetSalaryKRW,
          adjustmentKRW,
        });
      }
      return targetSalaryKRW;
    });

    if (adjustedSalaries.length > 0) {
      maximumAdjustedLowerRankSalaryKRW = Math.max(
        maximumAdjustedLowerRankSalaryKRW ?? Number.NEGATIVE_INFINITY,
        ...adjustedSalaries,
      );
    }
  }

  return adjustments;
}

function findLevelOrderViolations(rows: NormalizedRosterRow[]): StructuralFindingPair[] {
  return Array.from(groupByRole(rows).values()).flatMap((roleRows) =>
    roleRows.flatMap((lowerRankRow) => roleRows.flatMap((higherRankRow): StructuralFindingPair[] => {
      if (lowerRankRow.levelRank === undefined || higherRankRow.levelRank === undefined) return [];
      if (lowerRankRow.levelRank >= higherRankRow.levelRank) return [];

      const salaryGapKRW = lowerRankRow.baseSalaryKRW - higherRankRow.baseSalaryKRW;
      if (salaryGapKRW <= 0) return [];

      return [{
        underpaidRowId: higherRankRow.rowId,
        comparatorRowId: lowerRankRow.rowId,
        salaryGapKRW,
        reasonThisIsHardToDefend: `${lowerRankRow.rowId} has a lower level rank but exceeds ${higherRankRow.rowId}'s pay.`,
      }];
    })),
  );
}

function maximumPairGap(pairs: StructuralFindingPair[]): number {
  return pairs.reduce((maximum, pair) => Math.max(maximum, calculatePairRepairFloor(pair)), 0);
}

function groupByRole(rows: NormalizedRosterRow[]): Map<string, NormalizedRosterRow[]> {
  const groups = new Map<string, NormalizedRosterRow[]>();
  for (const row of rows) {
    groups.set(row.roleGroup, [...(groups.get(row.roleGroup) ?? []), row]);
  }
  return groups;
}
