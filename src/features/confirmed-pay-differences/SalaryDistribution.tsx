import type { EvidenceVisualization } from "../decision-room/decisionRoomViewModel.ts";
import {
  FOUNDER_COPY,
  formatObservedTrendLabel,
  formatObservedTrendSummary,
} from "../../lib/hr-paysim/copy/founderCopy.ts";
import { createSalaryCareerPlot } from "./salaryCareerPlot.ts";

type CareerVisualization = Extract<EvidenceVisualization, { kind: "career" }>;

export function SalaryDistribution({
  distribution,
  distributionKicker,
  distributionHeading,
}: {
  distribution: CareerVisualization["distribution"];
  distributionKicker: CareerVisualization["kicker"];
  distributionHeading: CareerVisualization["heading"];
}) {
  const plot = createSalaryCareerPlot(distribution);
  const observedTrendLine = plot.observedTrend;
  const [minimumSalary, midpointSalary, maximumSalary] = plot.salaryTicksKRW;
  const [minimumCareer, midpointCareer, maximumCareer] = plot.careerTicksMonths;
  const trendSummary = plot.observedTrend
    ? formatObservedTrendSummary({
        employeeCount: plot.observedTrend.sampleSize,
        direction: plot.observedTrend.direction,
      })
    : FOUNDER_COPY["screen.evidence.trend.unavailable"];

  return (
    <section className="dr-panel dr-distribution" aria-labelledby="salary-distribution-title">
      <div className="dr-panel-heading">
        <div>
          <p className="dr-section-kicker">{distributionKicker}</p>
          <h2 id="salary-distribution-title">{distributionHeading}</h2>
        </div>
        <span>직원 {distribution.length}명 전체</span>
      </div>

      {plot.points.length > 0 ? (
        <>
          <p className="dr-plot-description" id="salary-career-description">
            가로 위치는 관련 경력년수, 세로 위치는 기본 연봉을 뜻합니다. 관련 경력을 확인할 수 있는 직원 전체를 표시합니다.
          </p>
          <div className="dr-scatter-layout">
            <div className="dr-salary-axis-vertical" aria-hidden="true">
              <strong>세로축 · 기본 연봉</strong>
              <div>
                <span>{formatSalaryTick(maximumSalary)}</span>
                <span>{formatSalaryTick(midpointSalary)}</span>
                <span>{formatSalaryTick(minimumSalary)}</span>
              </div>
            </div>
            <div>
              <div
                className="dr-salary-plot"
                role="img"
                aria-label="직원별 관련 경력과 기본 연봉 분포"
                aria-describedby="salary-career-description salary-career-summary"
              >
                <svg
                  className="dr-plot-lines"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {observedTrendLine ? (
                    <line
                      className="dr-observed-trend-line"
                      x1={observedTrendLine.start.xPercent}
                      y1={100 - observedTrendLine.start.yPercent}
                      x2={observedTrendLine.end.xPercent}
                      y2={100 - observedTrendLine.end.yPercent}
                    />
                  ) : null}
                </svg>
                {plot.points.map(({ row, employeeLabel, xPercent, yPercent }) => (
                  <div
                    className={[
                      "dr-salary-person",
                      row.highlighted ? "is-highlighted" : "",
                      xPercent > 75 ? "is-label-left" : "",
                      yPercent > 78 ? "is-label-below" : "",
                    ].filter(Boolean).join(" ")}
                    key={employeeLabel}
                    style={{ left: `${xPercent}%`, bottom: `${yPercent}%` }}
                    data-x-percent={xPercent}
                    data-y-percent={yPercent}
                    aria-label={`${employeeLabel}, ${row.relevantExperience}, ${row.tenure}, 기본 연봉 ${row.salary}`}
                  >
                    <span className="dr-salary-person-dot" aria-hidden="true" />
                    <span className="dr-salary-person-label" aria-hidden="true">
                      <strong>{employeeLabel}</strong>
                      <small>{row.salary}</small>
                    </span>
                  </div>
                ))}
              </div>
              <div className="dr-career-axis-horizontal" aria-hidden="true">
                <span>{formatCareerTick(minimumCareer)}</span>
                <span>{formatCareerTick(midpointCareer)}</span>
                <span>{formatCareerTick(maximumCareer)}</span>
              </div>
              <strong className="dr-career-axis-label">가로축 · 관련 경력년수</strong>
            </div>
          </div>
          <div className="dr-trend-legend" aria-label="그래프 범례">
            <span className="is-employee">
              <i className="is-dot" />
              실제 직원
            </span>
            <span className="is-comparison">
              <i className="is-dot is-highlighted" />
              이번 비교
            </span>
            {plot.observedTrend ? (
              <span className="is-observed">
                <i className="is-solid" />
                {formatObservedTrendLabel(plot.observedTrend.sampleSize)}
              </span>
            ) : null}
          </div>
          <p className="dr-trend-summary" id="salary-career-summary">{trendSummary}</p>
        </>
      ) : (
        <p className="dr-plot-empty">
          관련 경력을 확인할 수 없어 경력축 비교를 표시하지 않았습니다. 아래 기본 연봉과 보조 증거는 계속 확인할 수 있습니다.
        </p>
      )}

      {plot.missingCareer.length > 0 ? (
        <div className="dr-missing-career">
          <strong>관련 경력 확인 필요</strong>
          <ul>
            {plot.missingCareer.map((row) => (
              <li key={row.employeeLabel}>
                {row.employeeLabel} · {row.salary} · {row.tenure}
                {row.levelLabel && row.levelLabel !== "none" ? ` · ${row.levelLabel}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="dr-distribution-legend">
        <strong>아래에서 가장 큰 차이가 난 직원 A와 직원 B를 자세히 비교합니다.</strong>
      </div>
    </section>
  );
}

function formatSalaryTick(value: number | undefined): string {
  if (value === undefined) return "-";
  return `${(value / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만원`;
}

function formatCareerTick(value: number | undefined): string {
  if (value === undefined) return "-";
  return `${(value / 12).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}년`;
}