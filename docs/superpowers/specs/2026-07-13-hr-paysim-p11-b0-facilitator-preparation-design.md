# HR PaySim P11-B0 Facilitator Preparation And Pilot Safety Design

## Status

Approved design for the minimum local/private facilitator preparation and session-lifecycle package required before a Product Engineer-only pilot checkpoint.

This design follows the pilot-led sequence in `2026-07-12-hr-paysim-governance-preflight-and-remaining-work-design.md`. It does not authorize Task 10 subject expansion, a public facilitator deployment, or a pilot-evidence claim.

## Goal

Allow a facilitator to paste a deliberately de-identified Product Engineer roster, detect personal-information risk before analysis, confirm the normalized facts used by the engine, and start the existing four-screen decision room without retaining raw input or silently dropping unsafe rows.

The package must make the current Product Engineer vertical slice safe for a local or otherwise private facilitated checkpoint. It must not imply that a market salary, recommended salary, legal risk, employee intent, or reusable company rule has been determined.

## Authority And Governance

- Scope: `PRODUCT_IMPLEMENTATION`
- Adapter: `docs/diagnostic-product-adapter.md`
- Shared baseline: Constitution and casebook at `790eb99`
- Canonical product design: `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`
- Pilot sequence: `docs/superpowers/specs/2026-07-12-hr-paysim-governance-preflight-and-remaining-work-design.md`
- Learning-log boundary: `docs/hr-paysim/21_anonymous_pilot_learning_log_contract.md`
- Applies: `DP-01` through `DP-05`
- Product evidence to preserve: `CASE-10`, `CASE-11`, and `CASE-13`
- `CASE-14` remains `NOT_TESTED`; this package does not promote a casebook candidate.

The conflict order remains latest explicit user instruction, Adapter, current PaySim product design and contracts, approved current plan, reference plans, then legacy material.

## Locked Scope

### In scope

- A dedicated facilitator preparation screen.
- A local/private preparation route and active-session route.
- Product Engineer-only input for the first pilot checkpoint.
- Header-level and value-level personal-information checks.
- Explicit approval before stripping prohibited columns.
- Fail-closed handling for row-level personal information, unsupported roles, and malformed required fields.
- Immediate raw-input clearing after a safe parse and after a personal-information value block.
- A normalized confirmation view using session-local employee labels.
- Building the existing detector, theme, and selection pipeline from confirmed rows.
- Starting and ending the existing in-memory four-screen session.
- Replacing remaining synthetic-only Product Engineer facts in the four-screen view model with current-session values.
- Plain-language confirmation before leaving an active session.
- Fresh automated, browser, governance, and whitespace verification.

### Out of scope

- Platform Engineer, GTM, or Designer connection.
- Task 10 or later subject expansion.
- Public deployment, authentication, provider-level deployment protection, or public-route exclusion.
- Changes to the public demo, indexing policy, marketing, pricing, or onboarding.
- Automatic learning-log capture, persistence, telemetry, or transmission.
- Pilot recruitment, pilot-session execution, or claims about pilot outcomes.
- New detectors, market benchmarks, salary recommendations, or individual pay corrections.
- App-wide visual redesign or changes to the four-screen information architecture.

## Route And Runtime Structure

The local/private facilitator surface uses:

- `/hr-paysim/session/new` for preparation;
- `/hr-paysim/session` for an active four-screen session;
- `/hr-paysim/decision-room-preview` for the unchanged synthetic Task 9 preview.

Both facilitator paths mount one bounded session shell under one `PaySimSessionProvider`. Starting a session changes the path with in-app history replacement rather than a page reload, so normalized session state remains in memory and no roster data enters the URL. Refreshing resets the provider as required by the canonical lifecycle contract.

If `/hr-paysim/session` loads without an active normalized session, it renders a safe no-session state with an action back to preparation. It must not fabricate or reload a prior session.

This package assumes the facilitator surface is run locally or behind an already private environment. Route access and public-build exclusion remain P11 work and must be verified before any externally reachable deployment.

## Component Boundaries

### `FacilitatorPreparationScreen`

Owns only transient interaction state:

- current raw textarea value;
- whether prohibited-column stripping was explicitly approved;
- current safe preparation result;
- whether a normalized confirmation is visible.

It never owns detector findings, reviews, repeats, decisions, reports, or pilot-learning notes.

### Pure preparation model

A pure preparation module turns raw input plus explicit column consent into one of four states:

- `empty`
- `needs_column_consent`
- `blocked`
- `ready_for_confirmation`

The result contains only safe display data: prohibited column names, one-based input line numbers, issue codes, aggregate counts, normalized preview rows, and the validated rows required to start a session. It never contains a rejected cell value, employee name, email, phone number, company name, or original raw input.

### Existing parser

`parseRosterPaste` remains the normalization boundary. P11-B0 may add structured safe issue metadata, but it must not expose rejected values or use a row ID in a user-facing error. Existing internal detector behavior remains separate from preparation copy.

### Session builder

A pure Product Engineer session builder accepts only confirmed normalized rows and performs:

```text
NormalizedRosterRow[]
  -> detectStructuralFindings
  -> buildStructuralThemes
  -> selectReviewSubjects
  -> validated Product Engineer START_SESSION payload
```

It returns a supported session only when a Product Engineer review subject has a headline comparison, factual gap, and the tenure values required by the current evidence screen. Otherwise it returns a safe unsupported-data result and does not enter the four-screen flow.

### Session provider

`PaySimSessionProvider` remains the sole owner of normalized rows and all derived session state after `START_SESSION`. `END_SESSION` clears rows, themes, selection, reviews, interpretations, repeats, decisions, report, and clipboard-affordance state already owned by the screens.

## Preparation Flow

### 1. Input waiting

The screen tells the facilitator to paste Product Engineer rows only. It lists the supported fields and states that raw text is held only while the input is being checked. The primary action names the check, not a destination.

### 2. Prohibited-column consent

When a prohibited header such as name or email is found:

- show only the prohibited column names;
- do not echo any value from those columns;
- do not analyze rows yet;
- offer one explicit action to remove those columns and continue;
- treat the approval as applying only to the current paste.

After approval, the parser re-runs with stripping enabled. Changing the textarea resets the approval.

### 3. Blocked input

The whole start action is blocked when any row contains a personal-information-like value, any row is outside Product Engineer, or a required field is malformed or missing.

- Never continue with a partial subset.
- Never describe the omitted row as safely analyzed.
- Show only one-based input line numbers and issue types.
- Never render row IDs or rejected values in the message.
- Clear raw input immediately when a personal-information-like value is detected.
- Require correction in the source and a new paste.

Non-sensitive format errors may leave the de-identified draft available for correction, but they still block normalization confirmation and session start.

### 4. Normalized confirmation

After a safe all-or-nothing parse, clear raw input immediately and show only:

- session-local employee label (`직원 A`, `직원 B`, and so on);
- Product Engineer role;
- base salary with unit;
- tenure months;
- title or level when present;
- whether an approved documented exception field is present.

Manager/team raw labels and system row IDs do not render. The facilitator must explicitly choose `확인한 자료로 세션 시작` before any detector or four-screen output appears.

## Four-Screen Real-Input Safety

The current Product Engineer view model already derives the headline comparison from session state, but several supporting sentences still contain synthetic fixture counts, tenure, salary, and exception amounts. P11-B0 must remove that synthetic coupling from facilitated mode.

Rules:

- Employee counts, salaries, tenure values, headline gaps, repeat amounts, and comparison counts come from current state.
- The synthetic preview keeps its visible sample label; facilitated mode does not render that label.
- No sentence may retain fixed `16`, `6`, `64`, `14`, `6,800`, `9,500`, `2,700`, or `700` facts unless the current session actually derives them.
- Missing repeat, evidence, or decision state renders a pending/non-claim state rather than a demo result.
- A real roster never receives the prefilled synthetic review, claim, repeat, decision, or report.
- The same four screens, copy order, state invalidation, and calculation semantics remain in force.

## Privacy And Lifecycle

- Raw input is never placed in the provider, reducer, URL, localStorage, sessionStorage, telemetry, network requests, or exported output.
- Normalized rows and session state remain in memory only.
- PII findings never echo the detected value.
- Explicit session end clears all in-memory product state and returns to preparation.
- Refresh clears the session.
- Reload, close, or navigation away from an active session presents a plain-language browser confirmation where the platform permits it.
- Copy/print remains explicit and report-derived.
- The app does not ask for or store pilot-learning consent in P11-B0.
- Learning notes remain separate, manual, pseudonymous, and consented outside the app.

## Error Handling

- Empty input: explain the required Product Engineer paste and keep start disabled.
- Prohibited columns: require explicit strip consent.
- Row-level PII: clear raw input, show safe line numbers and issue type, and require a new paste.
- Unsupported role: block the whole paste and identify safe line numbers only.
- Missing required field: block the whole paste without inventing defaults.
- No supported Product Engineer theme/headline pair: keep the normalized preview but explain that the current pilot flow cannot support a comparison from these rows.
- Missing tenure for the headline pair: do not enter Screen 2 because the current chart contract requires tenure.
- Direct `/session` load without state: show the no-session state and preparation action.
- Earlier answer changes and explicit session end retain the existing invalidation and clearing contracts.

## Testing Strategy

Use test-driven development. Every behavior begins with a focused failing test.

### Parser and preparation model

- empty input;
- clean Product Engineer paste;
- prohibited header requires consent;
- confirmed header stripping excludes the prohibited values;
- row-level email, phone, resident ID, or PII text blocks the entire input;
- errors contain line numbers and codes but no row IDs or rejected values;
- non-Product Engineer rows block the whole input;
- missing required fields block the whole input;
- safe parse produces confirmation rows and no raw text;
- unsupported theme/headline/tenure produces a non-startable result.

### Component and state ownership

- raw textarea clears after safe parse;
- raw textarea clears after row-level PII block;
- changing the paste resets column consent;
- the screen cannot dispatch `START_SESSION` before confirmation;
- confirmation dispatches only cloned normalized rows/themes/selection;
- no preparation/session module exposes storage, URL-state payloads, telemetry, or network emission;
- direct active-session route without provider state fails closed;
- actual session mode hides the synthetic label;
- explicit end clears the provider and returns to preparation.

### Real-input copy

- current row count, salaries, tenure, and headline gap drive every facilitated factual sentence;
- fixture-only numbers do not leak into a different real-input session;
- supported calculations remain deterministic;
- missing repeat/decision state stays pending and non-claim;
- existing synthetic Task 9 preview remains unchanged.

### Browser QA

At desktop and mobile viewports verify:

- preparation gaze order and single primary action;
- column-consent and blocked states;
- values and row IDs never appear in safe errors;
- normalized confirmation is readable without horizontal overflow;
- starting the session reaches the four existing screens without a reload;
- facilitated mode has no sample label;
- refresh/no-session and explicit-end behavior;
- zero browser storage keys and no roster data in the URL;
- keyboard completion, focus movement, and console cleanliness.

## Verification

Fresh final-state verification must run:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

Focused RED/GREEN commands must also be recorded in the implementation plan. Prior Task 9 verification is not completion evidence for P11-B0.

## Commit Boundaries

1. Commit this design document by itself.
2. Commit the implementation plan by itself.
3. Implement P11-B0 as a separate product commit after fresh verification.
4. Never include pilot notes, raw roster data, local paths, governance links, Task 10 files, or unrelated worktree changes.
5. Stop after P11-B0 review. PILOT-1 execution and any later Task 10 scope require their own evidence and authorization.

## Success Criteria

- A facilitator can safely prepare a Product Engineer-only roster without raw-input persistence.
- Prohibited columns require explicit stripping consent.
- Any row-level PII or unsupported row blocks the entire session start.
- Errors reveal no rejected values or system row IDs.
- The facilitator confirms normalized facts before analysis.
- Real input, not synthetic constants, drives the four-screen factual copy.
- Unsupported input fails closed without an invented conclusion.
- The session remains in memory, warns on leaving, and clears explicitly.
- The Task 9 synthetic preview and four-screen flow do not regress.
- No public deployment, learning-log storage, or Task 10 expansion enters the package.
