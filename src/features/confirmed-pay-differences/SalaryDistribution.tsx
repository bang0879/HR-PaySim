import type { createProductEngineerDecisionRoomViewModel } from "../decision-room/decisionRoomViewModel.ts";
import {
  FOUNDER_COPY,
  formatObservedTrendLabel,
  formatObservedTrendSummary,
} from "../../lib/hr-paysim/copy/founderCopy.ts";
import { createSalaryTenurePlot, type PlotCoordinate } from "./salaryTenurePlot.ts";

type EvidenceModel = ReturnType<
  typeof createProductEngineerDecisionRoomViewModel
>["evidence"];

export function SalaryDistribution({
  distribution,
  distributionKicker,
  distributionHeading,
}: {
  distribution: EvidenceModel["distribution"];
  distributionKicker: EvidenceModel["distributionKicker"];
  distributionHeading: EvidenceModel["distributionHeading"];
}) {
  const plot = createSalaryTenurePlot(distribution);
  const observedTrendLine = plot.observedTrend
    ? insetPlotLine(plot.observedTrend, 0.12)
    : null;
  const directionGuideLine = insetPlotLine(plot.directionGuide, 0.18);

  const [minimumSalary, midpointSalary, maximumSalary] = plot.salaryTicksKRW;
  const [minimumTenure, midpointTenure, maximumTenure] = plot.tenureTicksMonths;
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
          <p className="dr-plot-description" id="salary-tenure-description">
            가로 위치는 근속 개월, 세로 위치는 기본 연봉을 뜻합니다. 근속 개월을 확인할 수 있는 직원 전체를 표시합니다.
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
                aria-label="직원별 근속 개월과 기본 연봉 분포"
                aria-describedby="salary-tenure-description salary-tenure-summary salary-tenure-guide-limit"
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
                  <line
                    className="dr-direction-guide-line"
                    x1={directionGuideLine.start.xPercent}
                    y1={100 - directionGuideLine.start.yPercent}
                    x2={directionGuideLine.end.xPercent}
                    y2={100 - directionGuideLine.end.yPercent}
                  />
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
                    aria-label={`${employeeLabel}, 근속 ${row.tenureMonths}개월, 기본 연봉 ${row.salary}`}
                  >
                    <span className="dr-salary-person-dot" aria-hidden="true" />
                    <span className="dr-salary-person-label" aria-hidden="true">
                      <strong>{employeeLabel}</strong>
                      <small>{row.salary}</small>
                    </span>
                  </div>
                ))}
              </div>
              <div className="dr-tenure-axis-horizontal" aria-hidden="true">
                <span>{minimumTenure}개월</span>
                <span>{midpointTenure}개월</span>
                <span>{maximumTenure}개월</span>
              </div>
              <strong className="dr-tenure-axis-label">가로축 · 근속 개월</strong>
            </div>
          </div>
          <div className="dr-trend-legend">
            {plot.observedTrend ? (
              <span className="is-observed">
                <i className="is-solid" />
                {formatObservedTrendLabel(plot.observedTrend.sampleSize)}
              </span>
            ) : null}
            <span className="is-guide">
              <i className="is-dashed" />
              {FOUNDER_COPY["screen.evidence.trend.guide_label"]}
            </span>
          </div>
          <p className="dr-trend-summary" id="salary-tenure-summary">{trendSummary}</p>
          <p className="dr-trend-non-claim" id="salary-tenure-guide-limit">
            {FOUNDER_COPY["screen.evidence.trend.guide_non_claim"]}
          </p>
        </>
      ) : (
        <p className="dr-plot-empty">근속 개월이 확인되지 않아 가로 위치를 표시하지 않았습니다.</p>
      )}

      {plot.missingTenure.length > 0 ? (
        <div className="dr-missing-tenure">
          <strong>근속 개월 확인 필요</strong>
          <ul>
            {plot.missingTenure.map((row) => (
              <li key={row.employeeLabel}>{row.employeeLabel} · {row.salary}</li>
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
type PlotLine = {
  start: PlotCoordinate;
  end: PlotCoordinate;
};

function insetPlotLine(line: PlotLine, insetRatio: number): PlotLine {
  const xInset = (line.end.xPercent - line.start.xPercent) * insetRatio;
  const yInset = (line.end.yPercent - line.start.yPercent) * insetRatio;

  return {
    start: {
      xPercent: line.start.xPercent + xInset,
      yPercent: line.start.yPercent + yInset,
    },
    end: {
      xPercent: line.end.xPercent - xInset,
      yPercent: line.end.yPercent - yInset,
    },
  };
}
