import assert from "node:assert/strict";
import test from "node:test";
import type { DecisionRecord } from "../../src/lib/hr-paysim/decisions/types.ts";
import type { InterpretationClaim, InterpretationStatement } from "../../src/lib/hr-paysim/interpretation/types.ts";
import { buildSessionReport } from "../../src/lib/hr-paysim/report/buildSessionReport.ts";
import type { BuildSessionReportInput } from "../../src/lib/hr-paysim/report/types.ts";
import type { EvidenceFollowUp, ThemeReview } from "../../src/lib/hr-paysim/review/types.ts";
import type { StructuralTheme } from "../../src/lib/hr-paysim/themes/types.ts";

const theme = minimalTheme("theme-product", "Product Engineer");
const review: ThemeReview = {
  themeId: theme.id,
  explanationBasis: "market_hiring_additional_pay",
  evidenceStatus: "documented",
  repeatabilityStatus: "conditional_rule",
  outcome: "explained_with_evidence",
  approvedSentenceKey: "market_hiring_additional_pay",
};

test("drops every conflicting decision ID independent of input order", () => {
  const first = decision("shared-decision", "define_hiring_additional_pay");
  const second = decision("shared-decision", "collect_evidence");
  const forward = buildSessionReport(input({ decisions: [first, second] }));
  const reversed = buildSessionReport(input({ decisions: [second, first] }));

  assert.deepEqual(forward, reversed);
  assert.deepEqual(forward.decisions, []);
  assert.deepEqual(forward.reviewedSubjects[0]?.decisionIds, []);
});

test("deduplicates identical decision IDs while preserving unique decisions", () => {
  const duplicate = decision("duplicate-decision", "collect_evidence");
  const unique = decision("unique-decision", "define_hiring_additional_pay");
  const report = buildSessionReport(input({ decisions: [duplicate, unique, structuredClone(duplicate)] }));

  assert.deepEqual(report.decisions.map((item) => item.id), [
    "duplicate-decision",
    "unique-decision",
  ]);
});

test("drops every conflicting follow-up ID independent of input order", () => {
  const first = followUp("shared-follow-up", "offer_record");
  const second = followUp("shared-follow-up", "raise_history");
  const forward = buildSessionReport(input({ followUps: [first, second] }));
  const reversed = buildSessionReport(input({ followUps: [second, first] }));

  assert.deepEqual(forward, reversed);
  assert.deepEqual(forward.followUps, []);
});

test("deduplicates identical follow-up IDs while preserving unique follow-ups", () => {
  const duplicate = followUp("duplicate-follow-up", "offer_record");
  const unique = followUp("unique-follow-up", "raise_history");
  const report = buildSessionReport(input({
    followUps: [duplicate, unique, structuredClone(duplicate)],
  }));

  assert.deepEqual(report.followUps.map((item) => item.id), [
    "duplicate-follow-up",
    "unique-follow-up",
  ]);
});

test("drops every conflicting statement ID independent of claim order", () => {
  const first = claim("claim-a", statement("shared-statement", "copy.first"));
  const second = claim("claim-b", statement("shared-statement", "copy.second"));
  const forward = buildSessionReport(input({ validatedClaims: [first, second] }));
  const reversed = buildSessionReport(input({ validatedClaims: [second, first] }));

  assert.deepEqual(forward, reversed);
  assert.deepEqual(forward.confirmedResults, []);
});

test("deduplicates identical statement IDs while preserving unique statements", () => {
  const duplicateStatement = statement("duplicate-statement", "copy.duplicate");
  const uniqueStatement = statement("unique-statement", "copy.unique");
  const report = buildSessionReport(input({
    validatedClaims: [
      claim("claim-a", duplicateStatement),
      claim("claim-b", structuredClone(duplicateStatement)),
      claim("claim-c", uniqueStatement),
    ],
  }));

  assert.deepEqual(report.confirmedResults.map((item) => item.statementId), [
    "duplicate-statement",
    "unique-statement",
  ]);
});

function input(overrides: Partial<BuildSessionReportInput>): BuildSessionReportInput {
  return {
    themes: [theme],
    reviews: { [theme.id]: review },
    validatedClaims: [],
    repeatResults: {},
    decisions: [],
    followUps: [],
    unselectedSubjects: [],
    ...overrides,
  };
}

function decision(id: string, actionKey: DecisionRecord["actionKey"]): DecisionRecord {
  return {
    id,
    themeIds: [theme.id],
    actionKey,
    ownerRole: "CEO_AND_HR",
    dueEvent: "BEFORE_NEXT_OFFER",
    status: "approved",
  };
}

function followUp(
  id: string,
  evidenceNeeded: EvidenceFollowUp["evidenceNeeded"],
): EvidenceFollowUp {
  return {
    id,
    themeId: theme.id,
    evidenceNeeded,
    ownerRole: "HR",
    dueEvent: "WITHIN_TWO_WEEKS",
  };
}

function claim(id: string, statementValue: InterpretationStatement): InterpretationClaim {
  return {
    id,
    themeId: theme.id,
    statements: [statementValue],
    founderQuestion: { copyKey: `question.${id}`, supportingStatementIds: [statementValue.id] },
  };
}

function statement(id: string, copyKey: string): InterpretationStatement {
  return {
    id,
    kind: "SURFACE_OBSERVATION",
    copyKey,
    claimStatus: "SUPPORTED_BY_CLIENT_DATA",
    triggerEvidenceIds: [],
    reviewDependencyIds: [theme.id],
    sourceRefs: [],
    mustNotClaimKeys: [],
  };
}

function minimalTheme(id: string, roleGroup: string): StructuralTheme {
  return {
    id,
    roleGroup,
    archetype: "isolated_relationship",
    dataStatus: "sufficient",
    patternKind: "isolated",
    findingIds: [],
    comparisonPairs: [],
    affectedRowIds: [],
    supportingObservations: [],
    metrics: { nonClaim: "not a recommendation" },
    normalizedHeadlineGap: 0,
  };
}
