# HR PaySim Sample Output Contract

> **Authority:** `PRODUCT-SPECIFIC` for the synthetic roster, fixture values, and expected detection output. It is not the authority for the current four-screen structure or founder-facing copy.

## Status

This is a Phase 0.1 contract. It defines the expected synthetic output before parser, detector, memo, session, route, or UI work starts.

This document is the source of truth for the first synthetic fixture and expected detector output. Implementation should not invent a different sample roster unless Kyle approves a new contract.

## Sample Company Story

Use this story for `/hr-paysim/demo` and facilitated sample-first walkthroughs:

> A 42-person Series A B2B SaaS company. The founder still directly approves offers and exception raises. There is no formal salary band. Over the last 12 months, developer hiring pressure created new-hire premiums. Product Engineer, Platform Engineer, Designer, and GTM roles exist. The Product Engineer group should surface shadow band and pay inversion. The Platform Engineer group should surface loyalty tax. Include at least one clean role/group to show the detector does not fabricate issues everywhere.

## Sample Excerpt Rule

The synthetic demo uses a **representative de-identified sample excerpt from a 42-person company**, not a full 42-row roster.

The UI must label the dataset as a sample excerpt unless a full 42-row synthetic roster is later implemented.

This prevents these contradictions:

- story says 42 people but the parsed rows are fewer,
- row count bands are mistaken for the sample row count,
- detector confidence is confused between full-company confidence and excerpt confidence.

For the first vertical slice, use the 16-row excerpt below.

## Demo Route

The first vertical slice should include:

```text
/hr-paysim/demo
```

This route is a synthetic portfolio/demo route only. It is not a cold public conversion funnel.

The route should:

- preload synthetic de-identified rows,
- show the sample story,
- clearly label the data as a representative sample excerpt,
- lead with `shadow_band` when present,
- show at least one comparison pair,
- show one clean group with no major finding,
- end with a founder-facing memo preview.

## Required Aha Ordering

### Entry / Demo

Lead aha:

> 제도가 없다고 구조가 없는 것은 아니다.

Second aha:

> 문제는 높은 연봉이 아니라 설명할 수 없는 관계다.

### Findings

The findings must show specific relationships, not abstract tables.

Each finding card must answer:

1. What relationship is visible?
2. Which rows are involved?
3. Why is this hard for the founder to defend?
4. What might repeat if nothing changes?
5. What decision options are available?

### Comparison / Memo

Memo aha:

> 방치도 하나의 보상 의사결정이다.

Memo conclusion:

> 보상 조정은 돈 문제가 아니라 언어를 복구하는 문제다.

### Follow-Up Hook

Use loyalty tax / early-member drift as the follow-up hook:

> 장기 근속자가 최근 입사자와 비교하는 순간, 오래 남은 것이 손해였다는 신호로 읽힐 수 있습니다.

## Relationship Review Beat Contract

The synthetic demo and facilitated walkthrough should use the Relationship Review Beat as the core interaction.

Sequence:

1. **Context**: Show the finding's relationship or distribution without asking the founder to guess a hidden answer.
2. **Intuition Surfacing**: Ask which explanation basis the founder would naturally reach for.
3. **Evidence Reveal**: Show the roster-based row relationship, salary gap, seniority or distribution basis, and why the relationship may be hard to defend.
4. **Founder Explanation**: Capture structured reason code(s), not raw free text.
5. **Classification**: Use labels specific to the finding type.
6. **Memo Capture**: Add the relationship evidence, classification, reason code, and safe note to the memo preview.

Forbidden mechanics:

- binary "who gets paid more" prediction,
- right/wrong reveal,
- "most founders do not know" copy,
- surprise for its own sake,
- raw quote capture unless explicit quote consent exists.

Allowed intuition prompt pattern:

> 이 관계를 설명한다면 어떤 기준을 먼저 확인하시겠습니까?

## Finding Classification Contract

Relationship findings use this classification set:

```ts
export type RelationshipFindingType =
  | "pay_inversion"
  | "loyalty_tax"
  | "level_fiction_band_overlap";

export type RelationshipFindingClassification =
  | "explained"
  | "explainable_but_undocumented"
  | "fragile"
  | "unanswered";
```

Labels:

- `explained`: the founder has a defensible, documented reason that can be stated without revealing sensitive personal detail.
- `explainable_but_undocumented`: the reason may be legitimate, but the roster/memo evidence lacks documentation or shared language.
- `fragile`: the reason exists but would be weak, inconsistent, too person-specific, or likely to create another comparison problem.
- `unanswered`: Kyle and the founder cannot yet explain the relationship with available context.

Distribution findings use this classification set:

```ts
export type DistributionFindingType = "shadow_band";

export type DistributionFindingClassification =
  | "intentional_but_unnamed"
  | "emerged_unintentionally"
  | "needs_role_language"
  | "not_actionable_yet";
```

Labels:

- `intentional_but_unnamed`: the distribution reflects a real internal principle, but the company has not named it as a band, level, or role language.
- `emerged_unintentionally`: the distribution appears to have formed through ad hoc decisions rather than a deliberate structure.
- `needs_role_language`: the distribution may be useful, but the company needs role, level, or scope language before action.
- `not_actionable_yet`: the pattern is visible but too low-confidence, too sparse, or too context-dependent for a decision.

## Founder Explanation Capture Contract

Founder explanation capture should prefer structured reason codes:

```ts
export type FounderExplanationReasonCode =
  | "performance_difference"
  | "role_scope_difference"
  | "critical_skill_premium"
  | "counteroffer"
  | "new_hire_market_pressure"
  | "founder_exception"
  | "promotion_timing"
  | "data_quality_issue"
  | "unknown";
```

Rules:

- Store reason code(s) first.
- Store a memo-safe note only when needed to make the memo useful.
- A memo-safe note must be a sanitized paraphrase or selected template, not a raw quote.
- Do not store names, emails, company names, employee IDs, exact identifying context, or direct quotes without explicit quote consent.
- Do not persist sensitive raw founder explanation free text in `sessionStorage`.
- If the founder gives a sensitive explanation, Kyle may translate it into a reason code and omit the note.

## Memo Capture Behavior

The founder memo preview should include:

- finding type,
- reviewed relationship or distribution,
- key de-identified row evidence,
- classification label,
- structured reason code(s),
- memo-safe note when available,
- next decision question.

The memo preview should not include:

- employee names,
- emails,
- company names,
- raw roster paste,
- sensitive raw founder explanation,
- direct quote without quote consent,
- market-correct salary claims,
- predicted attrition, productivity, replacement, or legal/tax claims.

## Synthetic Roster Table

This is the representative de-identified sample excerpt from the 42-person company.

| rowId | roleGroup | title | levelLabel | levelRank | baseSalaryKRW | startDate | tenureMonths | exceptionFlag | counterOfferFlag | managerLabel | teamLabel |
|---|---|---|---|---:|---:|---|---:|---|---|---|---|
| row_001 | Product Engineer | Product Engineer | none |  | 68000000 | 2021-03-01 | 64 | false | false | manager_a | team_a |
| row_002 | Product Engineer | Product Engineer | none |  | 72000000 | 2021-11-15 | 56 | false | false | manager_a | team_a |
| row_003 | Product Engineer | Product Engineer | none |  | 76000000 | 2022-07-01 | 48 | false | false | manager_a | team_a |
| row_004 | Product Engineer | Product Engineer | none |  | 95000000 | 2025-05-01 | 14 | true | false | manager_a | team_a |
| row_005 | Product Engineer | Product Engineer | none |  | 90000000 | 2025-01-10 | 18 | false | true | manager_a | team_a |
| row_006 | Product Engineer | Product Engineer | none |  | 88000000 | 2024-09-01 | 22 | false | false | manager_a | team_a |
| row_007 | Platform Engineer | Platform Engineer | none |  | 86000000 | 2020-10-01 | 69 | false | false | manager_b | team_b |
| row_008 | Platform Engineer | Platform Engineer | none |  | 84000000 | 2021-07-15 | 60 | false | false | manager_b | team_b |
| row_009 | Platform Engineer | Platform Engineer | none |  | 102000000 | 2025-02-01 | 17 | true | true | manager_b | team_b |
| row_010 | Platform Engineer | Platform Engineer | none |  | 98000000 | 2024-12-01 | 19 | false | false | manager_b | team_b |
| row_011 | GTM | Account Executive | AE1 | 1 | 61000000 | 2023-06-01 | 37 | false | false | manager_c | team_c |
| row_012 | GTM | Account Executive | AE2 | 2 | 66000000 | 2022-04-01 | 51 | false | false | manager_c | team_c |
| row_013 | GTM | Account Executive | AE1 | 1 | 70000000 | 2025-03-01 | 16 | true | false | manager_c | team_c |
| row_014 | GTM | Account Executive | AE2 | 2 | 69000000 | 2024-01-15 | 30 | false | false | manager_c | team_c |
| row_015 | Designer | Product Designer | none |  | 63000000 | 2022-08-01 | 47 | false | false | manager_d | team_d |
| row_016 | Designer | Product Designer | none |  | 67000000 | 2024-04-01 | 27 | false | false | manager_d | team_d |

## Synthetic Roster Requirements

The sample roster must be de-identified.

Allowed fields:

- rowId
- roleGroup
- title
- levelLabel
- levelRank
- baseSalaryKRW
- startDate
- tenureMonths
- latestRaiseDate
- latestRaiseAmountKRW
- exceptionFlag
- counterOfferFlag
- managerLabel
- teamLabel

Forbidden fields:

- name
- email
- phone
- employeeId
- staffId
- residentId
- address
- companyName
- rawCsv
- rawPaste

## Expected Findings

The first implementation must produce the following expected findings from the synthetic roster excerpt.

Global correction floor note:

- For `pay_inversion` and `loyalty_tax`, `correctionFloorKRW` is the single most-fragile headline pair floor, not a summed group floor.
- For `level_fiction_band_overlap`, `correctionFloorKRW` is the bounded ordinal-restoration floor.
- Other material relationships are represented through `affectedRowIds` and `additionalUnderpaidRowCount`.
- `additionalUnderpaidRowCount` means the number of additional underpaid stronger-claim rows beyond the headline pair, not the number of additional comparison pairs.
- If two candidate headline pairs have the same gap percentage, choose the larger absolute gap; if still tied, choose the lexicographically earliest underpaid rowId and then comparator rowId.

### 1. `shadow_band`

Expected ordering:

- Lead finding in the synthetic demo when present.

Expected scope:

- roleGroup: `Product Engineer`
- affectedRowIds: `row_001`, `row_002`, `row_003`, `row_004`, `row_005`, `row_006`
- expected clusters: `68000000-76000000` and `88000000-95000000`
- cluster gap: `12000000` between `row_003` and `row_006`
- gap basis: adjacent gap is more than 2x the role group's median adjacent salary gap
- confidence: `medium`
- communicationRisk: `high`
- spreadRisk: `high`
- decisionUrgency: `high`
- correctionFloorKRW: omitted by default

Expected lead copy:

> 공식 밴드는 없지만, Product Engineer 안에서는 사실상 두 개의 보상 구간이 이미 생겼습니다.

Expected non-claim copy:

> 이 finding은 밴드를 만들려면 얼마가 필요하다는 계산이 아닙니다. 공식 기준이 없는데 보상 구간이 이미 생겼다는 구조 신호입니다.

### 2. `pay_inversion`

Expected scope:

- roleGroup: `Product Engineer`
- affectedRowIds: `row_001`, `row_002`, `row_003`, `row_004`, `row_005`, `row_006`
- headlinePair: `row_001` vs `row_004`
- lowerPaidStrongerClaimRowId: `row_001`
- higherPaidWeakerClaimRowId: `row_004`
- strongerSeniorityClaimRowId: `row_001`
- higherPaidRowId: `row_004`
- salaryGapKRW: `27000000`
- gapPercentage: `39.7%`
- correctionFloorKRW: `27000000`
- additionalUnderpaidRowCount: `2`
- confidence: `medium`
- communicationRisk: `high`
- spreadRisk: `high`
- decisionUrgency: `high`

Material pair evidence:

- `row_001` sits below newer higher-paid peers `row_004`, `row_005`, and `row_006`.
- `row_002` and `row_003` also sit below newer higher-paid peers.
- `row_001` vs `row_004` is the headline pair because it has the largest material gap percentage.
- Flagged rows remain valid comparators; flags raise spreadRisk and shape the explanation text, but do not exclude rows.

Reason this is hard to defend:

> `row_001` has a much stronger tenure claim in the same role group, but `row_004` earns 27,000,000 KRW more after a recent new-hire premium.

Expected non-claim copy:

> 이 값은 손실 예측이나 권장 연봉이 아닙니다. 현재 비교 관계를 설명 가능하게 만들기 위한 headline pair 기준의 최소 조정 하한입니다.

### 3. `loyalty_tax`

Expected scope:

- roleGroup: `Platform Engineer`
- affectedRowIds: `row_007`, `row_008`, `row_009`, `row_010`
- long-tenure rows: `row_007`, `row_008`
- recent-hire comparison rows: `row_009`, `row_010`
- long-tenure average salary: `85000000`
- recent-hire average salary: `100000000`
- average gap: `15000000`
- headlinePair: `row_008` vs `row_009`
- lowerPaidLongTenureRowId: `row_008`
- higherPaidRecentHireRowId: `row_009`
- salaryGapKRW: `18000000`
- gapPercentage: `21.4%`
- correctionFloorKRW: `18000000`
- additionalUnderpaidRowCount: `1`
- exposurePayrollKRW: `370000000`
- confidence: `medium`
- communicationRisk: `high`
- spreadRisk: `medium`
- decisionUrgency: `medium`

Material pair evidence:

- `row_008` vs `row_009`: 18,000,000 KRW gap, 21.4% of `row_008` base salary.
- `row_007` vs `row_009`: 16,000,000 KRW gap, 18.6% of `row_007` base salary.
- `row_008` vs `row_010`: 14,000,000 KRW gap, 16.7% of `row_008` base salary.
- `row_007` vs `row_010`: 12,000,000 KRW gap, 14.0% of `row_007` base salary.

Flag rule:

- `row_009` has exception/counteroffer flags, but flags do not exclude it as a comparator.
- Flags affect spreadRisk and explanation text only.

Demo lead note:

- Platform Engineer also satisfies `shadow_band` structurally, but the synthetic demo leads this group with `loyalty_tax` for teaching variety.
- Platform shadow band expected clusters: `84000000-86000000` and `98000000-102000000`.
- Platform shadow band cluster gap: `12000000` between `row_007` and `row_010`.
- Platform shadow band exposurePayrollKRW: `370000000`.
- Platform shadow band correctionFloorKRW: omitted by default.
- Fixture tests may assert Platform `shadow_band` set membership, but must not require it to be the lead finding.
- Tests should assert finding set membership and headline-pair values, not auto lead-ranking.

Reason this is hard to defend:

> 장기 근속 Platform Engineer 두 명이 최근 입사자보다 낮은 보상 위치에 있고, 이 차이를 설명할 공식 밴드나 기록된 기준이 없습니다. `row_009`의 premium이 기록되어 있더라도, 비교 순간에는 여전히 관계 설명이 필요합니다.

Expected non-claim copy:

> 이 finding은 오래 근무한 구성원을 모두 최고 연봉에 맞추라는 뜻이 아닙니다. headline pair 기준으로 비교 순간 방어하기 어려운 관계가 있는지를 보여줍니다.

### 4. `level_fiction_band_overlap`

Expected scope:

- roleGroup: `GTM`
- affectedRowIds: `row_012`, `row_013`, `row_014`
- lower level range: AE1 `61000000-70000000`
- higher level range: AE2 `66000000-69000000`
- overlap range: `66000000-69000000`
- comparison pairs: `row_012` vs `row_013`, `row_014` vs `row_013`
- salary gaps: `4000000`, `1000000`
- correctionFloorKRW: `5000000`
- confidence: `medium`
- communicationRisk: `medium`
- spreadRisk: `medium`
- decisionUrgency: `medium`

Reason this is hard to defend:

> AE2 label exists, but an AE1 row sits above both AE2 rows. The level language no longer explains the pay relationship.

Expected non-claim copy:

> 이 finding은 모든 레벨 겹침을 제거하라는 뜻이 아닙니다. 현재 레벨 언어로 설명하기 어려운 비교 관계를 표시합니다.

### 5. Clean / Low-Signal Group

Expected scope:

- roleGroup: `Designer`
- affectedRowIds: none
- expected finding: no major finding
- confidence note: clean group should stay quiet or appear only as a low-signal context note

Reason:

> `row_015` has a stronger tenure claim and lower pay than `row_016`, but the 4,000,000 KRW gap is 6.3% of `row_015` base salary, below the 8% materiality threshold. It should not become a material finding in the sample excerpt.

## Required Sample Groups

### Product Engineer Group

Purpose:

- Lead `shadow_band`.
- Trigger `pay_inversion`.

Expected story:

- No formal salary band.
- Same role group has visible salary clusters.
- A newer Product Engineer receives a new-hire premium.
- A longer-tenured Product Engineer has a stronger seniority claim but lower pay.

Expected finding order in synthetic demo:

1. `shadow_band`
2. `pay_inversion`

### Platform Engineer Group

Purpose:

- Trigger `loyalty_tax`.
- Also structurally satisfies `shadow_band`, but the demo leads with `loyalty_tax`.

Expected story:

- Longer-tenured platform employees sit below newer comparable hires.
- The problem is not that a new hire is high-paid by itself.
- The problem is that the company lacks language to explain why staying longer did not preserve compensation position.

### Designer Group

Purpose:

- Clean or low-signal group.

Expected story:

- Similar-role compensation has no major unexplained gap.
- This proves the detector should not fabricate findings everywhere.

### GTM Group

Purpose:

- Trigger `level_fiction_band_overlap`.

Expected story:

- Level labels exist, but the salary ranges make level language weak.
- The finding should not be framed as a GTM pay recommendation.

## Required Output Artifacts

### Shadow Band Strip

Must show:

- role group,
- row dots by salary,
- visible informal clusters,
- annotation on the salary gap,
- note that formal bands are absent but a structure has emerged.

Required copy:

> 공식 밴드는 없지만, Product Engineer 안에서는 사실상 두 개의 보상 구간이 이미 생겼습니다.

### Comparison Pair Card

Must show:

- lower-paid stronger-claim row,
- higher-paid weaker-claim row,
- salary gap,
- seniority claim basis,
- one-sentence defensibility issue.

Required copy:

> 문제는 row_004가 높다는 사실이 아니라, row_001과 비교했을 때 대표가 같은 기준으로 설명하기 어렵다는 점입니다.

### Role Ladder

Must show:

- role group,
- level or inferred seniority claim,
- salary placement,
- where the ladder language breaks.

If levels are absent, the ladder may show inferred seniority from tenure/title only and must mark confidence lower.

### Decision Options

Show at least these options:

1. `do_nothing_monitor`
2. `targeted_correction`
3. `principle_first_freeze`
4. `band_reset`
5. `review_cycle_integration`

Each option must include:

- 얻는 것
- 감수할 것
- 언제 맞는가
- correction floor 영향
- communication risk 영향
- spread risk 영향

## Sample Founder Memo Draft

### Executive Summary

현재 샘플 회사의 문제는 특정인의 연봉이 높다는 사실이 아닙니다. 더 큰 문제는 공식 salary band가 없는데도 Product Engineer 안에서 사실상 두 개의 보상 구간이 이미 생겼고, 일부 비교 관계는 대표가 같은 기준으로 설명하기 어렵다는 점입니다.

가장 먼저 볼 finding은 `shadow_band`입니다. 이 finding은 제도가 없다고 구조가 없는 것은 아니라는 점을 보여줍니다. 이어서 `pay_inversion`, `loyalty_tax`, `level_fiction_band_overlap`이 실제 비교 관계를 통해 나타납니다.

### Most Fragile Comparison

가장 취약한 비교는 `row_001`과 `row_004`입니다.

`row_001`은 같은 Product Engineer 그룹에서 64개월의 근속 claim을 가지고 있고 base salary는 68,000,000 KRW입니다. `row_004`는 14개월 근속의 최근 채용자이며 base salary는 95,000,000 KRW입니다. 차이는 27,000,000 KRW입니다.

이 관계에서 문제는 `row_004`가 높다는 사실 자체가 아닙니다. 문제는 `row_001`이 비교했을 때 회사가 어떤 기준으로 이 차이를 설명할 수 있는지가 아직 보이지 않는다는 점입니다.

### What This Does Not Mean

이 결과는 시장연봉 벤치마크가 아닙니다. 이 결과는 개인별 권장 연봉도 아니고, 이탈률 예측이나 손실 예측도 아닙니다.

HR PaySim이 보는 질문은 다릅니다. 지금 회사 안에서 실제로 만들어진 보상 관계를 구성원이 서로 비교했을 때, 대표가 일관된 기준으로 방어할 수 있는가를 봅니다.

### Decision Options

1. `do_nothing_monitor`
   - 얻는 것: 당장 현금 지출과 정책 변경을 피합니다.
   - 감수할 것: 현재 비교 관계가 다음 offer와 review의 기준처럼 남을 수 있습니다.

2. `targeted_correction`
   - 얻는 것: 가장 취약한 비교 관계를 먼저 줄입니다.
   - 감수할 것: 기준 없이 조정하면 또 다른 예외로 보일 수 있습니다.

3. `principle_first_freeze`
   - 얻는 것: 새 예외를 만들기 전에 설명 언어를 먼저 고칩니다.
   - 감수할 것: offer나 retention 대응 속도가 느려질 수 있습니다.

4. `band_reset`
   - 얻는 것: 이미 생긴 shadow band를 설명 가능한 구간으로 전환합니다.
   - 감수할 것: 설계와 커뮤니케이션 부담이 가장 큽니다.

5. `review_cycle_integration`
   - 얻는 것: 다음 review cycle에 보상 기준을 함께 정리합니다.
   - 감수할 것: 그 전까지 취약한 비교 관계가 남아 있습니다.

### Suggested Next 90 Days

- Product Engineer 그룹에서 현재 암묵적으로 생긴 두 보상 구간을 인정할지 결정합니다.
- `row_001`과 `row_004`의 비교 관계를 어떤 언어로 설명할 수 있는지 먼저 씁니다.
- 다음 offer 전에 new-hire premium을 어떤 조건에서 허용할지 정합니다.
- Platform Engineer 그룹의 loyalty tax 신호를 다음 review cycle에서 다룰지 결정합니다.
- GTM 레벨 언어가 실제 보상 관계를 설명하는지 다시 확인합니다.

### Non-Claims

- 이 메모는 시장 대비 적정 연봉을 말하지 않습니다.
- 이 메모는 개인별 연봉 추천이 아닙니다.
- correction floor는 손실 예측이 아닙니다.
- 이 메모는 법률, 세무, payroll advice가 아닙니다.
- 이 메모는 이탈률이나 생산성 손실을 예측하지 않습니다.

### Follow-Up Questions

- 대표가 구성원에게 설명할 수 있는 보상 기준은 무엇입니까?
- 최근 채용 프리미엄은 일회성 예외입니까, 앞으로 반복될 기준입니까?
- 지금 조정하지 않는다면 다음 offer나 review에서 같은 관계가 반복됩니까?
- 이 문제는 사람별 조정으로 풀 문제입니까, band 언어를 복구할 문제입니까?

## Market Benchmark Objection Response

Use this response when a founder asks whether salaries are market-correct:

> HR PaySim은 시장 대비 적정 연봉을 말하지 않습니다. 시장 대비 맞는지는 별도 benchmark가 필요합니다. 이 도구가 보는 것은 다른 질문입니다. 지금 회사가 실제로 지급하고 있는 보상 관계를 내부에서 설명할 수 있는가, 구성원이 서로 비교했을 때 대표가 방어할 수 있는가를 봅니다. 실제 조직에서 먼저 터지는 것은 시장 평균과의 차이보다 옆 사람과의 설명 불가능한 차이인 경우가 많기 때문입니다.

## Acceptance Criteria

- `/hr-paysim/demo` can be explained in 90 seconds.
- The demo labels the roster as a representative de-identified sample excerpt from a 42-person company.
- `shadow_band` appears first when present in the synthetic demo.
- The first screen does not lead with CEI/CED.
- The demo does not ask for real company data before showing value.
- At least one group is clean or low-signal.
- The expected findings above can become fixture tests without inventing new sample rows.
- The memo includes non-claims and next 90-day questions.
- No sample row contains direct identifiers.






