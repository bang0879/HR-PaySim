# HR PaySim Strategy / GTM / Career Contract

## Status

This is a Phase 0 contract. It must be satisfied before parser, detector, memo, session, route, or UI implementation starts.

## Strategic Decision

HR PaySim v1 is a facilitated diagnostic tool first, a standalone demo second, and a full self-serve product later.

The primary v1 usage is:

> Kyle runs HR PaySim together with a founder in a facilitated session, usually as a warm follow-up after HR Prism surfaces compensation-risk signals.

This means v1 should optimize for:

- screen-share clarity,
- sample-first explanation,
- founder aha,
- defensible relationship evidence,
- final memo quality,
- warm follow-up usefulness,
- portfolio and CMU legibility.

It should not optimize for:

- cold public conversion,
- pricing,
- payment,
- generic onboarding,
- full self-serve robustness,
- market salary benchmark demand capture.

## Product Definition

HR PaySim is a Compensation Explainability Decision Tool.

It is not:

- a salary calculator,
- a market benchmark tool,
- an attrition predictor,
- an AI workforce simulator,
- a compensation optimization engine,
- a legal, tax, or payroll advice product.

Core definition:

> HR PaySim detects compensation relationships a founder may not be able to defend when employees compare pay.

Finding definition:

> A finding is a compensation relationship that becomes difficult for the founder to defend when employees compare pay.

## Construct

The core construct is compensation explainability / defensibility.

HR PaySim operationalizes this construct from minimal de-identified roster data. The product must lead with relationship evidence, not abstract scores.

CEI/CED may remain as legacy or internal references only. They must not appear as founder-facing v1 hero outputs.

## Relationship To HR Prism

HR Prism is the initial trust-building diagnostic.

HR PaySim is the compensation explainability deep-dive that follows when HR Prism surfaces compensation-risk signals.

HR PaySim is not a sub-feature of HR Prism, but near-term GTM is warm-first:

1. Run HR Prism sessions.
2. Capture compensation-risk probes in each HR Prism session.
3. Classify PaySim fit.
4. Offer PaySim to high-fit HR Prism companies or referrals.
5. Use PaySim as a facilitated session, not as a cold self-serve funnel.

## Architecture Versus GTM

These must remain separate:

| Dimension | v1 Decision |
|---|---|
| Standalone-capable architecture | Required |
| Standalone explanation | Required |
| Synthetic standalone demo | Required |
| Standalone cold-sales funnel | Deferred |
| Pricing/payment | Deferred |
| Public SaaS conversion workflow | Deferred |

The app should be understandable without HR Prism context, especially for referrals, portfolio demos, CMU conversations, LinkedIn, and networking. That does not mean v1 should become a cold public SaaS funnel.

## Operating Modes

```ts
export type OperatingMode = "facilitated" | "self_serve_demo";
```

- `facilitated`: Kyle is in the room or on the call, screen-sharing and interpreting the result with the founder.
- `self_serve_demo`: a synthetic portfolio/demo route, using sample data only.

## Source Modes

```ts
export type SourceMode =
  | "hr_prism_followup"
  | "standalone_referral"
  | "portfolio_demo"
  | "direct_private_link";
```

- `hr_prism_followup`: warm follow-up after HR Prism captured compensation-risk signals.
- `standalone_referral`: referred founder or investor contact asking about compensation explainability.
- `portfolio_demo`: synthetic route for CMU, LinkedIn, networking, and portfolio proof.
- `direct_private_link`: private working link for a facilitated session.

## v1 KPI

Near-term KPI is not revenue.

Track:

- HR Prism sessions with comp-risk signal recorded,
- high-fit PaySim candidates,
- PaySim facilitated pilots,
- aha-confirmed sessions,
- memo exported/shared,
- consented anonymous learning logs,
- referral accepted.

Revenue, pricing, and paid conversion may be explored later only after the facilitated value is proven.

## Career / CMU Framing

Do not frame early PaySim as a large dataset or broad HR analytics claim.

Use:

- construct,
- method,
- qualitative case series.

Required CMU-ready sentence:

> I operationalized compensation explainability: turning a fuzzy defensibility intuition into a computable structure from minimal de-identified rosters, and testing whether founders find it decision-useful.

The honest claim is:

> HR PaySim defines compensation explainability, operationalizes it from minimal de-identified roster data, and tests whether founders find the resulting findings decision-useful in facilitated case-series pilots.

## Deferred Scope

Do not build these in v1:

- market salary benchmark,
- cold landing funnel,
- pricing,
- payment,
- public SaaS onboarding,
- automated learning-log upload,
- employee-level named reporting,
- individual salary recommendations,
- AI workforce planning,
- attrition prediction,
- legal/tax-grade advice.

## Stop Conditions

Stop and ask Kyle if implementation scope tries to expand into:

- full SaaS,
- market benchmark,
- pricing/payment,
- public conversion funnel,
- AI workforce simulator,
- attrition predictor,
- employee-level salary recommendation,
- named employee analysis,
- automatic pilot-log storage,
- main-branch merge.
