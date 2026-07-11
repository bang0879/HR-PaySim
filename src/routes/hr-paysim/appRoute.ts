export type HrPaySimSurface =
  | "prototype"
  | "roster"
  | "demo"
  | "decision_room_preview";

export function resolveHrPaySimSurface(pathname: string): HrPaySimSurface {
  if (pathname === "/hr-paysim/decision-room-preview") return "decision_room_preview";
  if (pathname === "/hr-paysim/roster") return "roster";
  if (pathname === "/hr-paysim/demo") return "demo";
  return "prototype";
}
