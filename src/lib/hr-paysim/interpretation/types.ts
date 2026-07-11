export type InterpretationClaimStatus =
  | "VERIFIED_EXTERNAL"
  | "SUPPORTED_BY_CLIENT_DATA"
  | "KYLE_EXPERIENCE_BASED"
  | "WORKING_HYPOTHESIS"
  | "UNSUPPORTED_DO_NOT_USE";

export type InterpretationStatementKind =
  | "SURFACE_OBSERVATION"
  | "TYPICAL_INTERPRETATION"
  | "DEEPER_MECHANISM"
  | "TIME_AXIS_OR_CASCADE"
  | "COUNTER_INTUITIVE_ANGLE"
  | "DECISION_RELEVANCE";

export interface ExternalClaimSource {
  kind: "EXTERNAL";
  title: string;
  publisher: string;
  publishedAt: string;
  sourceLocation: string;
  populationOrScope: string;
  applicabilityNote: string;
}

export interface ClientDataClaimSource {
  kind: "CLIENT_DATA";
  evidenceIds: string[];
  reviewedStateIds: string[];
}

export interface PractitionerExperienceSource {
  kind: "PRACTITIONER_EXPERIENCE";
  experienceRef: string;
  context: string;
  limitation: string;
}

export type ClaimSourceRef =
  | ExternalClaimSource
  | ClientDataClaimSource
  | PractitionerExperienceSource;

export interface InterpretationStatement {
  id: string;
  kind: InterpretationStatementKind;
  copyKey: string;
  claimStatus: InterpretationClaimStatus;
  triggerEvidenceIds: string[];
  reviewDependencyIds: string[];
  sourceRefs: ClaimSourceRef[];
  mustNotClaimKeys: string[];
}

export interface InterpretationClaim {
  id: string;
  themeId: string;
  statements: InterpretationStatement[];
  founderQuestion: {
    copyKey: string;
    supportingStatementIds: string[];
  };
}

export interface ClaimValidationContext {
  evidenceIds: ReadonlySet<string>;
  reviewedStateIds: ReadonlySet<string>;
}
