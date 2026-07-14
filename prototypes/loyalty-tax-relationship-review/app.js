const steps = [
  { id: "pattern", title: "패턴 보기", subtitle: "왜 먼저 보나" },
  { id: "judgment", title: "이유 선택", subtitle: "가장 가까운 이유" },
  { id: "memo", title: "기준 확인", subtitle: "다음 결정" },
];

const primaryOptions = [
  {
    code: "recent_hire_market",
    label: "최근 채용 시장 영향입니다",
    help: "최근 입사자의 조건이 시장 상황 때문에 높아졌습니다.",
    memoLine: "최근 입사자의 조건이 채용 시장 상황 때문에 높아진 패턴입니다.",
    decision: "다음 경력직 offer를 만들 때 오래 함께한 구성원의 보상 위치를 함께 검토할지 정해야 합니다.",
  },
  {
    code: "tenured_raise_lag",
    label: "초기 구성원 인상 반영이 늦었습니다",
    help: "오래 함께한 구성원의 보상 조정이 채용 시장 변화만큼 따라가지 못했습니다.",
    memoLine: "오래 함께한 구성원의 보상 조정이 채용 시장 변화만큼 따라가지 못한 패턴입니다.",
    decision: "다음 연봉 리뷰 때 초기 구성원 보상 위치를 별도 기준으로 재검토할지 정해야 합니다.",
  },
  {
    code: "role_or_performance_difference",
    label: "역할이나 성과 차이로 설명됩니다",
    help: "단순 근속 차이가 아니라 역할, 책임, 성과 차이가 있습니다.",
    memoLine: "이 차이는 단순 근속 차이가 아니라 역할, 책임, 성과 차이로 설명할 수 있습니다.",
    decision: "장기 근속자 리뷰 전에 역할 범위와 성과 기준이 구성원에게 일관되게 설명되는지 확인합니다.",
  },
  {
    code: "needs_more_data",
    label: "데이터를 더 확인해야 합니다",
    help: "최근 인상 이력, 역할 범위, 성과 정보를 더 봐야 합니다.",
    memoLine: "현재 자료만으로는 오래 함께한 구성원의 보상 위치를 충분히 설명하기 어렵습니다.",
    decision: "최근 인상 이력, 역할 범위, 성과 정보 중 어떤 데이터를 먼저 확인할지 정해야 합니다.",
  },
];

const state = {
  primaryOption: "",
};

const stepper = document.querySelector("#stepper");
const primaryOptionTarget = document.querySelector("#primaryOptions");
const memoJudgment = document.querySelector("#memoJudgment");
const memoDecision = document.querySelector("#memoDecision");
const controlCopy = document.querySelector("#controlCopy");

function render() {
  hydrateStaticIcons();
  renderStepper();
  renderPrimaryOptions();
  updateMemo();
  updateControlCopy();
}

function renderStepper() {
  stepper.innerHTML = steps.map((step, index) => {
    const isCurrent = step.id === "judgment";
    const isComplete = step.id === "pattern" || step.id === "memo";
    const marker = isComplete ? "✓" : index + 1;
    const className = ["step-button", isCurrent ? "is-current" : "", isComplete ? "is-complete" : ""].filter(Boolean).join(" ");
    return `<button class="${className}" type="button" data-step="${step.id}"><span class="rail-line" aria-hidden="true"></span><span class="step-number">${marker}</span><span class="step-index">${index + 1}</span><span class="step-copy"><strong>${step.title}</strong><small>${step.subtitle}</small></span></button>`;
  }).join("");
}

function renderPrimaryOptions() {
  primaryOptionTarget.innerHTML = primaryOptions.map((option) => {
    const selected = option.code === state.primaryOption;
    return `<button class="primary-option-card ${selected ? "is-selected" : ""}" type="button" data-primary-option="${option.code}"><strong>${option.label}</strong><small>${option.help}</small></button>`;
  }).join("");
}

function updateMemo() {
  const selected = primaryOptions.find((option) => option.code === state.primaryOption);
  if (!selected) {
    memoJudgment.innerHTML = "<li>아직 선택 전입니다. 가장 가까운 이유를 하나 선택하면 이 문장이 완성됩니다.</li>";
    memoDecision.innerHTML = "<li>선택한 이유가 장기 근속자 보상 리뷰 기준 후보로 정리됩니다.</li>";
    return;
  }

  memoJudgment.innerHTML = `<li>${selected.memoLine}</li>`;
  memoDecision.innerHTML = `<li>${selected.decision}</li>`;
}

function updateControlCopy() {
  const selected = primaryOptions.find((option) => option.code === state.primaryOption);
  if (!selected) {
    controlCopy.textContent = "가장 가까운 이유를 선택하면 오른쪽 메모가 바뀝니다.";
    return;
  }

  controlCopy.textContent = `선택한 이유: ${selected.label}. 오른쪽 메모에 다음 기준 후보로 반영했습니다.`;
}

function hydrateStaticIcons() {
  document.querySelectorAll("[data-icon]").forEach((target) => {
    const name = target.dataset.icon;
    target.innerHTML = icon(name);
  });
}

function icon(name) {
  const paths = {
    info: '<circle cx="12" cy="12" r="9"></circle><path d="M12 10v6M12 7.5h.01"></path>',
    target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>',
    chat: '<path d="M5 6h14v10H9l-4 4V6Z"></path><path d="M9 10h6M9 13h4"></path>',
    layers: '<path d="m12 4 9 5-9 5-9-5 9-5Z"></path><path d="m3 14 9 5 9-5"></path>',
    shield: '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"></path><path d="m8.5 12 2.2 2.2 4.8-5"></path>',
    question: '<circle cx="12" cy="12" r="9"></circle><path d="M9.8 9a2.4 2.4 0 1 1 3.6 2.1c-.9.5-1.4 1-1.4 2.1M12 17h.01"></path>',
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.info}</svg>`;
}

function reset() {
  state.primaryOption = "";
  render();
  document.querySelector("#pattern")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("click", (event) => {
  const stepButton = event.target.closest("[data-step]");
  if (stepButton) {
    document.querySelector(`#${stepButton.dataset.step}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const primaryButton = event.target.closest("[data-primary-option]");
  if (primaryButton) {
    state.primaryOption = primaryButton.dataset.primaryOption;
    render();
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  if (actionButton.dataset.action === "reset") reset();
});

render();
