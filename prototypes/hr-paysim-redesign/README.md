# HR PaySim Redesign Prototype

Static, code-native implementation of the approved HR PaySim V3 guided product flow.

Open `index.html` in a browser. No dev server is required.

## Scope

- 8-step guided compensation governance flow
- Floating white app shell on cool gray background
- Cobalt blue primary states and black active top navigation
- Entry mode check
- Aggregate-only data intake
- Compact input summary
- Compensation diagnosis and expert interpretation
- Recommended scenarios with Current State / No Action as a first-class option
- Conditional AI-related check
- Decision comparison with `얻는 것` and `감수할 것`
- Decision memo preview
- Mobile responsive behavior

## Notes

- UI is implemented with real HTML, CSS, SVG, inputs, buttons, and local state.
- The PNG files in `design-references/` are visual references, not app overlays.
- CSV upload is intentionally shown only as a planned later item.
- HR Prism passes trigger context only; HR PaySim recalculates from its own aggregate inputs.
- UI copy avoids employee-level personal data requests and unsupported salary-calculator claims.
