# HR PaySim Work Guide

## Required read order

1. Read `docs/diagnostic-product-adapter.md` completely.
2. Resolve and read the Constitution and casebook paths declared by the Adapter.
3. Read `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`.
4. Read the approved plan for the current work package.

## Scope

- Classify each request as `GOVERNANCE_ONLY`, `PRODUCT_IMPLEMENTATION`, or `REVIEW_ONLY` before editing.
- Governance-only work must not modify product code, product tests, shared governance, or HR Prism.
- Product work must remain inside the explicitly approved task package.

## Authority

- Shared `DP-*` text belongs only to the upstream Constitution pinned by the Adapter.
- PaySim product rules belong to the current four-screen design and product contracts.
- `docs/hr-paysim/19_sample_output_contract.md` owns synthetic fixture and expected detector output, not current screen structure or founder copy.
- `docs/hr-paysim/final-design-acceptance.md` is legacy visual reference, not current runtime authority.
- Important founder-facing conclusion, state, non-claim, and action copy belongs in `src/lib/hr-paysim/copy/founderCopy.ts`.

## Verification

Run the Adapter commands for every governance preflight or postflight. Run fresh product commands only for authorized product work; stale green output is not completion evidence.

## Stop gates

- Do not self-certify the Task 9 real-participant comprehension gate.
- Do not start a real-roster pilot before the approved P11-B0 privacy and lifecycle package passes.
- Do not promote a `CASE-*` candidate to `LOCKED` or modify upstream governance in this repository.
- Stop on unresolved canonical-versus-legacy conflict, missing evidence, unsafe route exposure, privacy failure, or a required cross-repository change.
