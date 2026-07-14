import type { BuildSurface } from "./buildSurface.ts";

export type SurfaceRoute =
  | "demo"
  | "facilitator_preparation"
  | "facilitator_session"
  | "unavailable";

export function resolveSurfaceRoute(
  surface: BuildSurface,
  pathname: string,
): SurfaceRoute {
  if (pathname === "/hr-paysim/demo") return "demo";
  if (surface === "FACILITATOR_LOCAL") {
    if (pathname === "/hr-paysim/session/new") return "facilitator_preparation";
    if (pathname === "/hr-paysim/session") return "facilitator_session";
  }
  return "unavailable";
}