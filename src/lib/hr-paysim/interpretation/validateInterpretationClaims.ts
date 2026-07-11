import type {
  ClaimValidationContext,
  ExternalClaimSource,
  InterpretationClaim,
  InterpretationStatement,
  PractitionerExperienceSource,
} from "./types.ts";

const externalFields = [
  "title",
  "publisher",
  "publishedAt",
  "sourceLocation",
  "populationOrScope",
  "applicabilityNote",
] as const satisfies ReadonlyArray<keyof Omit<ExternalClaimSource, "kind">>;

const practitionerFields = [
  "experienceRef",
  "context",
  "limitation",
] as const satisfies ReadonlyArray<keyof Omit<PractitionerExperienceSource, "kind">>;

export function validateInterpretationClaim(
  claim: InterpretationClaim,
  context: ClaimValidationContext,
): string[] {
  const errors: string[] = [];
  const statementIds = new Set<string>();
  const duplicateStatementIds = new Set<string>();

  for (const statement of claim.statements) {
    if (statementIds.has(statement.id) && !duplicateStatementIds.has(statement.id)) {
      errors.push(`DUPLICATE_STATEMENT_ID:${statement.id}`);
      duplicateStatementIds.add(statement.id);
    }
    statementIds.add(statement.id);
  }

  for (const statementId of claim.founderQuestion.supportingStatementIds) {
    if (!statementIds.has(statementId)) {
      errors.push(`QUESTION_STATEMENT_NOT_FOUND:${statementId}`);
    }
  }

  for (const statement of claim.statements) {
    validateDependencies(statement, context, errors);
    validateSources(statement, context, errors);
  }

  return errors;
}

function validateDependencies(
  statement: InterpretationStatement,
  context: ClaimValidationContext,
  errors: string[],
): void {
  for (const evidenceId of statement.triggerEvidenceIds) {
    if (!context.evidenceIds.has(evidenceId)) {
      errors.push(`EVIDENCE_NOT_FOUND:${statement.id}:${evidenceId}`);
    }
  }
  for (const reviewedStateId of statement.reviewDependencyIds) {
    if (!context.reviewedStateIds.has(reviewedStateId)) {
      errors.push(`REVIEW_NOT_FOUND:${statement.id}:${reviewedStateId}`);
    }
  }
}

function validateSources(
  statement: InterpretationStatement,
  context: ClaimValidationContext,
  errors: string[],
): void {
  const externalSources = statement.sourceRefs.filter((source) => source.kind === "EXTERNAL");
  const clientSources = statement.sourceRefs.filter((source) => source.kind === "CLIENT_DATA");
  const practitionerSources = statement.sourceRefs.filter(
    (source) => source.kind === "PRACTITIONER_EXPERIENCE",
  );

  if (statement.claimStatus === "VERIFIED_EXTERNAL" && externalSources.length === 0) {
    errors.push(`EXTERNAL_SOURCE_REQUIRED:${statement.id}`);
  }
  if (statement.claimStatus === "SUPPORTED_BY_CLIENT_DATA" && clientSources.length === 0) {
    errors.push(`CLIENT_SOURCE_REQUIRED:${statement.id}`);
  }
  if (statement.claimStatus === "KYLE_EXPERIENCE_BASED" && practitionerSources.length === 0) {
    errors.push(`PRACTITIONER_SOURCE_REQUIRED:${statement.id}`);
  }

  for (const source of externalSources) {
    for (const field of externalFields) {
      if (!isNonEmptyString(source[field])) {
        errors.push(`EXTERNAL_FIELD_REQUIRED:${statement.id}:${field}`);
      }
    }
  }

  for (const source of clientSources) {
    if (source.evidenceIds.length === 0) {
      errors.push(`CLIENT_EVIDENCE_REQUIRED:${statement.id}`);
    }
    if (source.reviewedStateIds.length === 0) {
      errors.push(`CLIENT_REVIEW_REQUIRED:${statement.id}`);
    }
    for (const evidenceId of source.evidenceIds) {
      if (!context.evidenceIds.has(evidenceId)) {
        errors.push(`CLIENT_EVIDENCE_NOT_FOUND:${statement.id}:${evidenceId}`);
      }
    }
    for (const reviewedStateId of source.reviewedStateIds) {
      if (!context.reviewedStateIds.has(reviewedStateId)) {
        errors.push(`CLIENT_REVIEW_NOT_FOUND:${statement.id}:${reviewedStateId}`);
      }
    }
  }

  for (const source of practitionerSources) {
    for (const field of practitionerFields) {
      if (!isNonEmptyString(source[field])) {
        errors.push(`PRACTITIONER_FIELD_REQUIRED:${statement.id}:${field}`);
      }
    }
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
