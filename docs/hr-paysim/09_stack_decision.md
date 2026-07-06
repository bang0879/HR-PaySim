# HR PaySim Stack Decision

## Decision

Decision: Vite + React

## Reason

- HR Prism stack alignment: This repository currently contains HR PaySim as a standalone static prototype. No shared HR Prism Next.js app, layout package, route tree, or deployment target is present in this workspace.
- API route need: v1.0 does not require a server route. Aggregate logging server emission is deferred until endpoint, storage, retention, and revoke/decline policy exist.
- Deployment target: v1.0 can run as a client-side wizard and can be statically hosted after `npm run build`.
- Trade-off accepted: If HR PaySim must later live inside HR Prism or share a Next.js deployment, the React domain modules and components should be portable, but the Vite shell will need integration work.

## Revisit Trigger

Revisit this decision if any of the following becomes true:

- HR Prism and HR PaySim must share one deployed app.
- Auth, API routes, server actions, or server-side aggregate logging become v1.0 requirements.
- HR Prism exposes a shared component system that HR PaySim must import directly.

