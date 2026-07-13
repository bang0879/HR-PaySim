import type { Ref } from "react";
import type { createDecisionRoomViewModel } from "../decision-room/decisionRoomViewModel.ts";

type IntroductionModel = ReturnType<
  typeof createDecisionRoomViewModel
>["introduction"];

export function SessionIntroductionScreen({
  model,
  headingRef,
  onNext,
}: {
  model: IntroductionModel;
  headingRef: Ref<HTMLHeadingElement>;
  onNext(): void;
}) {
  return (
    <section className="dr-screen dr-introduction" data-screen="introduction">
      <div className="dr-hero dr-hero-introduction">
        <div>
          <p className="dr-eyebrow">{model.heading}</p>
          <h1 ref={headingRef} tabIndex={-1} data-conclusion-heading="true">
            {model.conclusion}
          </h1>
          <p className="dr-lead">{model.scope}</p>
        </div>
        <aside className="dr-duration" aria-label="예상 진행 시간">
          <span>함께 확인하는 시간</span>
          <strong>45–60</strong>
          <small>분</small>
        </aside>
      </div>

      <div className="dr-intro-grid">
        <section className="dr-panel">
          <p className="dr-section-kicker">{model.sectionLabel}</p>
          <h2>실제 자료에서 다음 세 가지를 확인합니다.</h2>
          <ol className="dr-output-list">
            {model.outputs.map((output, index) => (
              <li key={output}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{output}</strong>
              </li>
            ))}
          </ol>
        </section>

        <section className="dr-panel dr-panel-muted">
          <p className="dr-section-kicker">금번 진단에서 판단하지 않는 내용</p>
          <h2>사람을 평가하는 진단이 아니라, 현재 자료로 확인할 수 있는 회사 기준을 정리합니다.</h2>
          <ul className="dr-check-list">
            {model.nonClaims.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="dr-duration-line">{model.duration}</p>
        </section>
      </div>

      <footer className="dr-action-bar">
        <p>{model.nextStepSummary}</p>
        <button className="dr-primary" type="button" onClick={onNext} data-primary-action="true">
          {model.primaryAction}
          <span aria-hidden="true">→</span>
        </button>
      </footer>
    </section>
  );
}
