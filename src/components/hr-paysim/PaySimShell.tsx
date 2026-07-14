import type { ReactNode } from "react";
import type { PaySimStep } from "../../lib/hr-paysim/domain.ts";
import type { PaySimSessionState } from "../../lib/hr-paysim/session.ts";
import { PAY_SIM_STEPS } from "../../routes/hr-paysim/stepRegistry.ts";
import { PaySimStepper } from "./PaySimStepper";

interface PaySimShellProps {
  session: PaySimSessionState;
  children: ReactNode;
  primaryDisabled?: boolean;
  controlMessage: string;
  onBack(): void;
  onNext(): void;
  onReset(): void;
  onStepSelect(step: PaySimStep): void;
}

export function PaySimShell({
  session,
  children,
  primaryDisabled = false,
  controlMessage,
  onBack,
  onNext,
  onReset,
  onStepSelect,
}: PaySimShellProps) {
  const currentIndex = PAY_SIM_STEPS.findIndex((step) => step.id === session.currentStep);
  const current = PAY_SIM_STEPS[currentIndex] ?? PAY_SIM_STEPS[0];
  const isFirst = session.currentStep === "entry";
  const isLast = session.currentStep === "memo_preview";

  return (
    <div className="app-frame">
      <aside className="utility-rail" aria-label="앱 도구">
        <strong className="utility-logo">HR</strong>
        <button className="utility-button is-active" type="button" aria-label="HR PaySim">
          ◆
        </button>
        <button className="utility-button" type="button" aria-label="도움말">
          ?
        </button>
      </aside>
      <section className="product-shell">
        <header className="topbar">
          <div className="brand-lockup">
            <strong>HR PaySim</strong>
            <span>보상 거버넌스 시뮬레이터</span>
          </div>
          <div className="topbar-actions">
            <span className="mode-pill">{session.mode === "hr_prism_triggered" ? "HR Prism 연계" : "Preview"}</span>
            <button className="outline-button" type="button" onClick={onReset}>
              처음으로
            </button>
          </div>
        </header>
        <div className="app-body">
          <aside className="flow-rail">
            <PaySimStepper
              steps={PAY_SIM_STEPS}
              currentStep={session.currentStep}
              completedSteps={session.completedSteps}
              stale={session.stale}
              onStepSelect={onStepSelect}
            />
          </aside>
          <main className="workspace">
            <section className="screen" aria-live="polite">
              <div className="screen-header">
                <div>
                  <h1 tabIndex={-1} data-route-heading="true">
                    {currentIndex + 1}. {current.title}
                  </h1>
                  <p>{current.subtitle}</p>
                </div>
              </div>
              {children}
            </section>
            <footer className="flow-controls">
              <button className="secondary-button" type="button" onClick={onBack} disabled={isFirst}>
                이전 단계
              </button>
              <p>{controlMessage}</p>
              <button className="primary-button" type="button" onClick={onNext} disabled={primaryDisabled} data-primary-cta="true">
                {isLast ? "완료" : "다음으로"}
              </button>
            </footer>
          </main>
        </div>
      </section>
    </div>
  );
}
