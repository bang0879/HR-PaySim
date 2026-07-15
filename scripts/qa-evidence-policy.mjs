const publicDemoPath = "/hr-paysim/demo";
const publicDemoOrigin = "https://public-demo.invalid";

export function findBlockedPaySimHrefs(hrefs, baseOrigin = publicDemoOrigin) {
  return hrefs.filter((href) => {
    try {
      const destination = new URL(href, baseOrigin);
      return destination.origin === new URL(baseOrigin).origin
        && destination.pathname.startsWith("/hr-paysim/")
        && destination.pathname !== publicDemoPath;
    } catch {
      return true;
    }
  });
}

export function findBlockedLiteralPaySimHrefs(source) {
  const literalCandidates = [];
  for (const match of source.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
    literalCandidates.push({ href: match[1], index: match.index });
  }
  for (const expression of source.matchAll(/href\s*=\s*\{([^}]*)\}/gi)) {
    for (const literal of expression[1].matchAll(/["'`]([^"'`]+)["'`]/g)) {
      literalCandidates.push({
        href: literal[1],
        index: expression.index + literal.index,
      });
    }
  }
  const hrefs = literalCandidates
    .sort((left, right) => left.index - right.index)
    .map(({ href }) => href);
  return findBlockedPaySimHrefs(hrefs);
}

export function collectSensitiveTokens(...tabularSources) {
  return [...new Set(
    tabularSources
      .flatMap((source) => source.split(/[\t\r\n]+/))
      .map((token) => token.trim())
      .filter(Boolean),
  )];
}

export function findSensitivePayloadTokens(
  payload,
  tokens,
  includeAmbiguous = true,
) {
  const ambiguousValues = new Set(["none", "true", "false"]);
  return tokens.filter((token) =>
    (includeAmbiguous || (token.length >= 4 && !ambiguousValues.has(token)))
    && payload.includes(token)
  );
}
