import { useMemo, useState } from "react";
import type { DiagnosisResult, QuickInputDraft, ScenarioId, ScenarioRecommendation } from "../../../lib/hr-paysim/domain.ts";
import type { AggregateConsentState, AggregateLogPayload } from "../../../lib/hr-paysim/consent.ts";
import type { InterpretationText } from "../../../lib/hr-paysim/copy.ts";
import type { ScenarioComparisonResult } from "../../../lib/hr-paysim/calculations.ts";
import type { PaySimSessionState } from "../../../lib/hr-paysim/session.ts";
import { containsPiiLikeText, validateQuickInput } from "../../../lib/hr-paysim/validation.ts";

interface ScreenProps {
  session: PaySimSessionState;
  diagnosis?: DiagnosisResult;
  interpretation?: InterpretationText;
  recommendations: ScenarioRecommendation[];
  comparison?: ScenarioComparisonResult;
  memoText: string;
  consent: AggregateConsentState;
  payload: AggregateLogPayload | null;
  onUseSample(): void;
  onModeSelect(mode: PaySimSessionState["mode"]): void;
  onSubmitInput(input: QuickInputDraft): void;
  onToggleScenario(scenarioId: ScenarioId): void;
  onConsentChange(consent: AggregateConsentState): void;
}

export function EntryGate({ session, onModeSelect }: ScreenProps) {
  return (
    <div className="entry-layout">
      <section className="panel hero-panel">
        <p className="eyebrow">HR PaySim v1.0</p>
        <h2>보상 거버넌스 의사결정을 단계별로 점검합니다.</h2>
        <p>
          집계 수준의 보상 구조, 예외 인상, 채용 계획을 바탕으로 진단과 시나리오 비교, 논의용 메모 preview까지 연결합니다.
        </p>
      </section>
      <section className="mode-grid" aria-label="시작 모드 선택">
        <button className={session.mode === "hr_prism_triggered" ? "mode-card is-selected" : "mode-card"} type="button" onClick={() => onModeSelect("hr_prism_triggered")}>
          <strong>HR Prism 결과에서 이어서 보기</strong>
          <span>보상 리스크가 감지된 맥락을 유지하고 시작합니다.</span>
        </button>
        <button className={session.mode === "preview" ? "mode-card is-selected" : "mode-card"} type="button" onClick={() => onModeSelect("preview")}>
          <strong>Preview로 직접 보기</strong>
          <span>샘플 또는 직접 입력으로 전체 flow를 확인합니다.</span>
        </button>
      </section>
    </div>
  );
}

export function IntakeMethodSelector({ session, onUseSample, onSubmitInput }: ScreenProps) {
  const initial = session.inputDraft;
  const [form, setForm] = useState({
    employeeCount: String(initial?.employeeCount ?? 120),
    plannedHires: String(initial?.plannedHires ?? 12),
    basePayrollAnnual: String(initial?.basePayrollAnnual ?? 7200000000),
    variablePayAnnual: String(initial?.variablePayAnnual ?? 800000000),
    benefitsAnnual: String(initial?.benefitsAnnual ?? 600000000),
    exceptionRaiseCount: String(initial?.exceptionRaiseCount ?? 2),
    inversionCaseCount: String(initial?.inversionCaseCount ?? 1),
    salaryBandExists: String(initial?.salaryBandExists ?? true),
    currentAiToolingLevel: initial?.currentAiToolingLevel ?? "unanswered",
    note: "",
  });
  const draft = useMemo<QuickInputDraft>(
    () => ({
      employeeCount: Number(form.employeeCount),
      plannedHires: Number(form.plannedHires),
      basePayrollAnnual: Number(form.basePayrollAnnual),
      variablePayAnnual: Number(form.variablePayAnnual),
      benefitsAnnual: Number(form.benefitsAnnual),
      exceptionRaiseCount: Number(form.exceptionRaiseCount),
      inversionCaseCount: Number(form.inversionCaseCount),
      salaryBandExists: form.salaryBandExists === "true",
      currentAiToolingLevel: form.currentAiToolingLevel as QuickInputDraft["currentAiToolingLevel"],
    }),
    [form],
  );
  const errors = [...validateQuickInput(draft), ...(containsPiiLikeText(form.note) ? ["개인 식별 정보는 입력하지 마세요. 집계값만 사용합니다."] : [])];

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="content-grid">
      <section className="panel">
        <h2>집계 수준으로만 입력합니다.</h2>
        <div className="form-grid">
          <NumberField label="전체 인원" value={form.employeeCount} onChange={(value) => update("employeeCount", value)} />
          <NumberField label="향후 12개월 채용" value={form.plannedHires} onChange={(value) => update("plannedHires", value)} />
          <NumberField label="기준 급여 총액" value={form.basePayrollAnnual} onChange={(value) => update("basePayrollAnnual", value)} />
          <NumberField label="변동 보상 총액" value={form.variablePayAnnual} onChange={(value) => update("variablePayAnnual", value)} />
          <NumberField label="복리후생 총액" value={form.benefitsAnnual} onChange={(value) => update("benefitsAnnual", value)} />
          <NumberField label="예외 인상 건수" value={form.exceptionRaiseCount} onChange={(value) => update("exceptionRaiseCount", value)} />
          <NumberField label="보상 역전 건수" value={form.inversionCaseCount} onChange={(value) => update("inversionCaseCount", value)} />
          <label className="field">
            <span>급여 밴드 존재</span>
            <select value={form.salaryBandExists} onChange={(event) => update("salaryBandExists", event.target.value)}>
              <option value="true">있음</option>
              <option value="false">없음</option>
            </select>
          </label>
          <label className="field">
            <span>AI 도구 수준</span>
            <select value={form.currentAiToolingLevel} onChange={(event) => update("currentAiToolingLevel", event.target.value)}>
              <option value="unanswered">답하지 않음</option>
              <option value="none">사용 없음</option>
              <option value="low">낮음</option>
              <option value="medium">중간</option>
              <option value="high">높음</option>
            </select>
          </label>
          <label className="field span-2">
            <span>검증용 메모</span>
            <input value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="개인 정보 없이 집계 맥락만 입력" />
          </label>
        </div>
        {errors.length > 0 ? (
          <div className="error-list" role="alert">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => onSubmitInput(draft)} disabled={errors.length > 0}>
            이 입력 저장
          </button>
          <button className="secondary-button" type="button" onClick={onUseSample}>
            샘플 데이터로 채우기
          </button>
          <button className="secondary-button" type="button" disabled>
            CSV 업로드는 v1.1
          </button>
        </div>
      </section>
      <section className="panel compact-list">
        <h3>입력 규칙</h3>
        <ul>
          <li>개인별 급여나 이름은 입력하지 않습니다.</li>
          <li>금액은 원 단위 집계값으로 입력합니다.</li>
          <li>AI 미응답과 사용 없음은 다르게 취급합니다.</li>
        </ul>
      </section>
    </div>
  );
}

export function AggregateReview({ session }: ScreenProps) {
  const input = session.inputDraft;
  if (!input) return <EmptyPanel title="입력값이 없습니다" body="샘플 데이터를 채우거나 직접 입력을 저장하면 이 단계에서 집계 내용을 확인합니다." />;
  return (
    <div className="metric-grid">
      <Metric label="전체 인원" value={`${input.employeeCount.toLocaleString()}명`} />
      <Metric label="채용 계획" value={`${input.plannedHires.toLocaleString()}명`} />
      <Metric label="예외 인상" value={`${input.exceptionRaiseCount.toLocaleString()}건`} />
      <Metric label="보상 역전" value={`${input.inversionCaseCount.toLocaleString()}건`} />
      <Metric label="급여 밴드" value={input.salaryBandExists ? "있음" : "없음"} />
      <Metric label="AI 도구 수준" value={aiLabel(input.currentAiToolingLevel)} />
    </div>
  );
}

export function GovernanceDiagnosis({ diagnosis }: ScreenProps) {
  if (!diagnosis) return <EmptyPanel title="진단을 계산할 수 없습니다" body="먼저 집계 입력을 저장해 주세요." />;
  return (
    <div className="metric-grid">
      <Metric label="보상 설명 가능성" value={`${diagnosis.ceiScore}/100`} note={diagnosis.ceiBand} />
      <Metric label="반복된 예외 인상" value={`${diagnosis.cedScore}/100`} note={diagnosis.cedBand} />
      <Metric label="보상 역전 신호" value={severityLabel(diagnosis.payInversionSeverity)} />
      <Metric label="현재 매달 나가는 인건비" value={`${Math.round(diagnosis.payrollIncreaseRate * 100)}% 채용 압력`} />
    </div>
  );
}

export function ExpertInterpretation({ interpretation }: ScreenProps) {
  if (!interpretation) return <EmptyPanel title="해석을 준비할 수 없습니다" body="진단 계산이 먼저 필요합니다." />;
  return (
    <section className="panel prose-panel">
      <h2>{interpretation.headline}</h2>
      <p>{interpretation.body}</p>
      <ul>
        {interpretation.supportingPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {interpretation.caution ? <p className="soft-warning">{interpretation.caution}</p> : null}
    </section>
  );
}

export function ScenarioRecommendations({ recommendations, session, onToggleScenario }: ScreenProps) {
  if (recommendations.length === 0) return <EmptyPanel title="추천을 만들 수 없습니다" body="진단 계산이 먼저 필요합니다." />;
  return (
    <div className="scenario-list">
      {recommendations.map((item) => {
        const selected = session.selectedScenarioIds.includes(item.scenarioId);
        return (
          <article className={selected ? "scenario-row is-selected" : "scenario-row"} key={item.scenarioId}>
            <div>
              <h3>
                {scenarioTitle(item.scenarioId)} <em>{priorityLabel(item.priority)}</em>
              </h3>
              <p>{item.reason}</p>
              <small>{item.whatItChecks}</small>
            </div>
            <button className="outline-button" type="button" onClick={() => onToggleScenario(item.scenarioId)}>
              {selected ? "비교에서 빼기" : "비교에 담기"}
            </button>
          </article>
        );
      })}
    </div>
  );
}

export function AIAdditionalCheck({ session }: ScreenProps) {
  const level = session.inputDraft?.currentAiToolingLevel ?? "unanswered";
  return (
    <section className="panel prose-panel">
      <h2>AI는 추가 검토 항목입니다.</h2>
      <p>현재 AI 도구 수준: {aiLabel(level)}</p>
      <p>AI는 채용과 보상 예산 판단에 영향을 주는 가정으로만 사용하며, 사람을 대체한다는 결론을 만들지 않습니다.</p>
    </section>
  );
}

export function ScenarioComparison({ comparison }: ScreenProps) {
  if (!comparison) return <EmptyPanel title="비교를 계산할 수 없습니다" body="비교할 시나리오와 집계 입력이 필요합니다." />;
  return (
    <div className="comparison-table">
      <span>안</span>
      <span>연간 비용 영향</span>
      <span>설명 가능성</span>
      <span>예외 부담</span>
      <span>얻는 것 / 감수할 것</span>
      {comparison.rows.map((row) => (
        <div className={row.scenarioId === comparison.bestFitScenarioId ? "comparison-row is-best" : "comparison-row"} key={row.scenarioId}>
          <strong>{scenarioTitle(row.scenarioId)}</strong>
          <span>{formatCurrency(row.annualCostImpact)}</span>
          <span>{signed(row.explainabilityChange)}</span>
          <span>{signed(row.exceptionDebtChange)}</span>
          <p>
            <b>얻는 것</b> {row.gain}
            <br />
            <b>감수할 것</b> {row.tradeoff}
          </p>
        </div>
      ))}
    </div>
  );
}

export function MemoPreview({ memoText, consent, payload, onConsentChange }: ScreenProps) {
  const [copied, setCopied] = useState(false);
  async function copyMemo() {
    await navigator.clipboard?.writeText(memoText);
    setCopied(true);
  }
  return (
    <div className="content-grid">
      <section className="panel">
        <h2>논의용 메모 preview</h2>
        <textarea className="memo-box" readOnly value={memoText} />
        <div className="button-row">
          <button className="primary-button" type="button" onClick={copyMemo}>
            메모 텍스트 복사
          </button>
          {copied ? <span className="success-copy">복사됨</span> : null}
        </div>
      </section>
      <section className="panel compact-list">
        <h3>Aggregate consent</h3>
        <label className="check-field">
          <input
            type="checkbox"
            checked={consent.consentForAggregateAnalysis}
            onChange={(event) => onConsentChange({ ...consent, consentForAggregateAnalysis: event.target.checked })}
          />
          집계 분석 개선에 동의
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={consent.allowCompanyName}
            onChange={(event) => onConsentChange({ ...consent, allowCompanyName: event.target.checked })}
          />
          회사명 포함 별도 허용
        </label>
        <input
          className="text-input"
          value={consent.companyName ?? ""}
          onChange={(event) => onConsentChange({ ...consent, companyName: event.target.value })}
          placeholder="회사명 (선택)"
        />
        <p>{payload ? "동의 payload가 로컬에서 생성되었습니다. 서버 전송은 하지 않습니다." : "동의하지 않아도 메모 preview는 사용할 수 있습니다."}</p>
      </section>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange(value: string): void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="number" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="panel empty-panel">
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <p>{note}</p> : null}
    </article>
  );
}

function scenarioTitle(id: ScenarioId): string {
  const titles: Record<ScenarioId, string> = {
    baseline_current_state: "현 상태 유지",
    resolve_pay_inversion: "보상 역전 해소",
    redesign_salary_bands: "급여 밴드 재설계",
    forecast_payroll_growth: "급여 총액 예측",
    ai_tooling_check: "AI 도구 추가 검토",
    senior_orchestrator_premium: "Senior Orchestrator Premium",
  };
  return titles[id];
}

function priorityLabel(priority: ScenarioRecommendation["priority"]): string {
  if (priority === "primary") return "우선 추천";
  if (priority === "secondary") return "비교 추천";
  return "선택 검토";
}

function aiLabel(level: QuickInputDraft["currentAiToolingLevel"]): string {
  const labels: Record<QuickInputDraft["currentAiToolingLevel"], string> = {
    unanswered: "답하지 않음",
    none: "사용 없음",
    low: "낮음",
    medium: "중간",
    high: "높음",
  };
  return labels[level];
}

function severityLabel(severity: DiagnosisResult["payInversionSeverity"]): string {
  const labels: Record<DiagnosisResult["payInversionSeverity"], string> = {
    none: "없음",
    low: "낮음",
    medium: "중간",
    high: "높음",
  };
  return labels[severity];
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function formatCurrency(value: number): string {
  if (value === 0) return "0원";
  return `${Math.round(value / 100000000).toLocaleString()}억 원`;
}
