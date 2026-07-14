# HR PaySim Task 12 Runtime Convergence And MVP Closure Design

**Date:** 2026-07-14
**Status:** Draft for Kyle review
**Task:** Task 12 — converge the supported runtime and produce honest MVP evidence
**Branch:** `codex/task12-runtime-convergence`
**Base:** `origin/main` at `a9d6d32`

## 1. Decision Summary

Task 12 will close the current MVP as one bounded package with internal gates:

1. converge the supported URLs on the four-screen Decision Room runtime;
2. run the complete public and facilitator flows before deleting anything;
3. remove only legacy production runtime proved unreachable by source references and both build manifests;
4. rerun route, privacy, governance, and browser verification;
5. write portfolio and QA evidence from commands actually run in this branch.

This is a **pre-pilot MVP closure**. Kyle explicitly chose to finish and test the MVP before running `PILOT-1`. Therefore Task 12 may document the pilot method and known evidence gaps, but it must not claim participant validation, pilot outcomes, deployment protection, or production readiness.

The work is not a large redesign. Route convergence is required; broad cleanup is not. Cleanup follows the route change only when evidence shows a module is no longer part of either supported runtime.

## 2. Authority And Governance Preflight

The implementation is classified as `PRODUCT_IMPLEMENTATION`.

Authority order:

1. `docs/diagnostic-product-adapter.md`
2. `.governance/upstream/docs/diagnostic-product-constitution.md` at recorded baseline `790eb99`
3. `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`
4. this Task 12 design
5. the Task 12 implementation plan created after approval

The upstream casebook is reference evidence, not authority. Relevant patterns are CASE-11, CASE-12, and CASE-13. The product remains a facilitated compensation decision-support tool, not an individual salary recommender, market benchmark, automated evaluator, or self-service diagnostic.

The following governance constraints remain locked:

- **DP-01:** show observed roster evidence before interpretation.
- **DP-02:** preserve provenance and distinguish observed values, calculations, and human choices.
- **DP-03:** retain review/confirmation gates before rules and outcomes.
- **DP-04:** make uncertainty and unsupported conclusions explicit.
- **DP-05:** describe system state and next action without judging the user.

## 3. Current-State Findings

The branch starts directly from merged `origin/main`; lineage is not ambiguous.

The current build already has two separate Vite entries:

- `src/surfaces/PublicDemoApp.tsx`
- `src/surfaces/FacilitatorLocalApp.tsx`

Both use `PaySimSessionProvider` and the four-screen `DecisionRoomApp`. The public build manifest excludes preparation, workbook parsing, prototype, and roster runtime modules. The facilitator build contains preparation and local workbook modules.

However, the source tree still contains a second, obsolete routing stack:

- `src/App.tsx`
- `src/routes/hr-paysim/appRoute.ts`
- `src/components/hr-paysim/PrototypePaySimApp.tsx`
- `src/components/hr-paysim/RosterDiagnosticApp.tsx`
- the old nine-step shell, registry, router, session, calculations, and view-model cluster

`src/main.tsx` no longer imports `src/App.tsx`, so that stack is not in either current build. Its tests still preserve old `/entry`, `/roster`, `/demo`, CEI/CED, and nine-step behavior. Task 12 must remove those obsolete production contracts without deleting static `prototypes/**` references.

The current temporary synthetic URL is `/hr-paysim/decision-room-preview`. The canonical design and original Task 12 contract require `/hr-paysim/demo`.

## 4. Goals

Task 12 must:

- make `/hr-paysim/demo` the canonical synthetic four-screen route;
- keep `/hr-paysim/session/new` and `/hr-paysim/session` as facilitator-local routes;
- ensure all three supported routes use the same Decision Room session provider and screen runtime;
- keep facilitator preparation and workbook parsing out of the public bundle;
- remove obsolete route switching and old nine-step production UI only after reachability proof;
- preserve all current coordinates, calculations, copy, decision states, privacy behavior, and four-screen flow;
- run a complete synthetic and local-file E2E pass before and after cleanup;
- create methodology, sample-result, privacy/non-claims, and QA appendix documents from actual evidence;
- finish with independent code review before merge.

## 5. Non-Goals

Task 12 will not:

- run or simulate `PILOT-1`;
- claim human comprehension evidence that was not collected;
- deploy either surface;
- add authentication or a deployment provider;
- implement the deferred facilitator deployment-attestation script as if a deployment existed;
- add market data, market averages, recommended salaries, or approved-company benchmarks;
- change the four-screen information architecture;
- redesign visual style or rewrite approved founder-facing copy;
- change chart coordinates, detector formulas, comparison ordering, decision logic, or report semantics;
- add persistence, telemetry, uploads to a server, or self-service analysis;
- delete `prototypes/**` or historical design documentation;
- remove canonical fields merely because an older plan called them deprecated.

## 6. Canonical Route Contract

### 6.1 Public build

`PUBLIC_DEMO` permits exactly:

- `/hr-paysim/demo` → synthetic sample → `PaySimSessionProvider` → `DecisionRoomApp`

The following remain unavailable in the public build:

- `/hr-paysim/session/new`
- `/hr-paysim/session`
- `/hr-paysim/roster`
- every old nine-step path such as `/hr-paysim/entry`
- unknown paths

The public entry must not import facilitator preparation, workbook parsing, roster ingestion, legacy `App.tsx`, or old prototype components. The build plugin and emitted module manifest remain fail-closed evidence for this boundary.

### 6.2 Facilitator-local build

`FACILITATOR_LOCAL` permits exactly:

- `/hr-paysim/demo` → synthetic sample
- `/hr-paysim/session/new` → local preparation
- `/hr-paysim/session` → active in-memory session, or the existing no-active-session state

The two facilitator URLs share one provider instance inside the facilitator flow. Starting a prepared session changes the URL with `history.replaceState` and retains the same in-memory session. Ending the session returns to preparation and resets through the existing lifecycle. Refresh still clears the roster by design.

### 6.3 Temporary preview URL

`/hr-paysim/decision-room-preview` is a development-era route, not the canonical MVP URL. Task 12 removes it from route policy, contracts, QA defaults, discovery policy, and supported-route tests. It will resolve to the existing unavailable surface rather than silently maintaining a second public contract.

This is safe because no production deployment or published pilot link is being migrated. Historical documents may retain the old path as historical evidence; current operating documents and executable code must use `/hr-paysim/demo`.

## 7. One Runtime And Provider Meaning

“One `PaySimApp` and one provider” does not mean the public build should import facilitator code. It means:

- one canonical four-screen `DecisionRoomApp` implementation;
- one `PaySimSessionProvider` implementation and decision-room reducer contract;
- surface-specific composition only at the two build entries;
- no alternative prototype, roster-diagnostic, or nine-step app selected at runtime.

The public entry composes the canonical runtime with a synthetic initial state. The facilitator entry composes the same runtime with preparation and an empty initial state. Keeping two thin surface entries is required for build-time privacy isolation and is not duplicate product runtime.

If a small shared composition component improves consistency, it may be introduced only when it does not pull facilitator imports into the public graph. The plan must begin with a failing boundary test before such a refactor.

## 8. Legacy Removal Protocol

Legacy deletion happens after route convergence and a green pre-cleanup E2E run.

A file is removable only when all of the following are true:

1. `rg` and static import reverse-reference inspection show no canonical source import;
2. neither the public nor facilitator build manifest contains it as a runtime module;
3. it is not a type-only dependency of canonical source;
4. its tests assert only the obsolete nine-step or legacy route contract;
5. removing it does not change canonical fixture math, four-screen state, copy, or QA behavior.

Manifest absence alone is insufficient because Vite omits type-only imports and build-tool-only modules. For example, preparation/session/theme type modules and `buildSurface.ts` may be absent from a browser manifest while still required.

Expected first removal candidates are the unreachable legacy entry and its exclusive cluster:

- `src/App.tsx`
- `src/routes/hr-paysim/appRoute.ts`
- old nine-step router and registry
- `src/components/hr-paysim/PrototypePaySimApp.tsx`
- `src/components/hr-paysim/RosterDiagnosticApp.tsx`
- old nine-step shell, stepper, and screen registry
- legacy-only session/view-model/calculation/recommendation modules and their obsolete tests, but only if the four-part proof above passes

The implementation plan must produce a keep/delete inventory before deleting the cluster.

### 8.1 Fields that must not be force-removed

`correctionFloorKRW` is still used by canonical `structuralFindings.ts`, canonical fixture evidence, and current tests. Task 12 therefore retains it unless an earlier implementation step proves that the canonical runtime no longer imports or exposes it without changing behavior. The same rule applies to any CEI/CED, scenario, session, or type module: remove only legacy-exclusive code, never a still-reachable canonical dependency.

This resolves the tension in the old Task 12 checklist: “deprecated” is not sufficient deletion evidence.

## 9. Data, Privacy, And Security Boundary

The current privacy contract is unchanged:

- roster files are selected and read locally in the browser;
- parsing is column-consent gated and fail-closed;
- raw roster data is held in memory only;
- no roster content is written to URLs, browser storage, network calls, telemetry, or repository artifacts;
- public builds exclude file-reading and preparation modules at build time;
- refresh and session end clear the active roster through the existing lifecycle.

`noindex` and route policy are discovery/exposure controls, not authentication. Because Task 12 does not deploy the facilitator build, the QA appendix must state that external access protection has not been attested. A future deployment must verify the real provider or private-network control before any pilot; an environment declaration alone is not proof.

## 10. Test-Driven Execution Gates

Implementation follows red-green-refactor in bounded phases.

### Gate A — route convergence

Write failing tests first for:

- public `/hr-paysim/demo` support;
- facilitator `/demo`, `/session/new`, and `/session` support;
- old preview and nine-step routes becoming unavailable;
- public entry retaining build-time isolation;
- demo contract and unavailable-surface action using the canonical URL.

Then make the smallest route, contract, entry, QA, and policy changes required.

### Gate B — pre-cleanup E2E

Before deletion, freshly run both surfaces through:

- synthetic demo from screen 1 through screen 4;
- facilitator preparation with the repository template;
- facilitator session navigation, decision state, result, and session end;
- blocked public facilitator URLs;
- privacy audit and module-manifest inspection.

No earlier test count or QA output may be reused as completion evidence.

### Gate C — legacy cleanup

Create an evidence table of each delete/keep decision. Delete only proven legacy-exclusive files and update or delete only tests whose product contract was removed. Re-run focused tests after each coherent deletion group.

### Gate D — full post-cleanup verification

Freshly run:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run build:facilitator
node scripts/qa-decision-room.mjs
node scripts/verify-route-exposure.mjs
node scripts/verify-privacy-lifecycle.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

If actual script names differ, the implementation plan must inventory them and use the repository's current equivalents. Both browser surfaces must be tested from newly built artifacts, not a stale dev server.

## 11. Portfolio Evidence Package

Task 12 creates:

- `docs/hr-paysim/22_methodology_note.md`
- `docs/hr-paysim/23_sample_founder_result.md`
- `docs/hr-paysim/24_privacy_and_non_claims.md`
- `docs/hr-paysim/25_algorithm_and_qa_appendix.md`

### 11.1 Methodology note

Explain input scope, comparable hierarchy, observed-vs-interpreted evidence, confirmation gates, deterministic calculations, and limits. It must not describe market truth or an individual salary recommendation.

### 11.2 Sample founder result

Use only the fixed synthetic fixture. Show the evidence chain, confirmed pay difference, chosen company rule, and resulting record. Label every number by source and do not present the sample as a real company result.

### 11.3 Privacy and non-claims

Document local-only file handling, in-memory lifecycle, public bundle exclusion, no telemetry/persistence, no authentication claim, no deployment claim, no market benchmark, and no pilot outcome.

### 11.4 Algorithm and QA appendix

Record commit SHA, fixtures, route matrix, build manifests, commands, fresh test count, screenshots or screenshot paths, browser observations, known limitations, review findings, and gate status. The pilot section must say `NOT RUN` and point to the existing pilot method contract rather than inventing results.

Documentation is written after verification so it records actual evidence rather than expected evidence.

## 12. Commit And Review Boundaries

The implementation plan should use narrow commits:

1. design document;
2. implementation plan;
3. route convergence and tests;
4. proven legacy runtime cleanup;
5. portfolio/QA evidence and any evidence-only corrections.

The final feature commit wording from the original plan, `feat: converge HR PaySim decision-room runtime`, may be used for the primary runtime package. Documentation and plan commits remain separate so design history is reviewable.

Before merge:

- run the full fresh verification set;
- request independent code review;
- resolve actionable findings with focused tests;
- rerun affected checks and the complete final suite;
- push and open a PR only after the evidence appendix matches the final commit state.

Task 13 or pilot execution must not start automatically.

## 13. Stop And Rollback Conditions

Stop the current phase if:

- a proposed deletion is imported by canonical source or required as a type-only/build-tool dependency;
- public output gains facilitator, workbook, roster, storage, or network modules;
- route convergence changes calculations, state transitions, copy, or screen order;
- E2E differs before and after cleanup beyond the intended URL contract;
- privacy verification observes raw roster content outside in-memory state;
- governance verification fails;
- documentation would require a pilot, deployment, or comprehension claim not supported by evidence.

Rollback is commit-scoped: revert the failing phase, keep the last green route/privacy boundary, and document the unresolved legacy dependency instead of forcing deletion.

## 14. Acceptance Criteria

Task 12 is complete only when:

- `/hr-paysim/demo` is the only public Decision Room route;
- facilitator-local supports `/demo`, `/session/new`, and `/session` through the canonical provider/runtime;
- `/decision-room-preview`, `/entry`, `/roster`, and other obsolete production paths are unavailable;
- public bundle manifests contain no facilitator preparation, workbook reader, roster ingestion, or legacy runtime modules;
- a pre-cleanup and post-cleanup E2E run both pass with the intended route difference only;
- every deleted module has recorded reachability proof;
- still-canonical fields such as `correctionFloorKRW` are retained unless separately proved unused without behavior change;
- all fresh automated, browser, privacy, route, governance, and diff checks pass;
- documents 22–25 match the final verified commit and state `PILOT-1: NOT RUN`;
- independent review has no unresolved material finding;
- no deployment, pilot, authentication, market, or salary-recommendation claim is made.
