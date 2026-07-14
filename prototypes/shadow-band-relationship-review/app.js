const steps = [
  { id: "distribution", title: "분포 보기", subtitle: "왜 먼저 보나" },
  { id: "judgment", title: "설명 선택", subtitle: "가장 가까운 설명" },
  { id: "memo", title: "기준 확인", subtitle: "다음 결정" },
];

const primaryOptions = [
  {
    code: "intentional_band",
    label: "의도한 구간입니다",
    help: "역할, 숙련도, 책임 차이에 따라 나눈 구간입니다.",
    memoLine: "이 분포는 의도한 보상 구간입니다. 공식 이름은 없지만 실제 운영 기준이 있습니다.",
    decision: "다음 채용이나 연봉 조정 전에 이 구간을 어떤 이름과 기준으로 부를지 정해야 합니다.",
  },
  {
    code: "emerged_band",
    label: "자연스럽게 생긴 구간입니다",
    help: "채용 시장, 인상 이력, 역할 변화가 누적되며 생긴 구간입니다.",
    memoLine: "이 분포는 의도한 제도라기보다 채용과 인상 결과가 누적되며 자연스럽게 생긴 구간입니다.",
    decision: "이 구간을 앞으로 기준으로 인정할지, 다음 보상 리뷰에서 조정할지 정해야 합니다.",
  },
  {
    code: "newly_seen_structure",
    label: "처음 보는 구조입니다",
    help: "공식 기준은 없었지만 지급 결과에서 새로운 구조가 보입니다.",
    memoLine: "지금까지 이름 붙이지 않았던 보상 구조가 지급 결과에서 처음 확인되었습니다.",
    decision: "이 구조에 이름을 붙일지, 역할 언어나 레벨 언어가 필요한지 확인해야 합니다.",
  },
  {
    code: "needs_more_data",
    label: "데이터가 더 필요합니다",
    help: "역할 범위, 입사 시점, 최근 인상 이력을 더 확인해야 합니다.",
    memoLine: "현재 자료만으로는 이 구간이 의도된 구조인지 판단하기 어렵습니다.",
    decision: "역할 범위, 입사 시점, 최근 인상 이력 중 어떤 데이터를 먼저 확인할지 정해야 합니다.",
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
    const isComplete = step.id === "distribution" || step.id === "memo";
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
    memoJudgment.innerHTML = "<li>아직 선택 전입니다. 가장 가까운 설명을 하나 선택하면 이 문장이 완성됩니다.</li>";
    memoDecision.innerHTML = "<li>선택한 설명이 다음 보상 기준 후보로 정리됩니다.</li>";
    return;
  }

  memoJudgment.innerHTML = `<li>${selected.memoLine}</li>`;
  memoDecision.innerHTML = `<li>${selected.decision}</li>`;
}

function updateControlCopy() {
  const selected = primaryOptions.find((option) => option.code === state.primaryOption);
  if (!selected) {
    controlCopy.textContent = "가장 가까운 설명을 선택하면 오른쪽 메모가 바뀝니다.";
    return;
  }

  controlCopy.textContent = `선택한 설명: ${selected.label}. 오른쪽 메모에 다음 기준 후보로 반영했습니다.`;
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
  document.querySelector("#distribution")?.scrollIntoView({ behavior: "smooth", block: "start" });
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