const form = document.querySelector(".quick-input-form");
const summary = document.querySelector(".validation-summary");

const textFieldsToInspect = [
  "grouped_input_notes",
  "planned_hires_6m",
  "planned_hires_12m",
  "average_expected_salary_by_level",
  "affected_roles_or_functions",
];

const piiPatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b01[016789]-?\d{3,4}-?\d{4}\b/,
  /\b\d{6}-\d{7}\b/,
];

function showSummary(state, title, messages = []) {
  if (!summary) return;
  summary.dataset.state = state;
  summary.classList.add("is-visible");
  summary.innerHTML = `
    <strong>${title}</strong>
    ${
      messages.length > 0
        ? `<ul>${messages.map((message) => `<li>${message}</li>`).join("")}</ul>`
        : ""
    }
  `;
}

function collectErrors(formData) {
  const errors = [];
  const requiredFields = [
    ["company_size_band", "회사 규모 구간"],
    ["funding_stage", "투자 단계"],
    ["current_ai_tooling_level", "현재 AI 도구 활용 수준"],
    ["total_headcount", "총 인원"],
    ["total_monthly_base_pay", "월 기본급 총액"],
    ["total_monthly_fixed_allowance", "월 고정수당 총액"],
    ["planned_hires_6m", "6개월 채용 계획"],
    ["planned_hires_12m", "12개월 채용 계획"],
    ["average_expected_salary_by_level", "레벨별 예상 평균 연봉"],
    ["exception_raise_frequency", "예외 인상 빈도"],
    ["counteroffer_frequency", "카운터오퍼 빈도"],
  ];

  for (const [name, label] of requiredFields) {
    if (!String(formData.get(name) ?? "").trim()) {
      errors.push(`${label}은 필수 입력입니다.`);
    }
  }

  form.querySelectorAll('input[type="number"]').forEach((input) => {
    if (input.value !== "" && Number(input.value) < 0) {
      const label = input.closest(".field")?.querySelector("span")?.textContent?.replace("*", "").trim();
      errors.push(`${label ?? input.name}은 0 이상이어야 합니다.`);
    }
  });

  for (const fieldName of textFieldsToInspect) {
    const value = String(formData.get(fieldName) ?? "");
    if (piiPatterns.some((pattern) => pattern.test(value))) {
      errors.push("집계 입력에는 개인을 식별할 수 있는 연락처나 식별 번호를 넣지 마세요.");
    }
  }

  return errors;
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const errors = collectErrors(formData);

  if (errors.length > 0) {
    showSummary("error", "확인할 입력이 있습니다.", errors);
    return;
  }

  showSummary(
    "success",
    "입력 구조가 유효합니다.",
    ["다음 단계에서 거버넌스 스냅샷을 생성할 수 있습니다. 아직 시나리오 비교나 메모 생성은 실행하지 않습니다."],
  );
});
