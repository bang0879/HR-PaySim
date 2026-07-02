# HR PaySim v1.0 Metric Formula Spec

## 목적

이 문서는 HR PaySim v1.0의 핵심 지표 계산 로직을 정의한다.

HR PaySim은 보상 거버넌스 시뮬레이터이며, 지표는 보상이 높은지 낮은지를 판정하기 위한 것이 아니다. 지표의 목적은 보상 의사결정이 얼마나 설명 가능하고, 예외가 얼마나 누적되어 있으며, 어떤 시나리오가 조직에 어떤 거버넌스 부담을 만드는지 투명하게 보여주는 것이다.

## 핵심 원칙

v1.0 계산 로직은 가짜 정밀도를 피한다.

- 모든 지표는 숫자값과 평문 설명을 함께 반환한다.
- 숫자값은 내부 비교와 시나리오 변화 방향을 보기 위한 보조값이다.
- 사용자-facing 화면에서는 점수보다 band, 설명, 리스크 문구를 우선한다.
- 민감한 직원 단위 데이터 없이 aggregate, banded, grouped 입력을 우선 사용한다.
- 입력 품질이 낮으면 낮은 확신도와 설명을 반환한다.
- AI 관련 계산은 Advanced scenario에서만 사용하며, AI 대체율이나 정확한 생산성 향상률을 만들지 않는다.

## 공통 출력 형태

모든 metric은 최소한 다음 구조를 반환해야 한다.

```text
value: number | boolean | object
band: string | null
explanation_text: string
confidence: high | medium | low
risk_flags: string[]
```

한국어 UX에서는 다음 원칙을 적용한다.

- `explanation_text`는 사용자가 바로 이해할 수 있는 한국어 문장으로 변환한다.
- 내부 계산 용어인 `range spread`, `midpoint progression`, `compa-ratio`는 그대로 노출하지 않고 "밴드 폭", "레벨 간 기준급 차이", "밴드 내 위치"처럼 설명한다.
- 점수는 결정문이 아니라 대화 시작점으로 표현한다.

## 금지 계산

v1.0에서는 다음 계산을 만들지 않는다.

- AI substitution potential %
- Total Work Cost formula
- Attrition probability
- Exact productivity gain %
- AI Cost vs Human Cost Ratio as a standalone metric
- External salary market benchmark score
- Legal, tax, or equity valuation calculation

## Metric 1: Compensation Explainability Index, CEI

### 정의

Compensation Explainability Index, CEI는 회사가 보상 결정을 일관된 기준으로 설명할 수 있는지를 측정한다. CEI는 보상이 높은지 낮은지를 측정하지 않는다.

### 입력

- `has_salary_band`
- `has_level_system`
- `has_performance_review`
- `pay_inversion_case_count`
- `exception_raise_frequency`
- `counteroffer_frequency`
- `variable_pay_linked_to_performance`
- `manager_can_explain_pay_basis`

### 공식 또는 휴리스틱

기본 점수는 50점에서 시작한다. 설명 가능성을 높이는 구조가 있으면 가산하고, 설명을 어렵게 만드는 예외와 역전 사례가 있으면 감산한다.

```text
cei_score =
  50
  + salary_band_points
  + level_system_points
  + performance_review_points
  + variable_pay_linkage_points
  + manager_explanation_points
  - pay_inversion_penalty
  - exception_raise_penalty
  - counteroffer_penalty
```

권장 점수 규칙:

| 입력 | 조건 | 점수 |
| --- | --- | --- |
| has_salary_band | true | +15 |
| has_salary_band | false | -10 |
| has_level_system | true | +12 |
| has_level_system | false | -8 |
| has_performance_review | true | +8 |
| has_performance_review | false | -5 |
| variable_pay_linked_to_performance | true | +8 |
| variable_pay_linked_to_performance | false | -5 |
| manager_can_explain_pay_basis | true | +15 |
| manager_can_explain_pay_basis | false | -15 |
| exception_raise_frequency | none | 0 |
| exception_raise_frequency | rare | -4 |
| exception_raise_frequency | occasional | -8 |
| exception_raise_frequency | frequent | -15 |
| counteroffer_frequency | none | 0 |
| counteroffer_frequency | rare | -3 |
| counteroffer_frequency | occasional | -7 |
| counteroffer_frequency | frequent | -12 |
| pay_inversion_case_count | 0 | 0 |
| pay_inversion_case_count | 1-2 | -5 |
| pay_inversion_case_count | 3-5 | -10 |
| pay_inversion_case_count | 6+ | -18 |

최종 점수는 0-100으로 clamp한다.

### 출력 형식

```text
score: 0-100
band: High | Manageable | Fragile | Low
explanation_text: string
confidence: high | medium | low
risk_flags: string[]
```

Band 기준:

| 점수 | Band | 의미 |
| --- | --- | --- |
| 80-100 | High | 보상 기준을 비교적 일관되게 설명할 수 있음 |
| 60-79 | Manageable | 일부 예외가 있으나 관리 가능한 수준 |
| 40-59 | Fragile | 설명 기준이 흔들리고 예외 관리가 필요함 |
| 0-39 | Low | 보상 결정의 설명 가능성이 낮고 갈등 위험이 큼 |

### 예시

```text
입력:
has_salary_band = false
has_level_system = true
has_performance_review = true
pay_inversion_case_count = 7
exception_raise_frequency = frequent
counteroffer_frequency = occasional
variable_pay_linked_to_performance = false
manager_can_explain_pay_basis = false

출력:
score = 15
band = Low
explanation_text = "레벨 체계와 평가 제도는 있으나, 급여 밴드가 없고 예외 인상과 보상 역전 사례가 많아 보상 기준을 일관되게 설명하기 어렵습니다."
confidence = medium
risk_flags = ["low_explainability", "high_exception_pressure", "pay_inversion"]
```

### 실패 모드

- 관리자가 설명 가능성을 과도하게 낙관적으로 입력할 수 있다.
- salary band가 있어도 실제로 사용되지 않으면 CEI가 과대평가될 수 있다.
- pay inversion case count가 누락되면 CEI가 과대평가될 수 있다.
- 점수가 낮다고 법적 리스크나 즉각적인 이직 위험을 의미하지 않는다.

### 수용 기준

- CEI는 항상 score, band, explanation_text를 반환한다.
- CEI는 보상이 높은지 낮은지 평가하지 않는다.
- CEI는 직원별 보상 설명을 생성하지 않는다.
- CEI 설명문은 어떤 입력이 점수에 영향을 줬는지 드러낸다.
- 입력이 부족하면 confidence를 낮추고 missing input risk를 표시한다.

## Metric 2: Compensation Exception Debt, CED

### 정의

Compensation Exception Debt, CED는 누적된 보상 예외가 향후 거버넌스 부담으로 전환될 가능성을 측정한다. 점수가 높을수록 예외 부채가 크다.

### 입력

- `counteroffer_frequency`
- `exception_raise_frequency`
- `new_hire_premium_exists`
- `pay_inversion_case_count`
- `out_of_band_case_count`
- `undocumented_negotiation_level`

### 공식 또는 휴리스틱

CED는 0점에서 시작해 예외 압력 요인을 가산한다.

```text
ced_score =
  counteroffer_points
  + exception_raise_points
  + new_hire_premium_points
  + pay_inversion_points
  + out_of_band_points
  + undocumented_negotiation_points
```

권장 점수 규칙:

| 입력 | 조건 | 점수 |
| --- | --- | --- |
| counteroffer_frequency | none | 0 |
| counteroffer_frequency | rare | +6 |
| counteroffer_frequency | occasional | +12 |
| counteroffer_frequency | frequent | +20 |
| exception_raise_frequency | none | 0 |
| exception_raise_frequency | rare | +6 |
| exception_raise_frequency | occasional | +14 |
| exception_raise_frequency | frequent | +24 |
| new_hire_premium_exists | true | +12 |
| new_hire_premium_exists | false | 0 |
| pay_inversion_case_count | 0 | 0 |
| pay_inversion_case_count | 1-2 | +8 |
| pay_inversion_case_count | 3-5 | +15 |
| pay_inversion_case_count | 6+ | +25 |
| out_of_band_case_count | 0 | 0 |
| out_of_band_case_count | 1-3 | +8 |
| out_of_band_case_count | 4-10 | +15 |
| out_of_band_case_count | 11+ | +25 |
| undocumented_negotiation_level | none | 0 |
| undocumented_negotiation_level | low | +5 |
| undocumented_negotiation_level | medium | +12 |
| undocumented_negotiation_level | high | +20 |

최종 점수는 0-100으로 clamp한다.

### 출력 형식

```text
score: 0-100
band: Low | Medium | High | Critical
explanation_text: string
confidence: high | medium | low
risk_flags: string[]
```

Band 기준:

| 점수 | Band | 의미 |
| --- | --- | --- |
| 0-24 | Low | 예외 부채가 낮음 |
| 25-49 | Medium | 예외가 관리 대상이 됨 |
| 50-74 | High | 예외가 보상 원칙을 흔들 수 있음 |
| 75-100 | Critical | 예외가 구조적 거버넌스 문제로 누적됨 |

### 예시

```text
입력:
counteroffer_frequency = occasional
exception_raise_frequency = frequent
new_hire_premium_exists = true
pay_inversion_case_count = 7
out_of_band_case_count = 5
undocumented_negotiation_level = medium

출력:
score = 100
band = Critical
explanation_text = "예외 인상, 카운터오퍼, 신규 입사자 프리미엄, 밴드 밖 사례가 동시에 존재해 보상 예외가 구조적 부채로 누적되고 있습니다."
confidence = high
risk_flags = ["critical_exception_debt", "pay_inversion", "out_of_band_cases"]
```

### 실패 모드

- 예외 빈도가 주관적으로 입력되면 점수가 흔들릴 수 있다.
- 예외가 실제로 승인된 정책인지 임시 예외인지 구분되지 않으면 과대평가될 수 있다.
- 높은 CED가 곧 법적 문제나 직원 이탈을 의미하지 않는다.
- CED가 낮아도 보상 철학이 명확하다는 뜻은 아니다.

### 수용 기준

- CED는 항상 score, band, explanation_text를 반환한다.
- CED는 예외 부채를 측정하며 보상 수준 자체를 평가하지 않는다.
- CED는 직원별 예외 사유를 저장하거나 노출하지 않는다.
- CED는 high 또는 critical일 때 주요 누적 요인을 설명문에 포함한다.
- CED는 CEI와 반대 방향으로만 움직인다고 가정하지 않는다.

## Metric 3: Pay Inversion Risk

### 정의

Pay Inversion Risk는 신규 입사자, 외부 영입자, 또는 예외 보상으로 인해 기존 구성원과의 내부 형평 문제가 발생하는지를 감지한다.

### 입력

- `pay_inversion_case_count`
- `average_salary_by_level`
- `headcount_by_level`
- `new_hire_premium_exists`
- `out_of_band_case_count`
- 선택 입력: grouped synthetic test rows for calculation testing only

### 공식 또는 휴리스틱

v1.0의 기본 계산은 사용자가 입력한 `pay_inversion_case_count`를 우선한다. 직원별 실제 급여 데이터가 없으므로, aggregate 기반에서는 정밀 탐지보다 위험 수준 분류에 집중한다.

```text
case_count = pay_inversion_case_count

severity_points =
  case_count_points
  + new_hire_premium_points
  + out_of_band_points

severity_band =
  None | Watch | Material | Severe
```

권장 점수 규칙:

| 조건 | 점수 |
| --- | --- |
| pay_inversion_case_count = 0 | +0 |
| pay_inversion_case_count = 1-2 | +20 |
| pay_inversion_case_count = 3-5 | +45 |
| pay_inversion_case_count = 6+ | +70 |
| new_hire_premium_exists = true | +15 |
| out_of_band_case_count 1-3 | +10 |
| out_of_band_case_count 4+ | +20 |

Severity 기준:

| 점수 | Severity Band |
| --- | --- |
| 0 | None |
| 1-29 | Watch |
| 30-69 | Material |
| 70-100 | Severe |

### 출력 형식

```text
case_count: integer
severity_band: None | Watch | Material | Severe
explanation_text: string
confidence: high | medium | low
risk_flags: string[]
```

### 예시

```text
입력:
pay_inversion_case_count = 4
new_hire_premium_exists = true
out_of_band_case_count = 2

출력:
case_count = 4
severity_band = Material
explanation_text = "확인된 보상 역전 사례가 4건이고 신규 입사자 프리미엄이 존재해 내부 형평성 설명 부담이 커지고 있습니다."
confidence = medium
risk_flags = ["pay_inversion", "new_hire_premium"]
```

### 실패 모드

- case count가 수동 입력이면 누락 또는 중복 가능성이 있다.
- aggregate 평균만으로는 실제 개인별 역전을 검증할 수 없다.
- synthetic test rows는 계산 테스트에만 사용해야 하며 실제 회사 판단 근거로 쓰면 안 된다.
- severity가 높아도 개인별 조정 금액을 제안하지 않는다.

### 수용 기준

- case count와 severity band를 함께 반환한다.
- 설명문은 신규 입사자 프리미엄과 밴드 밖 사례의 영향을 구분한다.
- 직원명, 개별 급여, 개별 조정안을 요구하지 않는다.
- 입력 근거가 약하면 confidence를 낮춘다.
- 외부 시장 연봉 데이터 없이 내부 형평 리스크만 다룬다.

## Metric 4: Salary Band Health

### 정의

Salary Band Health는 급여 밴드 구조가 보상 설명과 운영에 충분히 사용할 수 있는지를 평가한다. 내부 계산에서는 range spread, midpoint progression, compa-ratio distribution, out-of-band cases를 사용할 수 있지만, 사용자-facing UX에서는 한국어 설명으로 번역한다.

### 입력

- `SalaryBandModel.level`
- `SalaryBandModel.min`
- `SalaryBandModel.midpoint`
- `SalaryBandModel.max`
- `SalaryBandModel.range_spread`
- `SalaryBandModel.midpoint_progression`
- `out_of_band_case_count`
- 선택 입력: `compa_ratio_distribution` if available as aggregate bands

### 공식 또는 휴리스틱

각 밴드 행에 대해 내부 품질 점수를 계산하고 전체 평균을 만든다.

```text
band_health_score =
  100
  - range_spread_penalty
  - midpoint_progression_penalty
  - out_of_band_penalty
  - compa_ratio_concentration_penalty
```

권장 휴리스틱:

| 항목 | 조건 | Penalty |
| --- | --- | --- |
| range_spread | 20-60% | 0 |
| range_spread | 10-19% or 61-80% | -10 |
| range_spread | below 10% or above 80% | -20 |
| midpoint_progression | 10-25% | 0 |
| midpoint_progression | 5-9% or 26-35% | -8 |
| midpoint_progression | below 5% or above 35% | -18 |
| out_of_band_case_count | 0 | 0 |
| out_of_band_case_count | 1-3 | -8 |
| out_of_band_case_count | 4-10 | -18 |
| out_of_band_case_count | 11+ | -30 |
| compa-ratio distribution | balanced | 0 |
| compa-ratio distribution | clustered near min/max | -10 |
| compa-ratio distribution | unavailable | 0 with lower confidence |

최종 점수는 0-100으로 clamp한다.

### 출력 형식

```text
score: 0-100
band: Healthy | Needs Review | Fragile | Not Usable
explanation_text: string
confidence: high | medium | low
risk_flags: string[]
internal_terms_used: string[]
```

Band 기준:

| 점수 | Band | 한국어 UX 방향 |
| --- | --- | --- |
| 80-100 | Healthy | 현재 밴드는 설명과 운영에 비교적 안정적입니다 |
| 60-79 | Needs Review | 일부 구간은 조정 검토가 필요합니다 |
| 40-59 | Fragile | 밴드가 보상 설명을 충분히 지탱하지 못합니다 |
| 0-39 | Not Usable | 현재 밴드는 운영 기준으로 쓰기 어렵습니다 |

### 예시

```text
입력:
range_spread = 95
midpoint_progression = 8
out_of_band_case_count = 6
compa_ratio_distribution = unavailable

출력:
score = 44
band = Fragile
explanation_text = "밴드 폭이 넓고 밴드 밖 사례가 있어 현재 급여 밴드는 보상 설명 기준으로 쓰기에 취약합니다."
confidence = medium
risk_flags = ["wide_band", "out_of_band_cases"]
internal_terms_used = ["range_spread", "midpoint_progression"]
```

### 실패 모드

- 외부 시장 데이터가 없으므로 market competitiveness를 평가할 수 없다.
- compa-ratio distribution이 없으면 밴드 내 위치 편중을 확인할 수 없다.
- 너무 엄격한 범위 기준은 초기 스타트업의 현실을 과도하게 낮게 평가할 수 있다.
- 밴드가 건강해도 실제 관리자 사용률이 낮으면 CEI는 낮을 수 있다.

### 수용 기준

- 내부 계산 용어를 UX에 그대로 노출하지 않는다.
- salary band가 없으면 "Not available" 또는 proposed band mode로 처리한다.
- out-of-band 사례가 많으면 설명문에 반드시 반영한다.
- 외부 연봉 벤치마크를 암시하지 않는다.
- Salary Band Redesign 시나리오에서 current vs proposed 비교에 사용할 수 있다.

## Metric 5: Payroll Forecast

### 정의

Payroll Forecast는 선택한 시나리오가 월간 및 연간 payroll에 미치는 변화를 계산한다. 이는 finance-grade forecast가 아니라 compensation governance 시뮬레이션용 추정치다.

### 입력

- `total_monthly_base_pay`
- `total_monthly_fixed_allowance`
- `total_expected_variable_pay`
- `planned_hires_6m`
- `planned_hires_12m`
- `average_expected_salary_by_level`
- `recent_raise_budget`
- `optional_cash_balance`
- `optional_runway_months`

### 공식 또는 휴리스틱

기본 월 payroll:

```text
baseline_monthly_payroll =
  total_monthly_base_pay
  + total_monthly_fixed_allowance
  + monthly_variable_pay_estimate
```

변동 급여가 연간 입력이면:

```text
monthly_variable_pay_estimate = total_expected_variable_pay / 12
```

채용 증가분:

```text
monthly_new_hire_pay =
  sum(planned_hires_by_level[level] * average_expected_salary_by_level[level] / 12)
```

시나리오 후 월 payroll:

```text
scenario_monthly_payroll =
  baseline_monthly_payroll
  + monthly_new_hire_pay
  + monthly_raise_budget_delta
  + monthly_exception_delta
  + monthly_premium_pool_delta
  - monthly_deferred_hiring_delta
```

출력:

```text
monthly_payroll_delta = scenario_monthly_payroll - baseline_monthly_payroll
annual_payroll_delta = monthly_payroll_delta * 12
payroll_increase_rate = monthly_payroll_delta / baseline_monthly_payroll * 100
```

Optional runway impact:

```text
runway_impact_months =
  optional_cash_balance / scenario_monthly_burn
  - optional_runway_months
```

Runway impact는 `optional_cash_balance` 또는 `optional_runway_months`가 있을 때만 계산한다. 둘 다 없으면 표시하지 않는다.

### 출력 형식

```text
monthly_payroll_delta: currency_krw
annual_payroll_delta: currency_krw
payroll_increase_rate: percentage
optional_runway_impact_months: number | null
explanation_text: string
confidence: high | medium | low
risk_flags: string[]
```

### 예시

```text
입력:
baseline_monthly_payroll = 550000000
monthly_new_hire_pay = 42000000
monthly_raise_budget_delta = 10000000
monthly_exception_delta = 0

출력:
monthly_payroll_delta = 52000000
annual_payroll_delta = 624000000
payroll_increase_rate = 9.45
optional_runway_impact_months = null
explanation_text = "이 시나리오는 월 payroll을 약 5,200만원 증가시키며, 주요 증가는 예정 채용과 인상 예산에서 발생합니다."
confidence = medium
risk_flags = ["payroll_pressure"]
```

### 실패 모드

- 변동급여가 월간인지 연간인지 불명확하면 forecast가 왜곡된다.
- hiring plan이 자주 바뀌면 annual delta는 빠르게 낡는다.
- optional runway impact는 전체 burn 구조가 아니라 제공된 입력만 기반으로 하므로 finance-grade 지표가 아니다.
- Total Work Cost로 확장하면 안 된다.

### 수용 기준

- monthly payroll delta, annual payroll delta, payroll increase rate를 반환한다.
- runway impact는 선택 입력이 있을 때만 반환한다.
- Total Work Cost, 세금, 복리후생, equity, vendor cost를 포괄 공식으로 합산하지 않는다.
- 설명문은 어떤 입력이 증가 또는 감소를 만들었는지 보여준다.
- baseline 대비 변화값으로 표시한다.

## Metric 6: Orchestrator Premium Pool

### 정의

Orchestrator Premium Pool은 AI/tooling을 활용해 산출, 책임, 조율 범위가 커진 senior 구성원 또는 역할 그룹에 대해 얼마의 예산을 프리미엄 풀로 배정할 수 있는지 추정한다.

이 metric은 Advanced scenario에서만 사용한다. AI 대체율을 계산하지 않으며, 사용자가 제공한 hiring delay 또는 budget reallocation assumption에서만 계산한다.

### 입력

- `orchestrator_target_count`
- `premium_pool_allocation_rate`
- `planned_ai_tool_budget_monthly`
- `planned_ai_tool_budget_annual`
- `hiring_delay_months`
- `planned_hires_6m`
- `planned_hires_12m`
- `average_expected_salary_by_level`
- 선택 입력: `reallocation_budget_ceiling`

### 공식 또는 휴리스틱

프리미엄 풀은 두 가지 방식 중 사용자가 선택한 가정으로 계산한다.

방식 A: 명시적 pool allocation rate

```text
premium_pool_budget =
  relevant_grouped_payroll * premium_pool_allocation_rate
```

방식 B: hiring delay로 생긴 user-provided budget envelope 일부 재배분

```text
deferred_hiring_budget =
  sum(delayed_hires_by_level[level] * average_expected_salary_by_level[level] / 12 * hiring_delay_months)

premium_pool_budget =
  deferred_hiring_budget * user_selected_reallocation_rate
```

AI tooling budget은 별도로 보여주되, 사람 비용 대비 AI 비용 비율을 standalone metric으로 만들지 않는다.

### 출력 형식

```text
premium_pool_budget: currency_krw
monthly_premium_pool_delta: currency_krw
orchestrator_target_count: integer
per_target_budget_hint: currency_krw | null
explanation_text: string
confidence: high | medium | low
risk_flags: string[]
advanced_only: true
```

`per_target_budget_hint`는 내부 검토용 평균 힌트일 뿐 개인별 추천액이 아니다. UX에서는 "1인당 지급 권고"로 표현하지 않는다.

### 예시

```text
입력:
deferred_hiring_budget = 240000000
user_selected_reallocation_rate = 25
orchestrator_target_count = 4

출력:
premium_pool_budget = 60000000
monthly_premium_pool_delta = 5000000
orchestrator_target_count = 4
per_target_budget_hint = 15000000
explanation_text = "채용 지연으로 생긴 예산 여지 중 일부를 senior orchestrator premium pool로 재배분하는 가정입니다. 이는 개인별 보상 추천이 아니라 풀 규모 검토입니다."
confidence = medium
risk_flags = ["advanced_assumption", "communication_difficulty"]
advanced_only = true
```

### 실패 모드

- premium pool이 실제로는 retention exception을 포장하는 용도로 쓰일 수 있다.
- orchestrator 대상 기준이 불명확하면 CEI가 오히려 낮아질 수 있다.
- AI tooling의 실제 생산성 효과를 측정하지 못한다.
- per-target 평균값이 개인별 추천으로 오해될 수 있다.

### 수용 기준

- Advanced scenario에서만 사용할 수 있다.
- AI replacement percentage를 계산하지 않는다.
- user-provided hiring delay 또는 budget reallocation assumption 없이 자동 계산하지 않는다.
- 출력은 pool 규모 중심이며 개인별 지급 권고가 아니다.
- 설명문은 프리미엄의 거버넌스 조건과 오해 가능성을 포함한다.

## Metric 7: Productivity Leakage Flag

### 정의

Productivity Leakage Flag는 AI 기반 생산성 향상이 개인 수준에 머무르고 조직 산출로 전환되지 않을 가능성을 감지한다.

이 metric은 생산성 향상률을 계산하지 않는다. 조직적 산출로 이어지기 어려운 조건을 질문 기반으로 감지한다.

### 입력

- `productivity_leakage_questions`
- `junior_pipeline_risk_questions`
- `affected_roles_or_functions`
- `hiring_freeze_toggle`
- `hiring_delay_months`
- `current_ai_tooling_level`

권장 질문 예시:

| Question ID | 질문 |
| --- | --- |
| coordination_overhead_increased | AI 도구 사용 이후 조율하거나 검토해야 할 일이 늘었는가? |
| output_review_bottleneck | 결과물을 검토할 senior 병목이 커졌는가? |
| individual_speed_not_shared | 개인 작업 속도는 빨라졌지만 팀 산출물 리드타임은 줄지 않았는가? |
| accountability_unclear | AI 사용 결과의 책임 소재가 불명확한가? |
| junior_learning_reduced | 주니어가 배울 수 있는 반복 업무와 피드백 기회가 줄었는가? |
| process_not_redesigned | 도구만 도입했고 업무 프로세스는 바꾸지 않았는가? |

### 공식 또는 휴리스틱

```text
yes_count = number of leakage questions answered yes
unknown_count = number of leakage questions answered unknown

flag = true if:
  yes_count >= 2
  OR output_review_bottleneck = yes
  OR accountability_unclear = yes and process_not_redesigned = yes
  OR hiring_freeze_toggle = true and junior_learning_reduced = yes
```

이 metric은 true/false flag이며 exact productivity gain percentage를 만들지 않는다.

### 출력 형식

```text
flag: true | false
reasons: string[]
recommended_question: string
explanation_text: string
confidence: high | medium | low
risk_flags: string[]
```

### 예시

```text
입력:
coordination_overhead_increased = yes
output_review_bottleneck = yes
individual_speed_not_shared = unknown
accountability_unclear = no
junior_learning_reduced = yes
process_not_redesigned = yes
hiring_freeze_toggle = true

출력:
flag = true
reasons = [
  "AI 결과물 검토 병목이 senior에게 집중되고 있습니다.",
  "채용 동결과 함께 junior learning 기회가 줄어들 수 있습니다.",
  "업무 프로세스 재설계 없이 도구만 추가된 상태입니다."
]
recommended_question = "AI 도구로 빨라진 개인 작업이 팀 단위 산출, 책임, 검토 흐름으로 어떻게 전환되고 있습니까?"
explanation_text = "AI 도구가 개인 생산성에는 도움이 될 수 있지만, 현재 입력 기준으로는 조직 산출로 전환되는 과정에 누수가 생길 가능성이 있습니다."
confidence = medium
risk_flags = ["productivity_leakage", "advanced_assumption"]
```

### 실패 모드

- 질문 답변이 주관적이므로 조직 정치나 낙관 편향의 영향을 받을 수 있다.
- flag가 false여도 생산성 향상이 검증된 것은 아니다.
- flag가 true여도 AI 도입 실패를 의미하지 않는다.
- 이 metric을 정확한 생산성 손실률로 바꾸면 안 된다.

### 수용 기준

- 출력은 true/false flag, reasons, recommended_question을 포함한다.
- exact productivity gain percentage를 계산하지 않는다.
- AI substitution potential을 암시하지 않는다.
- Advanced scenario와 연결될 때 시각적으로 분리한다.
- 질문 기반 heuristic임을 설명문에 드러낸다.

## Metric 간 관계

v1.0에서는 metric 간 관계를 인과관계로 과장하지 않는다.

- CEI가 높아도 CED가 항상 낮은 것은 아니다.
- CED가 높아도 즉각적인 이직 위험을 의미하지 않는다.
- Salary Band Health가 좋아도 manager explanation이 약하면 CEI는 낮을 수 있다.
- Payroll Forecast가 안정적이어도 예외가 많으면 CED는 높을 수 있다.
- Productivity Leakage Flag가 true여도 AI 도구가 무효라는 뜻은 아니다.

## 입력 품질과 Confidence

Confidence는 계산 신뢰도가 아니라 입력 완성도와 해석 안정성을 나타낸다.

| Confidence | 기준 |
| --- | --- |
| high | 필수 입력이 대부분 있고, 주요 값이 aggregate 또는 banded 형태로 일관됨 |
| medium | 일부 입력이 누락되었으나 방향성 판단은 가능함 |
| low | 핵심 입력이 없거나 unknown이 많아 점수보다 질문 생성에 가까움 |

Confidence가 low인 경우 UX는 점수보다 "추가로 확인할 질문"을 우선 표시한다.

## 공통 Acceptance Criteria

이 문서는 다음 조건을 만족해야 한다.

- CEI, CED, Pay Inversion Risk, Salary Band Health, Payroll Forecast, Orchestrator Premium Pool, Productivity Leakage Flag를 정의한다.
- 각 metric은 definition, inputs, formula or heuristic, output format, example, failure mode, acceptance criteria를 포함한다.
- 모든 지표는 값과 평문 설명을 함께 반환한다.
- 점수는 투명한 scoring 또는 banded heuristic으로 계산한다.
- AI substitution potential %, Total Work Cost formula, attrition probability, exact productivity gain %를 만들지 않는다.
- Orchestrator Premium Pool은 Advanced scenario 전용이며 user-provided assumption 없이 자동 산출하지 않는다.
- Salary Band Health의 내부 계산 개념은 향후 한국어 UX에서 쉬운 말로 번역한다.
- HR PaySim이 salary calculator, standalone AI workforce simulator, legal/tax calculator로 보이지 않도록 제한한다.
