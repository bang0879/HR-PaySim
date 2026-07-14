import type { PaySimStep, PaySimStepDefinition } from "../../lib/hr-paysim/domain.ts";

interface PaySimStepperProps {
  steps: PaySimStepDefinition[];
  currentStep: PaySimStep;
  completedSteps: PaySimStep[];
  stale: {
    diagnosis: boolean;
    recommendations: boolean;
    comparison: boolean;
    memoPreview: boolean;
  };
  onStepSelect(step: PaySimStep): void;
}

const staleStepMap: Partial<Record<PaySimStep, keyof PaySimStepperProps["stale"]>> = {
  diagnosis: "diagnosis",
  recommendations: "recommendations",
  comparison: "comparison",
  memo_preview: "memoPreview",
};

export function PaySimStepper({ steps, currentStep, completedSteps, stale, onStepSelect }: PaySimStepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const firstLockedIndex = steps.findIndex((step) => !completedSteps.includes(step.id) && step.id !== currentStep);

  return (
    <nav className="stepper" aria-label="HR PaySim 진행 단계">
      <p className="stepper-position" aria-live="polite">
        {currentIndex + 1} / {steps.length}
      </p>
      {steps.map((step, index) => {
        const staleKey = staleStepMap[step.id];
        const isCurrent = step.id === currentStep;
        const isComplete = completedSteps.includes(step.id) && !isCurrent;
        const isLocked = firstLockedIndex >= 0 && index > firstLockedIndex;
        const isStale = staleKey ? stale[staleKey] : false;
        return (
          <button
            key={step.id}
            className={["step-button", isCurrent ? "is-current" : "", isComplete ? "is-complete" : "", isLocked ? "is-locked" : "", isStale ? "is-stale" : ""]
              .filter(Boolean)
              .join(" ")}
            type="button"
            aria-current={isCurrent ? "step" : undefined}
            disabled={isLocked}
            onClick={() => onStepSelect(step.id)}
          >
            <span className="step-number" aria-hidden="true">
              {isComplete ? "✓" : index + 1}
            </span>
            <span className="step-copy">
              <strong>{step.title}</strong>
              <small>{step.subtitle}</small>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
