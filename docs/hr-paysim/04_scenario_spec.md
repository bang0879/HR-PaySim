# HR PaySim v1.0 Scenario Spec

## 목적

이 문서는 HR PaySim v1.0의 baseline과 다섯 개 시나리오를 정의한다.

HR PaySim은 성장 단계 한국 스타트업을 위한 보상 거버넌스 시뮬레이터다. 각 시나리오는 개별 직원의 급여를 추천하지 않고, 보상 의사결정이 설명 가능성, 예외 부채, payroll 부담, 내부 커뮤니케이션 리스크에 어떤 영향을 주는지 보여준다.

## 공통 원칙

- 사용자-facing UX는 한국어를 기본으로 한다.
- 모든 시나리오는 baseline과 비교되어야 한다.
- 출력은 숫자만 보여주지 않고 평문 설명, warning copy, risk flag를 함께 제공한다.
- 직원 이름, 이메일, 주민등록번호, 개인별 원시 급여 등 민감정보를 요구하거나 저장하지 않는다.
- 필요한 경우 aggregate group, level, function, salary band 단위로 입력을 받는다.
- Advanced 시나리오는 기능 플래그 또는 화면 분리로 구분한다.
- AI 관련 시나리오는 AI가 사람을 대체한다고 말하지 않는다. 채용 지연, capacity extension, 예산 재배분 가정으로만 표현한다.

## 공통 시나리오 출력 구조

각 시나리오는 구현 시 다음 유형의 출력을 가져야 한다.

```text
scenario_id: string
scenario_name_ko: string
category: Baseline | Main | Advanced
summary_answer: string
key_outputs: object
warning_copy: string[]
ux_notes: string[]
acceptance_status_inputs: complete | partial | weak
```

## Scenario 0: Baseline / No Action

### 핵심 질문

회사가 아무것도 하지 않으면 어떻게 되는가?

### User Story

창업자 또는 HR 리더로서, 현재 보상 구조와 채용 계획을 그대로 둘 경우 어떤 보상 거버넌스 리스크가 누적되는지 보고 싶다. 그래야 별도 시나리오를 실행하기 전에 현재 상태 자체가 이미 하나의 의사결정이라는 점을 이해할 수 있다.

### Required Inputs

- `CompanyContext.company_size_band`
- `CompanyContext.funding_stage`
- `CompanyContext.has_level_system`
- `CompanyContext.has_salary_band`
- `CompanyContext.has_performance_review`
- `CompensationSnapshot.total_headcount`
- `CompensationSnapshot.total_monthly_base_pay`
- `CompensationSnapshot.total_monthly_fixed_allowance`
- `CompensationSnapshot.exception_raise_frequency`
- `CompensationSnapshot.counteroffer_frequency`
- `CompensationSnapshot.new_hire_premium_exists`
- `HiringPlan.planned_hires_6m`
- `HiringPlan.planned_hires_12m`
- `HiringPlan.average_expected_salary_by_level`

### Optional Inputs

- `CompensationSnapshot.total_expected_variable_pay`
- `CompensationSnapshot.average_salary_by_level`
- `CompensationSnapshot.headcount_by_level`
- `CompensationSnapshot.headcount_by_function`
- `CompensationSnapshot.recent_raise_budget`
- `CompensationSnapshot.pay_inversion_case_count`
- `HiringPlan.optional_cash_balance`
- `HiringPlan.optional_runway_months`

### Outputs

- 현재 CEI
- 현재 CED
- 보상 역전 사례 수
- 현재 채용 계획이 계속될 경우 예상 payroll 증가액
- 현재 채용 계획이 계속될 경우 예상 payroll 증가율
- 보상 예외 부채가 누적될 위험
- baseline explanation text

### Warning Copy

- "아무것도 하지 않는 것도 하나의 보상 의사결정입니다."
- "현재 입력만으로는 개인별 리스크를 판단하지 않습니다."
- "이 결과는 법적 판단, 시장 보상 적정성 판단, 이직 예측이 아닙니다."
- "보상 예외가 반복되면 지금은 비용이 작아 보여도 설명 가능성 부채가 누적될 수 있습니다."

### UX Notes

- 첫 화면 또는 시나리오 비교 화면에서 항상 baseline을 먼저 보여준다.
- `No Action`은 "현 상태 유지"로 번역한다.
- CEI와 CED는 점수보다 "설명 가능성", "예외 부채"라는 한국어 라벨을 우선 사용한다.
- 사용자가 다른 시나리오를 선택하면 baseline 대비 변화량을 함께 보여준다.
- payroll 증가는 월간/연간을 구분해 표시한다.

### Acceptance Criteria

- baseline은 모든 시나리오 비교의 기준으로 자동 생성된다.
- 현재 CEI, 현재 CED, pay inversion case count, payroll forecast가 표시된다.
- current hiring plan이 없으면 payroll forecast confidence를 낮추고 추가 입력 질문을 보여준다.
- 아무것도 하지 않는 선택의 비용을 설명하되 공포를 조장하지 않는다.
- 직원 단위 민감정보 없이 작동한다.

### Aha Moment

아무것도 하지 않는 것은 공짜가 아니다. 보상 설명 가능성 부채가 누적될 수 있다.

## Scenario 1: Pay Inversion Correction

### 핵심 질문

신규 입사자 또는 외부 영입자가 비교 가능한 기존 구성원보다 높게 보상받는 사례를 바로잡으려면 얼마가 드는가?

### User Story

HR 리더로서, 신규 입사자 프리미엄이나 예외 협상 때문에 생긴 보상 역전 사례를 어느 정도 예산으로, 어떤 커뮤니케이션 리스크를 감수하면서 정리할 수 있는지 보고 싶다.

### Required Inputs

- `CompensationSnapshot.pay_inversion_case_count`
- `CompensationSnapshot.average_salary_by_level`
- `CompensationSnapshot.headcount_by_level`
- `CompensationSnapshot.new_hire_premium_exists`
- `CompensationSnapshot.exception_raise_frequency`
- `CompensationSnapshot.counteroffer_frequency`
- correction rule, such as `minimum_adjustment`, `band_alignment`, or `phased_correction`
- correction budget ceiling

### Optional Inputs

- `SalaryBandModel[]`
- `CompensationSnapshot.headcount_by_function`
- out-of-band case count
- correction timing, such as immediate, 3-month phased, or 6-month phased
- exception categories to exclude from correction
- communication difficulty estimate

### Outputs

- 보상 역전 사례 수
- correction budget
- CEI improvement
- CED reduction
- communication risk
- remaining inversion cases after correction
- phased correction option, if budget is insufficient

### Warning Copy

- "이 시나리오는 개인별 급여 추천이 아니라 보상 역전 정리 예산을 추정합니다."
- "보상 역전 정리는 유지율을 보장하지 않습니다."
- "예산이 부족하면 일부 사례만 정리되어 커뮤니케이션 리스크가 남을 수 있습니다."
- "외부 시장 연봉 벤치마크는 사용하지 않습니다."

### UX Notes

- "Pay Inversion"은 사용자 화면에서 "보상 역전" 또는 "신규 입사자와 기존 구성원 간 보상 역전"으로 번역한다.
- correction budget은 "정리 필요 예산"으로 표시한다.
- CEI improvement는 "설명 가능성 개선"으로, CED reduction은 "예외 부채 감소"로 표시한다.
- communication risk는 낮음/보통/높음 band와 함께 이유를 보여준다.
- 개별 직원명이나 개별 조정액을 보여주지 않는다.

### Acceptance Criteria

- inversion case count와 correction budget이 표시된다.
- CEI 개선 방향과 CED 감소 방향이 baseline 대비 표시된다.
- correction budget ceiling이 부족하면 phased option 또는 remaining risk를 표시한다.
- 결과가 개인별 급여 조정안처럼 보이지 않는다.
- communication risk warning이 항상 포함된다.

### Aha Moment

보상 역전 정리는 단순한 보상 인상이 아니라, 앞으로의 설명 가능성과 예외 부채를 줄이는 거버넌스 투자다.

## Scenario 2: Salary Band Redesign

### 핵심 질문

현재 성장 단계에 맞는 단순한 급여 밴드 구조는 어떤 모습이어야 하는가?

### User Story

창업자 또는 HR 리더로서, 지금의 보상 구조를 지나치게 복잡한 대기업식 체계가 아니라 우리 성장 단계에 맞는 단순한 밴드로 정리하면 어떤 구조와 예산 부담이 생기는지 보고 싶다.

### Required Inputs

- `CompanyContext.company_size_band`
- `CompanyContext.funding_stage`
- `CompanyContext.has_level_system`
- `CompanyContext.has_salary_band`
- `SalaryBandModel.level`
- `SalaryBandModel.min`
- `SalaryBandModel.midpoint`
- `SalaryBandModel.max`
- `CompensationSnapshot.average_salary_by_level`
- `CompensationSnapshot.headcount_by_level`

### Optional Inputs

- `SalaryBandModel.range_spread`
- `SalaryBandModel.midpoint_progression`
- out-of-band case count
- compa-ratio distribution as aggregate bands, if available
- proposed band width assumption
- implementation budget ceiling
- exception categories to keep outside the band temporarily

### Outputs

- band structure
- employees or aggregate groups outside band
- estimated adjustment budget
- CEI improvement
- CED impact
- implementation difficulty
- band health summary

### Plain Korean Translation Rules

Technical compensation terms must be translated in UX.

| Internal Term | Korean UX Copy |
| --- | --- |
| min | 밴드 하한 |
| midpoint | 기준급 또는 밴드 중앙값 |
| max | 밴드 상한 |
| range spread | 밴드 폭 |
| midpoint progression | 레벨 간 기준급 차이 |
| compa-ratio | 밴드 내 현재 위치 |
| out-of-band cases | 밴드 밖 사례 |

### Warning Copy

- "이 밴드는 외부 시장 연봉 벤치마크가 아닙니다."
- "밴드 설계는 개인별 급여를 자동 결정하지 않습니다."
- "밴드 밖 사례가 많으면 단번에 정리하기보다 단계적 전환이 필요할 수 있습니다."
- "현재 회사의 성장 단계와 입력 데이터 품질에 따라 결과 확신도가 달라집니다."

### UX Notes

- 화면에서는 `min / midpoint / max`를 그대로 제목으로 쓰지 말고 "하한 / 기준급 / 상한"을 우선 사용한다.
- 밴드 표는 level별로 단순하게 보여준다.
- out-of-band는 개인명이 아니라 count 또는 group으로 표시한다.
- implementation difficulty는 "도입 난이도"로 표시하고 예산 부담, 커뮤니케이션 부담, 데이터 부족을 분리한다.
- band가 없는 회사에는 "초안 밴드 만들기" 흐름으로 보여준다.

### Acceptance Criteria

- min, midpoint, max, range spread, midpoint progression을 사용할 수 있다.
- 기술 용어는 plain Korean으로 번역되어 표시된다.
- 밴드 밖 사례와 예상 조정 예산이 표시된다.
- CEI improvement와 implementation difficulty가 표시된다.
- 외부 salary benchmark처럼 보이지 않는다.

### Aha Moment

급여 밴드는 단순한 숫자표가 아니라, 앞으로의 보상 결정을 설명하기 위한 운영 언어다.

## Scenario 3: Payroll Cost Forecast

### 핵심 질문

현재 채용 및 인상 계획은 향후 6-12개월 payroll에 어떤 영향을 주는가?

### User Story

창업자, HR 리더, 재무 담당자로서, 현재 채용 계획과 인상 계획이 월간 payroll과 연간 payroll에 얼마나 영향을 주는지 보고 싶다. 동시에 payroll 증가가 보상 거버넌스와 어떤 관련이 있는지도 알고 싶다.

### Required Inputs

- `CompensationSnapshot.total_monthly_base_pay`
- `CompensationSnapshot.total_monthly_fixed_allowance`
- `HiringPlan.planned_hires_6m`
- `HiringPlan.planned_hires_12m`
- `HiringPlan.average_expected_salary_by_level`
- forecast period, such as 6 months or 12 months

### Optional Inputs

- `CompensationSnapshot.total_expected_variable_pay`
- `CompensationSnapshot.recent_raise_budget`
- planned raise assumption
- promotion cycle assumption
- known recurring exception amount as aggregate
- `HiringPlan.optional_cash_balance`
- `HiringPlan.optional_runway_months`
- payroll budget ceiling

### Outputs

- monthly payroll increase
- annual payroll increase
- payroll increase rate
- optional runway impact only when optional cash or runway inputs are provided
- budget pressure flag
- explanation of main cost drivers
- CEI and CED implications if raise or exception assumptions are included

### Warning Copy

- "이 forecast는 finance-grade 예측이 아니라 보상 거버넌스 시뮬레이션입니다."
- "세금, 복리후생, equity, vendor cost를 모두 합친 Total Work Cost가 아닙니다."
- "runway impact는 선택 입력이 제공된 경우에만 표시됩니다."
- "채용 계획이 바뀌면 payroll forecast도 다시 확인해야 합니다."

### UX Notes

- `Payroll Cost Forecast`는 "Payroll 증가 예측" 또는 "인건비성 payroll 변화"로 표현한다.
- monthly/annual을 명확히 분리한다.
- increase rate는 숫자만 보여주지 말고 "현재 payroll 대비 증가율"로 설명한다.
- runway impact가 없을 때는 빈 값을 만들지 말고 "cash/runway 입력 시 표시"라고 안내한다.
- finance-grade 예측으로 오해하지 않도록 warning copy를 결과 하단에 배치한다.

### Acceptance Criteria

- monthly payroll increase, annual payroll increase, payroll increase rate가 표시된다.
- optional runway impact는 optional input이 있을 때만 표시된다.
- Total Work Cost 계산으로 확장하지 않는다.
- 주요 증가 요인을 설명문으로 보여준다.
- 6개월과 12개월 기간을 구분할 수 있다.

### Aha Moment

같은 payroll 증가라도 채용, 정기 인상, 예외 인상 중 어디에서 발생하는지에 따라 보상 거버넌스 리스크가 달라진다.

## Scenario 4: Advanced: AI Tooling + Headcount Freeze

### 핵심 질문

회사가 선택된 예정 채용을 3-6개월 늦추고 AI tooling 예산으로 capacity를 연장하면 어떻게 되는가?

### User Story

창업자 또는 리더십 팀으로서, 특정 채용을 당장 진행하지 않고 AI 도구와 업무 방식 조정으로 3-6개월을 버틸 수 있는지 보고 싶다. 단, AI가 사람을 대체한다는 결론이 아니라, 채용 지연과 capacity extension이 보상 및 조직 리스크에 어떤 영향을 주는지 확인하고 싶다.

### Required Inputs

- Advanced scenario enabled flag
- `HiringPlan.hiring_freeze_toggle`
- selected delayed hiring groups from `HiringPlan.planned_hires_6m` or `HiringPlan.planned_hires_12m`
- `HiringPlan.average_expected_salary_by_level`
- `AIScenarioInputs.hiring_delay_months`
- `AIScenarioInputs.planned_ai_tool_budget_monthly` or `AIScenarioInputs.planned_ai_tool_budget_annual`
- `AIScenarioInputs.affected_roles_or_functions`

### Optional Inputs

- `AIScenarioInputs.productivity_leakage_questions`
- `AIScenarioInputs.junior_pipeline_risk_questions`
- `CompanyContext.current_ai_tooling_level`
- compensation reallocation assumption
- workload premium assumption
- review cadence after 3 months or 6 months

### Outputs

- delayed hiring budget
- AI tooling budget
- net budget difference
- risk checklist
- junior pipeline risk flag
- productivity leakage flag
- communication warning
- assumption summary

### Warning Copy

- "이 시나리오는 AI가 사람을 대체한다고 말하지 않습니다."
- "선택한 채용을 일정 기간 늦추고 capacity를 연장하는 가정입니다."
- "AI 도구 비용과 지연된 채용 예산의 차이는 생산성 향상률이 아닙니다."
- "junior pipeline과 senior review burden이 커질 수 있습니다."
- "Advanced 시나리오이며 기본 보상 시나리오와 분리해 해석해야 합니다."

### UX Notes

- 화면 상단에 `Advanced` 배지와 설명을 붙인다.
- `Headcount Freeze`는 "채용 동결"보다 "선택 채용 지연"을 우선 사용한다. 전체 채용 중단처럼 보이지 않게 한다.
- "AI replaces people"라는 표현을 절대 쓰지 않는다.
- "capacity extended for 3-6 months"는 "3-6개월 capacity 연장 가정"으로 표현한다.
- risk checklist는 예/아니오/모름 질문으로 구성한다.
- Productivity Leakage Flag는 결과 카드에서 별도 warning으로 표시한다.

### Acceptance Criteria

- Advanced flag가 꺼져 있으면 기본 시나리오 목록에 노출되지 않는다.
- delayed hiring budget과 AI tooling budget이 분리 표시된다.
- net budget difference가 AI Cost vs Human Cost Ratio처럼 보이지 않는다.
- junior pipeline risk flag와 productivity leakage flag가 포함된다.
- AI 대체율, 생산성 향상률, 인원 대체 수를 계산하지 않는다.

### Aha Moment

AI tooling을 넣고 채용을 늦추는 결정은 비용 절감만의 문제가 아니다. capacity, senior 병목, junior pipeline, 보상 커뮤니케이션까지 함께 관리해야 한다.

## Scenario 5: Advanced: Senior Orchestrator Premium

### 핵심 질문

AI tooling 또는 headcount freeze로 지연되거나 남은 예산 일부를 더 큰 AI-enabled workflow를 조율하는 senior 인력에게 재배분하면 어떻게 되는가?

### User Story

리더십 팀 또는 HR 리더로서, AI 도구 도입 후 senior 인력이 더 넓은 업무 흐름과 검토 책임을 맡고 있다면 이를 임시 예외가 아니라 명시적인 premium pool로 설계할 수 있는지 보고 싶다.

### Required Inputs

- Advanced scenario enabled flag
- `AIScenarioInputs.orchestrator_target_count`
- `AIScenarioInputs.premium_pool_allocation_rate` or user-provided premium budget
- available budget source, such as delayed hiring budget or explicit reallocation budget
- eligibility principle for senior orchestrator premium
- review cadence or sunset condition

### Optional Inputs

- `AIScenarioInputs.hiring_delay_months`
- `AIScenarioInputs.planned_ai_tool_budget_monthly`
- `AIScenarioInputs.planned_ai_tool_budget_annual`
- `AIScenarioInputs.affected_roles_or_functions`
- existing senior exception budget as aggregate
- internal equity risk estimate
- communication difficulty estimate

### Outputs

- available premium pool
- target count
- premium per person
- CEI impact
- CED impact if exceptions are consolidated
- internal equity risk
- communication conditions
- review or sunset note

### Warning Copy

- "이 결과는 개인별 보상 추천이 아니라 premium pool 규모 검토입니다."
- "Senior orchestrator premium은 명확한 대상 기준과 review 조건이 없으면 또 다른 예외 부채가 될 수 있습니다."
- "AI 생산성 향상률을 측정하거나 보장하지 않습니다."
- "모든 AI-adjacent 역할에 premium이 필요하다는 뜻이 아닙니다."
- "Advanced 시나리오이며 기본 보상 정책과 분리해 검토해야 합니다."

### UX Notes

- `Senior Orchestrator Premium`은 "Senior 조율 역할 프리미엄 풀"로 번역한다.
- `premium per person`은 화면에서 "1인당 지급 권고"처럼 보이면 안 된다. "평균 배분 참고값" 또는 "풀 규모를 이해하기 위한 평균값"으로 표현한다.
- eligibility principle을 입력하지 않으면 결과 confidence를 낮춘다.
- internal equity risk는 반드시 함께 표시한다.
- communication conditions는 "누구에게, 어떤 기준으로, 언제 재검토할 것인가"를 포함한다.

### Acceptance Criteria

- Advanced flag가 꺼져 있으면 기본 시나리오 목록에 노출되지 않는다.
- available premium pool, target count, premium per person reference가 표시된다.
- CEI impact와 internal equity risk가 표시된다.
- 개인별 보상 추천으로 오해되지 않도록 warning copy가 포함된다.
- AI 대체율 또는 정확한 생산성 향상률을 계산하지 않는다.

### Aha Moment

Senior 조율 역할에 대한 premium은 숨은 예외로 처리하면 부채가 되지만, 명확한 기준과 재검토 조건이 있으면 설명 가능한 보상 정책이 될 수 있다.

## 공통 Acceptance Criteria

이 문서는 다음 조건을 만족해야 한다.

- baseline과 다섯 개 v1.0 시나리오만 정의한다.
- 각 시나리오는 user story, required inputs, optional inputs, outputs, warning copy, UX notes, acceptance criteria를 포함한다.
- baseline은 항상 다른 시나리오의 비교 기준이다.
- Advanced 시나리오는 기능 플래그 또는 시각적 분리 조건을 포함한다.
- AI 관련 시나리오는 AI가 사람을 대체한다는 표현을 사용하지 않는다.
- Salary Band Redesign은 technical compensation terms를 plain Korean으로 번역하는 규칙을 포함한다.
- Payroll Forecast는 optional runway impact를 선택 입력이 있을 때만 표시한다.
- 모든 시나리오는 직원 단위 민감정보 없이 aggregate 또는 grouped input으로 작동한다.
- 결과는 보상 거버넌스 판단을 돕는 설명이며 salary calculator, standalone AI workforce simulator, legal/tax calculator로 보이지 않는다.
