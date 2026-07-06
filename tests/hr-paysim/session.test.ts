import assert from "node:assert/strict";
import test from "node:test";
import {
  completeStep,
  createInitialSession,
  firstIncompleteStep,
  loadSession,
  resolveGuardedStep,
  updateInputDraft,
  updateScenarioAssumptions,
} from "../../src/lib/hr-paysim/session.ts";

test("createInitialSession starts at entry with no completed steps", () => {
  const session = createInitialSession();
  assert.equal(session.currentStep, "entry");
  assert.deepEqual(session.completedSteps, []);
  assert.equal(session.mode, "preview");
});

test("completeStep unlocks the requested next step", () => {
  const session = completeStep(createInitialSession(), "entry", "intake");
  assert.equal(session.currentStep, "intake");
  assert.deepEqual(session.completedSteps, ["entry"]);
});

test("firstIncompleteStep returns the earliest unfinished step", () => {
  const session = completeStep(createInitialSession(), "entry", "intake");
  assert.equal(firstIncompleteStep(session), "intake");
});

test("resolveGuardedStep blocks direct future jumps", () => {
  const session = completeStep(createInitialSession(), "entry", "intake");
  assert.equal(resolveGuardedStep(session, "comparison"), "intake");
});

test("updateInputDraft marks downstream calculated results stale", () => {
  const session = updateInputDraft(createInitialSession(), {
    employeeCount: 120,
    plannedHires: 5,
    basePayrollAnnual: 7200000000,
    variablePayAnnual: 800000000,
    benefitsAnnual: 600000000,
    exceptionRaiseCount: 1,
    inversionCaseCount: 0,
    salaryBandExists: true,
    currentAiToolingLevel: "none",
  });
  assert.equal(session.stale.diagnosis, true);
  assert.equal(session.stale.recommendations, true);
  assert.equal(session.stale.comparison, true);
  assert.equal(session.stale.memoPreview, true);
});

test("updateScenarioAssumptions marks comparison and memo preview stale", () => {
  const session = updateScenarioAssumptions(createInitialSession(), {
    baseline_current_state: { note: "keep" },
  });
  assert.equal(session.stale.diagnosis, false);
  assert.equal(session.stale.recommendations, false);
  assert.equal(session.stale.comparison, true);
  assert.equal(session.stale.memoPreview, true);
});

test("loadSession falls back to a clean session on invalid JSON", () => {
  const storage = {
    getItem: () => "{not-json",
    setItem: () => undefined,
    removeItem: () => undefined,
  };
  assert.equal(loadSession(storage).currentStep, "entry");
});
