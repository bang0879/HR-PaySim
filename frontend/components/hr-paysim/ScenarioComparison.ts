import type {
  DifficultyLevel,
  RiskFlag,
  ScenarioId,
  ScenarioResult,
} from "../../lib/hr-paysim/schema/types.ts";

type ComparisonCategory = "Baseline" | "Main" | "Advanced";
type Confidence = "high" | "medium" | "low";

export interface ScenarioComparisonResult extends ScenarioResult {
  category: ComparisonCategory;
  payroll_increase_rate: number;
  pay_inversion_cases_before: number;
  pay_inversion_cases_after: number;
  key_trade_off: string;
  founder_gain: string;
  founder_loss: string;
  confidence: Confidence;
  best_fit?: boolean;
}

export interface ScenarioComparisonModel {
  headline: string;
  decisionPrinciple: string;
  baseline: ScenarioComparisonResult;
  scenarios: ScenarioComparisonResult[];
  bestFitScenarioId: ScenarioId;
}

export const CHEAPEST_NOT_ALWAYS_BEST_COPY =
  "가장 비용이 낮은 안이 항상 가장 좋은 안은 아닙니다.";

export const SHORT_TERM_COST_EXPLAINABILITY_COPY =
  "이 안은 단기 비용은 증가하지만 보상 설명 가능성을 회복하는 데 유리합니다.";

export const HEADCOUNT_SLOWDOWN_COPY =
  "이 안은 채용 속도를 늦추는 대신 기존 핵심인재의 책임과 보상 재배분을 검토하는 선택입니다.";

const difficultyLabel: Record<DifficultyLevel, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  unknown: "입력 필요",
};

const riskFlagLabel: Record<RiskFlag, string> = {
  budget_pressure: "예산 압박",
  low_input_quality: "입력 확신 낮음",
  productivity_leakage: "생산성 누수",
  fairness_perception_risk: "형평 인식 리스크",
  advanced_assumption: "Advanced 가정",
  communication_risk: "커뮤니케이션 리스크",
  junior_pipeline_risk: "junior pipeline 리스크",
  pay_inversion_risk: "보상 역전 리스크",
  exception_debt_risk: "예외 부채 리스크",
};

const baseline: ScenarioComparisonResult = {
  scenario_id: "baseline_current_state",
  scenario_name: "현 상태 유지",
  category: "Baseline",
  annual_cost_delta: 0,
  monthly_burn_delta: 0,
  payroll_increase_rate: 0,
  cei_before: 38,
  cei_after: 38,
  ced_before: 72,
  ced_after: 72,
  pay_inversion_cases_before: 14,
  pay_inversion_cases_after: 14,
  execution_difficulty: "low",
  communication_difficulty: "medium",
  risk_flags: ["exception_debt_risk", "pay_inversion_risk"],
  explanation_text:
    "아무것도 하지 않는 선택도 하나의 보상 의사결정입니다. 현재 비용은 늘지 않지만 설명 가능성 부채가 누적될 수 있습니다.",
  key_trade_off:
    "지금 당장의 실행 부담은 낮지만, 보상 역전과 예외 인상이 계속 누적될 수 있습니다.",
  founder_gain: "즉시 추가 예산을 쓰지 않고 현재 운영을 유지합니다.",
  founder_loss: "보상 기준을 설명하기 어려운 상태가 다음 채용과 인상에도 이어질 수 있습니다.",
  confidence: "medium",
};

const defaultSelectedScenarios: ScenarioComparisonResult[] = [
  {
    scenario_id: "pay_inversion_correction",
    scenario_name: "보상 역전 정리",
    category: "Main",
    annual_cost_delta: 48_000_000,
    monthly_burn_delta: 4_000_000,
    payroll_increase_rate: 3.2,
    cei_before: 38,
    cei_after: 58,
    ced_before: 72,
    ced_after: 54,
    pay_inversion_cases_before: 14,
    pay_inversion_cases_after: 4,
    execution_difficulty: "medium",
    communication_difficulty: "high",
    risk_flags: ["communication_risk", "budget_pressure"],
    explanation_text:
      "보상 역전 사례를 단계적으로 정리해 기존 구성원에게 설명 가능한 기준을 회복하는 안입니다.",
    key_trade_off: SHORT_TERM_COST_EXPLAINABILITY_COPY,
    founder_gain: "보상 역전 이슈를 줄이고 내부 설명 가능성을 회복합니다.",
    founder_loss: "단기 payroll 부담과 커뮤니케이션 난이도가 올라갑니다.",
    confidence: "medium",
  },
  {
    scenario_id: "salary_band_redesign",
    scenario_name: "급여 밴드 재설계",
    category: "Main",
    annual_cost_delta: 72_000_000,
    monthly_burn_delta: 6_000_000,
    payroll_increase_rate: 4.8,
    cei_before: 38,
    cei_after: 66,
    ced_before: 72,
    ced_after: 58,
    pay_inversion_cases_before: 14,
    pay_inversion_cases_after: 8,
    execution_difficulty: "high",
    communication_difficulty: "medium",
    risk_flags: ["budget_pressure", "fairness_perception_risk"],
    explanation_text:
      "하한, 기준급, 상한을 단순하게 정리해 앞으로의 보상 의사결정 언어를 만드는 안입니다.",
    key_trade_off:
      "구조를 세우는 효과는 크지만, 밴드 밖 사례를 한 번에 모두 정리하기 어렵습니다.",
    founder_gain: "향후 채용, 인상, 승진 논의에서 반복 사용할 기준 언어를 만듭니다.",
    founder_loss: "초기 설계와 전환 비용이 크고, 일부 예외는 단계적으로 남을 수 있습니다.",
    confidence: "medium",
  },
  {
    scenario_id: "payroll_cost_forecast",
    scenario_name: "Payroll 증가 예측",
    category: "Main",
    annual_cost_delta: 128_000_000,
    monthly_burn_delta: 10_666_667,
    payroll_increase_rate: 8.5,
    cei_before: 38,
    cei_after: 40,
    ced_before: 72,
    ced_after: 74,
    pay_inversion_cases_before: 14,
    pay_inversion_cases_after: 15,
    execution_difficulty: "low",
    communication_difficulty: "medium",
    risk_flags: ["budget_pressure", "exception_debt_risk"],
    explanation_text:
      "현재 채용과 인상 계획을 유지할 때 payroll 부담이 어디서 커지는지 확인하는 안입니다.",
    key_trade_off:
      "예산 가시성은 좋아지지만, 보상 설명 가능성이나 예외 부채를 직접 줄이지는 않습니다.",
    founder_gain: "채용과 인상 계획이 burn에 주는 압박을 빠르게 확인합니다.",
    founder_loss: "구조 조정 없이 forecast만 보면 보상 거버넌스 리스크는 남습니다.",
    confidence: "medium",
  },
  {
    scenario_id: "ai_tooling_headcount_freeze",
    scenario_name: "AI Tooling + Headcount Freeze",
    category: "Advanced",
    annual_cost_delta: -96_000_000,
    monthly_burn_delta: -8_000_000,
    payroll_increase_rate: -6.4,
    cei_before: 38,
    cei_after: 42,
    ced_before: 72,
    ced_after: 76,
    pay_inversion_cases_before: 14,
    pay_inversion_cases_after: 14,
    execution_difficulty: "medium",
    communication_difficulty: "high",
    risk_flags: ["advanced_assumption", "junior_pipeline_risk", "productivity_leakage"],
    explanation_text:
      "계획된 채용 일부를 3~6개월 유예하고, AI 도구 예산과 기존 인력 증강으로 capacity를 연장하는 안입니다.",
    key_trade_off: HEADCOUNT_SLOWDOWN_COPY,
    founder_gain: "단기 burn을 낮추면서 capacity 연장 가능성을 검토합니다.",
    founder_loss: "junior pipeline, senior 검토 부담, 책임 재배분 문제가 커질 수 있습니다.",
    confidence: "low",
  },
  {
    scenario_id: "senior_orchestrator_premium",
    scenario_name: "Senior Orchestrator Premium",
    category: "Advanced",
    annual_cost_delta: 24_000_000,
    monthly_burn_delta: 2_000_000,
    payroll_increase_rate: 1.6,
    cei_before: 38,
    cei_after: 52,
    ced_before: 72,
    ced_after: 64,
    pay_inversion_cases_before: 14,
    pay_inversion_cases_after: 14,
    execution_difficulty: "medium",
    communication_difficulty: "high",
    risk_flags: ["advanced_assumption", "fairness_perception_risk", "communication_risk"],
    explanation_text:
      "AI를 지렛대로 더 큰 산출과 책임을 맡는 senior 조율 역할에 premium pool을 명시하는 안입니다.",
    key_trade_off:
      "명확한 대상 기준과 재검토 조건이 있으면 정책이 되지만, 기준이 약하면 또 다른 예외 부채가 됩니다.",
    founder_gain: "숨은 예외 보상을 명시적인 pool과 기준으로 전환합니다.",
    founder_loss: "대상 기준이 약하면 내부 형평 리스크와 커뮤니케이션 부담이 커집니다.",
    confidence: "low",
  },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatKrw(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const absolute = Math.abs(Math.round(value));
  return `${sign}${absolute.toLocaleString("ko-KR")}원`;
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("ko-KR")}%`;
}

function scoreForBestFit(scenario: ScenarioComparisonResult): number {
  const ceiGain = scenario.cei_after - scenario.cei_before;
  const cedReduction = scenario.ced_before - scenario.ced_after;
  const inversionReduction =
    scenario.pay_inversion_cases_before - scenario.pay_inversion_cases_after;
  const costPenalty = Math.max(0, scenario.annual_cost_delta) / 10_000_000;
  const costReliefBonus = scenario.annual_cost_delta < 0 ? 4 : 0;
  const executionPenalty = scenario.execution_difficulty === "high" ? 10 : scenario.execution_difficulty === "medium" ? 4 : 0;
  const communicationPenalty =
    scenario.communication_difficulty === "high" ? 8 : scenario.communication_difficulty === "medium" ? 3 : 0;
  const advancedPenalty = scenario.category === "Advanced" ? 8 : 0;

  return (
    ceiGain * 2 +
    cedReduction * 1.5 +
    inversionReduction * 3 +
    costReliefBonus -
    costPenalty -
    executionPenalty -
    communicationPenalty -
    advancedPenalty
  );
}

export function pickBestFitScenario(
  scenarios: ScenarioComparisonResult[],
): ScenarioComparisonResult | undefined {
  return [...scenarios]
    .filter((scenario) => scenario.scenario_id !== "baseline_current_state")
    .sort((left, right) => scoreForBestFit(right) - scoreForBestFit(left))[0];
}

export function getScenarioComparisonModel(
  selectedScenarioIds?: ScenarioId[],
): ScenarioComparisonModel {
  const selected =
    selectedScenarioIds && selectedScenarioIds.length > 0
      ? defaultSelectedScenarios.filter((scenario) =>
          selectedScenarioIds.includes(scenario.scenario_id),
        )
      : [...defaultSelectedScenarios];

  const bestFit = pickBestFitScenario(selected);
  const bestFitScenarioId = bestFit?.scenario_id ?? selected[0]?.scenario_id ?? baseline.scenario_id;
  const selectedWithBestFit = selected.map((scenario) => ({
    ...scenario,
    best_fit: scenario.scenario_id === bestFitScenarioId,
  }));

  return {
    headline: "어떤 조정안이 비용과 설명 가능성을 어떻게 바꾸나요?",
    decisionPrinciple:
      `${CHEAPEST_NOT_ALWAYS_BEST_COPY} 현재 리스크, 실행 가능성, 커뮤니케이션 부담을 함께 봐야 합니다.`,
    baseline: { ...baseline },
    scenarios: [{ ...baseline }, ...selectedWithBestFit],
    bestFitScenarioId,
  };
}

function renderRiskFlags(flags: RiskFlag[]): string {
  if (flags.length === 0) {
    return '<span class="risk-chip">주요 flag 없음</span>';
  }

  return flags
    .map((flag) => `<span class="risk-chip">${escapeHtml(riskFlagLabel[flag])}</span>`)
    .join("");
}

function renderMetric(label: string, value: string, className = ""): string {
  return `
    <div class="comparison-metric ${className}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>`;
}

function renderScenarioColumn(scenario: ScenarioComparisonResult): string {
  const isBaseline = scenario.scenario_id === "baseline_current_state";
  const categoryClass = scenario.category === "Advanced" ? "advanced-column" : "";
  const bestFit = scenario.best_fit ? '<span class="best-fit-badge">Best-fit 후보</span>' : "";

  return `
    <article class="comparison-column ${isBaseline ? "baseline-column" : ""} ${categoryClass}" data-scenario-id="${escapeHtml(
      scenario.scenario_id,
    )}">
      <div class="comparison-column-header">
        <span class="scenario-badge">${escapeHtml(scenario.category)}</span>
        ${bestFit}
        <h3>${escapeHtml(scenario.scenario_name)}</h3>
        <p>${escapeHtml(scenario.explanation_text)}</p>
      </div>
      <div class="comparison-metrics">
        ${renderMetric("연간 비용 변화", formatKrw(scenario.annual_cost_delta))}
        ${renderMetric("월 burn 변화", formatKrw(scenario.monthly_burn_delta))}
        ${renderMetric("Payroll 증가율", formatPercent(scenario.payroll_increase_rate))}
        ${renderMetric("CEI before/after", `${scenario.cei_before} → ${scenario.cei_after}`)}
        ${renderMetric("CED before/after", `${scenario.ced_before} → ${scenario.ced_after}`)}
        ${renderMetric(
          "보상 역전 사례 변화",
          `${scenario.pay_inversion_cases_before} → ${scenario.pay_inversion_cases_after}`,
        )}
        ${renderMetric("실행 난이도", difficultyLabel[scenario.execution_difficulty])}
        ${renderMetric("커뮤니케이션 난이도", difficultyLabel[scenario.communication_difficulty])}
      </div>
      <div class="decision-lens">
        <div>
          <strong>창업자가 얻는 것</strong>
          <p>${escapeHtml(scenario.founder_gain)}</p>
        </div>
        <div>
          <strong>창업자가 감수할 것</strong>
          <p>${escapeHtml(scenario.founder_loss)}</p>
        </div>
      </div>
      <div class="tradeoff-row">
        <strong>핵심 trade-off</strong>
        <p>${escapeHtml(scenario.key_trade_off)}</p>
      </div>
      <div class="risk-flag-row">
        <strong>risk flags</strong>
        <div>${renderRiskFlags(scenario.risk_flags)}</div>
      </div>
      ${
        isBaseline
          ? ""
          : `<button type="button" data-select-fit="${escapeHtml(
              scenario.scenario_id,
            )}">이 안을 best-fit 후보로 보기</button>`
      }
    </article>`;
}

export function renderScenarioComparisonHtml(
  model: ScenarioComparisonModel = getScenarioComparisonModel(),
): string {
  return `
    <main class="paysim-shell scenario-comparison-shell">
      <section class="comparison-hero">
        <p class="module-label">Scenario Comparison</p>
        <h1>${escapeHtml(model.headline)}</h1>
        <p>${escapeHtml(model.decisionPrinciple)}</p>
      </section>
      <section class="comparison-note" aria-label="Decision principle">
        <strong>비교 원칙</strong>
        <p>${escapeHtml(CHEAPEST_NOT_ALWAYS_BEST_COPY)}</p>
        <p>비용 변화, 설명 가능성, 예외 부채, 실행 난이도, 커뮤니케이션 난이도를 함께 봅니다.</p>
      </section>
      <section class="comparison-grid" aria-label="Scenario comparison table">
        ${model.scenarios.map(renderScenarioColumn).join("")}
      </section>
      <section class="comparison-actions" aria-label="Scenario selection">
        <div>
          <strong>Best-fit 후보</strong>
          <p>현재 입력 기준으로는 ${escapeHtml(
            model.scenarios.find((scenario) => scenario.scenario_id === model.bestFitScenarioId)?.scenario_name ?? "",
          )}가 비용만이 아니라 설명 가능성 회복과 실행 가능성의 균형이 가장 좋습니다.</p>
        </div>
        <button type="button">선택한 안으로 다음 질문 정리</button>
      </section>
    </main>`;
}
