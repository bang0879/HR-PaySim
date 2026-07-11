import { PaySimSessionProvider } from "./app/PaySimSessionProvider.tsx";
import { PrototypePaySimApp } from "./components/hr-paysim/PrototypePaySimApp";
import { RosterDiagnosticApp } from "./components/hr-paysim/RosterDiagnosticApp";
import {
  createSyntheticDemoSession,
  DECISION_ROOM_DEMO_CONTRACT,
} from "./lib/hr-paysim/contracts/demoContract.ts";
import { resolveHrPaySimSurface } from "./routes/hr-paysim/appRoute.ts";

export function App() {
  const surface = resolveHrPaySimSurface(window.location.pathname);
  if (surface === "decision_room_preview") {
    return (
      <PaySimSessionProvider initialState={createSyntheticDemoSession()}>
        <div data-decision-room-preview="true">
          <p>{DECISION_ROOM_DEMO_CONTRACT.sampleLabel}</p>
          <RosterDiagnosticApp mode="demo" />
        </div>
      </PaySimSessionProvider>
    );
  }
  if (surface === "roster") return <RosterDiagnosticApp mode="facilitated" />;
  if (surface === "demo") return <RosterDiagnosticApp mode="demo" />;
  return <PrototypePaySimApp />;
}
