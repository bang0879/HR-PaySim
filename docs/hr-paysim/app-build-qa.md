# HR PaySim App Build QA

## Environment

- URL: `http://127.0.0.1:5173/hr-paysim/entry`
- Browser path: Playwright fallback
- Browser fallback reason: in-app browser runtime failed during initialization with a sandbox ACL error.
- Desktop viewport: `1440x1024`
- Mobile viewport: `390x844`
- QA date: 2026-07-03

## Automated Gates

```text
npm test
npm run lint
npm run typecheck
npm run build
```

Result: pass.

## Browser Flow

Verified:

- App loads at entry route.
- Entry advances to intake.
- Direct aggregate input can be saved.
- Aggregate review shows saved aggregate metrics.
- Flow advances through diagnosis, interpretation, recommendations, AI check, comparison, and memo preview.
- Memo preview includes `얻는 것` and `감수할 것`.
- Aggregate consent can be accepted separately.
- Company name permission is a separate checkbox.
- Consent payload is generated locally only after consent.
- Clean direct navigation to `/hr-paysim/comparison` redirects to `/hr-paysim/entry`.
- Mobile entry viewport renders without blank screen or framework overlay.
- Console errors: 0.
- Console warnings: 0.

## Screenshot Evidence

Screenshots were captured outside the repository:

```text
C:/tmp/hr-paysim-aggregate.png
C:/tmp/hr-paysim-memo.png
C:/tmp/hr-paysim-mobile.png
```

## Remaining Risk

- Cross-browser QA beyond Chromium was not run.
- Pixel-perfect matching to the prior static prototype references was not re-run for every screen after React migration.
- CSV upload, PDF generation, and server-side aggregate logging remain intentionally out of v1.0 scope.

