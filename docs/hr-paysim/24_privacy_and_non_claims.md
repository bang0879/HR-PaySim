# HR PaySim Privacy And Non-Claims

## Current operating boundary

HR PaySim has two separately built surfaces:

- `PUBLIC_DEMO`: synthetic `/hr-paysim/demo` only;
- `FACILITATOR_LOCAL`: synthetic demo plus `/hr-paysim/session/new` and `/hr-paysim/session`.

The facilitator surface is designed for a facilitator-controlled localhost session. It has not been deployed and has no repository-proven authentication or external access gate. `noindex` and route blocking are not authentication.

## Local roster lifecycle

Roster data is handled as follows:

1. the facilitator selects an `.xlsx` file or opens the paste fallback;
2. the browser reads the file locally;
3. workbook ZIP limits and formula checks run before accepted values enter the adapter;
4. prohibited or unknown columns require current-read consent;
5. required rows are normalized into generated local identifiers;
6. raw rows, filenames, sheet names, and textarea contents are cleared;
7. only normalized roster rows enter the in-memory provider;
8. explicit session end or browser refresh clears the active roster.

The supported runtime contains no roster persistence or emission path. Current verification checks for `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `localStorage`, `sessionStorage`, and `indexedDB` in the reachable facilitator source graph.

## Public build isolation

The public build entry does not import facilitator preparation, workbook reading, roster ingestion, the removed prototype runtime, or the removed roster diagnostic runtime. Vite emits a module manifest and fails the public build if a forbidden module becomes reachable.

Public navigation to facilitator, old preview, old roster, old entry, and unknown PaySim paths renders the unavailable surface. The unavailable screen links only to `/hr-paysim/demo`.

## What is not collected or emitted

The current product does not intentionally write roster or decision-room state to:

- URL query strings or fragments;
- local storage, session storage, or IndexedDB;
- cookies;
- telemetry or analytics;
- external HTTP requests, beacons, or WebSockets;
- repository QA artifacts.

The guided input does not require names, employee numbers, emails, resident-registration numbers, or free-text notes. PII-like retained cell values fail the entire read closed.

## Security and deployment non-claims

- A build flag is not authentication.
- `noindex` is not access control.
- An environment declaration would not prove provider protection.
- No external facilitator deployment has been verified.
- Before any future deployment or pilot, the real provider/private-network protection must be checked as an operational fact.

Roster privacy in the current localhost workflow is based on client-side no-emission and memory-only lifecycle, not on a claimed external route gate.

## Product non-claims

HR PaySim does not provide:

- a market benchmark or market-average salary;
- an individual salary recommendation;
- a fairness verdict;
- an employee-performance evaluation;
- an attrition or loss prediction;
- an approved company rule unless the facilitator explicitly records one;
- automated employment or compensation decisions.

The observed trend is an internal descriptive line. It is not a standard raise rate, recommended pay line, market average, or approved-company criterion.

## Evidence status

The repository contains automated tests, build manifests, and synthetic/local browser QA. It does not contain participant transcripts or pilot outcomes for Task 12.

`PILOT-1: NOT RUN`.
