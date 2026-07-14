import type { PaySimStep, QuickInputDraft, ScenarioId } from "./domain.ts";

export const PAY_SIM_SESSION_STORAGE_KEY = "hr-paysim-session-v1";

export interface PaySimSessionState {
  currentStep: PaySimStep;
  completedSteps: PaySimStep[];
  mode: "hr_prism_triggered" | "preview";
  triggerReason?: string;
  inputDraft?: QuickInputDraft;
  selectedScenarioIds: ScenarioId[];
  scenarioAssumptions: Partial<Record<ScenarioId, unknown>>;
  stale: {
    diagnosis: boolean;
    recommendations: boolean;
    comparison: boolean;
    memoPreview: boolean;
  };
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const stepOrder: PaySimStep[] = [
  "entry",
  "intake",
  "aggregate_review",
  "diagnosis",
  "interpretation",
  "recommendations",
  "ai_check",
  "comparison",
  "memo_preview",
];

export function createInitialSession(mode: PaySimSessionState["mode"] = "preview"): PaySimSessionState {
  return {
    currentStep: "entry",
    completedSteps: [],
    mode,
    selectedScenarioIds: ["baseline_current_state"],
    scenarioAssumptions: {},
    stale: {
      diagnosis: false,
      recommendations: false,
      comparison: false,
      memoPreview: false,
    },
  };
}

export function completeStep(
  session: PaySimSessionState,
  completedStep: PaySimStep,
  nextStep: PaySimStep = nextStepAfter(completedStep),
): PaySimSessionState {
  const completedSteps = uniqueSteps([...session.completedSteps, completedStep]);
  return {
    ...session,
    completedSteps,
    currentStep: resolveGuardedStep({ ...session, completedSteps }, nextStep),
  };
}

export function firstIncompleteStep(session: PaySimSessionState): PaySimStep {
  return stepOrder.find((step) => !session.completedSteps.includes(step)) ?? "memo_preview";
}

export function canAccessStep(session: PaySimSessionState, targetStep: PaySimStep): boolean {
  const targetIndex = stepOrder.indexOf(targetStep);
  const firstIncompleteIndex = stepOrder.indexOf(firstIncompleteStep(session));
  return targetIndex <= firstIncompleteIndex;
}

export function resolveGuardedStep(session: PaySimSessionState, targetStep: PaySimStep): PaySimStep {
  return canAccessStep(session, targetStep) ? targetStep : firstIncompleteStep(session);
}

export function updateInputDraft(session: PaySimSessionState, inputDraft: QuickInputDraft): PaySimSessionState {
  const keepCompletedThrough = stepOrder.indexOf("aggregate_review");
  return {
    ...session,
    inputDraft,
    completedSteps: session.completedSteps.filter((step) => stepOrder.indexOf(step) <= keepCompletedThrough),
    stale: {
      diagnosis: true,
      recommendations: true,
      comparison: true,
      memoPreview: true,
    },
  };
}

export function updateScenarioAssumptions(
  session: PaySimSessionState,
  scenarioAssumptions: Partial<Record<ScenarioId, unknown>>,
): PaySimSessionState {
  return {
    ...session,
    scenarioAssumptions,
    stale: {
      ...session.stale,
      comparison: true,
      memoPreview: true,
    },
  };
}

export function saveSession(storage: StorageLike, session: PaySimSessionState): void {
  storage.setItem(PAY_SIM_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(storage: StorageLike): PaySimSessionState {
  const raw = storage.getItem(PAY_SIM_SESSION_STORAGE_KEY);
  if (!raw) return createInitialSession();

  try {
    const parsed = JSON.parse(raw) as Partial<PaySimSessionState>;
    return normalizeSession(parsed);
  } catch {
    return createInitialSession();
  }
}

export function clearSession(storage: StorageLike): void {
  storage.removeItem(PAY_SIM_SESSION_STORAGE_KEY);
}

function normalizeSession(value: Partial<PaySimSessionState>): PaySimSessionState {
  const base = createInitialSession(value.mode === "hr_prism_triggered" ? "hr_prism_triggered" : "preview");
  const completedSteps = uniqueSteps((value.completedSteps ?? []).filter(isPaySimStep));
  const currentStep = isPaySimStep(value.currentStep) ? value.currentStep : "entry";
  return {
    ...base,
    ...value,
    currentStep,
    completedSteps,
    selectedScenarioIds: uniqueScenarioIds(value.selectedScenarioIds ?? base.selectedScenarioIds),
    scenarioAssumptions: value.scenarioAssumptions ?? {},
    stale: {
      ...base.stale,
      ...value.stale,
    },
  };
}

function nextStepAfter(step: PaySimStep): PaySimStep {
  const index = stepOrder.indexOf(step);
  return stepOrder[Math.min(stepOrder.length - 1, index + 1)] ?? "entry";
}

function uniqueSteps(steps: PaySimStep[]): PaySimStep[] {
  return stepOrder.filter((step) => steps.includes(step));
}

function uniqueScenarioIds(ids: ScenarioId[]): ScenarioId[] {
  const allowed: ScenarioId[] = [
    "baseline_current_state",
    "resolve_pay_inversion",
    "redesign_salary_bands",
    "forecast_payroll_growth",
    "ai_tooling_check",
    "senior_orchestrator_premium",
  ];
  return allowed.filter((id) => ids.includes(id));
}

function isPaySimStep(value: unknown): value is PaySimStep {
  return typeof value === "string" && stepOrder.includes(value as PaySimStep);
}