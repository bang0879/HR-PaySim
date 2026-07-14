# Do-Nothing / Correction Floor Model Contract

## Status

This is a mandatory Phase 0C contract. It must be completed before parser or detector implementation starts.

## Problem

The older `estimatedDoNothingCost` framing is not acceptable for v1.

It can sound like a fake loss prediction if the app shows a single KRW number for doing nothing. HR PaySim must not imply predicted attrition loss, productivity loss, replacement cost, or financial loss without support.

## Replacement Model

Use a defensibility model:

```ts
export type RiskBand = "low" | "medium" | "high" | "critical";

export interface FindingRiskModel {
  correctionFloorKRW?: number;
  exposurePayrollKRW?: number;
  communicationRisk: RiskBand;
  spreadRisk: RiskBand;
  decisionUrgency: RiskBand;
  nonClaim: string;
}
```

## Field Definitions

### correctionFloorKRW

The minimum defensible upward adjustment floor required to reduce the specific fragile comparison relationship.

Correction floor only counts upward adjustment needed to restore defensibility. It must not assume salary reduction, clawback, or pay cut.

It is not:

- predicted loss,
- recommended final salary,
- full remediation budget,
- legal obligation,
- market benchmark gap,
- a pay cut or clawback model.

Show KRW only when the calculation is direct and defensible.

Example copy:

> 현재 비교 관계를 최소한 설명 가능하게 만들려면 2,700만원 수준의 correction floor가 보입니다. 이 값은 손실 예측이 아니라, 현재의 방어 어려운 비교 관계를 정리하기 위한 최소 조정 하한입니다.

### exposurePayrollKRW

The total base salary currently sitting inside the affected role group, cluster, or relationship set.

It is not a loss amount. It is exposure context.

Example copy:

> 이 finding은 Product Engineer 그룹의 base payroll 4억 8천만원 범위 안에서 발생합니다.

### communicationRisk

How hard it would be for the founder to explain the relationship if employees compared pay.

Rubric:

- `low`: explanation is mostly consistent with role, level, tenure, or documented exception.
- `medium`: explanation exists but requires context not visible in the roster.
- `high`: relationship contradicts level, tenure, or role expectations.
- `critical`: relationship is both hard to explain and likely to become a precedent.

### spreadRisk

How likely the same pattern is to repeat in the next hiring, raise, or review cycle.

Rubric:

- `low`: isolated relation with clear documentation.
- `medium`: one pattern, limited to one role group.
- `high`: pattern appears in multiple rows or is tied to hiring pressure.
- `critical`: pattern is structural, repeated, and lacks a decision rule.

### decisionUrgency

How soon the founder should decide whether to monitor, correct, freeze, reset, or integrate into a review cycle.

Rubric:

- `low`: review next cycle.
- `medium`: monitor and prepare rule before next compensation event.
- `high`: decide before next offer, raise, or review.
- `critical`: decide before communicating compensation, promotion, or exception decisions.

### nonClaim

A required sentence explaining what the model does not claim.

English default:

> This is not a predicted loss, attrition estimate, replacement cost, market benchmark, or individual salary recommendation.

Korean default:

> 이 값은 손실 예측, 이탈률 추정, 대체 비용, 시장연봉 벤치마크, 개인별 권장 연봉이 아닙니다.

## Do-Nothing As A Decision Option

Do not present do-nothing as a free baseline.

Use:

```ts
export interface DecisionOption {
  id: DecisionOptionId;
  title: string;
  gain: string;
  tradeoff: string;
  whenItFits: string;
  correctionFloorEffect: string;
  communicationRiskEffect: string;
  spreadRiskEffect: string;
}

export type DecisionOptionId =
  | "do_nothing_monitor"
  | "targeted_correction"
  | "principle_first_freeze"
  | "band_reset"
  | "review_cycle_integration";
```

### `do_nothing_monitor`

- 얻는 것: immediate cash preservation and no immediate policy disruption.
- 감수할 것: the fragile relationship remains and may set the next comparison baseline.
- 언제 맞는가: finding confidence is low, next compensation cycle is far away, or Kyle/founder needs more context.
- correction floor 영향: no immediate correction floor spend.
- communication risk 영향: unchanged.
- spread risk 영향: unchanged or worsens if hiring pressure continues.

### `targeted_correction`

- 얻는 것: resolves the most fragile comparison pair.
- 감수할 것: can look like another exception if no principle is stated.
- 언제 맞는가: one or two specific relationships drive the risk.
- correction floor 영향: uses correction floor as the minimum budget anchor.
- communication risk 영향: improves for the affected pair.
- spread risk 영향: improves only if paired with a rule.

### `principle_first_freeze`

- 얻는 것: prevents new exceptions before language is repaired.
- 감수할 것: may slow offers, raises, or retention responses.
- 언제 맞는가: spread risk is high but correction budget is uncertain.
- correction floor 영향: delays spend decision.
- communication risk 영향: improves if the principle is communicated.
- spread risk 영향: reduces repeat exceptions.

### `band_reset`

- 얻는 것: converts shadow bands into explainable ranges.
- 감수할 것: highest communication and design burden.
- 언제 맞는가: shadow band is lead finding or level language has collapsed.
- correction floor 영향: may require multiple adjustments only when paired with defensible comparison pairs.
- communication risk 영향: improves if role/level language is credible.
- spread risk 영향: strongest structural improvement.

### `review_cycle_integration`

- 얻는 것: ties correction to existing review cadence.
- 감수할 것: fragile comparisons remain until the cycle.
- 언제 맞는가: urgency is medium and next review cycle is near.
- correction floor 영향: staged rather than immediate.
- communication risk 영향: improves when review criteria are explicit.
- spread risk 영향: improves if future offers and raises use the same rule.

## Finding-Specific Correction Floor Rules

These are reconciled Phase 0C/0.1 rules. They supersede any older rule that sums all deduplicated underpaid rows into a group-level `correctionFloorKRW`.

### Global Correction Floor Rule

Correction floor is always upward-only.

Do not calculate correction floor by reducing a higher-paid row, clawing back compensation, cutting salary, or assuming any future negative adjustment.

If restoring defensibility requires a policy decision but not a direct upward row-level adjustment, omit `correctionFloorKRW` and use communication/spread/urgency risk bands instead.

### R1: Single Most-Fragile Pair Floor

For `pay_inversion` and `loyalty_tax`:

```text
correctionFloorKRW = salary gap of the single most fragile material pair
```

Most fragile pair:

```text
highest gap percentage = salaryGapKRW / underpaidRow.baseSalaryKRW
```

Other material relationships in the same group are reported as:

```ts
additionalUnderpaidRowCount: number
```

`additionalUnderpaidRowCount` means the number of additional underpaid stronger-claim rows beyond the headline pair, not the number of additional comparison pairs.

Tie-break rule:

1. Choose the material pair with the largest `gapPercentage`.
2. If tied, choose the pair with the larger absolute `salaryGapKRW`.
3. If still tied, choose the lexicographically earliest `underpaidRowId`, then the earliest `comparatorRowId`.

They must not be summed into `correctionFloorKRW`.

Rationale:

- a single sharp pair creates clearer founder aha,
- avoids scary invented totals,
- stays testable,
- keeps the figure tied to an explainable comparison card.

### R2: Finding-Type-Specific Materiality

Materiality is not one global threshold.

Use these triggers:

- `pay_inversion`: magnitude trigger. A pair is material only if `gap / underpaidRow.baseSalaryKRW >= 0.08`.
- `loyalty_tax`: magnitude trigger. A pair is material only if `gap / underpaidRow.baseSalaryKRW >= 0.08`.
- `level_fiction_band_overlap`: ordinal trigger. Fires whenever a lower-level-rank row's pay is `>=` a higher-level-rank row's pay, regardless of magnitude.
- `shadow_band`: adjacent salary gap `> 2 * medianAdjacentGap` inside the role group. No `correctionFloorKRW` by default.

This keeps the Designer sample clean: `row_015` has stronger tenure and lower pay than `row_016`, but the 4,000,000 KRW gap is 6.3%, below the 8% materiality threshold.

### R3: Flags Do Not Exclude Comparators

Rows with `exceptionFlag` or `counterOfferFlag` remain valid comparators.

A documented exception or counteroffer can explain why the company made a decision, but it does not automatically make the pay relationship defensible to a peer.

Flags affect only:

- `spreadRisk`: usually upward, because a documented premium can become repeatable precedent,
- `reasonThisIsHardToDefend`: mention that the premium is documented but still relationally hard to explain.

Flags must not:

- lower `communicationRisk` for the comparison,
- exclude the row from headline pair selection,
- exclude the row from correction floor computation.

### R4: shadow_band

Default: no `correctionFloorKRW`.

For `shadow_band`, show correction floor only when the finding also contains a defensible comparison pair.

Do not turn `shadow_band` into a calculator that says how much it costs to create salary bands.

Use `communicationRisk`, `spreadRisk`, `decisionUrgency`, and `exposurePayrollKRW` as the default output for shadow band.

If no row-level defensible floor exists, omit `correctionFloorKRW` and show only risk bands.

### R5: pay_inversion

For each material comparison pair:

```text
pairFloor = higherPaidRow.baseSalaryKRW - lowerPaidButStrongerClaimRow.baseSalaryKRW
gapPercentage = pairFloor / lowerPaidButStrongerClaimRow.baseSalaryKRW
```

A pair is material only when:

```text
gapPercentage >= 0.08
```

The finding's `headlinePair` is the material pair with the largest `gapPercentage`.

The finding's `correctionFloorKRW` equals that headline pair gap only.

Do not sum pair floors across all lower-paid rows.

### R6: level_fiction_band_overlap

`level_fiction_band_overlap` is the one intentional carve-out from R1.

Because the finding is about restoring rank order, its floor is the sum of the minimal upward lifts needed to raise each higher-rank underpaid row just above the offending lower-rank row.

Use ordinal restoration:

```text
rowFloor = offendingLowerRankRow.baseSalaryKRW - underpaidHigherRankRow.baseSalaryKRW
findingCorrectionFloor = sum(positive rowFloor for affected higher-rank rows)
```

Do not assume all level overlaps must be eliminated.

Do not calculate a pay cut for lower-level rows.

If the overlap only indicates weak level language but no ordinal pay violation, omit `correctionFloorKRW`.

### R7: loyalty_tax

Use cohort averages as evidence, not as the floor.

A pair is material only when:

```text
gapPercentage = pairFloor / lowerPaidLongTenureRow.baseSalaryKRW >= 0.08
```

The finding's `headlinePair` is the material pair with the largest `gapPercentage`.

The finding's `correctionFloorKRW` equals that headline pair gap only.

The floor is not the cost of making all long-tenured employees equal to the highest new hire.

Do not sum pair floors across all long-tenured underpaid rows.
## Forbidden Copy

Do not use:

- `방치 비용 추정`
- `예측 손실`
- `이탈 손실`
- `대체 비용`
- `생산성 손실`
- `market-correct salary`
- `recommended salary`
- `estimatedDoNothingCost`
- `salary reduction`
- `clawback`
- `pay cut`
- summed multi-row `correctionFloorKRW` for `pay_inversion` or `loyalty_tax`

Use:

- `correction floor`
- `노출 payroll`
- `communication risk`
- `spread risk`
- `decision urgency`
- `설명 가능하게 만들기 위한 최소 조정 하한`

## Acceptance Criteria

- No Phase 1 domain type includes `estimatedDoNothingCost`.
- No detector test expects arbitrary multipliers.
- KRW values are limited to `correctionFloorKRW` and `exposurePayrollKRW`.
- Correction floor is upward-only.
- Shadow band defaults to no `correctionFloorKRW` unless paired with a defensible comparison pair.
- Pay inversion and loyalty tax use a single most-fragile headline pair floor, not a summed group floor.
- Headline pair tie-break is largest gap percentage, then larger absolute gap, then rowId order.
- Other material relationships are captured with `additionalUnderpaidRowCount`.
- `level_fiction_band_overlap` uses the ordinal-restoration sum carve-out.
- Do-nothing appears as a decision option with gains and tradeoffs.
- The founder memo clearly states that correction floor is not predicted loss.




