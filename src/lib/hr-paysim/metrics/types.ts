export interface OrdinalAdjustment {
  rowId: string;
  fromSalaryKRW: number;
  toSalaryKRW: number;
  adjustmentKRW: number;
}

export interface SystemRepairResult {
  headlineGapKRW: number;
  pairRepairFloorKRW: number;
  systemRepairFloorKRW: number;
  adjustments: OrdinalAdjustment[];
}

export interface FindingMetricSet {
  headlineGapKRW?: number;
  pairRepairFloorKRW?: number;
  systemRepairFloorKRW?: number;
  roleGroupPayrollContextKRW?: number;
  nonClaim: string;
}
