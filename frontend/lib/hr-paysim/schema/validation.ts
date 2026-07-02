import {
  AI_TOOLING_LEVELS,
  COMPANY_SIZE_BANDS,
  DIFFICULTY_LEVELS,
  FREQUENCY_LEVELS,
  FUNDING_STAGES,
  QUESTION_ANSWERS,
  RISK_FLAGS,
  SCENARIO_IDS,
  SCORE_BANDS,
  UNDOCUMENTED_NEGOTIATION_LEVELS,
} from "./types.ts";
import type {
  AIScenarioInputs,
  AIScenarioValidationOptions,
  AggregateLogEvent,
  CompanyContext,
  CompanyProfile,
  CompensationSnapshot,
  HiringPlan,
  SalaryBandModel,
  ScenarioResult,
  ValidationResult,
} from "./types.ts";

const DISALLOWED_KEY_TOKENS = new Set([
  "employeename",
  "employeenames",
  "employeeemail",
  "employeeemails",
  "email",
  "emails",
  "phone",
  "phonenumber",
  "residentid",
  "salarybyemployee",
  "employeesalary",
  "rawsalaryfile",
  "payrollexport",
  "companyname",
  "username",
  "userid",
  "hrprismdiagnosisid",
  "aisubstitutionpercentage",
  "totalworkcost",
  "attritionprobability",
  "productivitygainpercentage",
]);

const SENSITIVE_STRING_PATTERNS = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b01[016789]-?\d{3,4}-?\d{4}\b/,
  /\b\d{6}-\d{7}\b/,
];

function result(errors: string[]): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
  };
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function assertPlainObject(
  value: unknown,
  path: string,
  errors: string[],
): value is Record<string, unknown> {
  if (!isPlainObject(value)) {
    errors.push(`${path} must be an object.`);
    return false;
  }
  return true;
}

function assertAllowedKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
  path: string,
  errors: string[],
): void {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      errors.push(`${path}.${key} is not an allowed field.`);
    }
  }
}

function assertNoSensitiveData(value: unknown, path: string, errors: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSensitiveData(item, `${path}[${index}]`, errors));
    return;
  }

  if (isPlainObject(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      if (DISALLOWED_KEY_TOKENS.has(normalizeKey(key))) {
        errors.push(`${path}.${key} is a disallowed privacy field.`);
      }
      assertNoSensitiveData(nestedValue, `${path}.${key}`, errors);
    }
    return;
  }

  if (typeof value === "string") {
    for (const pattern of SENSITIVE_STRING_PATTERNS) {
      if (pattern.test(value)) {
        errors.push(`${path} contains sensitive identifying text.`);
        return;
      }
    }
  }
}

function assertRequired(value: Record<string, unknown>, key: string, path: string, errors: string[]): void {
  if (!hasOwn(value, key) || value[key] === undefined) {
    errors.push(`${path}.${key} is required.`);
  }
}

function assertBoolean(value: unknown, path: string, errors: string[]): void {
  if (typeof value !== "boolean") {
    errors.push(`${path} must be true or false.`);
  }
}

function assertString(value: unknown, path: string, errors: string[]): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${path} must be a non-empty string.`);
  }
}

function assertEnum<T extends readonly string[]>(
  value: unknown,
  allowedValues: T,
  path: string,
  errors: string[],
): void {
  if (typeof value !== "string" || !allowedValues.includes(value)) {
    errors.push(`${path} must be one of: ${allowedValues.join(", ")}.`);
  }
}

function assertNumber(
  value: unknown,
  path: string,
  errors: string[],
  options: { integer?: boolean; min?: number; max?: number } = {},
): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(`${path} must be a finite number.`);
    return;
  }

  if (options.integer && !Number.isInteger(value)) {
    errors.push(`${path} must be an integer.`);
  }

  if (options.min !== undefined && value < options.min) {
    errors.push(`${path} must be greater than or equal to ${options.min}.`);
  }

  if (options.max !== undefined && value > options.max) {
    errors.push(`${path} must be less than or equal to ${options.max}.`);
  }
}

function assertOptionalNumber(
  value: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[],
  options: { integer?: boolean; min?: number; max?: number } = {},
): void {
  if (hasOwn(value, key) && value[key] !== undefined) {
    assertNumber(value[key], `${path}.${key}`, errors, options);
  }
}

function assertOptionalBoolean(
  value: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[],
): void {
  if (hasOwn(value, key) && value[key] !== undefined) {
    assertBoolean(value[key], `${path}.${key}`, errors);
  }
}

function assertRecordOfNumbers(
  value: unknown,
  path: string,
  errors: string[],
  options: { integer?: boolean; min?: number },
): void {
  if (!assertPlainObject(value, path, errors)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    assertGenericLabel(key, `${path}.${key}`, errors);
    assertNumber(nestedValue, `${path}.${key}`, errors, options);
  }
}

function assertOptionalRecordOfNumbers(
  value: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[],
  options: { integer?: boolean; min?: number },
): void {
  if (hasOwn(value, key) && value[key] !== undefined) {
    assertRecordOfNumbers(value[key], `${path}.${key}`, errors, options);
  }
}

function assertQuestionRecord(value: unknown, path: string, errors: string[]): void {
  if (!assertPlainObject(value, path, errors)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    assertGenericLabel(key, `${path}.${key}`, errors);
    assertEnum(nestedValue, QUESTION_ANSWERS, `${path}.${key}`, errors);
  }
}

function assertGenericLabel(value: unknown, path: string, errors: string[]): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${path} must be a non-empty generic label.`);
    return;
  }

  if (DISALLOWED_KEY_TOKENS.has(normalizeKey(value))) {
    errors.push(`${path} must not identify a person, company, or raw payroll artifact.`);
  }

  for (const pattern of SENSITIVE_STRING_PATTERNS) {
    if (pattern.test(value)) {
      errors.push(`${path} contains sensitive identifying text.`);
      return;
    }
  }
}

function assertScore(value: unknown, path: string, errors: string[]): void {
  assertNumber(value, path, errors, { min: 0, max: 100 });
}

function sumRecord(value: unknown): number | undefined {
  if (!isPlainObject(value)) {
    return undefined;
  }

  return Object.values(value).reduce((sum, next) => {
    if (typeof next !== "number" || !Number.isFinite(next)) {
      return sum;
    }
    return sum + next;
  }, 0);
}

function headcountFitsBand(headcount: number, band: unknown): boolean {
  if (typeof band !== "string") {
    return false;
  }

  if (band === "501+") {
    return headcount >= 501;
  }

  const [min, max] = band.split("-").map(Number);
  return Number.isFinite(min) && Number.isFinite(max) && headcount >= min && headcount <= max;
}

export function validateCompanyContext(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!assertPlainObject(input, "CompanyContext", errors)) {
    return result(errors);
  }

  const requiredKeys = [
    "company_size_band",
    "funding_stage",
    "has_hr_owner",
    "has_level_system",
    "has_salary_band",
    "has_performance_review",
    "has_variable_pay",
    "has_equity_plan",
    "current_ai_tooling_level",
  ];

  assertNoSensitiveData(input, "CompanyContext", errors);
  assertAllowedKeys(input, requiredKeys, "CompanyContext", errors);
  requiredKeys.forEach((key) => assertRequired(input, key, "CompanyContext", errors));
  assertEnum(input.company_size_band, COMPANY_SIZE_BANDS, "CompanyContext.company_size_band", errors);
  assertEnum(input.funding_stage, FUNDING_STAGES, "CompanyContext.funding_stage", errors);
  assertBoolean(input.has_hr_owner, "CompanyContext.has_hr_owner", errors);
  assertBoolean(input.has_level_system, "CompanyContext.has_level_system", errors);
  assertBoolean(input.has_salary_band, "CompanyContext.has_salary_band", errors);
  assertBoolean(input.has_performance_review, "CompanyContext.has_performance_review", errors);
  assertBoolean(input.has_variable_pay, "CompanyContext.has_variable_pay", errors);
  assertBoolean(input.has_equity_plan, "CompanyContext.has_equity_plan", errors);
  assertEnum(
    input.current_ai_tooling_level,
    AI_TOOLING_LEVELS,
    "CompanyContext.current_ai_tooling_level",
    errors,
  );

  return result(errors);
}

export function validateCompensationSnapshot(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!assertPlainObject(input, "CompensationSnapshot", errors)) {
    return result(errors);
  }

  assertNoSensitiveData(input, "CompensationSnapshot", errors);
  assertAllowedKeys(
    input,
    [
      "total_headcount",
      "total_monthly_base_pay",
      "total_monthly_fixed_allowance",
      "total_expected_variable_pay",
      "average_salary_by_level",
      "headcount_by_level",
      "headcount_by_function",
      "recent_raise_budget",
      "exception_raise_frequency",
      "counteroffer_frequency",
      "new_hire_premium_exists",
      "pay_inversion_case_count",
      "out_of_band_case_count",
      "undocumented_negotiation_level",
      "variable_pay_linked_to_performance",
      "manager_can_explain_pay_basis",
    ],
    "CompensationSnapshot",
    errors,
  );

  [
    "total_headcount",
    "total_monthly_base_pay",
    "total_monthly_fixed_allowance",
    "exception_raise_frequency",
    "counteroffer_frequency",
    "new_hire_premium_exists",
  ].forEach((key) => assertRequired(input, key, "CompensationSnapshot", errors));

  assertNumber(input.total_headcount, "CompensationSnapshot.total_headcount", errors, {
    integer: true,
    min: 1,
  });
  assertNumber(input.total_monthly_base_pay, "CompensationSnapshot.total_monthly_base_pay", errors, {
    min: 0,
  });
  assertNumber(
    input.total_monthly_fixed_allowance,
    "CompensationSnapshot.total_monthly_fixed_allowance",
    errors,
    { min: 0 },
  );
  assertOptionalNumber(input, "total_expected_variable_pay", "CompensationSnapshot", errors, {
    min: 0,
  });
  assertOptionalRecordOfNumbers(input, "average_salary_by_level", "CompensationSnapshot", errors, {
    min: 0,
  });
  assertOptionalRecordOfNumbers(input, "headcount_by_level", "CompensationSnapshot", errors, {
    integer: true,
    min: 0,
  });
  assertOptionalRecordOfNumbers(input, "headcount_by_function", "CompensationSnapshot", errors, {
    integer: true,
    min: 0,
  });
  assertOptionalNumber(input, "recent_raise_budget", "CompensationSnapshot", errors, { min: 0 });
  assertEnum(
    input.exception_raise_frequency,
    FREQUENCY_LEVELS,
    "CompensationSnapshot.exception_raise_frequency",
    errors,
  );
  assertEnum(
    input.counteroffer_frequency,
    FREQUENCY_LEVELS,
    "CompensationSnapshot.counteroffer_frequency",
    errors,
  );
  assertBoolean(input.new_hire_premium_exists, "CompensationSnapshot.new_hire_premium_exists", errors);
  assertOptionalNumber(input, "pay_inversion_case_count", "CompensationSnapshot", errors, {
    integer: true,
    min: 0,
  });
  assertOptionalNumber(input, "out_of_band_case_count", "CompensationSnapshot", errors, {
    integer: true,
    min: 0,
  });
  if (hasOwn(input, "undocumented_negotiation_level")) {
    assertEnum(
      input.undocumented_negotiation_level,
      UNDOCUMENTED_NEGOTIATION_LEVELS,
      "CompensationSnapshot.undocumented_negotiation_level",
      errors,
    );
  }
  assertOptionalBoolean(input, "variable_pay_linked_to_performance", "CompensationSnapshot", errors);
  assertOptionalBoolean(input, "manager_can_explain_pay_basis", "CompensationSnapshot", errors);

  const levelHeadcount = sumRecord(input.headcount_by_level);
  if (
    typeof levelHeadcount === "number" &&
    typeof input.total_headcount === "number" &&
    levelHeadcount > input.total_headcount
  ) {
    errors.push("CompensationSnapshot.headcount_by_level sum must not exceed total_headcount.");
  }

  const functionHeadcount = sumRecord(input.headcount_by_function);
  if (
    typeof functionHeadcount === "number" &&
    typeof input.total_headcount === "number" &&
    functionHeadcount > input.total_headcount
  ) {
    errors.push("CompensationSnapshot.headcount_by_function sum must not exceed total_headcount.");
  }

  return result(errors);
}

export function validateHiringPlan(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!assertPlainObject(input, "HiringPlan", errors)) {
    return result(errors);
  }

  assertNoSensitiveData(input, "HiringPlan", errors);
  assertAllowedKeys(
    input,
    [
      "planned_hires_6m",
      "planned_hires_12m",
      "average_expected_salary_by_level",
      "hiring_freeze_toggle",
      "optional_cash_balance",
      "optional_runway_months",
    ],
    "HiringPlan",
    errors,
  );

  [
    "planned_hires_6m",
    "planned_hires_12m",
    "average_expected_salary_by_level",
    "hiring_freeze_toggle",
  ].forEach((key) => assertRequired(input, key, "HiringPlan", errors));

  assertRecordOfNumbers(input.planned_hires_6m, "HiringPlan.planned_hires_6m", errors, {
    integer: true,
    min: 0,
  });
  assertRecordOfNumbers(input.planned_hires_12m, "HiringPlan.planned_hires_12m", errors, {
    integer: true,
    min: 0,
  });
  assertRecordOfNumbers(
    input.average_expected_salary_by_level,
    "HiringPlan.average_expected_salary_by_level",
    errors,
    { min: 0 },
  );
  assertBoolean(input.hiring_freeze_toggle, "HiringPlan.hiring_freeze_toggle", errors);
  assertOptionalNumber(input, "optional_cash_balance", "HiringPlan", errors, { min: 0 });
  assertOptionalNumber(input, "optional_runway_months", "HiringPlan", errors, { min: 0.000001 });

  return result(errors);
}

export function validateSalaryBandModel(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!assertPlainObject(input, "SalaryBandModel", errors)) {
    return result(errors);
  }

  assertNoSensitiveData(input, "SalaryBandModel", errors);
  assertAllowedKeys(
    input,
    ["level", "min", "midpoint", "max", "range_spread", "midpoint_progression"],
    "SalaryBandModel",
    errors,
  );
  ["level", "min", "midpoint", "max"].forEach((key) =>
    assertRequired(input, key, "SalaryBandModel", errors),
  );

  assertGenericLabel(input.level, "SalaryBandModel.level", errors);
  assertNumber(input.min, "SalaryBandModel.min", errors, { min: 0 });
  assertNumber(input.midpoint, "SalaryBandModel.midpoint", errors, { min: 0 });
  assertNumber(input.max, "SalaryBandModel.max", errors, { min: 0 });
  assertOptionalNumber(input, "range_spread", "SalaryBandModel", errors, { min: 0 });
  assertOptionalNumber(input, "midpoint_progression", "SalaryBandModel", errors, { min: 0 });

  if (
    typeof input.min === "number" &&
    typeof input.midpoint === "number" &&
    input.min > input.midpoint
  ) {
    errors.push("SalaryBandModel.min must be less than or equal to midpoint.");
  }

  if (
    typeof input.midpoint === "number" &&
    typeof input.max === "number" &&
    input.midpoint > input.max
  ) {
    errors.push("SalaryBandModel.midpoint must be less than or equal to max.");
  }

  return result(errors);
}

export function validateAIScenarioInputs(
  input: unknown,
  options: AIScenarioValidationOptions,
): ValidationResult {
  const errors: string[] = [];
  if (input === undefined || input === null) {
    return result(errors);
  }

  if (!assertPlainObject(input, "AIScenarioInputs", errors)) {
    return result(errors);
  }

  const hasAnyInput = Object.keys(input).length > 0;
  if (hasAnyInput && !options.advancedEnabled) {
    errors.push("AIScenarioInputs can be provided only when Advanced mode is enabled.");
  }

  assertNoSensitiveData(input, "AIScenarioInputs", errors);
  assertAllowedKeys(
    input,
    [
      "planned_ai_tool_budget_monthly",
      "planned_ai_tool_budget_annual",
      "hiring_delay_months",
      "affected_roles_or_functions",
      "productivity_leakage_questions",
      "junior_pipeline_risk_questions",
      "orchestrator_target_count",
      "premium_pool_allocation_rate",
    ],
    "AIScenarioInputs",
    errors,
  );

  assertOptionalNumber(input, "planned_ai_tool_budget_monthly", "AIScenarioInputs", errors, {
    min: 0,
  });
  assertOptionalNumber(input, "planned_ai_tool_budget_annual", "AIScenarioInputs", errors, {
    min: 0,
  });
  assertOptionalNumber(input, "hiring_delay_months", "AIScenarioInputs", errors, {
    integer: true,
    min: 0,
    max: 24,
  });

  if (hasOwn(input, "affected_roles_or_functions") && input.affected_roles_or_functions !== undefined) {
    if (!Array.isArray(input.affected_roles_or_functions)) {
      errors.push("AIScenarioInputs.affected_roles_or_functions must be an array.");
    } else {
      input.affected_roles_or_functions.forEach((label, index) => {
        assertGenericLabel(label, `AIScenarioInputs.affected_roles_or_functions[${index}]`, errors);
      });
    }
  }

  if (hasOwn(input, "productivity_leakage_questions")) {
    assertQuestionRecord(
      input.productivity_leakage_questions,
      "AIScenarioInputs.productivity_leakage_questions",
      errors,
    );
  }

  if (hasOwn(input, "junior_pipeline_risk_questions")) {
    assertQuestionRecord(
      input.junior_pipeline_risk_questions,
      "AIScenarioInputs.junior_pipeline_risk_questions",
      errors,
    );
  }

  assertOptionalNumber(input, "orchestrator_target_count", "AIScenarioInputs", errors, {
    integer: true,
    min: 0,
  });
  assertOptionalNumber(input, "premium_pool_allocation_rate", "AIScenarioInputs", errors, {
    min: 0,
    max: 100,
  });

  return result(errors);
}

export function validateScenarioResult(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!assertPlainObject(input, "ScenarioResult", errors)) {
    return result(errors);
  }

  assertNoSensitiveData(input, "ScenarioResult", errors);
  assertAllowedKeys(
    input,
    [
      "scenario_id",
      "scenario_name",
      "annual_cost_delta",
      "monthly_burn_delta",
      "cei_before",
      "cei_after",
      "ced_before",
      "ced_after",
      "pay_inversion_cases_before",
      "pay_inversion_cases_after",
      "execution_difficulty",
      "communication_difficulty",
      "risk_flags",
      "explanation_text",
    ],
    "ScenarioResult",
    errors,
  );

  [
    "scenario_id",
    "scenario_name",
    "annual_cost_delta",
    "monthly_burn_delta",
    "cei_before",
    "cei_after",
    "ced_before",
    "ced_after",
    "execution_difficulty",
    "communication_difficulty",
    "risk_flags",
    "explanation_text",
  ].forEach((key) => assertRequired(input, key, "ScenarioResult", errors));

  assertEnum(input.scenario_id, SCENARIO_IDS, "ScenarioResult.scenario_id", errors);
  assertString(input.scenario_name, "ScenarioResult.scenario_name", errors);
  assertNumber(input.annual_cost_delta, "ScenarioResult.annual_cost_delta", errors);
  assertNumber(input.monthly_burn_delta, "ScenarioResult.monthly_burn_delta", errors);
  assertScore(input.cei_before, "ScenarioResult.cei_before", errors);
  assertScore(input.cei_after, "ScenarioResult.cei_after", errors);
  assertScore(input.ced_before, "ScenarioResult.ced_before", errors);
  assertScore(input.ced_after, "ScenarioResult.ced_after", errors);
  assertOptionalNumber(input, "pay_inversion_cases_before", "ScenarioResult", errors, {
    integer: true,
    min: 0,
  });
  assertOptionalNumber(input, "pay_inversion_cases_after", "ScenarioResult", errors, {
    integer: true,
    min: 0,
  });
  assertEnum(
    input.execution_difficulty,
    DIFFICULTY_LEVELS,
    "ScenarioResult.execution_difficulty",
    errors,
  );
  assertEnum(
    input.communication_difficulty,
    DIFFICULTY_LEVELS,
    "ScenarioResult.communication_difficulty",
    errors,
  );

  if (!Array.isArray(input.risk_flags)) {
    errors.push("ScenarioResult.risk_flags must be an array.");
  } else {
    input.risk_flags.forEach((flag, index) =>
      assertEnum(flag, RISK_FLAGS, `ScenarioResult.risk_flags[${index}]`, errors),
    );
  }
  assertString(input.explanation_text, "ScenarioResult.explanation_text", errors);

  return result(errors);
}

export function validateAggregateLogEvent(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!assertPlainObject(input, "AggregateLogEvent", errors)) {
    return result(errors);
  }

  assertNoSensitiveData(input, "AggregateLogEvent", errors);
  assertAllowedKeys(
    input,
    [
      "company_size_band",
      "funding_stage",
      "has_salary_band",
      "cei_band",
      "ced_band",
      "selected_scenario",
      "advanced_scenario_viewed",
      "productivity_leakage_flag",
      "created_at",
      "consent_for_aggregate_analysis",
    ],
    "AggregateLogEvent",
    errors,
  );

  [
    "company_size_band",
    "funding_stage",
    "has_salary_band",
    "cei_band",
    "ced_band",
    "selected_scenario",
    "advanced_scenario_viewed",
    "created_at",
    "consent_for_aggregate_analysis",
  ].forEach((key) => assertRequired(input, key, "AggregateLogEvent", errors));

  assertEnum(input.company_size_band, COMPANY_SIZE_BANDS, "AggregateLogEvent.company_size_band", errors);
  assertEnum(input.funding_stage, FUNDING_STAGES, "AggregateLogEvent.funding_stage", errors);
  assertBoolean(input.has_salary_band, "AggregateLogEvent.has_salary_band", errors);
  assertEnum(input.cei_band, SCORE_BANDS, "AggregateLogEvent.cei_band", errors);
  assertEnum(input.ced_band, SCORE_BANDS, "AggregateLogEvent.ced_band", errors);
  assertEnum(input.selected_scenario, SCENARIO_IDS, "AggregateLogEvent.selected_scenario", errors);
  assertBoolean(
    input.advanced_scenario_viewed,
    "AggregateLogEvent.advanced_scenario_viewed",
    errors,
  );
  assertOptionalBoolean(input, "productivity_leakage_flag", "AggregateLogEvent", errors);

  if (typeof input.created_at !== "string" || Number.isNaN(Date.parse(input.created_at))) {
    errors.push("AggregateLogEvent.created_at must be an ISO 8601 datetime string.");
  }

  assertBoolean(
    input.consent_for_aggregate_analysis,
    "AggregateLogEvent.consent_for_aggregate_analysis",
    errors,
  );
  if (input.consent_for_aggregate_analysis !== true) {
    errors.push("AggregateLogEvent.consent_for_aggregate_analysis must be true before logging.");
  }

  return result(errors);
}

export function validateCompanyProfile(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!assertPlainObject(input, "CompanyProfile", errors)) {
    return result(errors);
  }

  assertNoSensitiveData(input, "CompanyProfile", errors);
  assertAllowedKeys(
    input,
    [
      "id",
      "label",
      "companyContext",
      "compensationSnapshot",
      "hiringPlan",
      "salaryBands",
      "aiScenarioInputs",
      "advancedEnabled",
    ],
    "CompanyProfile",
    errors,
  );

  ["id", "label", "companyContext", "compensationSnapshot", "hiringPlan"].forEach((key) =>
    assertRequired(input, key, "CompanyProfile", errors),
  );
  assertString(input.id, "CompanyProfile.id", errors);
  assertString(input.label, "CompanyProfile.label", errors);
  assertOptionalBoolean(input, "advancedEnabled", "CompanyProfile", errors);

  const companyResult = validateCompanyContext(input.companyContext);
  const snapshotResult = validateCompensationSnapshot(input.compensationSnapshot);
  const hiringPlanResult = validateHiringPlan(input.hiringPlan);
  errors.push(...companyResult.errors, ...snapshotResult.errors, ...hiringPlanResult.errors);

  if (Array.isArray(input.salaryBands)) {
    input.salaryBands.forEach((band, index) => {
      const bandResult = validateSalaryBandModel(band);
      errors.push(...bandResult.errors.map((error) => `salaryBands[${index}]: ${error}`));
    });
  } else if (hasOwn(input, "salaryBands") && input.salaryBands !== undefined) {
    errors.push("CompanyProfile.salaryBands must be an array when provided.");
  }

  const aiResult = validateAIScenarioInputs(input.aiScenarioInputs, {
    advancedEnabled: input.advancedEnabled === true,
  });
  errors.push(...aiResult.errors);

  if (
    isPlainObject(input.companyContext) &&
    isPlainObject(input.compensationSnapshot) &&
    typeof input.compensationSnapshot.total_headcount === "number" &&
    !headcountFitsBand(input.compensationSnapshot.total_headcount, input.companyContext.company_size_band)
  ) {
    errors.push("CompanyProfile total_headcount should fit company_size_band.");
  }

  return result(errors);
}

export type {
  AIScenarioInputs,
  AggregateLogEvent,
  CompanyContext,
  CompanyProfile,
  CompensationSnapshot,
  HiringPlan,
  SalaryBandModel,
  ScenarioResult,
};
