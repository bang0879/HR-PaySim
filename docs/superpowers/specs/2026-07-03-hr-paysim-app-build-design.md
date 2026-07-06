# HR PaySim App Build Design

## Context

HR PaySim currently has an approved static prototype under `prototypes/hr-paysim-redesign/` and product guardrails under `docs/hr-paysim/00_product_thesis.md`. The prototype already proves the 8-step visual flow, mode selection, stale indicators, basic PII validation, scenario selection, comparison, and memo preview. It is not yet a buildable app: there is no `package.json`, app framework, TypeScript source tree, calculation test suite, route-driven wizard state, central copy module, or CI-style gate.

The attached build revision asks us to preserve the approved design and turn it into a real app structure. The goal is not a new design pass. The goal is a working HR PaySim v1.0 pilot flow where direct input and sample preview can proceed through diagnosis, interpretation, recommendation, comparison, and memo preview.

## Recommended Approach

Use **Vite + React + TypeScript** as the v1.0 app shell.

Reasons:

- This repository is currently a standalone static prototype, not an HR Prism monorepo.
- There is no visible requirement for SSR, SEO, auth, or server routes in v1.0.
- The aggregate logging server endpoint is explicitly deferred until endpoint, retention, and revoke/decline policy are defined.
- The core product is a client-side guided wizard with session restoration and local calculation tests.
- Vite keeps the migration small and lets us protect the calculation logic before moving UI screens.

Alternatives considered:

- **Next.js:** better if HR Prism routing, deployment, component system, or near-term API routes must be shared. That evidence is not present in this workspace.
- **Static prototype hardening:** fastest visually, but it cannot satisfy the requested package scripts, TypeScript contracts, test gates, route guard, or sessionStorage-backed wizard design.

## Architecture

The app will keep the existing static prototype as a reference and build a new React app in `src/`.

Core boundaries:

- `src/lib/hr-paysim/domain.ts` owns shared types such as steps, input drafts, aggregate review, diagnosis, scenarios, comparison, memo preview, stale flags, and consent payloads.
- `src/lib/hr-paysim/calculations.ts` owns CEI, CED, pay inversion, payroll forecast, scenario comparison, recommendation scoring helpers, and derived baseline selectors.
- `src/lib/hr-paysim/copy.ts` owns founder-facing Korean copy, interpretation text, labels, and forbidden wording rules.
- `src/lib/hr-paysim/session.ts` owns sessionStorage persistence, migration/defaults, step completion, route guards, and stale invalidation.
- `src/lib/hr-paysim/fixtures.ts` owns sample/demo data and stub state for early component shells.
- `src/components/hr-paysim/` owns reusable UI components: stepper, shell, buttons, panels, intake, diagnosis, recommendation, comparison, memo, consent.
- `src/routes/hr-paysim/` owns route-level step screens and connects the session store to components.
- `tests/hr-paysim/` owns calculation, session, copy guardrail, and payload validator tests.

## Wizard Flow

Routes represent only the current step:

```text
/hr-paysim/entry
/hr-paysim/intake
/hr-paysim/aggregate-review
/hr-paysim/diagnosis
/hr-paysim/interpretation
/hr-paysim/recommendations
/hr-paysim/ai-check
/hr-paysim/comparison
/hr-paysim/memo-preview
```

Session data is not encoded into the URL. Input drafts, aggregate review, diagnosis, interpretation, recommendation, scenario assumptions, comparison, memo preview, consent state, and stale flags live in a sessionStorage-backed store.

Route guard rules:

- Direct entry to an inaccessible step redirects to the first incomplete step.
- Browser back moves to the previous step route.
- Refresh restores the session when possible.
- Missing or invalid session state starts at entry.
- Input edits mark diagnosis, recommendations, comparison, and memo preview stale.
- Scenario assumption edits mark comparison and memo preview stale.
- Optional AI inputs never block the main compensation flow.

## Product Scope

v1.0 includes:

- HR Prism-triggered mode and preview/manual modes.
- Direct aggregate input.
- Sample data preview.
- Aggregate review.
- CEI, CED, pay inversion, payroll forecast diagnosis.
- Founder-facing expert interpretation.
- Scenario recommendations with `baseline_current_state` as a first-class option.
- Optional AI check as an advanced scenario lens.
- Calculated scenario comparison where baseline is derived from current input.
- Memo preview with plain-text copy.
- Aggregate consent UI and payload validator without server emission.

v1.0 excludes:

- CSV full upload.
- PDF generation.
- Employee-level salary recommendation.
- External salary market data integration.
- AI substitution percentage or job replacement claims.
- Server-side aggregate logging endpoint.
- Legal/tax-grade stock option calculation.

## Error Handling And Accessibility

The app must show plain Korean errors for invalid input, negative numeric values, missing required aggregate inputs, and PII-like text. Disabled CTAs must have visible reasons. Loading and stale states must be user-visible.

The stepper must expose `aria-current="step"` for the current step, readable position text such as `3 / 9`, completed state, and disabled future steps. Step transitions must move focus to the route heading or primary CTA. All core flow actions must work with keyboard-only navigation.

## QA Gates

No task can be considered done unless these commands pass for the current scope:

```text
npm test
npm run typecheck
npm run build
```

Final QA also requires browser verification for:

- Full direct-input flow.
- Full sample-data flow.
- Forward route guard.
- Back button behavior.
- Refresh restoration.
- Stale indicators after input change.
- Memo copy button.
- Consent decline path.
- Keyboard navigation.
- Desktop and mobile responsive layout.
- Forbidden wording scan.
- No raw salary, employee-level data, raw CSV, or company name in aggregate log payload.

## Risk Policy

For each task, attempt at most three fix loops when a build, test, or QA issue appears. If the same problem still blocks progress after three loops, stop that task and report:

- What failed.
- What was tried.
- Current evidence.
- Smallest next decision needed from the user.

