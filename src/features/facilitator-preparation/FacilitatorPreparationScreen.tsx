import { useState } from "react";
import {
  createEmptyPreparationResult,
  prepareProductEngineerRoster,
} from "../../lib/hr-paysim/preparation/prepareProductEngineerRoster.ts";
import type {
  PreparationIssueCode,
  PreparationPreviewRow,
  ProductEngineerSessionDraft,
} from "../../lib/hr-paysim/preparation/types.ts";
import "./facilitatorPreparation.css";

export interface FacilitatorPreparationScreenProps {
  onStart: (draft: ProductEngineerSessionDraft) => void;
}

const issueLabels: Record<PreparationIssueCode, string> = {
  PII_VALUE: "허용되지 않은 개인정보 형식이 있습니다. 원본을 수정한 뒤 다시 붙여넣어 주세요.",
  MISSING_REQUIRED_FIELD: "필수 값이 비어 있거나 형식이 맞지 않습니다.",
  UNSUPPORTED_ROLE: "현재 비공개 준비 흐름은 Product Engineer 행만 지원합니다.",
  UNSUPPORTED_PRODUCT_ENGINEER_COMPARISON:
    "현재 자료에서는 이 흐름이 지원하는 Product Engineer 비교를 만들 수 없습니다.",
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
        <p className="fp-eyebrow">HR PaySim · 비공개 진행자 준비</p>
        <h1>Product Engineer 세션 자료를 안전하게 확인합니다.</h1>
        <p>
          이 화면은 붙여넣은 자료를 브라우저 안에서만 검사합니다. 이름·연락처·주민등록번호와
          Product Engineer가 아닌 행은 분석하지 않습니다.
        </p>
      </header>

      <section className="fp-panel" aria-labelledby="fp-paste-title">
        <div className="fp-panel-heading">
          <div>
            <p className="fp-kicker">1. 자료 붙여넣기</p>
            <h2 id="fp-paste-title">허용된 열만 있는 시트 범위를 붙여넣어 주세요.</h2>
          </div>
          <span>로컬 전용</span>
        </div>
        <label className="fp-paste-field">
          <span>Product Engineer roster</span>
          <textarea
            rows={9}
            value={rawPaste}
            onChange={(event) => changePaste(event.target.value)}
            placeholder="헤더 행을 포함해 붙여넣어 주세요."
            spellCheck={false}
          />
        </label>
        <div className="fp-input-actions">
          <p>원본 텍스트는 안전 검사 또는 차단 직후 입력란에서 지워집니다.</p>
          <button
            className="fp-primary"
            type="button"
            onClick={inspectPaste}
            disabled={rawPaste.trim().length === 0}
          >
            붙여넣은 자료 확인
          </button>
        </div>
      </section>

      <div aria-live="polite">
        {result.status === "needs_column_consent" ? (
          <section className="fp-panel fp-consent" data-column-consent-required="true">
            <p className="fp-kicker">개인정보 열 제외 확인</p>
            <h2>아래 열 이름을 제외한 뒤 나머지 허용 열만 확인합니다.</h2>
            <ul className="fp-column-list">
              {result.prohibitedColumnHeaders.map((header) => <li key={header}>{header}</li>)}
            </ul>
            <p>열 이름만 표시하며, 해당 열의 값은 읽거나 미리 보지 않습니다.</p>
            <button className="fp-primary" type="button" onClick={approveColumnStripping}>
              표시된 열을 제외하고 다시 확인
            </button>
          </section>
        ) : null}

        {result.status === "blocked" ? (
          <section className="fp-panel fp-blocked" data-preparation-blocked="true">
            <p className="fp-kicker">세션을 시작할 수 없습니다.</p>
            <h2>안전하게 수정한 자료를 새로 붙여넣어 주세요.</h2>
            <ul className="fp-issue-list">
              {result.issues.map((issue, index) => (
                <li key={issue.code + "-" + index}>
                  {issue.sourceLineNumber === undefined ? null : (
                    <strong>입력 {issue.sourceLineNumber}행</strong>
                  )}
                  <span>{issueLabels[issue.code]}</span>
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
                <p className="fp-kicker">2. 정규화 자료 확인</p>
                <h2>아래 익명 자료가 이번 세션에만 사용됩니다.</h2>
              </div>
              <span>{result.previewRows.length}명</span>
            </div>
            <PreparationPreview rows={result.previewRows} />
            <div className="fp-start-bar">
              <p>관리자·팀 원문과 시스템 식별자는 화면에 표시하거나 저장하지 않습니다.</p>
              <button
                className="fp-primary"
                type="button"
                onClick={() => onStart(result.draft!)}
                data-start-facilitated-session="true"
              >
                확인한 자료로 세션 시작
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
            <th>근속</th>
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

function formatManwon(amountKRW: number): string {
  return (amountKRW / 10_000).toLocaleString("ko-KR") + "만원";
}
