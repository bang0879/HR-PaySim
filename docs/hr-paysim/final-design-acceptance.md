# HR PaySim Final Design Acceptance

## Design Source

- Source type: exported screenshot pack and handoff docs
- Source location: `C:/Users/bang0/OneDrive/바탕 화면/HR Paysim/design/hr-paysim-redesign-v3`
- Approval record: `C:/Users/bang0/OneDrive/바탕 화면/HR Paysim/design/APPROVED_FINAL_DESIGN.md`
- Approval date: 2026-07-03

## Required Screens

| Step | App State | Desktop Reference | Required Interactive Checks |
| --- | --- | --- | --- |
| 1 | Entry / Mode Check | `desktop-01-entry.png` | mode selection, reset |
| 2 | Data Intake | `desktop-02-intake.png` | input focus, edited field marks downstream stale |
| 3 | Input Summary | `desktop-03-summary.png` | inline next button |
| 4 | Diagnosis | `desktop-04-diagnosis.png` | stale-state trigger |
| 5 | Recommended Scenarios | `desktop-05-scenarios.png` | scenario select |
| 6 | AI Check | `desktop-06-ai-check.png` | next/back flow |
| 7 | Decision Comparison | `desktop-07-comparison.png` | comparison table and memo CTA |
| 8 | Decision Memo Preview | `desktop-08-memo.png` | final save CTA |

## Visual Tokens

- pageBackground: `#E9EDF3`
- appShell: `#FFFFFF`
- surface: `#FFFFFF`
- surfaceSubtle: `#F8FAFC`
- border: `#E6EAF0`
- text: `#101318`
- mutedText: `#667085`
- primaryBlue: `#2F7CF6`
- primaryBlueSoft: `#EAF3FF`
- activeBlack: `#101418`
- chartGray: `#D9DEE7`

## Direction

- Use a floating rounded white app shell on a cool gray page background.
- Keep the 8-step guided product flow as the first screen.
- Use cobalt blue for primary progress, current states, key metrics, and primary actions.
- Use black active pill controls where the mockups show product or top-nav active state.
- Avoid the earlier teal/mint HR Prism-like direction.
- Keep UI text, buttons, forms, tables, and charts code-native. The PNG files are references, not app UI overlays.

## Sign-Off Checklist

- [ ] Desktop screenshots match approved references closely enough for design review.
- [ ] No screen is implemented as a flat design-image overlay.
- [ ] Navigation works across all 8 steps.
- [ ] Mode selection updates selected state.
- [ ] Input editing marks downstream steps stale.
- [ ] Reset returns the app to step 1 and HR Prism mode.
- [ ] Korean text renders without mojibake.
- [ ] Product exclusions from `docs/hr-paysim/00_product_thesis.md` are still respected.
