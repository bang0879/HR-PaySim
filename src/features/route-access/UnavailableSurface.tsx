import { FOUNDER_COPY } from "../../lib/hr-paysim/copy/founderCopy.ts";
import "./routeAccess.css";

export function UnavailableSurface() {
  return (
    <main className="route-access-shell" data-route-unavailable="true">
      <section className="route-access-card">
        <p className="route-access-eyebrow">
          {FOUNDER_COPY["route.unavailable.eyebrow"]}
        </p>
        <h1>{FOUNDER_COPY["route.unavailable.heading"]}</h1>
        <p>{FOUNDER_COPY["route.unavailable.support"]}</p>
        <a href="/hr-paysim/demo">
          {FOUNDER_COPY["route.unavailable.action"]}
        </a>
      </section>
    </main>
  );
}
