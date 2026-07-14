import { useState, type Ref } from "react";
import type { createDecisionRoomViewModel } from "../decision-room/decisionRoomViewModel.ts";

type ResultModel = ReturnType<
  typeof createDecisionRoomViewModel
>["result"];

export function SessionResultScreen({
  model,
  headingRef,
  onEnd,
}: {
  model: ResultModel;
  headingRef: Ref<HTMLHeadingElement>;
  onEnd(): void;
}) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const copyResult = async () => {
    const copyText = [
      model.heading,
      model.conclusion,
      model.summary,
      ...model.rows.flatMap((row) => [
        `검토 역할: ${row.roleGroup}`,
        `확인된 내용: ${row.confirmed}`,
        `확인한 설명: ${row.founderExplanation}`,
        `확인된 근거 또는 추가 확인 자료: ${row.evidence}`,
        `이번에 정한 사항: ${row.decision}`,
        `담당자: ${row.owner}`,
        `완료 또는 재검토 시점: ${row.due}`,
      ]),
      ...model.nextActions.map((item) => `${item.period}: ${item.action}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(copyText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <section className="dr-screen" data-screen="session_result">
      <header className="dr-hero dr-result-hero">
        <div>
          <p className="dr-eyebrow">{model.heading} · 선택한 세 역할</p>
          <h1 ref={headingRef} tabIndex={-1} data-conclusion-heading="true">
            {model.conclusion}
          </h1>
          <p className="dr-lead">{model.summary}</p>
        </div>
        <span className="dr-approved-stamp">{model.approvalStatus}</span>
      </header>

      <section className="dr-panel dr-record" aria-labelledby="reviewed-record-title">
        <div className="dr-panel-heading">
          <div>
            <p className="dr-section-kicker">금번 진단에서 확인한 기록</p>
            <h2 id="reviewed-record-title">역할별 확인 내용, 설명, 근거와 다음 행동을 한곳에 모았습니다.</h2>
          </div>
        </div>
        <div className="dr-record-grid" role="table" aria-label="금번 진단에서 확인한 기록">
          <div className="dr-record-head" role="row">
            <span role="columnheader">검토 역할</span>
            {model.columns.map((column) => <span role="columnheader" key={column}>{column}</span>)}
          </div>
          {model.rows.map((row) => (
            <div className="dr-record-row" role="row" key={row.roleGroup}>
              <div role="rowheader" className="dr-record-subject">
                <span className="dr-cell-label">검토 역할</span>
                <strong>{row.roleGroup}</strong>
              </div>
              {[row.confirmed, row.founderExplanation, row.evidence, row.decision, row.owner, row.due]
                .map((value, index) => (
                  <div role="cell" key={model.columns[index]}>
                    <span className="dr-cell-label">{model.columns[index]}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      {model.cleanState ? (
        <aside className="dr-clean-state" aria-label="현재 자료에서 별도 검토가 필요하지 않은 역할">
          <strong>{model.cleanState.roleGroup}</strong>
          <p>{model.cleanState.statement}</p>
        </aside>
      ) : null}

      {model.unselectedSubjects.length > 0 ? (
        <section className="dr-panel dr-unselected" aria-labelledby="unselected-subjects-title">
          <p className="dr-section-kicker">추가로 남겨 둔 비교</p>
          <h2 id="unselected-subjects-title">이번 세션에서 검토하지 않은 항목</h2>
          <ul>
            {model.unselectedSubjects.map((item) => <li key={item.id}>{item.roleGroup}</li>)}
          </ul>
        </section>
      ) : null}

      <section className="dr-result-grid">
        <div className="dr-panel">
          <p className="dr-section-kicker">실행 시점별로 정리한 다음 행동</p>
          <h2>다음 채용과 다음 인사평가 전에 아래 내용을 확인합니다.</h2>
          <div className="dr-next-actions">
            {model.nextActions.map((item) => (
              <article key={item.period + "-" + item.action}>
                <span>{item.period}</span>
                <strong>{item.action}</strong>
              </article>
            ))}
          </div>
        </div>
        <aside className="dr-panel dr-panel-muted">
          <p className="dr-section-kicker">금번 진단 결과가 의미하지 않는 내용</p>
          <h2>개인의 연봉이 맞거나 틀리다고 판정한 결과가 아닙니다.</h2>
          <ul className="dr-check-list">
            {model.nonClaims.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </aside>
      </section>

      <footer className="dr-result-actions">
        <div aria-live="polite">
          {copyStatus === "copied" ? <p>{model.copySuccess}</p> : null}
          {copyStatus === "failed" ? <p>{model.copyFailure}</p> : null}
        </div>
        <div>
          <button className="dr-secondary" type="button" onClick={() => window.print()}>
            {model.printAction}
          </button>
          <button className="dr-primary" type="button" onClick={copyResult} data-primary-action="true">
            {model.copyAction}
          </button>
          <button className="dr-danger" type="button" onClick={onEnd}>
            {model.endAction}
          </button>
        </div>
      </footer>
    </section>
  );
}
