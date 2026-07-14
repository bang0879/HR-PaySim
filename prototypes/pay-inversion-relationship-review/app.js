const steps = [
  { id: "relationship", title: "관계 보기", subtitle: "왜 먼저 보나" },
  { id: "judgment", title: "이유 선택", subtitle: "가장 가까운 이유" },
  { id: "memo", title: "기준 확인", subtitle: "다음 결정" },
];

const primaryOptions = [
  {
    code: "clear_standard",
    label: "명확한 기준이 있습니다",
    help: "성과, 역할, 책임 차이로 설명할 수 있습니다.",
    memoLine: "성과, 역할, 책임 차이로 이 보상 차이를 설명할 수 있습니다.",
    decision: "다음 채용이나 연봉 조정 때도 같은 기준을 반복 적용할 수 있는지 확인합니다.",
  },
  {
    code: "exceptional_reason",
    label: "예외적인 이유가 있었습니다",
    help: "채용 당시 시장 상황, counteroffer, 핵심 스킬 등 특정한 이유가 있었습니다.",
    memoLine: "예외적인 조건이 있었던 보상 차이입니다.",
    decision: "다음 경력직 채용이나 연봉 조정 때도 이 예외 기준을 반복할지, 기존 구성원 보상과 함께 검토할지 정해야 합니다.",
  },
  {
    code: "explainable_not_standardized",
    label: "설명은 가능하지만 기준으로 정리되진 않았습니다",
    help: "대표나 리더는 설명할 수 있지만 구성원에게 일관되게 말할 기준은 아직 약합니다.",
    memoLine: "대표나 리더는 설명할 수 있지만, 구성원에게 일관되게 말할 기준은 아직 약합니다.",
    decision: "다음 보상 리뷰 전에 어떤 문장으로 기준을 설명할지 정해야 합니다.",
  },
  {
    code: "hard_to_explain",
    label: "지금은 설명이 어렵습니다",
    help: "데이터나 맥락을 더 확인해야 합니다.",
    memoLine: "현재 데이터나 맥락만으로는 이 보상 차이를 설명하기 어렵습니다.",
    decision: "어떤 데이터를 먼저 확인한 뒤 다시 볼지 정해야 합니다.",
  },
];

const secondaryReasonGroups = {
  exceptional_reason: [
    { code: "market_pressure", label: "최근 채용 시장 상황", memoLine: "최근 채용 시장 상황 때문에 예외적인 조건이 있었습니다." },
    { code: "counteroffer", label: "counteroffer", memoLine: "counteroffer 때문에 예외적인 조건이 있었습니다." },
    { code: "critical_skill", label: "특정 기술/경험", memoLine: "특정 기술이나 경험 때문에 예외적인 조건이 있었습니다." },
    { code: "urgent_hiring", label: "긴급 채용", memoLine: "긴급 채용 상황 때문에 예외적인 조건이 있었습니다." },
    { code: "founder_exception", label: "대표 승인 예외", memoLine: "대표 승인 예외로 예외적인 조건이 있었습니다." },
  ],
  explainable_not_standardized: [
    { code: "performance_difference", label: "성과 차이", memoLine: "성과 차이로 설명은 가능하지만, 기준으로 문서화되어 있지는 않습니다." },
    { code: "role_scope_difference", label: "역할 범위 차이", memoLine: "역할 범위 차이로 설명은 가능하지만, 기준으로 문서화되어 있지는 않습니다." },
    { code: "leader_judgment", label: "리더 판단에 의존", memoLine: "리더 판단에 의존한 설명이며, 아직 공통 기준은 아닙니다." },
    { code: "documentation_needed", label: "문서화 필요", memoLine: "설명은 가능하지만 문서화가 필요합니다." },
    { code: "next_review_standard", label: "다음 연봉 리뷰 때 정리 필요", memoLine: "다음 연봉 리뷰 때 기준으로 정리해야 합니다." },
  ],
  hard_to_explain: [
    { code: "performance_review_needed", label: "성과 평가 확인 필요", memoLine: "성과 평가를 먼저 확인해야 합니다." },
    { code: "role_scope_review_needed", label: "역할 범위 확인 필요", memoLine: "역할 범위를 먼저 확인해야 합니다." },
    { code: "hiring_terms_needed", label: "입사 당시 조건 확인 필요", memoLine: "입사 당시 조건을 먼저 확인해야 합니다." },
    { code: "raise_history_needed", label: "최근 인상 이력 확인 필요", memoLine: "최근 인상 이력을 먼저 확인해야 합니다." },
  ],
};

const state = {
  primaryOption: "",
  secondaryReason: "",
};

const stepper = document.querySelector("#stepper");
const primaryOptionTarget = document.querySelector("#primaryOptions");
const secondaryReasonPanel = document.querySelector("#secondaryReasonPanel");
const reasonChipsTarget = document.querySelector("#reasonChips");
const memoJudgment = document.querySelector("#memoJudgment");
const memoDecision = document.querySelector("#memoDecision");
const controlCopy = document.querySelector("#controlCopy");

function render() {
  hydrateStaticIcons();
  renderStepper();
  renderPrimaryOptions();
  renderSecondaryReasons();
  updateMemo();
  updateControlCopy();
}

function renderStepper() {
  stepper.innerHTML = steps.map((step, index) => {
    const isCurrent = step.id === "judgment";
    const isComplete = step.id === "relationship" || step.id === "memo";
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

function renderSecondaryReasons() {
  const reasons = secondaryReasonGroups[state.primaryOption] ?? [];
  const shouldShow = reasons.length > 0;
  secondaryReasonPanel.hidden = !shouldShow;
  if (!shouldShow) {
    reasonChipsTarget.innerHTML = "";
    return;
  }

  reasonChipsTarget.innerHTML = reasons.map((reason) => {
    const selected = reason.code === state.secondaryReason;
    return `<button class="reason-chip ${selected ? "is-selected" : ""}" type="button" data-secondary-reason="${reason.code}">${reason.label}</button>`;
  }).join("");
}

function updateMemo() {
  const selected = primaryOptions.find((option) => option.code === state.primaryOption);
  if (!selected) {
    memoJudgment.innerHTML = "<li>아직 선택 전입니다. 가장 가까운 이유를 하나 선택하면 이 문장이 완성됩니다.</li>";
    memoDecision.innerHTML = "<li>선택한 이유가 다음 보상 기준 후보로 정리됩니다.</li>";
    return;
  }

  const reasons = secondaryReasonGroups[state.primaryOption] ?? [];
  const reason = reasons.find((option) => option.code === state.secondaryReason);
  const memoLine = reason?.memoLine ?? selected.memoLine;

  memoJudgment.innerHTML = `<li>${memoLine}</li>`;
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
  state.secondaryReason = "";
  render();
  document.querySelector("#relationship")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    state.secondaryReason = "";
    render();
    return;
  }

  const secondaryReasonButton = event.target.closest("[data-secondary-reason]");
  if (secondaryReasonButton) {
    state.secondaryReason = secondaryReasonButton.dataset.secondaryReason;
    render();
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  if (actionButton.dataset.action === "reset") reset();
});

render();