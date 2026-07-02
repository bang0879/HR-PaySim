const scenarios = {
  pay_inversion_correction: {
    category: "Main Scenario",
    name: "보상 역전 정리",
    purpose: "신규 입사자와 기존 구성원 간 보상 역전 사례를 정리하는 가정을 입력합니다.",
    fields: [
      {
        name: "correctionRule",
        label: "정리 방식",
        type: "select",
        required: true,
        options: ["최소 조정", "3개월 단계 조정", "6개월 단계 조정", "밴드 정렬"],
        value: "3개월 단계 조정",
      },
      {
        name: "correctionBudgetCeiling",
        label: "정리 예산 상한",
        type: "number",
        required: true,
        min: 0,
        placeholder: "예: 30000000",
      },
      {
        name: "excludedExceptionGroups",
        label: "이번 정리에서 제외할 예외 그룹",
        type: "text",
        placeholder: "개인명이 아닌 그룹 기준으로 입력",
      },
    ],
    outputs: ["보상 역전 사례 수", "정리 필요 예산", "설명 가능성 개선 방향", "예외 부채 감소 방향"],
    tradeoff: "빠른 정리는 설명 가능성을 회복하지만 예산 상한이 낮으면 일부 리스크가 남습니다.",
  },
  salary_band_redesign: {
    category: "Main Scenario",
    name: "급여 밴드 재설계",
    purpose: "현재 성장 단계에 맞는 단순한 급여 밴드 구조를 설계하는 가정을 입력합니다.",
    fields: [
      {
        name: "rangeSpread",
        label: "밴드 폭",
        type: "number",
        required: true,
        min: 0,
        max: 100,
        value: 40,
        suffix: "%",
        helpText: "내부 용어 range spread는 화면에서 밴드 폭으로 표시합니다.",
      },
      {
        name: "midpointProgression",
        label: "레벨 간 기준급 차이",
        type: "number",
        required: true,
        min: 0,
        max: 100,
        value: 18,
        suffix: "%",
      },
      {
        name: "implementationBudgetCeiling",
        label: "도입 예산 상한",
        type: "number",
        min: 0,
        placeholder: "선택 입력",
      },
      {
        name: "transitionPeriod",
        label: "전환 기간",
        type: "select",
        required: true,
        options: ["즉시", "3개월", "6개월", "다음 평가 주기"],
        value: "6개월",
      },
    ],
    outputs: ["하한 / 기준급 / 상한 구조", "밴드 밖 aggregate 그룹", "예상 조정 예산", "도입 난이도"],
    tradeoff: "밴드는 앞으로의 보상 언어를 만들지만 단계적 전환과 예외 기준 정리가 필요합니다.",
  },
  payroll_cost_forecast: {
    category: "Main Scenario",
    name: "Payroll 증가 예측",
    purpose: "현재 채용과 인상 계획이 6~12개월 payroll에 미치는 영향을 보는 가정을 입력합니다.",
    fields: [
      {
        name: "forecastPeriod",
        label: "예측 기간",
        type: "select",
        required: true,
        options: ["6개월", "12개월"],
        value: "12개월",
      },
      {
        name: "plannedRaiseAssumption",
        label: "정기 인상 가정",
        type: "number",
        min: 0,
        max: 100,
        placeholder: "선택 입력",
        suffix: "%",
      },
      {
        name: "promotionCycleBudget",
        label: "승진/레벨 조정 예산",
        type: "number",
        min: 0,
        placeholder: "선택 입력",
      },
      {
        name: "payrollBudgetCeiling",
        label: "payroll 예산 상한",
        type: "number",
        min: 0,
        placeholder: "선택 입력",
      },
    ],
    outputs: ["월간 payroll 증가액", "연간 payroll 증가액", "현재 payroll 대비 증가율", "주요 비용 증가 요인"],
    tradeoff: "같은 payroll 증가라도 채용, 정기 인상, 예외 인상 중 어디에서 생기는지가 중요합니다.",
  },
  ai_tooling_headcount_freeze: {
    category: "Advanced Scenario",
    name: "AI Tooling + Headcount Freeze",
    purpose: "계획된 채용 일부를 3~6개월 유예하고, AI 도구 예산과 기존 인력 증강으로 대응하는 경우를 봅니다.",
    fields: [
      {
        name: "delayedHiringGroups",
        label: "유예할 채용 그룹",
        type: "text",
        required: true,
        placeholder: "예: 주니어 운영 2명, QA 1명",
      },
      {
        name: "hiringDelayMonths",
        label: "채용 유예 기간",
        type: "select",
        required: true,
        options: ["3개월", "4개월", "5개월", "6개월"],
        value: "3개월",
      },
      {
        name: "monthlyAiToolBudget",
        label: "월 AI 도구 예산",
        type: "number",
        required: true,
        min: 0,
        placeholder: "예: 3000000",
      },
      {
        name: "affectedRolesOrFunctions",
        label: "영향받는 역할/기능",
        type: "text",
        required: true,
        placeholder: "개인명이 아닌 역할 또는 기능 단위",
      },
    ],
    outputs: ["유예된 채용 예산", "AI 도구 예산", "순 예산 차이", "junior pipeline 리스크", "Productivity Leakage Flag"],
    tradeoff: "capacity 연장, senior 검토 부담, junior 성장 경로를 함께 확인해야 합니다.",
  },
  senior_orchestrator_premium: {
    category: "Advanced Scenario",
    name: "Senior Orchestrator Premium",
    purpose: "사람을 덜 뽑자는 것이 아니라, AI를 지렛대로 더 큰 산출과 책임을 맡는 사람에게 더 크게 거는 시나리오입니다.",
    fields: [
      {
        name: "availablePremiumPool",
        label: "재배분 가능한 premium pool",
        type: "number",
        required: true,
        min: 0,
        placeholder: "예: 24000000",
      },
      {
        name: "orchestratorTargetCount",
        label: "대상 senior 조율 역할 수",
        type: "number",
        required: true,
        min: 1,
        value: 3,
      },
      {
        name: "premiumPoolAllocationRate",
        label: "pool 배분율",
        type: "number",
        required: true,
        min: 0,
        max: 100,
        value: 40,
        suffix: "%",
      },
      {
        name: "eligibilityPrinciple",
        label: "대상 기준",
        type: "text",
        required: true,
        placeholder: "예: 여러 역할의 업무 흐름을 설계/검토하는 senior",
      },
      {
        name: "reviewCadence",
        label: "재검토 조건",
        type: "select",
        required: true,
        options: ["3개월 후 재검토", "6개월 후 재검토", "다음 평가 주기 재검토"],
        value: "6개월 후 재검토",
      },
    ],
    outputs: ["사용 가능한 premium pool", "대상 수", "1인 평균 배분 참고값", "내부 형평 리스크", "커뮤니케이션 조건"],
    tradeoff: "기준과 재검토 조건이 있으면 정책이 되지만, 약하면 또 다른 예외 부채가 됩니다.",
  },
};

const panel = document.querySelector("[data-assumption-panel]");
const selectedScenarios = new Set();
let activeScenarioId = "pay_inversion_correction";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderField(field) {
  const requiredMark = field.required ? '<span class="required-mark">*</span>' : "";
  const required = field.required ? " required" : "";
  const min = field.min !== undefined ? ` min="${field.min}"` : "";
  const max = field.max !== undefined ? ` max="${field.max}"` : "";
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : "";
  const value = field.value !== undefined ? ` value="${escapeHtml(field.value)}"` : "";
  const helpText = field.helpText ? `<p>${escapeHtml(field.helpText)}</p>` : "";

  if (field.type === "select") {
    const options = field.options
      .map((option) => {
        const selected = option === field.value ? " selected" : "";
        return `<option value="${escapeHtml(option)}"${selected}>${escapeHtml(option)}</option>`;
      })
      .join("");

    return `
      <label class="scenario-field">
        <span>${escapeHtml(field.label)}${requiredMark}</span>
        <select name="${escapeHtml(field.name)}"${required}>${options}</select>
        ${helpText}
      </label>`;
  }

  const suffix = field.suffix ? `<span class="input-suffix">${escapeHtml(field.suffix)}</span>` : "";
  return `
    <label class="scenario-field">
      <span>${escapeHtml(field.label)}${requiredMark}</span>
      <span class="input-wrap">
        <input type="${field.type}" name="${escapeHtml(field.name)}"${min}${max}${placeholder}${value}${required} />
        ${suffix}
      </span>
      ${helpText}
    </label>`;
}

function summarizeForm(form) {
  const data = new FormData(form);
  const entries = [];

  for (const [key, value] of data.entries()) {
    if (String(value).trim() !== "") {
      const field = scenarios[activeScenarioId].fields.find((item) => item.name === key);
      entries.push(`${field ? field.label : key}: ${value}`);
    }
  }

  return entries.length > 0
    ? entries.join(" / ")
    : "필수 가정을 입력하면 선택한 시나리오의 요약이 여기에 표시됩니다.";
}

function updateSummary() {
  const form = panel.querySelector("[data-scenario-form]");
  const summary = panel.querySelector("[data-assumption-summary] p");
  summary.textContent = summarizeForm(form);
}

function renderPanel(scenarioId) {
  const scenario = scenarios[scenarioId];

  activeScenarioId = scenarioId;
  document.querySelectorAll("[data-scenario-card]").forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.scenarioCard === scenarioId);
  });

  panel.innerHTML = `
    <div class="panel-heading">
      <p class="module-label">${escapeHtml(scenario.category)}</p>
      <h2>${escapeHtml(scenario.name)} 가정</h2>
      <p>${escapeHtml(scenario.purpose)}</p>
    </div>
    <form class="scenario-fields" data-scenario-form>
      ${scenario.fields.map(renderField).join("")}
    </form>
    <div class="assumption-output">
      <strong>이 시나리오에서 볼 결과</strong>
      <ul class="compact-list">
        ${scenario.outputs.map((output) => `<li>${escapeHtml(output)}</li>`).join("")}
      </ul>
    </div>
    <div class="tradeoff-box" data-assumption-summary>
      <strong>가정 요약</strong>
      <p>${escapeHtml(scenario.tradeoff)}</p>
    </div>
    <button type="button" data-add-scenario>비교 후보에 추가하기</button>
    <p class="panel-note">여기서는 비교 후보만 만듭니다. 비교 화면은 다음 단계에서 구현합니다.</p>`;

  const form = panel.querySelector("[data-scenario-form]");
  form.addEventListener("input", updateSummary);
  form.addEventListener("change", updateSummary);
  panel.querySelector("[data-add-scenario]").addEventListener("click", addScenarioCandidate);
  updateSummary();
}

function addScenarioCandidate() {
  selectedScenarios.add(activeScenarioId);
  const existingToast = panel.querySelector(".toast");

  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("p");
  toast.className = "toast";
  toast.textContent = `비교 후보 ${selectedScenarios.size}개가 준비되었습니다. 실제 비교표는 다음 단계에서 계산됩니다.`;
  panel.append(toast);
}

document.querySelectorAll("[data-select-scenario]").forEach((button) => {
  button.addEventListener("click", () => {
    const scenarioId = button.dataset.selectScenario;
    if (scenarioId) {
      renderPanel(scenarioId);
    }
  });
});

panel.querySelector("[data-scenario-form]")?.addEventListener("input", updateSummary);
panel.querySelector("[data-scenario-form]")?.addEventListener("change", updateSummary);
panel.querySelector("[data-add-scenario]")?.addEventListener("click", addScenarioCandidate);
updateSummary();
