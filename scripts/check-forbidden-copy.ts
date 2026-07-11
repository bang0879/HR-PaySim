import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, normalize, resolve } from "node:path";
import { FOUNDER_COPY } from "../src/lib/hr-paysim/copy/founderCopy.ts";
import { FORBIDDEN_FOUNDER_TERMS } from "../src/lib/hr-paysim/copy/forbiddenFounderTerms.ts";

const roots = ["src/components", "src/routes", "src/App.tsx"];

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
  const sourceViolations = roots
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
  for (const match of source.matchAll(/>([^<>{}\r\n]+)</g)) values.push(match[1] ?? "");
  for (const match of source.matchAll(/\b(?:aria-label|title|placeholder|alt|label|description|text|body)\s*=\s*(["'])(.*?)\1/gs)) {
    values.push(match[2] ?? "");
  }
  for (const match of source.matchAll(/\{\s*(["'`])([^"'`]+)\1\s*\}/g)) values.push(match[2] ?? "");
  return values;
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
