import type { PaySimStep } from "../../lib/hr-paysim/domain.ts";
import { PAY_SIM_STEPS } from "./stepRegistry.ts";

export function routeForStep(step: PaySimStep): string {
  return PAY_SIM_STEPS.find((item) => item.id === step)?.route ?? "/hr-paysim/entry";
}

export function stepFromPath(pathname: string): PaySimStep {
  return PAY_SIM_STEPS.find((item) => item.route === pathname)?.id ?? "entry";
}

export function pushStep(step: PaySimStep): void {
  window.history.pushState({}, "", routeForStep(step));
}

export function replaceStep(step: PaySimStep): void {
  window.history.replaceState({}, "", routeForStep(step));
}