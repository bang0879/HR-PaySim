# HR PaySim Multi-role Roster Input Design

**Date:** 2026-07-15

**Status:** Revised after runtime review; pending user approval

**Scope:** Facilitator roster preparation and the confirmed-session boundary

## 1. Purpose

Replace the Product Engineer-only facilitator template with one explicit company-roster format that can carry many jobs and grades without guessing which employees are comparable.

The change must make the downloadable workbook and the on-screen example teach the same format, preserve the existing career-aware comparison rules, and keep personal information and free-form employee narratives out of the application.

## 2. Governance and product boundary

This package follows the PaySim Adapter and the shared diagnostic-product governance baseline.

It may:

- make the required comparison dimensions explicit;
- normalize company-provided job and grade structure;
- show what was accepted before a session starts;
- preserve documented compensation-exception evidence;
- build the existing four-screen session from more than one job group.

It must not:

- infer that two different job names mean the same job;
- infer grade order from grade text;
- compare employees across different normalized jobs;
- create a market benchmark, recommended salary, fairness verdict, or approved company standard;
- request names, employee IDs, email addresses, company names, manager names, or free-form work histories;
- persist, transmit, or place roster contents in URLs or browser storage;
- redesign the four-screen decision room, change detector thresholds, or change the approved screen flow.

## 3. Recommended approach

Use one company-wide workbook with explicit row-level job and grade information.

Each distinct normalized `직무` value becomes a comparison group. `직급 순서` supplies the order inside that job when a formal grade system exists. The application performs deterministic normalization only; it does not perform fuzzy matching or semantic role inference.

This is preferred over:

1. one workbook per job, which is safe but creates repetitive preparation work; and
2. automatic fuzzy mapping, which can silently compare the wrong employees.

## 4. Canonical input schema

The exact `입력 양식` headers are:

| Header | Meaning | Rule |
|---|---|---|
| `기본연봉(원)` | Current annual base salary | required positive whole won amount |
| `관련 경력년수` | Relevant experience across current and previous employers | required number from 0 through 60; decimals allowed |
| `회사 근속개월` | Completed months at the current company | required whole number from 0 through 720 |
| `직무` | Company-provided comparison job | required non-empty text |
| `직급` | Company-provided grade label | optional only when the entire job has no formal grades |
| `직급 순서` | Ordered grade rank within the job | optional only when the entire job has no formal grades; positive whole number; larger means higher |
| `처우 예외적용 사유` | Controlled evidence category | required controlled value: `없음`, `채용 예외`, `카운터오퍼`, or `기타 문서화된 사유` |

`직함`, `레벨`, `문서화된 예외`, and `카운터오퍼 여부` are removed from the facilitator input contract. Their product meanings are replaced by `직무`, `직급`, `직급 순서`, and the single controlled exception-reason field.

### 4.1 Grade completeness

A job group is in one of two valid states:

- **No formal grade structure:** every row in that job leaves both `직급` and `직급 순서` blank.
- **Complete formal grade structure:** every row in that job supplies both fields, and every repeated grade label maps to exactly one rank.

A partially populated or contradictory job mapping is blocked before session start. The application never sorts grade labels lexically and never invents missing ranks.

This intake block is intentional even though the engine retains a `partial` ordered-level policy. The engine-level `partial` path remains covered as defense in depth and continues to produce no career-comparison pairs; facilitator input does not rely on that degradation path to start a session.

### 4.2 Canonical value conversion

- `관련 경력년수` is converted to `relevantExperienceMonths` with `Math.round(years * 12)`. For example, `2.5` years becomes `30` months. This existing conversion and rounding rule remains locked by tests.
- A no-grade job produces neither `levelLabel` nor `levelRank`; blank grade cells become `undefined`, never the synthetic-fixture sentinel `"none"`.
- A complete-grade job maps `직급` to `levelLabel` and `직급 순서` to `levelRank`.

## 5. Deterministic job mapping

The adapter creates an internal comparison key by:

1. trimming outer whitespace;
2. applying Unicode NFKC normalization;
3. collapsing repeated internal whitespace; and
4. comparing Latin case without distinction.

The first accepted spelling is retained as the display label. This normalization may combine superficial variants such as `Product  Engineer` and `product engineer`; it must not combine semantic variants such as `Product Engineer`, `Software Engineer`, and `프로덕트 엔지니어`.

If a company uses multiple names for one intended comparison group, the facilitator standardizes those names in the workbook before upload. A separate synonym-management product is outside this package.

## 6. Compensation-exception migration

The current boolean fields cannot simply be deleted because `counterOfferFlag` and `exceptionFlag` are used when identifying an observed premium precedent.

The adapter maps the new controlled value into the existing canonical evidence flags at the boundary:

| Input value | `exceptionFlag` | `counterOfferFlag` |
|---|---:|---:|
| `없음` | false | false |
| `채용 예외` | true | false |
| `카운터오퍼` | false | true |
| `기타 문서화된 사유` | true | false |

This preserves current observed-precedent behavior while presenting one comprehensible input field. The input does not accept free-form exception text because that text may contain employee or company identifiers and is not required by the calculation.

The original controlled category is also carried in `PreparationPreviewRow` as a preparation-only field. It is not reconstructed from the two booleans. Confirmation therefore displays the exact accepted category while the canonical engine continues to receive only the established evidence flags.

## 7. Downloadable workbook

The workbook contains two visible sheets.

### 7.1 `작성 예시`

This is the first sheet and contains:

- the same seven headers shown on the preparation screen;
- the same synthetic example rows and values shown on the preparation screen;
- short field definitions and allowed values;
- an explicit statement that the rows are format examples, not market data or salary standards.

The importer never analyzes this sheet.

### 7.2 `입력 양식`

This sheet contains:

- the exact seven headers;
- blank formatted input rows;
- numeric validation for salary, experience, tenure, and grade rank;
- a controlled list for `처우 예외적용 사유`;
- frozen headers and readable column widths.

The workbook reader selects `입력 양식` explicitly even when `작성 예시` is non-empty. Uploading a workbook without exactly one usable `입력 양식` remains fail-closed.

The example workbook and the on-screen table share one canonical example-data source or are covered by a parity test so their headers and values cannot drift.

## 8. Preparation-screen experience

The preparation screen:

- describes one company-wide roster instead of Product Engineer-only rows;
- lists `기본연봉(원)`, `관련 경력년수`, `회사 근속개월`, and `직무` as required;
- explains the two valid grade states;
- presents `처우 예외적용 사유` as a controlled category, not a judgment;
- renders the same example table that appears in `작성 예시`;
- keeps workbook upload as the primary path and paste as a secondary fallback;
- updates the paste placeholder and validation labels to the seven exact headers;
- continues to clear raw input after validation and before session start.

The confirmation table shows only session-safe facts:

- generated employee label;
- job;
- grade and grade order when present;
- base salary;
- relevant experience;
- company tenure; and
- controlled compensation-exception category.

Preparation labels are scoped within each job and do not reserve `직원 A` and `직원 B` based on the first selected subject. The confirmation table groups rows by job and uses neutral job-local session labels. Headline `직원 A` and `직원 B` labels are created later, independently for each active review subject.

The confirmation surface does not echo file names, sheet names, rejected raw values, or free-form content.

## 9. Multi-role runtime convergence

The adapter assigns each accepted row its normalized job as `roleGroup` and its grade order as `levelRank`.

The package removes the Product Engineer-only contract from the complete facilitator path:

- `koreanRosterAdapter` derives `roleGroup` from `직무` instead of assigning `"Product Engineer"`;
- `PreparationPreviewRow.roleGroup` becomes `string`;
- Product Engineer-named preparation result, draft, reader, and builder contracts become role-agnostic facilitator-roster contracts;
- the unsupported-comparison issue becomes a generic no-supported-review-subject issue;
- the draft builder accepts selected role-agnostic themes and never searches for a literal `"Product Engineer"` theme;
- session start succeeds when at least one selected theme has the headline pair, headline amount, relevant-career evidence, and tenure evidence required by the current four-screen contract.

The session builder reuses the current pipeline:

```text
confirmed normalized rows
  -> structural findings grouped by roleGroup
  -> structural themes
  -> facilitator cross-job review-subject selection
  -> current four-screen session draft
```

Rows from different jobs never enter the same comparison. Existing career-dominance formulas, materiality thresholds, review state, and four-screen navigation remain unchanged.

Small job groups that produce no supported finding are not malformed data. They remain visible in the confirmation summary as accepted but not selected for review. Session start is blocked only when no accepted job produces a supported review subject.

### 9.1 Role-agnostic decision-room view model

Changing the draft builder alone is insufficient. The current remaining-subject view model calls the Product Engineer view model as a template, and several visualization, rule, result, and next-action branches still select behavior by literal role name.

Facilitated mode derives behavior from the active theme and available evidence:

- the active theme is resolved only from `activeThemeId` and the selected-theme collection;
- rows are filtered to the active theme's `roleGroup` before labels, charts, copy, or repeat evidence are derived;
- career evidence is selected for tenure/career archetypes;
- ordered-level evidence is selected for `level_integrity` themes with complete ranks;
- observed-precedent repeat is offered only when canonical observed-precedent evidence exists and the reviewed explanation permits it;
- generic founder copy receives the active role label as data and does not fall back to Product Engineer, Platform Engineer, or GTM literals;
- demo-only fixture branches and demo copy may keep their named role literals, but facilitator mode must not depend on them.

The role-agnostic builder and view model are one acceptance boundary: a roster containing no job named `Product Engineer` must still open and complete the four-screen session when it contains a supported theme.

### 9.2 Ordered-level activation effect

The current facilitator import never supplies `levelRank`. Imported career comparisons therefore run under the engine's `none` ordered-level policy, and level-integrity findings cannot be created from imported data.

A complete company grade mapping changes observable output even though detector thresholds remain unchanged:

- `level_fiction_band_overlap` and its `level_integrity` theme become eligible for real imported data;
- `buildMaterialCareerPairs` applies the ordered-level dominance condition, so some pay-inversion or loyalty-tax pairs that existed without ranks may be suppressed or reprioritized;
- selected themes, chart type, and subject order may consequently change.

The design does not claim output equivalence. It preserves formulas and thresholds while explicitly activating structured-grade evidence. One complete-grade multi-role regression fixture locks raw findings, visible themes, selected subjects, headline pairs, and non-selected jobs. A paired no-grade fixture proves the expected difference.

### 9.3 Label scope

Decision-room employee labels are subject-local:

- the active subject's headline pair is always `직원 A` and `직원 B`;
- all remaining labels are generated only from rows in that same job;
- switching subjects recalculates labels inside the newly active job;
- labels support an unbounded deterministic sequence rather than mixing `C` through `H` with numeric labels after eight employees.

No copy for one active job may reuse labels derived from another job's headline pair. Preparation confirmation uses separate neutral job-local labels and does not imply which pair will be selected.

### 9.4 Cross-job subject selection

The four-screen contract retains a maximum of three visible review subjects, but facilitator selection is diversity-first:

1. choose the highest-priority supported theme within each job;
2. rank those job representatives with the existing data-status, pattern, normalized-gap, and pair-count criteria;
3. select at most the top three distinct jobs;
4. retain every other supported theme and job as explicitly unselected review material.

One job cannot occupy all three visible subject slots. The most material representative job is always included. When fewer than three jobs have supported themes, the session shows fewer than three subjects rather than adding a second subject from the same job. The existing synthetic demo selection remains separately regression-locked.

## 10. Validation and failure behavior

The package remains all-or-nothing for malformed or unsafe input:

- missing, duplicated, or aliased required headers block;
- prohibited extra columns require explicit stripping consent;
- personal-information-like values block and clear raw input;
- invalid numeric or controlled-category values block by safe source-row number;
- missing job values block;
- partial or contradictory grade mapping blocks with a safe job-level mapping issue;
- formula cells, unreadable workbooks, ambiguous workbook structure, unsupported files, and oversized files remain blocked;
- fewer than four accepted rows across the workbook remains blocked;
- zero supported review subjects remains blocked without claiming the roster is fair or correct.

Tests keep the engine's `partial` ordered-level policy alive even though facilitator intake blocks partial mappings. This preserves a safe result for normalized rows created by fixtures or future adapters and prevents accidental deletion of the engine defense.

## 11. Copy and claim discipline

Copy follows the existing HR Prism/diagnostic governance pattern:

- state what is being compared before presenting a finding;
- distinguish company-provided facts from application-derived comparisons;
- call `직급 순서` an ordering input, not an evaluation of employee seniority or capability;
- call `처우 예외적용 사유` documented evidence, not approval or justification;
- state that the synthetic examples are format examples only;
- retain the existing non-claim that results are not market salary, individual recommendations, legal conclusions, or performance judgments.

## 12. Test-driven implementation boundary

Implementation begins with failing tests for:

1. a role-agnostic draft and four-screen session with no `Product Engineer` job;
2. exact seven-column headers and parsing;
3. deterministic job normalization without semantic guessing;
4. `2.5` years becoming `30` relevant-experience months under the preserved rounding rule;
5. no-grade rows producing undefined label/rank and no level-integrity finding;
6. complete-grade, partial-grade, and contradictory-grade states;
7. the engine `partial` policy remaining covered while facilitator partial input blocks;
8. controlled exception-reason mapping, exact preview-category display, and preservation of observed precedent behavior;
9. a complete-grade multi-role regression snapshot locking newly eligible and suppressed findings;
10. multiple jobs producing isolated findings and at most three distinct-job subjects;
11. the most material job being selected and one job never occupying multiple visible slots;
12. subject-local employee labels across role switching and more than eight employees;
13. small unsupported jobs remaining accepted but unselected;
14. workbook sheet selection and example/input-sheet separation;
15. on-screen/workbook example parity;
16. safe error copy and no raw-value emission;
17. the facilitator literal/type sweep and generic copy formatting;
18. existing privacy, lifecycle, demo, decision-room, and governance regressions.

The facilitator literal/type sweep covers the preparation adapter, preparation result and preview types, workbook reader, preparation screen, session app boundary, decision-room view model, founder-copy preparation keys and generic formatters, privacy verifier manifests, and affected fixtures/tests. Demo contracts and synthetic role-specific fixtures remain named where their role identity is intentional.

The implementation must finish with fresh lint, tests, typecheck, public and facilitator builds, decision-room QA, route/privacy verifiers, diagnostic-governance verification, and `git diff --check`.

## 13. Acceptance criteria

- A facilitator can upload one de-identified workbook containing dozens of jobs and company grades.
- The application compares only employees with the same normalized job.
- A supported roster with no job named `Product Engineer` opens and completes the current four-screen session.
- Formal grade order is company-provided and never inferred from text.
- Complete grade input explicitly activates level-integrity evidence and may constrain career-comparison pairs; the locked multi-role fixture proves the resulting output.
- The downloadable workbook contains the same synthetic writing example shown on screen.
- Example rows are never analyzed as employee data.
- `카운터오퍼 여부` is removed from the visible schema without losing counteroffer precedent evidence.
- Confirmation preserves the exact controlled exception category without adding that category to the canonical calculation model.
- Visible subjects represent at most three distinct jobs, with the most material representative job included.
- Employee A/B labels always refer to the active subject's own headline pair.
- The existing formulas, detector thresholds, review-state behavior, privacy lifecycle, and four-screen flow remain unchanged.
