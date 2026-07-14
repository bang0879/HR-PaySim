# HR PaySim Algorithm And QA Appendix

## Evidence snapshot

- Date: 2026-07-14
- Branch: `codex/task12-runtime-convergence`
- Base: `origin/main` at `a9d6d32`
- Route convergence commit: `1009381`
- Legacy cleanup commit: `b1d4661`
- Product state: pre-pilot localhost MVP
- `PILOT-1: NOT RUN`

This appendix records synthetic and automated evidence only. It does not claim participant validation of the product.

## Supported route matrix

| Path | `PUBLIC_DEMO` | `FACILITATOR_LOCAL` |
|---|---|---|
| `/hr-paysim/demo` | synthetic four-screen Decision Room | synthetic four-screen Decision Room |
| `/hr-paysim/session/new` | unavailable | local preparation |
| `/hr-paysim/session` | unavailable | active in-memory session or no-active-session state |
| `/hr-paysim/decision-room-preview` | unavailable | unavailable |
| `/hr-paysim/entry` | unavailable | unavailable |
| `/hr-paysim/roster` | unavailable | unavailable |

Both supported surfaces use `PaySimSessionProvider` and `DecisionRoomApp`. Separate thin build entries preserve build-time public/facilitator isolation.

## Algorithm inventory

### Comparison evidence

- Same-role comparison is required.
- Complete compatible level evidence constrains comparisons; partial or conflicting levels fail closed.
- Relevant experience precedes company tenure.
- Missing relevant experience does not receive a tenure-only fallback.
- Materiality uses the configured absolute or percentage gap threshold.
- Input order does not change canonical pairs or themes.

### Plot

- Horizontal axis: relevant experience.
- Vertical axis: base salary.
- Observed trend: deterministic OLS over the central 70 percent of career observations.
- Rendered extent: 15 percent to 85 percent of plot width.
- Missing-career rows remain accounted for without a fabricated x-coordinate.
- The trend is not a market benchmark, standard raise rate, approved policy, or salary recommendation.

### Review and report

- Raw findings are grouped into connected founder-reviewable themes.
- Up to three subjects are selected deterministically.
- Review state uses enum-backed explanation, evidence, repeatability, and outcome values.
- Dependent claims, repeats, decisions, and report state are invalidated when their evidence basis changes.
- Confirmed report statements require client-data evidence plus current reviewed state.

## Fresh pre-cleanup evidence

After route convergence and before deleting the unreachable legacy source cluster:

| Command | Result |
|---|---|
| `npm.cmd run lint` | exit 0 |
| `npm.cmd test` | 249 tests, 249 pass, 0 fail |
| `npm.cmd run typecheck` | exit 0 |
| `npm.cmd run build` | exit 0; 54 modules transformed |
| `npm.cmd run build:facilitator` | exit 0; 106 modules transformed |
| `node scripts/verify-route-exposure.mjs` | exit 0 |
| `node --experimental-strip-types scripts/verify-facilitator-privacy.ts` | exit 0 |

The public manifest reported `PUBLIC_DEMO`, 54 total manifest modules, and zero facilitator or legacy modules. The facilitator manifest reported `FACILITATOR_LOCAL`, 92 total manifest modules, nine preparation-owner matches, and zero legacy modules.

## Legacy removal evidence

Static reverse-reference inspection found the removed runtime APIs only in the obsolete source cluster, obsolete tests, and boundary strings that intentionally forbid reintroduction. No canonical feature, provider, preparation, session reducer, theme, report, or current QA module imported the cluster.

The deletion decision is recorded per production/runtime file below. "Absent" means the file was absent from both post-convergence build manifests; "none" means no canonical source or type/build dependency remained before deletion.

| Removed path | Reverse references before deletion | Public / facilitator manifests | Canonical type/build dependency | Disposition |
|---|---|---|---|---|
| `scripts/qa-hr-paysim-step1.mjs` | standalone obsolete QA command | absent / absent | none | removed |
| `src/App.tsx` | alternate runtime entry and legacy tests only | absent / absent | none | removed |
| `src/components/hr-paysim/PrototypePaySimApp.tsx` | alternate runtime cluster and legacy tests only | absent / absent | none | removed |
| `src/components/hr-paysim/RosterDiagnosticApp.tsx` | alternate runtime cluster and legacy tests only | absent / absent | none | removed |
| `src/components/hr-paysim/PaySimShell.tsx` | alternate runtime cluster only | absent / absent | none | removed |
| `src/components/hr-paysim/PaySimStepper.tsx` | alternate runtime cluster only | absent / absent | none | removed |
| `src/components/hr-paysim/screens/index.tsx` | alternate runtime cluster only | absent / absent | none | removed |
| `src/routes/hr-paysim/appRoute.ts` | alternate runtime entry and legacy tests only | absent / absent | none | removed |
| `src/routes/hr-paysim/router.ts` | alternate runtime cluster and legacy tests only | absent / absent | none | removed |
| `src/routes/hr-paysim/stepRegistry.ts` | alternate runtime cluster and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/calculations.ts` | legacy nine-step modules and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/consent.ts` | legacy nine-step modules and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/copy.ts` | legacy nine-step modules and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/fixtures.ts` | legacy nine-step modules and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/memo.ts` | legacy nine-step modules and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/recommendations.ts` | legacy nine-step modules and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/session.ts` | alternate runtime cluster and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/prototypeViewModel.ts` | alternate runtime cluster and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/rosterDiagnosticViewModel.ts` | alternate runtime cluster and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/rosterParser.ts` | replaced paste runtime and legacy tests only | absent / absent | none | removed |
| `src/lib/hr-paysim/validation.ts` | legacy nine-step modules and legacy tests only | absent / absent | none | removed |

Retained boundaries were checked separately so type-only reachability was not mistaken for dead code:

| Retained path or boundary | Evidence for keeping it |
|---|---|
| `prototypes/**` and historical documents | explicitly preserved historical artifacts, outside runtime convergence |
| `src/lib/hr-paysim/domain.ts` | canonical roster and structural-finding imports remain; `correctionFloorKRW` is used by canonical finding code |
| canonical feature, provider, preparation, session reducer, theme, review, and report modules | reachable from `DecisionRoomApp` or `PaySimSessionProvider`, including type-only imports |
| `src/lib/hr-paysim/copy/forbiddenFounderTerms.ts` | current copy-governance tests and canonical copy boundaries |
| `src/lib/hr-paysim/access/buildSurface.ts` and thin public/facilitator entries | active build-surface isolation and fail-closed route resolution |
| public-boundary strings naming removed components | intentional regression guards that reject reintroduction |

After cleanup:

| Command | Result |
|---|---|
| `node --experimental-strip-types --test tests/hr-paysim/runtime-convergence.test.ts` | 2 pass, 0 fail |
| `npm.cmd run typecheck` | exit 0 |
| `npm.cmd test` | 207 tests, 207 pass, 0 fail |
| `npm.cmd run build` | exit 0; same public asset hashes and sizes as pre-cleanup |
| `npm.cmd run build:facilitator` | exit 0; same facilitator asset hashes and sizes as pre-cleanup |
| `node scripts/verify-route-exposure.mjs` | exit 0 |
| `node --experimental-strip-types scripts/verify-facilitator-privacy.ts` | exit 0 |

The reduced test count reflects removal of tests that asserted the deleted nine-step, prototype, and roster contracts. The retained canonical suite plus the new convergence tests is the relevant quality baseline; the count itself is not a quality score.

## Fresh browser evidence

The first public attempt on port 5173 exposed an environmental mismatch: an existing facilitator server already held that port, so the strict-port public process exited. No product fix was made. The existing server was preserved and isolated ports were used.

### Public QA on port 5174

Command: `node scripts/qa-decision-room.mjs --surface=public` with `HR_PAYSIM_URL=http://127.0.0.1:5174/hr-paysim/demo`.

- four screens passed at 1280×720, 1440×900, and 390×844;
- result reached in three clicks and by keyboard;
- focus moved after each action;
- no horizontal overflow;
- six plot points aligned within one pixel;
- observed line count 1, fixed direction-guide count 0;
- trend extent 15 to 85 percent;
- preview, entry, roster, and both facilitator routes failed closed;
- localStorage and sessionStorage keys: 0;
- console issues: 0;
- errors: 0.

### Facilitator QA on port 5175

Command: `node scripts/qa-decision-room.mjs --surface=facilitator-local` with `HR_PAYSIM_URL=http://127.0.0.1:5175/hr-paysim/demo`.

Desktop and mobile checks reported:

- column consent required: true;
- row PII blocks all: true;
- preparation hierarchy: true;
- file input reset: true;
- source data absent after read: true;
- raw textarea cleared: true;
- sample label hidden in facilitated session: true;
- roster data in URL: false;
- direct session fails closed: true;
- explicit end clears rows: true;
- external roster emissions: 0;
- localStorage and sessionStorage keys: 0;
- console issues: 0;
- errors: 0.

Screenshots produced by the current QA script:

- `C:/tmp/decision-room-screen2-1280.png`
- `C:/tmp/decision-room-screen2-viewport.jpg`

These screenshots contain the repository's synthetic demo, not participant or company data.

## Final post-documentation verification

The implementation and evidence state at commit `55905db` was rerun from a clean worktree after the four evidence documents were added:

| Command or gate | Fresh result |
|---|---|
| `npm.cmd run lint` | exit 0 |
| `npm.cmd test` | 209 tests, 209 pass, 0 fail |
| `npm.cmd run typecheck` | exit 0 |
| `npm.cmd run build` | exit 0; 54 modules transformed; public manifest 54 modules |
| `npm.cmd run build:facilitator` | exit 0; 106 modules transformed; facilitator manifest 92 modules |
| `node scripts/verify-route-exposure.mjs` | exit 0 |
| `node --experimental-strip-types scripts/verify-facilitator-privacy.ts` | exit 0 |
| `python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .` | exit 0 |
| `git diff --check` | exit 0 |
| public browser QA on port 5174 | exit 0; three viewports, four screens, mouse and keyboard paths, blocked unsupported routes, storage 0, console/errors 0 |
| facilitator browser QA on port 5175 | exit 0; desktop/mobile privacy lifecycle, blocked direct session, storage/emissions/console/errors 0 |

The independent review initially reported 0 critical, 2 important, and 0 minor findings. Both important findings concerned this evidence appendix: the missing per-file deletion inventory and stale pending-verification wording. After the current reconciliation, the same reviewer confirmed 0 unresolved critical, important, or minor findings and returned `Ready to merge: Yes` for the reviewed scope.

The final branch-level verification reruns the same gates after this documentation/test-only reconciliation. The reconciliation commit cannot truthfully embed its own Git SHA; the final branch SHA and rerun results are reported in the handoff instead.

## Known limitations and non-claims

- localhost-only; no deployment evidence;
- no external access-control attestation;
- refresh clears the in-memory session;
- no persistence or telemetry;
- fixed synthetic demonstration, not market data;
- no market benchmark;
- no individual salary recommendation;
- no fairness, performance, attrition, or causality conclusion;
- no participant transcript or human comprehension evidence in Task 12;
- `PILOT-1: NOT RUN`.
