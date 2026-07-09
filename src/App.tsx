import { PrototypePaySimApp } from "./components/hr-paysim/PrototypePaySimApp";
import { RosterDiagnosticApp } from "./components/hr-paysim/RosterDiagnosticApp";
import { resolveHrPaySimSurface } from "./routes/hr-paysim/appRoute.ts";

export function App() {
  const surface = resolveHrPaySimSurface(window.location.pathname);
  if (surface === "roster") return <RosterDiagnosticApp mode="facilitated" />;
  if (surface === "demo") return <RosterDiagnosticApp mode="demo" />;
  return <PrototypePaySimApp />;
}