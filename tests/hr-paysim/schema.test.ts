import assert from "node:assert/strict";
import test from "node:test";

import {
  validateAIScenarioInputs,
  validateAggregateLogEvent,
  validateCompanyProfile,
} from "../../frontend/lib/hr-paysim/schema/validation.ts";
import { syntheticCompanyProfiles } from "../../frontend/lib/hr-paysim/examples/syntheticCompanies.ts";

const piiKeys = [
  "employee_name",
  "employee_names",
  "email",
  "emails",
  "phone",
  "phone_number",
  "resident_id",
  "salary_by_employee",
  "company_name",
  "raw_salary_file",
];

test("schema validates good synthetic sample data", () => {
  assert.equal(syntheticCompanyProfiles.length, 4);

  for (const profile of syntheticCompanyProfiles) {
    const result = validateCompanyProfile(profile);
    assert.equal(result.valid, true, `${profile.id}: ${result.errors.join(", ")}`);
  }
});

test("schema rejects negative payroll values", () => {
  const profile = structuredClone(syntheticCompanyProfiles[0]);
  profile.compensationSnapshot.total_monthly_base_pay = -1;

  const result = validateCompanyProfile(profile);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /total_monthly_base_pay/);
});

test("schema rejects invalid funding stage", () => {
  const profile = structuredClone(syntheticCompanyProfiles[0]);
  profile.companyContext.funding_stage = "series_z";

  const result = validateCompanyProfile(profile);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /funding_stage/);
});

test("aggregate log event contains no PII fields and rejects PII-like keys", () => {
  const event = {
    company_size_band: "51-100",
    funding_stage: "series_a",
    has_salary_band: false,
    cei_band: "41-60",
    ced_band: "61-80",
    selected_scenario: "salary_band_redesign",
    advanced_scenario_viewed: false,
    productivity_leakage_flag: false,
    created_at: "2026-07-02T15:20:00+09:00",
    consent_for_aggregate_analysis: true,
  };

  assert.equal(validateAggregateLogEvent(event).valid, true);
  for (const key of piiKeys) {
    assert.equal(Object.hasOwn(event, key), false);
  }

  const unsafeEvent = {
    ...event,
    company_name: "Synthetic Company A",
  };

  const result = validateAggregateLogEvent(unsafeEvent);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /company_name/);
});

test("AI scenario inputs can be absent without error", () => {
  const result = validateAIScenarioInputs(undefined, { advancedEnabled: false });

  assert.equal(result.valid, true);
});

test("AI scenario inputs are valid only when Advanced mode is enabled", () => {
  const advancedSample = syntheticCompanyProfiles.find((profile) => profile.aiScenarioInputs);
  assert.ok(advancedSample?.aiScenarioInputs);

  const disabledResult = validateAIScenarioInputs(advancedSample.aiScenarioInputs, {
    advancedEnabled: false,
  });
  const enabledResult = validateAIScenarioInputs(advancedSample.aiScenarioInputs, {
    advancedEnabled: true,
  });

  assert.equal(disabledResult.valid, false);
  assert.match(disabledResult.errors.join("\n"), /Advanced/);
  assert.equal(enabledResult.valid, true);
});
