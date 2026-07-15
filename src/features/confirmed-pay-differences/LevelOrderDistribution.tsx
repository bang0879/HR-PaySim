import type { EvidenceVisualization } from "../decision-room/decisionRoomViewModel.ts";

type LevelOrderModel = Extract<EvidenceVisualization, { kind: "level_order" }>;

export function LevelOrderDistribution({
  model,
  roleGroup,
}: {
  model: LevelOrderModel;
  roleGroup: string;
}) {
  const gradeLabels = model.groups.map(({ levelLabel }) => levelLabel);
  const gradeSummary = gradeLabels.length > 0 ? gradeLabels.join("·") : "입력된 직급";
  const employeeCount = model.groups.reduce(
    (total, group) => total + group.employees.length,
    0,
  );

  return (
    <section className="dr-panel dr-level-order" aria-labelledby="level-order-title">
      <div className="dr-panel-heading">
        <div>
          <p className="dr-section-kicker">{roleGroup} 직급별 기본 연봉</p>
          <h2 id="level-order-title">{gradeSummary}의 기본 연봉을 직급별로 나누어 표시했습니다.</h2>
        </div>
        <span>직원 {employeeCount}명 전체</span>
      </div>
      <div className="dr-level-groups" role="img" aria-label={`${gradeSummary} 직원의 기본 연봉 분포`}>
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
