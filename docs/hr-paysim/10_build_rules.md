# HR PaySim Build Rules

## v1.0 Scope

- Facilitated-first compensation explainability diagnostic.
- Standalone-capable architecture and messaging.
- Synthetic `/hr-paysim/demo` route for portfolio, CMU, LinkedIn, and networking legibility.
- Sample-first flow before requesting company data.
- Safe de-identified roster paste/template intake.
- Client-side normalization into de-identified rows only.
- Relationship-first findings: `shadow_band`, `pay_inversion`, `level_fiction_band_overlap`, and `loyalty_tax`.
- Relationship Review Beat as the core facilitated interaction: context, intuition surfacing, evidence reveal, founder explanation, classification, and memo capture.
- Founder explanation capture uses structured reason codes first, with memo-safe notes only when sanitized.
- `shadow_band` as the lead synthetic-demo finding when present.
- Founder-facing Korean interpretation grounded in comparison relationships.
- Decision options with `얻는 것`, `감수할 것`, `언제 맞는가`, correction floor impact, communication risk impact, and spread risk impact.
- Do-nothing as an explicit decision option, not a free baseline.
- Memo-as-document preview with plain-text copy.
- De-identified structure analysis consent UI.
- HR Prism compensation-risk probe contract document.
- Manual-only anonymous pilot learning-log contract.

## Deferred Scope

- Full self-serve robustness.
- Cold public conversion funnel.
- Pricing and payment.
- Market salary benchmark.
- Automated learning-log storage or transmission.
- HR Prism code patch until the HR Prism repository or file locations are provided.
- PDF generation.
- Server-side roster persistence.
- Server-side aggregate logging endpoint.
- Legal/tax-grade stock option calculation.
- AI workforce planning or headcount simulation.
- External salary market data integration.
- Deleting `PrototypePaySimApp` before Kyle walkthrough approval and a separate cleanup commit.

## Legacy/Internal Only

- CEI/CED may remain as legacy or internal references only.
- CEI/CED must not be founder-facing v1 hero outputs.
- Existing scalar aggregate tests are regression history, not the target v1 product contract.

## Forbidden v1 Framing

- No salary calculator framing.
- No market benchmark framing.
- No employee-level pay recommendation.
- No AI substitution percentage.
- No job replacement claims.
- No fake attrition probability.
- No `Total Work Cost` metric.
- No predicted productivity loss.
- No predicted replacement cost.
- No prediction/quiz beat as the default UX.
- No founder right/wrong reveal.
- No shaming or surprise-led copy such as "most founders do not know."
- No `estimatedDoNothingCost`.
- No individual employee named reporting.
- No full SaaS, pricing, payment, or cold-funnel work.

## Strict Exclusions

- No salary calculator framing.
- No employee-level pay recommendation.
- No AI substitution percentage.
- No job replacement claims.
- No fake attrition probability.
- No `Total Work Cost` metric.
- No employee-level sensitive data storage.
- No raw roster text or raw CSV persistence.
- No automatic anonymous learning-log persistence.

## Privacy Rules

- URL stores only the current step.
- Session storage may contain only normalized de-identified rows and app state needed to continue the local flow.
- Raw pasted roster text must never persist in `sessionStorage`.
- Sensitive raw founder explanation free text must never persist in `sessionStorage`.
- Memo notes must exclude names, emails, company names, direct identifiers, and raw quotes without explicit quote consent.
- If PII-like column headers are detected, strip the offending columns, show a warning, and require explicit confirmation before proceeding.
- If PII-like values appear inside required fields or row values, block the affected row or the paste if safe stripping is not possible.
- Manager and team labels must be converted to opaque labels.
- Opaque labels must work beyond 26 unique labels.
- No roster rows are emitted to a server endpoint.
- No metadata, quote, case-series note, or learning log is recorded without explicit consent.
- For v1, anonymous pilot learning logs are manual pseudonymous records outside the app only.
- Declining anonymous learning consent must not block memo preview.

## Korean Copy Rules

- Use plain Korean.
- Use `얻는 것` and `감수할 것`.
- Use relationship evidence before abstract scores.
- Avoid consulting-heavy exaggeration.
- Do not say AI replaces people.
- Do not use `이직 확률`, `생산성 향상률`, or `Total Work Cost`.
- Do not call correction floor a predicted loss.
- Do not claim market salary correctness.

## Required Phase 0 Contracts

The app cannot move into parser, detector, UI, routing, session, or app-code implementation until these documents exist:

```text
docs/hr-paysim/17_strategy_gtm_career_contract.md
docs/hr-paysim/18_hr_prism_compensation_probe_patch.md
docs/hr-paysim/19_sample_output_contract.md
docs/hr-paysim/20_do_nothing_correction_floor_model.md
docs/hr-paysim/21_anonymous_pilot_learning_log_contract.md
```

## Build Gate

The app cannot move to the next implementation task while any of these fail:

```text
npm test
npm run typecheck
npm run build
```

## Risk Loop

For each task, try at most three fix loops for the same failure. If the failure remains, stop and report the blocker with evidence.
