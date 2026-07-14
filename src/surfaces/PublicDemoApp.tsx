import { PaySimSessionProvider } from "../app/PaySimSessionProvider.tsx";
import { DecisionRoomApp } from "../features/decision-room/DecisionRoomApp.tsx";
import { UnavailableSurface } from "../features/route-access/UnavailableSurface.tsx";
import { resolveSurfaceRoute } from "../lib/hr-paysim/access/routePolicy.ts";
import { createSyntheticDemoSession } from "../lib/hr-paysim/contracts/demoContract.ts";

export function SurfaceApp() {
  if (
    resolveSurfaceRoute("PUBLIC_DEMO", window.location.pathname)
    !== "decision_room_preview"
  ) {
    return <UnavailableSurface />;
  }
  return (
    <PaySimSessionProvider initialState={createSyntheticDemoSession()}>
      <DecisionRoomApp />
    </PaySimSessionProvider>
  );
}
