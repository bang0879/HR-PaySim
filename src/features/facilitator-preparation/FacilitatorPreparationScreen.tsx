import { useEffect, useRef, useState } from "react";
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
import templateUrl from "./assets/HR-PaySim-Product-Engineer-input-template.xlsx?url";
import { readProductEngineerWorkbook } from "./readProductEngineerWorkbook.ts";
import { createWorkbookReadCoordinator } from "./workbookReadCoordinator.ts";
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

const exampleRows = [
  ["68,000,000", "8", "36", "Product Engineer", "", "아니오", "아니오"],
  ["74,000,000", "7.5", "24", "Senior Product Engineer", "L2", "아니오", "예"],
  ["82,000,000", "10", "18", "Product Engineer", "L3", "예", "아니오"],
  ["79,000,000", "6", "12", "Product Engineer", "", "아니오", "아니오"],
] as const;

type InputSource = "file" | "paste" | null;
type FileInputChangeEvent = { currentTarget: HTMLInputElement };

export function FacilitatorPreparationScreen({
  onStart,
}: FacilitatorPreparationScreenProps) {
  const [fileReadCoordinator] = useState(createWorkbookReadCoordinator);
  const activeFileReadRef = useRef(0);
  const [isFileReading, setIsFileReading] = useState(false);
  const [rawPaste, setRawPaste] = useState("");
  const [confirmPiiColumnStripping, setConfirmPiiColumnStripping] = useState(false);
  const [inputSource, setInputSource] = useState<InputSource>(null);
  const [result, setResult] = useState(createEmptyPreparationResult());

  useEffect(() => () => fileReadCoordinator.invalidate(), [fileReadCoordinator]);

  async function importWorkbook(event: FileInputChangeEvent) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const readId = fileReadCoordinator.beginRead();
    activeFileReadRef.current = readId;
    setIsFileReading(true);
    setInputSource("file");
    try {
      const next = await readProductEngineerWorkbook(file, {
        confirmProhibitedHeaders: (headers) => fileReadCoordinator.requestConsent(
          readId,
          headers,
          showFileColumnConsent,
        ),
      });
      if (!fileReadCoordinator.isActive(readId)) return;
      setResult(next);
      setRawPaste("");
      setConfirmPiiColumnStripping(false);
    } finally {
      input.value = "";
      if (fileReadCoordinator.isActive(readId)) {
        fileReadCoordinator.finishRead(readId);
        activeFileReadRef.current = 0;
        setIsFileReading(false);
      }
    }
  }

  function showFileColumnConsent(headers: readonly string[]) {
    setResult({
      ...createEmptyPreparationResult(),
      status: "needs_column_consent",
      prohibitedColumnHeaders: [...headers],
    });
  }

  function inspectPaste() {
    setInputSource("paste");
    const next = prepareProductEngineerRoster(rawPaste, { confirmPiiColumnStripping });
    setResult(next);
    if (next.shouldClearRaw || next.status === "ready_for_confirmation") setRawPaste("");
  }

  function changePaste(value: string) {
    fileReadCoordinator.invalidate();
    activeFileReadRef.current = 0;
    setIsFileReading(false);
    setRawPaste(value);
    setInputSource("paste");
    setConfirmPiiColumnStripping(false);
    setResult(createEmptyPreparationResult());
  }

  function approveColumnStripping() {
    if (inputSource === "file") {
      fileReadCoordinator.resolveConsent(activeFileReadRef.current, true);
      return;
    }
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

      <section className="fp-panel fp-guide" aria-labelledby="fp-guide-title">
        <div className="fp-panel-heading">
          <div>
            <p className="fp-kicker">{FOUNDER_COPY["preparation.guide.kicker"]}</p>
            <h2 id="fp-guide-title">{FOUNDER_COPY["preparation.guide.heading"]}</h2>
          </div>
          <span>이름·사번 불필요</span>
        </div>
        <p className="fp-lead">{FOUNDER_COPY["preparation.guide.lead"]}</p>
        <p className="fp-definition">{FOUNDER_COPY["preparation.guide.career_definition"]}</p>

        <div className="fp-field-grid">
          <section aria-labelledby="fp-required-fields">
            <h3 id="fp-required-fields">필수 항목</h3>
            <dl>
              <div><dt>기본연봉(원)</dt><dd>현재 연간 기본연봉을 원 단위로 입력</dd></div>
              <div><dt>관련 경력년수</dt><dd>현재·이전 회사의 관련 업무 경력</dd></div>
              <div><dt>회사 근속개월</dt><dd>현재 회사에서 근무한 완료 개월 수</dd></div>
            </dl>
          </section>
          <section aria-labelledby="fp-optional-fields">
            <h3 id="fp-optional-fields">선택 항목</h3>
            <dl>
              <div><dt>직함 · 레벨</dt><dd>설명과 확인을 위한 익명 맥락</dd></div>
              <div><dt>문서화된 예외</dt><dd>빈칸, 예, 아니오</dd></div>
              <div><dt>카운터오퍼 여부</dt><dd>빈칸, 예, 아니오</dd></div>
            </dl>
          </section>
        </div>

        <div className="fp-example" aria-labelledby="fp-example-title">
          <div className="fp-example-heading">
            <h3 id="fp-example-title">작성 예시</h3>
            <p>형식만 보여주는 합성 자료이며 연봉 기준이나 시장 자료가 아닙니다.</p>
          </div>
          <KoreanRosterTable rows={exampleRows} />
        </div>
      </section>

      <section className="fp-panel fp-workflow" aria-labelledby="fp-workflow-title">
        <div className="fp-panel-heading">
          <div>
            <p className="fp-kicker">자료 불러오기</p>
            <h2 id="fp-workflow-title">양식 하나로 준비하고 확인합니다.</h2>
          </div>
          <span>브라우저 안에서만 확인</span>
        </div>
        <div className="fp-workflow-steps">
          <article>
            <span className="fp-step-number">1</span>
            <div>
              <h3>빈 Excel 양식을 내려받아 작성합니다.</h3>
              <p>열 이름을 바꾸지 말고 Product Engineer 직원 자료를 최소 4행 입력해 주세요.</p>
              <a className="fp-secondary-action" href={templateUrl} download>
                {FOUNDER_COPY["preparation.download.action"]}
              </a>
            </div>
          </article>
          <article>
            <span className="fp-step-number">2</span>
            <div>
              <h3>작성한 파일을 이 브라우저에서 확인합니다.</h3>
              <p>.xlsx · 최대 5 MB</p>
              <label className="fp-primary fp-file-action">
                {FOUNDER_COPY["preparation.file.action"]}
                <input
                  className="fp-visually-hidden"
                  type="file"
                  accept=".xlsx"
                  onChange={importWorkbook}
                  disabled={isFileReading}
                />
              </label>
            </div>
          </article>
        </div>

        <details className="fp-paste-fallback">
          <summary>{FOUNDER_COPY["preparation.paste.heading"]}</summary>
          <div className="fp-paste-content">
            <p>{FOUNDER_COPY["preparation.paste.helper"]}</p>
            <label className="fp-paste-field">
              <span>{FOUNDER_COPY["preparation.paste.label"]}</span>
              <textarea
                rows={8}
                value={rawPaste}
                onChange={(event) => changePaste(event.target.value)}
                placeholder="기본연봉(원)부터 카운터오퍼 여부까지 열 이름을 포함해 붙여넣어 주세요."
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
          </div>
        </details>
      </section>

      <div className="fp-result" aria-live="polite">
        {result.status === "needs_column_consent" ? (
          <section className="fp-panel fp-consent" data-column-consent-required="true">
            <p className="fp-kicker">{FOUNDER_COPY["preparation.consent.kicker"]}</p>
            <h2>{FOUNDER_COPY["preparation.consent.heading"]}</h2>
            <ul className="fp-column-list">
              {result.prohibitedColumnHeaders.map((header) => <li key={header}>{header}</li>)}
            </ul>
            <p>{FOUNDER_COPY["preparation.consent.support"]}</p>
            <button className="fp-primary" type="button" onClick={approveColumnStripping}>
              {inputSource === "file"
                ? FOUNDER_COPY["preparation.consent.file.action"]
                : FOUNDER_COPY["preparation.consent.action"]}
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
                <p className="fp-safe-note">{FOUNDER_COPY["preparation.blocked.preview_support"]}</p>
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

function KoreanRosterTable({ rows }: { rows: readonly (readonly string[])[] }) {
  return (
    <div className="fp-table-wrap fp-example-table">
      <table>
        <thead><tr>{Object.values(fieldLabels).map((label) => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => (
          <tr key={rowIndex}>{row.map((value, columnIndex) => <td key={columnIndex}>{value || "—"}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
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
              <td>{item.relevantExperienceMonths === undefined ? "확인 필요" : formatExperienceYears(item.relevantExperienceMonths)}</td>
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