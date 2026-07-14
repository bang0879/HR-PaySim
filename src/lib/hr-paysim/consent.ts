import type { QuickInputDraft } from "./domain.ts";

export interface AggregateConsentState {
  consentForAggregateAnalysis: boolean;
  allowCompanyName: boolean;
  companyName?: string;
}

export interface AggregateLogPayload {
  consentForAggregateAnalysis: true;
  generatedAt: string;
  aggregate: {
    employeeCount: number;
    plannedHires: number;
    exceptionRaiseCount: number;
    inversionCaseCount: number;
    salaryBandExists: boolean;
    currentAiToolingLevel: QuickInputDraft["currentAiToolingLevel"];
  };
  companyName?: string;
}

export function createAggregateLogPayload(
  consent: AggregateConsentState,
  aggregate: QuickInputDraft,
  now: Date = new Date("2026-07-03T00:00:00.000Z"),
): AggregateLogPayload | null {
  if (!consent.consentForAggregateAnalysis) return null;

  return {
    consentForAggregateAnalysis: true,
    generatedAt: now.toISOString(),
    aggregate: {
      employeeCount: aggregate.employeeCount,
      plannedHires: aggregate.plannedHires,
      exceptionRaiseCount: aggregate.exceptionRaiseCount,
      inversionCaseCount: aggregate.inversionCaseCount,
      salaryBandExists: aggregate.salaryBandExists,
      currentAiToolingLevel: aggregate.currentAiToolingLevel,
    },
    ...(consent.allowCompanyName && consent.companyName ? { companyName: consent.companyName } : {}),
  };
}
