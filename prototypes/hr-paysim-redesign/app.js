const steps = [
  { title: "시작", subtitle: "모드 선택" },
  { title: "입력", subtitle: "데이터 입력" },
  { title: "확인", subtitle: "입력 내용 확인" },
  { title: "진단", subtitle: "보상 진단 & 해석" },
  { title: "시나리오", subtitle: "추천 시나리오" },
  { title: "AI 확인", subtitle: "AI 관련 추가 확인" },
  { title: "비교", subtitle: "의사결정 비교" },
  { title: "메모", subtitle: "의사결정 메모" },
];

const modes = {
  hrPrism: {
    label: "HR Prism 결과에서 이어서 보기",
    shortLabel: "HR Prism 연계",
    description: "진단 결과와 핵심 맥락을 자동 반영해 보상 시나리오와 의사결정을 진행합니다.",
    button: "이어서 보기",
    icon: "building",
  },
  direct: {
    label: "직접 입력하기",
    shortLabel: "수동 입력",
    description: "회사의 보상 및 인력 관련 정보를 직접 입력하여 시작합니다.",
    button: "직접 입력 시작",
    icon: "edit",
  },
  sample: {
    label: "샘플 데이터 미리보기",
    shortLabel: "샘플",
    description: "샘플 데이터를 기반으로 화면 구성과 흐름을 먼저 살펴봅니다.",
    button: "미리보기 시작",
    icon: "chart",
  },
};

const appState = {
  currentStep: 0,
  highestUnlocked: 0,
  mode: "hrPrism",
  selectedScenario: "band",
  staleSteps: new Set(),
  editedFields: 0,
  memoSaved: false,
  inputWarning: "",
};

const screen = document.querySelector("#screen");
const stepper = document.querySelector("#stepper");
const controlCopy = document.querySelector("#controlCopy");
const nextButton = document.querySelector('[data-action="next"]');
const backButton = document.querySelector('[data-action="back"]');
const topnavButtons = Array.from(document.querySelectorAll(".topnav-pill"));

const controlTexts = [
  "시작 방법을 선택하면 입력 단계로 이동합니다.",
  "집계 수준의 회사 보상 정보를 입력합니다.",
  "입력한 내용이 진단에 충분한지 확인합니다.",
  "현재 보상 거버넌스 상태와 다음 질문을 확인합니다.",
  "먼저 비교할 만한 시나리오를 선택합니다.",
  "AI 도구 맥락이 보상 의사결정에 주는 영향을 점검합니다.",
  "얻는 것과 감수할 것을 같은 표에서 비교합니다.",
  "공식 문서가 아닌 핵심 쟁점 preview로 마무리합니다.",
];

const renderers = [renderEntry, renderIntake, renderSummary, renderDiagnosis, renderScenarios, renderAiCheck, renderComparison, renderMemo];

function setStep(nextStep) {
  const bounded = Math.max(0, Math.min(steps.length - 1, nextStep));
  if (bounded > appState.highestUnlocked) return;
  appState.currentStep = bounded;
  render();
}

function completeAndGoNext() {
  if (appState.currentStep === steps.length - 1) {
    appState.memoSaved = true;
    render();
    return;
  }

  appState.highestUnlocked = Math.max(appState.highestUnlocked, appState.currentStep + 1);
  appState.staleSteps.delete(appState.currentStep + 1);
  appState.currentStep += 1;
  render();
}

function markStaleFrom(stepIndex) {
  for (let index = stepIndex; index < steps.length; index += 1) {
    if (index <= appState.highestUnlocked) appState.staleSteps.add(index);
  }
  renderStepper();
}

function updateChrome() {
  backButton.disabled = appState.currentStep === 0;
  nextButton.textContent = appState.currentStep === steps.length - 1 ? (appState.memoSaved ? "저장됨 ✓" : "메모 초안 저장 ↓") : `${nextLabel()} →`;
  controlCopy.textContent = appState.inputWarning && appState.currentStep === 1 ? appState.inputWarning : appState.memoSaved && appState.currentStep === 7 ? "메모 초안이 브라우저 세션에 저장된 상태로 표시되었습니다." : controlTexts[appState.currentStep];
  const activeTop = appState.currentStep <= 2 ? 0 : appState.currentStep === 3 ? 1 : appState.currentStep <= 5 ? 2 : appState.currentStep === 6 ? 3 : 4;
  topnavButtons.forEach((button, index) => button.classList.toggle("is-active", index === activeTop));
}

function nextLabel() {
  if (appState.currentStep === 5) return "비교로 이동";
  if (appState.currentStep === 6) return "메모 미리보기 열기";
  return "다음으로";
}

function renderStepper() {
  stepper.innerHTML = steps.map((step, index) => {
    const isCurrent = index === appState.currentStep;
    const isComplete = index < appState.highestUnlocked && !appState.staleSteps.has(index);
    const isLocked = index > appState.highestUnlocked;
    const isStale = appState.staleSteps.has(index);
    const marker = isComplete ? "✓" : index + 1;
    const className = ["step-button", isCurrent ? "is-current" : "", isComplete ? "is-complete" : "", isLocked ? "is-locked" : "", isStale ? "is-stale" : ""].filter(Boolean).join(" ");
    return `<button class="${className}" type="button" data-step="${index}" ${isLocked ? "disabled" : ""}><span class="rail-line" aria-hidden="true"></span><span class="step-number">${marker}</span><span class="step-index">${index + 1}</span><span class="step-copy"><strong>${step.title}</strong><small>${step.subtitle}</small></span></button>`;
  }).join("");
}

function render() {
  renderStepper();
  updateChrome();
  screen.innerHTML = screenHeader() + renderers[appState.currentStep]();
}

function screenHeader(actions = "") {
  const step = steps[appState.currentStep];
  return `<div class="screen-header"><div><h1>${appState.currentStep + 1}. ${step.title}</h1><p>${step.subtitle}</p></div><div class="screen-actions">${actions || headerActions(appState.currentStep)}</div></div>`;
}

function headerActions(stepIndex) {
  if (stepIndex === 3 || stepIndex === 4) return `<button class="outline-button" type="button" data-action="mark-stale">↻ 데이터 변경됨</button><button class="outline-button" type="button" data-step="1">입력으로 돌아가기</button>`;
  if (stepIndex === 5) return `<button class="outline-button" type="button">AI 도구 맥락 보기</button>`;
  if (stepIndex === 6) return `<button class="outline-button" type="button" data-action="next-inline">메모 미리보기</button>`;
  return "";
}

function renderEntry() {
  return `<div class="entry-layout"><section class="entry-main"><div class="info-banner large"><span class="info-icon">i</span><div><h2>HR PaySim에 오신 것을 환영합니다.</h2><p>이 도구는 급여 계산기가 아닙니다. 우리 회사의 보상 거버넌스 상태를 진단하고, 보상 의사결정 시나리오를 비교하여 최적의 방향을 찾는 시뮬레이터입니다.</p></div></div><h3 class="section-title">시작 방법을 선택해주세요</h3><div class="mode-grid">${modeCard("hrPrism", ["진단 결과와 핵심 맥락 자동 반영", "빠르게 시나리오 비교로 이동"])}${modeCard("direct", ["필요한 항목만 간단히 입력", "입력 내용을 바로 확인 가능"])}${modeCard("sample", ["모든 단계 미리 체험 가능", "샘플 데이터는 저장되지 않습니다"])}</div><div class="soft-note">${icon("spark")}<span>모든 모드는 이후 단계에서 언제든 변경할 수 있습니다.</span></div></section><aside class="entry-aside"><article class="side-card prism-card"><div class="side-card-head"><h3>HR Prism 연계 정보</h3><span class="muted-icon">i</span></div><p>이 화면은 진단 트리거 이유만 보여줍니다.</p><hr /><strong>트리거 이유</strong>${reasonRow("team", "AI 도입으로 노동 생산성이 크게 개선되었습니다.")}${reasonRow("trend", "비즈니스 가치가 상승했으나 보상이 따라가지 못하고 있습니다.")}${reasonRow("alert", "급여 인상 압력이 커질 수 있습니다.")}</article>${privacyCard("개인 식별 정보 없음", "이 도구는 개인 식별 정보를 수집하지 않습니다. 이름, 이메일, 주민등록번호, 개별 급여 데이터 등은 입력하지 않습니다.")}<button class="wide-link" type="button">연계 정보 자세히 보기 <span>›</span></button></aside></div>`;
}

function renderIntake() {
  return `<p class="screen-intro">회사의 보상 및 조직 정보를 입력해주세요. 입력은 집계 수준으로만 수집되며, 개인 식별 정보는 요청하지 않습니다.</p><div class="content-with-aside"><section class="main-stack"><div class="form-grid">${inputPanel("building", "회사 맥락", [selectField("산업", "산업 선택"), selectField("회사 규모 (국내 기준)", "규모 선택"), selectField("매출 규모 (연간)", "매출 규모 선택"), selectField("사업 성장 단계", "성장 단계 선택")], "정확한 진단을 위해 회사의 일반적인 맥락을 입력해주세요.")}${inputPanel("lock", "현재 보상 구조", [textField("기준 급여 총액 (연간)", "금액 입력", "억원"), textField("변동 보상 총액 (연간)", "금액 입력", "억원"), textField("복리후생 총액 (연간)", "금액 입력", "억원"), textField("성과급 지급 대상 비중", "비중 입력", "%"), textField("PE (기본급 비중)", "비중 입력", "%"), textField("경력직 비중", "비중 입력", "%")], "기본급, 변동 보상, 복리후생 등 전체 보상 구조의 규모와 비중을 입력해주세요.")}${inputPanel("person", "채용 계획", [textField("향후 12개월 채용 인원", "인원 입력", "명"), textField("평균 연봉 (신규 채용)", "금액 입력", "만원"), selectField("주요 채용 직무", "직무 선택"), selectField("채용 시급성", "시급성 선택")], "향후 채용 계획과 주요 직무, 시급성에 대한 정보를 입력해주세요.")}${inputPanel("warning", "예외 보상 신호", [selectField("급여 역전 사례 존재 여부", "선택"), selectField("핵심 인재 이탈 발생 여부", "선택"), selectField("특정 직군 채용 어려움", "선택"), textField("기타 특이사항", "내용 입력 (선택)", "")], "보상 이슈나 시장 압력 등 예외 신호를 알려주시면 진단에 반영됩니다.")}</div><details class="ai-disclosure"><summary>${icon("spark")}<span>선택 입력: AI 도구 맥락</span><small>AI 도구 사용 목적, 자동화 수준, 데이터/시스템 연동 수준 등 AI 관련 정보를 입력하면 추가 인사이트를 제공합니다.</small></summary><div class="disclosure-grid">${selectField("AI 도구 사용 목적", "목적 선택")}${selectField("자동화 수준", "수준 선택")}${textField("월 AI 도구 예산", "금액 입력", "만원")}${selectField("채용 지연 가능성", "가능성 선택")}</div></details></section><aside class="aside-stack">${privacyCard("개인 식별 정보 없음", "HR PaySim은 집계 데이터만 사용합니다. 아래 정보는 수집하지 않습니다.", ["이름, 이메일, 연락처", "주민등록번호, 사번", "개별 급여 데이터", "개인별 평가 정보"])}<article class="side-card blue-tint"><h3>${icon("spark")}입력 팁</h3><p>숫자는 대략적인 범위로 입력해도 진단에 충분히 활용됩니다.</p></article><article class="side-card method-card"><h3>입력 방법</h3>${methodRow("doc", "직접 입력", "화면에서 항목을 직접 입력합니다.")}${methodRow("shield", "기존 가이드 참고", "항목 옆 정보를 참고하여 입력하세요.")}${methodRow("edit", "수정 가능", "다음 단계에서 언제든 수정할 수 있습니다.")}</article></aside></div>`;
}

function renderSummary() {
  return `<div class="content-with-aside"><section class="main-stack"><div class="summary-banner"><span class="round-icon">${icon("doc")}</span><div><h2>${appState.mode === "hrPrism" ? "HR Prism 연계 입력" : modes[appState.mode].label}</h2><p>입력하신 내용을 요약했습니다. HR PaySim이 다시 계산합니다.</p></div><button class="outline-button" type="button" data-step="0">모드 변경</button></div><p class="caption-line">ⓘ 샘플 데이터 미리보기 라벨은 샘플 데이터로 본 경우에만 표시됩니다.</p><div class="stat-grid five">${statCard("team", "전체 인원", "1,248명", "+148명 YoY")}${statCard("person", "채용 계획", "120명", "다음 12개월")}${statCard("trend", "예외 인상", "8명", "0.64% of 전체 인원")}${statCard("alert", "역전 구간", "2개", "역전 케이스 14개")}${statCard("chip", "AI 도구 맥락", "제공됨", "생산성 보조/자동화")}</div><div class="summary-lower"><article class="panel confidence-card"><h3>입력 신뢰도 & 완전성</h3><div class="progress-row"><span class="progress-track"><span style="width:86%"></span></span><strong>86%</strong></div><div class="confidence-columns"><div><small>데이터 충분성</small><strong>높음</strong></div><div><small>일관성</small><strong>높음</strong></div><div><small>누락 항목</small><strong>경미</strong></div></div><p>집계 데이터 기준으로 계산된 지표입니다.</p></article><article class="panel understood-card"><h3>HR PaySim이 이해한 내용</h3>${checkRow("회사 컨텍스트", "회사 규모, 사업 모델, 지역, 성장 단계")}${checkRow("전체 인원", "현재 인원 및 조직 규모 정보")}${checkRow("채용 계획", "다음 12개월 채용 계획")}${checkRow("예외 인상 범위", "예외 인상 인원 및 비율")}${checkRow("역전 구간 정보", "역전 구간 및 역전 케이스 수")}${checkRow("AI 도구 맥락", "AI 도구 유형 및 생산성 보조/자동화 맥락")}</article></div><div class="soft-note shield-note">${icon("shield")}<span>입력하신 정보는 진단 목적으로만 사용되며, 안전하게 보호됩니다.</span></div></section><aside class="aside-stack"><article class="side-card"><h3>${icon("clock")}이전 단계에서 달라진 점</h3><strong>변경된 항목 (2)</strong><ul><li>예외 인상 인원: 6명 → 8명</li><li>은행권 비중: 10% → 12%</li></ul><strong>유지된 항목 (8)</strong><ul><li>전체 인원: 1,248명</li><li>채용 계획: 120명</li><li>경력직 비중: 42%</li></ul></article>${privacyCard("개인 식별 정보 없음", "HR PaySim은 개인 식별 정보를 수집하지 않습니다. 이름, 이메일, 주민등록번호, 개별 급여 데이터 등")}<button class="primary-button full" type="button" data-action="next-inline">이 내용으로 진단 보기 →</button><button class="text-button" type="button" data-step="1">← 이전 단계로 돌아가기</button></aside></div>`;
}

function renderDiagnosis() {
  return `<p class="screen-intro">입력 데이터를 바탕으로 현재 보상 거버넌스 상태를 진단하고, 핵심 이슈와 다음 질문을 제안합니다.</p><div class="content-with-aside"><section class="main-stack"><article class="panel snapshot-card"><h3>현재 보상 거버넌스 스냅샷</h3><div class="metric-row">${heroMetric()}${metricCard("CED (예외 누적 수준)", "72", "/100", "높음", "이전 대비 +8 ↑", gaugeMini(72))}${riskMetric()}${payrollMetric()}</div><p class="source-line">진단 기준: HR PaySim 내부 보상 거버넌스 규칙(샘플)</p></article><article class="panel scenario-preview"><h3>추천 시나리오 미리보기 <small>(상위 추천)</small></h3><div class="preview-grid">${previewCard("1순위", "trend", "현재 상태 유지", "지금 바로 조정하지 않는 선택지입니다.", "0원", "추가 비용")}${previewCard("2순위", "target", "급여 역전 해소", "역전 구간을 해소해 내부 설명 가능성을 높입니다.", "+1.8억", "연간 추가 비용")}${previewCard("3순위", "layers", "연봉 밴드 재설계", "역할/레벨 기준을 명확히 하여 일관성을 높입니다.", "+2.6억", "연간 추가 비용")} ${previewCard("4순위", "chart", "급여 총액 예측", "채용 계획과 급여 예산의 중장기 영향을 확인합니다.", "낮음", "비용 영향")}<article class="mini-preview muted"><span>${icon("list")}</span><strong>다른 안도 보기</strong><p>AI 도구 + 채용 속도 조정 등 다른 시나리오도 확인할 수 있습니다.</p><button class="outline-button" type="button" data-action="next-inline">전체 보기</button></article></div></article><article class="panel comparison-preview"><h3>의사결정 비교 미리보기 <small>(예시)</small></h3><div class="tiny-table"><span>안</span><span>연간 비용 영향</span><span>CEI 변화</span><span>CED 변화</span><span>얻는 것</span><span>감수할 것</span><strong>현재 상태 유지</strong><span>0원</span><span class="delta down">-2 ↓</span><span class="delta up">+5 ↑</span><span>단기 비용 부담 없음</span><span>설명 어려움이 누적될 수 있음</span></div></article></section><aside class="aside-stack"><article class="side-card expert-card"><h3>${icon("spark")}전문가 해석</h3>${insight("chat", "현재 문제는 보상 수준보다 보상 설명 가능성에 있을 수 있습니다.")}${insight("alert", "예외 인상은 한 번이면 유연한 대응이지만, 반복되면 설명하기 어려워질 수 있습니다.")}${insight("team", "신규 입사자 보상이 기존 구성원보다 높아지는 구간이 있어 내부 설명이 어려워질 수 있습니다.")}</article><article class="side-card decision-question"><span class="question-dot">?</span><h3>다음으로 답해야 할 질문</h3><h2>어떤 보상 의사결정안을 먼저 비교해봐야 할까요?</h2><p>지금 진단 결과를 기준으로 가장 영향이 큰 의사결정안부터 비교해볼 수 있습니다.</p><button class="primary-button full" type="button" data-action="next-inline">추천 시나리오 보기 →</button></article></aside></div>`;
}

function renderScenarios() {
  return `<div class="content-with-aside"><section class="main-stack"><div class="info-banner">${icon("spark")}<div><h2>지금 바로 조정하지 않는 것도 하나의 선택입니다.</h2><p>비용과 리스크, 실행 난이도 관점에서 먼저 비교해 볼 만한 시나리오만 추천했습니다.</p></div></div><div class="scenario-list">${scenarioRow("current", "trend", "현재 상태 유지", "기준 시나리오", ["보상 구조를 그대로 유지하여 단기 비용과 조직 혼선을 최소화합니다.", "내부 운영 안정성을 우선 고려할 때 비교 기준이 됩니다."])}${scenarioRow("inversion", "target", "급여 역전 해소", "우선 추천", ["핵심 직무의 역전 리스크를 완화하여 인재 이탈과 내부 불만을 줄입니다.", "조기에 대응할수록 인력·채용 비용과 조직 영향이 낮아집니다."])}${scenarioRow("band", "layers", "연봉 밴드 재설계", "우선 추천", ["역할/레벨 기준의 보상 체계를 정비하여 공정성과 일관성을 높입니다.", "향후 채용·승진·보상 운영의 예측 가능성을 개선합니다."])}${scenarioRow("forecast", "chart", "급여 총액 예측", "보조 추천", ["향후 1~3년간의 보상 총액 변화를 예측하여 예산 계획을 지원합니다.", "다른 시나리오와 함께 중장기 보상 투자 여력을 비교할 수 있습니다."])}</div><button class="wide-link" type="button">다른 안도 보기 <span>›</span></button></section><aside class="aside-stack"><article class="side-card"><div class="side-card-head"><h3>추천 기준 설명</h3><span class="muted-icon">i</span></div><p>이 추천은 현재 입력값과 HR PaySim V3 샘플 규칙을 기준으로 자동 정렬된 예시입니다.</p><hr /><strong>주요 기준</strong><ul><li>CEI (보상 설명 가능성)</li><li>CED (예외 누적 수준)</li><li>급여 역전 위험</li><li>연간 급여 총액 변화</li><li>회사 성장 계획 및 구조적 요인</li></ul></article><article class="side-card"><h3>추천 임계값 (요약)</h3><div class="threshold-table"><span>CEI &lt; 60점</span><span>설명 가능성 부족</span><span>CED ≥ 60점</span><span>예외 누적 심화</span><span>급여 역전 위험 ≥ 중간</span><span>시급성 증가</span><span>연간 급여 총액 변화 ≥ +10%</span><span>비용 영향 큼</span></div></article><article class="side-card blue-tint"><h3>${icon("shield")}안내</h3><p>비용과 리스크, 실행 난이도를 종합해 먼저 비교할 만한 시나리오만 제안합니다. 필요 시 언제든 다른 조합을 확인할 수 있습니다.</p></article></aside></div>`;
}

function renderAiCheck() {
  return `<div class="content-with-aside"><section class="main-stack"><div class="info-banner">${icon("info")}<div><h2>채용 계획과 AI 도구 맥락이 있어 추가 확인을 엽니다.</h2><p>보상 의사결정을 더 정교하게 하기 위한 두 가지 관점을 함께 검토합니다.</p></div></div>${aiSection("1", "채용을 늦춰도 되는지 검토합니다", "계획된 채용 일부를 3~6개월 늦추는 경우를 점검합니다.", hiringBars(), ["일정 조정 시 단기 비용 부담 완화", "핵심 업무 영향과 리스크 점검", "회복 시점과 우선순위 재정렬"])}${aiSection("2", "senior 보상 재배분", "여러 업무를 조율하는 senior에게 보상을 더 배분하는 안을 검토합니다.", seniorDiagram(), ["조율·의사결정 역할 강화", "실행 속도와 품질 향상 기대", "보상 구조의 전략적 일치"])}<div class="soft-note">${icon("team")}<strong>사람을 덜 뽑자는 것이 아닙니다.</strong><span>회사의 상황과 전략에 맞게, 시점과 보상 배분을 유연하게 조정할 수 있는지 확인하는 단계입니다.</span></div></section><aside class="aside-stack"><article class="side-card"><h3>이 단계의 범위</h3><p>채용을 늦춰도 되는지, 기존 핵심 인력 보강으로 대응할 수 있는지 봅니다.</p><hr /><strong>주요 점검 포인트</strong>${methodRow("team", "단기 비용 완화", "채용 일정 조정으로 비용 부담을 완화할 수 있습니다.")}${methodRow("shield", "핵심 인력 강화", "기존 인력의 역할과 보상을 조정해 실행력을 높일 수 있습니다.")}${methodRow("trend", "전략적 일치", "조직 목표와 보상 구조가 일치하는지 점검합니다.")}</article><article class="side-card blue-tint"><h3>기타 안내</h3><p>개인 식별 정보나 민감 정보는 수집하지 않으며, 입력 내용은 분석 목적으로만 사용됩니다.</p></article><button class="wide-link" type="button">AI 도구 맥락 이해하기 <span>→</span></button></aside></div>`;
}

function renderComparison() {
  return `<div class="content-with-aside"><section class="main-stack"><div class="info-banner">${icon("info")}<div><h2>가장 비용이 낮은 안이 항상 가장 좋은 안은 아닙니다.</h2><p>선택한 보상 의사결정들을 기준 시나리오와 비교하여, 얻는 것과 감수할 것을 함께 확인합니다.</p></div><button class="outline-button" type="button" data-action="next-inline">메모 미리보기</button></div><article class="matrix-card"><div class="comparison-matrix"><div class="matrix-head empty"></div><div class="matrix-head">기준선<br /><small>(Baseline)</small></div><div class="matrix-head">${icon("shield")}현재 상태 유지</div><div class="matrix-head">${icon("layers")}연봉 밴드 재설계</div><div class="matrix-head">${icon("team")}채용 지연 + AI 도구</div>${matrixRow("연간 비용 변화", "(기준 대비)", "—", "0원|0%", "+42.8억 원|+12.4%", "-18.7억 원|-5.4%")}${matrixRow("월 burn 변화", "(기준 대비)", "—", "0원|0%", "+3.6억 원|+12.6%", "+1.6억 원|-5.6%")}${matrixRow("CEI 변화", "(보상 수준 안정)", "58/100", "58 → 56|-2", "58 → 72|+14", "58 → 64|+6")}${matrixRow("CED 변화", "(보상수준 효율)", "72/100", "72 → 76|+4", "72 → 54|-18", "72 → 62|-10")}${matrixRow("역전 케이스 변화", "(명)", "12명", "12명 → 14명|+2", "12명 → 4명|-8", "12명 → 7명|-5")}${matrixRow("실행 난이도", "", "보통", "보통", "쉬움", "어려움")}${matrixRow("커뮤니케이션 난이도", "", "보통", "보통", "쉬움", "어려움")}</div></article><article class="gain-loss-card"><div class="gain-loss-row"><strong>${icon("thumb")}얻는 것</strong><ul><li>안정적인 운영 지속</li><li>리스크 변화 없음</li></ul><ul><li>보상 구조의 공정성 개선</li><li>핵심 인재 이탈 리스크 완화</li></ul><ul><li>비용 부담 완화</li><li>핵심 인재에 보상 집중</li></ul></div><div class="gain-loss-row"><strong>${icon("alert")}감수할 것</strong><ul><li>구조적 이슈 해결 지연</li><li>역전 리스크 지속</li></ul><ul><li>단기 비용 증가</li><li>임직원 커뮤니케이션 필요</li></ul><ul><li>채용 공백으로 업무 지연 가능</li><li>조직/역할 변화 관리 필요</li></ul></div></article></section><aside class="aside-stack"><article class="side-card"><h3>대표 관점 해석</h3>${methodRow("coin", "비용 관점", "채용 지연 + AI 도구가 비용 부담을 가장 줄입니다. 연봉 밴드 재설계는 단기 비용이 가장 크게 증가합니다.")}${methodRow("shield", "리스크 관점", "연봉 밴드 재설계가 보상 구조 안정화와 역전 리스크 완화에 가장 효과적입니다.")}${methodRow("team", "실행 관점", "현재 상태 유지는 실행이 쉽고, AI 도구 안은 실행/소통 난이도가 모두 높습니다.")}</article><article class="side-card callout"><h3>추천 다음 결정</h3><p>비교 결과를 바탕으로, 조직이 더 중요하게 보는 관점을 기준으로 최종 안을 선택하세요.</p><button class="primary-button full" type="button" data-action="next-inline">선택한 안으로 메모 작성 →</button><button class="secondary-button full" type="button" data-step="4">추천 시나리오로 돌아가기</button></article></aside></div>`;
}

function renderMemo() {
  return `<p class="screen-intro">선택한 의사결정의 핵심 요약을 확인하고, 다음 단계 행동을 정의하세요.</p><div class="content-with-aside"><section class="main-stack">${appState.memoSaved ? '<div class="save-toast">✓ 메모 초안이 저장되었습니다. 현재 브라우저 세션에서 저장 상태로 표시됩니다.</div>' : ""}<article class="memo-summary panel"><span class="round-icon">${icon("layers")}</span><div><small>선택한 시나리오</small><h2>연봉 밴드 재설계 <em>우선 추천</em></h2><p>비교에서 선택됨</p></div><div><small>신뢰도 (의사결정 기준)</small><strong>72%</strong><em>보통</em><p>입력 신뢰도 기반</p></div><div><small>비교 기준일</small><strong>2025. 08. 17</strong><p>August 2025</p></div></article><article class="memo-preview panel">${memoRow("info", "현재 이슈", ["신규 입사자 보상이 기존 구성원보다 높아지는 구간이 발생하고 있습니다.", "전체 보상 수준은 양호하나, 내부 공정성 인식이 하락 중입니다."])}${memoChoiceRow()}${memoRow("trend", "얻는 것", ["보상 구조 공정성 개선", "밴드 구조 정합성 향상", "장기적 보상 경쟁력 강화", "핵심 인재 이탈 리스크 완화"])}${memoRow("alert", "감수할 것", ["단기 비용 증가", "밴드 구조 및 정책 변경 관리 필요", "일부 인력의 보상 인상 폭 제한", "일괄 커뮤니케이션 집중 필요"])}${memoRow("question", "다음 질문", ["밴드 재설계의 구체 범위와 속도는 어떻게 설정할까요?", "핵심 직무 대상 우선 적용 기준은 무엇으로 할까요?", "변경 커뮤니케이션은 어떤 메시지와 타이밍이 적절할까요?", "보상 예산 여력 범위 내에서 단계 실행이 가능할까요?"])}<div class="soft-note">${icon("info")}<span>이 내용은 의사결정 참고용 핵심 쟁점 preview입니다. 필요 시 수정하여 활용하세요.</span></div></article></section><aside class="aside-stack"><article class="side-card"><h2>정식 메모가 아닙니다.</h2><p>핵심 쟁점 preview입니다.</p>${methodRow("chat", "핵심을 요약합니다", "진단, 비교 결과와 선택 이유의 핵심만 담았습니다.")}${methodRow("team", "공유에 활용하세요", "팀 내부 논의 및 이해관계자 커뮤니케이션에 활용할 수 있습니다.")}${methodRow("doc", "수정하여 사용하세요", "필요하다면 문구를 보완하고 메모 초안으로 저장하세요.")}</article><article class="side-card blue-tint"><h3>메모에 포함된 항목</h3>${checkRow("선택한 시나리오 요약", "")}${checkRow("진단 기반 이슈", "")}${checkRow("비교 결과 핵심 차이", "")}${checkRow("얻는 것과 감수할 것", "")}${checkRow("다음에 답해야 할 질문", "")}</article></aside></div>`;
}

function modeCard(key, bullets) {
  const mode = modes[key];
  const selected = appState.mode === key;
  return `<article class="mode-card ${selected ? "is-selected" : ""}"><span class="round-icon">${icon(mode.icon)}</span><h3>${mode.label}</h3><p>${mode.description}</p><ul>${bullets.map((item) => `<li>${icon("check")}${item}</li>`).join("")}</ul><button class="primary-button full" type="button" data-mode="${key}">${mode.button}</button></article>`;
}

function inputPanel(iconName, title, fields, helper) {
  return `<article class="form-panel"><h3>${icon(iconName)}${title}</h3><div class="field-grid">${fields.join("")}</div><div class="helper-line">ⓘ ${helper}</div></article>`;
}

function textField(label, placeholder, suffix) {
  const numeric = Boolean(suffix) || /인원|금액|비중|총액|연봉|예산|PE/.test(label);
  const type = numeric ? "number" : "text";
  const attrs = numeric ? 'inputmode="decimal" min="0" step="any"' : 'maxlength="120" data-free-text="true"';
  return `<label class="field"><span>${label}</span><span class="field-wrap"><input class="field-control" type="${type}" ${attrs} placeholder="${placeholder}" />${suffix ? `<small>${suffix}</small>` : ""}</span><em class="field-warning" aria-live="polite"></em></label>`;
}

function selectField(label, placeholder) {
  const options = getSelectOptions(label);
  return `<label class="field"><span>${label}</span><span class="field-wrap"><select class="field-control"><option value="">${placeholder}</option>${options.map((option) => `<option>${option}</option>`).join("")}</select></span><em class="field-warning" aria-live="polite"></em></label>`;
}

function getSelectOptions(label) {
  if (label.includes("산업")) return ["SaaS/IT", "제조", "커머스", "금융", "헬스케어"];
  if (label.includes("회사 규모")) return ["50명 미만", "50~199명", "200~499명", "500명 이상"];
  if (label.includes("매출")) return ["50억 미만", "50~200억", "200~500억", "500억 이상"];
  if (label.includes("성장")) return ["초기", "성장 단계 1", "성장 단계 2", "확장 단계"];
  if (label.includes("직무")) return ["제품/엔지니어링", "영업/마케팅", "운영", "전사 혼합"];
  if (label.includes("시급성")) return ["낮음", "중간", "높음", "즉시 필요"];
  if (label.includes("존재") || label.includes("발생") || label.includes("어려움")) return ["없음", "일부 있음", "명확히 있음", "확인 필요"];
  if (label.includes("AI 도구 사용 목적")) return ["생산성 보조", "자동화", "의사결정 지원", "고객/운영 지원"];
  if (label.includes("자동화 수준")) return ["낮음", "중간", "높음"];
  if (label.includes("채용 지연")) return ["불가", "일부 가능", "3~6개월 가능", "추가 검토 필요"];
  return ["낮음", "중간", "높음"];
}

function privacyCard(title, copy, list = []) {
  return `<article class="side-card privacy-card"><h3>${icon("shield")}${title}</h3><p>${copy}</p>${list.length ? `<ul>${list.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}</article>`;
}

function statCard(iconName, label, value, note) {
  return `<article class="stat-card"><span>${icon(iconName)}</span><h3>${label}</h3><strong>${value}</strong><p>${note}</p></article>`;
}

function heroMetric() {
  return `<article class="metric-card hero"><div class="metric-title">CEI (보상 설명 가능성) ${icon("info")}</div><div class="hero-gauge"><svg viewBox="0 0 180 124" aria-label="CEI 58점"><defs><linearGradient id="ceiGaugeGradient" x1="28" y1="108" x2="148" y2="26" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff" stop-opacity="0.96"/><stop offset="0.58" stop-color="#d7e8ff" stop-opacity="0.92"/><stop offset="1" stop-color="#8fc2ff" stop-opacity="0.82"/></linearGradient></defs><path class="gauge-shadow" d="M32 96A58 58 0 0 1 148 96"/><path class="gauge-fill" d="M32 96A58 58 0 0 1 122 45"/><text x="90" y="83" text-anchor="middle">58</text><text x="90" y="106" text-anchor="middle">/100</text></svg></div><em>보통</em><p><span class="delta down">이전 대비 -4 ↓</span></p></article>`;
}

function metricCard(title, value, suffix, badge, delta, visual) {
  return `<article class="metric-card"><div class="metric-title">${title} ${icon("info")}</div>${visual}<strong>${value}<small>${suffix}</small></strong><em>${badge}</em><p>${delta}</p></article>`;
}

function riskMetric() {
  return `<article class="metric-card"><div class="metric-title">급여 역전 위험 ${icon("info")}</div><strong class="risk-word">중간</strong><p>발생 케이스 12건</p><div class="risk-list"><span><i></i>심각 2</span><span><i></i>중간 10</span><span><i></i>경미 8</span><span><i></i>정상 30</span></div></article>`;
}

function payrollMetric() {
  return `<article class="metric-card"><div class="metric-title">연간 급여 총액 (기준) ${icon("info")}</div><strong>₩ 42.8억</strong><p>전년 대비 <b>+12.4%</b></p>${lineChart()}</article>`;
}

function gaugeMini(value) {
  return `<div class="gauge mini-svg" style="--score:${value}"><svg viewBox="0 0 150 150" aria-label="${value}점"><circle class="gauge-ring" cx="75" cy="75" r="54"></circle><circle class="gauge-value" cx="75" cy="75" r="54" pathLength="100" stroke-dasharray="${value} 100"></circle><text x="75" y="84" text-anchor="middle">${value}</text></svg></div>`;
}

function previewCard(rank, iconName, title, copy, value, unit) {
  return `<article class="mini-preview"><span class="rank">${rank}</span><span class="preview-icon">${icon(iconName)}</span><strong>${title}</strong><p>${copy}</p><em>${value}<small>${unit}</small></em></article>`;
}

function scenarioRow(key, iconName, title, badge, reasons) {
  const selected = appState.selectedScenario === key;
  return `<article class="scenario-row ${selected ? "is-selected" : ""}"><span class="round-icon">${icon(iconName)}</span><div><h3>${title} <em>${badge}</em></h3><strong>먼저 보는 이유</strong><ul>${reasons.map((item) => `<li>${item}</li>`).join("")}</ul></div><button class="outline-button" type="button" data-scenario="${key}">${selected ? "비교에 담김" : "비교에 담기"}</button></article>`;
}

function aiSection(number, title, copy, visual, bullets) {
  return `<article class="ai-section panel"><header><span>${number}</span><div><h3>${title}</h3><p>${copy}</p></div><button class="outline-button" type="button">자세히 보기</button></header><div class="ai-body"><div class="ai-how"><strong>${icon("bulb")}이렇게 봅니다</strong><ul>${bullets.map((item) => `<li>${item}</li>`).join("")}</ul></div><div class="ai-visual">${visual}</div></div><div class="helper-line">ⓘ 모든 역할을 낮추는 것이 아니라, 업무 영향과 조정 가능성이 낮은 영역부터 점검합니다.</div></article>`;
}

function matrixRow(label, sub, baseline, current, band, ai) {
  return `<div class="matrix-label"><strong>${label}</strong><small>${sub}</small></div>${matrixCell(baseline)}${matrixCell(current)}${matrixCell(band, true)}${matrixCell(ai)}`;
}

function matrixCell(value, bars = false) {
  const [main, sub] = value.split("|");
  const trimmedSub = sub?.trim() || "";
  const deltaType = trimmedSub.startsWith("-") ? "down" : trimmedSub.startsWith("+") ? "up" : "";
  const hasScoreChange = /\d+\s*→\s*\d+/.test(main) || /\d+\/100/.test(main);
  const hasAmountBars = bars || /억|명/.test(main);
  const hasDifficultyBars = /보통|쉬움|어려움/.test(main);
  return `<div class="matrix-cell"><strong>${main}</strong>${trimmedSub ? `<small class="delta ${deltaType}">${trimmedSub}</small>` : ""}${hasScoreChange ? scoreTrack(main) : ""}${hasAmountBars ? `<span class="micro-bars ${bars ? "blue-bars" : "muted-bars"}"><i></i><i></i><i></i><i></i></span>` : ""}${hasDifficultyBars ? difficultyBars(main) : ""}</div>`;
}

function difficultyBars(value) {
  const level = value === "어려움" ? "hard" : value === "쉬움" ? "easy" : "normal";
  return `<span class="difficulty-bars ${level}"><i></i><i></i><i></i></span>`;
}

function scoreTrack(value) {
  const numbers = value.match(/\d+/g)?.map(Number) || [];
  const end = Math.min(100, numbers.at(-1) || 58);
  return `<span class="score-track"><i style="width:${end}%"></i></span>`;
}

function memoChoiceRow() {
  return `<section class="memo-row"><span class="round-icon">${icon("scale")}</span><h3>먼저 비교한 안</h3><div class="choice-options"><button>현재 상태 유지<br /><small>기준 시나리오</small></button><button class="is-selected">연봉 밴드 재설계 ${icon("check")}<br /><small>선택됨</small></button><button>채용 지연 + AI 도구<br /><small>비교 안</small></button></div></section>`;
}

function memoRow(iconName, title, items) {
  return `<section class="memo-row"><span class="round-icon">${icon(iconName)}</span><h3>${title}</h3><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></section>`;
}

function checkRow(title, copy) {
  return `<div class="check-row">${icon("check")}<div><strong>${title}</strong>${copy ? `<p>${copy}</p>` : ""}</div></div>`;
}

function insight(iconName, copy) {
  return `<div class="insight-row"><span>${icon(iconName)}</span><p>${copy}</p></div>`;
}

function reasonRow(iconName, copy) {
  return `<div class="reason-row"><span>${icon(iconName)}</span><p>${copy}</p></div>`;
}

function methodRow(iconName, title, copy) {
  return `<div class="method-row"><span>${icon(iconName)}</span><div><strong>${title}</strong><p>${copy}</p></div></div>`;
}

function hiringBars() {
  return `<div class="bar-chart"><div class="legend"><span><i></i>기존 계획</span><span><i></i>3~6개월 지연 시</span></div>${["제품", "마케팅", "디자인", "운영", "기타"].map((label, index) => `<div class="bar-pair"><small>${label}</small><span style="height:${40 - index * 3}px"></span><b style="height:${30 - index * 3}px"></b></div>`).join("")}</div>`;
}

function seniorDiagram() {
  return `<div class="senior-diagram"><div class="role-card">실행 중심 역할<br /><small>(집행·전문)</small></div><div class="role-card">조율 중심 역할<br /><small>(기획·조율·의사결정)</small></div><span class="redistribution-arrow top"><svg viewBox="0 0 100 42" aria-hidden="true"><path d="M4 24 C32 6 62 6 92 24"/><path d="M84 14 94 24 80 27"/></svg></span><strong>Senior /<br />조율 역할</strong><span class="redistribution-arrow bottom"><svg viewBox="0 0 100 42" aria-hidden="true"><path d="M4 18 C32 36 62 36 92 18"/><path d="M80 15 94 18 84 29"/></svg></span><div class="role-card result">성과 및 조직<br />레버리지 확대</div></div>`;
}

function lineChart() {
  return `<svg class="line-chart" viewBox="0 0 180 86" aria-label="급여 총액 추이"><g stroke="#E6EAF0"><line x1="12" y1="18" x2="170" y2="18"/><line x1="12" y1="42" x2="170" y2="42"/><line x1="12" y1="66" x2="170" y2="66"/></g><path d="M14 64 L36 50 L52 42 L72 52 L92 44 L110 38 L132 28 L154 31 L170 20" fill="none" stroke="#2F7CF6" stroke-width="3"/><g fill="#2F7CF6"><circle cx="14" cy="64" r="3"/><circle cx="36" cy="50" r="3"/><circle cx="52" cy="42" r="3"/><circle cx="72" cy="52" r="3"/><circle cx="92" cy="44" r="3"/><circle cx="110" cy="38" r="3"/><circle cx="132" cy="28" r="3"/><circle cx="154" cy="31" r="3"/><circle cx="170" cy="20" r="3"/></g></svg>`;
}

function icon(name) {
  const paths = {
    info: '<circle cx="12" cy="12" r="9"></circle><path d="M12 10v6M12 7.5h.01"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    building: '<path d="M4 21h16M6 21V6h10v15M9 10h1M12 10h1M9 14h1M12 14h1"></path>',
    edit: '<path d="M4 20h16M6 16 16.5 5.5l2 2L8 18l-3 1 1-3Z"></path>',
    chart: '<path d="M5 19V9M11 19V5M17 19v-8M4 19h16"></path>',
    spark: '<path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3Z"></path>',
    bulb: '<path d="M9 18h6M10 21h4M8 13a5 5 0 1 1 8 0c-.9 1-1.5 2-1.8 3H9.8C9.5 15 8.9 14 8 13Z"></path><path d="M12 2v2M4.9 4.9l1.4 1.4M19.1 4.9l-1.4 1.4"></path>',
    team: '<path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 20c.8-4 3-6 5-6s4.2 2 5 6M13 16c.7-2 1.8-3 3-3 1.8 0 3.6 1.8 4.2 5"></path>',
    trend: '<path d="M4 16 9 11l4 4 7-8M15 7h5v5"></path>',
    alert: '<path d="M12 4 21 20H3L12 4Z"></path><path d="M12 9v5M12 17h.01"></path>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V8a4 4 0 0 1 8 0v2"></path>',
    person: '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c1.2-4.5 4-6.5 8-6.5s6.8 2 8 6.5"></path>',
    warning: '<path d="M12 4 21 20H3L12 4Z"></path><path d="M12 9v5M12 17h.01"></path>',
    shield: '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"></path><path d="m8.5 12 2.2 2.2 4.8-5"></path>',
    doc: '<path d="M6 3h8l4 4v14H6V3Z"></path><path d="M14 3v5h5M9 13h6M9 17h6"></path>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="2"></rect><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"></path>',
    clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
    chat: '<path d="M5 6h14v10H9l-4 4V6Z"></path><path d="M9 10h6M9 13h4"></path>',
    target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>',
    layers: '<path d="m12 4 9 5-9 5-9-5 9-5Z"></path><path d="m3 14 9 5 9-5"></path>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"></path>',
    coin: '<circle cx="12" cy="12" r="8"></circle><path d="M12 7v10M9 10c0-1.5 6-1.5 6 0s-6 1.5-6 3 6 1.5 6 0"></path>',
    thumb: '<path d="M7 10v10H4V10h3ZM7 10l5-6 1 1v5h6c1 0 2 1 1.7 2l-1.2 6c-.2 1-1 2-2.3 2H7"></path>',
    scale: '<path d="M12 4v16M5 7h14M7 7l-4 7h8L7 7ZM17 7l-4 7h8l-4-7Z"></path>',
    question: '<circle cx="12" cy="12" r="9"></circle><path d="M9.8 9a2.4 2.4 0 1 1 3.6 2.1c-.9.5-1.4 1-1.4 2.1M12 17h.01"></path>',
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.info}</svg>`;
}

document.addEventListener("click", (event) => {
  const stepButton = event.target.closest("[data-step]");
  if (stepButton) {
    setStep(Number(stepButton.dataset.step));
    return;
  }

  const modeButton = event.target.closest("[data-mode]");
  if (modeButton) {
    appState.mode = modeButton.dataset.mode;
    appState.highestUnlocked = Math.max(appState.highestUnlocked, 1);
    appState.currentStep = 1;
    render();
    return;
  }

  const scenarioButton = event.target.closest("[data-scenario]");
  if (scenarioButton) {
    appState.selectedScenario = scenarioButton.dataset.scenario;
    appState.highestUnlocked = Math.max(appState.highestUnlocked, 6);
    render();
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  if (action === "next" || action === "next-inline") completeAndGoNext();
  if (action === "back") setStep(appState.currentStep - 1);
  if (action === "reset") {
    appState.currentStep = 0;
    appState.highestUnlocked = 0;
    appState.mode = "hrPrism";
    appState.selectedScenario = "band";
    appState.editedFields = 0;
    appState.memoSaved = false;
    appState.inputWarning = "";
    appState.staleSteps.clear();
    render();
  }
  if (action === "mark-stale") {
    appState.highestUnlocked = Math.max(appState.highestUnlocked, 6);
    markStaleFrom(4);
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches(".field-control")) {
    appState.editedFields += 1;
    validateAggregateInput(event.target);
    markStaleFrom(2);
  }
});

function validateAggregateInput(control) {
  const field = control.closest(".field");
  const warning = field?.querySelector(".field-warning");
  const value = String(control.value || "").trim();
  let message = "";

  if (control.type === "number" && value !== "" && Number(value) < 0) {
    message = "음수 값은 사용할 수 없습니다.";
  }

  if (!message && /(@|010-?\d{4}-?\d{4}|\d{6}-[1-4]\d{6}|주민등록|이메일|전화번호|사번)/.test(value)) {
    message = "개인 식별 정보는 입력하지 마세요. 집계값만 사용합니다.";
  }

  field?.classList.toggle("is-invalid", Boolean(message));
  if (warning) warning.textContent = message;
  appState.inputWarning = message;
  updateChrome();
}

render();
