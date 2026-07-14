import type { DecisionRecord } from "../decisions/types.ts";
import { INTERPRETATION_CLAIM_REGISTRY } from "../interpretation/claimRegistry.ts";
import {
  findObservedPrecedentCandidates,
  selectObservedPrecedent,
} from "../repeat/selectObservedPrecedent.ts";
import { repeatObservedPrecedent } from "../repeat/repeatObservedPrecedent.ts";
import { buildSessionReport } from "../report/buildSessionReport.ts";
import { sampleRosterRows } from "../rosterFixtures.ts";
import type { ThemeReview } from "../review/types.ts";
import type { DecisionRoomSessionState } from "../session/types.ts";
import { detectStructuralFindings } from "../structuralFindings.ts";
import { buildStructuralThemes } from "../themes/buildStructuralThemes.ts";
import { selectReviewSubjects } from "../themes/selectReviewSubjects.ts";

export const DECISION_ROOM_DEMO_CONTRACT = {
  route: "/hr-paysim/decision-room-preview",
  syntheticOnly: true,
  sampleLabel: "샘플로 입력한 내용",
  screens: [
    "introduction",
    "confirmed_pay_differences",
    "company_rule",
    "session_result",
  ],
  clicksToResult: 3,
  prefilledRoleGroup: "Product Engineer",
} as const;

export function createSyntheticDemoSession(): DecisionRoomSessionState {
  const rows = sampleRosterRows.map((row) => ({ ...row }));
  const themes = buildStructuralThemes(rows, detectStructuralFindings(rows));
  const selection = selectReviewSubjects(themes);
  const productTheme = selection.selected.find(
    (theme) => theme.roleGroup === DECISION_ROOM_DEMO_CONTRACT.prefilledRoleGroup,
  );
  if (!productTheme) throw new Error("SYNTHETIC_PRODUCT_THEME_NOT_FOUND");

  const review: ThemeReview = {
    themeId: productTheme.id,
    explanationBasis: "market_hiring_additional_pay",
    evidenceStatus: "documented",
    repeatabilityStatus: "unanswered",
    outcome: "explained_with_evidence",
    approvedSentenceKey: "market_hiring_additional_pay",
  };
  const claim = INTERPRETATION_CLAIM_REGISTRY.find(
    (item) => item.themeId === productTheme.id,
  );
  if (!claim) throw new Error("SYNTHETIC_PRODUCT_CLAIM_NOT_FOUND");

  const candidates = findObservedPrecedentCandidates(rows, productTheme.roleGroup);
  const precedent = selectObservedPrecedent(
    candidates,
    "row_004",
    "documented_hiring_exception",
  );
  const repeat = repeatObservedPrecedent(productTheme.id, rows, precedent);
  const decision: DecisionRecord = {
    id: "decision-product-hiring-additional-pay",
    themeIds: [productTheme.id],
    actionKey: "define_hiring_additional_pay",
    ownerRole: "CEO_AND_HR",
    dueEvent: "BEFORE_NEXT_OFFER",
    status: "approved",
  };
  const reviews = { [productTheme.id]: review };
  const interpretations = { [productTheme.id]: claim };
  const repeats = { [productTheme.id]: repeat };
  const report = buildSessionReport({
    themes,
    reviews,
    validatedClaims: [claim],
    repeatResults: repeats,
    decisions: [decision],
    followUps: [],
    unselectedSubjects: selection.unselected,
  });

  return {
    mode: "demo",
    screen: "introduction",
    rows,
    themes,
    selection,
    activeThemeId: productTheme.id,
    reviews,
    interpretations,
    repeats,
    decisions: [decision],
    report,
  };
}
