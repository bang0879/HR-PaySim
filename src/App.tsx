import { PaySimSessionProvider } from "./app/PaySimSessionProvider.tsx";
import { PrototypePaySimApp } from "./components/hr-paysim/PrototypePaySimApp";
import { RosterDiagnosticApp } from "./components/hr-paysim/RosterDiagnosticApp";
import { DecisionRoomApp } from "./features/decision-room/DecisionRoomApp.tsx";
import { FacilitatedSessionApp } from "./features/facilitator-preparation/FacilitatedSessionApp.tsx";
import { createSyntheticDemoSession } from "./lib/hr-paysim/contracts/demoContract.ts";
import { resolveHrPaySimSurface } from "./routes/hr-paysim/appRoute.ts";

export function App() {
  const surface = resolveHrPaySimSurface(window.location.pathname);
  if (surface === "decision_room_preview") {
    return (
      <PaySimSessionProvider initialState={createSyntheticDemoSession()}>
        <DecisionRoomApp />
      </PaySimSessionProvider>
    );
  }
  if (surface === "facilitator_preparation" || surface === "facilitator_session") {
    return (
      <PaySimSessionProvider>
        <FacilitatedSessionApp />
      </PaySimSessionProvider>
    );
  }
  if (surface === "roster") return <RosterDiagnosticApp mode="facilitated" />;
  if (surface === "demo") return <RosterDiagnosticApp mode="demo" />;
  return <PrototypePaySimApp />;
}
