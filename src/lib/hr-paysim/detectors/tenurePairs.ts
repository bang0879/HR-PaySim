import type { NormalizedRosterRow, StructuralFindingPair } from "../domain.ts";

const MATERIAL_GAP_RATE = 0.08;

export function buildMaterialTenurePairs(
  rows: NormalizedRosterRow[],
  predicate: (underpaid: NormalizedRosterRow, comparator: NormalizedRosterRow) => boolean,
): StructuralFindingPair[] {
  return rows.flatMap((underpaid) => rows.flatMap((comparator): StructuralFindingPair[] => {
    if (underpaid.rowId === comparator.rowId) return [];
    if (underpaid.tenureMonths === undefined || comparator.tenureMonths === undefined) return [];
    if (!predicate(underpaid, comparator)) return [];

    const salaryGapKRW = comparator.baseSalaryKRW - underpaid.baseSalaryKRW;
    const gapPercentage = salaryGapKRW / underpaid.baseSalaryKRW;
    if (salaryGapKRW <= 0 || gapPercentage < MATERIAL_GAP_RATE) return [];

    return [{
      underpaidRowId: underpaid.rowId,
      comparatorRowId: comparator.rowId,
      salaryGapKRW,
      gapPercentage,
      reasonThisIsHardToDefend: `${underpaid.rowId} has stronger tenure claim but earns ${formatKRW(salaryGapKRW)} less than ${comparator.rowId}.`,
    }];
  })).sort(pairPriority);
}

function pairPriority(a: StructuralFindingPair, b: StructuralFindingPair): number {
  const gapRateDelta = (b.gapPercentage ?? 0) - (a.gapPercentage ?? 0);
  if (Math.abs(gapRateDelta) > 0.0000001) return gapRateDelta;
  const salaryGapDelta = b.salaryGapKRW - a.salaryGapKRW;
  if (salaryGapDelta !== 0) return salaryGapDelta;
  return a.underpaidRowId.localeCompare(b.underpaidRowId) || a.comparatorRowId.localeCompare(b.comparatorRowId);
}

function formatKRW(value: number): string {
  return `${value.toLocaleString("ko-KR")} KRW`;
}
