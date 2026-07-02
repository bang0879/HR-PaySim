# HR PaySim v1.0 Privacy and Aggregate Logging

## 목적

이 문서는 HR PaySim v1.0의 privacy-safe data handling과 anonymized aggregate logging 원칙을 정의한다.

HR PaySim은 보상 거버넌스 시뮬레이터이므로 민감한 보상 데이터를 다룰 수 있다. v1.0은 직원 단위 식별 정보와 raw compensation file 저장을 피하고, aggregate 및 banded input 중심으로 작동해야 한다.

## Privacy Principles

1. 민감한 보상 데이터 수집을 최소화한다.
2. aggregate 및 banded input을 우선 사용한다.
3. employee-level identifiable data를 저장하지 않는다.
4. v1.0에서는 raw company confidential compensation file을 저장하지 않는다.
5. aggregate logging은 opt-in 또는 명시적 동의 기반이어야 한다.
6. aggregate log는 pattern analysis와 LinkedIn/field report insight 용도로만 사용한다.

## 1. Data That May Be Collected During Session

세션 중에는 시뮬레이션 계산을 위해 다음 데이터를 입력받을 수 있다. 기본 원칙은 저장보다 계산과 preview에 필요한 최소 세션 데이터로 다루는 것이다.

### Company Context

- company size band
- funding stage
- HR owner 여부
- level system 여부
- salary band 여부
- performance review 여부
- variable pay 여부
- equity plan 여부
- current AI tooling level

### Aggregate Compensation Snapshot

- total headcount
- total monthly base pay
- total monthly fixed allowance
- total expected variable pay
- average salary by level
- headcount by level
- headcount by function
- recent raise budget
- exception raise frequency
- counteroffer frequency
- new hire premium exists
- pay inversion case count
- out-of-band case count
- undocumented negotiation level

### Hiring Plan

- planned hires for 6 months
- planned hires for 12 months
- average expected salary by level
- hiring freeze toggle
- optional cash balance
- optional runway months

### Salary Band Model

- level
- min
- midpoint
- max
- range spread
- midpoint progression

### Advanced Optional AI Inputs

Advanced 시나리오가 열렸을 때만 다음 입력을 받을 수 있다.

- planned AI tool budget monthly
- planned AI tool budget annual
- hiring delay months
- affected roles or functions
- productivity leakage questions
- junior pipeline risk questions
- orchestrator target count
- premium pool allocation rate

## 2. Data That Must Never Be Stored

v1.0에서는 다음 데이터를 저장하지 않는다.

- employee names
- employee emails
- phone numbers
- resident IDs
- exact raw salary by named employee
- employee-level payroll rows
- raw salary file or payroll export
- company confidential compensation files
- company confidential identifiers unless separately consented
- free-text notes that identify employees, candidates, founders, investors, or confidential clients
- individual attrition prediction input or output
- legal/tax-grade equity calculation files

## 3. Optional Fields

다음 필드는 선택 입력이며, 제품 사용을 막는 필수 요건이 아니다.

- optional cash balance
- optional runway months
- total expected variable pay
- recent raise budget
- salary band model when no current band exists
- compa-ratio distribution as aggregate bands
- AI tooling budget
- hiring delay months
- productivity leakage questions
- junior pipeline risk questions
- testimonial consent
- company name usage permission

선택 입력이 없으면 UI는 빈 값이나 추정값을 만들지 않고, 해당 결과를 숨기거나 "입력 시 표시"로 안내해야 한다.

## 4. Aggregate Log Fields

Aggregate logging은 `docs/hr-paysim/02_data_schema.md`의 `AggregateLogEvent`와 일치해야 한다.

| Field | Required | Privacy Handling |
| --- | --- | --- |
| company_size_band | Required | exact headcount가 아니라 size band만 저장 |
| funding_stage | Required | stage category만 저장 |
| has_salary_band | Required | boolean만 저장 |
| cei_band | Required | exact CEI score가 아니라 band만 저장 |
| ced_band | Required | exact CED score가 아니라 band만 저장 |
| selected_scenario | Required | v1.0 scenario ID만 저장 |
| advanced_scenario_viewed | Required | boolean만 저장 |
| productivity_leakage_flag | Optional | underlying answer text 없이 boolean만 저장 |
| created_at | Required | ISO 8601 timestamp |
| consent_for_aggregate_analysis | Required | true일 때만 event 저장 |

Aggregate logs must not include:

- company name
- user name
- employee name
- raw payroll values
- salary by named employee
- free-text memo content
- uploaded file content
- exact cash balance or runway figures
- HR Prism diagnosis ID if it identifies the company

## 5. Consent Copy in Korean

### Short Consent Copy

> 익명 aggregate 분석에 동의하시겠어요? 동의하면 회사 규모 구간, 투자 단계, 선택한 시나리오, CEI/CED 구간처럼 개인이나 회사를 직접 식별하지 않는 정보만 모아 HR PaySim의 패턴 분석과 LinkedIn/field report 인사이트에 사용합니다.

### Detailed Consent Copy

> HR PaySim은 직원 이름, 이메일, 전화번호, 주민등록번호를 aggregate 분석에 저장하지 않습니다. 개인별 급여도 공개하거나 저장하지 않습니다. 공개 글이나 리포트에는 회사를 식별할 수 있는 수치나 사례를 포함하지 않고, 익명화되고 집계된 패턴만 사용합니다.
>
> 회사명 사용은 별도 허가가 필요합니다. aggregate 분석 동의는 회사명 공개 동의가 아닙니다.

### Consent Checkbox

> 익명화된 aggregate 데이터를 HR PaySim의 패턴 분석과 LinkedIn/field report 인사이트에 사용하는 것에 동의합니다.

### Decline Copy

> 동의하지 않아도 HR PaySim 결과는 계속 확인할 수 있습니다.

### Separate Company Name Permission Copy

> 회사명 또는 식별 가능한 사례를 외부에 언급하는 것은 별도 허가가 있을 때만 가능합니다.

## 6. Anonymizing Company Size and Funding Stage

Company size는 exact headcount가 아니라 band로 저장한다.

Allowed company size bands:

- `1-10`
- `11-30`
- `31-50`
- `51-100`
- `101-300`
- `301-500`
- `501+`

Funding stage는 exact funding amount, investor name, valuation, runway detail 없이 category로 저장한다.

Allowed funding stages:

- `bootstrapped`
- `pre_seed`
- `seed`
- `series_a`
- `series_b`
- `series_c_plus`
- `profitable`
- `unknown`

If a company size band and funding stage combination could identify a company in a small market context, public content should merge it into a broader category before publication.

Example:

- Stored event: `company_size_band = 51-100`, `funding_stage = series_a`
- Public content: "Series A 전후의 50-100명 규모 스타트업에서 자주 보이는 패턴"

## 7. Company Name Usage

Aggregate data consent and company name usage permission must be separate.

Aggregate data consent allows:

- anonymized pattern analysis
- aggregate field report insights
- LinkedIn content based on grouped patterns
- internal learning about scenario usage

Aggregate data consent does not allow:

- company name disclosure
- identifiable client story
- exact company numbers in public posts
- logo use
- quote or testimonial publication

Company name usage requires a separate explicit permission record with:

- company name
- permitted usage type
- approved wording or quote
- allowed channel, such as website, LinkedIn, deck, or proposal
- approver name and date
- expiration or withdrawal condition, if any

## 8. Case-Exchange Pilot Support

초기 pilot에서는 free Decision Memo가 가능하다. 다만 이것은 자동 권리가 아니라 case-exchange 조건을 명확히 합의한 경우에만 제공한다.

Recommended pilot exchange:

- HR Prism first
- HR PaySim only if compensation risk is high
- HR PaySim preview can be free
- first pilot Decision Memo may be free
- exchange can include anonymized aggregate data consent
- exchange can optionally include testimonial permission
- testimonial and company name usage require separate permission

Suggested Korean copy:

> 초기 pilot에서는 Decision Memo를 무료로 제공할 수 있습니다. 대신 개인이나 회사를 식별하지 않는 aggregate 패턴 분석 사용에 동의해주실 수 있습니다. 회사명 공개나 testimonial 사용은 별도 허가가 있을 때만 진행합니다.

Case-exchange must not require:

- employee-level data disclosure
- individual salary disclosure
- raw salary file retention
- public company naming
- testimonial approval as a condition of using the simulator

## 9. Data Deletion Approach

v1.0 should support the following deletion approach.

### Session Data

- Clear session input when the user resets the simulation.
- Do not persist raw uploaded files.
- If temporary processing is later added, discard raw files after aggregate extraction.

### Scenario Results

- Allow deletion of saved scenario results, if saving is implemented.
- Saved results must not include employee-level sensitive data.
- Decision Memo Preview should be deletable with its scenario session.

### Aggregate Logs

- Aggregate logs are anonymized and may not be reversible to a company identity.
- If a user requests deletion before aggregation or publication, delete the identifiable consent linkage and any pending event not yet aggregated.
- If logs are already aggregated into non-identifying pattern counts, deletion may not be technically attributable to one company; this limitation must be disclosed in privacy copy if implemented.

### Company Name Permission

- Company name permission and testimonial permission must be separately revocable.
- Revocation should stop future usage.
- Existing public posts may require manual takedown or correction workflow.

## 10. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| User uploads raw salary files despite guidance | v1.0 should avoid raw file upload; if upload is later added, process locally or temporarily, extract aggregate values, then discard raw file. |
| Aggregate data could identify a company in a small niche | Use broader public categories and suppress rare combinations. |
| Consent is misunderstood as company name permission | Keep aggregate consent and company name usage permission separate. |
| Public LinkedIn post reveals identifying figures | Use only grouped patterns, avoid exact counts, exact payroll deltas, exact company details, and confirm sensitive examples manually. |
| Employee-level data appears in free text | Reject or filter names, emails, phone numbers, resident IDs, and identifiable notes. |
| Decision Memo Preview contains sensitive details | Use aggregate scenario outputs and remove individual references. |
| AI scenario appears like an AI replacement model | Keep Advanced copy explicit: hiring is delayed or capacity is extended; AI does not replace people. |
| Consent is bundled with product access | Declining aggregate consent must not block HR PaySim usage. |

## Acceptance Criteria

This document is acceptable when:

- It prohibits employee-level PII storage.
- It prohibits raw salary file persistence in v1.0.
- Aggregate log schema matches `docs/hr-paysim/02_data_schema.md`.
- Consent is explicit and separable.
- Consent copy states no employee names.
- Consent copy states no individual salary disclosure.
- Consent copy states no company-identifying figures in public posts.
- Consent copy states only anonymized and aggregated patterns are used.
- Consent copy states company name usage requires separate permission.
- Case-exchange pilot terms do not require employee-level data disclosure.
- Aggregate logging is limited to pattern analysis and LinkedIn/field report insights.
