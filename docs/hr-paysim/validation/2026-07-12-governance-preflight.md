# HR PaySim Governance Preflight — 2026-07-12

Governance Preflight
- Scope: `GOVERNANCE_ONLY`
- Authority: `docs/diagnostic-product-adapter.md`; `transition-gap@790eb99`; `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`
- Applies: `DP-01`, `DP-02`, `DP-03`, `DP-04`, `DP-05`
- Cases to check: `CASE-01`–`CASE-14`; confirmed evidence is named in the Adapter
- Product boundaries: facilitated compensation explainability; no individual salary recommendation; in-memory roster lifecycle; observed precedent is not approved policy; pilot learning stays manual and consented
- Conflicts/blockers: Task 9 real-participant comprehension gate remains open; it is not a governance blocker and cannot be self-certified
- Authorized next work: finish G3 guidance while P9-H participant recruitment proceeds independently; do not start product implementation under this scope

## Revision evidence

- Upstream repository: `transition-gap`
- Branch observed: `codex/diagnostic-product-governance`
- HEAD observed: `790eb99ea783603af2a601794e1ccc3a90b1f967`
- Pinned baseline: `790eb99`
- Branch drift beyond pin: none
- Local resolution source: environment variable or ignored local config; absolute path intentionally not recorded

## Verification evidence

- `node --test tests/governance/diagnostic-governance-resolver.test.mjs`: pass, 4 tests
- `node scripts/verify-diagnostic-governance.mjs`: pass, repository and pin verified without path output
- installed `verify_diagnostic_governance.py --project-root .`: pass
- `git diff --check`: pass

## Product gate status

- Task 9 automated checks were previously green but are not reused as current product-completion evidence.
- Task 9 implementation remains uncommitted until at least two real participants pass the five-second comprehension gate, including one target-adjacent participant.
- P11-B0 and PILOT-1 remain outside `GOVERNANCE_ONLY` and require their approved product plan.
