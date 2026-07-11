import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, normalize, resolve } from "node:path";
import { FOUNDER_COPY } from "../src/lib/hr-paysim/copy/founderCopy.ts";
import { FORBIDDEN_FOUNDER_TERMS } from "../src/lib/hr-paysim/copy/forbiddenFounderTerms.ts";

// The new four-screen runtime lives under these boundaries. Legacy prototype
// surfaces remain unchanged until the migration gate in Task 12.
const founderSurfaceRoots = ["src/features", "src/app/PaySimApp.tsx"];
const visibleAttributeNames = new Set([
  "aria-label",
  "title",
  "placeholder",
  "alt",
  "label",
  "description",
  "text",
  "body",
]);

export function findForbiddenCopyValues(values: Record<string, string>): string[] {
  return Object.entries(values).flatMap(([copyKey, value]) =>
    matchingTerms(value).map((term) => `${copyKey}: forbidden term "${term}"`)
  );
}

export function findForbiddenRenderedCopy(source: string): string[] {
  const renderedStrings = extractRenderedStrings(source);
  return FORBIDDEN_FOUNDER_TERMS.filter((term) =>
    renderedStrings.some((value) => includesTerm(value, term))
  );
}

export function collectForbiddenCopyViolations(): string[] {
  const copyViolations = findForbiddenCopyValues(FOUNDER_COPY)
    .map((violation) => `FOUNDER_COPY:${violation}`);
  const sourceViolations = founderSurfaceRoots
    .filter((root) => existsSync(root))
    .flatMap(filesUnder)
    .filter((file) => /\.(tsx|jsx)$/.test(file))
    .flatMap((file) =>
      findForbiddenRenderedCopy(readFileSync(file, "utf8"))
        .map((term) => `${file}: forbidden rendered term "${term}"`)
    );
  return [...copyViolations, ...sourceViolations];
}

function extractRenderedStrings(source: string): string[] {
  const values: string[] = [];
  const openElements: string[] = [];
  let cursor = 0;

  while (cursor < source.length) {
    const tagStart = findNextTagStart(source, cursor);
    if (tagStart < 0) {
      if (openElements.length > 0) pushChildContent(values, source.slice(cursor));
      break;
    }
    if (openElements.length > 0) pushChildContent(values, source.slice(cursor, tagStart));

    const tagEnd = findTagEnd(source, tagStart);
    if (tagEnd < 0) break;
    const tagSource = source.slice(tagStart + 1, tagEnd);
    const tag = parseTag(tagSource);
    if (tag) {
      if (tag.kind === "open") {
        pushVisibleAttributes(values, tagSource);
        if (!tag.selfClosing) openElements.push(tag.name);
      } else {
        const matchingIndex = openElements.lastIndexOf(tag.name);
        if (matchingIndex >= 0) openElements.splice(matchingIndex);
      }
    }
    cursor = tagEnd + 1;
  }

  return values;
}

function findNextTagStart(source: string, from: number): number {
  for (let index = from; index < source.length - 1; index += 1) {
    if (source[index] !== "<") continue;
    const next = source[index + 1] ?? "";
    if (next === ">" || /[A-Za-z/]/.test(next)) return index;
  }
  return -1;
}

function findTagEnd(source: string, tagStart: number): number {
  let quote: string | undefined;
  let braceDepth = 0;
  for (let index = tagStart + 1; index < source.length; index += 1) {
    const char = source[index] ?? "";
    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = undefined;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") braceDepth += 1;
    else if (char === "}" && braceDepth > 0) braceDepth -= 1;
    else if (char === ">" && braceDepth === 0) return index;
  }
  return -1;
}

function parseTag(tagSource: string):
  | { kind: "open"; name: string; selfClosing: boolean }
  | { kind: "close"; name: string }
  | undefined {
  const trimmed = tagSource.trim();
  if (trimmed === "") return { kind: "open", name: "#fragment", selfClosing: false };
  if (/^\/\s*$/.test(trimmed)) return { kind: "close", name: "#fragment" };
  const closing = trimmed.match(/^\/\s*([A-Za-z][\w.-]*)/);
  if (closing) return { kind: "close", name: closing[1]! };
  const opening = trimmed.match(/^([A-Za-z][\w.-]*)/);
  if (!opening) return undefined;
  return {
    kind: "open",
    name: opening[1]!,
    selfClosing: /\/\s*$/.test(trimmed),
  };
}

function pushVisibleAttributes(values: string[], tagSource: string): void {
  const elementName = tagSource.match(/^\s*[A-Za-z][\w.-]*/)?.[0] ?? "";
  let cursor = elementName.length;

  while (cursor < tagSource.length) {
    while (/\s/.test(tagSource[cursor] ?? "")) cursor += 1;
    if (cursor >= tagSource.length || tagSource[cursor] === "/") break;
    if (tagSource[cursor] === "{") {
      const spreadEnd = findBalancedBraceEnd(tagSource, cursor);
      if (spreadEnd < 0) break;
      cursor = spreadEnd + 1;
      continue;
    }

    const nameStart = cursor;
    while (cursor < tagSource.length && !/[\s=/>]/.test(tagSource[cursor] ?? "")) cursor += 1;
    const name = tagSource.slice(nameStart, cursor);
    while (/\s/.test(tagSource[cursor] ?? "")) cursor += 1;
    if (tagSource[cursor] !== "=") continue;
    cursor += 1;
    while (/\s/.test(tagSource[cursor] ?? "")) cursor += 1;

    const valueStart = cursor;
    const first = tagSource[valueStart] ?? "";
    if (first === "\"" || first === "'") {
      const end = findQuotedEnd(tagSource, valueStart, first);
      if (end < 0) break;
      if (visibleAttributeNames.has(name)) values.push(tagSource.slice(valueStart + 1, end));
      cursor = end + 1;
    } else if (first === "{") {
      const end = findBalancedBraceEnd(tagSource, valueStart);
      if (end < 0) break;
      if (visibleAttributeNames.has(name)) {
        pushQuotedLiterals(values, tagSource.slice(valueStart + 1, end));
      }
      cursor = end + 1;
    } else {
      while (cursor < tagSource.length && !/\s/.test(tagSource[cursor] ?? "")) cursor += 1;
    }
  }
}

function pushChildContent(values: string[], source: string): void {
  let plainStart = 0;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] !== "{") continue;
    values.push(source.slice(plainStart, index));
    const end = findBalancedBraceEnd(source, index);
    if (end < 0) return;
    pushQuotedLiterals(values, source.slice(index + 1, end));
    index = end;
    plainStart = end + 1;
  }
  values.push(source.slice(plainStart));
}

function findQuotedEnd(source: string, start: number, quote: string): number {
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === "\\") index += 1;
    else if (source[index] === quote) return index;
  }
  return -1;
}

function findBalancedBraceEnd(source: string, start: number): number {
  let depth = 0;
  let quote: string | undefined;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index] ?? "";
    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = undefined;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") quote = char;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function pushQuotedLiterals(values: string[], source: string): void {
  for (const literal of source.matchAll(/(["'`])([^"'`]*)\1/g)) {
    values.push(literal[2] ?? "");
  }
}

function matchingTerms(value: string): string[] {
  return FORBIDDEN_FOUNDER_TERMS.filter((term) => includesTerm(value, term));
}

function includesTerm(value: string, term: string): boolean {
  return value.toLocaleLowerCase("en-US").includes(term.toLocaleLowerCase("en-US"));
}

function filesUnder(path: string): string[] {
  const stat = statSync(path);
  if (stat.isFile()) return [path];
  return readdirSync(path).flatMap((entry) => filesUnder(join(path, entry)));
}

const isMain = process.argv[1] !== undefined
  && normalize(resolve(process.argv[1])) === normalize(fileURLToPath(import.meta.url));
if (isMain) {
  const violations = collectForbiddenCopyViolations();
  if (violations.length > 0) {
    console.error(violations.join("\n"));
    process.exit(1);
  }
}
