# HR PaySim Governance Preflight And Pilot-Led Remaining Work Design

## Status

Revised approved-direction design for establishing the HR PaySim diagnostic-product governance boundary, closing Task 9, reaching a safe facilitated pilot early, and using pilot evidence to shape the remaining product work.

This design supersedes only the sequencing and Adapter-location decisions in `docs/superpowers/specs/2026-07-12-hr-paysim-governance-task9-integration-design.md`. The four-screen product design, Task 8 state contract, Task 9 human stop gate, and existing product implementation remain unchanged.

## Current Baseline

- Product worktree: `C:\tmp\hr-paysim-facilitated-decision-room`
- Product branch: `codex/facilitated-decision-room`
- Shared governance repository identifier: `transition-gap`
- Shared governance branch: `codex/diagnostic-product-governance`
- Pinned upstream baseline: `790eb99`
- Product plan range: Task 1 through Task 12, including Task 4A
- Product state: Tasks 1 through 8 are committed; Task 9 implementation has passed fresh automated verification but remains uncommitted because the real-participant comprehension gate has not passed
- Remaining work: Task 9 human gate and commit, pilot-safety intake, an initial facilitated pilot, and pilot-shaped Tasks 10 through 12

No document or automation may describe Task 9 as complete while its human gate remains open.

## Goal

Create one PaySim-local Adapter that references shared governance without copying it, record a reproducible Governance Preflight, close Task 9 without making it depend on governance work, and bring the minimum privacy-safe facilitator workflow forward so a Product Engineer-only slice can reach one or two real facilitated sessions before broader synthetic expansion or runtime polishing.

The initial pilot is a learning checkpoint, not the final case-series claim. Career-artifact completion still requires the field-validation thresholds in the current four-screen design.

## Chosen Approach

Use a thin canonical Adapter, a machine-portable local resolver, and an auditable Preflight while Task 9 human recruitment proceeds independently. After Task 9 closes, build only the intake, privacy, and lifecycle capabilities required for a safe Product Engineer-only pilot. Use that evidence to approve or change the scope of Tasks 10 through 12.

Rejected alternatives:

- An Adapter-only shortcut would leave authority conflicts and candidate status implicit.
- A large pre-pilot governance package would create an unnecessary second framework.
- Duplicating the Adapter would create two possible product authority files.
- Completing all remaining synthetic subjects and runtime convergence before any pilot would polish assumptions that field evidence may overturn.
- Committing a developer-specific upstream path would make verification machine-bound and expose personal directory structure.

## Canonical Adapter Location

The only PaySim Adapter is:

`docs/diagnostic-product-adapter.md`

This follows the installed `diagnostic-product-governance` skill contract. The older proposal to use `docs/hr-paysim/diagnostic-product-adapter.md` is superseded and that second file must not be created.

## Portable Upstream Resolution

The committed Adapter records only:

- repository identifier `transition-gap`;
- pinned commit `790eb99`;
- Constitution path `docs/diagnostic-product-constitution.md` relative to the upstream repository;
- casebook path `docs/diagnostic-before-after-casebook.md` relative to the upstream repository.

It must not contain a home directory, OneDrive location, machine-specific drive letter, or other absolute local path.

Local resolution uses one uncommitted input, in priority order:

1. `PAYSIM_GOVERNANCE_UPSTREAM` environment variable;
2. `.governance/governance.local.json`, which is ignored by git.

`scripts/verify-diagnostic-governance.mjs` resolves the local input, confirms that it is the expected Git repository and contains commit `790eb99`, and prepares an ignored `.governance/upstream` directory link. It uses a junction on Windows and a directory symlink on other supported systems. The Adapter's required metadata paths point to `.governance/upstream/docs/...`, so the installed Python verifier can still run directly against the PaySim project root and resolve real upstream files without copying them.

The resolver must fail closed when the local target is missing, is the wrong repository, lacks the pinned commit, or cannot create a safe link. It must not write to the upstream repository. A moved branch is recorded as drift but does not silently change the pin.

## Scope Lock

### Governance phase

The initial scope is `GOVERNANCE_ONLY`.

Allowed work:

- create the Adapter and portable resolver;
- create the dated Governance Preflight record;
- add a concise root work guide after validation;
- clarify authority notes without rewriting legacy documents;
- write the remaining-work implementation plan.

Forbidden work:

- modify source code, product tests, fixtures, or browser QA;
- change or stage the uncommitted Task 9 implementation;
- modify the upstream Constitution, casebook, Adapter template, skill, or HR Prism code;
- promote a casebook candidate to a `LOCKED` principle;
- self-certify the Task 9 human gate.

### Product phase

`PRODUCT_IMPLEMENTATION` is authorized only by an approved work package. P9-H may proceed independently of G1 through G3 because it does not depend on governance artifacts. Later product packages require a passing Preflight and retain their own tests, gates, and commit boundaries.

### Review phase

`REVIEW_ONLY` permits inspection, deterministic validation, and feedback but no edits.

## Authority Map

| Source | Authority | Use |
|---|---|---|
| Upstream Constitution at `790eb99` | `AUTHORITATIVE` | Shared `DP-01` through `DP-05` principle text |
| Upstream casebook at `790eb99` | `REFERENCE_ONLY` | Before/after evidence and candidate transfer hypotheses |
| `docs/diagnostic-product-adapter.md` | `AUTHORITATIVE` | PaySim scope, mappings, local boundaries, and conflict routing |
| `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md` | `PRODUCT-SPECIFIC` | Current runtime, copy order, state, privacy, pilot, and acceptance contracts |
| `docs/hr-paysim/17_strategy_gtm_career_contract.md` | `PRODUCT-SPECIFIC` | Pilot KPI and honest career/CMU claim boundary |
| `docs/hr-paysim/19_sample_output_contract.md` | `PRODUCT-SPECIFIC` | Synthetic roster, fixture values, and expected detection output only |
| `docs/hr-paysim/21_anonymous_pilot_learning_log_contract.md` | `PRODUCT-SPECIFIC` | Consent and manual pseudonymous pilot-learning record boundary |
| `src/lib/hr-paysim/copy/founderCopy.ts` | `PRODUCT-SPECIFIC` | Important founder-facing conclusion, state, non-claim, and action copy |
| Original Task 1 through Task 12 implementation plan | `REFERENCE_ONLY` | Original sequence and verification history |
| `docs/hr-paysim/final-design-acceptance.md` | `LEGACY` | Historical eight-step visual reference only |

Conflict order is: latest explicit user instruction, PaySim Adapter, current PaySim product design and contracts, approved current implementation plan, reference plans, then legacy material.

## LOCKED Principle Application

The Adapter maps IDs and evidence locations without reproducing Constitution prose.

| Principle | PaySim application | Observable verification |
|---|---|---|
| `DP-01` | Roster evidence through themes, reviews, repeats, decisions, report, copy, and export | Dependency invalidation tests; report derived from reviewed state; no independent narrative |
| `DP-02` | Claim-status and non-claim boundaries on explanations, repeats, and confirmed output | Destination filtering; unsupported statements never render; observed precedent is not policy |
| `DP-03` | Founder copy and view models stay separate from detector names, row IDs, and calculation language | Forbidden-copy tests and browser QA |
| `DP-04` | Salary gaps and repeat amounts retain definition, basis, scope, and limitation | Data-derived headline, unit/context tests, evidence table, and non-claims |
| `DP-05` | The founder explains, chooses, and approves company action rather than receiving a score | Four-screen action flow and absence of score/risk hero output |

## Candidate Validation Design

Initial status is conservative. Every `CONFIRMED` case names its PaySim evidence; none is confirmed merely because HR Prism implemented it.

| Case | Status | PaySim evidence |
|---|---|---|
| `CASE-01` | `CONFIRMED` | `founder-copy.test.ts` forbidden-term tests, `decision-room-ui.test.ts` expanded founder-language test, and browser visible-text scan |
| `CASE-02` | `CONFIRMED` | `decision-room-ui.test.ts` anonymous founder-facing comparison and model-owned evidence tests |
| `CASE-05` | `CONFIRMED` | `founder-copy.test.ts` unit/context test and `decision-room-ui.test.ts` data-derived headline-gap test |
| `CASE-08` | `CONFIRMED` | `founder-copy.test.ts` prompt contract and `decision-room-ui.test.ts` one-concrete-action test |
| `CASE-10` | `CONFIRMED` | `decision-room-ui.test.ts` source-order/component ownership and `qa-decision-room.mjs` gaze-order checks |
| `CASE-11` | `CONFIRMED` | `dependency-invalidation.test.ts`, `decision-room-ui-invalidation.test.ts`, and browser invalidation checks |
| `CASE-12` | `CONFIRMED` | `claim-rendering.test.ts` destination matrix and `founder-copy.test.ts` repeat/non-claim contracts |
| `CASE-13` | `CONFIRMED` | `qa-decision-room.mjs` bottom action, three-action navigation, focus movement, keyboard, and overflow checks |
| `CASE-03`, `CASE-04`, `CASE-06` | `ADAPTED` | Facilitated founder questions, compensation evidence, and decision-state mechanics apply the pattern differently |
| `CASE-07`, `CASE-09`, `CASE-14` | `NOT_TESTED` | Current evidence is insufficient; Task 9 comprehension and pilot evidence may later affect `CASE-14` |
| None | `REJECTED` | No candidate currently has PaySim evidence proving it inapplicable |

## Product-Specific Boundaries

- HR PaySim is a facilitated compensation-explainability decision room, not a general organizational diagnostic.
- The product does not estimate market salary, attrition, productivity loss, legal exposure, or the correct salary for an individual.
- Raw roster text clears after parsing and does not persist. Employee labels are session-local and row IDs never render.
- `EvidenceStatus` and interpretation claim status remain separate.
- Observed precedent and founder-approved reusable rule remain separate.
- `repeatabilityStatus: unanswered` cannot become policy copy.
- Explanation or evidence changes invalidate every dependent output before rerender.
- Pilot learning records are manual, pseudonymous, consented, and outside the app.
- Task 9 remains blocked on real human evidence even though automated checks pass.

## Forbidden Literal Transfers

- Do not copy Constitution prose into PaySim files.
- Do not copy HR Prism screen flow, Matrix, scenario cards, roadmap, glossary, benchmark formula, or corrected labels.
- Do not copy the Prism Adapter's product rules into PaySim.
- Do not turn casebook UI implementations into shared components before PaySim evidence requires them.
- Do not copy PaySim claim states, privacy rules, fixture values, or pilot learning records back into the common casebook.
- Do not commit the upstream local path, junction, or `governance.local.json`.

## Governance Preflight Artifact

Create `docs/hr-paysim/validation/2026-07-12-governance-preflight.md` with the skill-contract block: scope, authorities, `DP-*` IDs, `CASE-*` IDs, product boundaries, conflicts, and one authorized next-work sentence.

Also record product branch, upstream repository identifier and branch, current upstream HEAD SHA, pinned commit existence, Adapter validation result, branch drift, and Task 9 gate status. Do not record the local absolute path. The Preflight cannot close a product or human gate.

## Verification

The governance phase runs:

```powershell
$env:PAYSIM_GOVERNANCE_UPSTREAM='<local checkout path>'
node scripts/verify-diagnostic-governance.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

The environment assignment is local shell state and never committed. The Node resolver validates repository identity, pinned commit existence, branch drift, ignored-link safety, and invokes or prepares the direct skill verification. Product tests are not required for a governance-only change and stale results are never used as proof for later product work.

## Root Work Guide And Authority Notes

After the Adapter validates, add a concise root `AGENTS.md` that requires future sessions to read the Adapter first and preserve its scope. Reference `DP-*` IDs and paths only.

Add minimal authority banners to `final-design-acceptance.md` and `19_sample_output_contract.md` only if their limited authority is not already explicit. Do not rewrite either document.

## Pilot-Led Work Decomposition

### Parallel track A: P9-H — Task 9 closeout

Recruit at least two non-HR participants, including one target-adjacent participant, while governance work proceeds. Run the five-second test, record only real de-identified answers, rerun fresh automated checks, commit Task 9 with the locked message, and request independent review. A failed gate returns to Task 9 information hierarchy; governance work does not block or certify it.

### Parallel track B: G1 through G3 — Governance foundation

- `G1`: create the canonical Adapter, ignored local resolver contract, and verification script.
- `G2`: run revision checks and write the dated Preflight; stop on unresolved authority or pin failure.
- `G3`: add the root guide and necessary authority banners; commit governance files separately from Task 9.

### Pilot Safety: P11-B0 — Minimum facilitator intake and lifecycle

After P9-H passes, bring forward only the Task 11 capabilities required to handle a real roster safely: facilitator preparation, header/value PII checks, blocked-row handling, raw-input clearing, normalized confirmation, no storage/URL/server emission, and explicit session clearing. Use a local or otherwise private facilitator surface. If the surface is deployed or externally reachable, the minimum Task 11 route/access gate becomes a prerequisite for the pilot.

### PILOT-1 — Product Engineer-only facilitated checkpoint

Run one or two real founder/operator sessions using only the Product Engineer vertical slice. Obtain separate consent before creating a manual pseudonymous learning record. Capture decision usefulness, aha or disagreement, evidence gaps, memo/result sharing, action scheduling, false positives, and facilitator friction. Do not store raw quotes, company identity, or learning logs in the app.

The checkpoint decides whether to preserve, reduce, or revise the scope and order of Tasks 10 through 12. It does not satisfy the final design's requirement for at least three facilitated sessions.

### P10 — Pilot-shaped subject expansion

- `P10-A`: lock the remaining-subject contract only after reviewing PILOT-1 evidence.
- `P10-B`: connect Platform, GTM, and Designer clean state inside the same four screens.
- `P10-C`: run focused tests, full commands, browser QA, and governance postflight; commit separately.

### P11 — Complete facilitator exposure and privacy verification

- `P11-A`: finish public-demo versus facilitator route exclusion and deployment-gate tests if deployment is in scope.
- `P11-B`: complete remaining preparation and privacy lifecycle behavior not required by P11-B0.
- `P11-C`: verify public and facilitator surfaces independently and run postflight.

### P12 — Runtime convergence and portfolio evidence

- `P12-A`: verify lineage, converge supported routes, and remove obsolete runtime paths only after canonical-import checks.
- `P12-B`: create methodology, sample result, privacy/non-claims, algorithm/QA, and honest pilot-evidence documents.
- `P12-C`: run both surfaces, all checks, browser QA, postflight, and final review.

Additional facilitated sessions expand the case series toward the current design's career-artifact thresholds only after PILOT-1 findings are incorporated.

## Error And Stop Conditions

Stop governance work when the local upstream cannot be safely resolved, the pin or files cannot be verified, canonical and legacy sources conflict, a candidate would be promoted to `LOCKED`, another repository would be modified, or product changes become necessary under `GOVERNANCE_ONLY`.

Stop product progression when Task 9 human evidence is missing or fails, pilot safety checks fail, required consent is absent, invalidation or privacy fails, stale test results are reused, or pilot/review/deployment evidence is described more strongly than observed.

## Commit Boundaries

1. Commit this revised design by itself.
2. P9-H and G1 through G3 may proceed in parallel but use separate commits.
3. Do not commit Task 9 before its real human gate passes.
4. Commit P11-B0 separately before PILOT-1.
5. PILOT-1 learning records remain private unless a separately approved anonymized artifact is created.
6. Re-approve the post-pilot scope before Tasks 10 through 12.
7. Never stage unrelated dirty-worktree files.

## Success Criteria

- Exactly one PaySim Adapter exists at the skill-contract path.
- No committed file contains the developer's upstream absolute path.
- Local resolution verifies real upstream files and commit `790eb99` without copying or modifying them.
- The governance verifier exits successfully and the Preflight preserves the open Task 9 gate.
- Every `CONFIRMED` case maps to named PaySim tests or QA evidence.
- Task 9 recruitment is not blocked by governance sequencing.
- Minimum intake, PII, and lifecycle safeguards precede any real-roster pilot.
- One or two Product Engineer-only facilitated sessions occur before broad synthetic expansion and runtime convergence.
- Pilot evidence explicitly controls the approved scope of Tasks 10 through 12.
