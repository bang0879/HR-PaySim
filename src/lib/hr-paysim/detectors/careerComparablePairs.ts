import type { NormalizedRosterRow, StructuralFindingPair } from "../domain.ts";

const MATERIAL_GAP_RATE = 0.08;

export type OrderedLevelPolicy = "none" | "complete" | "partial";

export function resolveOrderedLevelPolicy(rows: NormalizedRosterRow[]): OrderedLevelPolicy {
  const eligibleRows = rows.filter(hasBaseComparisonEvidence);
  const rankedRows = eligibleRows.filter((row) => row.levelRank !== undefined);
  if (rankedRows.length === 0) return "none";
  if (rankedRows.length !== eligibleRows.length) return "partial";

  const rankByLabel = new Map<string, number>();
  for (const row of rankedRows) {
    if (!isValidRank(row.levelRank) || !isRankedLabel(row.levelLabel)) return "partial";
    const knownRank = rankByLabel.get(row.levelLabel);
    if (knownRank !== undefined && knownRank !== row.levelRank) return "partial";
    rankByLabel.set(row.levelLabel, row.levelRank);
  }
  return "complete";
}

export function buildMaterialCareerPairs(
  rows: NormalizedRosterRow[],
): StructuralFindingPair[] {
  const levelPolicy = resolveOrderedLevelPolicy(rows);
  if (levelPolicy === "partial") return [];

  return rows.flatMap((underpaid) =>
    rows.flatMap((comparator): StructuralFindingPair[] => {
      if (underpaid.rowId === comparator.rowId) return [];
      if (underpaid.roleGroup !== comparator.roleGroup) return [];
      if (!hasBaseComparisonEvidence(underpaid) || !hasBaseComparisonEvidence(comparator)) {
        return [];
      }
      if (underpaid.relevantExperienceMonths! < comparator.relevantExperienceMonths!) {
        return [];
      }
      if (underpaid.tenureMonths! <= comparator.tenureMonths!) return [];
      if (levelPolicy === "complete" && underpaid.levelRank! < comparator.levelRank!) {
        return [];
      }

      const salaryGapKRW = comparator.baseSalaryKRW - underpaid.baseSalaryKRW;
      const gapPercentage = salaryGapKRW / underpaid.baseSalaryKRW;
      if (salaryGapKRW <= 0 || gapPercentage < MATERIAL_GAP_RATE) return [];

      return [{
        underpaidRowId: underpaid.rowId,
        comparatorRowId: comparator.rowId,
        salaryGapKRW,
        gapPercentage,
        reasonThisIsHardToDefend:
          `${underpaid.rowId} has equal or stronger relevant-career and tenure evidence but earns ${formatKRW(salaryGapKRW)} less than ${comparator.rowId}.`,
      }];
    })
  ).sort(pairPriority);
}

function hasBaseComparisonEvidence(row: NormalizedRosterRow): boolean {
  return Number.isFinite(row.baseSalaryKRW)
    && row.baseSalaryKRW > 0
    && Number.isFinite(row.relevantExperienceMonths)
    && row.relevantExperienceMonths! >= 0
    && Number.isFinite(row.tenureMonths)
    && row.tenureMonths! >= 0;
}

function isValidRank(value: number | undefined): value is number {
  return Number.isSafeInteger(value) && value! >= 0;
}

function isRankedLabel(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0 && value !== "none";
}

function pairPriority(a: StructuralFindingPair, b: StructuralFindingPair): number {
  const gapRateDelta = (b.gapPercentage ?? 0) - (a.gapPercentage ?? 0);
  if (Math.abs(gapRateDelta) > 0.0000001) return gapRateDelta;
  const salaryGapDelta = b.salaryGapKRW - a.salaryGapKRW;
  if (salaryGapDelta !== 0) return salaryGapDelta;
  return compareCodeUnits(a.underpaidRowId, b.underpaidRowId)
    || compareCodeUnits(a.comparatorRowId, b.comparatorRowId);
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function formatKRW(value: number): string {
  return `${value.toLocaleString("ko-KR")} KRW`;
}
