# HR PaySim v1.0 UI Flow

## 목적

이 문서는 HR PaySim v1.0의 사용자 흐름을 정의한다.

HR PaySim은 HR Prism의 형제 모듈이다. 사용자는 HR Prism에서 HR 시스템 진단을 먼저 받고, 보상 리스크가 높게 나타난 경우에만 HR PaySim으로 이동해 보상 거버넌스 시뮬레이션을 실행한다.

HR PaySim은 급여 계산기가 아니다. 하나의 정답을 주는 도구가 아니라, 선택지별 비용, 설명 가능성, 예외 부채, 실행 난이도, 커뮤니케이션 부담을 비교하는 보상 거버넌스 시뮬레이터다.

## HR Prism Sibling Design Principles

실제 HR Prism 코드와 디자인 토큰을 확인할 수 있는 단계가 오면, HR PaySim은 가능한 한 다음 패턴을 재사용해야 한다.

- HR Prism의 page shell, navigation, header hierarchy를 재사용한다.
- HR Prism의 diagnosis result card, risk badge, score band, recommendation CTA 패턴을 재사용한다.
- HR Prism의 질문형 입력 흐름과 progressive disclosure 방식을 따른다.
- 색상, typography, spacing, border radius, table density는 HR Prism과 동일한 기준을 따른다.
- HR PaySim 전용 장식이나 별도 브랜드 룩을 만들지 않는다.
- Advanced AI 시나리오는 HR Prism의 확장 진단처럼 보이게 하되, 기본 보상 시나리오와 시각적으로 분리한다.

## 전체 사용자 흐름

1. Entry from HR Prism
2. HR PaySim Intro
3. Quick Input
4. Governance Snapshot
5. Scenario Builder
6. Scenario Comparison
7. Decision Memo Preview
8. Aggregate Consent

## Screen 1: Entry from HR Prism

### Purpose

HR Prism 진단에서 보상 리스크가 높게 나타난 사용자를 HR PaySim으로 자연스럽게 연결한다. HR PaySim은 독립 진입 상품이 아니라 HR Prism 진단 이후의 선택적 심화 모듈로 느껴져야 한다.

### Components

- HR Prism diagnosis result card
- Compensation risk badge
- Trigger reason list
- HR PaySim CTA panel
- Secondary dismiss action
- Link to explanation: "왜 이 시뮬레이션이 필요한가요?"

### Fields

- compensation risk level
- compensation explainability level
- compensation exception debt level
- trigger reasons
- HR Prism diagnosis ID, if available
- transition CTA state

### Empty State

보상 리스크가 높지 않으면 HR PaySim CTA를 기본 노출하지 않는다.

빈 상태 카피:

> 현재 진단에서는 보상 시뮬레이션이 우선 과제로 보이지 않습니다. HR Prism의 다른 개선 항목을 먼저 확인해보세요.

### Validation

- HR Prism diagnosis shows high compensation risk, low compensation explainability, or high compensation exception debt.
- At least one trigger reason must be available.
- Entry should not appear as a generic product upsell.
- Entry should not imply legal, tax, salary market, or employee-level analysis.

### Key Korean Copy

Primary entry copy:

> 보상 쪽은 한 단계 더 시뮬레이션해볼 수 있습니다. 지금 구조에서 어떤 조정안이 비용과 설명 가능성을 어떻게 바꾸는지 보시겠어요?

CTA:

> HR PaySim으로 보상 시뮬레이션 보기

Secondary action:

> 지금은 HR Prism 결과만 볼게요

Trigger reason examples:

- 보상 설명 가능성이 낮게 나타났습니다.
- 예외 인상과 카운터오퍼 신호가 높습니다.
- 신규 입사자 프리미엄으로 보상 역전 가능성이 있습니다.

### Acceptance Criteria

- HR PaySim entry appears only from relevant HR Prism compensation risk signals.
- Entry copy matches the requested Korean copy.
- CTA preserves HR Prism visual language and does not look like a separate product advertisement.
- User can proceed or dismiss without losing HR Prism diagnosis context.
- No employee-level sensitive data is shown at entry.

## Screen 2: HR PaySim Intro

### Purpose

사용자에게 HR PaySim의 역할과 한계를 명확히 설명한다. 이 화면은 기대치를 낮추는 방어적 화면이 아니라, "무엇을 비교하고 무엇을 하지 않는지"를 짧게 정렬하는 시작 화면이다.

### Components

- Module title and subtitle
- Three-point positioning block
- "Not a salary calculator" notice
- Flow preview stepper
- Start button
- Back to HR Prism link

### Fields

- product name: HR PaySim
- client-facing description
- imported HR Prism trigger reason
- optional diagnosis summary

### Empty State

HR Prism trigger context가 없는 경우:

> HR Prism 진단 결과가 연결되지 않았습니다. 그래도 샘플 입력으로 HR PaySim 흐름을 미리 볼 수 있습니다.

이 경우 실제 시뮬레이션이 아니라 preview mode로 표시한다.

### Validation

- The screen must state that HR PaySim is not a salary calculator.
- It must state that HR PaySim is a compensation governance simulator.
- It must state that HR PaySim compares choices, not gives one perfect answer.
- It must not claim market salary accuracy, legal compliance, or attrition prediction.

### Key Korean Copy

Headline:

> HR PaySim은 보상 거버넌스 시뮬레이터입니다

Body:

> 개인별 적정 연봉을 계산하지 않습니다. 지금의 보상 구조에서 어떤 선택지가 비용, 설명 가능성, 예외 부채를 어떻게 바꾸는지 비교합니다.

Three-point copy:

- 급여 계산기가 아닙니다.
- 보상 의사결정의 설명 가능성을 시뮬레이션합니다.
- 하나의 정답이 아니라 선택지별 trade-off를 비교합니다.

CTA:

> 빠른 입력 시작하기

### Acceptance Criteria

- User understands product boundary before entering data.
- Intro uses HR Prism-like module framing rather than a marketing landing page.
- Copy clearly rejects salary calculator positioning.
- User can return to HR Prism.
- Preview mode is labeled if no HR Prism trigger exists.

## Screen 3: Quick Input

### Purpose

시뮬레이션에 필요한 최소 입력을 빠르게 수집한다. 입력은 aggregate, banded, grouped 방식으로 받고, 직원 단위 민감정보를 요구하지 않는다.

### Components

- Sectioned form
- Progress indicator
- Inline validation messages
- Save draft or continue action
- Optional AI tooling accordion, collapsed by default
- Privacy notice

### Fields

Company context:

- company size band
- funding stage
- HR owner exists
- level system exists
- salary band exists
- performance review exists
- variable pay exists
- equity plan exists
- current AI tooling level

Current compensation structure:

- total headcount
- total monthly base pay
- total monthly fixed allowance
- total expected variable pay
- average salary by level
- headcount by level
- headcount by function
- salary band model, if available

Hiring plan:

- planned hires 6 months
- planned hires 12 months
- average expected salary by level
- hiring freeze toggle
- optional cash balance
- optional runway months

Exception compensation signals:

- recent raise budget
- exception raise frequency
- counteroffer frequency
- new hire premium exists
- pay inversion case count
- out-of-band case count
- undocumented negotiation level

Optional AI tooling section, collapsed by default:

- planned AI tool budget monthly
- planned AI tool budget annual
- hiring delay months
- affected roles or functions
- productivity leakage questions
- junior pipeline risk questions
- orchestrator target count
- premium pool allocation rate

### Empty State

When no data is entered:

> 정확한 숫자가 모두 없어도 괜찮습니다. HR PaySim은 먼저 aggregate 입력으로 방향성을 확인합니다.

When salary band does not exist:

> 현재 급여 밴드가 없다면 Salary Band Redesign에서 초안 밴드를 만들어볼 수 있습니다.

When optional AI section is collapsed:

> Advanced 입력입니다. 기본 보상 시나리오에는 필요하지 않습니다.

### Validation

- Required aggregate fields must be present before Governance Snapshot.
- Currency fields must be non-negative KRW values.
- Counts must be non-negative integers.
- Company size band and total headcount should be consistent or marked approximate.
- Optional cash and runway fields should not block the main flow.
- AI tooling fields should not be required unless Advanced scenarios are enabled.
- Free-text fields should reject names, emails, phone numbers, resident IDs, and confidential identifiers.

### Key Korean Copy

Section intro:

> 개인별 급여 자료를 넣지 않아도 됩니다. 팀, 레벨, 밴드 단위의 aggregate 입력으로 충분합니다.

Privacy notice:

> HR PaySim v1.0은 직원 이름, 이메일, 주민등록번호, 개인별 원시 급여를 저장하지 않는 방향으로 설계됩니다.

AI accordion label:

> Advanced: AI tooling 가정 입력

AI accordion helper:

> 이 섹션은 AI가 사람을 대체한다는 계산이 아닙니다. 채용 지연, capacity 연장, 조율 부담을 보는 선택 입력입니다.

Continue CTA:

> 거버넌스 스냅샷 보기

### Acceptance Criteria

- Quick Input is usable without employee-level sensitive data.
- Optional AI tooling section is collapsed by default.
- Main flow can proceed without Advanced AI inputs.
- Validation messages are plain Korean and actionable.
- Input structure maps to `CompanyContext`, `CompensationSnapshot`, `HiringPlan`, `SalaryBandModel`, and optional `AIScenarioInputs`.

## Screen 4: Governance Snapshot

### Purpose

입력된 현재 상태를 기준으로 보상 거버넌스의 출발점을 보여준다. 사용자는 시나리오를 만들기 전에 현재 CEI, CED, 보상 역전 위험, payroll baseline을 이해해야 한다.

### Components

- Snapshot metric cards
- Interpretation sentence
- Risk flag list
- Baseline payroll summary
- Confidence indicator
- Continue to Scenario Builder CTA

### Fields

- CEI score and band
- CED score and band
- pay inversion risk severity
- pay inversion case count
- baseline monthly payroll
- baseline annualized payroll
- expected payroll increase if hiring plan continues
- confidence level
- missing input prompts

### Empty State

If required inputs are incomplete:

> 스냅샷을 만들기 위해 몇 가지 aggregate 입력이 더 필요합니다.

If CEI/CED confidence is low:

> 현재 결과는 방향성 참고용입니다. 입력이 보강되면 설명 가능성과 예외 부채 판단이 더 안정적입니다.

### Validation

- CEI and CED must return score, band, and explanation text.
- Pay inversion risk must show case count or "입력 필요".
- Payroll baseline must not include Total Work Cost.
- Snapshot should show missing input prompts instead of fake precision.
- Snapshot should not display employee-level data.

### Key Korean Copy

Snapshot headline:

> 현재 보상 구조의 출발점입니다

Interpretation sentence examples:

- > 현재 구조는 보상 기준을 설명하기 어렵고, 예외 인상이 반복될수록 설명 가능성 부채가 커질 수 있습니다.
- > 현재 구조는 관리 가능한 수준이지만, 신규 입사자 프리미엄이 계속되면 보상 역전 리스크가 커질 수 있습니다.

Metric labels:

- 보상 설명 가능성
- 보상 예외 부채
- 보상 역전 위험
- 현재 payroll 기준선

CTA:

> 조정 시나리오 만들기

### Acceptance Criteria

- Governance Snapshot appears after Quick Input and before Scenario Builder.
- CEI, CED, pay inversion risk, and payroll baseline are visible.
- A single key interpretation sentence is displayed.
- Low confidence results are clearly labeled.
- User can return to Quick Input to fix missing or weak inputs.

## Screen 5: Scenario Builder

### Purpose

사용자가 baseline을 기준으로 비교할 보상 거버넌스 시나리오를 선택하고 필요한 가정을 입력하게 한다. 기본 화면은 main scenarios를 우선 보여주고 Advanced scenarios는 접힌 상태로 둔다.

### Components

- Scenario selection cards
- Main scenario section
- Advanced scenario collapsed section
- Scenario-specific assumption panel
- Baseline reference panel
- Add to comparison action

### Fields

Main scenarios:

- pay inversion correction
- salary band redesign
- payroll forecast

Advanced scenarios, collapsed:

- AI Tooling + Headcount Freeze
- Senior Orchestrator Premium

Scenario-specific fields:

- correction rule
- correction budget ceiling
- band min / midpoint / max
- range spread
- midpoint progression
- forecast period
- planned raise assumption
- delayed hiring groups
- AI tooling budget
- orchestrator target count
- premium pool allocation rate

### Empty State

When no scenario is selected:

> 먼저 비교할 조정안을 선택하세요. 기본 시나리오부터 보는 것을 권장합니다.

When Advanced section is collapsed:

> Advanced 시나리오는 AI tooling이나 채용 지연 가정이 실제 의사결정에 포함될 때만 열어보세요.

### Validation

- At least one main scenario should be available after Governance Snapshot.
- Advanced scenarios require explicit expansion or feature flag.
- Scenario-specific required inputs must be validated before comparison.
- Salary Band Redesign must translate technical terms into plain Korean.
- Advanced scenarios must not ask for AI replacement percentage.
- Scenario Builder must not generate employee-level recommendations.

### Key Korean Copy

Main section label:

> 기본 보상 시나리오

Main scenario descriptions:

- > 보상 역전 정리: 신규 입사자와 기존 구성원 간 보상 역전 사례를 정리합니다.
- > 급여 밴드 재설계: 현재 성장 단계에 맞는 단순한 밴드 구조를 설계합니다.
- > Payroll 증가 예측: 현재 채용과 인상 계획의 6-12개월 영향을 봅니다.

Advanced label:

> Advanced: AI tooling과 채용 지연 가정

Advanced helper:

> 이 영역은 AI가 사람을 대체한다는 계산이 아닙니다. 선택 채용 지연, capacity 연장, senior 조율 부담을 보는 고급 시나리오입니다.

CTA:

> 비교에 추가하기

### Acceptance Criteria

- Main scenarios are shown before Advanced scenarios.
- Advanced scenarios are collapsed by default.
- Scenario cards use HR Prism-like risk/recommendation card patterns.
- User can add one or more scenarios to comparison.
- Advanced scenarios cannot make HR PaySim feel like a standalone AI workforce simulator.

## Screen 6: Scenario Comparison

### Purpose

선택한 시나리오들을 baseline과 나란히 비교한다. 사용자는 비용 변화뿐 아니라 CEI, CED, 실행 난이도, 커뮤니케이션 난이도, 핵심 trade-off를 함께 봐야 한다.

### Components

- Comparison table
- Baseline fixed column
- Scenario result columns
- Metric change badges
- Trade-off summary row
- Risk flag chips
- Select best-fit scenario action

### Fields

- annual cost delta
- monthly burn delta
- CEI change
- CED change
- pay inversion cases before and after
- execution difficulty
- communication difficulty
- key trade-off
- confidence
- risk flags

### Empty State

When no scenario has been added:

> 비교할 시나리오가 없습니다. Scenario Builder에서 하나 이상의 조정안을 추가하세요.

When scenario calculation is incomplete:

> 이 시나리오는 입력이 부족해 비교할 수 없습니다. 필요한 가정을 먼저 입력해주세요.

### Validation

- Every compared scenario must show baseline delta.
- Cost delta must be monthly and annual where applicable.
- CEI and CED changes must include direction and explanation.
- Execution and communication difficulty must be banded, not over-precise.
- Advanced scenarios must be visibly labeled Advanced.
- Comparison must not rank scenarios as universally best without context.

### Key Korean Copy

Headline:

> 어떤 조정안이 비용과 설명 가능성을 어떻게 바꾸나요?

Column labels:

- 연간 비용 변화
- 월 burn 변화
- 설명 가능성 변화
- 예외 부채 변화
- 실행 난이도
- 커뮤니케이션 난이도
- 핵심 trade-off

Best-fit helper:

> 가장 좋은 시나리오는 비용이 가장 낮은 안이 아니라, 현재 리스크와 실행 가능성에 가장 잘 맞는 안입니다.

CTA:

> Decision Memo Preview 보기

### Acceptance Criteria

- Scenario Comparison includes all requested comparison fields.
- Baseline remains visible during comparison.
- User can identify one best-fit scenario for memo preview.
- Advanced scenarios are labeled and visually separated.
- No scenario is presented as a perfect answer.

## Screen 7: Decision Memo Preview

### Purpose

무료 preview 수준의 decision memo를 보여준다. 이 화면은 formal final memo를 생성하지 않는다. 사용자가 현재 이슈, best-fit scenario, trade-off, 다음 질문을 빠르게 이해하도록 돕는다.

### Components

- Memo preview card
- Current issue section
- Best-fit scenario section
- Trade-off section
- Next question section
- Upgrade or request full memo placeholder, if later implemented
- Back to comparison action

### Fields

- current issue
- best-fit scenario
- key trade-off
- next question
- relevant CEI/CED change
- main risk flag
- preview timestamp

### Empty State

When no best-fit scenario is selected:

> Decision Memo Preview를 만들려면 먼저 비교 화면에서 하나의 시나리오를 선택하세요.

When result confidence is low:

> 입력 확신도가 낮아 memo preview는 질문 중심으로 생성됩니다.

### Validation

- Preview must include only current issue, best-fit scenario, trade-off, and next question.
- Preview must not generate a final formal memo.
- Preview must not include employee-level sensitive data.
- Preview must include caveat if input confidence is low.
- Preview must avoid legal, tax, salary benchmark, or attrition prediction claims.

### Key Korean Copy

Headline:

> Decision Memo Preview

Subcopy:

> 정식 메모가 아니라, 지금 논의해야 할 핵심 쟁점을 미리 정리한 preview입니다.

Section labels:

- 현재 이슈
- 가장 잘 맞는 시나리오
- 핵심 trade-off
- 다음에 물어볼 질문

Example next question:

> 이 조정안은 비용 부담보다 보상 설명 가능성 회복이 더 중요한 상황인가요?

### Acceptance Criteria

- Free preview includes current issue, best-fit scenario, trade-off, and next question.
- It does not generate a final formal memo.
- It can become a later paid or case-exchange deliverable, but that is not implemented here.
- Preview language is clear, Korean, and executive-readable.
- User can return to Scenario Comparison.

## Screen 8: Aggregate Consent

### Purpose

사용자에게 anonymized aggregate data를 패턴 분석과 LinkedIn/field report 인사이트에 사용할 수 있는지 명확히 동의받는다. 동의는 선택이며, 시뮬레이션 사용을 막지 않아야 한다.

### Components

- Consent panel or modal
- Plain-language data use explanation
- Included data list
- Excluded data list
- Consent checkbox
- Accept and decline actions

### Fields

Aggregate fields that may be logged with consent:

- company size band
- funding stage
- has salary band
- CEI band
- CED band
- selected scenario
- advanced scenario viewed
- productivity leakage flag
- created at
- consent for aggregate analysis

Excluded fields:

- company name
- employee names
- emails
- phone numbers
- resident IDs
- exact raw salary by named employee
- confidential identifiers
- raw payroll files

### Empty State

If user declines:

> 동의하지 않아도 HR PaySim 결과는 계속 확인할 수 있습니다.

If aggregate logging is unavailable:

> 현재 aggregate 분석 수집은 비활성화되어 있습니다.

### Validation

- Consent must be explicit.
- No aggregate event should be persisted unless consent is true.
- Consent copy must distinguish anonymized aggregate analysis from individual data storage.
- Consent copy must state that company name usage requires separate permission.
- Declining consent must not block user flow.
- Consent status must be stored separately from scenario outputs.

### Key Korean Copy

Headline:

> 익명 aggregate 분석에 동의하시겠어요?

Body:

> 동의하면 회사 규모 구간, 투자 단계, 선택한 시나리오, CEI/CED 구간처럼 개인이나 회사를 직접 식별하지 않는 aggregate 정보만 HR PaySim의 패턴 분석과 LinkedIn/field report 인사이트에 사용합니다.

Excluded data copy:

> 직원 이름, 이메일, 전화번호, 주민등록번호, 개인별 원시 급여, 회사 식별 정보는 저장하지 않습니다.

Company name permission copy:

> 회사명 또는 식별 가능한 사례를 외부에 언급하는 것은 별도 허가가 있을 때만 가능합니다.

Consent checkbox:

> 익명 aggregate 분석에 사용하는 것에 동의합니다.

Actions:

- 동의하고 계속
- 동의하지 않고 계속

### Acceptance Criteria

- Aggregate consent is optional and explicit.
- Decline path works without blocking the product.
- Copy states what is included and excluded.
- Copy states that public posts use only anonymized and aggregated patterns, with no company-identifying figures.
- Company name usage is handled through separate permission.
- Logged data matches `AggregateLogEvent`.
- No employee-level sensitive data is requested or stored.

## Cross-Screen Acceptance Criteria

- UI flow begins from HR Prism compensation risk trigger.
- HR PaySim Intro clearly states that this is not a salary calculator.
- Quick Input uses aggregate, banded, or grouped inputs.
- Optional AI tooling input is collapsed by default.
- Governance Snapshot shows CEI, CED, pay inversion risk, payroll baseline, and one key interpretation sentence.
- Scenario Builder shows main scenarios first and Advanced scenarios collapsed.
- Scenario Comparison compares annual cost delta, monthly burn delta, CEI change, CED change, execution difficulty, communication difficulty, and key trade-off.
- Decision Memo Preview is free-preview level only and does not create a final formal memo.
- Aggregate Consent is explicit, optional, and anonymized.
- Visual language should reuse HR Prism patterns before adding HR PaySim-specific UI.

