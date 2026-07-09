# Anonymous Pilot Learning Log Contract

## Status

This is a Phase 0D documentation contract. The actual storage implementation is deferred.

For v1, the app must not store learning logs inside the app and must not send learning-log payloads automatically.

## Purpose

Early HR PaySim evidence should be framed as construct + method + qualitative case series, not as a large dataset.

The learning log captures whether founders find compensation explainability findings decision-useful.

## Storage Decision

For v1:

- Do not store learning logs inside the app.
- Do not send learning-log payloads from the app.
- Use manual pseudonymous records outside the app only after explicit consent.
- Acceptable storage examples:
  - private Markdown files,
  - private spreadsheet,
  - private research notes controlled by Kyle.

## Consent Rule

No metadata, quote, reaction, objection, or case-series note is recorded without explicit learning-log consent.

Consent must be separate from using the app. A founder may use PaySim and receive a memo without consenting to anonymous learning notes.

The log object may only be created after learning-log consent exists.

Direct quotes require separate quote consent. Without quote consent, store only paraphrased reactions or no quote-like content.

## Required Manual Record Shape

```ts
export interface AnonymousPilotLearningLog {
  pilotCaseId: string;
  consentForLearningLog: true;
  consentForAnonymizedQuote: boolean;
  sourceMode: "hr_prism_followup" | "standalone_referral" | "portfolio_demo" | "direct_private_link";
  operatingMode: "facilitated" | "self_serve_demo";
  companySizeBand?: "15-30" | "31-50" | "51-80" | "81+";
  stageBand?: "pre_seed" | "seed" | "series_a" | "series_b_plus" | "unknown";
  topFindingType?: "shadow_band" | "pay_inversion" | "level_fiction_band_overlap" | "loyalty_tax";
  founderAhaMomentParaphrase?: string;
  founderObjectionParaphrase?: string;
  responseThatWorked?: string;
  directFounderQuote?: string;
  selectedDecisionPath?:
    | "do_nothing_monitor"
    | "targeted_correction"
    | "principle_first_freeze"
    | "band_reset"
    | "review_cycle_integration";
  memoExported: boolean;
  followUpRequested: boolean;
}
```

Field rule:

- `consentForLearningLog` must be `true`; otherwise the object must not exist.
- `consentForAnonymizedQuote` controls only direct quote storage.
- `directFounderQuote` may exist only when `consentForAnonymizedQuote` is `true`.
- If `consentForAnonymizedQuote` is `false`, use paraphrase fields or omit quote-like content entirely.

## Manual Field Guidance

### pilotCaseId

Use pseudonymous IDs only.

Example:

```text
ps_2026_001
```

Do not encode company name, founder name, industry name, or exact date if that date can reveal the company.

### founderAhaMomentParaphrase

Capture the founder's decision-useful realization as a paraphrase by default.

Examples:

- The founder realized that even without formal levels, salary clusters had already emerged.
- The founder reframed the issue from high pay to a difficult comparison relationship.
- The founder recognized that doing nothing would still set a future offer/review precedent.

Do not store a direct quote in this field.

### founderObjectionParaphrase

Capture meaningful objections as paraphrase by default.

Examples:

- The founder wanted to know whether the salaries were market-correct.
- The founder argued that performance context might explain the difference.
- The founder said immediate correction would be difficult because of cash constraints.

### directFounderQuote

Direct quote storage requires `consentForAnonymizedQuote: true`.

If quote consent is absent, do not store a direct quote even if learning-log consent exists.

### responseThatWorked

Capture the response that helped the founder understand the product boundary.

Example:

```text
Explaining that PaySim checks internal explainability rather than market correctness helped the founder accept the finding.
```

## Forbidden Stored Data

Never store:

- raw roster rows,
- original pasted text,
- employee names,
- founder names,
- emails,
- phone numbers,
- employee IDs,
- resident IDs,
- company names,
- exact individual salaries tied to identifiable rows,
- raw HR Prism notes that identify the company,
- direct quotes without separate quote consent,
- any log object without learning-log consent.

## Allowed Aggregate Metadata

With explicit learning-log consent, manual logs may store:

- consentForLearningLog,
- consentForAnonymizedQuote,
- sourceMode,
- operatingMode,
- companySizeBand,
- stageBand,
- hasFormalLevel,
- hasSalaryBand,
- rowCountBand,
- topFindingType,
- selectedDecisionPath,
- memoExported,
- followUpRequested.

## App Implementation Boundary

The v1 app may later display a consent question, but it must not automatically persist or transmit learning-log data.

If a future implementation adds export support, it must:

- require explicit action,
- show exactly what will be exported,
- exclude raw rows,
- exclude direct identifiers,
- require `consentForLearningLog: true`,
- require separate quote consent for direct quote export,
- allow founder opt-out without blocking memo preview.

## Case-Series Framing

Use this framing:

> A small qualitative case series testing whether compensation explainability findings are decision-useful to founders.

Do not use this framing:

> A dataset of Korean startup compensation risk.

## Acceptance Criteria

- No app code stores learning logs in v1.
- No app code sends learning-log payloads in v1.
- Manual records require `consentForLearningLog: true`.
- Direct quotes require `consentForAnonymizedQuote: true`.
- Without quote consent, reactions are paraphrased or omitted.
- Manual records are pseudonymous.
- Raw roster and direct identifiers are excluded.
- The portfolio/CMU narrative says construct + method + qualitative case series.
