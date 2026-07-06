import type { DiagnosisResult, QuickInputDraft, ScenarioId, ScenarioRecommendation } from "./domain.ts";
import { calculateDiagnosis, compareScenarios, type ScenarioComparisonResult } from "./calculations.ts";
import { recommendScenarios } from "./recommendations.ts";

export type PrototypeMode = "hrPrism" | "direct" | "sample";
export type PrototypeScenarioKey = "current" | "inversion" | "band" | "forecast" | "ai" | "senior";

export interface PrototypeFormState {
  industry: string;
  companySize: string;
  revenueScale: string;
  growthStage: string;
  basePayrollEok: string;
  variablePayEok: string;
  benefitsEok: string;
  bonusEligiblePct: string;
  pePct: string;
  experiencedHirePct: string;
  plannedHires: string;
  averageNewHireSalaryManwon: string;
  hiringRole: string;
  hiringUrgency: string;
  inversionSignal: string;
  attritionSignal: string;
  hiringDifficultySignal: string;
  notes: string;
  aiPurpose: string;
  aiAutomationLevel: string;
  aiMonthlyBudgetManwon: string;
  aiHiringDelayOption: string;
  salaryBandExists: boolean;
}

export interface PrototypePresentation {
  input: QuickInputDraft;
  diagnosis: DiagnosisResult;
  recommendations: ScenarioRecommendation[];
  comparison: ScenarioComparisonResult;
  selectedScenario: ScenarioMeta;
  summary: {
    employeeCount: SummaryMetric;
    plannedHires: SummaryMetric;
    exceptions: SummaryMetric;
    inversions: SummaryMetric;
    aiTooling: SummaryMetric;
  };
  confidence: {
    score: number;
    sufficiency: string;
    consistency: string;
    missing: string;
  };
  memo: {
    currentIssue: string;
    reason: string;
    gains: string[];
    tradeoffs: string[];
    nextQuestions: string[];
  };
}

export interface SummaryMetric {
  value: string;
  note: string;
}

export interface ScenarioMeta {
  id: ScenarioId;
  key: PrototypeScenarioKey;
  title: string;
  badge: string;
  icon: string;
  reasons: string[];
  gain: string[];
  tradeoff: string[];
}

export const prototypeSampleForm: PrototypeFormState = {
  industry: "SaaS/IT",
  companySize: "500명 이상",
  revenueScale: "500억 이상",
  growthStage: "확장 단계",
  basePayrollEok: "428",
  variablePayEok: "48",
  benefitsEok: "34",
  bonusEligiblePct: "64",
  pePct: "82",
  experiencedHirePct: "42",
  plannedHires: "120",
  averageNewHireSalaryManwon: "6800",
  hiringRole: "제품/엔지니어링",
  hiringUrgency: "높음",
  inversionSignal: "일부 있음",
  attritionSignal: "일부 있음",
  hiringDifficultySignal: "명확히 있음",
  notes: "",
  aiPurpose: "생산성 보조",
  aiAutomationLevel: "중간",
  aiMonthlyBudgetManwon: "1200",
  aiHiringDelayOption: "일부 가능",
  salaryBandExists: false,
};

const scenarioMetaByKey: Record<PrototypeScenarioKey, ScenarioMeta> = {
  current: {
    id: "baseline_current_state",
    key: "current",
    title: "현재 상태 유지",
    badge: "기준 시나리오",
    icon: "trend",
    reasons: ["단기 비용과 조직 혼선을 최소화합니다.", "모든 다른 안과 비교할 기준점입니다."],
    gain: ["단기 비용 부담 없음", "운영 안정성 유지"],
    tradeoff: ["구조적 이슈 해결 지연", "설명 어려움이 누적될 수 있음"],
  },
  inversion: {
    id: "resolve_pay_inversion",
    key: "inversion",
    title: "급여 역전 해소",
    badge: "우선 추천",
    icon: "target",
    reasons: ["기존 구성원과 신규 입사자 사이의 설명 부담을 줄입니다.", "핵심 직무의 이탈 리스크를 먼저 낮춥니다."],
    gain: ["급여 역전 구간 완화", "핵심 인재 이탈 리스크 완화"],
    tradeoff: ["단기 보상 조정 예산 필요", "적용 범위 기준 합의 필요"],
  },
  band: {
    id: "redesign_salary_bands",
    key: "band",
    title: "연봉 밴드 재설계",
    badge: "우선 추천",
    icon: "layers",
    reasons: ["역할과 레벨 기준을 다시 세워 반복 예외를 줄입니다.", "향후 채용과 승진 보상 운영의 예측 가능성을 높입니다."],
    gain: ["보상 구조 공정성 개선", "밴드 구조 정합성 향상", "장기적 보상 경쟁력 강화"],
    tradeoff: ["단기 비용 증가", "정책 변경 관리 필요", "일괄 커뮤니케이션 필요"],
  },
  forecast: {
    id: "forecast_payroll_growth",
    key: "forecast",
    title: "급여 총액 예측",
    badge: "보조 추천",
    icon: "chart",
    reasons: ["채용 계획이 급여 총액에 주는 영향을 먼저 봅니다.", "중장기 예산 여력을 비교할 수 있습니다."],
    gain: ["급여 총액 증가 폭 사전 확인", "채용 계획별 예산 감도 확인"],
    tradeoff: ["보상 구조 자체를 고치지는 않음", "가정 변경 시 재계산 필요"],
  },
  ai: {
    id: "ai_tooling_check",
    key: "ai",
    title: "채용 지연 + AI 도구",
    badge: "추가 확인",
    icon: "team",
    reasons: ["도구 예산과 채용 속도를 함께 검토합니다.", "AI가 보상 의사결정에 주는 영향을 별도 확인합니다."],
    gain: ["비용 부담 완화", "핵심 인력에 보상 집중"],
    tradeoff: ["실행과 소통 난이도 증가", "도구 효과 가정 검증 필요"],
  },
  senior: {
    id: "senior_orchestrator_premium",
    key: "senior",
    title: "Senior Orchestrator Premium",
    badge: "고급 검토",
    icon: "spark",
    reasons: ["조율 역할의 책임과 보상 기준을 분리해 봅니다.", "시니어 역할 변화가 클 때 보조 검토합니다."],
    gain: ["조율 책임 보상 기준 분리", "시니어 역할 설명 가능성 개선"],
    tradeoff: ["역할 정의 합의 필요", "일반 보상 밴드와 충돌 가능"],
  },
};

export function createPrototypePresentation(input: {
  form: PrototypeFormState;
  mode: PrototypeMode;
  selectedScenarioKey: PrototypeScenarioKey;
}): PrototypePresentation {
  const draft = prototypeFormToQuickInput(input.form);
  const diagnosis = calculateDiagnosis(draft);
  const recommendations = recommendScenarios(draft, diagnosis);
  const selectedScenario = scenarioMetaByKey[input.selectedScenarioKey] ?? scenarioMetaByKey.band;
  const comparison = compareScenarios(draft, comparisonScenarioIds(selectedScenario.id));

  return {
    input: draft,
    diagnosis,
    recommendations,
    comparison,
    selectedScenario,
    summary: buildSummary(draft, input.form),
    confidence: buildConfidence(input.form),
    memo: buildMemo(diagnosis, selectedScenario),
  };
}

export function prototypeFormToQuickInput(form: PrototypeFormState): QuickInputDraft {
  const employeeCount = companySizeToEmployeeCount(form.companySize);
  const inversionCaseCount = signalToCount(form.inversionSignal, employeeCount, { none: 0, partial: 0.035, clear: 0.11 });
  const exceptionRaiseCount =
    signalToCount(form.attritionSignal, employeeCount, { none: 0, partial: 0.025, clear: 0.08 }) +
    signalToCount(form.hiringDifficultySignal, employeeCount, { none: 0, partial: 0.02, clear: 0.055 });

  return {
    employeeCount,
    plannedHires: toNumber(form.plannedHires),
    basePayrollAnnual: eokToWon(form.basePayrollEok),
    variablePayAnnual: eokToWon(form.variablePayEok),
    benefitsAnnual: eokToWon(form.benefitsEok),
    exceptionRaiseCount,
    inversionCaseCount,
    salaryBandExists: form.salaryBandExists,
    currentAiToolingLevel: automationToAiLevel(form.aiAutomationLevel),
  };
}

export function scenarioKeyToScenarioId(key: PrototypeScenarioKey): ScenarioId {
  return scenarioMetaByKey[key].id;
}

export function scenarioMetaForId(scenarioId: ScenarioId): ScenarioMeta {
  return Object.values(scenarioMetaByKey).find((scenario) => scenario.id === scenarioId) ?? scenarioMetaByKey.current;
}

export function allScenarioMeta(): ScenarioMeta[] {
  return Object.values(scenarioMetaByKey);
}

export function formatWonEok(value: number): string {
  const eok = value / 100000000;
  if (Math.abs(eok) >= 10) return `${signed(eok.toFixed(1))}억 원`;
  if (Math.abs(eok) >= 1) return `${signed(eok.toFixed(2))}억 원`;
  return `${signed(Math.round(value / 10000).toLocaleString("ko-KR"))}만 원`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

export function bandLabel(score: number, highIsGood = true): string {
  if (highIsGood) {
    if (score >= 80) return "높음";
    if (score >= 65) return "관리 가능";
    if (score >= 50) return "주의";
    return "위험";
  }
  if (score < 25) return "낮음";
  if (score < 50) return "관리 가능";
  if (score < 80) return "높음";
  return "위험";
}

export function severityLabel(value: DiagnosisResult["payInversionSeverity"]): string {
  if (value === "none") return "없음";
  if (value === "low") return "낮음";
  if (value === "medium") return "중간";
  return "높음";
}

function comparisonScenarioIds(selected: ScenarioId): ScenarioId[] {
  return Array.from(new Set<ScenarioId>(["baseline_current_state", selected, "redesign_salary_bands", "ai_tooling_check"]));
}

function buildSummary(input: QuickInputDraft, form: PrototypeFormState): PrototypePresentation["summary"] {
  const aiProvided = input.currentAiToolingLevel !== "unanswered" && input.currentAiToolingLevel !== "none";
  return {
    employeeCount: {
      value: `${input.employeeCount.toLocaleString("ko-KR")}명`,
      note: `${form.companySize || "규모 미입력"} 기준`,
    },
    plannedHires: {
      value: `${input.plannedHires.toLocaleString("ko-KR")}명`,
      note: "다음 12개월",
    },
    exceptions: {
      value: `${input.exceptionRaiseCount.toLocaleString("ko-KR")}명`,
      note: `${formatPercent(input.exceptionRaiseCount / Math.max(input.employeeCount, 1))} of 전체 인원`,
    },
    inversions: {
      value: `${input.inversionCaseCount.toLocaleString("ko-KR")}건`,
      note: signalNote(form.inversionSignal),
    },
    aiTooling: {
      value: aiProvided ? "제공됨" : "미입력",
      note: aiProvided ? `${form.aiPurpose || "AI 도구"} / ${form.aiAutomationLevel}` : "선택 입력",
    },
  };
}

function buildConfidence(form: PrototypeFormState): PrototypePresentation["confidence"] {
  const fields = [
    form.industry,
    form.companySize,
    form.revenueScale,
    form.growthStage,
    form.basePayrollEok,
    form.variablePayEok,
    form.benefitsEok,
    form.plannedHires,
    form.averageNewHireSalaryManwon,
    form.hiringRole,
    form.hiringUrgency,
    form.inversionSignal,
  ];
  const filled = fields.filter((value) => String(value).trim()).length;
  const score = Math.round((filled / fields.length) * 100);

  return {
    score,
    sufficiency: score >= 80 ? "높음" : score >= 60 ? "보통" : "낮음",
    consistency: "높음",
    missing: score >= 80 ? "경미" : "보완 필요",
  };
}

function buildMemo(diagnosis: DiagnosisResult, selectedScenario: ScenarioMeta): PrototypePresentation["memo"] {
  return {
    currentIssue: issueText(diagnosis),
    reason: `${selectedScenario.title}은 현재 진단에서 가장 먼저 비교할 만한 보상 의사결정안입니다.`,
    gains: selectedScenario.gain,
    tradeoffs: selectedScenario.tradeoff,
    nextQuestions: [
      "이 안을 적용할 범위는 어디까지인가요?",
      "예산 한도 안에서 단계 실행이 가능한가요?",
      "구성원에게 어떤 메시지와 순서로 설명할까요?",
      "다음 재계산 기준일은 언제로 둘까요?",
    ],
  };
}

function issueText(diagnosis: DiagnosisResult): string {
  if (diagnosis.payInversionSeverity === "high" || diagnosis.ceiBand === "risk") {
    return "급여 역전과 반복 예외가 누적되어 보상 설명 가능성이 낮아지고 있습니다.";
  }
  if (diagnosis.cedBand === "high" || diagnosis.cedBand === "critical") {
    return "예외 인상이 누적되어 향후 보상 운영 기준이 흔들릴 수 있습니다.";
  }
  if (diagnosis.payrollIncreaseRate > 0.15) {
    return "채용 계획이 급여 총액과 보상 예산에 주는 영향이 커지고 있습니다.";
  }
  return "현재 보상 구조는 관리 가능한 상태이며, 기준 유지 조건을 확인하는 것이 중요합니다.";
}

function companySizeToEmployeeCount(size: string): number {
  if (size.includes("50명 미만")) return 35;
  if (size.includes("50~199")) return 120;
  if (size.includes("200~499")) return 320;
  if (size.includes("500명 이상")) return 1248;
  return 120;
}

function signalToCount(
  value: string,
  employeeCount: number,
  rates: { none: number; partial: number; clear: number },
): number {
  if (value.includes("명확")) return Math.max(1, Math.round(employeeCount * rates.clear));
  if (value.includes("일부")) return Math.max(1, Math.round(employeeCount * rates.partial));
  return Math.round(employeeCount * rates.none);
}

function automationToAiLevel(value: string): QuickInputDraft["currentAiToolingLevel"] {
  if (value === "낮음") return "low";
  if (value === "중간") return "medium";
  if (value === "높음") return "high";
  if (value === "없음") return "none";
  return "unanswered";
}

function signalNote(value: string): string {
  if (!value || value === "없음") return "신호 없음";
  if (value === "확인 필요") return "추가 확인 필요";
  return value;
}

function toNumber(value: string): number {
  const numeric = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(numeric) ? numeric : 0;
}

function eokToWon(value: string): number {
  return Math.round(toNumber(value) * 100000000);
}

function signed(value: string): string {
  return value.startsWith("-") ? value : `+${value}`;
}
