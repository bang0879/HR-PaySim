# HR PaySim Task 11 Public Surface Isolation And Privacy Verification Design

## Status

Revised design after technical review.

Task 11 is narrowed to the work that has value before a facilitator deployment exists:

- `P11-A`: make the public synthetic demo safe to share by excluding facilitator code at build time and blocking facilitator routes at runtime;
- privacy lifecycle audit: prove the existing `P11-B0` client-side guarantees without rewriting them;
- independent public and local-facilitator verification.

The facilitator deployment-gate package is deferred until a facilitator deployment is actually proposed. Task 11 does not run PILOT-1, deploy either surface, or authorize Task 12.

## Goal

Produce a public demo build in which:

- the synthetic Decision Room preview remains reachable;
- facilitator preparation, roster parsing, and active-session code are absent from the generated public JavaScript dependency graph;
- direct facilitator and unsupported paths fail closed at runtime;
- `noindex` and route blocking are verified as independent controls;
- the existing in-memory privacy lifecycle is supported by fresh evidence.

This hardening supports a safely shareable career-demo link. It is not a prerequisite for a local Kyle-facilitated pilot.

## Authority And Governance

- Adapter: `docs/diagnostic-product-adapter.md`
- Constitution baseline: `790eb99`
- Canonical product authority: `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`
- Pilot-led decomposition: `docs/superpowers/specs/2026-07-12-hr-paysim-governance-preflight-and-remaining-work-design.md`
- Existing minimum preparation package: `docs/superpowers/specs/2026-07-13-hr-paysim-p11-b0-facilitator-preparation-design.md`

Applicable principles and cases:

- `DP-01`: route and session results retain their current state lineage.
- `DP-03`: build and access internals never become founder-facing copy.
- `DP-05`: blocked surfaces explain availability without evaluating the user.
- `CASE-11`: the selected build surface changes the code and routes actually available.
- `CASE-13`: direct navigation and keyboard/session flow remain verifiable.

No HR Prism copy, components, glossary, formula, or route structure transfers into PaySim.

## Current State And Verified Gap

The repository already contains the `P11-B0` safety package: Product Engineer-only de-identified paste preparation, header- and value-level PII checks, fail-closed row handling, raw-input clearing, normalized confirmation, reload failure without persisted rows, unload warning, explicit session clearing, no browser-storage/URL/server emission, and browser QA.

The current `src/App.tsx` statically imports `FacilitatedSessionApp`, which imports `FacilitatorPreparationScreen` and the roster-preparation parser. A runtime route policy around this structure would block the path but would not remove facilitator code from public assets.

Task 11 therefore requires a real build-time module boundary. Runtime route blocking remains defense in depth; it is not described as build-time isolation.

The synthetic demo remains at `/hr-paysim/decision-room-preview`. Moving it to `/hr-paysim/demo` and removing legacy paths belongs to Task 12.

## Scope

### In scope now

- Build-time selection between separate public-demo and local-facilitator entries.
- Public-build exclusion of facilitator preparation, roster parser, and active-session modules.
- A build audit that fails if forbidden facilitator modules enter public chunks.
- Public runtime rejection of facilitator, legacy, and unknown paths.
- A neutral unavailable surface for blocked paths.
- `noindex,nofollow`, no public facilitator links, and no client-exposed authentication secrets.
- A fresh audit of the existing `P11-B0` privacy lifecycle.
- Separate public-build and local-facilitator browser QA.

### Deferred until a facilitator deployment is proposed

- `verify-facilitator-deployment.mjs`.
- `PAYSIM_FACILITATOR_ACCESS_GATE` or equivalent deployment attestation.
- Deployment protection, private-network, authentication, or provider configuration.
- Any claim that an environment declaration proves provider-side enforcement.

When facilitator deployment is proposed, a separate approved package must verify the real provider or network control. A green repository preflight or environment value alone is not proof.

### Out of scope

- Accounts, passwords, SSO, identity-provider middleware, or URL access tokens.
- Deploying either surface or exposing the facilitator surface outside loopback.
- Moving the Decision Room to `/hr-paysim/demo`.
- Deleting prototype, roster-diagnostic, or legacy route code.
- Broadening intake, file upload, server storage, telemetry, analytics, or automatic pilot logs.
- Running PILOT-1, creating pilot evidence, or doing Task 12 work.

## Chosen Architecture

Use separate build-selected entry modules plus a public runtime route policy.

```ts
export type BuildSurface = "PUBLIC_DEMO" | "FACILITATOR_LOCAL";
```

A non-secret Vite build value selects one of two source entries. Missing, empty, or unknown values resolve to `PUBLIC_DEMO`. Only the exact `facilitator-local` mode selects `FACILITATOR_LOCAL`. The value is not authentication and never grants remote access.

### Build-selected entry boundary

`src/main.tsx` imports one stable alias, for example `@paysim-surface-entry`. `vite.config.ts` resolves that alias at build and dev-server startup:

- `PUBLIC_DEMO` -> `src/surfaces/PublicDemoApp.tsx`
- `FACILITATOR_LOCAL` -> `src/surfaces/FacilitatorLocalApp.tsx`

The public entry may import only `PaySimSessionProvider`, `DecisionRoomApp`, the synthetic demo contract, public route policy, and unavailable UI. It must not import, directly or transitively:

- `src/features/facilitator-preparation/**`;
- `src/lib/hr-paysim/preparation/**`;
- `PrototypePaySimApp`;
- `RosterDiagnosticApp`;
- the legacy resolver if it imports legacy components.

The facilitator-local entry may import the existing preparation/session flow and synthetic preview. It remains a local development and pilot surface, not a deployable access-control mechanism.

This creates separate Rollup dependency graphs. Dynamic import is not used to hide facilitator modules because a generated lazy chunk would still ship that code in public assets.

### Public bundle module audit

A small Vite plugin inspects Rollup `chunk.modules` during `generateBundle`. For `PUBLIC_DEMO`, it fails when any emitted JavaScript chunk contains a normalized source path under a forbidden facilitator or preparation boundary.

The audit uses module identities rather than minified string search. It emits a concise public module manifest or equivalent testable record so verification can prove which source modules were bundled. This is a regression guard for the entry boundary, not a claim about runtime user data.

### Runtime route policy

The public entry evaluates route policy before choosing a component. `PUBLIC_DEMO` permits only `/hr-paysim/decision-room-preview` and rejects `/session/new`, `/session`, `/roster`, `/demo`, prototype, and unknown PaySim paths.

A rejected path renders a neutral unavailable surface. It does not fall through to `PrototypePaySimApp`, and cannot render a textarea, accepted-column list, facilitator heading, roster count, no-active-session copy, or synthetic session data.

The facilitator-local entry permits preview, `/hr-paysim/session/new`, and `/hr-paysim/session`. Legacy prototype and roster routes remain unavailable; their final disposition remains Task 12.

## Discovery Contract

The v1 HTML contains:

```html
<meta name="robots" content="noindex,nofollow" />
```

`noindex` is only a crawler-discovery hint. It is not route blocking, authentication, or proof of external protection.

Verification separately proves:

1. built HTML retains `noindex,nofollow`;
2. public source and built HTML contain no facilitator navigation or sitemap links;
3. direct public requests to both facilitator paths render unavailable;
4. public emitted chunks contain no facilitator/preparation modules.

No one assertion may substitute for another.

## Privacy Lifecycle Audit

Roster-data privacy does not depend on a route gate. It depends on the existing client-side no-emission and clearing contracts.

Fresh tests and QA must prove:

- raw pasted text clears after successful normalization and after a blocking value issue;
- normalized rows and all session state remain memory-only;
- reloading `/hr-paysim/session` reconstructs no roster or prior row data;
- browser storage and URL contain no roster data;
- no `fetch`, `XMLHttpRequest`, `sendBeacon`, analytics, or telemetry path owns roster or review data;
- explicit session end clears state and returns to preparation;
- copy/export remains explicit and creates no automatic persistence;
- the public demo cannot accept roster input;
- the public build contains no roster-preparation or parser modules.

If existing behavior passes, this part adds evidence only. Product logic may change only for a concrete failing privacy contract and must preserve the four-screen flow and Product Engineer-only intake.

Even an accidentally exposed facilitator route would not, by itself, imply roster-data emission. Its residual risk would be unauthorized code and input-surface exposure. Task 11 removes that public code surface while preserving independent privacy controls.

## Error And Copy Boundaries

- A public blocked path renders neutral availability copy and a link to the synthetic preview. It exposes no facilitator detail and never says authentication failed when none was attempted.
- A local facilitator refresh retains the existing no-active-session behavior and reconstructs no roster.
- Missing, empty, and unknown build values resolve to public; only the exact facilitator-local mode opens the local surface.
- Unknown routes never fall through to a legacy prototype.

Unavailable-screen heading, explanation, and action belong in `founderCopy.ts`. Build names, module paths, loopback requirements, environment values, and future deployment terms remain internal. Task 10 copy contracts remain unchanged.

## Local PILOT-1 Critical Path

1. `P11-B0` preparation, PII blocking, and lifecycle controls — already implemented.
2. Local readiness: bind only to `127.0.0.1`; no tunnel, cloud preview, external bind, or deployment; only de-identified Product Engineer data; consent and manual learning notes outside the app.
3. Run local Kyle-facilitated PILOT-1 by screen share.

The narrowed Task 11 work may be completed first because it is bounded and useful, but it creates no new pilot dependency.

If the facilitator surface becomes externally reachable, stop. Do not rely on a build flag or green environment preflight. Approve a deployment-specific package, verify the actual provider/network control, and only then resume pilot readiness.

## Testing Strategy

Use TDD for every behavior change.

### Build and route tests

- Missing, empty, and unknown mode values resolve public; only the exact facilitator-local mode selects the local entry.
- Public and facilitator-local entries resolve deterministically.
- Public build audit passes cleanly and fails with an injected forbidden module.
- The public manifest contains Decision Room dependencies and no facilitator/preparation/legacy app modules.
- Public permits only the preview and rejects facilitator, legacy, and unknown paths.
- Facilitator-local permits preview, preparation, and active session, and rejects legacy/unknown paths.

### Static discovery and privacy tests

- Built HTML contains `noindex,nofollow` and no facilitator links.
- Client source contains no secret-like `VITE_*SECRET*`, `VITE_*TOKEN*`, or `VITE_*PASSWORD*` contract.
- Existing clearing, no-storage, no-URL, no-network, reload, and explicit-end contracts pass freshly.

### Browser QA

Public: complete the synthetic four-screen flow; both facilitator paths render unavailable; no textarea, facilitator copy, roster data, storage, URL data, network emission, overflow, or console error.

Facilitator-local: bind to `127.0.0.1`; pass preparation privacy cases; start a supported Product Engineer session; reload and explicit-end fail closed; keep Screen 2/3 regressions green; no storage, URL, roster-data emission, overflow, or console error.

### Fresh full verification

The implementation plan must give exact commands for both surfaces and freshly run at least:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/verify-route-exposure.mjs
node scripts/qa-decision-room.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

Public and facilitator-local builds and QA are separate runs. Task 10 and P11-B0 results are not reused. No facilitator deployment-verification script belongs to this package.

## Expected File Boundary

Likely new files:

- `src/surfaces/PublicDemoApp.tsx`
- `src/surfaces/FacilitatorLocalApp.tsx`
- `src/lib/hr-paysim/access/buildSurface.ts`
- `src/lib/hr-paysim/access/routePolicy.ts`
- `src/features/route-access/UnavailableSurface.tsx`
- `tests/hr-paysim/route-access.test.ts`
- `tests/hr-paysim/public-bundle-boundary.test.ts`
- `scripts/verify-route-exposure.mjs`

Likely modified: `src/main.tsx`, `vite.config.ts`, `founderCopy.ts`, `index.html`, `package.json`, `qa-decision-room.mjs`, and existing route/session tests only where exact surface behavior changes.

`src/App.tsx` may be reduced or retired as an entry aggregator, but Task 11 does not delete its legacy children. Detector metrics, theme building, review state, repeat calculations, decisions, report derivation, salary plot coordinates, Task 10 copy, and roster fixtures are out of scope.

## Commit And Review Boundary

1. Keep this revision in the existing design commit.
2. After approval, write and commit a separate implementation plan.
3. Keep product work uncommitted until fresh verification passes.
4. Stage only exact Task 11 files and commit once with `feat: isolate public demo and verify privacy`.
5. Request independent review against this design, plan, public module manifest, and both local QA modes.
6. Stop before Task 12, deployment, or PILOT-1.

## Acceptance Criteria

- Public chunks contain no facilitator-preparation, roster-parser, or legacy app modules.
- Public navigation cannot render either facilitator route or accept roster data.
- The synthetic preview works and the local facilitator entry retains preparation and four screens.
- Unknown surfaces and routes fail closed.
- `noindex`, no links, runtime blocking, and build exclusion pass separate assertions.
- No client authentication secret or URL token exists.
- No-emission, memory-only lifecycle, reload failure, and explicit clearing remain intact.
- No deployment attestation, auth, provider config, Task 12 alias, legacy deletion, deployment, or pilot claim is introduced.
- Fresh lint, tests, typecheck, both builds, both browser QA modes, governance verification, and diff checks pass.
