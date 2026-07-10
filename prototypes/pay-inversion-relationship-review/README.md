# Pay Inversion Founder Grammar Prototype

Standalone static prototype for locking the founder-facing interaction grammar of the `pay_inversion` relationship review screen.

Open `index.html` directly in a browser. No dev server is required.

## Scope

- Refines only the isolated `pay_inversion` prototype.
- Locks the shared grammar for future finding screens:
  1. why are we looking at this relationship?
  2. how does the founder explain this difference?
  3. what should become the next compensation decision standard?
- Demonstrates that PaySim reviews only the top relationships that may be difficult to explain, not every salary difference.
- Uses the existing `prototypes/hr-paysim-redesign/styles.css` visual system plus local prototype-only styles.
- Stores no data in `sessionStorage` and does not capture raw free text.
- Does not modify or integrate with parser, detector, routing, session, or production app flow.

## Primary Options

1. 명확한 기준이 있습니다
2. 예외적인 이유가 있었습니다
3. 설명은 가능하지만 기준으로 정리되진 않았습니다
4. 지금은 설명이 어렵습니다

## Secondary Option Behavior

- Option 1 does not show secondary chips by default.
- Option 2 shows: 최근 채용 시장 상황, counteroffer, 특정 기술/경험, 긴급 채용, 대표 승인 예외.
- Option 3 shows: 성과 차이, 역할 범위 차이, 리더 판단에 의존, 문서화 필요, 다음 연봉 리뷰 때 정리 필요.
- Option 4 shows: 성과 평가 확인 필요, 역할 범위 확인 필요, 입사 당시 조건 확인 필요, 최근 인상 이력 확인 필요.
- Secondary chips are optional and appear only after a relevant primary option is selected.

## Memo Grammar

The memo preview stays in three sections:

1. 현재 관계
2. 대표가 선택한 이유
3. 다음 기준

The memo should translate a founder choice into a next compensation standard candidate. It should not store names, raw quotes, sensitive free text, or any challenge-style result.

## Intentional Constraints

- This remains a reference prototype, not production UI.
- Pixel-level polish is intentionally deferred.
- No other finding prototypes are created in this pass.
- Production engine, detector, routing, session, and app flow are intentionally untouched.