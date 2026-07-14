import assert from "node:assert/strict";
import test from "node:test";
import { INTERPRETATION_CLAIM_REGISTRY } from "../../src/lib/hr-paysim/interpretation/claimRegistry.ts";
import type {
  ClaimValidationContext,
  InterpretationClaim,
} from "../../src/lib/hr-paysim/interpretation/types.ts";
import { validateInterpretationClaim } from "../../src/lib/hr-paysim/interpretation/validateInterpretationClaims.ts";
import { sampleRosterRows } from "../../src/lib/hr-paysim/rosterFixtures.ts";
import { detectStructuralFindings } from "../../src/lib/hr-paysim/structuralFindings.ts";
import { buildStructuralThemes } from "../../src/lib/hr-paysim/themes/buildStructuralThemes.ts";

const context: ClaimValidationContext = {
  evidenceIds: new Set(["pair-001"]),
  reviewedStateIds: new Set(["review-product"]),
};

test("one claim preserves different statement statuses", () => {
  const claim = createClaim();

  assert.deepEqual(validateInterpretationClaim(claim, context), []);
  assert.deepEqual(
    claim.statements.map((statement) => statement.claimStatus),
    ["SUPPORTED_BY_CLIENT_DATA", "WORKING_HYPOTHESIS"],
  );
});

test("external claims require a complete structured source", () => {
  const missing = createClaim();
  missing.statements[1] = {
    ...missing.statements[1]!,
    claimStatus: "VERIFIED_EXTERNAL",
    sourceRefs: [],
  };
  assert.ok(validateInterpretationClaim(missing, context).includes(
    "EXTERNAL_SOURCE_REQUIRED:premium-hypothesis",
  ));

  const incomplete = createClaim();
  incomplete.statements[1] = {
    ...incomplete.statements[1]!,
    claimStatus: "VERIFIED_EXTERNAL",
    sourceRefs: [{
      kind: "EXTERNAL",
      title: " ",
      publisher: "Publisher",
      publishedAt: "",
      sourceLocation: "https://example.test/source",
      populationOrScope: "",
      applicabilityNote: " ",
    }],
  };
  assert.deepEqual(validateInterpretationClaim(incomplete, context), [
    "EXTERNAL_FIELD_REQUIRED:premium-hypothesis:title",
    "EXTERNAL_FIELD_REQUIRED:premium-hypothesis:publishedAt",
    "EXTERNAL_FIELD_REQUIRED:premium-hypothesis:populationOrScope",
    "EXTERNAL_FIELD_REQUIRED:premium-hypothesis:applicabilityNote",
  ]);
});

test("malformed external source fields return validation errors instead of throwing", () => {
  const claim = createClaim();
  claim.statements[1] = {
    ...claim.statements[1]!,
    claimStatus: "VERIFIED_EXTERNAL",
    sourceRefs: [{
      kind: "EXTERNAL",
      title: null,
      publisher: 42,
      publishedAt: "2026-07-11",
      sourceLocation: "https://example.test/source",
      populationOrScope: "Korean startups",
      applicabilityNote: "Directional context only",
    } as never],
  };

  let errors: string[] | undefined;
  assert.doesNotThrow(() => {
    errors = validateInterpretationClaim(claim, context);
  });
  assert.deepEqual(errors, [
    "EXTERNAL_FIELD_REQUIRED:premium-hypothesis:title",
    "EXTERNAL_FIELD_REQUIRED:premium-hypothesis:publisher",
  ]);
});

test("client sources resolve every evidence and reviewed-state id", () => {
  const claim = createClaim();
  claim.statements[0]!.sourceRefs = [{
    kind: "CLIENT_DATA",
    evidenceIds: ["pair-001", "pair-missing"],
    reviewedStateIds: ["review-product", "review-missing"],
  }];

  assert.deepEqual(validateInterpretationClaim(claim, context), [
    "CLIENT_EVIDENCE_NOT_FOUND:salary-fact:pair-missing",
    "CLIENT_REVIEW_NOT_FOUND:salary-fact:review-missing",
  ]);
});

test("malformed client source arrays return validation errors instead of throwing", () => {
  const claim = createClaim();
  claim.statements[0]!.sourceRefs = [{
    kind: "CLIENT_DATA",
    evidenceIds: null,
    reviewedStateIds: "review-product",
  } as never];

  let errors: string[] | undefined;
  assert.doesNotThrow(() => {
    errors = validateInterpretationClaim(claim, context);
  });
  assert.deepEqual(errors, [
    "CLIENT_EVIDENCE_IDS_INVALID:salary-fact",
    "CLIENT_REVIEWED_STATE_IDS_INVALID:salary-fact",
  ]);
});

test("client source arrays reject non-string and blank ids before context lookup", () => {
  const claim = createClaim();
  claim.statements[0]!.sourceRefs = [{
    kind: "CLIENT_DATA",
    evidenceIds: ["pair-001", " ", 42],
    reviewedStateIds: ["review-product", null, ""],
  } as never];

  assert.deepEqual(validateInterpretationClaim(claim, context), [
    "CLIENT_EVIDENCE_ID_INVALID:salary-fact:1",
    "CLIENT_EVIDENCE_ID_INVALID:salary-fact:2",
    "CLIENT_REVIEWED_STATE_ID_INVALID:salary-fact:1",
    "CLIENT_REVIEWED_STATE_ID_INVALID:salary-fact:2",
  ]);
});

test("practitioner claims require a complete experience source", () => {
  const claim = createClaim();
  claim.statements[1] = {
    ...claim.statements[1]!,
    claimStatus: "KYLE_EXPERIENCE_BASED",
    sourceRefs: [{
      kind: "PRACTITIONER_EXPERIENCE",
      experienceRef: "",
      context: "Korean startup compensation review",
      limitation: " ",
    }],
  };

  assert.deepEqual(validateInterpretationClaim(claim, context), [
    "PRACTITIONER_FIELD_REQUIRED:premium-hypothesis:experienceRef",
    "PRACTITIONER_FIELD_REQUIRED:premium-hypothesis:limitation",
  ]);
});

test("malformed practitioner source fields return validation errors instead of throwing", () => {
  const claim = createClaim();
  claim.statements[1] = {
    ...claim.statements[1]!,
    claimStatus: "KYLE_EXPERIENCE_BASED",
    sourceRefs: [{
      kind: "PRACTITIONER_EXPERIENCE",
      experienceRef: null,
      context: { clientType: "startup" },
      limitation: "Not generalizable",
    } as never],
  };

  let errors: string[] | undefined;
  assert.doesNotThrow(() => {
    errors = validateInterpretationClaim(claim, context);
  });
  assert.deepEqual(errors, [
    "PRACTITIONER_FIELD_REQUIRED:premium-hypothesis:experienceRef",
    "PRACTITIONER_FIELD_REQUIRED:premium-hypothesis:context",
  ]);
});

test("duplicate statement ids fail closed", () => {
  const claim = createClaim();
  claim.statements.push(structuredClone(claim.statements[0]!));

  assert.deepEqual(validateInterpretationClaim(claim, context), [
    "DUPLICATE_STATEMENT_ID:salary-fact",
  ]);
});

test("questions, triggers, and review dependencies fail closed", () => {
  const claim = createClaim();
  claim.founderQuestion.supportingStatementIds.push("missing-statement");
  claim.statements[1]!.triggerEvidenceIds.push("missing-evidence");
  claim.statements[1]!.reviewDependencyIds.push("missing-review");

  assert.deepEqual(validateInterpretationClaim(claim, context), [
    "QUESTION_STATEMENT_NOT_FOUND:missing-statement",
    "EVIDENCE_NOT_FOUND:premium-hypothesis:missing-evidence",
    "REVIEW_NOT_FOUND:premium-hypothesis:missing-review",
  ]);
});

test("registry contains only the three actual PaySim sample themes and authorized claim statuses", () => {
  const sampleFindings = detectStructuralFindings(sampleRosterRows);
  const sampleThemes = buildStructuralThemes(sampleRosterRows, sampleFindings);

  assert.deepEqual(
    INTERPRETATION_CLAIM_REGISTRY.map((claim) => claim.themeId),
    sampleThemes.map((theme) => theme.id),
  );

  const registryContext: ClaimValidationContext = {
    evidenceIds: new Set(sampleFindings.map((finding) => finding.id)),
    reviewedStateIds: new Set(sampleThemes.map((theme) => theme.id)),
  };

  for (const claim of INTERPRETATION_CLAIM_REGISTRY) {
    assert.ok(claim.statements.length >= 2);
    assert.ok(claim.statements.some((statement) => statement.kind === "SURFACE_OBSERVATION"));
    assert.ok(claim.statements.some((statement) => statement.claimStatus === "WORKING_HYPOTHESIS"));
    assert.ok(claim.statements.every((statement) =>
      statement.claimStatus === "SUPPORTED_BY_CLIENT_DATA"
      || statement.claimStatus === "WORKING_HYPOTHESIS"
    ));
    assert.ok(claim.statements.every((statement) =>
      statement.sourceRefs.every((source) => source.kind === "CLIENT_DATA")
    ));
    assert.deepEqual(validateInterpretationClaim(claim, registryContext), []);
  }
});

function createClaim(): InterpretationClaim {
  return {
    id: "product-hiring-premium",
    themeId: "theme-product",
    statements: [
      {
        id: "salary-fact",
        kind: "SURFACE_OBSERVATION",
        copyKey: "product.salary_fact",
        claimStatus: "SUPPORTED_BY_CLIENT_DATA",
        triggerEvidenceIds: ["pair-001"],
        reviewDependencyIds: ["review-product"],
        sourceRefs: [{
          kind: "CLIENT_DATA",
          evidenceIds: ["pair-001"],
          reviewedStateIds: ["review-product"],
        }],
        mustNotClaimKeys: ["employee_intent"],
      },
      {
        id: "premium-hypothesis",
        kind: "DEEPER_MECHANISM",
        copyKey: "product.premium_hypothesis",
        claimStatus: "WORKING_HYPOTHESIS",
        triggerEvidenceIds: ["pair-001"],
        reviewDependencyIds: ["review-product"],
        sourceRefs: [],
        mustNotClaimKeys: ["confirmed_cause"],
      },
    ],
    founderQuestion: {
      copyKey: "product.premium_question",
      supportingStatementIds: ["salary-fact", "premium-hypothesis"],
    },
  };
}
