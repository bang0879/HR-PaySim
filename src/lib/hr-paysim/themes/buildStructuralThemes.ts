import type {
  NormalizedRosterRow,
  StructuralFinding,
  StructuralFindingPair,
} from "../domain.ts";
import type { FindingMetricSet } from "../metrics/types.ts";
import type {
  StructuralTheme,
  SupportingObservation,
  ThemeArchetype,
  ThemeDataStatus,
} from "./types.ts";

export function buildStructuralThemes(
  rows: NormalizedRosterRow[],
  findings: StructuralFinding[],
): StructuralTheme[] {
  const rowsByRole = groupRowsByRole(rows);
  const findingsByRole = groupFindingsByRole(findings);
  const roleOrder = new Map(Array.from(rowsByRole.keys()).map((roleGroup, index) => [roleGroup, index]));

  return Array.from(findingsByRole.keys())
    .sort((a, b) => compareRoleGroups(a, b, roleOrder))
    .flatMap((roleGroup) => {
      const roleRows = rowsByRole.get(roleGroup) ?? [];
      const roleFindings = findingsByRole.get(roleGroup) ?? [];
      return [
        ...buildTenureThemes(roleGroup, roleRows, roleFindings),
        ...buildLevelThemes(roleGroup, roleRows, roleFindings),
      ];
    });
}

function buildTenureThemes(
  roleGroup: string,
  rows: NormalizedRosterRow[],
  findings: StructuralFinding[],
): StructuralTheme[] {
  const inversions = findings
    .filter((finding) => finding.type === "pay_inversion")
    .sort(compareFinding);
  const relationships = uniquePairs(inversions.flatMap(findingPairs));
  if (relationships.length === 0) return [];

  const loyaltyFindings = findings
    .filter((finding) => finding.type === "loyalty_tax")
    .sort(compareFinding);
  const shadowFindings = findings
    .filter((finding) => finding.type === "shadow_band")
    .sort(compareFinding);

  return connectedPairComponents(relationships).map((componentPairs) => {
    const componentRowIds = uniqueSorted(componentPairs.flatMap(pairRowIds));
    const componentRowIdSet = new Set(componentRowIds);
    const componentInversions = inversions.filter((finding) =>
      findingPairs(finding).some((pair) => pairBelongsToRows(pair, componentRowIdSet))
    );
    const componentLoyalty = loyaltyFindings.filter((loyalty) =>
      componentInversions.some((inversion) => findingsCanSubsume(inversion, loyalty))
      && findingPairs(loyalty).some((pair) => pairBelongsToRows(pair, componentRowIdSet))
    );
    const componentShadows = shadowFindings.filter((shadow) =>
      componentPairs.some((pair) => pairCrossesBandClusters(pair, shadow))
    );
    const archetype = tenureArchetype(componentShadows.length > 0, componentLoyalty.length > 0);
    const headlinePair = [...componentPairs].sort(pairPriority)[0]!;
    const primaryFinding = componentInversions[0]!;
    const metrics = relationshipThemeMetrics(primaryFinding.metrics, headlinePair, rows);
    const observations = tenureObservations(
      componentShadows,
      componentLoyalty,
      componentRowIdSet,
    );
    const findingIds = [
      ...componentShadows.map((finding) => finding.id),
      ...componentInversions.map((finding) => finding.id),
      ...componentLoyalty.map((finding) => finding.id),
    ];

    return {
      id: `${slug(roleGroup)}_${archetype}_${componentRowIds.join("_")}`,
      roleGroup,
      archetype,
      dataStatus: tenureDataStatus(rows, componentRowIdSet),
      patternKind: archetype === "isolated_relationship" ? "isolated" : "systematic",
      findingIds: uniqueInOrder(findingIds),
      headlinePair,
      comparisonPairs: componentPairs,
      affectedRowIds: uniqueSorted([
        ...componentRowIds,
        ...observations.flatMap((observation) => observation.affectedRowIds),
      ]),
      supportingObservations: observations,
      metrics,
      normalizedHeadlineGap: normalizeHeadlineGap(headlinePair, metrics, rows),
    };
  });
}

function buildLevelThemes(
  roleGroup: string,
  rows: NormalizedRosterRow[],
  findings: StructuralFinding[],
): StructuralTheme[] {
  return findings
    .filter((finding) => finding.type === "level_fiction_band_overlap")
    .sort(compareFinding)
    .map((finding) => {
      const comparisonPairs = uniquePairs(findingPairs(finding));
      const affectedRowIds = uniqueSorted([
        ...finding.affectedRowIds,
        ...comparisonPairs.flatMap(pairRowIds),
      ]);
      const affectedRowIdSet = new Set(affectedRowIds);
      const observation: SupportingObservation = {
        sourceType: "level_fiction_band_overlap",
        plainLanguageKey: "level_order_conflict",
        affectedRowIds,
      };

      return {
        id: `${finding.id}_theme`,
        roleGroup,
        archetype: "level_integrity",
        dataStatus: levelDataStatus(rows, affectedRowIdSet),
        patternKind: "systematic",
        findingIds: [finding.id],
        ...(finding.headlinePair ? { headlinePair: finding.headlinePair } : {}),
        comparisonPairs,
        affectedRowIds,
        supportingObservations: [observation],
        metrics: { ...finding.metrics },
        normalizedHeadlineGap: normalizeHeadlineGap(finding.headlinePair, finding.metrics, rows),
      };
    });
}

function tenureObservations(
  shadows: StructuralFinding[],
  loyaltyFindings: StructuralFinding[],
  componentRowIds: Set<string>,
): SupportingObservation[] {
  const observations: SupportingObservation[] = [];
  if (shadows.length > 0) {
    observations.push({
      sourceType: "shadow_band",
      plainLanguageKey: "two_salary_groups",
      affectedRowIds: uniqueSorted(shadows.flatMap((finding) => finding.affectedRowIds)),
    });
  }
  if (loyaltyFindings.length > 0) {
    observations.push({
      sourceType: "loyalty_tax",
      plainLanguageKey: "recent_hire_gap_repeats",
      affectedRowIds: uniqueSorted(loyaltyFindings.flatMap((finding) =>
        findingPairs(finding)
          .filter((pair) => pairBelongsToRows(pair, componentRowIds))
          .flatMap(pairRowIds)
      )),
    });
  }
  return observations;
}

function tenureArchetype(hasShadow: boolean, hasLoyalty: boolean): ThemeArchetype {
  if (hasShadow) return "emergent_structure";
  if (hasLoyalty) return "cohort_precedent";
  return "isolated_relationship";
}

function findingsCanSubsume(inversion: StructuralFinding, loyalty: StructuralFinding): boolean {
  const inversionPairs = new Set(findingPairs(inversion).map(pairKey));
  const loyaltyPairs = new Set(findingPairs(loyalty).map(pairKey));
  if (inversionPairs.size === 0 || loyaltyPairs.size === 0) return false;

  const inversionHeadline = inversion.headlinePair && pairKey(inversion.headlinePair);
  const loyaltyHeadline = loyalty.headlinePair && pairKey(loyalty.headlinePair);
  return (
    inversionHeadline !== undefined
    && loyaltyHeadline !== undefined
    && inversionHeadline === loyaltyHeadline
  ) || isSubset(inversionPairs, loyaltyPairs) || isSubset(loyaltyPairs, inversionPairs);
}

function pairCrossesBandClusters(pair: StructuralFindingPair, shadow: StructuralFinding): boolean {
  const clusters = shadow.bandClusters ?? [];
  const underpaidCluster = clusters.findIndex((cluster) => cluster.rowIds.includes(pair.underpaidRowId));
  const comparatorCluster = clusters.findIndex((cluster) => cluster.rowIds.includes(pair.comparatorRowId));
  return underpaidCluster >= 0 && comparatorCluster >= 0 && underpaidCluster !== comparatorCluster;
}

function connectedPairComponents(pairs: StructuralFindingPair[]): StructuralFindingPair[][] {
  const adjacency = new Map<string, Set<string>>();
  for (const pair of pairs) {
    addNeighbor(adjacency, pair.underpaidRowId, pair.comparatorRowId);
    addNeighbor(adjacency, pair.comparatorRowId, pair.underpaidRowId);
  }

  const visited = new Set<string>();
  return Array.from(adjacency.keys()).sort((a, b) => a.localeCompare(b)).flatMap((start) => {
    if (visited.has(start)) return [];
    const componentRows = new Set<string>();
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const rowId = queue.shift()!;
      componentRows.add(rowId);
      for (const neighbor of Array.from(adjacency.get(rowId) ?? []).sort((a, b) => a.localeCompare(b))) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }

    return [[...pairs]
      .filter((pair) => pairBelongsToRows(pair, componentRows))
      .sort(pairPriority)];
  });
}

function relationshipThemeMetrics(
  findingMetrics: FindingMetricSet,
  headlinePair: StructuralFindingPair,
  rows: NormalizedRosterRow[],
): FindingMetricSet {
  return {
    ...findingMetrics,
    headlineGapKRW: headlinePair.salaryGapKRW,
    pairRepairFloorKRW: headlinePair.salaryGapKRW,
    roleGroupPayrollContextKRW: findingMetrics.roleGroupPayrollContextKRW
      ?? rows.reduce((total, row) => total + row.baseSalaryKRW, 0),
  };
}

function normalizeHeadlineGap(
  headlinePair: StructuralFindingPair | undefined,
  metrics: FindingMetricSet,
  rows: NormalizedRosterRow[],
): number {
  if (headlinePair?.gapPercentage !== undefined) return headlinePair.gapPercentage;
  if (headlinePair) {
    const underpaid = rows.find((row) => row.rowId === headlinePair.underpaidRowId);
    if (underpaid && underpaid.baseSalaryKRW > 0) {
      return headlinePair.salaryGapKRW / underpaid.baseSalaryKRW;
    }
  }
  const payrollContext = metrics.roleGroupPayrollContextKRW
    ?? rows.reduce((total, row) => total + row.baseSalaryKRW, 0);
  return payrollContext > 0 ? (metrics.headlineGapKRW ?? 0) / payrollContext : 0;
}

function tenureDataStatus(rows: NormalizedRosterRow[], affectedRowIds: Set<string>): ThemeDataStatus {
  const affectedRows = rows.filter((row) => affectedRowIds.has(row.rowId));
  return affectedRows.length === affectedRowIds.size
    && affectedRows.every((row) => row.tenureMonths !== undefined)
    ? "sufficient"
    : "partial";
}

function levelDataStatus(rows: NormalizedRosterRow[], affectedRowIds: Set<string>): ThemeDataStatus {
  const affectedRows = rows.filter((row) => affectedRowIds.has(row.rowId));
  return affectedRows.length === affectedRowIds.size
    && affectedRows.every((row) => row.levelRank !== undefined)
    ? "sufficient"
    : "partial";
}

function findingPairs(finding: StructuralFinding): StructuralFindingPair[] {
  if (finding.comparisonPairs.length > 0) return finding.comparisonPairs;
  return finding.headlinePair ? [finding.headlinePair] : [];
}

function uniquePairs(pairs: StructuralFindingPair[]): StructuralFindingPair[] {
  const byKey = new Map<string, StructuralFindingPair>();
  for (const pair of [...pairs].sort(pairPriority)) {
    if (!byKey.has(pairKey(pair))) byKey.set(pairKey(pair), pair);
  }
  return Array.from(byKey.values()).sort(pairPriority);
}

function pairPriority(a: StructuralFindingPair, b: StructuralFindingPair): number {
  const gapRateDelta = (b.gapPercentage ?? 0) - (a.gapPercentage ?? 0);
  if (Math.abs(gapRateDelta) > 0.0000001) return gapRateDelta;
  const salaryGapDelta = b.salaryGapKRW - a.salaryGapKRW;
  if (salaryGapDelta !== 0) return salaryGapDelta;
  return pairKey(a).localeCompare(pairKey(b));
}

function pairKey(pair: StructuralFindingPair): string {
  return `${pair.underpaidRowId}->${pair.comparatorRowId}`;
}

function pairRowIds(pair: StructuralFindingPair): string[] {
  return [pair.underpaidRowId, pair.comparatorRowId];
}

function pairBelongsToRows(pair: StructuralFindingPair, rowIds: Set<string>): boolean {
  return rowIds.has(pair.underpaidRowId) && rowIds.has(pair.comparatorRowId);
}

function isSubset(a: Set<string>, b: Set<string>): boolean {
  return Array.from(a).every((value) => b.has(value));
}

function addNeighbor(adjacency: Map<string, Set<string>>, rowId: string, neighbor: string): void {
  adjacency.set(rowId, new Set([...(adjacency.get(rowId) ?? []), neighbor]));
}

function groupRowsByRole(rows: NormalizedRosterRow[]): Map<string, NormalizedRosterRow[]> {
  const groups = new Map<string, NormalizedRosterRow[]>();
  for (const row of rows) groups.set(row.roleGroup, [...(groups.get(row.roleGroup) ?? []), row]);
  return groups;
}

function groupFindingsByRole(findings: StructuralFinding[]): Map<string, StructuralFinding[]> {
  const groups = new Map<string, StructuralFinding[]>();
  for (const finding of findings) {
    groups.set(finding.roleGroup, [...(groups.get(finding.roleGroup) ?? []), finding]);
  }
  return groups;
}

function compareRoleGroups(a: string, b: string, order: Map<string, number>): number {
  return (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER)
    || a.localeCompare(b);
}

function compareFinding(a: StructuralFinding, b: StructuralFinding): number {
  return a.id.localeCompare(b.id);
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function uniqueInOrder(values: string[]): string[] {
  return Array.from(new Set(values));
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}
