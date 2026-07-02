import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  HR_PAYSIM_ENTRY_COPY,
  HR_PAYSIM_INTRO_COPY,
  createEmptyQuickInputDraft,
  getQuickInputSections,
  renderQuickInputHtml,
  validateQuickInputDraft,
} from "../../frontend/components/hr-paysim/QuickInput.ts";
import type { QuickInputDraft } from "../../frontend/components/hr-paysim/QuickInput.ts";

function minimumValidDraft(): QuickInputDraft {
  return {
    ...createEmptyQuickInputDraft(),
    companyContext: {
      company_size_band: "51-100",
      funding_stage: "series_a",
      has_hr_owner: true,
      has_level_system: true,
      has_salary_band: false,
      has_performance_review: true,
      has_variable_pay: false,
      has_equity_plan: true,
      current_ai_tooling_level: "ad_hoc",
    },
    compensationSnapshot: {
      total_headcount: 74,
      total_monthly_base_pay: 520000000,
      total_monthly_fixed_allowance: 28000000,
      exception_raise_frequency: "occasional",
      counteroffer_frequency: "rare",
      new_hire_premium_exists: true,
      pay_inversion_case_count: 4,
      grouped_input_notes: "L2 평균 62000000, L3 평균 82000000",
    },
    hiringPlan: {
      planned_hires_6m: { L2: 4, L3: 2 },
      planned_hires_12m: { L2: 8, L3: 4 },
      average_expected_salary_by_level: { L2: 70000000, L3: 93000000 },
      hiring_freeze_toggle: false,
    },
  };
}

test("quick input exposes the required Korean entry and intro copy", () => {
  const html = renderQuickInputHtml();

  assert.match(html, new RegExp(HR_PAYSIM_ENTRY_COPY));
  assert.match(html, new RegExp(HR_PAYSIM_INTRO_COPY));
  assert.match(html, /개인별 급여 자료를 넣지 않아도 됩니다/);
  assert.match(html, /거버넌스 스냅샷 보기/);
});

test("quick input has the five required sections and no employee-identifying fields", () => {
  const sections = getQuickInputSections();
  const sectionTitles = sections.map((section) => section.title);
  const fieldNames = sections.flatMap((section) => section.fields.map((field) => field.name));

  assert.deepEqual(sectionTitles, [
    "회사 기본 정보",
    "현재 보상 구조",
    "채용 계획",
    "예외 보상 신호",
    "Advanced: AI tooling 가정 입력",
  ]);
  assert.equal(fieldNames.some((name) => /employee|email|phone|resident|raw_salary/i.test(name)), false);
});

test("optional Advanced AI section is collapsed by default and visually marked Advanced", () => {
  const html = renderQuickInputHtml();

  assert.match(html, /<details class="section-card advanced-section"/);
  assert.doesNotMatch(html, /<details class="section-card advanced-section" open/);
  assert.match(html, /Advanced 입력입니다\. 기본 보상 시나리오에는 필요하지 않습니다\./);
  assert.match(html, /AI가 사람을 대체한다는 계산이 아닙니다/);
});

test("minimum aggregate draft validates without optional runway or AI inputs", () => {
  const result = validateQuickInputDraft(minimumValidDraft());

  assert.equal(result.valid, true, result.errors.join("\n"));
});

test("quick input validation rejects missing required aggregate fields", () => {
  const draft = minimumValidDraft();
  draft.compensationSnapshot.total_headcount = undefined;

  const result = validateQuickInputDraft(draft);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /총 인원/);
});

test("quick input validation rejects negative currency and count values", () => {
  const draft = minimumValidDraft();
  draft.compensationSnapshot.total_monthly_base_pay = -1;
  draft.hiringPlan.planned_hires_6m = { L2: -2 };

  const result = validateQuickInputDraft(draft);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /월 기본급 총액/);
  assert.match(result.errors.join("\n"), /6개월 채용 계획/);
});

test("quick input validation rejects invalid enum values", () => {
  const draft = minimumValidDraft();
  draft.companyContext.funding_stage = "series_z";

  const result = validateQuickInputDraft(draft);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /투자 단계/);
});

test("quick input validation rejects PII-like free text", () => {
  const draft = minimumValidDraft();
  draft.compensationSnapshot.grouped_input_notes = "L3 kim@example.com 82000000";

  const result = validateQuickInputDraft(draft);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /개인정보|식별/);
});

test("static quick input preview can be opened without adding an app route", () => {
  const htmlPath = "frontend/hr-paysim/quick-input.html";
  const cssPath = "frontend/hr-paysim/quick-input.css";
  const jsPath = "frontend/hr-paysim/quick-input.js";

  assert.equal(existsSync(htmlPath), true);
  assert.equal(existsSync(cssPath), true);
  assert.equal(existsSync(jsPath), true);

  const html = readFileSync(htmlPath, "utf8");
  assert.match(html, /HR PaySim/);
  assert.match(html, /보상 쪽은 한 단계 더 시뮬레이션해볼 수 있습니다/);
  assert.match(html, /<details class="section-card advanced-section">/);
  assert.doesNotMatch(html, /<details class="section-card advanced-section" open>/);
  assert.doesNotMatch(html, /employee_name|email|phone_number|resident_id|raw_salary/i);
});
