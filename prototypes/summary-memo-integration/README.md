# Summary Memo Integration Prototype

Standalone static prototype for testing how reviewed compensation relationships become a founder-facing decision memo.

Open `index.html` directly in a browser. No dev server is required.

## Status

This is an isolated grammar reference prototype.
It is not production UI.
It uses seeded results from the three prior relationship-review samples.
It should not modify parser, detector, routing, session, or production app flow.

## Purpose

The prototype checks whether a founder can read the final memo and understand:

1. what was reviewed today,
2. which compensation relationships or zones need explanation,
3. which compensation-standard bucket each result belongs to,
4. what must be decided in the next 90 days,
5. that this is not a personal salary prescription, market salary table, attrition prediction, or individual pay recommendation.

## Fixed Buckets

1. 신규 채용·예외 보상 기준
2. 암묵적 보상 구간 기준
3. 장기근속·초기멤버 보상 리뷰 기준
4. 추가 확인 필요 항목

Production may hide empty buckets later. This prototype keeps all four visible.

## Interaction

- Bucket selection highlights the related reviewed compensation relationship.
- The memo itself is static seeded content.
- The copy button only confirms the intended interaction; this is not a production clipboard workflow.
