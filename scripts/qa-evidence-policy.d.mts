export function findBlockedPaySimHrefs(
  hrefs: readonly string[],
  baseOrigin?: string,
): string[];
export function findBlockedLiteralPaySimHrefs(source: string): string[];
export function collectSensitiveTokens(...tabularSources: string[]): string[];
export function findSensitivePayloadTokens(
  payload: string,
  tokens: readonly string[],
  includeAmbiguous?: boolean,
): string[];
