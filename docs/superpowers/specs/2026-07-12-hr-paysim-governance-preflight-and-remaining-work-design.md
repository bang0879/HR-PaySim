# HR PaySim Governance Preflight And Remaining Work Design

## Status

Approved design for establishing the HR PaySim diagnostic-product governance boundary before replanning and continuing the remaining product work.

This design supersedes only the sequencing and Adapter-location decisions in `docs/superpowers/specs/2026-07-12-hr-paysim-governance-task9-integration-design.md`. The four-screen product design, Task 8 state contract, Task 9 human stop gate, and existing product implementation remain unchanged.

## Current Baseline

- Product worktree: `C:\tmp\hr-paysim-facilitated-decision-room`
- Product branch: `codex/facilitated-decision-room`
- Shared governance repository: `C:\Users\bang0\OneDrive\바탕 화면\transition-gap`
- Shared governance branch: `codex/diagnostic-product-governance`
- Pinned upstream baseline: `790eb99`
- Product plan range: Task 1 through Task 12, including Task 4A
- Current product state: Tasks 1 through 8 are committed; Task 9 implementation has passed fresh automated verification but remains uncommitted because the real-participant comprehension gate has not passed
- Remaining canonical product tasks: Task 9 human gate and commit, Task 10, Task 11, and Task 12

No document or automation may describe Task 9 as complete while its human gate remains open.

## Goal

Create one PaySim-local Adapter that references the shared Constitution and casebook without copying them, run and record a reproducible Governance Preflight, and then replace the coarse remaining-work sequence with smaller governance-aware product work packages.

The governance work must preserve the existing uncommitted Task 9 files and must not edit shared governance sources, HR Prism code, or PaySim production code.

## Chosen Approach

Use a thin canonical Adapter plus an auditable Preflight before product replanning.

Rejected alternatives:

- An Adapter-only shortcut would leave authority conflicts, candidate status, and Task 9 gating implicit.
- A large pre-pilot governance package would create an unnecessary second framework before the first facilitated pilot.
- Duplicating the Adapter under both `docs/` and `docs/hr-paysim/` would create two possible product authority files.

## Canonical Adapter Location

The only PaySim Adapter is:

`docs/diagnostic-product-adapter.md`

This location follows the installed `diagnostic-product-governance` skill contract. The older proposal to use `docs/hr-paysim/diagnostic-product-adapter.md` is superseded and that second file must not be created.

## Source And Revision Model

The Adapter references these upstream files at commit `790eb99`:

- `docs/diagnostic-product-constitution.md`
- `docs/diagnostic-before-after-casebook.md`
- `docs/templates/diagnostic-product-adapter-template.md`

The Constitution is the authoritative source for `LOCKED` principle text. The casebook is reference evidence. The template defines the Adapter schema but does not override product contracts.

The Adapter records absolute upstream paths because the sources live in another local repository and must not be copied into PaySim. Verification must check both that the declared files exist and that the upstream repository still contains the pinned commit. A moved branch does not silently change the pinned baseline.

## Scope Lock

### Governance phase

The initial scope is `GOVERNANCE_ONLY`.

Allowed work:

- create the PaySim Adapter;
- create the dated Governance Preflight record;
- add a concise root work guide after the Adapter validates;
- clarify authority notes without rewriting legacy documents;
- write the remaining-work implementation plan.

Forbidden work:

- modify source code, tests, fixtures, or browser QA;
- change or stage the uncommitted Task 9 implementation;
- modify the upstream Constitution, casebook, Adapter template, or HR Prism code;
- promote a casebook candidate to a `LOCKED` principle;
- self-certify the Task 9 human gate.

### Product phase

`PRODUCT_IMPLEMENTATION` begins only after the Adapter validates, the Preflight reports no unresolved blocker, and the resulting implementation plan is approved. Each product work package retains its own tests, gates, and commit boundary.

### Review phase

`REVIEW_ONLY` permits inspection, deterministic validation, and feedback but no product or governance edits.

## Authority Map

| Source | Authority | Use |
|---|---|---|
| Upstream Constitution at `790eb99` | `AUTHORITATIVE` | Shared `DP-01` through `DP-05` principle text |
| Upstream casebook at `790eb99` | `REFERENCE_ONLY` | Before/after evidence and candidate transfer hypotheses |
| `docs/diagnostic-product-adapter.md` | `AUTHORITATIVE` | PaySim scope, mappings, local boundaries, and conflict routing |
| `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md` | `PRODUCT-SPECIFIC` | Current four-screen runtime, copy order, state, privacy, and acceptance contracts |
| `docs/hr-paysim/19_sample_output_contract.md` | `PRODUCT-SPECIFIC` | Synthetic roster, fixture values, and expected detection output only |
| `src/lib/hr-paysim/copy/founderCopy.ts` | `PRODUCT-SPECIFIC` | Important founder-facing conclusion, state, non-claim, and action copy |
| `docs/superpowers/plans/2026-07-11-hr-paysim-facilitated-decision-room-implementation-plan.md` | `REFERENCE_ONLY` | Original Task 1 through Task 12 sequence and verification history |
| `docs/hr-paysim/final-design-acceptance.md` | `LEGACY` | Historical eight-step visual reference only |
| Existing integration and Task 9 completion plans | `REFERENCE_ONLY` | Prior decisions that remain valid unless this design explicitly supersedes them |

Conflict order is: latest explicit user instruction, PaySim Adapter, current PaySim product design and contracts, approved current implementation plan, reference plans, then legacy material.

## LOCKED Principle Application

The Adapter maps IDs and evidence locations without reproducing Constitution prose.

| Principle | PaySim application | Observable verification |
|---|---|---|
| `DP-01` | Structured roster evidence through themes, reviews, repeats, decisions, report, copy, and export | Dependency invalidation tests; report derived from current reviewed state; no independent stored narrative |
| `DP-02` | Claim-status and non-claim boundaries on explanations, repeat results, and confirmed output | Destination filtering tests; unsupported statements never render; observed precedent is not called policy |
| `DP-03` | Founder copy and view models remain separate from detector names, raw IDs, and calculation language | Forbidden-copy checks and browser QA show no detector terms or row IDs |
| `DP-04` | Salary gaps and repeat amounts retain definition, data basis, scope, and limitation | Data-derived headline tests; evidence table and non-claim copy; no recommended individual salary |
| `DP-05` | The founder explains, chooses, and approves company action rather than receiving a score or personal judgment | Four-screen action flow, founder questions, decision record, and absence of score/risk hero output |

## Candidate Validation Design

Initial status is deliberately conservative and may be raised only by named product evidence.

| Cases | Initial status | PaySim evidence boundary |
|---|---|---|
| `CASE-01`, `CASE-02`, `CASE-05`, `CASE-08`, `CASE-10`, `CASE-11`, `CASE-12`, `CASE-13` | `CONFIRMED` | Existing copy, view-model, invalidation, layout, and browser tests demonstrate the same underlying failure-prevention pattern |
| `CASE-03`, `CASE-04`, `CASE-06` | `ADAPTED` | The principle applies, but facilitated founder questions, compensation evidence, and decision-state mechanics differ from HR Prism |
| `CASE-07`, `CASE-09`, `CASE-14` | `NOT_TESTED` | Current evidence is insufficient to claim the candidate has been validated in PaySim; Task 9 comprehension evidence may later affect `CASE-14` |
| None | `REJECTED` | No candidate currently has product evidence proving it inapplicable |

The Adapter must not call any case `CONFIRMED` merely because the analogous HR Prism change was implemented.

## Product-Specific Boundaries

- HR PaySim is a facilitated compensation-explainability decision room, not a general organizational diagnostic.
- Relationship evidence leads before aggregate scoring; founder-facing scores and detector-card grids remain excluded.
- The product does not estimate market salary, attrition, productivity loss, legal exposure, or the correct salary for an individual.
- Raw roster text clears after parsing and does not persist. Employee labels are session-local and row IDs never render.
- `EvidenceStatus` and interpretation claim status remain separate.
- Observed precedent and founder-approved reusable rule remain separate.
- `repeatabilityStatus: unanswered` cannot become reusable policy copy.
- Changing an explanation or evidence status invalidates dependent interpretations, repeat calculations, decisions, report copy, and export copy before rerender.
- The synthetic demo and facilitator operational surface have different exposure and access contracts.
- Task 9 remains blocked on real human comprehension evidence even though automated checks pass.

## Forbidden Literal Transfers

- Do not copy Constitution prose into the Adapter, root work guide, tests, or product copy.
- Do not copy HR Prism screen flow, Matrix, scenario cards, roadmap, glossary, benchmark formula, or exact corrected labels.
- Do not copy the Prism Adapter's product rules into PaySim.
- Do not turn casebook UI implementations into shared components before PaySim evidence requires them.
- Do not copy PaySim Delivery Contract, claim states, privacy rules, or fixture values back into the common casebook.
- Do not import Transition Gap source code or product copy.

## Governance Preflight Artifact

Create:

`docs/hr-paysim/validation/2026-07-12-governance-preflight.md`

The record contains the compact skill-contract block:

- Scope;
- Adapter, Constitution baseline, and product authority;
- applicable `DP-*` IDs;
- checked `CASE-*` IDs;
- product and forbidden-transfer boundaries;
- conflicts or blockers;
- one authorized next-work sentence.

It also records deterministic evidence:

- product worktree and branch;
- upstream branch and current HEAD;
- pinned baseline commit existence;
- Adapter validation command and exit result;
- whether the upstream branch has moved beyond the pin;
- the Task 9 human-gate status.

The Preflight is not a completion certificate for product code and cannot close the human stop gate.

## Verification

The governance phase must run:

```powershell
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git -C "C:\Users\bang0\OneDrive\바탕 화면\transition-gap" cat-file -e 790eb99^{commit}
git -C "C:\Users\bang0\OneDrive\바탕 화면\transition-gap" rev-parse HEAD
git diff --check
```

Because this phase does not modify product code, full product tests are not evidence required to validate the Adapter. Their most recent Task 9 result may be recorded as context but not reused as proof for later implementation.

## Root Work Guide And Legacy Notes

After the Adapter passes deterministic verification, add a concise root `AGENTS.md` that requires future sessions to read the Adapter first and preserve its scope and authority split. The guide references `DP-*` IDs and paths only.

Add minimal authority banners to the two existing PaySim documents only if the current text does not already make their limited authority explicit:

- `final-design-acceptance.md`: historical visual reference, not current runtime UX SSOT;
- `19_sample_output_contract.md`: fixture and detection-output authority, not current screen or copy authority.

These edits remain part of the governance commit and do not rewrite either document.

## Remaining Work Decomposition

The new implementation plan will use these packages.

### G1: Adapter contract

Create the canonical root Adapter from the upstream template, populate the authority map, principle mappings, candidate validation, product rules, forbidden transfers, feedback return path, and verification commands.

### G2: Governance Preflight

Run the skill validator and revision checks, resolve any authority conflict, and write the dated Preflight record. Stop if the upstream files or pinned revision cannot be verified.

### G3: Agent guidance and authority notes

Add the short root guide and only the necessary legacy authority banners. Re-run governance verification and commit governance files separately from Task 9.

### P9-H: Human gate and Task 9 closeout

Collect real de-identified responses from at least two non-HR participants, including one target-adjacent participant. If every participant passes all three comprehension checks, write the evidence record, rerun fresh automated checks, commit Task 9 with the locked message, and request independent review. If review remains unavailable, record that status without self-approval.

### P10-A: Remaining-subject contract

Lock Product Engineer, Platform Engineer, GTM, Designer clean state, subject switching, no duplicate headline pairs, and appendix behavior in focused tests before implementation.

### P10-B: Remaining-subject UI connection

Connect the remaining subjects inside the same four screens, add at most two plain-Korean observations per integrated subject, and preserve all invalidation and copy boundaries.

### P10-C: Task 10 verification

Run focused tests, full project commands, browser QA, and governance postflight. Commit only the Task 10 files.

### P11-A: Route and deployment policy

Implement test-first public-demo versus facilitator route exclusion and the fail-closed deployment gate without browser secrets.

### P11-B: Facilitator preparation and privacy lifecycle

Implement roster preparation, PII checks, raw-input clearing, safe errors, and explicit session clearing with focused tests.

### P11-C: Dual-surface verification

Verify public and facilitator builds independently, including direct route exposure and `noindex`, then run governance postflight and commit.

### P12-A: Runtime convergence

Verify branch lineage, route all supported surfaces through one app/provider, and remove obsolete runtime paths only after canonical-import checks pass.

### P12-B: Portfolio evidence

Create methodology, sample founder result, privacy/non-claims, and algorithm/QA documents without claiming an unrun pilot or unpassed human gate.

### P12-C: Final verification and review

Run both build surfaces, all automated checks, browser QA, governance postflight, and final code review before integration.

## Error And Stop Conditions

Stop governance implementation when:

- the upstream revision or declared files cannot be verified;
- canonical and legacy sources conflict and the authority map does not resolve the conflict;
- a candidate would be promoted to `LOCKED` without a separate governance decision;
- the work would modify another repository;
- product changes become necessary while scope remains `GOVERNANCE_ONLY`.

Stop product progression when:

- Task 9 human evidence is missing or fails;
- dependency invalidation, claim destination, privacy, route exposure, or session clearing fails;
- a later task relies on stale automated results;
- review or deployment evidence is described more strongly than actually observed.

## Commit Boundaries

1. Commit this design by itself.
2. Commit G1 through G3 governance artifacts separately from Task 9 implementation.
3. Do not commit Task 9 until its real human gate passes.
4. Commit Tasks 10, 11, and 12 independently after their own verification and postflight.
5. Never stage unrelated dirty-worktree files.

## Success Criteria

- Exactly one PaySim Adapter exists at the skill-contract path.
- The Adapter pins upstream commit `790eb99` and references rather than copies common governance.
- The governance validator exits successfully.
- The Preflight names the open Task 9 human gate and does not overstate completion.
- The revised plan has bounded packages for Task 9 closeout and Tasks 10 through 12.
- Product code is untouched during the governance phase.
- Every later product task can show both product verification and a governance postflight without changing upstream governance.
