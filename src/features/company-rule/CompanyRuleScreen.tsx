import type { Ref } from "react";
import type { createProductEngineerDecisionRoomViewModel } from "../decision-room/decisionRoomViewModel.ts";

type RuleModel = ReturnType<
  typeof createProductEngineerDecisionRoomViewModel
>["rule"];

export function CompanyRuleScreen({
  model,
  headingRef,
  onNext,
}: {
  model: RuleModel;
  headingRef: Ref<HTMLHeadingElement>;
  onNext(): void;
}) {
  return (
    <section className="dr-screen" data-screen="company_rule">
      <header className="dr-hero">
        <div>
          <p className="dr-eyebrow">{model.heading} · Product Engineer</p>
          <h1 ref={headingRef} tabIndex={-1} data-conclusion-heading="true">
            {model.conclusion}
          </h1>
        </div>
      </header>

      <section className="dr-review-strip" aria-label="선택한 설명과 현재 확인된 기록">
        <article>
          <span>선택한 설명</span>
          <strong>{model.selectedExplanation}</strong>
        </article>
        <article>
          <span>현재 자료에서 확인된 기록</span>
          <strong>{model.selectedEvidence}</strong>
        </article>
      </section>

      <section className="dr-panel dr-repeat-panel" aria-labelledby="repeat-result-title">
        <div className="dr-panel-heading">
          <div>
            <p className="dr-section-kicker">현재 확인된 채용 사례가 한 번 더 생긴다고 가정한 결과</p>
            <h2 id="repeat-result-title">{model.observedRepeat.heading}</h2>
          </div>
          <span>현재 자료에 있는 사례만 사용</span>
        </div>
        <div className="dr-repeat-metrics">
          <article>
            <span>다음 채용자의 가정 기본 연봉</span>
            <strong>{model.observedRepeat.nextHireSalary}</strong>
          </article>
          <article>
            <span>새 채용자보다 기본 연봉이 낮은 기존 직원</span>
            <strong>{model.observedRepeat.affectedEmployees}</strong>
          </article>
          <article>
            <span>새 채용자와 기존 직원 사이의 가장 큰 기본 연봉 차이</span>
            <strong>{model.observedRepeat.maximumDifference}</strong>
          </article>
          <article>
            <span>현재 직원 비교와 새 채용자 비교를 합친 수</span>
            <strong>{model.observedRepeat.comparisonCount}</strong>
          </article>
        </div>
        <p className="dr-non-claim">{model.observedRepeat.nonClaim}</p>
      </section>

      <section className="dr-rule-layout">
        <div className="dr-panel">
          <p className="dr-section-kicker">같은 방식을 앞으로도 사용하려면 정해야 할 조건</p>
          <h2>현재 채용 사례에서 관찰된 내용과 회사가 앞으로 승인할 기준은 구분해야 합니다.</h2>
          <div className="dr-condition-grid">
            {model.ruleConditions.map((condition) => (
              <article key={condition.label}>
                <span>{condition.label}</span>
                <strong>{condition.observedContext}</strong>
                <small>{condition.approvalStatus}</small>
              </article>
            ))}
          </div>
          <p className="dr-non-claim">{model.boundedRuleNonClaim}</p>
        </div>

        <aside className="dr-panel dr-decision-card">
          <p className="dr-section-kicker">금번 진단에서 정한 회사 행동</p>
          <h2>{model.decision.heading}</h2>
          <label className="dr-decision-choice is-selected">
            <input type="radio" name="company-action" checked readOnly />
            <span>{model.decision.companyAction}</span>
          </label>
          <dl>
            <div>
              <dt>이 행동을 맡을 담당자</dt>
              <dd>{model.decision.owner}</dd>
            </div>
            <div>
              <dt>문서화를 마칠 시점</dt>
              <dd>{model.decision.due}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <footer className="dr-action-bar">
        <p>확인된 연봉 차이, 확인한 설명, 현재 기록, 아직 정하지 않은 조건과 다음 행동을 한 화면에 정리합니다.</p>
        <button className="dr-primary" type="button" onClick={onNext} data-primary-action="true">
          {model.primaryAction}
          <span aria-hidden="true">→</span>
        </button>
      </footer>
    </section>
  );
}
