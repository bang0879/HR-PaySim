import type {
  FindingRiskModel,
  NormalizedRosterRow,
  StructuralFinding,
  StructuralFindingPair,
} from "./domain.ts";

const MATERIAL_GAP_RATE = 0.08;
const nonClaim = "이 값은 손실 예측, 이탈률 추정, 대체 비용, 시장연봉 벤치마크, 개인별 권장 연봉이 아닙니다.";

export function detectStructuralFindings(rows: NormalizedRosterRow[]): StructuralFinding[] {
  return Array.from(groupByRole(rows).entries()).flatMap(([roleGroup, groupRows]) => [
    ...detectShadowBand(roleGroup, groupRows),
    ...detectPayInversion(roleGroup, groupRows),
    ...detectLoyaltyTax(roleGroup, groupRows),
    ...detectLevelFiction(roleGroup, groupRows),
  ]);
}

function detectShadowBand(roleGroup: string, rows: NormalizedRosterRow[]): StructuralFinding[] {
  if (rows.length < 4 || hasFormalLevels(rows)) return [];

  const sorted = [...rows].sort((a, b) => a.baseSalaryKRW - b.baseSalaryKRW || a.rowId.localeCompare(b.rowId));
  const gaps = sorted.slice(1).map((row, index) => ({
    lower: sorted[index]!,
    upper: row,
    gap: row.baseSalaryKRW - sorted[index]!.baseSalaryKRW,
  }));
  if (gaps.length === 0) return [];

  const median = medianNumber(gaps.map((item) => item.gap));
  const split = [...gaps].sort((a, b) => b.gap - a.gap || a.lower.rowId.localeCompare(b.lower.rowId))[0];
  if (!split || split.gap <= median * 2) return [];

  const splitIndex = sorted.findIndex((row) => row.rowId === split.lower.rowId);
  const lowerCluster = sorted.slice(0, splitIndex + 1);
  const upperCluster = sorted.slice(splitIndex + 1);
  if (lowerCluster.length === 0 || upperCluster.length === 0) return [];

  return [{
    id: `${slug(roleGroup)}_shadow_band`,
    type: "shadow_band",
    roleGroup,
    title: "공식 밴드 없이 생긴 보상 구간",
    defensibilityQuestion: "공식 기준 없이 생긴 보상 구간을 설명할 수 있습니까?",
    relationshipSummary: `${roleGroup} 안에서 사실상 두 개의 보상 구간이 보입니다.`,
    affectedRowIds: uniqueSorted(sorted.map((row) => row.rowId)),
    comparisonPairs: [],
    bandClusters: [clusterFromRows(lowerCluster), clusterFromRows(upperCluster)],
    clusterGapKRW: split.gap,
    clusterGapRowIds: [split.lower.rowId, split.upper.rowId],
    evidence: [
      `${formatKRW(split.lower.baseSalaryKRW)}에서 ${formatKRW(split.upper.baseSalaryKRW)}로 ${formatKRW(split.gap)} gap이 있습니다.`,
    ],
    riskModel: riskModel({
      exposurePayrollKRW: sumSalary(rows),
      communicationRisk: "high",
      spreadRisk: "high",
      decisionUrgency: "high",
    }),
    confidence: "medium",
    explanationText: "제도가 없다고 구조가 없는 것은 아닙니다. 이미 생긴 구간을 설명할 언어가 필요합니다.",
  }];
}

function detectPayInversion(roleGroup: string, rows: NormalizedRosterRow[]): StructuralFinding[] {
  if (hasFormalLevels(rows)) return [];
  const pairs = materialTenurePairs(rows, (underpaid, comparator) => underpaid.tenureMonths! > comparator.tenureMonths!);
  if (pairs.length === 0) return [];

  const headlinePair = pickHeadlinePair(pairs);
  const affectedRowIds = uniqueSorted(pairs.flatMap((pair) => [pair.underpaidRowId, pair.comparatorRowId]));
  const underpaidRowIds = uniqueSorted(pairs.map((pair) => pair.underpaidRowId));

  return [{
    id: `${slug(roleGroup)}_pay_inversion`,
    type: "pay_inversion",
    roleGroup,
    title: "근속 claim과 보상 위치가 뒤집힌 관계",
    defensibilityQuestion: "더 강한 근속 claim을 가진 구성원이 더 낮은 보상 위치에 있는 이유를 설명할 수 있습니까?",
    relationshipSummary: `${headlinePair.underpaidRowId}와 ${headlinePair.comparatorRowId}의 비교가 가장 취약합니다.`,
    affectedRowIds,
    headlinePair,
    additionalUnderpaidRowCount: Math.max(0, underpaidRowIds.length - 1),
    comparisonPairs: pairs,
    evidence: [`headline gap: ${formatKRW(headlinePair.salaryGapKRW)}`],
    riskModel: riskModel({
      correctionFloorKRW: headlinePair.salaryGapKRW,
      communicationRisk: "high",
      spreadRisk: rows.some(hasPremiumFlag) ? "high" : "medium",
      decisionUrgency: "high",
    }),
    confidence: "medium",
    explanationText: "문제는 높은 연봉 자체가 아니라 같은 역할 안에서 방어하기 어려운 비교 관계입니다.",
  }];
}

function detectLoyaltyTax(roleGroup: string, rows: NormalizedRosterRow[]): StructuralFinding[] {
  if (hasFormalLevels(rows)) return [];
  const longTenureRows = rows.filter((row) => (row.tenureMonths ?? 0) >= 48);
  const recentRows = rows.filter((row) => (row.tenureMonths ?? Number.POSITIVE_INFINITY) <= 24);
  if (longTenureRows.length < 2 || recentRows.length < 2) return [];

  const pairs = materialTenurePairs(rows, (underpaid, comparator) =>
    longTenureRows.includes(underpaid) && recentRows.includes(comparator),
  );
  if (pairs.length === 0) return [];

  const headlinePair = pickHeadlinePair(pairs);
  const underpaidRowIds = uniqueSorted(pairs.map((pair) => pair.underpaidRowId));

  return [{
    id: `${slug(roleGroup)}_loyalty_tax`,
    type: "loyalty_tax",
    roleGroup,
    title: "장기 근속자가 최근 입사자보다 약한 보상 위치에 있음",
    defensibilityQuestion: "오래 남은 사람이 최근 입사자보다 낮은 보상 위치에 있는 이유를 설명할 수 있습니까?",
    relationshipSummary: `${roleGroup} 장기 근속 cohort가 최근 입사 cohort보다 낮은 보상 위치에 있습니다.`,
    affectedRowIds: uniqueSorted(pairs.flatMap((pair) => [pair.underpaidRowId, pair.comparatorRowId])),
    headlinePair,
    additionalUnderpaidRowCount: Math.max(0, underpaidRowIds.length - 1),
    comparisonPairs: pairs,
    evidence: [
      `long-tenure average: ${formatKRW(averageSalary(longTenureRows))}`,
      `recent-hire average: ${formatKRW(averageSalary(recentRows))}`,
    ],
    riskModel: riskModel({
      correctionFloorKRW: headlinePair.salaryGapKRW,
      exposurePayrollKRW: sumSalary(rows),
      communicationRisk: "high",
      spreadRisk: "medium",
      decisionUrgency: "medium",
    }),
    confidence: "medium",
    explanationText: "오래 남은 것이 손해였다는 신호로 읽히지 않게 설명 언어가 필요합니다.",
  }];
}

function detectLevelFiction(roleGroup: string, rows: NormalizedRosterRow[]): StructuralFinding[] {
  if (!hasFormalLevels(rows)) return [];

  const pairs = rows.flatMap((lowerRankRow) => rows.flatMap((higherRankRow): StructuralFindingPair[] => {
    if (lowerRankRow.levelRank === undefined || higherRankRow.levelRank === undefined) return [];
    if (lowerRankRow.levelRank >= higherRankRow.levelRank) return [];
    if (lowerRankRow.baseSalaryKRW < higherRankRow.baseSalaryKRW) return [];

    return [{
      underpaidRowId: higherRankRow.rowId,
      comparatorRowId: lowerRankRow.rowId,
      salaryGapKRW: lowerRankRow.baseSalaryKRW - higherRankRow.baseSalaryKRW,
      reasonThisIsHardToDefend: `${lowerRankRow.rowId} has a lower level rank but meets or exceeds ${higherRankRow.rowId}'s pay.`,
    }];
  })).sort((a, b) => a.underpaidRowId.localeCompare(b.underpaidRowId) || a.comparatorRowId.localeCompare(b.comparatorRowId));

  if (pairs.length === 0) return [];

  return [{
    id: `${slug(roleGroup)}_level_fiction_band_overlap`,
    type: "level_fiction_band_overlap",
    roleGroup,
    title: "레벨 언어가 보상 관계를 설명하지 못함",
    defensibilityQuestion: "현재 레벨 언어로 보상 차이를 설명할 수 있습니까?",
    relationshipSummary: `${roleGroup}에서 낮은 레벨 row가 높은 레벨 row의 pay를 넘습니다.`,
    affectedRowIds: uniqueSorted(pairs.flatMap((pair) => [pair.underpaidRowId, pair.comparatorRowId])),
    comparisonPairs: pairs,
    evidence: pairs.map((pair) => `${pair.underpaidRowId} needs ${formatKRW(pair.salaryGapKRW)} to restore ordinal order.`),
    riskModel: riskModel({
      correctionFloorKRW: pairs.reduce((total, pair) => total + pair.salaryGapKRW, 0),
      communicationRisk: "medium",
      spreadRisk: "medium",
      decisionUrgency: "medium",
    }),
    confidence: "medium",
    explanationText: "레벨이 있어도 보상 순서가 뒤집히면 레벨 언어가 약해집니다.",
  }];
}

function materialTenurePairs(
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

function pickHeadlinePair(pairs: StructuralFindingPair[]): StructuralFindingPair {
  return [...pairs].sort(pairPriority)[0]!;
}

function pairPriority(a: StructuralFindingPair, b: StructuralFindingPair): number {
  const gapRateDelta = (b.gapPercentage ?? 0) - (a.gapPercentage ?? 0);
  if (Math.abs(gapRateDelta) > 0.0000001) return gapRateDelta;
  const salaryGapDelta = b.salaryGapKRW - a.salaryGapKRW;
  if (salaryGapDelta !== 0) return salaryGapDelta;
  return a.underpaidRowId.localeCompare(b.underpaidRowId) || a.comparatorRowId.localeCompare(b.comparatorRowId);
}

function groupByRole(rows: NormalizedRosterRow[]): Map<string, NormalizedRosterRow[]> {
  const groups = new Map<string, NormalizedRosterRow[]>();
  for (const row of rows) {
    groups.set(row.roleGroup, [...(groups.get(row.roleGroup) ?? []), row]);
  }
  return groups;
}

function hasFormalLevels(rows: NormalizedRosterRow[]): boolean {
  return rows.some((row) => row.levelRank !== undefined && row.levelLabel !== undefined && row.levelLabel !== "none");
}

function hasPremiumFlag(row: NormalizedRosterRow): boolean {
  return row.exceptionFlag === true || row.counterOfferFlag === true;
}

function medianNumber(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle]!;
  return (sorted[middle - 1]! + sorted[middle]!) / 2;
}

function clusterFromRows(rows: NormalizedRosterRow[]) {
  return {
    rowIds: rows.map((row) => row.rowId),
    minSalaryKRW: Math.min(...rows.map((row) => row.baseSalaryKRW)),
    maxSalaryKRW: Math.max(...rows.map((row) => row.baseSalaryKRW)),
  };
}

function riskModel(input: Omit<FindingRiskModel, "nonClaim">): FindingRiskModel {
  return {
    ...input,
    nonClaim,
  };
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function sumSalary(rows: NormalizedRosterRow[]): number {
  return rows.reduce((total, row) => total + row.baseSalaryKRW, 0);
}

function averageSalary(rows: NormalizedRosterRow[]): number {
  return Math.round(sumSalary(rows) / Math.max(rows.length, 1));
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function formatKRW(value: number): string {
  return `${value.toLocaleString("ko-KR")} KRW`;
}

