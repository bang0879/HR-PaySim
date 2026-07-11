import { useMemo, useState } from "react";
import { sampleRosterPaste } from "../../lib/hr-paysim/rosterFixtures.ts";
import { createRosterDiagnosticViewModel } from "../../lib/hr-paysim/rosterDiagnosticViewModel.ts";

type RosterDiagnosticMode = "facilitated" | "demo";

interface RosterDiagnosticAppProps {
  mode: RosterDiagnosticMode;
}

export function RosterDiagnosticApp({ mode }: RosterDiagnosticAppProps) {
  const [rawPaste, setRawPaste] = useState(() => (mode === "demo" ? sampleRosterPaste : ""));
  const [confirmPiiColumnStripping, setConfirmPiiColumnStripping] = useState(mode === "demo");
  const viewModel = useMemo(
    () => createRosterDiagnosticViewModel(rawPaste, { confirmPiiColumnStripping }),
    [confirmPiiColumnStripping, rawPaste],
  );

  function loadSample() {
    setRawPaste(sampleRosterPaste);
    setConfirmPiiColumnStripping(true);
  }

  function handlePasteChange(value: string) {
    setRawPaste(value);
    setConfirmPiiColumnStripping(false);
  }

  function handlePrimaryAction() {
    if (viewModel.status === "empty") {
      loadSample();
      return;
    }
    if (viewModel.status === "needs_pii_confirmation") {
      setConfirmPiiColumnStripping(true);
    }
  }

  return (
    <div className="app-shell roster-app">
      <aside className="utility-rail" aria-label="앱 도구">
        <strong className="utility-logo">HR</strong>
        <a className="utility-button is-active" href="/hr-paysim/roster" aria-label="Roster 진단">◎</a>
        <a className="utility-button" href="/hr-paysim/entry" aria-label="기존 프로토타입">↩</a>
      </aside>

      <section className="product-shell">
        <header className="topbar">
          <div className="brand-lockup roster-brand">
            <div>
              <strong>HR PaySim</strong>
              <span>Compensation explainability roster slice</span>
            </div>
          </div>
          <div className="topbar-actions roster-actions">
            <span className="mode-pill">{mode === "demo" ? "Synthetic demo" : "Facilitated"}</span>
            <a className="outline-button route-link" href="/hr-paysim/entry">Prototype</a>
            <a className="outline-button route-link" href="/hr-paysim/demo">Demo</a>
          </div>
        </header>

        <main className="roster-workspace">
          <section className="roster-hero" aria-labelledby="roster-title">
            <div>
              <p className="eyebrow">직원 간 연봉 비교부터 확인</p>
              <h1 id="roster-title">직원이 서로 비교했을 때 설명하기 어려운 보상 관계를 찾습니다.</h1>
              <p>
                최소 roster만 붙여넣고, 식별 가능성이 있는 컬럼과 값은 계산 전에 차단합니다. 결과는 점수보다 직원 간 연봉 비교와 대표님이 검토할 자료를 먼저 보여줍니다.
              </p>
            </div>
            <div className="roster-status-card" data-status={viewModel.status}>
              <span>{viewModel.statusTitle}</span>
              <strong>{viewModel.summary.findingCount}</strong>
              <small>확인된 연봉 차이</small>
            </div>
          </section>

          <section className="roster-grid">
            <div className="roster-input-column">
              <section className="panel roster-panel">
                <header className="roster-panel-head">
                  <div>
                    <h2>Roster paste</h2>
                    <p>허용된 항목만 계산에 사용하며, 붙여넣은 원문은 저장하지 않습니다.</p>
                  </div>
                  <button className="secondary-button" type="button" onClick={loadSample}>샘플 불러오기</button>
                </header>
                <textarea
                  className="roster-textarea"
                  value={rawPaste}
                  onChange={(event) => handlePasteChange(event.target.value)}
                  spellCheck={false}
                  aria-label="de-identified roster paste"
                  placeholder="rowId, roleGroup, title, baseSalaryKRW, tenureMonths..."
                />
                <div className="roster-actions-row">
                  <button className="primary-button" type="button" onClick={handlePrimaryAction}>
                    {viewModel.primaryActionLabel}
                  </button>
                  <span>accepted {viewModel.summary.acceptedRowCount} rows · blocked {viewModel.summary.blockedRowCount} rows</span>
                </div>
              </section>

              <StatusPanel viewModel={viewModel} />
              <PreviewPanel viewModel={viewModel} />
            </div>

            <section className="panel roster-panel roster-findings-panel" aria-labelledby="finding-title">
              <header className="roster-panel-head">
                <div>
                  <h2 id="finding-title">확인된 연봉 차이</h2>
                  <p>자동 우선순위 없이 역할별 연봉 차이를 모두 보여줍니다.</p>
                </div>
                <span className="count-pill">{viewModel.summary.roleGroupCount} groups</span>
              </header>
              {viewModel.canShowFindings && viewModel.findingCards.length > 0 ? (
                <div className="finding-card-list">
                  {viewModel.findingCards.map((finding) => (
                    <article className="finding-card" key={finding.id}>
                      <div className="finding-card-head">
                        <span>{finding.type}</span>
                        <strong>{finding.roleGroup}</strong>
                      </div>
                      <h3>{finding.title}</h3>
                      <p>{finding.defensibilityQuestion}</p>
                      <dl className="finding-metrics">
                        <div><dt>headline</dt><dd>{finding.headlineLabel}</dd></div>
                        <div><dt>floor</dt><dd>{finding.correctionFloorLabel}</dd></div>
                        <div><dt>전체 연봉 합계 맥락</dt><dd>{finding.exposurePayrollLabel}</dd></div>
                      </dl>
                      <ul>
                        {finding.evidence.slice(0, 2).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-findings">
                  <strong>{viewModel.status === "needs_pii_confirmation" ? "개인정보 항목 확인 후 연봉 차이를 계산합니다." : "아직 계산할 연봉 차이가 없습니다."}</strong>
                  <p>{viewModel.statusCopy}</p>
                </div>
              )}
            </section>
          </section>
        </main>
      </section>
    </div>
  );
}

function StatusPanel({ viewModel }: { viewModel: ReturnType<typeof createRosterDiagnosticViewModel> }) {
  return (
    <section className="panel roster-panel compact-status" aria-live="polite">
      <h2>{viewModel.statusTitle}</h2>
      <p>{viewModel.statusCopy}</p>
      {viewModel.summary.rejectedColumnHeaders.length > 0 ? (
        <p className="warning-line">stripped columns: {viewModel.summary.rejectedColumnHeaders.join(", ")}</p>
      ) : null}
      {viewModel.warnings.map((warning) => <p className="warning-line" key={warning}>{warning}</p>)}
      {viewModel.errors.map((error) => <p className="error-line" key={error}>{error}</p>)}
    </section>
  );
}

function PreviewPanel({ viewModel }: { viewModel: ReturnType<typeof createRosterDiagnosticViewModel> }) {
  return (
    <section className="panel roster-panel roster-preview-panel">
      <header className="roster-panel-head">
        <div>
          <h2>De-identified preview</h2>
          <p>manager/team labels are opaque and row-level raw labels are not shown.</p>
        </div>
        <span className="count-pill">{viewModel.summary.acceptedRowCount} rows</span>
      </header>
      {viewModel.previewRows.length > 0 ? (
        <div className="roster-table" role="table" aria-label="normalized roster preview">
          <div role="row" className="roster-table-head">
            <span role="columnheader">row</span>
            <span role="columnheader">role</span>
            <span role="columnheader">salary</span>
            <span role="columnheader">tenure</span>
            <span role="columnheader">labels</span>
          </div>
          {viewModel.previewRows.map((row) => (
            <div role="row" className="roster-table-row" key={row.rowId}>
              <span role="cell">{row.rowId}</span>
              <span role="cell"><strong>{row.roleGroup}</strong><small>{row.title}</small></span>
              <span role="cell">{row.salaryLabel}</span>
              <span role="cell">{row.tenureLabel}</span>
              <span role="cell"><small>{row.managerLabel} · {row.teamLabel}</small></span>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-copy">계산에 사용할 행이 생기면 여기에서 먼저 확인합니다.</p>
      )}
    </section>
  );
}