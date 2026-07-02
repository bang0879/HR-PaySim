import {
  AI_TOOLING_LEVELS,
  COMPANY_SIZE_BANDS,
  FREQUENCY_LEVELS,
  FUNDING_STAGES,
  UNDOCUMENTED_NEGOTIATION_LEVELS,
} from "../../lib/hr-paysim/schema/types.ts";
import type {
  AIScenarioInputs,
  CompanyContext,
  CompensationSnapshot,
  HiringPlan,
} from "../../lib/hr-paysim/schema/types.ts";
import { companyContextSection } from "./CompanyContextSection.ts";
import { compensationSnapshotSection } from "./CompensationSnapshotSection.ts";
import type { QuickInputField, QuickInputSection } from "./FieldTypes.ts";
import { hiringPlanSection } from "./HiringPlanSection.ts";
import { exceptionSignalsSection } from "./ExceptionSignalsSection.ts";
import { optionalAISection } from "./OptionalAISection.ts";

export const HR_PAYSIM_ENTRY_COPY =
  "보상 쪽은 한 단계 더 시뮬레이션해볼 수 있습니다. 지금 구조에서 어떤 조정안이 비용과 설명 가능성을 어떻게 바꾸는지 보시겠어요?";

export const HR_PAYSIM_INTRO_COPY =
  "HR PaySim은 연봉 정답을 계산하는 도구가 아니라, 보상 의사결정의 비용과 설명 가능성을 비교하는 시뮬레이터입니다.";

const SECTION_INTRO_COPY =
  "개인별 급여 자료를 넣지 않아도 됩니다. 팀, 레벨, 밴드 단위의 aggregate 입력으로 충분합니다.";

const PRIVACY_NOTICE_COPY =
  "HR PaySim v1.0은 직원 이름, 이메일, 주민등록번호, 개인별 원시 급여를 저장하지 않는 방향으로 설계됩니다.";

const AI_HELPER_COPY =
  "이 섹션은 AI가 사람을 대체한다는 계산이 아닙니다. 채용 지연, capacity 연장, 조율 부담을 보는 선택 입력입니다.";

export interface QuickInputDraft {
  companyContext: Partial<CompanyContext>;
  compensationSnapshot: Partial<CompensationSnapshot> & {
    grouped_input_notes?: string;
  };
  hiringPlan: Partial<HiringPlan>;
  aiScenarioInputs?: Partial<AIScenarioInputs>;
  advancedEnabled?: boolean;
}

export interface QuickInputValidationResult {
  valid: boolean;
  errors: string[];
}

export function createEmptyQuickInputDraft(): QuickInputDraft {
  return {
    companyContext: {},
    compensationSnapshot: {},
    hiringPlan: {},
    aiScenarioInputs: undefined,
    advancedEnabled: false,
  };
}

export function getQuickInputSections(): QuickInputSection[] {
  return [
    companyContextSection,
    compensationSnapshotSection,
    hiringPlanSection,
    exceptionSignalsSection,
    optionalAISection,
  ];
}

function isRecordOfNumbers(value: unknown): value is Record<string, number> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function addRequiredError(errors: string[], label: string): void {
  errors.push(`${label}은 필수 입력입니다.`);
}

function requireValue(value: unknown, label: string, errors: string[]): void {
  if (value === undefined || value === null || value === "") {
    addRequiredError(errors, label);
  }
}

function requireBoolean(value: unknown, label: string, errors: string[]): void {
  if (typeof value !== "boolean") {
    addRequiredError(errors, label);
  }
}

function validateEnum(
  value: unknown,
  allowed: readonly string[],
  label: string,
  errors: string[],
): void {
  if (typeof value !== "string" || !allowed.includes(value)) {
    errors.push(`${label}는 허용된 값만 선택할 수 있습니다.`);
  }
}

function validateNonNegativeNumber(value: unknown, label: string, errors: string[]): void {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (!isNumber(value) || value < 0) {
    errors.push(`${label}은 0 이상의 숫자여야 합니다.`);
  }
}

function validateNonNegativeInteger(value: unknown, label: string, errors: string[]): void {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (!isNumber(value) || !Number.isInteger(value) || value < 0) {
    errors.push(`${label}은 0 이상의 정수여야 합니다.`);
  }
}

function validateRecordOfNonNegativeIntegers(
  value: unknown,
  label: string,
  errors: string[],
): void {
  if (!isRecordOfNumbers(value)) {
    addRequiredError(errors, label);
    return;
  }

  for (const [key, itemValue] of Object.entries(value)) {
    if (!isNumber(itemValue) || !Number.isInteger(itemValue) || itemValue < 0) {
      errors.push(`${label}의 ${key} 값은 0 이상의 정수여야 합니다.`);
    }
  }
}

function validateRecordOfNonNegativeNumbers(
  value: unknown,
  label: string,
  errors: string[],
): void {
  if (!isRecordOfNumbers(value)) {
    addRequiredError(errors, label);
    return;
  }

  for (const [key, itemValue] of Object.entries(value)) {
    if (!isNumber(itemValue) || itemValue < 0) {
      errors.push(`${label}의 ${key} 값은 0 이상의 숫자여야 합니다.`);
    }
  }
}

const piiPatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b01[016789]-?\d{3,4}-?\d{4}\b/,
  /\b\d{6}-\d{7}\b/,
  /\b(employee|email|phone|resident|company_name|raw salary|raw_salary)\b/i,
];

function validateFreeText(value: unknown, label: string, errors: string[]): void {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (typeof value !== "string") {
    errors.push(`${label}은 텍스트로 입력해주세요.`);
    return;
  }

  if (piiPatterns.some((pattern) => pattern.test(value))) {
    errors.push(`${label}에 개인정보 또는 식별 정보가 포함되어 있습니다.`);
  }
}

function hasAnyAIInput(input: Partial<AIScenarioInputs> | undefined): boolean {
  if (!input) {
    return false;
  }

  return Object.values(input).some((value) => {
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return true;
  });
}

export function validateQuickInputDraft(draft: QuickInputDraft): QuickInputValidationResult {
  const errors: string[] = [];
  const company = draft.companyContext;
  const compensation = draft.compensationSnapshot;
  const hiring = draft.hiringPlan;
  const ai = draft.aiScenarioInputs;

  requireValue(company.company_size_band, "회사 규모 구간", errors);
  requireValue(company.funding_stage, "투자 단계", errors);
  validateEnum(company.company_size_band, COMPANY_SIZE_BANDS, "회사 규모 구간", errors);
  validateEnum(company.funding_stage, FUNDING_STAGES, "투자 단계", errors);
  validateEnum(company.current_ai_tooling_level, AI_TOOLING_LEVELS, "현재 AI 도구 활용 수준", errors);
  requireBoolean(company.has_hr_owner, "HR 담당자 여부", errors);
  requireBoolean(company.has_level_system, "레벨 체계 여부", errors);
  requireBoolean(company.has_salary_band, "급여 밴드 여부", errors);
  requireBoolean(company.has_performance_review, "성과 리뷰 여부", errors);
  requireBoolean(company.has_variable_pay, "변동 보상 여부", errors);
  requireBoolean(company.has_equity_plan, "스톡옵션/지분 보상 제도 여부", errors);

  requireValue(compensation.total_headcount, "총 인원", errors);
  validateNonNegativeInteger(compensation.total_headcount, "총 인원", errors);
  requireValue(compensation.total_monthly_base_pay, "월 기본급 총액", errors);
  validateNonNegativeNumber(compensation.total_monthly_base_pay, "월 기본급 총액", errors);
  requireValue(compensation.total_monthly_fixed_allowance, "월 고정수당 총액", errors);
  validateNonNegativeNumber(compensation.total_monthly_fixed_allowance, "월 고정수당 총액", errors);
  validateNonNegativeNumber(compensation.total_expected_variable_pay, "예상 변동 보상 총액", errors);
  validateNonNegativeNumber(compensation.recent_raise_budget, "최근 인상 예산", errors);
  validateNonNegativeInteger(compensation.pay_inversion_case_count, "보상 역전 사례 수", errors);
  validateNonNegativeInteger(compensation.out_of_band_case_count, "밴드 밖 사례 수", errors);
  requireValue(compensation.exception_raise_frequency, "예외 인상 빈도", errors);
  requireValue(compensation.counteroffer_frequency, "카운터오퍼 빈도", errors);
  validateEnum(
    compensation.exception_raise_frequency,
    FREQUENCY_LEVELS,
    "예외 인상 빈도",
    errors,
  );
  validateEnum(
    compensation.counteroffer_frequency,
    FREQUENCY_LEVELS,
    "카운터오퍼 빈도",
    errors,
  );
  if (compensation.undocumented_negotiation_level !== undefined) {
    validateEnum(
      compensation.undocumented_negotiation_level,
      UNDOCUMENTED_NEGOTIATION_LEVELS,
      "문서화되지 않은 협상 수준",
      errors,
    );
  }
  requireBoolean(compensation.new_hire_premium_exists, "신규 입사자 프리미엄 여부", errors);
  validateFreeText(compensation.grouped_input_notes, "레벨/기능별 집계 메모", errors);

  validateRecordOfNonNegativeIntegers(hiring.planned_hires_6m, "6개월 채용 계획", errors);
  validateRecordOfNonNegativeIntegers(hiring.planned_hires_12m, "12개월 채용 계획", errors);
  validateRecordOfNonNegativeNumbers(
    hiring.average_expected_salary_by_level,
    "레벨별 예상 평균 연봉",
    errors,
  );
  requireBoolean(hiring.hiring_freeze_toggle, "선택 채용 지연 검토 여부", errors);
  validateNonNegativeNumber(hiring.optional_cash_balance, "선택 입력: 현금 잔고", errors);
  validateNonNegativeNumber(hiring.optional_runway_months, "선택 입력: runway 개월 수", errors);

  if (hasAnyAIInput(ai) && !draft.advancedEnabled) {
    errors.push("Advanced AI 입력은 Advanced 섹션을 연 경우에만 사용할 수 있습니다.");
  }

  if (ai) {
    validateNonNegativeNumber(ai.planned_ai_tool_budget_monthly, "월 AI 도구 예산", errors);
    validateNonNegativeNumber(ai.planned_ai_tool_budget_annual, "연 AI 도구 예산", errors);
    validateNonNegativeInteger(ai.hiring_delay_months, "채용 지연 개월 수", errors);
    validateNonNegativeInteger(ai.orchestrator_target_count, "Senior 조율 역할 대상 수", errors);
    validateNonNegativeNumber(ai.premium_pool_allocation_rate, "프리미엄 풀 배분율", errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderField(field: QuickInputField): string {
  const requiredMark = field.required ? '<span class="required-mark">*</span>' : "";
  const help = field.helpText ? `<p class="field-help">${escapeHtml(field.helpText)}</p>` : "";
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : "";
  const min = field.min !== undefined ? ` min="${field.min}"` : "";

  if (field.type === "select") {
    const options = (field.options ?? [])
      .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
      .join("");
    return `
      <label class="field">
        <span>${escapeHtml(field.label)}${requiredMark}</span>
        <select name="${escapeHtml(field.name)}" ${field.required ? "required" : ""}>
          <option value="">선택</option>
          ${options}
        </select>
        ${help}
      </label>`;
  }

  if (field.type === "checkbox") {
    return `
      <label class="field field-checkbox">
        <input type="checkbox" name="${escapeHtml(field.name)}" />
        <span>${escapeHtml(field.label)}${requiredMark}</span>
        ${help}
      </label>`;
  }

  if (field.type === "textarea") {
    return `
      <label class="field field-wide">
        <span>${escapeHtml(field.label)}${requiredMark}</span>
        <textarea name="${escapeHtml(field.name)}"${placeholder}></textarea>
        ${help}
      </label>`;
  }

  return `
    <label class="field">
      <span>${escapeHtml(field.label)}${requiredMark}</span>
      <input type="number" inputmode="numeric" name="${escapeHtml(field.name)}"${min}${placeholder} ${
        field.required ? "required" : ""
      } />
      ${help}
    </label>`;
}

function renderSection(section: QuickInputSection): string {
  const fields = section.fields.map(renderField).join("");

  if (section.advanced) {
    return `
      <details class="section-card advanced-section">
        <summary>
          <span>${escapeHtml(section.title)}</span>
          <small>${escapeHtml(section.description)}</small>
        </summary>
        <p class="advanced-helper">${escapeHtml(AI_HELPER_COPY)}</p>
        <div class="field-grid">${fields}</div>
      </details>`;
  }

  return `
    <section class="section-card" aria-labelledby="${escapeHtml(section.id)}-title">
      <div class="section-heading">
        <h2 id="${escapeHtml(section.id)}-title">${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.description)}</p>
      </div>
      <div class="field-grid">${fields}</div>
    </section>`;
}

export function renderQuickInputHtml(): string {
  const sections = getQuickInputSections().map(renderSection).join("");

  return `
    <main class="paysim-shell">
      <section class="entry-panel">
        <p class="module-label">HR Prism 진단 이후 심화 모듈</p>
        <h1>HR PaySim</h1>
        <p class="entry-copy">${escapeHtml(HR_PAYSIM_ENTRY_COPY)}</p>
      </section>
      <section class="intro-panel">
        <h2>HR PaySim은 보상 거버넌스 시뮬레이터입니다</h2>
        <p>${escapeHtml(HR_PAYSIM_INTRO_COPY)}</p>
        <ul>
          <li>급여 계산기가 아닙니다.</li>
          <li>보상 의사결정의 설명 가능성을 시뮬레이션합니다.</li>
          <li>하나의 정답이 아니라 선택지별 trade-off를 비교합니다.</li>
        </ul>
      </section>
      <form class="quick-input-form" novalidate>
        <div class="form-status">
          <strong>Quick Mode 입력</strong>
          <span>1 / 3 현재 입력</span>
        </div>
        <p class="section-intro">${escapeHtml(SECTION_INTRO_COPY)}</p>
        <p class="privacy-notice">${escapeHtml(PRIVACY_NOTICE_COPY)}</p>
        ${sections}
        <div class="form-actions">
          <button type="submit">거버넌스 스냅샷 보기</button>
          <p>정확한 숫자가 모두 없어도 괜찮습니다. HR PaySim은 먼저 aggregate 입력으로 방향성을 확인합니다.</p>
        </div>
      </form>
    </main>`;
}
