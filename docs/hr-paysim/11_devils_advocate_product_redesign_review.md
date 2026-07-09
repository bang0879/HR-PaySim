# HR PaySim Devil's Advocate Product Redesign Review

작성일: 2026-07-08

상태: 구현 중단. 엔진 복원, Vite 구조 정리, `PaySimShell` 전환, main 병합은 제품 계약을 다시 쓰기 전까지 진행하지 않는다.

리뷰 기준: "이 정도면 넘어갈 만하다"는 금지한다. "이건 완벽해서 고칠 필요 없다"고 말할 수 없는 것은 전부 고친다.

## 검토한 근거

- `docs/hr-paysim/00_product_thesis.md`
- `docs/hr-paysim/09_stack_decision.md`
- `docs/hr-paysim/10_build_rules.md`
- `docs/hr-paysim/app-build-qa.md`
- `docs/hr-paysim/final-design-acceptance.md`
- `docs/superpowers/specs/2026-07-03-hr-paysim-app-build-design.md`
- `docs/superpowers/plans/2026-07-03-hr-paysim-app-build.md`
- `docs/superpowers/plans/2026-07-06-hr-paysim-engine-reconciliation.md`
- `prototypes/hr-paysim-redesign/app.js`
- `src/lib/hr-paysim/domain.ts`
- `src/lib/hr-paysim/calculations.ts`
- `src/lib/hr-paysim/recommendations.ts`
- `src/lib/hr-paysim/copy.ts`
- `src/lib/hr-paysim/prototypeViewModel.ts`
- `src/components/hr-paysim/PrototypePaySimApp.tsx`
- `src/components/hr-paysim/PaySimShell.tsx`
- `src/components/hr-paysim/screens/index.tsx`
- `tests/hr-paysim/*.test.ts`

참고: OneDrive ACL 문제로 이미지 뷰어에서 PNG reference를 직접 열지는 못했다. 다만 정적 프로토타입 코드, React 앱 코드, QA 문서, 테스트, 제품 thesis만으로도 현재 제품 실패 지점은 충분히 판단 가능하다.

## 결론 요약

HR PaySim 안에는 좋은 thesis가 있다. 하지만 현재 앱은 그 thesis를 제품 경험으로 설득하지 못한다.

문서상 HR PaySim은 "보상 거버넌스 시뮬레이터"다. 그런데 현재 사용 경험은 더 가깝게 말하면 이렇다.

```text
많은 보상 주변 숫자 입력 -> CEI/CED 점수 확인 -> 비용성 시나리오 비교 -> 메모 복사
```

이 흐름은 HR Prism 같은 aha moment를 만들지 못한다. 대표가 "내가 잘못된 문제를 보고 있었구나"라고 느끼기보다, "입력 많이 했고, 점수와 비교표를 받았다"에 머문다.

현재 문제의 1순위는 엔진이 짧다는 것도 아니고, Vite 구조가 중복됐다는 것도 아니다. 둘 다 실제 문제지만 후순위다. 핵심 문제는 제품 계약이 흐릿하다는 것이다.

- 앱이 왜 이 입력을 요구하는지 먼저 설득하지 못한다.
- 점수가 나오기 전에 사용자가 그 점수를 궁금해하지 않는다.
- CEI/CED라는 지표가 작동하려면 근거와 해석이 필요한데, 현재는 이름과 숫자가 먼저 나온다.
- 시나리오 비교는 의사결정 관점보다 엑셀 계산표처럼 보인다.
- "거버넌스"를 말하지만, 대표가 어떤 보상 의사결정을 후회하게 되는지 정면으로 보여주지 못한다.

따라서 다음 단계는 engine reconciliation이 아니라 제품 재정의다.

## 1. HR PaySim이 진짜 측정해야 하는 것

### 보상 수준을 측정하면 안 된다

보상 수준을 측정하려면 시장 연봉 데이터, 역할/레벨 benchmark, 개인별 급여 맥락, 법적/세무적 리스크가 필요하다. 제품 thesis도 이를 명확히 배제한다.

HR PaySim이 "우리가 충분히 주고 있나?"를 답하려고 하면 약한 salary calculator가 된다.

판단: 보상 수준은 core가 아니다.

### Payroll pressure도 core가 아니다

Payroll pressure는 중요하지만, 그 자체는 재무 계산이다. 인원 증가와 평균 보상을 곱하면 대표도 엑셀에서 대략 볼 수 있다.

Payroll pressure가 제품 가치가 되려면 이런 질문에 연결돼야 한다.

- 지금 보상 불일치를 고칠 여력이 있는가?
- 지금 미루면 어떤 설명 부채가 생기는가?
- 돈을 써서 진짜 문제를 고치는가, 아니면 문제를 6개월 미루는가?

판단: payroll pressure는 supporting signal이다.

### CEI/CED는 hero metric이 되기엔 아직 약하다

CEI와 CED는 좋은 개념이다. 하지만 지금처럼 먼저 점수로 제시하면 발명된 지표처럼 보인다.

대표가 먼저 느껴야 하는 것은 "우리 보상 기준을 설명할 수 없다" 또는 "이번 예외가 다음 예외의 선례가 된다"는 압박이다. 그다음에 CEI/CED가 그 압박을 압축하는 지표가 되어야 한다.

판단: CEI/CED는 story의 결과여야지 story 자체가 아니다.

### HR PaySim의 진짜 측정 대상은 보상 의사결정 품질이다

가장 설득력 있는 정의는 이것이다.

```text
HR PaySim은 다음 채용, retention, 예외 인상 압력이 왔을 때도 지금의 보상 결정을 설명하고, 반복하고, 감당하고, 방어할 수 있는지를 측정한다.
```

즉 HR PaySim은 다음 다섯 가지를 봐야 한다.

1. 설명 가능성: 이 결정을 원칙으로 설명할 수 있는가?
2. 반복 가능성: 다음 유사 사례에도 같은 기준을 적용할 수 있는가?
3. 예외 부채: 오늘의 예외가 미래의 설명 부담을 얼마나 만드는가?
4. 예산 압력: 지금 고칠 여력과 나중에 미룰 비용은 어떻게 다른가?
5. 의사결정 타이밍: 이건 급여 수준 문제인가, 기준 문제인가, 예산 문제인가, 커뮤니케이션 문제인가?

제품 정의를 이렇게 바꾸는 편이 낫다.

```text
HR PaySim은 대표가 마주한 보상 의사결정이 pay-level 문제인지, rule 문제인지, budget 문제인지, communication debt 문제인지 구분해주는 founder-facing compensation decision simulator다.
```

이게 제품이다.

## 2. 대표가 왜 이 앱을 써야 하는가

### 현재 pain은 너무 HR스럽다

현재 문서의 pain은 compensation inconsistency, exception handling, hiring plan, budget decision이다. 맞는 말이지만 대표 입장에서는 아직 멀다.

대표가 실제로 아프게 느끼는 순간은 이런 것이다.

- 신규 입사자 offer가 기존 핵심 구성원보다 높아진다.
- 중요한 사람이 band 밖 retention raise를 요구한다.
- 빠르게 채용해야 하는데 payroll이 revenue confidence보다 빨리 커진다.
- AI 도구를 넣었는데 일을 조율하는 senior의 보이지 않는 부담이 커진다.
- 누군가는 예외 인상을 받았고, 누군가는 왜 못 받았는지 묻기 시작한다.
- HR Prism이 보상 설명 가능성 리스크를 보여줬지만, 무엇부터 결정해야 할지 모르겠다.

대표는 chart를 사는 게 아니다. 나중에 설명할 수 없는 결정을 피하는 장치를 산다.

### 필요한 순간은 이렇게 정의해야 한다

```text
비싼 것은 인상액이 아니다. 비싼 것은 기준 없이 다음 다섯 번의 보상 결정을 해야 하는 상황이다.
```

현재 앱은 이 말을 암시하지만, 사용자가 느끼게 만들지는 못한다.

### HR Prism 이후의 자연스러운 연결

HR Prism에서 HR PaySim으로 넘어갈 때 "보상 리스크가 높습니다"라고만 하면 약하다.

더 좋은 handoff는 이렇다.

```text
HR Prism이 보상 설명 가능성 리스크를 발견했습니다. 위험한 것은 pay가 높거나 낮다는 사실이 아닙니다. 위험한 것은 다음 예외가 선례가 될 수 있다는 점입니다. HR PaySim은 지금 세 가지 선택지를 비교합니다: 미루기, 예외만 patch하기, 기준을 복구하기.
```

이렇게 해야 HR PaySim이 왜 필요한지 생긴다.

### 첫 화면은 mode 선택이 아니라 decision wound여야 한다

현재 첫 화면은 모드 선택과 제품 설명에 가깝다. 하지만 대표가 바로 붙잡혀야 하는 질문은 이것이다.

```text
지금 어떤 보상 결정을 앞두고 있습니까?
```

선택지는 이렇게 시작하는 편이 낫다.

- 신규 입사자 offer가 기존 구성원 보상보다 높아질 수 있다.
- 핵심 인재 retention exception을 검토 중이다.
- salary band는 있지만 구성원이 신뢰하지 않는다.
- 채용 계획 때문에 payroll pressure가 커지고 있다.
- HR Prism이 보상 설명 가능성 리스크를 표시했다.

숫자 입력은 이 뒤에 와야 한다.

## 3. 현재 입력 항목은 정말 필요한가

### 현재 intake의 문제

현재 intake는 사용자가 제품 가치를 느끼기 전에 너무 많은 것을 요구한다.

- 산업
- 회사 규모
- 매출 규모
- 성장 단계
- 기준 급여 총액
- 변동 보상 총액
- 복리후생 총액
- 성과급 지급 대상 비중
- PE 비중
- 경력직 비중
- 향후 채용 인원
- 평균 신규 채용 연봉
- 주요 채용 직무
- 채용 시급성
- 급여 역전 신호
- 핵심 인재 이탈 신호
- 특정 직군 채용 어려움
- 기타 메모
- AI 도구 목적
- 자동화 수준
- 월 AI 도구 예산
- 채용 지연 가능성
- salary band 운영 여부

이건 founder decision simulator라기보다 compensation planning form처럼 읽힌다.

### 대표가 모를 가능성이 높은 입력

초기 단계에서 빼거나 뒤로 미뤄야 할 항목:

- 변동 보상 총액
- 복리후생 총액
- 성과급 지급 대상 비중
- PE 비중
- 경력직 비중
- 평균 신규 채용 연봉의 정확한 금액
- AI 자동화 수준
- AI 채용 지연 가능성

이 항목들이 영원히 불필요하다는 뜻은 아니다. 다만 첫 aha moment 전에 요구하면 friction이 가치보다 먼저 온다.

### 첫 pass에서 필요한 입력

처음에는 결정을 분류할 최소 입력만 받아야 한다.

1. 현재 상황
   - 어떤 결정을 앞두고 있는가?
   - 신규 offer, retention exception, band rebuild, hiring plan, HR Prism handoff.

2. 규모
   - 현재 headcount range.
   - 연간 또는 월간 payroll range.

3. 압력
   - 채용 속도: 낮음, 보통, 공격적.
   - 신규 offer가 기존 comparable employee보다 높은지.
   - 최근 예외 인상이 있었는지.

4. 기준 성숙도
   - band 없음.
   - 암묵적 band.
   - 문서화된 band.
   - 문서화됐고 구성원이 신뢰하는 band.

5. 대표의 우선순위
   - 비용 통제.
   - 신뢰 회복.
   - 채용 속도.
   - 기준 정리.

이 정도면 첫 판단을 만들 수 있다.

### 복잡한 입력은 refinement로 보내야 한다

아래 항목은 첫 결과 이후 "더 정교하게 계산하기"로 이동한다.

- 정확한 base payroll
- variable pay
- benefits
- bonus eligibility
- experienced hire ratio
- average new hire salary
- AI monthly budget
- AI automation details
- salary band width
- cleanup budget
- orchestrator premium allocation

현재 앱은 precision을 앞세운다. 재설계 앱은 decision clarity를 앞세워야 한다.

### 입력 과정 자체가 깨달음을 줘야 한다

좋은 입력 질문은 데이터 수집이 아니라 사고 유도다.

- "신규 offer가 기존 comparable employee를 넘습니까?"는 pay inversion risk를 가르친다.
- "다음 유사 사례에도 같은 결정을 반복할 수 있습니까?"는 precedent risk를 가르친다.
- "band가 문서화되어 있습니까, 아니면 리더들만 알고 있습니까?"는 explainability risk를 가르친다.
- "6개월 미루면 무엇이 더 어려워집니까?"는 timing risk를 가르친다.

입력하면서도 대표가 스스로 문제를 깨달아야 한다.

### 숫자 입력 UX 버그 기록

사용자 보고 증상: 숫자 입력 시 두 자리 입력이 잘 안 되는 문제가 있는 것 같다.

코드상 원인 후보:

- 실제 실행 앱은 React 안에서 HTML string을 렌더링하고, shell에서 `input`과 `change` 이벤트를 모두 listen한다.
- 숫자 필드는 `type="number"`와 controlled value를 함께 쓴다.
- 입력마다 `setForm`, `setFieldErrors`, `markStaleFrom`, memo 상태 reset이 동시에 일어나며 자주 re-render된다.
- 사용되지 않는 `screens/index.tsx` 쪽도 `type="number"`와 `Number(...)` 변환을 쓴다.

다음 구현 전 browser QA에서 반드시 재현해야 한다. 재설계에서는 금액/비율 입력을 raw `type="number"`로 두지 말고, `type="text"`, `inputMode="decimal"`, blur 시 formatting/parsing 구조로 바꾸는 것을 기본값으로 둔다.

## 4. 결과물이 왜 약한가

### 계산이 판단보다 먼저 나온다

현재 결과 화면이 강조하는 것은 다음이다.

- CEI score
- CED score
- payroll increase rate
- scenario cost impact
- explainability change
- exception debt change

나쁜 항목은 아니다. 하지만 대표의 질문은 이것에 가깝다.

```text
내가 지금 어떤 결정을 후회하게 될 수 있고, 왜 그런가?
```

이 질문에 답하기 전에 점수와 matrix가 나오면 결과는 엑셀처럼 보인다.

### 그래프가 주장을 하지 않는다

현재 gauge, mini gauge, payroll chart, comparison matrix, AI diagram은 숫자를 보여주지만 놀라운 관계를 드러내지는 못한다.

좋은 그래프는 이런 주장을 해야 한다.

- 현 상태 유지는 cash cost가 낮지만 explanation debt를 키운다.
- band redesign은 지금 비용이 크지만 다음 결정의 설명 부담을 낮춘다.
- no action은 공짜가 아니라 비용을 trust와 precedent로 옮기는 선택이다.
- AI tooling은 coordination 책임을 보상하지 않으면 payroll pressure를 실제로 낮추지 못한다.

그래프는 장식이 아니라 논증이어야 한다.

### CEI/CED의 설득 근거가 부족하다

CEI/CED가 설득되려면 사용자가 알아야 한다.

- 어떤 입력이 CEI를 낮췄는가?
- 어떤 예외가 CED를 높였는가?
- 어떤 rule missing이 penalty를 만들었는가?
- 점수를 가장 빨리 개선하는 조치는 무엇인가?
- confidence가 낮다면 어느 부분이 불확실한가?

현재 `DiagnosisResult`는 score, band, inversion severity, payroll rate만 갖는다. 그래서 지표가 제품적으로 invented score처럼 보인다.

### memo가 전문가 산출물처럼 보이지 않는다

Memo는 이 제품의 proof of expertise여야 한다.

좋은 memo는 이렇게 시작해야 한다.

```text
문제는 이 인상을 승인할지 여부가 아닙니다. 문제는 이 인상이 다음 comparable person에게 적용될 rule이 되는지입니다.
```

현재 memo는 selected scenario, issue, gains, tradeoffs, next questions를 조립한다. 쓸모는 있지만 날카롭지는 않다.

### 한글 text integrity는 제품 신뢰 문제다

여러 source/test/doc 출력에서 mojibake가 보인다. 브라우저에서 일부 정상 렌더링되더라도, founder-facing Korean memo를 만들겠다는 제품에서 source, test, QA log의 한글 신뢰성이 흔들리는 것은 치명적이다.

이건 polish가 아니라 trust issue다.

## 5. 반드시 만들어야 할 aha moment

### Aha 1: 가장 싼 선택이 가장 위험할 수 있다

현재 상태:

```text
현 상태 유지는 즉시 비용 0원이다.
```

필요한 통찰:

```text
현 상태 유지는 공짜가 아니다. cash cost를 explanation debt로 바꾸는 선택일 수 있다.
```

보여주는 방식:

- cash cost와 explanation debt를 나란히 보여준다.
- no action을 low cash, high precedent risk로 표시한다.
- do nothing을 정식 선택지로 두되 neutral하게 보이지 않게 한다.

### Aha 2: 예외는 비용이 아니라 선례다

현재 상태:

```text
예외 건수가 CED에 반영된다.
```

필요한 통찰:

```text
예외는 반복하지 않을 이유를 설명할 수 없으면 사실상 약속이 된다.
```

보여주는 방식:

- "다음 유사 사례에도 반복할 수 있습니까?"를 묻는다.
- 반복할 수 없다면 communication debt를 보여준다.
- 반복해야 한다면 exception을 policy로 바꿀 때의 budget impact를 보여준다.

### Aha 3: 보상을 올리는 문제가 아니라 기준을 복구하는 문제일 수 있다

현재 상태:

```text
salary band redesign은 여러 scenario card 중 하나다.
```

필요한 통찰:

```text
rule이 깨졌다면 pay raise는 시간을 사는 것일 뿐이다.
```

보여주는 방식:

- 시나리오를 defer, patch, repair rule로 나눈다.
- 각 선택지가 무엇을 해결하고 무엇을 남기는지 말한다.
- 다음 결정을 가장 깨끗하게 만드는 path를 보여준다.

### Aha 4: AI는 coordination이 보상되지 않으면 payroll을 낮추지 못한다

현재 상태:

```text
AI check는 advanced lens다.
```

필요한 통찰:

```text
AI 도구는 coordination responsibility가 명확히 보상될 때만 hiring pressure를 줄일 수 있다.
```

보여주는 방식:

- AI 질문을 초반에 묻지 않는다.
- hiring pressure와 tooling assumption이 있을 때만 AI lens를 연다.
- tool budget, delayed hire, orchestrator premium을 하나의 trade-off로 보여준다.

### Aha 5: 좋은 보상 결정은 두 번 설명할 수 있는 결정이다

필요한 통찰:

```text
보상 결정은 지금 설명할 수 있고, 다음 유사 사례에도 반복 설명할 수 있어야 건강하다.
```

보여주는 방식:

- 모든 scenario에 repeatability test를 붙인다.
- "다음 유사 케이스에도 이 rule을 적용할 수 있는가?"를 묻는다.
- repeatability를 추천 점수의 핵심으로 만든다.

## 6. 전면 재설계안

### 제품 포지션

추천: HR Prism 하위 모듈 우선, standalone preview는 보조.

HR PaySim은 독립 앱으로도 demo 가능해야 하지만, serious product story는 HR Prism trigger에서 시작하는 편이 맞다.

```text
HR Prism이 compensation explainability risk를 발견했다. HR PaySim은 그 리스크에 대해 어떤 결정을 해야 하는지 비교한다.
```

이렇게 해야 "왜 지금 이 앱을 써야 하는가"가 생긴다.

### 추천 flow

현재 input-first wizard를 decision-first flow로 바꾼다.

#### Step 1: Decision Trigger

질문:

```text
지금 어떤 보상 결정을 앞두고 있습니까?
```

선택지:

- 신규 offer가 기존 구성원 pay를 넘을 수 있다.
- 핵심 인재 retention exception을 검토 중이다.
- salary band가 불명확하거나 신뢰받지 못한다.
- hiring plan이 payroll pressure를 만든다.
- HR Prism이 compensation explainability risk를 표시했다.

출력:

- 현재 위험을 한 문장으로 naming.
- 왜 PaySim이 필요한지 한 문장으로 설명.

#### Step 2: Risk Framing

trigger별로 3개에서 5개 정도의 가벼운 질문만 묻는다.

신규 offer inversion 예시:

- 영향을 받는 comparable employee가 몇 명인가?
- 신규 offer가 현재 internal range보다 높은가?
- 차이를 설명할 문서화된 이유가 있는가?
- 다음 유사 hire에도 같은 rule을 반복할 수 있는가?

출력:

- 이것은 주로 rule problem이다.
- 또는 budget pressure problem이다.
- 또는 communication debt problem이다.

#### Step 3: Minimal Numbers

scenario sizing에 필요한 최소 숫자만 묻는다.

- headcount range
- approximate payroll band
- planned hires range
- exception count range
- optional offer delta range

정확한 숫자 입력보다 range, segmented choice, slider를 먼저 사용한다.

#### Step 4: The Fork

핵심 화면은 세 가지 path 비교다.

1. Defer
   - 즉시 cash cost 낮음.
   - explanation debt 증가.

2. Patch
   - 당장의 case 해결.
   - precedent risk 남음.

3. Repair Rule
   - coordination cost 큼.
   - repeatability 개선.

이 화면이 제품의 중심이어야 한다.

#### Step 5: Scenario Simulation

이제 CEI/CED, payroll impact, confidence, assumptions를 보여준다.

단, 점수가 아니라 fork의 consequence로 보여준다.

- cash cost
- explanation debt
- repeatability
- communication burden
- next-decision risk

#### Step 6: Expert Interpretation

HR Prism 수준의 순간은 여기서 나와야 한다.

```text
대표님이 고르는 것은 2.6억을 쓸지 말지가 아닙니다. 이 예외가 rule이 될지, one-time exception이 될지, unresolved debt로 남을지를 고르는 것입니다.
```

#### Step 7: Decision Memo

memo 구조는 이렇게 바꾼다.

- 지금 검토 중인 결정
- 왜 이것이 단순 pay-level 문제가 아닌지
- 얻는 것
- 감수할 것
- 실행 전 반드시 적어야 할 rule
- 구성원에게 설명할 메시지
- 90일 뒤 다시 봐야 할 지점

#### Step 8: Refine Simulation

core memo가 나온 뒤에만 더 깊은 입력을 요청한다.

- exact payroll
- variable pay
- benefits
- AI tooling
- orchestrator premium
- salary band width
- cleanup budget

복잡도는 처음부터 요구하지 말고, 사용자가 필요성을 느낀 뒤 열어야 한다.

### 살릴 것

- compensation governance, not salary calculator라는 thesis.
- strict exclusions.
- HR Prism sequencing.
- `baseline_current_state`를 정식 선택지로 두는 점.
- `얻는 것 / 감수할 것` framing.
- Decision memo를 최종 deliverable로 두는 점.
- sessionStorage privacy rule.
- standalone Vite는 preview/demo runtime으로는 유지 가능.
- explanation debt, no-action risk, band repair 관련 기존 copy 아이디어.

### 버리거나 낮출 것

- 현재 9-step flow를 성역처럼 유지하는 것.
- input-first flow.
- CEI/CED를 첫 hero output으로 두는 것.
- trade-off를 설명하지 못하는 decorative gauge.
- hardcoded scenario card 중심 추천.
- `PrototypePaySimApp`를 production architecture로 쓰는 것.
- raw `type="number"` 금액 입력 UX.
- mojibake가 섞인 source/test/doc/QA text.

### 다시 만들 것

- decision quality 중심 product contract.
- trigger-specific intake.
- defer / patch / repair scenario fork.
- explanation debt와 repeatability 중심 engine contract.
- expert artifact로서의 memo generator.
- 화면마다 하나의 decisive insight를 주는 UI.

## 7. 빌드 관점 후속 계획

### Engine reconciliation은 아직 우선이 아니다

기존 822줄 엔진을 찾는 것은 필요하다. 하지만 지금 당장 그걸 붙이는 것은 우선순위가 아니다.

이유: 제품 질문이 아직 흐릿한 상태에서 rich engine을 복원하면, 깊이는 돌아와도 잘못된 제품 계약을 고착할 수 있다.

올바른 순서:

1. Product contract rewrite.
2. Trigger taxonomy.
3. Input minimization.
4. Output/memo contract.
5. Engine contract.
6. UI architecture.
7. Implementation.

### 기존 engine reconciliation plan에서 유지할 것

`docs/superpowers/plans/2026-07-06-hr-paysim-engine-reconciliation.md`에서 유지할 부분:

- main 병합 금지 판단.
- duplicate architecture cleanup 필요성.
- accessibility/focus QA 필요성.
- sessionStorage privacy decision.
- 옛 엔진/테스트를 reference로 추적해야 한다는 점.

즉시 진행하지 말아야 할 부분:

- product rewrite 전 rich engine restoration.
- flow redesign 전 `PaySimShell` canonicalization.
- 새 화면 구조 결정 전 `PrototypePaySimApp` 삭제.

### 구현 전 새로 필요한 문서

코드 수정 전에 다음 문서가 먼저 필요하다.

1. `docs/hr-paysim/12_product_contract.md`
   - HR PaySim이 측정하는 것을 compensation decision quality로 정의한다.

2. `docs/hr-paysim/13_trigger_taxonomy.md`
   - HR Prism trigger와 standalone founder situation을 PaySim flow에 매핑한다.

3. `docs/hr-paysim/14_output_contract.md`
   - 결과 object, memo section, aha moment를 정확히 정의한다.

4. `docs/hr-paysim/15_input_minimization.md`
   - 모든 입력을 upfront required, optional refinement, HR Prism-provided, removed로 분류한다.

이 네 문서가 나온 뒤 새 implementation plan을 써야 한다.

### 제품 재정의 이후 기술 순서

1. trigger-based intake model 작성.
2. output contract test를 engine보다 먼저 작성.
3. `DiagnosisResult`를 decision quality 중심으로 재정의.
   - `decisionType`
   - `primaryRisk`
   - `explanationDebt`
   - `repeatabilityScore`
   - `budgetPressure`
   - `confidence`
   - `assumptions`
   - `scenarioForks`
   - `memoThesis`
4. recommendation logic을 defer / patch / repair 중심으로 재작성.
5. UI를 `PaySimShell + screens`로 다시 구성.
6. 새 flow parity 후 `PrototypePaySimApp` 삭제.
7. browser QA에서 숫자 입력 버그 재현 및 수정.
8. 그다음 main merge 재검토.

## 현재 제품 점수표

| 영역 | 판단 | 이유 |
| --- | --- | --- |
| Product thesis | 살리되 sharpen | compensation governance simulator 방향은 맞지만 앱 경험에는 너무 추상적이다. |
| Founder pain | 재설계 | 현재 flow가 고통스러운 decision에서 시작하지 않는다. |
| HR Prism handoff | 재설계 | mode 선택보다 trigger 기반 handoff가 필요하다. |
| Inputs | 재설계 | 가치가 증명되기 전에 너무 많이 묻는다. |
| CEI/CED | secondary로 유지 | 좋은 개념이지만 provenance 없이는 hero metric이 될 수 없다. |
| Engine | 보류 | product contract가 먼저다. |
| Scenario comparison | 재구성 | 현재 matrix는 spreadsheet-like하다. |
| Memo | 재구성 | summary assembly가 아니라 expert artifact여야 한다. |
| Design | insight 중심으로 재구성 | 지금은 process completion을 돕지만 관점 전환을 만들지 못한다. |
| Architecture | 나중에 정리 | 중복 UI는 실제 문제지만 product redesign 이후 처리한다. |
| Numeric input UX | bug verify 필요 | 두 자리 입력 증상은 반드시 browser QA에 포함한다. |
| Korean text integrity | 즉시 해결 대상 | founder-facing Korean product에서 mojibake는 trust issue다. |

## 다음 버전의 non-negotiable acceptance criteria

다음 버전은 사용 후 대표가 아래 질문에 답할 수 있어야 한다.

1. 내가 지금 어떤 보상 결정을 앞두고 있는가?
2. 이 문제는 pay-level 문제인가, rule 문제인가, budget 문제인가, communication debt 문제인가?
3. 아무것도 하지 않으면 무엇이 어려워지는가?
4. 가장 싼 선택이 무엇을 숨기고 있는가?
5. 결정을 승인하기 전에 어떤 rule을 적어야 하는가?
6. 구성원에게 무엇이라고 설명해야 하는가?
7. 90일 뒤 무엇을 다시 봐야 하는가?

앱이 이것에 답하지 못하면 테스트와 빌드가 통과해도 제품은 통과한 것이 아니다.
