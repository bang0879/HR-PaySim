import type { createProductEngineerDecisionRoomViewModel } from "../decision-room/decisionRoomViewModel.ts";

type EvidenceRows = ReturnType<
  typeof createProductEngineerDecisionRoomViewModel
>["evidence"]["evidenceRows"];

export function EvidenceTable({ rows }: { rows: EvidenceRows }) {
  return (
    <section className="dr-panel dr-evidence-table" aria-labelledby="comparison-evidence-title">
      <div className="dr-panel-heading">
        <div>
          <p className="dr-section-kicker">비교에 사용한 자료</p>
          <h2 id="comparison-evidence-title">판단에 사용한 네 가지 항목만 확인합니다.</h2>
        </div>
      </div>
      <div className="dr-table" role="table" aria-label="직원 A와 직원 B 비교 자료">
        <div className="dr-table-row dr-table-head" role="row">
          <span role="columnheader">구분</span>
          <span role="columnheader">역할</span>
          <span role="columnheader">근속 기간</span>
          <span role="columnheader">기본 연봉</span>
          <span role="columnheader">확인된 기록</span>
        </div>
        {rows.map((row) => (
          <div className="dr-table-row" role="row" key={row.employeeLabel}>
            <strong role="cell">{row.employeeLabel}</strong>
            <span role="cell">{row.role}</span>
            <span role="cell">{row.tenure}</span>
            <span role="cell">{row.salary}</span>
            <span role="cell">{row.documentedException}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
