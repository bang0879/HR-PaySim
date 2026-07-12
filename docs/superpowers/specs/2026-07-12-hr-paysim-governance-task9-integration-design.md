# HR PaySim Governance And Task 9 Integration Design

## Status

Approved integration design for finishing the existing Product Engineer Task 9 vertical slice and then connecting the shared diagnostic-product governance work to HR PaySim as a separate, non-blocking change.

This design does not change the shared Constitution, the shared casebook, HR Prism production code, or the approved four-screen HR PaySim product design. It defines the PaySim-local connection layer and the order in which Task 9 may be completed.

## Goal

Preserve the verified Task 1-8 implementation and the current uncommitted Task 9 work, finish Screen 2 so non-HR participants can understand the comparison, the observed pay difference, and the requested founder action within five seconds, and add a traceable PaySim-local governance connection without delaying the human comprehension test.

Task 10 remains out of scope until Task 9 passes the human comprehension gate, is committed independently, and receives an independent code review.

## Ownership Boundary

### Shared governance session owns

- the diagnostic-product Constitution;
- the before/after casebook;
- the Prism Adapter;
- the personal `diagnostic-product-governance` skill;
- common governance validation behavior.

### This PaySim session owns

- the PaySim Adapter;
- a short root work guide for future agents;
- the PaySim document authority map;
- the current Product Engineer Task 9 UI and its tests;
- PaySim-local verification and the Task 9 human stop gate.

### This PaySim session must not modify

- shared Constitution or casebook content;
- HR Prism code or product documents;
- shared principle classifications;
- Task 10 or later product scope;
- Task 8 session ownership, invalidation, or runtime-validation commits.

## Sequencing Principle

The PaySim Adapter is documentation of product-governance alignment, not a functional dependency of Task 9. The approved four-screen design, `FOUNDER_COPY`, Task 8 state contract, and existing Task 9 tests already define the behavior required to finish Screen 2.

The execution order is therefore:

1. finish the Task 9 Screen 2 hierarchy and copy;
2. run fresh automated verification;
3. pass the multi-participant human comprehension gate;
4. commit and independently review Task 9;
5. create the thin PaySim governance artifacts as a separate scoped change only after the shared governance schema has a stable verified revision;
6. request approval before Task 10.

An unstable upstream governance schema must not block Task 9 or cause PaySim to invent a competing Adapter format.

## Source-Of-Truth Model

PaySim must reference shared governance rather than copy it.

| Concern | Authority |
|---|---|
| Shared locked principles | Upstream diagnostic-product Constitution |
| Reusable before/after evidence | Upstream diagnostic before/after casebook |
| How shared principles apply to PaySim | PaySim Adapter |
| Current founder-facing runtime and copy order | `2026-07-11-hr-paysim-facilitated-decision-room-design.md` |
| Task sequence and verification gates | `2026-07-11-hr-paysim-facilitated-decision-room-implementation-plan.md` plus this integration design |
| Synthetic roster, fixture values, and expected detection output | `19_sample_output_contract.md` |
| Historical eight-step visual reference | `final-design-acceptance.md`, legacy reference only |
| Important founder-facing conclusion, state, non-claim, and action copy | `src/lib/hr-paysim/copy/founderCopy.ts` |

The Adapter records the upstream location and verified revision. It links to principle and case IDs but does not restate their prose.

## PaySim-Local Governance Artifacts

These artifacts are intentionally thin and non-blocking. They must not expand into a second Constitution, a second casebook, a new common UI package, or a large validation framework before the first product pilot.

### 1. PaySim Adapter

Create `docs/hr-paysim/diagnostic-product-adapter.md` using the schema established by the shared governance work.

It must record:

- the upstream repository, Constitution path, casebook path, and exact verified commit SHA;
- the date and method used to verify that commit;
- whether the upstream branch has moved beyond the pinned SHA at the time of the next manual audit;
- the PaySim product definition and facilitated operating mode;
- the PaySim application point for each locked principle;
- relevant case status as `CONFIRMED`, `ADAPTED`, `REJECTED`, or `NOT_TESTED`;
- PaySim-only contracts for compensation evidence, claim status, privacy, session lifecycle, and human review;
- the authoritative and legacy scope of existing PaySim documents;
- candidates that may later be returned to shared governance, without promoting them locally.

### 2. Root Work Guide

Create a short root `AGENTS.md` that tells future agents to:

1. read the PaySim Adapter first;
2. resolve and read the shared sources named by the Adapter;
3. read the current PaySim UX SSOT and implementation plan;
4. preserve the authority split between the four-screen design, fixture contract, and legacy eight-step design;
5. keep governance-only sessions from editing production code;
6. run the required PaySim verification commands;
7. honor the Task 9 human stop gate and the Task 10 approval gate.

The work guide references principles by ID and does not duplicate their wording.

### 3. Document Authority Notes

Add concise authority notes to the two legacy documents only where necessary:

- `final-design-acceptance.md`: visual and historical reference; not the current runtime UX authority;
- `19_sample_output_contract.md`: authoritative for the synthetic roster, fixture values, and expected detection output; not authoritative for the current founder-facing screen structure or copy.

Do not rewrite either legacy document.

## Task 9 Screen 2 Design

### Reading order

Screen 2 must read in this order:

1. short conclusion title;
2. one supporting explanation;
3. immediately visible comparison and maximum difference;
4. compact visual evidence;
5. one concrete founder question;
6. an inline evidence-status follow-up after an explanation is selected;
7. one primary next action after the evidence.

### Above-the-fold requirement

At 1280 x 720, the first viewport must make these three facts visible without interpretation:

- long-tenured Product Engineers are compared with recent hires;
- the maximum observed annual salary difference is 27 million won;
- the founder must select the closest reason for the difference and then identify whether supporting evidence exists.

The 27 million won amount must be derived from the current Product Engineer theme's computed `headlineGapKRW` and formatted for display. It must not be stored as a second hard-coded conclusion literal in the view model or component.

### Copy hierarchy

The current long conclusion becomes:

- a title containing the compared groups and maximum difference;
- supporting copy containing group sizes, salary ranges, and the bounded non-claim about what the current records cannot establish;
- an action question that names the required founder response.

Important conclusion, state, non-claim, and action copy must resolve through `FOUNDER_COPY`. Structural labels may remain local only when they are not duplicated product conclusions or actions.

### Visual simplification

- Reduce nested card borders and decorative containers.
- Use whitespace, typography, and alignment before adding new color or decoration.
- Keep the salary comparison and 27 million won difference visually dominant.
- Keep evidence and question blocks distinct without presenting seven detector-like cards.
- Preserve the natural downward gaze path and place the primary action after the decision content.

This is Task 9 information-hierarchy work, not final brand polish.

## State And Data Behavior

The Screen 2 changes must preserve the Task 8 state contract.

- Changing the explanation or `EvidenceStatus` immediately removes dependent interpretation claims, repeat results, decisions, result copy, and export copy.
- Observed hiring precedent remains distinct from a founder-approved reusable company rule.
- `repeatabilityStatus: unanswered` must never render as an approved reusable rule.
- Internal row IDs and detector terms must never reach founder-facing output.
- Copy, print, and explicit session end must remain connected to live session state.
- The report remains derived from structured reviewed state and is not stored as an independent prose block.

## Verification Design

### Focused checks

- title/supporting-copy/action hierarchy;
- `FOUNDER_COPY` resolution and forbidden-copy scanning;
- exactly four screens and three primary actions to the synthetic result;
- dependency invalidation after explanation or evidence changes;
- observed precedent versus approved rule wording;
- no row IDs or internal detector language;
- copy, print, and explicit session end behavior.

### Browser QA

Run `scripts/qa-decision-room.mjs` at:

- 1280 x 720;
- 1440 x 900;
- 390 px mobile width.

The 390 px check is a non-breaking reflow check, not a promise of full mobile feature parity for the facilitated v1 surface.

Verify:

- no horizontal overflow;
- no evidence/CTA overlap;
- focus moves to the conclusion after top-level transitions;
- keyboard completion works;
- copy success feedback is visible;
- invalidated output disappears before any recalculation;
- the console remains clean.

### Full project commands

Run and read fresh output from:

```text
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
```

Previous passing results are not completion evidence.

## Human STOP GATE

Before committing Task 9, show the revised Screen 2 to at least two non-HR participants for five seconds each without explanation. At least one participant must be reasonably close to the target audience, such as a growth-stage founder or operator.

Every participant must be able to state:

1. what two groups are being compared;
2. what annual salary difference was observed;
3. what the founder must now explain or choose.

Record each participant's actual wording and relevant target proximity. Do not self-certify the gate. If any participant cannot answer any item clearly, keep Task 9 uncommitted, revise Screen 2, and repeat automated verification before running the full human check again.

## Commit And Review Boundaries

1. Commit this approved integration design independently.
2. Finish Task 9 without staging unrelated files.
3. Run all automated checks and the multi-participant human gate.
4. Do not commit Task 9 before the human gate passes.
5. After the gate passes, commit only the Task 9 files with:

   `feat: build Product Engineer decision-room slice`

6. Request an independent code review of the Task 9 commit.
7. When the upstream governance schema has a stable verified commit SHA, implement and verify the thin PaySim-local governance artifacts as their own scoped change and commit.
8. The governance change is not a prerequisite for Task 9 completion or the Task 10 approval decision.
9. Stop and ask for approval before starting Task 10.

## Failure Handling

- If the upstream governance schema is still changing, defer the PaySim Adapter, report the unstable revision, and continue Task 9 rather than inventing a competing Adapter format.
- If a document authority conflict remains, stop product changes and report the conflict; do not resolve it by copying shared content.
- If automated verification fails, diagnose and fix within Task 9 scope before the human gate.
- If the human gate fails, keep Task 9 uncommitted and iterate only on information hierarchy, copy, and visual clarity.
- If unrelated worktree changes appear, preserve them and stage by exact path.

## Non-Goals

- Task 10 subject expansion;
- shared governance principle promotion;
- HR Prism changes;
- new detector logic;
- market salary estimation;
- public deployment or access-control implementation;
- final visual-brand polish;
- a new shared UI component package;
- a pre-pilot governance framework beyond the thin Adapter, root work guide, and document authority notes.
