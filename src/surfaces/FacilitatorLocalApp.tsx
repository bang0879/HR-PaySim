import { PaySimSessionProvider } from "../app/PaySimSessionProvider.tsx";
import { DecisionRoomApp } from "../features/decision-room/DecisionRoomApp.tsx";
import { FacilitatedSessionApp } from "../features/facilitator-preparation/FacilitatedSessionApp.tsx";
import { UnavailableSurface } from "../features/route-access/UnavailableSurface.tsx";
import { resolveSurfaceRoute } from "../lib/hr-paysim/access/routePolicy.ts";
import { createSyntheticDemoSession } from "../lib/hr-paysim/contracts/demoContract.ts";

export function SurfaceApp() {
  const route = resolveSurfaceRoute(
    "FACILITATOR_LOCAL",
    window.location.pathname,
  );
  if (route === "decision_room_preview") {
    return (
      <PaySimSessionProvider initialState={createSyntheticDemoSession()}>
        <DecisionRoomApp />
      </PaySimSessionProvider>
    );
  }
  if (
    route === "facilitator_preparation"
    || route === "facilitator_session"
  ) {
    return (
      <PaySimSessionProvider>
        <FacilitatedSessionApp />
      </PaySimSessionProvider>
    );
  }
  return <UnavailableSurface />;
}
