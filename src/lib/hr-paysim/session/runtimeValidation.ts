import { createDecisionRecord } from "../decisions/decisionRecords.ts";
import type { DecisionRecord } from "../decisions/types.ts";
import { INTERPRETATION_CLAIM_REGISTRY } from "../interpretation/claimRegistry.ts";
import type { InterpretationClaim } from "../interpretation/types.ts";
import { validateInterpretationClaim } from "../interpretation/validateInterpretationClaims.ts";
import {
  findObservedPrecedentCandidates,
  selectObservedPrecedent,
} from "../repeat/selectObservedPrecedent.ts";
import { repeatObservedPrecedent } from "../repeat/repeatObservedPrecedent.ts";
import type { PrecedentRepeatResult } from "../repeat/types.ts";
import type {
  EvidenceFollowUp,
  EvidenceStatus,
  ExplanationBasis,
  RepeatabilityStatus,
} from "../review/types.ts";
import type { ThemeReviewUpdate } from "../review/updateThemeReview.ts";
import type { ReviewSubjectSelection } from "../themes/selectReviewSubjects.ts";
import type { StructuralTheme } from "../themes/types.ts";
import type { NormalizedRosterRow } from "../domain.ts";
import type { DecisionRoomSessionState } from "./types.ts";
import {
  cloneSafePlainData,
  isPlainDataArray,
  isPlainDataRecord,
  ownDataValue,
  safePlainDataEqual,
} from "./safePlainData.ts";

const modes = new Set<DecisionRoomSessionState["mode"]>(["facilitated", "demo"]);
const explanationBases = new Set<ExplanationBasis | "unanswered">([
  "unanswered",
  "role_responsibility_difference",
  "market_hiring_additional_pay",
  "performance_or_scarce_skill",
  "retention_exception",
  "timing_context",
  "founder_cannot_explain",
]);
const evidenceStatuses = new Set<EvidenceStatus>([
  "unanswered",
  "documented",
  "observable",
  "leader_assertion_only",
  "insufficient_data",
]);
const repeatabilityStatuses = new Set<RepeatabilityStatus>([
  "unanswered",
  "reusable_rule",
  "conditional_rule",
  "one_time_exception",
  "not_reusable",
  "insufficient_data",
]);
const evidenceNeededValues = new Set<EvidenceFollowUp["evidenceNeeded"]>([
  "role_document",
  "offer_record",
  "raise_history",
  "exception_approval",
]);
const followUpOwnerRoles = new Set<EvidenceFollowUp["ownerRole"]>([
  "CEO",
  "HR",
  "ROLE_LEAD",
]);
const dueEvents = new Set<EvidenceFollowUp["dueEvent"]>([
  "BEFORE_NEXT_OFFER",
  "BEFORE_NEXT_REVIEW",
  "WITHIN_TWO_WEEKS",
]);
const screens = new Set([
  "introduction",
  "confirmed_pay_differences",
  "company_rule",
  "session_result",
]);
const rowKeys = new Set([
  "rowId", "roleGroup", "title", "levelLabel", "levelRank", "baseSalaryKRW",
  "startDate", "tenureMonths", "latestRaiseDate", "latestRaiseAmountKRW",
  "relevantExperienceMonths",
  "exceptionFlag", "counterOfferFlag", "managerLabel", "teamLabel",
]);
const themeKeys = new Set([
  "id", "roleGroup", "archetype", "dataStatus", "patternKind", "findingIds",
  "headlinePair", "comparisonPairs", "affectedRowIds", "supportingObservations",
  "metrics", "normalizedHeadlineGap",
]);
const pairKeys = new Set([
  "underpaidRowId", "comparatorRowId", "salaryGapKRW", "gapPercentage",
  "reasonThisIsHardToDefend",
]);
const metricKeys = new Set([
  "headlineGapKRW", "pairRepairFloorKRW", "systemRepairFloorKRW",
  "roleGroupPayrollContextKRW", "nonClaim",
]);

export interface ValidStartSession {
  mode: DecisionRoomSessionState["mode"];
  rows: NormalizedRosterRow[];
  themes: StructuralTheme[];
  selection: ReviewSubjectSelection;
  activeThemeId?: string;
}

export function parseStartSessionAction(action: Record<string, unknown>): ValidStartSession | undefined {
  if (!hasOnlyKeys(
    action,
    ["type", "mode", "rows", "themes", "selection", "activeThemeId"],
    ["type", "mode", "rows", "themes", "selection"],
  )) {
    return undefined;
  }
  if (!isEnum(action.mode, modes) || !isPlainDataArray(action.rows) || !isPlainDataArray(action.themes)) {
    return undefined;
  }
  if (!action.rows.every(isNormalizedRosterRow) || !action.themes.every(isStructuralTheme)) {
    return undefined;
  }
  if (hasDuplicateIds(action.rows, "rowId") || hasDuplicateIds(action.themes, "id")) {
    return undefined;
  }
  const rowIds = new Set(action.rows.map((row) => row.rowId));
  if (action.themes.some((theme) => !themeReferencesKnownRows(theme, rowIds))) {
    return undefined;
  }
  const selection = parseSelection(action.selection, action.themes);
  if (!selection) return undefined;
  const hasActiveThemeId = Object.hasOwn(action, "activeThemeId");
  if (hasActiveThemeId) {
    if (!isNonEmptyString(action.activeThemeId)) return undefined;
    if (!selection.selected.some((theme) => theme.id === action.activeThemeId)) return undefined;
  }
  return {
    mode: action.mode,
    rows: clonePlainData(action.rows),
    themes: clonePlainData(action.themes),
    selection: clonePlainData(selection),
    ...(hasActiveThemeId ? { activeThemeId: action.activeThemeId as string } : {}),
  };
}

export function parseReviewUpdate(
  value: unknown,
  themeId: string,
): ThemeReviewUpdate | undefined {
  if (!isRecord(value)) return undefined;
  if (Object.keys(value).length === 0) return undefined;
  if (!hasOnlyKeys(value, [
    "explanationBasis",
    "evidenceStatus",
    "repeatabilityStatus",
    "evidenceFollowUp",
  ], [])) return undefined;
  if (Object.hasOwn(value, "explanationBasis") && !isEnum(value.explanationBasis, explanationBases)) {
    return undefined;
  }
  if (Object.hasOwn(value, "evidenceStatus") && !isEnum(value.evidenceStatus, evidenceStatuses)) {
    return undefined;
  }
  if (
    Object.hasOwn(value, "repeatabilityStatus")
    && !isEnum(value.repeatabilityStatus, repeatabilityStatuses)
  ) return undefined;
  if (Object.hasOwn(value, "evidenceFollowUp") && !isEvidenceFollowUp(value.evidenceFollowUp, themeId)) {
    return undefined;
  }
  return clonePlainData(value) as ThemeReviewUpdate;
}

export function resolveCanonicalClaims(
  value: unknown,
  state: DecisionRoomSessionState,
): InterpretationClaim[] | undefined {
  if (!isPlainDataArray(value)) return undefined;
  const selectedIds = selectedThemeIds(state);
  const resolved: InterpretationClaim[] = [];
  const seenThemeIds = new Set<string>();
  for (const supplied of value) {
    if (
      !isRecord(supplied)
      || !Object.hasOwn(supplied, "id")
      || !Object.hasOwn(supplied, "themeId")
      || !isNonEmptyString(supplied.id)
      || !isNonEmptyString(supplied.themeId)
    ) {
      return undefined;
    }
    if (!selectedIds.has(supplied.themeId) || !state.reviews[supplied.themeId]) return undefined;
    if (seenThemeIds.has(supplied.themeId)) return undefined;
    const canonical = INTERPRETATION_CLAIM_REGISTRY.find(
      (claim) => claim.id === supplied.id && claim.themeId === supplied.themeId,
    );
    const theme = state.themes.find((item) => item.id === supplied.themeId);
    if (!canonical || !theme || !plainDataEqual(supplied, canonical)) return undefined;
    const errors = validateInterpretationClaim(canonical, {
      evidenceIds: new Set(theme.findingIds),
      reviewedStateIds: new Set([theme.id]),
    });
    if (errors.length > 0) return undefined;
    seenThemeIds.add(canonical.themeId);
    resolved.push(clonePlainData(canonical));
  }
  return resolved.sort((a, b) => compareCodeUnits(a.id, b.id));
}

export function resolveCanonicalRepeat(
  value: unknown,
  state: DecisionRoomSessionState,
): PrecedentRepeatResult | undefined {
  if (
    !isRecord(value)
    || !Object.hasOwn(value, "themeId")
    || !isNonEmptyString(value.themeId)
  ) return undefined;
  const theme = state.themes.find((item) => item.id === value.themeId);
  if (!theme || !selectedThemeIds(state).has(theme.id) || !state.reviews[theme.id]) return undefined;

  try {
    const candidates = findObservedPrecedentCandidates(state.rows, theme.roleGroup);
    for (const candidate of candidates) {
      const selection = selectObservedPrecedent(
        candidates,
        candidate.sourceRowId,
        "documented_hiring_exception",
      );
      const canonical = repeatObservedPrecedent(theme.id, state.rows, selection);
      if (plainDataEqual(value, canonical)) return clonePlainData(canonical);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function resolveCanonicalDecision(
  value: unknown,
  state: DecisionRoomSessionState,
): DecisionRecord | undefined {
  if (!isRecord(value) || !hasOnlyKeys(
    value,
    ["id", "themeIds", "actionKey", "ownerRole", "dueEvent", "status"],
    ["id", "themeIds", "actionKey", "ownerRole", "dueEvent", "status"],
  )) return undefined;
  if (
    !isPlainDataArray(value.themeIds)
    || !value.themeIds.every((themeId) => typeof themeId === "string")
  ) return undefined;
  const result = createDecisionRecord(value, validDecisionThemeIds(state));
  return result.status === "ready" && result.decision.status === "approved"
    ? clonePlainData(result.decision)
    : undefined;
}

export function validDecisionThemeIds(state: DecisionRoomSessionState): ReadonlySet<string> {
  const currentIds = new Set(state.themes.map((theme) => theme.id));
  const selectedIds = selectedThemeIds(state);
  return new Set(
    Object.keys(state.reviews).filter((id) => currentIds.has(id) && selectedIds.has(id)),
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return isPlainDataRecord(value);
}

export function hasOnlyKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  required: readonly string[] = ["type"],
): boolean {
  const allowedSet = new Set(allowed);
  return required.every((key) => Object.hasOwn(value, key))
    && Object.keys(value).every((key) => allowedSet.has(key));
}

export function isKnownScreen(value: unknown): boolean {
  return isEnum(value, screens);
}

export function clonePlainData<T>(value: T): T {
  return cloneSafePlainData(value);
}

export function plainDataEqual(left: unknown, right: unknown): boolean {
  return safePlainDataEqual(left, right);
}

function parseSelection(value: unknown, themes: StructuralTheme[]): ReviewSubjectSelection | undefined {
  if (!isRecord(value) || !hasOnlyKeys(
    value,
    ["selected", "unselected", "recommendedIds", "wasOverridden"],
    ["selected", "unselected", "recommendedIds", "wasOverridden"],
  )) return undefined;
  if (
    !isPlainDataArray(value.selected)
    || !isPlainDataArray(value.unselected)
    || !isStringArray(value.recommendedIds)
    || typeof value.wasOverridden !== "boolean"
  ) return undefined;
  if (value.selected.length > 3 || value.recommendedIds.length > 3) return undefined;
  const themesById = new Map(themes.map((theme) => [theme.id, theme]));
  const selected = resolveSelectionThemes(value.selected, themesById);
  const unselected = resolveSelectionThemes(value.unselected, themesById);
  if (!selected || !unselected) return undefined;
  const selectedIds = selected.map((theme) => theme.id);
  const unselectedIds = unselected.map((theme) => theme.id);
  if (hasDuplicates(selectedIds) || hasDuplicates(unselectedIds) || hasDuplicates(value.recommendedIds)) {
    return undefined;
  }
  const allSelectionIds = [...selectedIds, ...unselectedIds];
  if (hasDuplicates(allSelectionIds) || allSelectionIds.length !== themes.length) return undefined;
  if (allSelectionIds.some((id) => !themesById.has(id))) return undefined;
  if (value.recommendedIds.some((id) => !themesById.has(id))) return undefined;
  return {
    selected,
    unselected,
    recommendedIds: [...value.recommendedIds],
    wasOverridden: value.wasOverridden,
  };
}

function resolveSelectionThemes(
  values: unknown[],
  themesById: ReadonlyMap<string, StructuralTheme>,
): StructuralTheme[] | undefined {
  const resolved: StructuralTheme[] = [];
  for (const supplied of values) {
    if (!isRecord(supplied) || !Object.hasOwn(supplied, "id") || !isNonEmptyString(supplied.id)) return undefined;
    const canonical = themesById.get(supplied.id);
    if (!canonical || !plainDataEqual(supplied, canonical)) return undefined;
    resolved.push(clonePlainData(canonical));
  }
  return resolved;
}

function isNormalizedRosterRow(value: unknown): value is NormalizedRosterRow {
  if (!isRecord(value) || !Object.keys(value).every((key) => rowKeys.has(key))) return false;
  if (!hasOwnKeys(value, ["rowId", "roleGroup", "baseSalaryKRW"])) return false;
  if (!isNonEmptyString(value.rowId) || !isNonEmptyString(value.roleGroup) || !isFiniteNumber(value.baseSalaryKRW)) {
    return false;
  }
  return optionalStringsValid(value, [
    "title", "levelLabel", "startDate", "latestRaiseDate", "managerLabel", "teamLabel",
  ]) && optionalNumbersValid(value, ["levelRank", "tenureMonths", "relevantExperienceMonths", "latestRaiseAmountKRW"])
    && optionalBooleansValid(value, ["exceptionFlag", "counterOfferFlag"]);
}

function isStructuralTheme(value: unknown): value is StructuralTheme {
  if (!isRecord(value) || !Object.keys(value).every((key) => themeKeys.has(key))) return false;
  if (!hasOwnKeys(value, [
    "id", "roleGroup", "archetype", "dataStatus", "patternKind", "findingIds",
    "comparisonPairs", "affectedRowIds", "supportingObservations", "metrics",
    "normalizedHeadlineGap",
  ])) return false;
  return isNonEmptyString(value.id)
    && isNonEmptyString(value.roleGroup)
    && ["emergent_structure", "cohort_precedent", "level_integrity", "isolated_relationship"].includes(String(value.archetype))
    && ["sufficient", "partial"].includes(String(value.dataStatus))
    && ["systematic", "isolated"].includes(String(value.patternKind))
    && isStringArray(value.findingIds)
    && (!Object.hasOwn(value, "headlinePair") || isFindingPair(value.headlinePair))
    && isPlainDataArray(value.comparisonPairs) && value.comparisonPairs.every(isFindingPair)
    && isStringArray(value.affectedRowIds)
    && isPlainDataArray(value.supportingObservations) && value.supportingObservations.every(isSupportingObservation)
    && isMetricSet(value.metrics)
    && isFiniteNumber(value.normalizedHeadlineGap);
}

function isFindingPair(value: unknown): boolean {
  return isRecord(value)
    && Object.keys(value).every((key) => pairKeys.has(key))
    && isNonEmptyString(value.underpaidRowId)
    && hasOwnKeys(value, ["underpaidRowId", "comparatorRowId", "salaryGapKRW", "reasonThisIsHardToDefend"])
    && isNonEmptyString(value.comparatorRowId)
    && isFiniteNumber(value.salaryGapKRW)
    && (!Object.hasOwn(value, "gapPercentage") || isFiniteNumber(value.gapPercentage))
    && typeof value.reasonThisIsHardToDefend === "string";
}

function isSupportingObservation(value: unknown): boolean {
  return isRecord(value)
    && hasOnlyKeys(value, ["sourceType", "plainLanguageKey", "affectedRowIds"], ["sourceType", "plainLanguageKey", "affectedRowIds"])
    && ["shadow_band", "pay_inversion", "level_fiction_band_overlap", "loyalty_tax"].includes(String(value.sourceType))
    && ["two_salary_groups", "recent_hire_gap_repeats", "level_order_conflict"].includes(String(value.plainLanguageKey))
    && isStringArray(value.affectedRowIds);
}

function isMetricSet(value: unknown): boolean {
  return isRecord(value)
    && Object.keys(value).every((key) => metricKeys.has(key))
    && Object.hasOwn(value, "nonClaim")
    && typeof value.nonClaim === "string"
    && optionalNumbersValid(value, [
      "headlineGapKRW", "pairRepairFloorKRW", "systemRepairFloorKRW", "roleGroupPayrollContextKRW",
    ]);
}

function themeReferencesKnownRows(theme: StructuralTheme, rowIds: ReadonlySet<string>): boolean {
  const referenced = [
    ...theme.affectedRowIds,
    ...theme.comparisonPairs.flatMap((pair) => [pair.underpaidRowId, pair.comparatorRowId]),
    ...theme.supportingObservations.flatMap((item) => item.affectedRowIds),
    ...(Object.hasOwn(theme, "headlinePair") ? [theme.headlinePair!.underpaidRowId, theme.headlinePair!.comparatorRowId] : []),
  ];
  return referenced.every((id) => rowIds.has(id));
}

function isEvidenceFollowUp(value: unknown, themeId: string): value is EvidenceFollowUp {
  return isRecord(value)
    && hasOnlyKeys(value, ["id", "themeId", "evidenceNeeded", "ownerRole", "dueEvent"], ["id", "themeId", "evidenceNeeded", "ownerRole", "dueEvent"])
    && isNonEmptyString(value.id)
    && value.themeId === themeId
    && isEnum(value.evidenceNeeded, evidenceNeededValues)
    && isEnum(value.ownerRole, followUpOwnerRoles)
    && isEnum(value.dueEvent, dueEvents);
}

function selectedThemeIds(state: DecisionRoomSessionState): ReadonlySet<string> {
  return new Set(state.selection.selected.map((theme) => theme.id));
}

function optionalStringsValid(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => !Object.hasOwn(value, key) || typeof ownDataValue(value, key) === "string");
}

function optionalNumbersValid(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => !Object.hasOwn(value, key) || isFiniteNumber(ownDataValue(value, key)));
}

function optionalBooleansValid(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => !Object.hasOwn(value, key) || typeof ownDataValue(value, key) === "boolean");
}

function isStringArray(value: unknown): value is string[] {
  return isPlainDataArray(value) && value.every(isNonEmptyString);
}

function hasOwnKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((key) => Object.hasOwn(value, key));
}

function hasDuplicateIds<T extends Record<K, string>, K extends "id" | "rowId">(
  values: T[],
  key: K,
): boolean {
  return hasDuplicates(values.map((value) => value[key]));
}

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isEnum<T extends string>(value: unknown, allowed: ReadonlySet<T>): value is T {
  return typeof value === "string" && allowed.has(value as T);
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
