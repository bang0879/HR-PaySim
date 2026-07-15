import type { Dispatch, Ref } from "react";
import { FOUNDER_COPY } from "../../lib/hr-paysim/copy/founderCopy.ts";
import type { EvidenceStatus, ExplanationBasis } from "../../lib/hr-paysim/review/types.ts";
import type { DecisionRoomAction } from "../../lib/hr-paysim/session/types.ts";
import type { createDecisionRoomViewModel } from "../decision-room/decisionRoomViewModel.ts";
import { SubjectSelector } from "../decision-room/SubjectSelector.tsx";
import { EvidenceTable } from "./EvidenceTable.tsx";
import { LevelOrderDistribution } from "./LevelOrderDistribution.tsx";
import { SalaryDistribution } from "./SalaryDistribution.tsx";

type EvidenceModel = ReturnType<
  typeof createDecisionRoomViewModel
>["evidence"];

export function ConfirmedPayDifferencesScreen({
  model,
  headingRef,
  subjectId,
  dispatch,
  onSubjectSelect,
  onNext,
}: {
  model: EvidenceModel;
  headingRef: Ref<HTMLHeadingElement>;
  subjectId: string;
  dispatch: Dispatch<DecisionRoomAction>;
  onSubjectSelect(roleGroup: string): void;
  onNext(): void;
}) {
  return (
    <section className="dr-screen" data-screen="confirmed_pay_differences">
      <SubjectSelector
        subjects={model.subjects}
        activeId={model.activeRoleGroup}
        onSelect={onSubjectSelect}
      />

      <header className="dr-hero dr-evidence-hero">
        <div>
          <p className="dr-eyebrow">{model.heading} · {model.activeRoleGroup}</p>
          <h1 ref={headingRef} tabIndex={-1} data-conclusion-heading="true">
            {model.conclusion}
          </h1>
          <p className="dr-lead">{model.supportingCopy}</p>
          <p className="dr-non-claim">{model.nonClaim}</p>
          <p className="dr-screen-task">
            <strong>{FOUNDER_COPY["screen.evidence.review_focus_label"]}</strong>
            <span>{model.actionPrompt}</span>
          </p>
        </div>
      </header>

      {model.visualization.kind === "career" ? (
        <SalaryDistribution
          distribution={model.visualization.distribution}
          distributionKicker={model.visualization.kicker}
          distributionHeading={model.visualization.heading}
        />
      ) : (
        <LevelOrderDistribution model={model.visualization} roleGroup={model.activeRoleGroup} />
      )}

      {model.cleanState ? (
        <aside className="dr-clean-state" aria-label="현재 자료에서 별도 검토가 필요하지 않은 역할">
          <strong>{model.cleanState.roleGroup}</strong>
          <p>{model.cleanState.statement}</p>
        </aside>
      ) : null}

      <section className="dr-highlight-card" aria-labelledby="highlighted-comparison-title">
        <div>
          <p className="dr-section-kicker">가장 큰 차이가 난 두 직원의 구체적인 비교</p>
          <h2 id="highlighted-comparison-title">
            {model.highlightedPair.lowerPaidLabel}와 {model.highlightedPair.higherPaidLabel}의 기본 연봉은 {model.highlightedPair.difference} 차이 납니다.
          </h2>
        </div>
        <div className="dr-pair">
          <article>
            <span>{model.highlightedPair.lowerPaidLabel}</span>
            <strong>{model.highlightedPair.lowerPaidSalary}</strong>
            <small>{model.highlightedPair.lowerPaidRelevantExperience}</small>
            <small>{model.highlightedPair.lowerPaidTenure}</small>
            <small>{model.highlightedPair.lowerPaidException}</small>
          </article>
          <div aria-label={`${model.highlightedPair.lowerPaidLabel}와 ${model.highlightedPair.higherPaidLabel}의 기본 연봉 ${model.highlightedPair.difference} 차이`}>
            <span aria-hidden="true">→</span>
            <strong>{model.highlightedPair.difference}</strong>
          </div>
          <article className="is-higher">
            <span>{model.highlightedPair.higherPaidLabel}</span>
            <strong>{model.highlightedPair.higherPaidSalary}</strong>
            <small>{model.highlightedPair.higherPaidRelevantExperience}</small>
            <small>{model.highlightedPair.higherPaidTenure}</small>
            <small>{model.highlightedPair.higherPaidException}</small>
          </article>
        </div>
      </section>

      <section className="dr-observations" aria-labelledby="supporting-observations-title">
        <div>
          <p className="dr-section-kicker">직원 A·B 외에 함께 확인한 연봉 비교</p>
          <h2 id="supporting-observations-title">{model.supportingObservationsHeading}</h2>
        </div>
        <ul>
          {model.supportingObservations.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="dr-question-card" aria-labelledby="explanation-question-title">
        <p className="dr-section-kicker">확인할 설명</p>
        <h2 id="explanation-question-title">{model.explanationQuestion}</h2>
        <fieldset className="dr-choice-grid">
          <legend>현재 회사 상황에 가장 가까운 설명 하나를 선택해 주세요.</legend>
          {model.explanationChoices.map((choice) => (
            <label key={choice.value} className={model.selectedExplanation === choice.value ? "is-selected" : ""}>
              <input
                type="radio"
                name="explanation"
                value={choice.value}
                checked={model.selectedExplanation === choice.value}
                onChange={() => dispatch({
                  type: "UPDATE_REVIEW",
                  themeId: subjectId,
                  patch: { explanationBasis: choice.value as ExplanationBasis },
                })}
              />
              <span>{choice.label}</span>
            </label>
          ))}
        </fieldset>

        {model.evidenceQuestion ? (
          <fieldset className="dr-evidence-question">
            <legend>{model.evidenceQuestion}</legend>
            <div>
              {model.evidenceChoices.map((choice) => (
                <label key={choice.value} className={model.selectedEvidence === choice.value ? "is-selected" : ""}>
                  <input
                    type="radio"
                    name="evidence"
                    value={choice.value}
                    checked={model.selectedEvidence === choice.value}
                    onChange={() => dispatch({
                      type: "UPDATE_REVIEW",
                      themeId: subjectId,
                      patch: { evidenceStatus: choice.value as EvidenceStatus },
                    })}
                  />
                  <span>{choice.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </section>

      <EvidenceTable rows={model.evidenceRows} />

      <footer className="dr-action-bar">
        <p>선택한 설명과 확인된 기록을 바탕으로, 같은 채용 사례가 한 번 더 생기면 기존 직원과의 연봉 차이가 어떻게 달라지는지 확인합니다.</p>
        <button className="dr-primary" type="button" onClick={onNext} data-primary-action="true">
          {model.primaryAction}
          <span aria-hidden="true">→</span>
        </button>
      </footer>
    </section>
  );
}
