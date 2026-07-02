# HR PaySim Full Redesign Brief

## 1. Purpose

This document resets the product flow for HR PaySim before visual design work begins.

The current build has useful parts:

- data schema
- synthetic sample data
- calculation functions
- basic input UI
- governance snapshot
- scenario builder
- scenario comparison

But the current experience still feels like separate tool screens. A founder can see many cards, numbers, and scenario names, but may not understand why they are being shown or what decision they should make next.

The redesign goal is to make HR PaySim feel like a guided compensation decision flow, not a dashboard and not a salary calculator.

## 2. Product Definition for Redesign

HR PaySim helps a founder understand whether the current compensation problem is mainly about:

- cost
- unclear pay rules
- repeated exceptions
- new hire pay becoming hard to explain
- hiring plans that may make payroll harder to manage
- AI tooling decisions that change hiring timing or senior workload

HR PaySim should then show a small number of realistic choices and explain what the founder gains and what the founder must accept with each choice.

Short product sentence:

> HR PaySim helps a founder see what is wrong with the current compensation structure, choose a realistic compensation decision, and understand what that decision will cost or make harder.

## 3. Why Full Redesign Is Needed

The existing screens are not wrong individually. The problem is the overall story.

Current issue:

- The user sees input, snapshot, scenarios, and comparison as separate screens.
- Scenario cards appear too early and too broadly.
- The product explains metrics, but does not yet guide the founder through a decision.
- AI scenarios are visible as a feature group, which can make the product feel like an AI workforce simulator.
- The founder does not get enough plain interpretation between steps.

Required change:

- Start with the founder's problem.
- Ask for data only when the data supports the next decision.
- Show diagnosis before scenarios.
- Add plain interpretation before recommendations.
- Recommend only a few scenarios first.
- Treat AI as an additional lens, not the main product.
- End with a clear "what you gain / what you accept" decision view.

## 4. Core User Story

As a founder or CEO, I want to upload or enter compensation-related data, understand what compensation problem I actually have, compare a few realistic choices, and leave with a clear view of what I should discuss with my team next.

The founder should not feel:

- "I am filling out an HR form."
- "This is calculating everyone's salary."
- "This is an AI replacement calculator."
- "I need to understand compensation jargon."

The founder should feel:

- "I can see where the compensation problem is."
- "I understand why this may become hard to explain later."
- "I know which choices are worth comparing first."
- "I can see what each choice gives me and what it makes harder."

## 5. Language Rules

All Korean copy in HR PaySim must be simple, direct, and founder-friendly.

Use:

- short sentences
- plain Korean
- concrete business situations
- direct explanations
- "얻는 것 / 감수할 것" instead of abstract trade-off language
- "나중에 설명하기 어려워질 수 있습니다" instead of vague risk language

Avoid:

- English translation tone
- consulting-heavy phrases
- abstract metaphors
- inflated product language
- jargon where a founder-facing phrase can work

Words and phrase replacements:

| Avoid | Prefer |
| --- | --- |
| 압력이 커집니다 | 부담이 커집니다 / 관리가 어려워집니다 |
| 리스크가 누적됩니다 | 나중에 설명하기 어려워질 수 있습니다 |
| 레버리지 | 더 큰 일을 맡는 구조 / 효과를 키우는 방식 |
| capacity | 감당 가능한 일의 양 |
| orchestrator | 여러 업무를 조율하는 senior |
| advanced scenario lens | 추가 검토 항목 |
| trade-off | 얻는 것과 감수할 것 |
| payroll pressure | 매달 나가는 인건비 부담 |
| productivity leakage | 일이 빨라져도 회사 성과로 이어지지 않는 상태 |

Tone examples:

- Good: "예외 인상이 반복되면 나중에 기준을 설명하기 어려워질 수 있습니다."
- Avoid: "보상 예외 부채 압력이 커집니다."

- Good: "일은 빨라져도 검토와 책임이 특정 senior에게 몰릴 수 있습니다."
- Avoid: "AI 기반 생산성 압력이 senior orchestrator에게 집중됩니다."

- Good: "이 선택은 비용은 늘지만, 기존 구성원에게 설명하기 쉬운 기준을 회복하는 데 도움이 됩니다."
- Avoid: "이 시나리오는 단기 비용 상승에도 불구하고 compensation explainability 개선에 유리합니다."

## 6. Design Principle

HR PaySim should be a guided flow, not a collection of pages.

The founder should move through the product in this order:

1. Why am I here?
2. What data do I need to provide?
3. What did HR PaySim find?
4. What does that mean in plain language?
5. Which decisions should I compare first?
6. Is there an AI-related hiring or workload question worth checking?
7. What do I gain and what do I accept if I choose one option?
8. What should I discuss next?

Do not show every metric, scenario, and table at once.

## 7. New Product Flow

### Step 1. Entry / Preview Gate

Purpose:

Clarify whether the user is entering from HR Prism or viewing HR PaySim as a preview.

Founder-facing question:

> 왜 지금 보상 시뮬레이션을 봐야 하나요?

States:

1. HR Prism-triggered mode
2. Preview mode without HR Prism data

Copy direction:

- HR Prism-triggered: "HR Prism에서 보상 기준을 설명하기 어려운 신호가 확인되었습니다."
- Preview: "HR Prism 진단 없이 보는 미리보기입니다. 실제 결과는 입력 데이터에 따라 달라집니다."

Design notes:

- Do not make this a marketing landing page.
- Show one primary action: "보상 구조 확인 시작"
- If preview mode, label it clearly.

### Step 2. Problem Intake

Purpose:

Let the founder choose how to provide data.

Founder-facing question:

> 지금 보상 구조를 어떻게 확인할까요?

Input options:

1. 직접 입력
2. CSV 업로드
3. 샘플 데이터로 미리보기

Copy direction:

> 개인별 연봉을 판단하지 않습니다. 보상 구조를 보기 위해 필요한 값만 사용합니다.

Design notes:

- CSV upload should feel convenient, not scary.
- Direct input should be short and grouped.
- Sample preview should be allowed for demos.

### Step 3. Aggregate Data Review

Purpose:

Show what HR PaySim extracted or understood before analysis begins.

Founder-facing question:

> HR PaySim이 이렇게 이해해도 될까요?

Show:

- total headcount
- monthly base pay total
- fixed allowance total
- level or group summaries
- hiring plan summary
- exception signals
- missing fields

Privacy copy:

> 직원 이름, 이메일, 개인별 원시 급여는 저장하지 않습니다. 분석에는 그룹 단위로 정리된 값만 사용합니다.

CSV handling rule:

- Do not persist raw uploaded files.
- Convert uploaded data into aggregate values.
- Warn if employee names, emails, phone numbers, or resident IDs are detected.
- Ask the user to confirm the aggregate view before continuing.

Design notes:

- This is not a spreadsheet screen.
- It should feel like a short "확인 화면".
- Missing fields should be written plainly.

### Step 4. Governance Diagnosis

Purpose:

Show the current compensation situation before showing scenarios.

Founder-facing question:

> 지금 보상 문제는 어디에 있나요?

Show:

- 보상 설명 가능성
- 예외 인상 반복 정도
- 보상 역전 가능성
- 매달 나가는 인건비 기준선

Metric labels:

- CEI can be shown as "보상 설명 가능성"
- CED can be shown as "반복된 예외 인상"
- Pay inversion can be shown as "신규 입사자와 기존 구성원 간 보상 역전"
- Payroll baseline can be shown as "현재 매달 나가는 인건비"

Design notes:

- Plain interpretation must appear before detailed numbers.
- Avoid making the screen look like a finance report.
- Keep scores secondary.

### Step 5. Expert Interpretation

Purpose:

Translate the diagnosis into founder-facing meaning.

Founder-facing question:

> 이 결과를 어떻게 봐야 하나요?

This step is the key missing part in the current build.

Example interpretation copy:

- "현재 문제는 보상 수준보다 보상 기준을 설명하기 어려운 데 있을 수 있습니다."
- "예외 인상이 반복되면 나중에 왜 누구는 올리고 누구는 안 올렸는지 설명하기 어려워질 수 있습니다."
- "신규 입사자 보상이 기존 구성원보다 높아지는 구간이 있으면, 다음 인상 때 기준이 흔들릴 수 있습니다."
- "아무것도 하지 않는 것도 하나의 선택입니다. 다만 지금의 설명하기 어려운 상태가 다음 채용에도 이어질 수 있습니다."

Design notes:

- This can be a strong card or section, not necessarily a separate page.
- It should feel like an expert sitting next to the founder.
- Keep it short. One main interpretation and 2-3 supporting points are enough.

### Step 6. Recommended Scenarios

Purpose:

Recommend the first scenarios worth checking based on the diagnosis.

Founder-facing question:

> 지금은 어떤 선택지를 먼저 비교해야 하나요?

Do not show all scenarios equally.

Recommendation rules:

| Signal | Recommended scenario |
| --- | --- |
| 보상 역전 사례가 많음 | 보상 역전 정리 |
| 보상 설명 가능성이 낮음 | 급여 밴드 재설계 |
| 급여 밴드가 없음 | 급여 밴드 재설계 |
| 예외 인상이 반복됨 | 보상 역전 정리 / 예외 기준 정리 |
| 채용 계획으로 인건비가 크게 늘어남 | 인건비 증가 예측 |
| 채용 유예나 AI 도구 사용을 고민 중 | AI 도구와 채용 시점 추가 검토 |
| senior에게 검토와 책임이 몰림 | senior 역할 보상 추가 검토 |

Scenario card should show:

- why this scenario is recommended
- what it checks
- what it will not claim
- expected decision output

Example:

> 추천 이유: 신규 입사자와 기존 구성원 사이의 보상 차이를 설명하기 어려워질 수 있습니다.

Design notes:

- Show 2-3 recommended scenarios first.
- Put other scenarios behind "다른 선택지도 보기".
- Keep Advanced scenarios visually quieter unless relevant.

### Step 7. AI-Related Additional Check

Purpose:

Show AI-related insight only when it helps the compensation decision.

Founder-facing question:

> AI 도구나 채용 시점까지 함께 봐야 할까요?

This is not a standalone AI workforce simulator.

When to show as recommended:

- planned hires exist in the next 6-12 months
- user selected hiring freeze or hiring delay
- company already uses AI tools at team level or above
- user enters AI tool budget
- senior workload or review burden is flagged

When not recommended:

- no hiring plan
- no AI tool budget
- no current AI usage
- no stated hiring delay question

Copy direction:

> AI가 사람을 대신한다는 계산이 아닙니다. 채용 시점을 늦추면 일이 어디에 몰리는지, 어떤 보상 논의가 생길 수 있는지 보는 추가 검토입니다.

Show:

- delayed hiring budget
- AI tool budget
- senior review burden
- junior hiring or learning concern
- whether saved time becomes company output

Avoid:

- AI replacement percentage
- exact productivity gain percentage
- "AI가 몇 명을 대체한다" copy
- standalone AI simulator framing

### Step 8. Decision Comparison

Purpose:

Compare selected scenarios in decision language.

Founder-facing question:

> 각 선택지는 무엇을 얻고 무엇을 감수해야 하나요?

Show per scenario:

- annual cost change
- monthly payroll change
- 보상 설명 가능성 before / after
- 반복된 예외 인상 before / after
- 보상 역전 case change
- 실행 난이도
- 설명 난이도
- founder gets
- founder accepts
- next internal question

Copy direction:

- "가장 비용이 낮은 안이 항상 가장 좋은 안은 아닙니다."
- "이 선택은 비용은 늘지만, 기존 구성원에게 설명하기 쉬운 기준을 회복하는 데 도움이 됩니다."
- "이 선택은 채용 시점을 늦추는 대신, 지금 있는 사람에게 일이 더 몰릴 수 있는지 확인해야 합니다."

Design notes:

- Prefer decision cards over dense tables.
- Baseline should remain visible.
- The product should not rank one scenario as universally best.

### Step 9. Decision Memo Preview

Purpose:

Summarize the decision discussion without creating a final formal memo yet.

Founder-facing question:

> 이 내용을 팀과 어떻게 논의하면 될까요?

Preview should include:

- current issue
- selected scenario
- why it is being considered
- what the company gains
- what the company accepts
- next question to ask internally

Copy direction:

> 정식 메모가 아니라, 지금 논의해야 할 내용을 짧게 정리한 미리보기입니다.

Out of scope:

- final paid memo
- PDF generation
- legal or tax advice
- employee-level pay recommendation

## 8. Existing Work: Keep, Reuse, or Replace

Keep and reuse:

- data schema
- validation rules
- synthetic company examples
- CEI and CED calculation logic
- pay inversion detection
- payroll forecast logic
- AI-related calculation logic, as long as it remains assumption-based
- tests that protect strict exclusions

Replace or redesign:

- standalone static screen experience
- scenario builder as a full menu
- comparison table as the primary decision surface
- jargon-heavy copy
- any screen that shows too much before the founder understands the problem

Keep as reference only:

- current Quick Input layout
- current Governance Snapshot cards
- current Scenario Builder cards
- current Scenario Comparison cards

These can inform visual components, but the product flow should be redesigned from the founder's decision journey.

## 9. State and Data Flow Requirements

The redesigned app should treat the flow as one session.

Session steps:

1. entry context
2. intake method
3. aggregate data confirmation
4. diagnosis result
5. interpretation result
6. recommended scenarios
7. selected scenarios
8. comparison result
9. memo preview

State rules:

- If the user changes input data, diagnosis and later results must be marked stale.
- If the user changes scenario assumptions, comparison and memo preview must be recalculated or marked stale.
- Optional AI data must not block the main compensation flow.
- Preview mode must be clearly labeled.
- HR Prism-triggered mode should preserve trigger reason if available.

## 10. Visual Design Direction

The design should feel calm, practical, and founder-friendly.

Do:

- use a clear stepper
- show one primary action per step
- use short interpretation cards
- use recommendation cards
- show "얻는 것 / 감수할 것" clearly
- make privacy reassurance visible near intake and CSV upload
- visually separate AI-related checks from main compensation decisions

Do not:

- make a marketing landing page
- show every scenario on the first screen
- use a dense dashboard as the first experience
- use decorative hero graphics
- use jargon-heavy labels
- make AI look like the main product
- make the comparison look like a finance spreadsheet

## 11. Design Deliverables for Next Session

The next design session should produce:

1. Full guided flow wireframe
2. First-screen layout
3. Intake method selection screen
4. CSV upload and aggregate confirmation screen
5. Governance diagnosis screen
6. Expert interpretation section
7. Recommended scenario screen
8. AI-related additional check screen
9. Decision comparison screen
10. Decision memo preview screen

For each screen, include:

- headline
- founder-facing question
- main components
- primary CTA
- empty or missing data state
- sample Korean copy
- notes on what must not appear

## 12. Acceptance Criteria

The redesign brief is successful when:

- HR PaySim is framed as a guided compensation decision flow.
- The founder sees one step at a time.
- The first screen does not show all scenarios or all metrics.
- CSV upload is allowed only with aggregate extraction and no raw file persistence.
- Each major step includes plain expert interpretation.
- Scenario recommendations are based on diagnosis signals.
- AI is shown only as an additional check, not as a standalone product.
- Final comparison shows what the founder gains and what the founder accepts.
- All Korean copy is plain, direct, and free of hype.
- Strict exclusions remain intact:
  - no AI replacement percentage
  - no Total Work Cost formula
  - no fake attrition probability
  - no employee-level sensitive data storage
  - no external salary market data integration
  - no legal or tax-grade stock option calculation

