import type { StructuralFinding, StructuralFindingType } from "./domain.ts";
import { parseRosterPaste, type RosterParseOptions } from "./rosterParser.ts";
import { detectStructuralFindings } from "./structuralFindings.ts";

export type RosterDiagnosticStatus = "empty" | "needs_pii_confirmation" | "ready" | "partial_blocked" | "invalid";

export interface RosterPreviewRow {
  rowId: string;
  roleGroup: string;
  title: string;
  salaryLabel: string;
  tenureLabel: string;
  managerLabel: string;
  teamLabel: string;
}

export interface FindingCardViewModel {
  id: string;
  type: StructuralFindingType;
  roleGroup: string;
  title: string;
  defensibilityQuestion: string;
  relationshipSummary: string;
  evidence: string[];
  headlineLabel: string;
  correctionFloorLabel: string;
  exposurePayrollLabel: string;
  riskLabel: string;
  confidenceLabel: string;
}

export interface RosterDiagnosticViewModel {
  status: RosterDiagnosticStatus;
  statusTitle: string;
  statusCopy: string;
  primaryActionLabel: string;
  canShowFindings: boolean;
  warnings: string[];
  errors: string[];
  previewRows: RosterPreviewRow[];
  findingCards: FindingCardViewModel[];
  summary: {
    acceptedRowCount: number;
    blockedRowCount: number;
    findingCount: number;
    roleGroupCount: number;
    rejectedColumnHeaders: string[];
    rejectedValuePatterns: string[];
    rawTextPersisted: false;
  };
}

export function createRosterDiagnosticViewModel(rawText: string, options: RosterParseOptions = {}): RosterDiagnosticViewModel {
  if (rawText.trim().length === 0) {
    return {
      status: "empty",
      statusTitle: "de-identified roster를 붙여넣어 시작합니다.",
      statusCopy: "원문은 브라우저 저장소에 남기지 않고, normalized row만 화면 상태에서 계산합니다.",
      primaryActionLabel: "샘플 데이터 불러오기",
      canShowFindings: false,
      warnings: [],
      errors: [],
      previewRows: [],
      findingCards: [],
      summary: emptySummary(),
    };
  }

  const parsed = parseRosterPaste(rawText, options);
  if (parsed.requiresPiiColumnConfirmation) {
    return {
      status: "needs_pii_confirmation",
      statusTitle: "PII-like 컬럼이 감지됐습니다.",
      statusCopy: "이 컬럼들은 분석에 쓰지 않고 제거해야 합니다. 제거 후에도 원문 값은 저장하지 않습니다.",
      primaryActionLabel: "PII 컬럼 제거 후 계속",
      canShowFindings: false,
      warnings: parsed.warnings,
      errors: parsed.errors,
      previewRows: [],
      findingCards: [],
      summary: {
        ...emptySummary(),
        rejectedColumnHeaders: parsed.report.rejectedColumnHeaders,
        rejectedValuePatterns: parsed.report.rejectedValuePatterns,
        rawTextPersisted: parsed.report.rawTextPersisted,
      },
    };
  }

  const findings = detectStructuralFindings(parsed.rows);
  const hasBlockedRows = parsed.errors.length > 0;
  const status = parsed.rows.length === 0 ? "invalid" : hasBlockedRows ? "partial_blocked" : "ready";

  return {
    status,
    statusTitle: status === "partial_blocked" ? "일부 row를 제외하고 분석했습니다." : status === "invalid" ? "분석 가능한 row가 없습니다." : "보상 관계 신호를 계산했습니다.",
    statusCopy: status === "partial_blocked"
      ? "PII-like 값이 들어간 row는 제외했고, 남은 de-identified row로만 finding을 계산했습니다."
      : status === "invalid"
        ? "필수 컬럼과 PII 값을 확인한 뒤 다시 붙여넣어 주세요."
        : "preview row와 finding 모두 de-identified 값만 사용합니다.",
    primaryActionLabel: status === "invalid" ? "입력 확인" : "분석 업데이트",
    canShowFindings: parsed.rows.length > 0,
    warnings: parsed.warnings,
    errors: parsed.errors,
    previewRows: parsed.rows.slice(0, 8).map((row) => ({
      rowId: row.rowId,
      roleGroup: row.roleGroup,
      title: row.title ?? "-",
      salaryLabel: formatKRW(row.baseSalaryKRW),
      tenureLabel: row.tenureMonths === undefined ? "-" : `${row.tenureMonths}개월`,
      managerLabel: row.managerLabel ?? "-",
      teamLabel: row.teamLabel ?? "-",
    })),
    findingCards: findings.map(toFindingCard),
    summary: {
      acceptedRowCount: parsed.report.acceptedRowCount,
      blockedRowCount: parsed.errors.length,
      findingCount: findings.length,
      roleGroupCount: new Set(parsed.rows.map((row) => row.roleGroup)).size,
      rejectedColumnHeaders: parsed.report.rejectedColumnHeaders,
      rejectedValuePatterns: parsed.report.rejectedValuePatterns,
      rawTextPersisted: parsed.report.rawTextPersisted,
    },
  };
}

function toFindingCard(finding: StructuralFinding): FindingCardViewModel {
  return {
    id: finding.id,
    type: finding.type,
    roleGroup: finding.roleGroup,
    title: finding.title,
    defensibilityQuestion: finding.defensibilityQuestion,
    relationshipSummary: finding.relationshipSummary,
    evidence: finding.evidence,
    headlineLabel: finding.headlinePair
      ? `${finding.headlinePair.underpaidRowId} ↔ ${finding.headlinePair.comparatorRowId} / ${formatKRW(finding.headlinePair.salaryGapKRW)}`
      : finding.clusterGapKRW
        ? `cluster gap ${formatKRW(finding.clusterGapKRW)}`
        : "relationship set",
    correctionFloorLabel: finding.riskModel.correctionFloorKRW === undefined ? "개별 보정액 표시 안 함" : formatKRW(finding.riskModel.correctionFloorKRW),
    exposurePayrollLabel: finding.riskModel.exposurePayrollKRW === undefined ? "-" : formatKRW(finding.riskModel.exposurePayrollKRW),
    riskLabel: `${finding.riskModel.communicationRisk} communication / ${finding.riskModel.spreadRisk} spread`,
    confidenceLabel: finding.confidence,
  };
}

function emptySummary(): RosterDiagnosticViewModel["summary"] {
  return {
    acceptedRowCount: 0,
    blockedRowCount: 0,
    findingCount: 0,
    roleGroupCount: 0,
    rejectedColumnHeaders: [],
    rejectedValuePatterns: [],
    rawTextPersisted: false,
  };
}

function formatKRW(value: number): string {
  if (value >= 100000000) return `${trimNumber(value / 100000000)}억`;
  if (value >= 10000) return `${trimNumber(value / 10000)}만`;
  return `${value.toLocaleString("ko-KR")}원`;
}

function trimNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}