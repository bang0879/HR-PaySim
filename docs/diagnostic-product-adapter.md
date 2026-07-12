# Diagnostic Product Adapter — HR PaySim

## 1. Metadata and authority

- Product: HR PaySim
- Adapter status: `AUTHORITATIVE`
- Adapter owner: this repository
- Upstream repository: `transition-gap`
- Upstream branch context: `codex/diagnostic-product-governance`
- Constitution: `.governance/upstream/docs/diagnostic-product-constitution.md`
- Constitution baseline commit: `790eb99`
- Casebook: `.governance/upstream/docs/diagnostic-before-after-casebook.md`
- Local product authority: `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`
- Last validated: 2026-07-12

공통 원칙 문구를 복사하지 않고 `DP-*` ID와 PaySim 적용 위치만 기록한다.

## 2. Scope Lock

- `GOVERNANCE_ONLY`: Adapter, resolver, Preflight, agent guidance, authority note, 계획만 변경하며 제품 코드를 수정하지 않는다.
- `PRODUCT_IMPLEMENTATION`: 승인된 PaySim 작업 패키지의 코드·테스트·UI만 변경한다.
- `REVIEW_ONLY`: 읽기·검증·피드백만 수행한다.

Task 9 휴먼 게이트는 거버넌스 작업과 독립적으로 진행하며 거버넌스 검증으로 대체하지 않는다.

## 3. Authority map

| Source | Authority | Use |
|---|---|---|
| `.governance/upstream/docs/diagnostic-product-constitution.md` at `790eb99` | `AUTHORITATIVE` | 공통 `LOCKED` 원칙 |
| `.governance/upstream/docs/diagnostic-before-after-casebook.md` at `790eb99` | `REFERENCE_ONLY` | 사례와 공통화 후보 근거 |
| `docs/diagnostic-product-adapter.md` | `AUTHORITATIVE` | PaySim 범위·매핑·충돌 처리 |
| `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md` | `PRODUCT-SPECIFIC` | 현재 4화면 UX·상태·개인정보·파일럿 계약 |
| `docs/hr-paysim/17_strategy_gtm_career_contract.md` | `PRODUCT-SPECIFIC` | 파일럿 KPI와 정직한 대외 주장 |
| `docs/hr-paysim/19_sample_output_contract.md` | `PRODUCT-SPECIFIC` | 합성 roster·fixture·탐지 기대값 |
| `docs/hr-paysim/21_anonymous_pilot_learning_log_contract.md` | `PRODUCT-SPECIFIC` | 동의·수동 가명 기록 경계 |
| `src/lib/hr-paysim/copy/founderCopy.ts` | `PRODUCT-SPECIFIC` | 중요 founder-facing copy SSOT |
| 기존 구현 계획과 통합 설계 | `REFERENCE_ONLY` | 승인 이력과 작업 순서 참고 |
| `docs/hr-paysim/final-design-acceptance.md` | `LEGACY` | 과거 8단계 시각 참고 |

충돌 시 최신 사용자 지시, 이 Adapter, 현재 PaySim canonical 계약, 승인된 현재 계획, 참고 계획, legacy 순서로 판단한다.

## 4. LOCKED principle mappings

| Principle | Product application | Verification |
|---|---|---|
| `DP-01` | roster evidence에서 theme·review·repeat·decision·report·export까지 구조화된 추적 | `dependency-invalidation.test.ts`, report derivation, export invalidation |
| `DP-02` | explanation·repeat·confirmed output의 claim status와 non-claim | `claim-rendering.test.ts`, observed-precedent non-claim tests |
| `DP-03` | detector·row ID·계산 언어와 founder copy 분리 | `founder-copy.test.ts`, `decision-room-ui.test.ts`, browser visible-text scan |
| `DP-04` | 급여 차이와 반복 금액의 정의·근거·단위·한계 | data-derived headline and amount-context tests |
| `DP-05` | 대표가 설명·선택·승인하는 4화면 흐름 | one-action screen tests, no score/risk hero |

## 5. Candidate validation

| Cases | Validation | Product evidence |
|---|---|---|
| `CASE-01` | `CONFIRMED` | forbidden-term, expanded-language, visible-text checks |
| `CASE-02` | `CONFIRMED` | anonymous founder comparison and model-owned evidence tests |
| `CASE-05` | `CONFIRMED` | amount unit/context and data-derived headline tests |
| `CASE-08` | `CONFIRMED` | action prompt and one-concrete-action tests |
| `CASE-10` | `CONFIRMED` | source order, component ownership, browser gaze order |
| `CASE-11` | `CONFIRMED` | reducer, UI, and browser invalidation tests |
| `CASE-12` | `CONFIRMED` | destination matrix and repeat non-claim tests |
| `CASE-13` | `CONFIRMED` | bottom action, three clicks, focus, keyboard, overflow QA |
| `CASE-03`, `CASE-04`, `CASE-06` | `ADAPTED` | facilitated founder question and compensation-decision mechanics |
| `CASE-07`, `CASE-09`, `CASE-14` | `NOT_TESTED` | current PaySim evidence is insufficient; Task 9 and pilot may change `CASE-14` |

## 6. Product-specific rules

- HR PaySim은 facilitated compensation-explainability decision room이다.
- 시장연봉, 퇴사, 생산성 손실, 법률 노출, 개인별 적정 연봉을 추정하지 않는다.
- raw roster text는 parsing 후 제거하며 browser storage·URL·server로 보내지 않는다.
- `EvidenceStatus`와 interpretation claim status를 분리한다.
- observed precedent와 founder-approved reusable rule을 분리한다.
- `repeatabilityStatus: unanswered`는 policy copy가 될 수 없다.
- explanation 또는 evidence 변경은 모든 dependent output을 render 전에 무효화한다.
- pilot learning record는 별도 동의 후 앱 밖에서 수동 가명 기록한다.
- Task 9는 자동 검증과 별도로 실제 참여자 이해도 게이트를 통과해야 한다.

## 7. Forbidden literal transfers

- Constitution 원문, Prism screen flow, Matrix, scenario card, roadmap, glossary, benchmark formula, 교정 문구를 복사하지 않는다.
- Prism Adapter의 제품 규칙이나 HR Prism component를 PaySim에 이식하지 않는다.
- casebook UI 형태를 공통 component로 조기 추출하지 않는다.
- PaySim claim state, privacy rule, fixture, pilot record를 common casebook에 복제하지 않는다.
- upstream 절대경로, `.governance/` link, local config를 commit하지 않는다.

## 8. Feedback return path

1. PaySim 피드백은 화면, before, 실패 원인, after, 테스트 또는 동의된 pilot evidence와 함께 PaySim 문서에 기록한다.
2. 제품 고유 변경은 이 Adapter의 rule 또는 case validation만 갱신한다.
3. 두 제품에서 반복 가능성이 생긴 candidate만 upstream casebook 제안으로 반환한다.
4. Constitution 승격은 별도 사용자 승인 후 upstream 원문에서만 수행한다.

## 9. Verification commands

```powershell
node --test tests/governance/diagnostic-governance-resolver.test.mjs
node scripts/verify-diagnostic-governance.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```
