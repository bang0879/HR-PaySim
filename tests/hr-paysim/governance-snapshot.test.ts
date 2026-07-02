import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  GOVERNANCE_SNAPSHOT_HEADLINE,
  createGovernanceSnapshotModel,
  renderGovernanceSnapshotHtml,
} from "../../frontend/components/hr-paysim/GovernanceSnapshot.ts";
import { syntheticCompanyProfiles } from "../../frontend/lib/hr-paysim/examples/syntheticCompanies.ts";

const forbiddenTerms = [
  "AI substitution",
  "AI replacement",
  "AI 대체율",
  "attrition probability",
  "이직 확률",
  "Total Work Cost",
  "productivity gain",
  "생산성 향상률",
];

test("governance snapshot renders CEI, CED, pay inversion, payroll baseline, and interpretation", () => {
  const sample = syntheticCompanyProfiles.find(
    (profile) => profile.id === "synthetic_growth_130_exception_debt",
  );
  assert.ok(sample);

  const snapshot = createGovernanceSnapshotModel(sample);
  const html = renderGovernanceSnapshotHtml(snapshot);

  assert.match(html, new RegExp(GOVERNANCE_SNAPSHOT_HEADLINE));
  assert.match(html, /보상 설명 가능성/);
  assert.match(html, /보상 예외 부채/);
  assert.match(html, /보상 역전 위험/);
  assert.match(html, /현재 payroll 기준선/);
  assert.match(html, /현재 구조는 보상 기준을 설명하기 어렵고/);
  assert.match(html, /예외는 한 번이면 유연성이지만/);
  assert.ok(snapshot.cei.score >= 0 && snapshot.cei.score <= 100);
  assert.ok(snapshot.ced.score >= 0 && snapshot.ced.score <= 100);
  assert.equal(snapshot.payInversion.caseCount, 14);
});

test("governance snapshot handles missing optional runway and AI data", () => {
  const sample = syntheticCompanyProfiles.find((profile) => profile.id === "synthetic_series_a_50");
  assert.ok(sample);

  const snapshot = createGovernanceSnapshotModel(sample);
  const html = renderGovernanceSnapshotHtml(snapshot);

  assert.equal(snapshot.optionalRunwayImpact, undefined);
  assert.equal(snapshot.hasAIInputs, false);
  assert.match(html, /cash\/runway 입력 시 표시/);
  assert.doesNotMatch(html, /Advanced AI/);
});

test("governance snapshot does not show forbidden metrics", () => {
  const sample = syntheticCompanyProfiles[1];
  const html = renderGovernanceSnapshotHtml(createGovernanceSnapshotModel(sample));

  for (const term of forbiddenTerms) {
    assert.doesNotMatch(html, new RegExp(term, "i"));
  }
});

test("static governance snapshot preview exists and stays before scenario comparison", () => {
  const htmlPath = "frontend/hr-paysim/governance-snapshot.html";
  const cssPath = "frontend/hr-paysim/governance-snapshot.css";
  const jsPath = "frontend/hr-paysim/governance-snapshot.js";

  assert.equal(existsSync(htmlPath), true);
  assert.equal(existsSync(cssPath), true);
  assert.equal(existsSync(jsPath), true);

  const html = readFileSync(htmlPath, "utf8");
  assert.match(html, /현재 보상 구조의 출발점입니다/);
  assert.match(html, /보상 설명 가능성/);
  assert.match(html, /보상 예외 부채/);
  assert.match(html, /보상 역전 위험/);
  assert.match(html, /현재 payroll 기준선/);
  assert.match(html, /조정 시나리오 만들기/);
  assert.doesNotMatch(html, /Scenario Comparison|Decision Memo|Aggregate Consent/);
});
