import type { EvidenceVisualization } from "../decision-room/decisionRoomViewModel.ts";

type LevelOrderModel = Extract<EvidenceVisualization, { kind: "level_order" }>;

export function LevelOrderDistribution({ model }: { model: LevelOrderModel }) {
  return (
    <section className="dr-panel dr-level-order" aria-labelledby="level-order-title">
      <div className="dr-panel-heading">
        <div>
          <p className="dr-section-kicker">GTM 직급별 기본 연봉</p>
          <h2 id="level-order-title">AE1과 AE2의 기본 연봉을 직급별로 나누어 표시했습니다.</h2>
        </div>
        <span>직원 4명 전체</span>
      </div>
      <div className="dr-level-groups" role="img" aria-label="AE1과 AE2 직원의 기본 연봉 분포">
        {model.groups.map((group) => (
          <section key={group.levelLabel} aria-label={group.levelLabel}>
            <h3>{group.levelLabel}</h3>
            {group.employees.map((employee) => (
              <article
                className={employee.highlighted ? "is-highlighted" : ""}
                key={employee.employeeLabel}
              >
                <span>{employee.employeeLabel}</span>
                <strong>{employee.salary}</strong>
              </article>
            ))}
          </section>
        ))}
      </div>
      <dl className="dr-level-metrics">
        {model.metrics.map((metric) => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{metric.amount}</dd>
          </div>
        ))}
      </dl>
      <p className="dr-trend-non-claim">{model.nonClaim}</p>
    </section>
  );
}
