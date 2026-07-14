import type { Ref } from "react";
import type { createDecisionRoomViewModel } from "../decision-room/decisionRoomViewModel.ts";
import { SubjectSelector } from "../decision-room/SubjectSelector.tsx";

type RuleModel = ReturnType<
  typeof createDecisionRoomViewModel
>["rule"];

export function CompanyRuleScreen({
  model,
  headingRef,
  onSubjectSelect,
  onNext,
}: {
  model: RuleModel;
  headingRef: Ref<HTMLHeadingElement>;
  onSubjectSelect(roleGroup: string): void;
  onNext(): void;
}) {
  return (
    <section className="dr-screen" data-screen="company_rule">
      <SubjectSelector
        subjects={model.subjects}
        activeId={model.activeRoleGroup}
        onSelect={onSubjectSelect}
      />

      <header className="dr-hero">
        <div>
          <p className="dr-eyebrow">{model.heading} · {model.activeRoleGroup}</p>
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

      {model.variant.kind === "level_order" ? (
        <section className="dr-panel dr-repeat-panel" aria-labelledby="level-rule-title">
          <div className="dr-panel-heading">
            <div>
              <p className="dr-section-kicker">현재 직급 순서와 기본 연봉을 비교한 계산</p>
              <h2 id="level-rule-title">{model.variant.heading}</h2>
            </div>
            <span>현재 자료만 사용</span>
          </div>
          <dl className="dr-level-metrics">
            {model.variant.metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.amount}</dd>
              </div>
            ))}
          </dl>
          <p className="dr-non-claim">{model.variant.nonClaim}</p>
        </section>
      ) : model.variant.kind === "pending" ? (
        <section className="dr-panel dr-repeat-panel" aria-labelledby="pending-rule-title">
          <div className="dr-panel-heading">
            <div>
              <p className="dr-section-kicker">계산 전에 확인할 내용</p>
              <h2 id="pending-rule-title">{model.variant.heading}</h2>
            </div>
            <span>확인 필요</span>
          </div>
          <ul className="dr-check-list">
            {model.variant.missing.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ) : (
        <section className="dr-panel dr-repeat-panel" aria-labelledby="repeat-result-title">
          <div className="dr-panel-heading">
            <div>
              <p className="dr-section-kicker">현재 확인된 채용 사례가 한 번 더 생긴다고 가정한 결과</p>
              <h2 id="repeat-result-title">{model.variant.heading}</h2>
            </div>
            <span>현재 자료에 있는 사례만 사용</span>
          </div>
          <div className="dr-repeat-metrics">
            {model.variant.metrics.map((metric) => (
              <article key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>
          <p className="dr-non-claim">{model.variant.nonClaim}</p>
        </section>
      )}

      <section className="dr-rule-layout">
        <div className="dr-panel">
          <p className="dr-section-kicker">앞으로도 같은 기준을 사용하려면 정해야 할 조건</p>
          <h2>현재 자료에서 확인한 내용과 회사가 앞으로 승인할 기준은 구분해야 합니다.</h2>
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
          <div className="dr-decision-choice is-selected">
            <span>{model.decision.companyAction}</span>
          </div>
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
