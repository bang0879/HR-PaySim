export type ScenarioCategory = "main" | "advanced";

export type ScenarioInputKind = "currency" | "number" | "percent" | "select" | "text";

export interface ScenarioAdjustableInput {
  name: string;
  label: string;
  kind: ScenarioInputKind;
  required: boolean;
  min?: number;
  max?: number;
  defaultValue?: string | number;
  placeholder?: string;
  options?: string[];
  helpText?: string;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  category: ScenarioCategory;
  badge: string;
  purpose: string;
  adjustableInputs: ScenarioAdjustableInput[];
  expectedOutputs: string[];
  keyTradeOff: string;
  warningCopy: string[];
}

export interface ScenarioBuilderSection {
  category: ScenarioCategory;
  title: string;
  helperText: string;
  scenarios: ScenarioDefinition[];
}

export const ADVANCED_HEADCOUNT_FREEZE_COPY =
  "계획된 채용 일부를 3~6개월 유예하고, AI 도구 예산과 기존 인력 증강으로 대응하는 경우를 봅니다.";

export const SENIOR_ORCHESTRATOR_PREMIUM_COPY =
  "사람을 덜 뽑자는 것이 아니라, AI를 지렛대로 더 큰 산출과 책임을 맡는 사람에게 더 크게 거는 시나리오입니다.";

const scenarioDefinitions: ScenarioDefinition[] = [
  {
    id: "pay_inversion_correction",
    name: "보상 역전 정리",
    category: "main",
    badge: "Main",
    purpose:
      "신규 입사자와 기존 구성원 간 보상 역전 사례를 aggregate 기준으로 정리할 때 필요한 예산과 설명 가능성 변화를 봅니다.",
    adjustableInputs: [
      {
        name: "correctionRule",
        label: "정리 방식",
        kind: "select",
        required: true,
        options: ["최소 조정", "밴드 정렬", "3개월 단계 조정", "6개월 단계 조정"],
        defaultValue: "3개월 단계 조정",
      },
      {
        name: "correctionBudgetCeiling",
        label: "정리 예산 상한",
        kind: "currency",
        required: true,
        min: 0,
        placeholder: "예: 30000000",
      },
      {
        name: "excludedExceptionGroups",
        label: "이번 정리에서 제외할 예외 그룹",
        kind: "text",
        required: false,
        placeholder: "개인명이 아닌 그룹 기준으로 입력",
      },
    ],
    expectedOutputs: [
      "보상 역전 사례 수",
      "정리 필요 예산",
      "설명 가능성 개선 방향",
      "예외 부채 감소 방향",
      "남는 커뮤니케이션 리스크",
    ],
    keyTradeOff:
      "빠른 정리는 설명 가능성을 회복하지만, 예산 상한이 낮으면 일부 사례가 남아 커뮤니케이션 부담이 이어질 수 있습니다.",
    warningCopy: [
      "개인별 급여 추천이 아니라 보상 역전 정리 예산을 보는 시나리오입니다.",
      "보상 역전 정리는 유지율을 보장하지 않습니다.",
      "외부 시장 연봉 벤치마크를 사용하지 않습니다.",
    ],
  },
  {
    id: "salary_band_redesign",
    name: "급여 밴드 재설계",
    category: "main",
    badge: "Main",
    purpose:
      "현재 성장 단계에 맞는 단순한 급여 밴드 구조를 만들고, 밴드 밖 사례와 조정 부담을 확인합니다.",
    adjustableInputs: [
      {
        name: "rangeSpread",
        label: "밴드 폭",
        kind: "percent",
        required: true,
        min: 0,
        max: 100,
        defaultValue: 40,
        helpText: "내부 계산 용어 range spread를 사용자 화면에서는 밴드 폭으로 표시합니다.",
      },
      {
        name: "midpointProgression",
        label: "레벨 간 기준급 차이",
        kind: "percent",
        required: true,
        min: 0,
        max: 100,
        defaultValue: 18,
      },
      {
        name: "implementationBudgetCeiling",
        label: "도입 예산 상한",
        kind: "currency",
        required: false,
        min: 0,
        placeholder: "선택 입력",
      },
      {
        name: "transitionPeriod",
        label: "전환 기간",
        kind: "select",
        required: true,
        options: ["즉시", "3개월", "6개월", "다음 평가 주기"],
        defaultValue: "6개월",
      },
    ],
    expectedOutputs: [
      "하한 / 기준급 / 상한 구조",
      "밴드 밖 aggregate 그룹",
      "예상 조정 예산",
      "설명 가능성 개선 방향",
      "도입 난이도",
    ],
    keyTradeOff:
      "밴드는 앞으로의 보상 언어를 만들지만, 밴드 밖 사례가 많으면 단계적 전환과 예외 기준 정리가 필요합니다.",
    warningCopy: [
      "이 밴드는 외부 시장 연봉 벤치마크가 아닙니다.",
      "밴드 설계는 개인별 급여를 자동 결정하지 않습니다.",
      "입력 데이터 품질에 따라 결과 확신도가 달라질 수 있습니다.",
    ],
  },
  {
    id: "payroll_cost_forecast",
    name: "Payroll 증가 예측",
    category: "main",
    badge: "Main",
    purpose:
      "현재 채용과 인상 계획이 향후 6~12개월 payroll에 만드는 월간/연간 부담과 주요 증가 요인을 봅니다.",
    adjustableInputs: [
      {
        name: "forecastPeriod",
        label: "예측 기간",
        kind: "select",
        required: true,
        options: ["6개월", "12개월"],
        defaultValue: "12개월",
      },
      {
        name: "plannedRaiseAssumption",
        label: "정기 인상 가정",
        kind: "percent",
        required: false,
        min: 0,
        max: 100,
        placeholder: "선택 입력",
      },
      {
        name: "promotionCycleBudget",
        label: "승진/레벨 조정 예산",
        kind: "currency",
        required: false,
        min: 0,
        placeholder: "선택 입력",
      },
      {
        name: "payrollBudgetCeiling",
        label: "payroll 예산 상한",
        kind: "currency",
        required: false,
        min: 0,
        placeholder: "선택 입력",
      },
    ],
    expectedOutputs: [
      "월간 payroll 증가액",
      "연간 payroll 증가액",
      "현재 payroll 대비 증가율",
      "선택 입력이 있을 때만 runway 영향",
      "주요 비용 증가 요인",
    ],
    keyTradeOff:
      "같은 payroll 증가라도 채용, 정기 인상, 예외 인상 중 어디에서 발생하는지에 따라 거버넌스 리스크가 달라집니다.",
    warningCopy: [
      "finance-grade 예측이 아니라 보상 거버넌스 시뮬레이션입니다.",
      "세금, 복리후생, equity, vendor 비용까지 합산한 종합 비용 계산이 아닙니다.",
      "runway 영향은 선택 입력이 제공된 경우에만 표시합니다.",
    ],
  },
  {
    id: "ai_tooling_headcount_freeze",
    name: "AI Tooling + Headcount Freeze",
    category: "advanced",
    badge: "Advanced",
    purpose: ADVANCED_HEADCOUNT_FREEZE_COPY,
    adjustableInputs: [
      {
        name: "delayedHiringGroups",
        label: "유예할 채용 그룹",
        kind: "text",
        required: true,
        placeholder: "예: 주니어 운영 2명, QA 1명",
      },
      {
        name: "hiringDelayMonths",
        label: "채용 유예 기간",
        kind: "select",
        required: true,
        options: ["3개월", "4개월", "5개월", "6개월"],
        defaultValue: "3개월",
      },
      {
        name: "monthlyAiToolBudget",
        label: "월 AI 도구 예산",
        kind: "currency",
        required: true,
        min: 0,
        placeholder: "예: 3000000",
      },
      {
        name: "affectedRolesOrFunctions",
        label: "영향받는 역할/기능",
        kind: "text",
        required: true,
        placeholder: "개인명이 아닌 역할 또는 기능 단위",
      },
    ],
    expectedOutputs: [
      "유예된 채용 예산",
      "AI 도구 예산",
      "순 예산 차이",
      "junior pipeline 리스크",
      "Productivity Leakage Flag",
      "가정 요약",
    ],
    keyTradeOff:
      "비용 차이만 보는 결정이 아니라 capacity 연장, senior 검토 부담, junior 성장 경로를 함께 확인해야 합니다.",
    warningCopy: [
      "Advanced 시나리오이며 기본 보상 시나리오와 분리해 해석해야 합니다.",
      "AI 도구 비용과 유예된 채용 예산의 차이는 생산성 수치가 아닙니다.",
      "선택 채용 유예가 junior pipeline과 senior review burden을 키울 수 있습니다.",
    ],
  },
  {
    id: "senior_orchestrator_premium",
    name: "Senior Orchestrator Premium",
    category: "advanced",
    badge: "Advanced",
    purpose: SENIOR_ORCHESTRATOR_PREMIUM_COPY,
    adjustableInputs: [
      {
        name: "availablePremiumPool",
        label: "재배분 가능한 premium pool",
        kind: "currency",
        required: true,
        min: 0,
        placeholder: "예: 24000000",
      },
      {
        name: "orchestratorTargetCount",
        label: "대상 senior 조율 역할 수",
        kind: "number",
        required: true,
        min: 1,
        defaultValue: 3,
      },
      {
        name: "premiumPoolAllocationRate",
        label: "pool 배분율",
        kind: "percent",
        required: true,
        min: 0,
        max: 100,
        defaultValue: 40,
      },
      {
        name: "eligibilityPrinciple",
        label: "대상 기준",
        kind: "text",
        required: true,
        placeholder: "예: 여러 역할의 업무 흐름을 설계/검토하는 senior",
      },
      {
        name: "reviewCadence",
        label: "재검토 조건",
        kind: "select",
        required: true,
        options: ["3개월 후 재검토", "6개월 후 재검토", "다음 평가 주기 재검토"],
        defaultValue: "6개월 후 재검토",
      },
    ],
    expectedOutputs: [
      "사용 가능한 premium pool",
      "대상 수",
      "1인 평균 배분 참고값",
      "설명 가능성 영향",
      "내부 형평 리스크",
      "커뮤니케이션 조건",
    ],
    keyTradeOff:
      "명확한 기준과 재검토 조건이 있으면 설명 가능한 정책이 되지만, 기준이 약하면 또 다른 예외 부채가 됩니다.",
    warningCopy: [
      "개인별 보상 추천이 아니라 premium pool 규모 검토입니다.",
      "모든 AI-adjacent 역할에 premium이 필요하다는 뜻이 아닙니다.",
      "대상 기준과 재검토 조건이 없으면 내부 형평 리스크가 커질 수 있습니다.",
    ],
  },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderList(items: string[], className: string): string {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderInput(input: ScenarioAdjustableInput): string {
  const requiredMark = input.required ? '<span class="required-mark">*</span>' : "";
  const helpText = input.helpText ? `<p>${escapeHtml(input.helpText)}</p>` : "";
  const min = input.min !== undefined ? ` min="${input.min}"` : "";
  const max = input.max !== undefined ? ` max="${input.max}"` : "";
  const placeholder = input.placeholder ? ` placeholder="${escapeHtml(input.placeholder)}"` : "";
  const value = input.defaultValue !== undefined ? ` value="${escapeHtml(String(input.defaultValue))}"` : "";

  if (input.kind === "select") {
    const options = (input.options ?? [])
      .map((option) => {
        const selected = option === input.defaultValue ? " selected" : "";
        return `<option value="${escapeHtml(option)}"${selected}>${escapeHtml(option)}</option>`;
      })
      .join("");

    return `
      <label class="scenario-field">
        <span>${escapeHtml(input.label)}${requiredMark}</span>
        <select name="${escapeHtml(input.name)}" ${input.required ? "required" : ""}>${options}</select>
        ${helpText}
      </label>`;
  }

  const type = input.kind === "text" ? "text" : "number";
  const suffix = input.kind === "percent" ? '<span class="input-suffix">%</span>' : "";

  return `
    <label class="scenario-field">
      <span>${escapeHtml(input.label)}${requiredMark}</span>
      <span class="input-wrap">
        <input type="${type}" name="${escapeHtml(input.name)}"${min}${max}${placeholder}${value} ${
          input.required ? "required" : ""
        } />
        ${suffix}
      </span>
      ${helpText}
    </label>`;
}

function renderScenarioCard(scenario: ScenarioDefinition): string {
  return `
    <article class="scenario-card" data-scenario-id="${escapeHtml(scenario.id)}">
      <div class="scenario-card-header">
        <span class="scenario-badge ${scenario.category === "advanced" ? "advanced-badge" : ""}">
          ${escapeHtml(scenario.badge)}
        </span>
        <h3>${escapeHtml(scenario.name)}</h3>
      </div>
      <p>${escapeHtml(scenario.purpose)}</p>
      <div class="scenario-detail-grid">
        <div>
          <strong>예상 출력</strong>
          ${renderList(scenario.expectedOutputs, "compact-list")}
        </div>
        <div>
          <strong>핵심 trade-off</strong>
          <p>${escapeHtml(scenario.keyTradeOff)}</p>
        </div>
      </div>
      <details class="scenario-warning">
        <summary>주의할 점</summary>
        ${renderList(scenario.warningCopy, "warning-list")}
      </details>
      <button type="button" data-select-scenario="${escapeHtml(scenario.id)}">가정 조정</button>
    </article>`;
}

function renderAssumptionPanel(scenario: ScenarioDefinition): string {
  return `
    <section class="assumption-panel" aria-labelledby="${escapeHtml(scenario.id)}-panel-title">
      <div class="panel-heading">
        <p class="module-label">${escapeHtml(scenario.badge)} Scenario</p>
        <h3 id="${escapeHtml(scenario.id)}-panel-title">${escapeHtml(scenario.name)} 가정</h3>
        <p>${escapeHtml(scenario.purpose)}</p>
      </div>
      <div class="scenario-fields">${scenario.adjustableInputs.map(renderInput).join("")}</div>
      <div class="assumption-output">
        <strong>이 시나리오에서 볼 결과</strong>
        ${renderList(scenario.expectedOutputs, "compact-list")}
      </div>
      <div class="tradeoff-box">
        <strong>핵심 trade-off</strong>
        <p>${escapeHtml(scenario.keyTradeOff)}</p>
      </div>
      <button type="button">비교에 추가하기</button>
    </section>`;
}

export function getScenarioDefinitions(): ScenarioDefinition[] {
  return scenarioDefinitions.map((scenario) => ({
    ...scenario,
    adjustableInputs: scenario.adjustableInputs.map((input) => ({ ...input })),
    expectedOutputs: [...scenario.expectedOutputs],
    warningCopy: [...scenario.warningCopy],
  }));
}

export function getScenarioBuilderSections(): ScenarioBuilderSection[] {
  const definitions = getScenarioDefinitions();
  const mainScenarios = definitions.filter((scenario) => scenario.category === "main");
  const advancedScenarios = definitions.filter((scenario) => scenario.category === "advanced");

  return [
    {
      category: "main",
      title: "기본 보상 시나리오",
      helperText: "먼저 기본 시나리오에서 보상 설명 가능성, 예외 부채, payroll 영향을 확인합니다.",
      scenarios: mainScenarios,
    },
    {
      category: "advanced",
      title: "Advanced: AI tooling과 채용 지연 가정",
      helperText:
        "AI tooling이나 채용 유예 가정이 실제 의사결정에 포함될 때만 열어보세요. 기본 보상 시나리오와 분리해 해석합니다.",
      scenarios: advancedScenarios,
    },
  ];
}

export function renderScenarioBuilderHtml(): string {
  const sections = getScenarioBuilderSections();
  const defaultScenario = sections[0].scenarios[0];

  const mainSection = `
    <section class="scenario-group main-scenarios" aria-labelledby="main-scenarios-title">
      <div class="group-heading">
        <p class="module-label">Main Scenarios</p>
        <h2 id="main-scenarios-title">${escapeHtml(sections[0].title)}</h2>
        <p>${escapeHtml(sections[0].helperText)}</p>
      </div>
      <div class="scenario-card-grid">${sections[0].scenarios.map(renderScenarioCard).join("")}</div>
    </section>`;

  const advancedSection = `
    <details class="scenario-group advanced-scenarios">
      <summary>
        <span>${escapeHtml(sections[1].title)}</span>
        <small>${escapeHtml(sections[1].helperText)}</small>
      </summary>
      <div class="advanced-helper">
        <p>${escapeHtml(ADVANCED_HEADCOUNT_FREEZE_COPY)}</p>
        <p>${escapeHtml(SENIOR_ORCHESTRATOR_PREMIUM_COPY)}</p>
      </div>
      <div class="scenario-card-grid">${sections[1].scenarios.map(renderScenarioCard).join("")}</div>
    </details>`;

  return `
    <main class="paysim-shell scenario-builder-shell">
      <section class="builder-hero">
        <p class="module-label">HR PaySim</p>
        <h1>조정 시나리오 만들기</h1>
        <p>baseline을 기준으로 비교할 보상 거버넌스 시나리오를 고르고, 필요한 가정을 조정합니다.</p>
      </section>
      <div class="builder-layout">
        <div class="scenario-list">
          ${mainSection}
          ${advancedSection}
        </div>
        ${renderAssumptionPanel(defaultScenario)}
      </div>
    </main>`;
}
