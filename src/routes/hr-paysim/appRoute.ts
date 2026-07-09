export type HrPaySimSurface = "prototype" | "roster" | "demo";

export function resolveHrPaySimSurface(pathname: string): HrPaySimSurface {
  if (pathname === "/hr-paysim/roster") return "roster";
  if (pathname === "/hr-paysim/demo") return "demo";
  return "prototype";
}