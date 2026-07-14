# HR PaySim V3 QA

## Automated Checks

Date: 2026-07-03

- Syntax: `node --check prototypes/hr-paysim-redesign/app.js` passed.
- Render: Playwright loaded `prototypes/hr-paysim-redesign/index.html` at `1536x1024` without console or page errors.
- Flow: steps 1 through 8 rendered in order.
- Interaction: selecting direct-input mode moved from step 1 to step 2.
- Interaction: editing an input after downstream steps were unlocked marked 6 downstream steps as stale/recalculation-needed.
- Interaction: selecting a scenario updated the selected scenario row.
- Interaction: final memo CTA changed to `저장됨 ✓` and displayed a saved-state message.
- Input guardrail: negative numeric input showed `음수 값은 사용할 수 없습니다.`
- Mobile: app loaded at `320x700` without console/page errors or horizontal overflow.

## Screenshot Artifacts

Temporary screenshots were captured outside the repo under `C:/tmp/hr-paysim-step1.png` through `C:/tmp/hr-paysim-step8.png` and `C:/tmp/hr-paysim-mobile-step1.png`.

## Notes

Browser plugin and local image viewer both hit Windows sandbox ACL errors in this session, so rendered validation used bundled Playwright as fallback.

## Final Design Fidelity Recheck

Date: 2026-07-03

- Step 4: verified CEI SVG gauge/gradient, 4 scenario preview icons, and separate up/down delta colors.
- Step 5: verified `비교에 담기` scenario buttons render with the neutral/default button treatment.
- Step 6: verified `이렇게 봅니다` uses the bulb icon and Senior redistribution arrows render.
- Step 7: verified CEI/CED score tracks, cost/case micro bars, difficulty bars, and gray baseline column shading.
- Step 8: verified `보통` confidence label renders as a blue badge.
- Mobile: `390x780` check reported `scrollWidth=390`, `clientWidth=390`; Senior diagram collapses to one column.
- Console: no page or console errors during the 4-8 flow.
