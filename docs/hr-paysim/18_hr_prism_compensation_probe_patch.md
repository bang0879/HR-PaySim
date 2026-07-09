# HR Prism Compensation Probe Patch Contract

## Status

This is a Phase 0.1 contract. No HR Prism files are present in this workspace, so this repository must not attempt an actual HR Prism code patch yet.

When the HR Prism repository or file locations are provided, this document becomes the insertion contract.

## Purpose

The July HR Prism sprint must capture PaySim follow-up signals before HR PaySim is fully built.

The goal is not to turn HR Prism into PaySim. The goal is to identify whether a founder has compensation explainability risk worth a facilitated PaySim deep-dive.

## Insert Location

Insert the probes after the HR Prism section that discusses one of:

- compensation,
- role clarity,
- retention,
- founder/leadership decision burden,
- hiring pressure,
- exception handling,
- people-system coherence.

If HR Prism has a modular risk-domain structure, add a compact `compensationExplainability` sub-domain. Keep it small so compensation does not take over the broader Prism diagnostic.

## Scoring Metadata Contract

Every probe must define risk direction explicitly so scoring cannot be inverted accidentally.

```ts
export type ProbeRiskDirection =
  | "low_score_is_risk"
  | "high_score_is_risk"
  | "yes_is_risk"
  | "no_is_risk"
  | "enum_value_is_risk";

export type CompensationProbeAnswerType = "scale_1_to_5" | "yes_no" | "enum";
```

Rules:

- Do not infer risk direction from question wording.
- Store the selected answer and the `riskDirection` together.
- A probe can generate no signal, watch signal, material signal, or high signal.
- A material/high signal or two or more trigger reasons can create PaySim A-fit when the other A-fit criteria are met.

## Probe Set

### Probe 1: Compensation Explainability

Question:

> 비슷한 역할의 두 구성원이 서로 연봉을 비교했을 때, 대표님은 현재 기준을 일관되게 설명할 수 있습니까?

Capture:

```ts
{
  id: "compensation_explainability",
  answerType: "scale_1_to_5",
  riskDirection: "low_score_is_risk",
  note: string
}
```

Signal rule:

- 1-2: material signal, trigger `low_compensation_explainability`
- 3: watch signal
- 4-5: no immediate signal unless another trigger exists

### Probe 2: New-Hire Premium Pressure

Question:

> 최근 채용 과정에서 기존 구성원보다 높은 조건을 제시해야 했던 경우가 있었습니까?

Capture:

```ts
{
  id: "new_hire_premium_pressure",
  answerType: "yes_no",
  riskDirection: "yes_is_risk",
  note: string
}
```

Signal rule:

- yes with founder concern: material signal, trigger `new_hire_premium_pressure`
- yes without concern: watch signal, trigger `new_hire_premium_pressure`
- no: no signal unless another trigger exists

### Probe 3: Exception Compensation Record

Question:

> 예외 인상, counteroffer, founder-approved compensation exception이 발생했을 때 그 이유와 기준이 기록되어 있습니까?

Do not capture this as simple yes/no. A company with no observed exception should not be scored as risky.

Capture:

```ts
{
  id: "exception_compensation_record",
  answerType: "enum",
  riskDirection: "enum_value_is_risk",
  options: [
    "no_exception_observed",
    "exception_recorded",
    "exception_not_recorded",
    "unknown",
  ],
  riskValues: ["exception_not_recorded", "unknown"],
  note: string
}
```

Signal rule:

- `no_exception_observed`: no signal
- `exception_recorded`: no immediate signal unless repeated exceptions still worry the founder
- `exception_not_recorded`: material signal, trigger `exception_compensation`
- `unknown`: watch signal; material only if founder also reports recurring exceptions or concern

### Probe 4: Informal Salary Band Signal

Question:

> 공식 salary band는 없더라도, 내부적으로 특정 역할이나 레벨별로 대략적인 연봉 구간이 생겨 있다고 느끼십니까?

Capture:

```ts
{
  id: "informal_salary_band_signal",
  answerType: "scale_1_to_5",
  riskDirection: "high_score_is_risk",
  note: string
}
```

Signal rule:

- 4-5: material signal, trigger `informal_salary_band`
- 3: watch signal
- 1-2: no signal unless founder says levels/bands are absent but compensation feels hard to explain

## PaySim Handoff Context

When cross-tool learning consent exists, HR Prism may create:

```ts
export interface PaySimPrismHandoffContext {
  sourceMode: "hr_prism_followup";
  pilotCaseId?: string;
  prismSessionIdHash?: string;
  companySizeBand?: "15-30" | "31-50" | "51-80" | "81+";
  stageBand?: "pre_seed" | "seed" | "series_a" | "series_b_plus" | "unknown";
  compensationRiskSignal?: "none" | "watch" | "material" | "high";
  triggerReasons: Array<
    | "low_compensation_explainability"
    | "new_hire_premium_pressure"
    | "exception_compensation"
    | "informal_salary_band"
    | "founder_requested_deep_dive"
  >;
  prismSummaryForPaySim?: string;
  consentForCrossToolLearning?: boolean;
}
```

Rules:

- Do not include company name in the PaySim handoff context unless a later explicit policy allows it.
- Do not include employee names, emails, phone numbers, employee IDs, resident IDs, or individual salary rows.
- `pilotCaseId` must be pseudonymous.
- `prismSessionIdHash` must not reveal the original session identifier.
- If `consentForCrossToolLearning` is false, PaySim starts as an independent session.

## PaySim Fit Classification

### A: Strong Candidate

Use A when all are true:

- 15-80 employees,
- founder directly involved in compensation decisions,
- material/high compensation explainability signal or two or more trigger reasons,
- founder shows concern or curiosity.

Recommended action: offer facilitated PaySim follow-up.

### B: Watchlist

Use B when:

- some signal exists,
- but timing, trust, or data readiness is not strong enough.

Recommended action: record note, revisit after next HR Prism interaction or compensation event.

### C: Weak Fit

Use C when:

- compensation issue exists,
- but it is not explainability-related,
- or company is too early for meaningful roster relationships.

Recommended action: do not push PaySim; keep HR Prism recommendations primary.

### D: Out Of Scope

Use D when the company mainly asks for:

- market benchmark,
- legal/tax advice,
- individual salary recommendation,
- pricing/payment/full SaaS workflow,
- or refuses cross-tool context.

Recommended action: do not offer PaySim as v1.

## HR Prism Output Note

Suggested internal note template:

```text
PaySim fit: A/B/C/D
Trigger reasons:
- low_compensation_explainability
- new_hire_premium_pressure
- exception_compensation
- informal_salary_band
- founder_requested_deep_dive

Founder concern or paraphrased quote:
Recommended follow-up:
Consent for cross-tool learning: yes/no
```

## Non-Claims

The HR Prism probe patch must not imply that PaySim will:

- determine market-correct salaries,
- recommend individual employee pay,
- predict attrition,
- calculate legal or tax outcomes,
- solve compensation design automatically,
- replace a compensation consultant.
