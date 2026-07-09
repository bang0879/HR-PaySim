import { useEffect, useMemo, useRef, useState } from "react";
import { createAggregateLogPayload, type AggregateConsentState } from "../../lib/hr-paysim/consent.ts";
import { getInterpretation } from "../../lib/hr-paysim/copy.ts";
import { createPrototypeMemoPreviewText } from "../../lib/hr-paysim/memo.ts";
import { PAY_SIM_STEPS } from "../../routes/hr-paysim/stepRegistry.ts";
import {
  allScenarioMeta,
  bandLabel,
  createPrototypePresentation,
  formatPercent,
  formatWonEok,
  prototypeSampleForm,
  scenarioKeyToScenarioId,
  scenarioMetaForId,
  severityLabel,
  type PrototypeFormState,
  type PrototypeMode,
  type PrototypePresentation,
  type PrototypeScenarioKey,
  type ScenarioMeta,
} from "../../lib/hr-paysim/prototypeViewModel.ts";

const steps = PAY_SIM_STEPS;

const modes: Record<PrototypeMode, { label: string; shortLabel: string; description: string; button: string; icon: string }> = {
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

const controlTexts = [
  "시작 방법을 선택하면 입력 단계로 이동합니다.",
  "집계 수준의 회사 보상 정보를 입력합니다.",
  "입력한 내용이 진단에 충분한지 확인합니다.",
  "현재 보상 거버넌스 상태를 계산값으로 확인합니다.",
  "진단 신호가 의미하는 결정 질문을 해석합니다.",
  "먼저 비교할 만한 시나리오를 선택합니다.",
  "AI 도구 맥락이 보상 의사결정에 주는 영향을 점검합니다.",
  "얻는 것과 감수할 것을 같은 표에서 비교합니다.",
  "공식 문서가 아닌 핵심 쟁점 preview로 마무리합니다.",
];

const routeIndex = new Map(steps.map((step, index) => [step.route, index]));

type MemoCopyStatus = "idle" | "copied" | "fallback";

const PROTOTYPE_SESSION_STORAGE_KEY = "hr-paysim-prototype-session-v1";

interface PrototypeStoredSession {
  currentStep: number;
  highestUnlocked: number;
  mode: PrototypeMode;
  form: PrototypeFormState;
  selectedScenarioKey: PrototypeScenarioKey;
  staleSteps: number[];
  memoSaved: boolean;
  consent: AggregateConsentState;
}

export function PrototypePaySimApp() {
  const shellRef = useRef<HTMLDivElement>(null);
  const initialSessionRef = useRef<PrototypeStoredSession | null | undefined>(undefined);
  if (initialSessionRef.current === undefined) initialSessionRef.current = loadPrototypeStoredSession();
  const initialSession = initialSessionRef.current;
  const initialRouteStep = guardedStepFromPath(window.location.pathname, initialSession?.highestUnlocked ?? 0);
  const [currentStep, setCurrentStep] = useState(initialRouteStep);
  const [highestUnlocked, setHighestUnlocked] = useState(() => Math.max(initialRouteStep, initialSession?.highestUnlocked ?? 0));
  const [mode, setMode] = useState<PrototypeMode>(initialSession?.mode ?? "hrPrism");
  const [form, setForm] = useState<PrototypeFormState>(initialSession?.form ?? prototypeSampleForm);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<PrototypeScenarioKey>(initialSession?.selectedScenarioKey ?? "band");
  const [staleSteps, setStaleSteps] = useState<number[]>(initialSession?.staleSteps ?? []);
  const [memoSaved, setMemoSaved] = useState(initialSession?.memoSaved ?? false);
  const [memoCopyStatus, setMemoCopyStatus] = useState<MemoCopyStatus>("idle");
  const [consent, setConsent] = useState<AggregateConsentState>(
    initialSession?.consent ?? {
      consentForAggregateAnalysis: false,
      allowCompanyName: false,
      companyName: "",
    },
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const presentation = useMemo(
    () => createPrototypePresentation({ form, mode, selectedScenarioKey }),
    [form, mode, selectedScenarioKey],
  );
  const aggregatePayload = useMemo(
    () => createAggregateLogPayload(consent, presentation.input, new Date()),
    [consent, presentation.input],
  );
  const screenHtml = useMemo(
    () =>
      screenHeader(currentStep) +
      renderScreen(currentStep, {
        mode,
        form,
        presentation,
        selectedScenarioKey,
        memoSaved,
        memoCopyStatus,
        consent,
        aggregatePayload,
        fieldErrors,
      }),
    [aggregatePayload, consent, currentStep, fieldErrors, form, memoCopyStatus, memoSaved, mode, presentation, selectedScenarioKey],
  );
  const stepperHtml = useMemo(() => renderStepper(currentStep, highestUnlocked, staleSteps), [currentStep, highestUnlocked, staleSteps]);
  const activeTop = currentStep <= 2 ? 0 : currentStep === 3 ? 1 : currentStep === 4 ? 2 : currentStep <= 6 ? 3 : currentStep === 7 ? 4 : 5;
  const inputWarning = currentStep === 1 ? Object.values(fieldErrors).find(Boolean) ?? "" : "";
  const nextDisabled = currentStep === 1 && Boolean(inputWarning);

  useEffect(() => {
    window.history.replaceState(null, "", steps[currentStep]?.route ?? steps[0].route);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setCurrentStep(guardedStepFromPath(window.location.pathname, highestUnlocked));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [highestUnlocked]);

  useEffect(() => {
    window.setTimeout(() => {
      const heading = document.querySelector<HTMLElement>(".screen h1");
      heading?.focus();
    }, 0);
  }, [currentStep]);

  useEffect(() => {
    const node = shellRef.current;
    if (!node) return;

    const onFormChange = (event: Event) => {
      const control = (event.target as HTMLElement | null)?.closest<HTMLInputElement | HTMLSelectElement>(".field-control");
      if (control?.name) applyControlChange(control);

      const consentControl = (event.target as HTMLElement | null)?.closest<HTMLInputElement>(".consent-control");
      if (consentControl?.name) applyConsentChange(consentControl);
    };

    node.addEventListener("input", onFormChange);
    node.addEventListener("change", onFormChange);
    return () => {
      node.removeEventListener("input", onFormChange);
      node.removeEventListener("change", onFormChange);
    };
  }, [highestUnlocked]);

  useEffect(() => {
    const storedForm: PrototypeFormState = { ...form, notes: "" };
    const storedConsent: AggregateConsentState = {
      ...consent,
      companyName: consent.allowCompanyName ? consent.companyName : "",
    };
    const payload: PrototypeStoredSession = {
      currentStep,
      highestUnlocked,
      mode,
      form: storedForm,
      selectedScenarioKey,
      staleSteps,
      memoSaved,
      consent: storedConsent,
    };
    window.sessionStorage.setItem(PROTOTYPE_SESSION_STORAGE_KEY, JSON.stringify(payload));
  }, [consent, currentStep, form, highestUnlocked, memoSaved, mode, selectedScenarioKey, staleSteps]);
  function goToStep(step: number, push = true) {
    const bounded = Math.max(0, Math.min(steps.length - 1, step));
    if (bounded > highestUnlocked) return;
    setCurrentStep(bounded);
    if (push) window.history.pushState(null, "", steps[bounded]?.route ?? steps[0].route);
  }

  function completeAndGoNext() {
    if (nextDisabled) return;
    if (currentStep === steps.length - 1) {
      setMemoSaved(true);
      return;
    }

    const nextStep = currentStep + 1;
    setHighestUnlocked((current) => Math.max(current, nextStep));
    setStaleSteps((current) => current.filter((step) => step !== nextStep));
    setCurrentStep(nextStep);
    window.history.pushState(null, "", steps[nextStep]?.route ?? steps[0].route);
  }

  function markStaleFrom(stepIndex: number) {
    setStaleSteps((current) => {
      const next = new Set(current);
      for (let index = stepIndex; index < steps.length; index += 1) {
        if (index <= highestUnlocked) next.add(index);
      }
      return [...next].sort((a, b) => a - b);
    });
  }

  function reset() {
    setCurrentStep(0);
    setHighestUnlocked(0);
    setMode("hrPrism");
    setForm(prototypeSampleForm);
    setSelectedScenarioKey("band");
    setStaleSteps([]);
    setMemoSaved(false);
    setMemoCopyStatus("idle");
    setConsent({ consentForAggregateAnalysis: false, allowCompanyName: false, companyName: "" });
    setFieldErrors({});
    window.sessionStorage.removeItem(PROTOTYPE_SESSION_STORAGE_KEY);
    window.history.replaceState(null, "", steps[0].route);
  }

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    const stepButton = target.closest<HTMLElement>("[data-step]");
    if (stepButton) {
      goToStep(Number(stepButton.dataset.step));
      return;
    }

    const modeButton = target.closest<HTMLElement>("[data-mode]");
    if (modeButton) {
      const nextMode = modeButton.dataset.mode as PrototypeMode;
      setMode(nextMode);
      if (nextMode === "sample" || nextMode === "hrPrism") setForm(prototypeSampleForm);
      setHighestUnlocked((current) => Math.max(current, 1));
      setMemoCopyStatus("idle");
      setCurrentStep(1);
      window.history.pushState(null, "", steps[1].route);
      return;
    }

    const scenarioButton = target.closest<HTMLElement>("[data-scenario]");
    if (scenarioButton) {
      setSelectedScenarioKey((scenarioButton.dataset.scenario as PrototypeScenarioKey) ?? "band");
      setMemoCopyStatus("idle");
      setHighestUnlocked((current) => Math.max(current, 7));
      setStaleSteps((current) => current.filter((step) => step !== 7 && step !== 8));
      return;
    }

    const actionButton = target.closest<HTMLElement>("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    if (action === "copy-memo") {
      void copyMemoToClipboard();
      return;
    }
    if (action === "next" || action === "next-inline") completeAndGoNext();
    if (action === "back") goToStep(currentStep - 1);
    if (action === "reset") reset();
    if (action === "mark-stale") {
      setHighestUnlocked((current) => Math.max(current, 7));
      markStaleFrom(5);
    }
  }

  async function copyMemoToClipboard() {
    const memoText = createPrototypeMemoPreviewText(presentation);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(memoText);
      setMemoCopyStatus("copied");
    } catch {
      setMemoCopyStatus("fallback");
    }
  }

  function applyConsentChange(control: HTMLInputElement) {
    setConsent((current) => {
      if (control.name === "consentForAggregateAnalysis") {
        return { ...current, consentForAggregateAnalysis: control.checked };
      }
      if (control.name === "allowCompanyName") {
        return { ...current, allowCompanyName: control.checked, companyName: control.checked ? current.companyName : "" };
      }
      if (control.name === "companyName") {
        return { ...current, companyName: control.value };
      }
      return current;
    });
  }

  function applyControlChange(control: HTMLInputElement | HTMLSelectElement) {
    if (!control?.name) return;
    const value = control instanceof HTMLInputElement && control.type === "checkbox" ? String(control.checked) : control.value;
    const error = validateFieldValue(control.name, value, control instanceof HTMLInputElement ? control.type : "select");

    setForm((current) => ({
      ...current,
      [control.name]: control.name === "salaryBandExists" ? value === "true" : value,
    }));
    setFieldErrors((current) => ({ ...current, [control.name]: error }));
    setMemoSaved(false);
    setMemoCopyStatus("idle");
    markStaleFrom(2);
  }

  return (
    <div className="app-shell" ref={shellRef} onClick={handleClick}>
      <aside className="utility-rail" aria-label="앱 도구">
        <div className="utility-logo" aria-hidden="true" dangerouslySetInnerHTML={{ __html: logoIcon() }} />
        <button className="utility-button" type="button" aria-label="이동"><span aria-hidden="true">→</span></button>
        <button className="utility-button" type="button" aria-label="진단"><span aria-hidden="true">◎</span></button>
        <button className="utility-button" type="button" aria-label="시나리오"><span aria-hidden="true">✦</span></button>
        <button className="utility-button" type="button" aria-label="메모"><span aria-hidden="true">□</span></button>
        <button className="utility-button is-active" type="button" aria-label="HR PaySim"><span aria-hidden="true">◆</span></button>
        <button className="utility-button help" type="button" aria-label="도움말"><span aria-hidden="true">?</span></button>
      </aside>

      <section className="product-shell">
        <header className="topbar">
          <div className="brand-lockup">
            <button className="menu-button" type="button" aria-label="메뉴"><span aria-hidden="true">☰</span></button>
            <div>
              <strong>HR PaySim</strong>
              <span>보상 거버넌스 시뮬레이터</span>
            </div>
          </div>
          <nav className="topnav" aria-label="주요 화면">
            {["대시보드", "진단", "해석", "시나리오", "비교", "메모"].map((label, index) => (
              <button className={`topnav-pill ${index === activeTop ? "is-active" : ""}`} type="button" key={label}>{label}</button>
            ))}
          </nav>
          <div className="topbar-actions">
            <a className="outline-button route-link" href="/hr-paysim/roster">Roster 진단</a>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input type="search" placeholder="검색 (⌘K)" aria-label="검색" />
            </label>
            <button className="icon-button" type="button" data-action="reset" aria-label="처음으로">↻</button>
            <button className="icon-button" type="button" aria-label="알림">◔</button>
            <button className="icon-button" type="button" aria-label="설정">⚙</button>
            <button className="account-button" type="button" aria-label="회사 선택">
              <span className="avatar">R</span>
              <span className="account-copy">Acme Tech<br /><small>대표</small></span>
            </button>
          </div>
        </header>

        <div className="app-body">
          <aside className="flow-rail" aria-label="9단계 진행 상태">
            <nav className="stepper" id="stepper" dangerouslySetInnerHTML={{ __html: stepperHtml }} />
            <div className="status-legend" aria-label="상태 안내">
              <strong>상태 안내</strong>
              <span><i className="dot done" />완료</span>
              <span><i className="dot current" />현재</span>
              <span><i className="dot locked" />잠김</span>
              <span><i className="dot stale" />재계산 필요</span>
            </div>
          </aside>

          <main className="workspace">
            <section className="screen" id="screen" aria-live="polite" dangerouslySetInnerHTML={{ __html: screenHtml }} />
            <footer className="flow-controls">
              <button className="secondary-button" type="button" data-action="back" disabled={currentStep === 0}>← 이전 단계</button>
              <div className="control-copy" id="controlCopy">
                {inputWarning || (memoSaved && currentStep === steps.length - 1 ? "메모 초안이 브라우저 세션에 저장된 상태로 표시되었습니다." : controlTexts[currentStep])}
              </div>
              <button className="primary-button" type="button" data-action="next" disabled={nextDisabled}>
                {currentStep === steps.length - 1 ? (memoSaved ? "저장됨 ✓" : "메모 초안 저장 ↓") : `${nextLabel(currentStep)} →`}
              </button>
            </footer>
          </main>
        </div>
      </section>
    </div>
  );
}

function loadPrototypeStoredSession(): PrototypeStoredSession | null {
  try {
    const raw = window.sessionStorage.getItem(PROTOTYPE_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PrototypeStoredSession>;
    const highestUnlocked = clampStepIndex(parsed.highestUnlocked);
    return {
      currentStep: clampStepIndex(parsed.currentStep),
      highestUnlocked,
      mode: isPrototypeMode(parsed.mode) ? parsed.mode : "hrPrism",
      form: sanitizeStoredForm(parsed.form),
      selectedScenarioKey: isPrototypeScenarioKey(parsed.selectedScenarioKey) ? parsed.selectedScenarioKey : "band",
      staleSteps: normalizeStoredSteps(parsed.staleSteps, highestUnlocked),
      memoSaved: Boolean(parsed.memoSaved),
      consent: normalizeStoredConsent(parsed.consent),
    };
  } catch {
    return null;
  }
}

function sanitizeStoredForm(value: unknown): PrototypeFormState {
  if (!value || typeof value !== "object") return prototypeSampleForm;
  return { ...prototypeSampleForm, ...(value as Partial<PrototypeFormState>), notes: "" };
}

function normalizeStoredConsent(value: unknown): AggregateConsentState {
  if (!value || typeof value !== "object") {
    return { consentForAggregateAnalysis: false, allowCompanyName: false, companyName: "" };
  }
  const consent = value as Partial<AggregateConsentState>;
  const allowCompanyName = Boolean(consent.allowCompanyName);
  return {
    consentForAggregateAnalysis: Boolean(consent.consentForAggregateAnalysis),
    allowCompanyName,
    companyName: allowCompanyName ? consent.companyName ?? "" : "",
  };
}

function normalizeStoredSteps(value: unknown, highestUnlocked: number): number[] {
  if (!Array.isArray(value)) return [];
  return value.map(Number).filter((step) => Number.isInteger(step) && step >= 0 && step <= highestUnlocked && step < steps.length);
}

function clampStepIndex(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) return 0;
  return Math.max(0, Math.min(steps.length - 1, numeric));
}

function isPrototypeMode(value: unknown): value is PrototypeMode {
  return value === "hrPrism" || value === "direct" || value === "sample";
}

function isPrototypeScenarioKey(value: unknown): value is PrototypeScenarioKey {
  return value === "current" || value === "inversion" || value === "band" || value === "forecast" || value === "ai" || value === "senior";
}
function guardedStepFromPath(pathname: string, highestUnlocked: number): number {
  const matched = routeIndex.get(pathname) ?? 0;
  return Math.min(matched, highestUnlocked);
}

function nextLabel(currentStep: number): string {
  if (currentStep === 4) return "시나리오 보기";
  if (currentStep === 5) return "AI 확인으로 이동";
  if (currentStep === 6) return "비교로 이동";
  if (currentStep === 7) return "메모 미리보기 열기";
  return "다음으로";
}

function renderStepper(currentStep: number, highestUnlocked: number, staleSteps: number[]): string {
  return steps
    .map((step, index) => {
      const isCurrent = index === currentStep;
      const isComplete = index < highestUnlocked && !staleSteps.includes(index);
      const isLocked = index > highestUnlocked;
      const isStale = staleSteps.includes(index);
      const marker = isComplete ? "✓" : index + 1;
      const className = ["step-button", isCurrent ? "is-current" : "", isComplete ? "is-complete" : "", isLocked ? "is-locked" : "", isStale ? "is-stale" : ""]
        .filter(Boolean)
        .join(" ");
      return `<button class="${className}" type="button" data-step="${index}" ${isCurrent ? 'aria-current="step"' : ""} ${isLocked ? "disabled" : ""}><span class="rail-line" aria-hidden="true"></span><span class="step-number">${marker}</span><span class="step-index">${index + 1}</span><span class="step-copy"><strong>${step.title}</strong><small>${step.subtitle}</small></span></button>`;
    })
    .join("");
}

function screenHeader(stepIndex: number): string {
  const step = steps[stepIndex];
  return `<div class="screen-header"><div><h1 tabindex="-1">${stepIndex + 1}. ${step.title}</h1><p>${step.subtitle}</p></div><div class="screen-actions">${headerActions(stepIndex)}</div></div>`;
}

function headerActions(stepIndex: number): string {
  if (stepIndex === 3 || stepIndex === 4) return `<button class="outline-button" type="button" data-action="mark-stale">↻ 데이터 변경됨</button><button class="outline-button" type="button" data-step="1">입력으로 돌아가기</button>`;
  if (stepIndex === 6) return `<button class="outline-button" type="button">AI 도구 맥락 보기</button>`;
  if (stepIndex === 7) return `<button class="outline-button" type="button" data-action="next-inline">메모 미리보기</button>`;
  return "";
}

function renderScreen(
  stepIndex: number,
  props: {
    mode: PrototypeMode;
    form: PrototypeFormState;
    presentation: PrototypePresentation;
    selectedScenarioKey: PrototypeScenarioKey;
    memoSaved: boolean;
    memoCopyStatus: MemoCopyStatus;
    consent: AggregateConsentState;
    aggregatePayload: ReturnType<typeof createAggregateLogPayload>;
    fieldErrors: Record<string, string>;
  },
): string {
  if (stepIndex === 0) return renderEntry(props.mode);
  if (stepIndex === 1) return renderIntake(props.form, props.fieldErrors);
  if (stepIndex === 2) return renderSummary(props.mode, props.presentation);
  if (stepIndex === 3) return renderDiagnosis(props.presentation);
  if (stepIndex === 4) return renderInterpretation(props.presentation);
  if (stepIndex === 5) return renderScenarios(props.presentation, props.selectedScenarioKey);
  if (stepIndex === 6) return renderAiCheck(props.presentation);
  if (stepIndex === 7) return renderComparison(props.presentation);
  return renderMemo(props.presentation, props.memoSaved, props.memoCopyStatus, props.consent, props.aggregatePayload);
}

function renderEntry(mode: PrototypeMode): string {
  return `<div class="entry-layout"><section class="entry-main"><div class="info-banner large"><span class="info-icon">i</span><div><h2>HR PaySim에 오신 것을 환영합니다.</h2><p>이 도구는 급여 계산기가 아닙니다. 우리 회사의 보상 거버넌스 상태를 진단하고, 보상 의사결정 시나리오를 비교하여 최적의 방향을 찾는 시뮬레이터입니다.</p></div></div><h3 class="section-title">시작 방법을 선택해주세요</h3><div class="mode-grid">${modeCard("hrPrism", mode, ["진단 결과와 핵심 맥락 자동 반영", "빠르게 시나리오 비교로 이동"])}${modeCard("direct", mode, ["필요한 항목만 간단히 입력", "입력 내용을 바로 확인 가능"])}${modeCard("sample", mode, ["모든 단계 미리 체험 가능", "샘플 데이터는 저장되지 않습니다"])}</div><div class="soft-note">${icon("spark")}<span>모든 모드는 이후 단계에서 언제든 변경할 수 있습니다.</span></div></section><aside class="entry-aside"><article class="side-card prism-card"><div class="side-card-head"><h3>HR Prism 연계 정보</h3><span class="muted-icon">i</span></div><p>이 화면은 진단 트리거 이유만 보여줍니다.</p><hr /><strong>트리거 이유</strong>${reasonRow("team", "AI 도입으로 노동 생산성이 크게 개선되었습니다.")}${reasonRow("trend", "비즈니스 가치가 상승했으나 보상이 따라가지 못하고 있습니다.")}${reasonRow("alert", "급여 인상 압력이 커질 수 있습니다.")}</article>${privacyCard("개인 식별 정보 없음", "이 도구는 개인 식별 정보를 수집하지 않습니다. 이름, 이메일, 주민등록번호, 개별 급여 데이터 등은 입력하지 않습니다.")}<button class="wide-link" type="button">연계 정보 자세히 보기 <span>›</span></button></aside></div>`;
}

function renderIntake(form: PrototypeFormState, errors: Record<string, string>): string {
  return `<p class="screen-intro">회사의 보상 및 조직 정보를 입력해주세요. 입력은 집계 수준으로만 수집되며, 개인 식별 정보는 요청하지 않습니다.</p><div class="content-with-aside"><section class="main-stack"><div class="form-grid">${inputPanel("building", "회사 맥락", [selectField("industry", "산업", "산업 선택", form.industry, errors.industry), selectField("companySize", "회사 규모 (국내 기준)", "규모 선택", form.companySize, errors.companySize), selectField("revenueScale", "매출 규모 (연간)", "매출 규모 선택", form.revenueScale, errors.revenueScale), selectField("growthStage", "사업 성장 단계", "성장 단계 선택", form.growthStage, errors.growthStage)], "정확한 진단을 위해 회사의 일반적인 맥락을 입력해주세요.")}${inputPanel("lock", "현재 보상 구조", [textField("basePayrollEok", "기준 급여 총액 (연간)", "금액 입력", "억원", form.basePayrollEok, errors.basePayrollEok), textField("variablePayEok", "변동 보상 총액 (연간)", "금액 입력", "억원", form.variablePayEok, errors.variablePayEok), textField("benefitsEok", "복리후생 총액 (연간)", "금액 입력", "억원", form.benefitsEok, errors.benefitsEok), textField("bonusEligiblePct", "성과급 지급 대상 비중", "비중 입력", "%", form.bonusEligiblePct, errors.bonusEligiblePct), textField("pePct", "PE (기본급 비중)", "비중 입력", "%", form.pePct, errors.pePct), textField("experiencedHirePct", "경력직 비중", "비중 입력", "%", form.experiencedHirePct, errors.experiencedHirePct)], "기본급, 변동 보상, 복리후생 등 전체 보상 구조의 규모와 비중을 입력해주세요.")}${inputPanel("person", "채용 계획", [textField("plannedHires", "향후 12개월 채용 인원", "인원 입력", "명", form.plannedHires, errors.plannedHires), textField("averageNewHireSalaryManwon", "평균 연봉 (신규 채용)", "금액 입력", "만원", form.averageNewHireSalaryManwon, errors.averageNewHireSalaryManwon), selectField("hiringRole", "주요 채용 직무", "직무 선택", form.hiringRole, errors.hiringRole), selectField("hiringUrgency", "채용 시급성", "시급성 선택", form.hiringUrgency, errors.hiringUrgency)], "향후 채용 계획과 주요 직무, 시급성에 대한 정보를 입력해주세요.")}${inputPanel("warning", "예외 보상 신호", [selectField("inversionSignal", "급여 역전 사례 존재 여부", "선택", form.inversionSignal, errors.inversionSignal), selectField("attritionSignal", "핵심 인재 이탈 발생 여부", "선택", form.attritionSignal, errors.attritionSignal), selectField("hiringDifficultySignal", "특정 직군 채용 어려움", "선택", form.hiringDifficultySignal, errors.hiringDifficultySignal), textField("notes", "기타 특이사항", "내용 입력 (선택)", "", form.notes, errors.notes)], "보상 이슈나 시장 압력 등 예외 신호를 알려주시면 진단에 반영됩니다.")}</div><details class="ai-disclosure" open><summary>${icon("spark")}<span>선택 입력: AI 도구 맥락</span><small>AI 도구 사용 목적, 자동화 수준, 데이터/시스템 연동 수준 등 AI 관련 정보를 입력하면 추가 인사이트를 제공합니다.</small></summary><div class="disclosure-grid">${selectField("aiPurpose", "AI 도구 사용 목적", "목적 선택", form.aiPurpose, errors.aiPurpose)}${selectField("aiAutomationLevel", "자동화 수준", "수준 선택", form.aiAutomationLevel, errors.aiAutomationLevel)}${textField("aiMonthlyBudgetManwon", "월 AI 도구 예산", "금액 입력", "만원", form.aiMonthlyBudgetManwon, errors.aiMonthlyBudgetManwon)}${selectField("aiHiringDelayOption", "채용 지연 가능성", "가능성 선택", form.aiHiringDelayOption, errors.aiHiringDelayOption)}</div></details></section><aside class="aside-stack">${privacyCard("개인 식별 정보 없음", "HR PaySim은 집계 데이터만 사용합니다. 아래 정보는 수집하지 않습니다.", ["이름, 이메일, 연락처", "주민등록번호, 사번", "개별 급여 데이터", "개인별 평가 정보"])}<article class="side-card blue-tint"><h3>${icon("spark")}입력 팁</h3><p>숫자는 대략적인 범위로 입력해도 진단에 충분히 활용됩니다.</p></article><article class="side-card method-card"><h3>보상 밴드 기준</h3><label class="field"><span>현재 연봉 밴드 운영 여부</span><span class="field-wrap"><select class="field-control" name="salaryBandExists"><option value="true" ${form.salaryBandExists ? "selected" : ""}>운영 중</option><option value="false" ${!form.salaryBandExists ? "selected" : ""}>없음 또는 불명확</option></select></span><em class="field-warning" aria-live="polite"></em></label>${methodRow("edit", "수정 가능", "다음 단계에서 언제든 수정할 수 있습니다.")}</article></aside></div>`;
}

function renderSummary(mode: PrototypeMode, presentation: PrototypePresentation): string {
  const summary = presentation.summary;
  return `<div class="content-with-aside"><section class="main-stack"><div class="summary-banner"><span class="round-icon">${icon("doc")}</span><div><h2>${mode === "hrPrism" ? "HR Prism 연계 입력" : modes[mode].label}</h2><p>입력하신 내용을 요약했습니다. HR PaySim이 다시 계산합니다.</p></div><button class="outline-button" type="button" data-step="0">모드 변경</button></div><p class="caption-line">ⓘ 샘플 데이터 미리보기 라벨은 샘플 데이터로 본 경우에만 표시됩니다.</p><div class="stat-grid five">${statCard("team", "전체 인원", summary.employeeCount.value, summary.employeeCount.note)}${statCard("person", "채용 계획", summary.plannedHires.value, summary.plannedHires.note)}${statCard("trend", "예외 인상", summary.exceptions.value, summary.exceptions.note)}${statCard("alert", "역전 구간", summary.inversions.value, summary.inversions.note)}${statCard("chip", "AI 도구 맥락", summary.aiTooling.value, summary.aiTooling.note)}</div><div class="summary-lower"><article class="panel confidence-card"><h3>입력 신뢰도 & 완전성</h3><div class="progress-row"><span class="progress-track"><span style="width:${presentation.confidence.score}%"></span></span><strong>${presentation.confidence.score}%</strong></div><div class="confidence-columns"><div><small>데이터 충분성</small><strong>${presentation.confidence.sufficiency}</strong></div><div><small>일관성</small><strong>${presentation.confidence.consistency}</strong></div><div><small>누락 항목</small><strong>${presentation.confidence.missing}</strong></div></div><p>집계 데이터 기준으로 계산된 지표입니다.</p></article><article class="panel understood-card"><h3>HR PaySim이 이해한 내용</h3>${checkRow("회사 컨텍스트", "회사 규모, 사업 모델, 지역, 성장 단계")}${checkRow("전체 인원", "현재 인원 및 조직 규모 정보")}${checkRow("채용 계획", "다음 12개월 채용 계획")}${checkRow("예외 인상 범위", "예외 인상 인원 및 비율")}${checkRow("역전 구간 정보", "역전 구간 및 역전 케이스 수")}${checkRow("AI 도구 맥락", "AI 도구 유형 및 생산성 보조/자동화 맥락")}</article></div><div class="soft-note shield-note">${icon("shield")}<span>입력하신 정보는 진단 목적으로만 사용되며, 안전하게 보호됩니다.</span></div></section><aside class="aside-stack"><article class="side-card"><h3>${icon("clock")}계산 반영 항목</h3><strong>재계산된 항목</strong><ul><li>CEI: ${presentation.diagnosis.ceiScore}/100</li><li>CED: ${presentation.diagnosis.cedScore}/100</li><li>채용 압력: ${formatPercent(presentation.diagnosis.payrollIncreaseRate)}</li></ul><strong>다음 단계 반영</strong><ul><li>진단 스냅샷</li><li>추천 시나리오</li><li>비교표와 메모 초안</li></ul></article>${privacyCard("개인 식별 정보 없음", "HR PaySim은 개인 식별 정보를 수집하지 않습니다. 이름, 이메일, 주민등록번호, 개별 급여 데이터 등")}<button class="primary-button full" type="button" data-action="next-inline">이 내용으로 진단 보기 →</button><button class="text-button" type="button" data-step="1">← 이전 단계로 돌아가기</button></aside></div>`;
}

function renderDiagnosis(presentation: PrototypePresentation): string {
  const preview = recommendationMetas(presentation).slice(0, 4);
  const selected = presentation.selectedScenario;
  const selectedRow = presentation.comparison.rows.find((row) => row.scenarioId === selected.id) ?? presentation.comparison.rows[0];
  return `<p class="screen-intro">입력 데이터를 바탕으로 현재 보상 거버넌스 상태를 먼저 진단합니다. 다음 단계에서 이 신호가 어떤 의사결정 질문으로 이어지는지 해석합니다.</p><div class="content-with-aside"><section class="main-stack"><article class="panel snapshot-card"><h3>현재 보상 거버넌스 스냅샷</h3><div class="metric-row">${heroMetric(presentation)}${metricCard("CED (예외 누적 수준)", String(presentation.diagnosis.cedScore), "/100", bandLabel(presentation.diagnosis.cedScore, false), "입력값에서 재계산", gaugeMini(presentation.diagnosis.cedScore))}${riskMetric(presentation)}${payrollMetric(presentation)}</div><p class="source-line">진단 기준: HR PaySim 내부 보상 거버넌스 규칙</p></article><article class="panel scenario-preview"><h3>추천 시나리오 미리보기 <small>(상위 추천)</small></h3><div class="preview-grid">${preview.map((scenario, index) => previewCard(`${index + 1}순위`, scenario.icon, scenario.title, scenario.reasons[0] ?? "", previewValueForScenario(presentation, scenario), "영향")).join("")}<article class="mini-preview muted"><span>${icon("list")}</span><strong>다른 안도 보기</strong><p>AI 도구 + 채용 속도 조정 등 다른 시나리오도 확인할 수 있습니다.</p><button class="outline-button" type="button" data-action="next-inline">해석 먼저 보기</button></article></div></article><article class="panel comparison-preview"><h3>의사결정 비교 미리보기 <small>(계산값)</small></h3><div class="tiny-table"><span>안</span><span>연간 비용 영향</span><span>CEI 변화</span><span>CED 변화</span><span>얻는 것</span><span>감수할 것</span><strong>${selected.title}</strong><span>${formatWonEok(selectedRow?.annualCostImpact ?? 0)}</span><span class="delta ${selectedRow?.explainabilityChange && selectedRow.explainabilityChange > 0 ? "down" : "up"}">${signedNumber(selectedRow?.explainabilityChange ?? 0)}</span><span class="delta ${selectedRow?.exceptionDebtChange && selectedRow.exceptionDebtChange < 0 ? "down" : "up"}">${signedNumber(selectedRow?.exceptionDebtChange ?? 0)}</span><span>${selected.gain[0]}</span><span>${selected.tradeoff[0]}</span></div></article></section><aside class="aside-stack"><article class="side-card expert-card"><h3>${icon("spark")}전문가 해석</h3>${insight("chat", presentation.memo.currentIssue)}${insight("alert", `급여 역전 위험은 ${severityLabel(presentation.diagnosis.payInversionSeverity)} 수준입니다.`)}${insight("team", `채용 계획은 현재 인원의 ${formatPercent(presentation.diagnosis.payrollIncreaseRate)}입니다.`)}</article><article class="side-card decision-question"><span class="question-dot">?</span><h3>다음으로 답해야 할 질문</h3><h2>이 진단 신호가 어떤 의사결정 질문으로 이어질까요?</h2><p>다음 해석 단계에서 얻는 것과 감수할 것을 먼저 정리한 뒤 추천 시나리오로 넘어갑니다.</p><button class="primary-button full" type="button" data-action="next-inline">전문가 해석 보기 →</button></article></aside></div>`;
}

function renderInterpretation(presentation: PrototypePresentation): string {
  const interpretation = getInterpretation({
    ceiBand: presentation.diagnosis.ceiBand,
    cedBand: presentation.diagnosis.cedBand,
    payInversionSeverity: presentation.diagnosis.payInversionSeverity,
    payrollIncreaseRate: presentation.diagnosis.payrollIncreaseRate,
  });
  const caution = interpretation.caution ? memoRow("warning", "주의", [interpretation.caution]) : "";
  return `<div class="content-with-aside"><section class="main-stack"><div class="info-banner large">${icon("spark")}<div><h2>${interpretation.headline}</h2><p>${interpretation.body}</p></div></div><article class="memo-preview panel">${memoRow("chat", "핵심 해석", [presentation.memo.currentIssue])}${memoRow("list", "해석 근거", interpretation.supportingPoints)}${memoRow("scale", "얻는 것과 감수할 것", ["얻는 것은 내부 설명 가능성과 기준 정리입니다.", "감수할 것은 정책 정리와 커뮤니케이션 부담입니다."])}${caution}</article></section><aside class="aside-stack"><article class="side-card"><h3>${icon("target")}다음 결정 질문</h3><h2>어떤 보상 의사결정안을 먼저 비교할까요?</h2><p>해석 결과를 기준으로 현 상태 유지, 급여 역전 해소, 밴드 재설계, AI 도구 검토를 비교합니다.</p><button class="primary-button full" type="button" data-action="next-inline">추천 시나리오 보기 →</button></article><article class="side-card blue-tint"><h3>해석 기준</h3>${checkRow("CEI", `${presentation.diagnosis.ceiScore}/100 · ${bandLabel(presentation.diagnosis.ceiScore)}`)}${checkRow("CED", `${presentation.diagnosis.cedScore}/100 · ${bandLabel(presentation.diagnosis.cedScore, false)}`)}${checkRow("보상 역전", severityLabel(presentation.diagnosis.payInversionSeverity))}${checkRow("채용 압력", formatPercent(presentation.diagnosis.payrollIncreaseRate))}</article></aside></div>`;
}
function renderScenarios(presentation: PrototypePresentation, selectedKey: PrototypeScenarioKey): string {
  const recommended = recommendationMetas(presentation);
  const optional = allScenarioMeta().filter((scenario) => !recommended.some((item) => item.key === scenario.key));
  const rows = [...recommended, ...optional];
  return `<div class="content-with-aside"><section class="main-stack"><div class="info-banner">${icon("spark")}<div><h2>지금 바로 조정하지 않는 것도 하나의 선택입니다.</h2><p>비용과 리스크, 실행 난이도 관점에서 먼저 비교해 볼 만한 시나리오만 추천했습니다.</p></div></div><div class="scenario-list">${rows.map((scenario) => scenarioRow(scenario, selectedKey)).join("")}</div></section><aside class="aside-stack"><article class="side-card"><div class="side-card-head"><h3>추천 기준 설명</h3><span class="muted-icon">i</span></div><p>이 추천은 현재 입력값과 HR PaySim 규칙을 기준으로 자동 정렬됩니다.</p><hr /><strong>주요 기준</strong><ul><li>CEI (보상 설명 가능성): ${presentation.diagnosis.ceiScore}/100</li><li>CED (예외 누적 수준): ${presentation.diagnosis.cedScore}/100</li><li>급여 역전 위험: ${severityLabel(presentation.diagnosis.payInversionSeverity)}</li><li>연간 급여 총액 변화</li><li>회사 성장 계획 및 구조적 요인</li></ul></article><article class="side-card"><h3>추천 임계값 (요약)</h3><div class="threshold-table"><span>CEI &lt; 60점</span><span>설명 가능성 부족</span><span>CED ≥ 60점</span><span>예외 누적 심화</span><span>급여 역전 위험 ≥ 중간</span><span>시급성 증가</span><span>채용 압력 &gt; 15%</span><span>총액 예측 필요</span></div></article><button class="primary-button full" type="button" data-action="next-inline">선택한 안 비교하기 →</button></aside></div>`;
}

function renderAiCheck(presentation: PrototypePresentation): string {
  return `<div class="content-with-aside"><section class="main-stack"><div class="info-banner">${icon("info")}<div><h2>AI는 별도 검토 렌즈입니다.</h2><p>AI 도구는 사람을 대체한다는 결론이 아니라, 채용 속도와 도구 예산이 보상 의사결정에 주는 영향을 확인하는 입력입니다.</p></div><button class="outline-button" type="button" data-action="next-inline">비교로 이동</button></div>${aiSection("1", "채용 속도와 도구 예산을 함께 봅니다", "채용 계획 일부를 늦출 수 있는지와 AI 도구 비용이 총액에 주는 영향을 계산합니다.", hiringBars(presentation), ["채용 계획 대비 지연 가능성", "월 AI 도구 예산", "역할별 업무 영향"])}${aiSection("2", "조율 역할의 보상 기준을 분리해 봅니다", "시니어 조율 역할의 책임이 커지는 경우 별도 premium 검토가 필요한지 확인합니다.", seniorDiagram(), ["실행 중심 역할과 조율 중심 역할 분리", "책임 범위와 설명 가능성", "일괄 인상이 아닌 역할 기준"])}${aiSection("3", "주요 결론은 비교표에서 확인합니다", "AI 관련 선택지는 비용만 낮추는 안이 아니라 실행 부담과 커뮤니케이션 부담을 함께 봅니다.", lineChart(), ["비용 변화", "설명 가능성 변화", "실행 난이도"])}</section><aside class="aside-stack"><article class="side-card"><h3>${icon("shield")}주의</h3><p>이 화면은 AI가 몇 명을 대체하는지 계산하지 않습니다. 보상 의사결정에 필요한 추가 맥락만 점검합니다.</p></article><article class="side-card blue-tint"><h3>현재 AI 입력</h3>${checkRow("AI 도구 맥락", presentation.summary.aiTooling.note)}${checkRow("비교 포함", "채용 지연 + AI 도구 시나리오를 비교표에 포함합니다.")}<button class="primary-button full" type="button" data-action="next-inline">비교로 이동 →</button></article></aside></div>`;
}

function renderComparison(presentation: PrototypePresentation): string {
  const current = scenarioMetaForId("baseline_current_state");
  const band = scenarioMetaForId("redesign_salary_bands");
  const ai = scenarioMetaForId("ai_tooling_check");
  return `<div class="content-with-aside"><section class="main-stack"><div class="info-banner">${icon("info")}<div><h2>가장 비용이 낮은 안이 항상 가장 좋은 안은 아닙니다.</h2><p>선택한 보상 의사결정들을 기준 시나리오와 비교하여, 얻는 것과 감수할 것을 함께 확인합니다.</p></div><button class="outline-button" type="button" data-action="next-inline">메모 미리보기</button></div><article class="matrix-card"><div class="comparison-matrix"><div class="matrix-head empty"></div><div class="matrix-head">기준선<br /><small>(Baseline)</small></div><div class="matrix-head">${icon(current.icon)}${current.title}</div><div class="matrix-head">${icon(band.icon)}${band.title}</div><div class="matrix-head">${icon(ai.icon)}${ai.title}</div>${matrixRows(presentation)}</div></article><article class="gain-loss-card"><div class="gain-loss-row"><strong>${icon("thumb")}얻는 것</strong><ul>${current.gain.map((item) => `<li>${item}</li>`).join("")}</ul><ul>${band.gain.map((item) => `<li>${item}</li>`).join("")}</ul><ul>${ai.gain.map((item) => `<li>${item}</li>`).join("")}</ul></div><div class="gain-loss-row"><strong>${icon("alert")}감수할 것</strong><ul>${current.tradeoff.map((item) => `<li>${item}</li>`).join("")}</ul><ul>${band.tradeoff.map((item) => `<li>${item}</li>`).join("")}</ul><ul>${ai.tradeoff.map((item) => `<li>${item}</li>`).join("")}</ul></div></article></section><aside class="aside-stack"><article class="side-card"><h3>대표 관점 해석</h3>${methodRow("coin", "비용 관점", "현재 상태 유지는 추가 조정 비용이 낮고, AI 도구 안은 실행 가정 검증이 필요합니다.")}${methodRow("shield", "리스크 관점", "연봉 밴드 재설계가 보상 구조 안정화와 역전 리스크 완화에 가장 효과적입니다.")}${methodRow("team", "실행 관점", "비용, 설명 가능성, 실행 부담을 함께 봐야 합니다.")}</article><article class="side-card callout"><h3>추천 다음 결정</h3><p>비교 결과를 바탕으로, 조직이 더 중요하게 보는 관점을 기준으로 최종 안을 선택하세요.</p><button class="primary-button full" type="button" data-action="next-inline">선택한 안으로 메모 작성 →</button><button class="secondary-button full" type="button" data-step="5">추천 시나리오로 돌아가기</button></article></aside></div>`;
}

function renderMemo(
  presentation: PrototypePresentation,
  memoSaved: boolean,
  memoCopyStatus: MemoCopyStatus,
  consent: AggregateConsentState,
  aggregatePayload: ReturnType<typeof createAggregateLogPayload>,
): string {
  const selected = presentation.selectedScenario;
  const memoText = createPrototypeMemoPreviewText(presentation);
  const copyToast =
    memoCopyStatus === "copied"
      ? '<div class="save-toast">✓ 메모 텍스트를 클립보드에 복사했습니다.</div>'
      : memoCopyStatus === "fallback"
        ? '<div class="save-toast">클립보드 복사가 막혀 아래 텍스트를 직접 선택할 수 있습니다.</div>'
        : "";
  return `<p class="screen-intro">선택한 의사결정의 핵심 요약을 확인하고, 다음 단계 행동을 정의하세요.</p><div class="content-with-aside"><section class="main-stack">${memoSaved ? '<div class="save-toast">✓ 메모 초안이 저장되었습니다. 현재 브라우저 세션에서 저장 상태로 표시됩니다.</div>' : ""}${copyToast}<article class="memo-summary panel"><span class="round-icon">${icon(selected.icon)}</span><div><small>선택한 시나리오</small><h2>${selected.title} <em>${selected.badge}</em></h2><p>비교에서 선택됨</p></div><div><small>신뢰도 (의사결정 기준)</small><strong>${presentation.confidence.score}%</strong><em>${presentation.confidence.sufficiency}</em><p>입력 신뢰도 기반</p></div><div><small>비교 기준일</small><strong>${new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())}</strong><p>현재 브라우저 기준</p></div></article><article class="memo-preview panel">${memoRow("info", "현재 이슈", [presentation.memo.currentIssue])}${memoChoiceRow(selected.key)}${memoRow("trend", "얻는 것", presentation.memo.gains)}${memoRow("alert", "감수할 것", presentation.memo.tradeoffs)}${memoRow("question", "다음 질문", presentation.memo.nextQuestions)}<div class="soft-note">${icon("info")}<span>이 내용은 의사결정 참고용 핵심 쟁점 preview입니다. 필요 시 수정하여 활용하세요.</span></div><div class="memo-actions"><button class="outline-button" type="button" data-action="copy-memo">메모 텍스트 복사</button></div>${memoCopyStatus === "fallback" ? `<textarea class="memo-fallback" readonly>${escapeHtml(memoText)}</textarea>` : ""}</article></section><aside class="aside-stack"><article class="side-card"><h2>정식 메모가 아닙니다.</h2><p>핵심 쟁점 preview입니다.</p>${methodRow("chat", "핵심을 요약합니다", "진단, 비교 결과와 선택 이유의 핵심만 담았습니다.")}${methodRow("team", "공유에 활용하세요", "팀 내부 논의 및 이해관계자 커뮤니케이션에 활용할 수 있습니다.")}${methodRow("doc", "수정하여 사용하세요", "필요하다면 문구를 보완하고 메모 초안으로 저장하세요.")}</article><article class="side-card blue-tint"><h3>메모에 포함된 항목</h3>${checkRow("선택한 시나리오 요약", selected.title)}${checkRow("진단 기반 이슈", presentation.memo.currentIssue)}${checkRow("비교 결과 핵심 차이", "")}${checkRow("얻는 것과 감수할 것", "")}${checkRow("다음에 답해야 할 질문", "")}</article>${renderAggregateConsentCard(consent, aggregatePayload)}</aside></div>`;
}

function renderAggregateConsentCard(
  consent: AggregateConsentState,
  aggregatePayload: ReturnType<typeof createAggregateLogPayload>,
): string {
  return `<article class="side-card consent-card"><h3>${icon("shield")}집계 분석 동의</h3><p>동의하지 않아도 메모 미리보기와 저장은 계속 사용할 수 있습니다.</p><label class="consent-option"><input class="consent-control" name="consentForAggregateAnalysis" type="checkbox" ${consent.consentForAggregateAnalysis ? "checked" : ""} /><span>익명 집계 분석에 사용 동의</span></label><label class="consent-option"><input class="consent-control" name="allowCompanyName" type="checkbox" ${consent.allowCompanyName ? "checked" : ""} /><span>회사명 포함 허용 (선택)</span></label><label class="field compact-field"><span>회사명</span><span class="field-wrap"><input class="consent-control" name="companyName" type="text" placeholder="선택 입력" value="${escapeAttr(consent.companyName ?? "")}" ${consent.allowCompanyName ? "" : "disabled"} /></span></label><div class="soft-note" data-testid="aggregate-payload-status">${aggregatePayload ? `${icon("check")}<span>로컬 payload 생성됨. 서버 전송은 하지 않습니다.</span>` : `${icon("info")}<span>동의 전에는 집계 payload를 만들지 않습니다.</span>`}</div></article>`;
}

function modeCard(key: PrototypeMode, currentMode: PrototypeMode, bullets: string[]): string {
  const mode = modes[key];
  const selected = currentMode === key;
  return `<article class="mode-card ${selected ? "is-selected" : ""}"><span class="round-icon">${icon(mode.icon)}</span><h3>${mode.label}</h3><p>${mode.description}</p><ul>${bullets.map((item) => `<li>${icon("check")}${item}</li>`).join("")}</ul><button class="primary-button full" type="button" data-mode="${key}">${mode.button}</button></article>`;
}

function inputPanel(iconName: string, title: string, fields: string[], helper: string): string {
  return `<article class="form-panel"><h3>${icon(iconName)}${title}</h3><div class="field-grid">${fields.join("")}</div><div class="helper-line">ⓘ ${helper}</div></article>`;
}

function textField(name: keyof PrototypeFormState, label: string, placeholder: string, suffix: string, value: string, error = ""): string {
  const numeric = Boolean(suffix) || /인원|금액|비중|총액|연봉|예산|PE/.test(label);
  const type = numeric ? "number" : "text";
  const attrs = numeric ? 'inputmode="decimal" min="0" step="any"' : 'maxlength="120" data-free-text="true"';
  return `<label class="field ${error ? "is-invalid" : ""}"><span>${label}</span><span class="field-wrap"><input class="field-control" name="${name}" type="${type}" ${attrs} placeholder="${placeholder}" value="${escapeAttr(value)}" />${suffix ? `<small>${suffix}</small>` : ""}</span><em class="field-warning" aria-live="polite">${escapeHtml(error)}</em></label>`;
}

function selectField(name: keyof PrototypeFormState, label: string, placeholder: string, value: string | boolean, error = ""): string {
  const options = getSelectOptions(label);
  const selectedValue = String(value);
  return `<label class="field ${error ? "is-invalid" : ""}"><span>${label}</span><span class="field-wrap"><select class="field-control" name="${name}"><option value="">${placeholder}</option>${options.map((option) => `<option value="${escapeAttr(option)}" ${option === selectedValue ? "selected" : ""}>${option}</option>`).join("")}</select></span><em class="field-warning" aria-live="polite">${escapeHtml(error)}</em></label>`;
}

function getSelectOptions(label: string): string[] {
  if (label.includes("산업")) return ["SaaS/IT", "제조", "커머스", "금융", "헬스케어"];
  if (label.includes("회사 규모")) return ["50명 미만", "50~199명", "200~499명", "500명 이상"];
  if (label.includes("매출")) return ["50억 미만", "50~200억", "200~500억", "500억 이상"];
  if (label.includes("성장")) return ["초기", "성장 단계 1", "성장 단계 2", "확장 단계"];
  if (label.includes("직무")) return ["제품/엔지니어링", "영업/마케팅", "운영", "전사 혼합"];
  if (label.includes("시급성")) return ["낮음", "중간", "높음", "즉시 필요"];
  if (label.includes("존재") || label.includes("발생") || label.includes("어려움")) return ["없음", "일부 있음", "명확히 있음", "확인 필요"];
  if (label.includes("AI 도구 사용 목적")) return ["생산성 보조", "자동화", "의사결정 지원", "고객/운영 지원"];
  if (label.includes("자동화 수준")) return ["없음", "낮음", "중간", "높음"];
  if (label.includes("채용 지연")) return ["불가", "일부 가능", "3~6개월 가능", "추가 검토 필요"];
  return ["낮음", "중간", "높음"];
}

function privacyCard(title: string, copy: string, list: string[] = []): string {
  return `<article class="side-card privacy-card"><h3>${icon("shield")}${title}</h3><p>${copy}</p>${list.length ? `<ul>${list.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}</article>`;
}

function statCard(iconName: string, label: string, value: string, note: string): string {
  return `<article class="stat-card"><span>${icon(iconName)}</span><h3>${label}</h3><strong>${value}</strong><p>${note}</p></article>`;
}

function heroMetric(presentation: PrototypePresentation): string {
  const value = presentation.diagnosis.ceiScore;
  const endX = 32 + Math.min(116, Math.max(20, value * 1.05));
  return `<article class="metric-card hero"><div class="metric-title">CEI (보상 설명 가능성) ${icon("info")}</div><div class="hero-gauge"><svg viewBox="0 0 180 124" aria-label="CEI ${value}점"><defs><linearGradient id="ceiGaugeGradient" x1="28" y1="108" x2="148" y2="26" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff" stop-opacity="0.96"/><stop offset="0.58" stop-color="#d7e8ff" stop-opacity="0.92"/><stop offset="1" stop-color="#8fc2ff" stop-opacity="0.82"/></linearGradient></defs><path class="gauge-shadow" d="M32 96A58 58 0 0 1 148 96"/><path class="gauge-fill" d="M32 96A58 58 0 0 1 ${endX} 45"/><text x="90" y="83" text-anchor="middle">${value}</text><text x="90" y="106" text-anchor="middle">/100</text></svg></div><em>${bandLabel(value)}</em><p><span class="delta down">입력값에서 재계산</span></p></article>`;
}

function metricCard(title: string, value: string, suffix: string, badge: string, delta: string, visual: string): string {
  return `<article class="metric-card"><div class="metric-title">${title} ${icon("info")}</div>${visual}<strong>${value}<small>${suffix}</small></strong><em>${badge}</em><p>${delta}</p></article>`;
}

function riskMetric(presentation: PrototypePresentation): string {
  const severity = severityLabel(presentation.diagnosis.payInversionSeverity);
  const cases = presentation.input.inversionCaseCount;
  return `<article class="metric-card"><div class="metric-title">급여 역전 위험 ${icon("info")}</div><strong class="risk-word">${severity}</strong><p>발생 케이스 ${cases.toLocaleString("ko-KR")}건</p><div class="risk-list"><span><i></i>심각 ${Math.ceil(cases * 0.2)}</span><span><i></i>중간 ${Math.ceil(cases * 0.5)}</span><span><i></i>경미 ${Math.max(0, cases - Math.ceil(cases * 0.7))}</span><span><i></i>정상 ${Math.max(0, presentation.input.employeeCount - cases)}</span></div></article>`;
}

function payrollMetric(presentation: PrototypePresentation): string {
  const payroll = presentation.input.basePayrollAnnual + presentation.input.variablePayAnnual + presentation.input.benefitsAnnual;
  return `<article class="metric-card"><div class="metric-title">연간 급여 총액 (기준) ${icon("info")}</div><strong>${formatWonEok(payroll).replace("+", "")}</strong><p>채용 계획 비중 <b>${formatPercent(presentation.diagnosis.payrollIncreaseRate)}</b></p>${lineChart()}</article>`;
}

function gaugeMini(value: number): string {
  return `<div class="gauge mini-svg" style="--score:${value}"><svg viewBox="0 0 150 150" aria-label="${value}점"><circle class="gauge-ring" cx="75" cy="75" r="54"></circle><circle class="gauge-value" cx="75" cy="75" r="54" pathLength="100" stroke-dasharray="${value} 100"></circle><text x="75" y="84" text-anchor="middle">${value}</text></svg></div>`;
}

function previewCard(rank: string, iconName: string, title: string, copy: string, value: string, unit: string): string {
  return `<article class="mini-preview"><span class="rank">${rank}</span><span class="preview-icon">${icon(iconName)}</span><strong>${title}</strong><p>${copy}</p><em>${value}<small>${unit}</small></em></article>`;
}

function scenarioRow(scenario: ScenarioMeta, selectedKey: PrototypeScenarioKey): string {
  const selected = scenario.key === selectedKey;
  return `<article class="scenario-row ${selected ? "is-selected" : ""}"><span class="round-icon">${icon(scenario.icon)}</span><div><h3>${scenario.title} <em>${scenario.badge}</em></h3><strong>먼저 보는 이유</strong><ul>${scenario.reasons.map((item) => `<li>${item}</li>`).join("")}</ul></div><button class="outline-button" type="button" data-scenario="${scenario.key}">${selected ? "비교에 담김" : "비교에 담기"}</button></article>`;
}

function aiSection(number: string, title: string, copy: string, visual: string, bullets: string[]): string {
  return `<article class="ai-section panel"><header><span>${number}</span><div><h3>${title}</h3><p>${copy}</p></div><button class="outline-button" type="button">자세히 보기</button></header><div class="ai-body"><div class="ai-how"><strong>${icon("bulb")}이렇게 봅니다</strong><ul>${bullets.map((item) => `<li>${item}</li>`).join("")}</ul></div><div class="ai-visual">${visual}</div></div><div class="helper-line">ⓘ 모든 역할을 낮추는 것이 아니라, 업무 영향과 조정 가능성이 낮은 영역부터 점검합니다.</div></article>`;
}

function matrixRows(presentation: PrototypePresentation): string {
  const baseline = presentation.comparison.rows.find((row) => row.scenarioId === "baseline_current_state");
  const band = presentation.comparison.rows.find((row) => row.scenarioId === "redesign_salary_bands");
  const ai = presentation.comparison.rows.find((row) => row.scenarioId === "ai_tooling_check");
  const cei = presentation.diagnosis.ceiScore;
  const ced = presentation.diagnosis.cedScore;
  const inversions = presentation.input.inversionCaseCount;
  return [
    matrixRow("연간 비용 변화", "(기준 대비)", "—", formatWonEok(baseline?.annualCostImpact ?? 0), formatWonEok(band?.annualCostImpact ?? 0), formatWonEok(ai?.annualCostImpact ?? 0)),
    matrixRow("월 burn 변화", "(기준 대비)", "—", formatWonEok((baseline?.annualCostImpact ?? 0) / 12), formatWonEok((band?.annualCostImpact ?? 0) / 12), formatWonEok((ai?.annualCostImpact ?? 0) / 12)),
    matrixRow("CEI 변화", "(보상 설명 가능성)", `${cei}/100`, `${cei} → ${Math.max(0, cei + (baseline?.explainabilityChange ?? 0))}|${signedNumber(baseline?.explainabilityChange ?? 0)}`, `${cei} → ${Math.min(100, cei + (band?.explainabilityChange ?? 0))}|${signedNumber(band?.explainabilityChange ?? 0)}`, `${cei} → ${Math.min(100, cei + (ai?.explainabilityChange ?? 0))}|${signedNumber(ai?.explainabilityChange ?? 0)}`),
    matrixRow("CED 변화", "(예외 누적 수준)", `${ced}/100`, `${ced} → ${Math.max(0, ced + (baseline?.exceptionDebtChange ?? 0))}|${signedNumber(baseline?.exceptionDebtChange ?? 0)}`, `${ced} → ${Math.max(0, ced + (band?.exceptionDebtChange ?? 0))}|${signedNumber(band?.exceptionDebtChange ?? 0)}`, `${ced} → ${Math.max(0, ced + (ai?.exceptionDebtChange ?? 0))}|${signedNumber(ai?.exceptionDebtChange ?? 0)}`),
    matrixRow("역전 케이스 변화", "(건)", `${inversions}건`, `${inversions}건 → ${Math.max(0, inversions + (baseline?.exceptionDebtChange ?? 0))}건|${signedNumber(baseline?.exceptionDebtChange ?? 0)}`, `${inversions}건 → ${Math.max(0, inversions + (band?.exceptionDebtChange ?? 0))}건|${signedNumber(band?.exceptionDebtChange ?? 0)}`, `${inversions}건 → ${Math.max(0, inversions + (ai?.exceptionDebtChange ?? 0))}건|${signedNumber(ai?.exceptionDebtChange ?? 0)}`),
    matrixRow("실행 난이도", "", "보통", burdenLabel(baseline?.implementationBurden), burdenLabel(band?.implementationBurden), burdenLabel(ai?.implementationBurden)),
    matrixRow("커뮤니케이션 난이도", "", "보통", "보통", "쉬움", "어려움"),
  ].join("");
}

function matrixRow(label: string, sub: string, baseline: string, current: string, band: string, ai: string): string {
  return `<div class="matrix-label"><strong>${label}</strong><small>${sub}</small></div>${matrixCell(baseline)}${matrixCell(current)}${matrixCell(band, true)}${matrixCell(ai)}`;
}

function matrixCell(value: string, bars = false): string {
  const [main, sub] = value.split("|");
  const trimmedSub = sub?.trim() || "";
  const deltaType = trimmedSub.startsWith("-") ? "down" : trimmedSub.startsWith("+") ? "up" : "";
  const hasScoreChange = /\d+\s*→\s*\d+/.test(main) || /\d+\/100/.test(main);
  const hasAmountBars = bars || /억|명|건/.test(main);
  const hasDifficultyBars = /보통|쉬움|어려움/.test(main);
  return `<div class="matrix-cell"><strong>${main}</strong>${trimmedSub ? `<small class="delta ${deltaType}">${trimmedSub}</small>` : ""}${hasScoreChange ? scoreTrack(main) : ""}${hasAmountBars ? `<span class="micro-bars ${bars ? "blue-bars" : "muted-bars"}"><i></i><i></i><i></i><i></i></span>` : ""}${hasDifficultyBars ? difficultyBars(main) : ""}</div>`;
}

function difficultyBars(value: string): string {
  const level = value === "어려움" ? "hard" : value === "쉬움" ? "easy" : "normal";
  return `<span class="difficulty-bars ${level}"><i></i><i></i><i></i></span>`;
}

function scoreTrack(value: string): string {
  const numbers = value.match(/\d+/g)?.map(Number) || [];
  const end = Math.min(100, numbers.at(-1) || 58);
  return `<span class="score-track"><i style="width:${end}%"></i></span>`;
}

function memoChoiceRow(selectedKey: PrototypeScenarioKey): string {
  return `<section class="memo-row"><span class="round-icon">${icon("scale")}</span><h3>먼저 비교한 안</h3><div class="choice-options"><button class="${selectedKey === "current" ? "is-selected" : ""}">현재 상태 유지<br /><small>기준 시나리오</small></button><button class="${selectedKey === "band" ? "is-selected" : ""}">연봉 밴드 재설계 ${selectedKey === "band" ? icon("check") : ""}<br /><small>선택됨</small></button><button class="${selectedKey === "ai" ? "is-selected" : ""}">채용 지연 + AI 도구<br /><small>비교 안</small></button></div></section>`;
}

function memoRow(iconName: string, title: string, items: string[]): string {
  return `<section class="memo-row"><span class="round-icon">${icon(iconName)}</span><h3>${title}</h3><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></section>`;
}

function checkRow(title: string, copy: string): string {
  return `<div class="check-row">${icon("check")}<div><strong>${title}</strong>${copy ? `<p>${copy}</p>` : ""}</div></div>`;
}

function insight(iconName: string, copy: string): string {
  return `<div class="insight-row"><span>${icon(iconName)}</span><p>${copy}</p></div>`;
}

function reasonRow(iconName: string, copy: string): string {
  return `<div class="reason-row"><span>${icon(iconName)}</span><p>${copy}</p></div>`;
}

function methodRow(iconName: string, title: string, copy: string): string {
  return `<div class="method-row"><span>${icon(iconName)}</span><div><strong>${title}</strong><p>${copy}</p></div></div>`;
}

function hiringBars(presentation: PrototypePresentation): string {
  const labels = ["제품", "마케팅", "디자인", "운영", "기타"];
  const pressure = Math.min(1, presentation.diagnosis.payrollIncreaseRate);
  return `<div class="bar-chart"><div class="legend"><span><i></i>기존 계획</span><span><i></i>3~6개월 지연 시</span></div>${labels.map((label, index) => `<div class="bar-pair"><small>${label}</small><span style="height:${42 - index * 3}px"></span><b style="height:${Math.max(18, 36 - index * 3 - pressure * 10)}px"></b></div>`).join("")}</div>`;
}

function seniorDiagram(): string {
  return `<div class="senior-diagram"><div class="role-card">실행 중심 역할<br /><small>(집행·전문)</small></div><div class="role-card">조율 중심 역할<br /><small>(기획·조율·의사결정)</small></div><span class="redistribution-arrow top"><svg viewBox="0 0 100 42" aria-hidden="true"><path d="M4 24 C32 6 62 6 92 24"/><path d="M84 14 94 24 80 27"/></svg></span><strong>Senior /<br />조율 역할</strong><span class="redistribution-arrow bottom"><svg viewBox="0 0 100 42" aria-hidden="true"><path d="M4 18 C32 36 62 36 92 18"/><path d="M80 15 94 18 84 29"/></svg></span><div class="role-card result">성과 및 조직<br />레버리지 확대</div></div>`;
}

function lineChart(): string {
  return `<svg class="line-chart" viewBox="0 0 180 86" aria-label="급여 총액 추이"><g stroke="#E6EAF0"><line x1="12" y1="18" x2="170" y2="18"/><line x1="12" y1="42" x2="170" y2="42"/><line x1="12" y1="66" x2="170" y2="66"/></g><path d="M14 64 L36 50 L52 42 L72 52 L92 44 L110 38 L132 28 L154 31 L170 20" fill="none" stroke="#2F7CF6" stroke-width="3"/><g fill="#2F7CF6"><circle cx="14" cy="64" r="3"/><circle cx="36" cy="50" r="3"/><circle cx="52" cy="42" r="3"/><circle cx="72" cy="52" r="3"/><circle cx="92" cy="44" r="3"/><circle cx="110" cy="38" r="3"/><circle cx="132" cy="28" r="3"/><circle cx="154" cy="31" r="3"/><circle cx="170" cy="20" r="3"/></g></svg>`;
}

function recommendationMetas(presentation: PrototypePresentation): ScenarioMeta[] {
  const metas = presentation.recommendations.map((recommendation) => scenarioMetaForId(recommendation.scenarioId));
  if (!metas.some((scenario) => scenario.key === presentation.selectedScenario.key)) metas.splice(1, 0, presentation.selectedScenario);
  return metas;
}

function previewValueForScenario(presentation: PrototypePresentation, scenario: ScenarioMeta): string {
  if (scenario.id === "baseline_current_state") return "0원";
  const row = presentation.comparison.rows.find((item) => item.scenarioId === scenario.id);
  return row ? formatWonEok(row.annualCostImpact) : "검토";
}

function burdenLabel(value: "low" | "medium" | "high" | undefined): string {
  if (value === "low") return "쉬움";
  if (value === "high") return "어려움";
  return "보통";
}

function signedNumber(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function validateFieldValue(name: string, value: string, type: string): string {
  if (type === "number" && value !== "" && Number(value) < 0) return "음수 값은 사용할 수 없습니다.";
  if (name === "notes" && containsPiiLikeText(value)) return "개인 식별 정보는 입력하지 마세요. 집계값만 사용합니다.";
  return "";
}

function containsPiiLikeText(value: string): boolean {
  return /(@|010-?\d{4}-?\d{4}|\d{6}-[1-4]\d{6}|주민등록|이메일|전화번호|사번)/.test(value);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

function logoIcon(): string {
  return `<svg viewBox="0 0 32 32" role="img"><path d="M7 20.5c0-7.3 4.1-12 9-12s9 4.7 9 12c0 2.2-1.7 3.9-3.8 3.9-2 0-3.4-1.3-4.3-3.2-.4-.8-1.4-.8-1.8 0-.9 1.9-2.3 3.2-4.3 3.2C8.7 24.4 7 22.7 7 20.5Z" fill="currentColor" /></svg>`;
}

function icon(name: string): string {
  const paths: Record<string, string> = {
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
