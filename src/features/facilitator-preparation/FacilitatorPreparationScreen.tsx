import { useState } from "react";
import {
  FOUNDER_COPY,
  PREPARATION_ISSUE_COPY,
} from "../../lib/hr-paysim/copy/founderCopy.ts";
import {
  createEmptyPreparationResult,
  prepareProductEngineerRoster,
} from "../../lib/hr-paysim/preparation/prepareProductEngineerRoster.ts";
import type { KoreanRosterField } from "../../lib/hr-paysim/preparation/koreanRosterAdapter.ts";
import type {
  PreparationIssueCode,
  PreparationPreviewRow,
  ProductEngineerSessionDraft,
} from "../../lib/hr-paysim/preparation/types.ts";
import "./facilitatorPreparation.css";

export interface FacilitatorPreparationScreenProps {
  onStart: (draft: ProductEngineerSessionDraft) => void;
}

const issueLabels: Record<PreparationIssueCode, string> = PREPARATION_ISSUE_COPY;
const fieldLabels: Record<KoreanRosterField, string> = {
  salary: "기본연봉(원)",
  relevant_experience: "관련 경력년수",
  company_tenure: "회사 근속개월",
  title: "직함",
  level: "레벨",
  documented_exception: "문서화된 예외",
  counteroffer: "카운터오퍼 여부",
};

export function FacilitatorPreparationScreen({
  onStart,
}: FacilitatorPreparationScreenProps) {
  const [rawPaste, setRawPaste] = useState("");
  const [confirmPiiColumnStripping, setConfirmPiiColumnStripping] = useState(false);
  const [result, setResult] = useState(createEmptyPreparationResult());

  function inspectPaste() {
    const next = prepareProductEngineerRoster(rawPaste, { confirmPiiColumnStripping });
    setResult(next);
    if (next.shouldClearRaw || next.status === "ready_for_confirmation") setRawPaste("");
  }

  function changePaste(value: string) {
    setRawPaste(value);
    setConfirmPiiColumnStripping(false);
    setResult(createEmptyPreparationResult());
  }

  function approveColumnStripping() {
    setConfirmPiiColumnStripping(true);
    const next = prepareProductEngineerRoster(rawPaste, { confirmPiiColumnStripping: true });
    setResult(next);
    if (next.shouldClearRaw || next.status === "ready_for_confirmation") setRawPaste("");
  }

  return (
    <main className="fp-app" data-facilitator-preparation="true">
      <header className="fp-hero">
        <p className="fp-eyebrow">{FOUNDER_COPY["preparation.eyebrow"]}</p>
        <h1>{FOUNDER_COPY["preparation.heading"]}</h1>
        <p>{FOUNDER_COPY["preparation.privacy"]}</p>
      </header>

      <section className="fp-panel" aria-labelledby="fp-paste-title">
        <div className="fp-panel-heading">
          <div>
            <p className="fp-kicker">{FOUNDER_COPY["preparation.paste.kicker"]}</p>
            <h2 id="fp-paste-title">{FOUNDER_COPY["preparation.paste.heading"]}</h2>
          </div>
          <span>{FOUNDER_COPY["preparation.paste.badge"]}</span>
        </div>
        <div className="fp-column-reference" aria-label="붙여넣을 수 있는 열 이름">
          <strong>필수 열 이름</strong>
          <div>
            {["row_id", "role_group", "base_salary_krw"].map((header) => (
              <code key={header}>{header}</code>
            ))}
          </div>
          <span>
            선택 열은 title, level_label, level_rank, start_date, tenure_months,
            latest_raise_date, latest_raise_amount_krw, exception_flag, counter_offer_flag,
            manager_label, team_label입니다.
          </span>
        </div>
        <label className="fp-paste-field">
          <span>{FOUNDER_COPY["preparation.paste.label"]}</span>
          <textarea
            rows={9}
            value={rawPaste}
            onChange={(event) => changePaste(event.target.value)}
            placeholder={FOUNDER_COPY["preparation.paste.helper"]}
            spellCheck={false}
          />
        </label>
        <div className="fp-input-actions">
          <p>확인하거나 차단한 원본 텍스트는 입력란에서 바로 지워집니다.</p>
          <button
            className="fp-primary"
            type="button"
            onClick={inspectPaste}
            disabled={rawPaste.trim().length === 0}
          >
            {FOUNDER_COPY["preparation.paste.action"]}
          </button>
        </div>
      </section>

      <div aria-live="polite">
        {result.status === "needs_column_consent" ? (
          <section className="fp-panel fp-consent" data-column-consent-required="true">
            <p className="fp-kicker">{FOUNDER_COPY["preparation.consent.kicker"]}</p>
            <h2>{FOUNDER_COPY["preparation.consent.heading"]}</h2>
            <ul className="fp-column-list">
              {result.prohibitedColumnHeaders.map((header) => <li key={header}>{header}</li>)}
            </ul>
            <p>{FOUNDER_COPY["preparation.consent.support"]}</p>
            <button className="fp-primary" type="button" onClick={approveColumnStripping}>
              {FOUNDER_COPY["preparation.consent.action"]}
            </button>
          </section>
        ) : null}

        {result.status === "blocked" ? (
          <section className="fp-panel fp-blocked" data-preparation-blocked="true">
            <p className="fp-kicker">{FOUNDER_COPY["preparation.blocked.kicker"]}</p>
            <h2>{FOUNDER_COPY["preparation.blocked.heading"]}</h2>
            <ul className="fp-issue-list">
              {result.issues.map((issue, index) => (
                <li key={issue.code + "-" + index}>
                  {issue.sourceLineNumber === undefined ? null : (
                    <strong>입력 {issue.sourceLineNumber}행</strong>
                  )}
                  <span>{issue.field ? fieldLabels[issue.field] + " · " : ""}{issueLabels[issue.code]}</span>
                </li>
              ))}
            </ul>
            {result.previewRows.length > 0 ? (
              <>
                <p className="fp-safe-note">
                  개인정보가 없는 정규화 미리보기는 아래에 남겼지만, 현재 비교 조건을 충족하지 않아
                  세션으로 넘기지 않습니다.
                </p>
                <PreparationPreview rows={result.previewRows} />
              </>
            ) : null}
          </section>
        ) : null}

        {result.status === "ready_for_confirmation" && result.draft ? (
          <section className="fp-panel fp-confirmation" data-preparation-confirmation="true">
            <div className="fp-panel-heading">
              <div>
                <p className="fp-kicker">{FOUNDER_COPY["preparation.ready.kicker"]}</p>
                <h2>{FOUNDER_COPY["preparation.ready.heading"]}</h2>
              </div>
              <span>{result.previewRows.length}명</span>
            </div>
            <PreparationPreview rows={result.previewRows} />
            <div className="fp-start-bar">
              <p>{FOUNDER_COPY["preparation.ready.support"]}</p>
              <button
                className="fp-primary"
                type="button"
                onClick={() => onStart(result.draft!)}
                data-start-facilitated-session="true"
              >
                {FOUNDER_COPY["preparation.ready.action"]}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function PreparationPreview({ rows }: { rows: PreparationPreviewRow[] }) {
  return (
    <div className="fp-table-wrap">
      <table>
        <thead>
          <tr>
            <th>세션 라벨</th>
            <th>역할</th>
            <th>기본 연봉</th>
            <th>관련 경력</th>
            <th>회사 근속</th>
            <th>직함·레벨</th>
            <th>문서화된 예외</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.employeeLabel}>
              <th scope="row">{item.employeeLabel}</th>
              <td>{item.roleGroup}</td>
              <td>{formatManwon(item.salaryKRW)}</td>
              <td>
                {item.relevantExperienceMonths === undefined
                  ? "확인 필요"
                  : formatExperienceYears(item.relevantExperienceMonths)}
              </td>
              <td>{item.tenureMonths === undefined ? "확인 필요" : item.tenureMonths + "개월"}</td>
              <td>{[item.title, item.levelLabel].filter(Boolean).join(" · ") || "없음"}</td>
              <td>{item.documentedException ? "있음" : "없음"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatExperienceYears(months: number): string {
  return (months / 12).toLocaleString("ko-KR", { maximumFractionDigits: 1 }) + "년";
}

function formatManwon(amountKRW: number): string {
  return (amountKRW / 10_000).toLocaleString("ko-KR") + "만원";
}
