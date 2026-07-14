import {
  FOUNDER_COPY,
  formatCareerEvidenceTitle,
  formatCurrentInputObservation,
  formatGtmEvidenceTitle,
  formatPendingRuleContext,
  formatProductEngineerEvidenceSupporting,
  formatProductEngineerEvidenceTitle,
  formatRoleDistributionHeading,
  formatRoleDistributionKicker,
  formatRelevantExperience,
  formatRoleObservationsHeading,
} from "../../lib/hr-paysim/copy/founderCopy.ts";
import { resolveOrderedLevelPolicy } from "../../lib/hr-paysim/detectors/careerComparablePairs.ts";
import type { DecisionRecord } from "../../lib/hr-paysim/decisions/types.ts";
import { createEmployeeLabels } from "../../lib/hr-paysim/presentation/createEmployeeLabels.ts";
import { findObservedPrecedentCandidates } from "../../lib/hr-paysim/repeat/selectObservedPrecedent.ts";
import type { NormalizedRosterRow } from "../../lib/hr-paysim/domain.ts";
import type { EvidenceStatus, ExplanationBasis } from "../../lib/hr-paysim/review/types.ts";
import type {
  DecisionRoomScreen,
  DecisionRoomSessionState,
} from "../../lib/hr-paysim/session/types.ts";

export function getActiveSubjectId(state: DecisionRoomSessionState): string | undefined {
  return state.activeThemeId;
}

export function createSubjectSelectionAction(
  state: DecisionRoomSessionState,
  roleGroup: string,
) {
  const selectedId = state.selection.selected.find((item) => item.roleGroup === roleGroup)?.id;
  return selectedId ? { type: "SELECT_THEME" as const, themeId: selectedId } : undefined;
}

export const DECISION_ROOM_PROGRESS: ReadonlyArray<{
  id: DecisionRoomScreen;
  label: string;
}> = [
  { id: "introduction", label: FOUNDER_COPY["screen.introduction.heading"] },
  { id: "confirmed_pay_differences", label: FOUNDER_COPY["screen.evidence.heading"] },
  { id: "company_rule", label: FOUNDER_COPY["screen.rule.heading"] },
  { id: "session_result", label: FOUNDER_COPY["screen.result.heading"] },
];

const explanationLabels: Record<ExplanationBasis, string> = {
  role_responsibility_difference: "역할과 책임 범위가 달랐습니다.",
  market_hiring_additional_pay: "채용 당시 추가 보상이 있었습니다.",
  performance_or_scarce_skill: "성과 또는 희소 역량을 반영했습니다.",
  retention_exception: "퇴사 방지를 위한 예외였습니다.",
  timing_context: "연봉을 정한 시점과 상황이 달랐습니다.",
  founder_cannot_explain: "현재는 이유를 설명하기 어렵습니다.",
};

const evidenceLabels: Record<EvidenceStatus, string> = {
  unanswered: "아직 확인하지 않았습니다.",
  documented: "승인 기록이나 문서가 있습니다.",
  observable: "업무 기록에서 확인할 수 있습니다.",
  leader_assertion_only: "현재는 리더의 설명만 있습니다.",
  insufficient_data: "확인할 자료가 부족합니다.",
};

const actionLabels: Record<DecisionRecord["actionKey"], string> = {
  define_hiring_additional_pay: "다음 채용 전 추가 보상 기준을 문서로 정합니다.",
  review_long_tenure_pay: "다음 인사평가 전 근속 기간별 연봉 검토 기준을 확인합니다.",
  document_role_ranges: "역할과 직급별 연봉 범위를 문서로 정합니다.",
  collect_evidence: "설명을 확인할 자료와 담당자를 정합니다.",
};

const ownerLabels: Record<DecisionRecord["ownerRole"], string> = {
  CEO: "대표",
  HR: "HR",
  ROLE_LEAD: "직무 리더",
  CEO_AND_HR: "대표 · HR",
};

const dueLabels: Record<DecisionRecord["dueEvent"], string> = {
  BEFORE_NEXT_OFFER: "다음 채용 제안 전",
  BEFORE_NEXT_REVIEW: "다음 인사평가 전",
  WITHIN_TWO_WEEKS: "2주 이내",
};

export function createProductEngineerDecisionRoomViewModel(
  state: DecisionRoomSessionState,
) {
  const selectedTheme = state.selection.selected.find(
    (item) => item.roleGroup === "Product Engineer",
  );
  if (!selectedTheme?.headlinePair) throw new Error("PRODUCT_ENGINEER_COMPARISON_REQUIRED");
  const headlineGapKRW = selectedTheme.metrics.headlineGapKRW;
  if (typeof headlineGapKRW !== "number") {
    throw new Error("PRODUCT_ENGINEER_HEADLINE_GAP_REQUIRED");
  }

  const rows = state.rows
    .filter((row) => row.roleGroup === selectedTheme.roleGroup)
    .sort((a, b) => a.baseSalaryKRW - b.baseSalaryKRW || compareText(a.rowId, b.rowId));
  const showLevelEvidence = resolveOrderedLevelPolicy(rows) === "complete";
  const labels = createEmployeeLabels(
    rows,
    selectedTheme.headlinePair.underpaidRowId,
    selectedTheme.headlinePair.comparatorRowId,
  );
  const lowerPaid = requiredRow(rows, selectedTheme.headlinePair.underpaidRowId);
  const higherPaid = requiredRow(rows, selectedTheme.headlinePair.comparatorRowId);
  if (
    lowerPaid.relevantExperienceMonths === undefined
    || higherPaid.relevantExperienceMonths === undefined
  ) {
    throw new Error("PRODUCT_ENGINEER_HEADLINE_RELEVANT_EXPERIENCE_REQUIRED");
  }
  if (lowerPaid.tenureMonths === undefined || higherPaid.tenureMonths === undefined) {
    throw new Error("PRODUCT_ENGINEER_HEADLINE_TENURE_REQUIRED");
  }
  const review = state.reviews[selectedTheme.id];
  const repeat = state.repeats[selectedTheme.id];
  const decision = state.decisions.find((item) => item.themeIds.includes(selectedTheme.id));
  const employeeCount = rows.length;
  const lowerPaidLabel = labels.get(lowerPaid.rowId)!;
  const higherPaidLabel = labels.get(higherPaid.rowId)!;
  const evidenceConclusion = formatProductEngineerEvidenceTitle({
    employeeCount,
    lowerPaidLabel,
    lowerPaidRelevantExperienceMonths: lowerPaid.relevantExperienceMonths,
    lowerPaidTenureMonths: lowerPaid.tenureMonths,
    higherPaidLabel,
    higherPaidRelevantExperienceMonths: higherPaid.relevantExperienceMonths,
    higherPaidTenureMonths: higherPaid.tenureMonths,
    headlineGapKRW,
  });
  const repeatAdditionalPayKRW = repeat
    ? findObservedPrecedentCandidates(rows, selectedTheme.roleGroup).find(
      (candidate) => candidate.observedSalaryKRW === repeat.syntheticRow.baseSalaryKRW,
    )?.additionalAmountKRW
    : undefined;

  return {
    introduction: {
      heading: FOUNDER_COPY["screen.introduction.heading"],
      conclusion: "금번 진단에서는 같은 역할을 맡은 직원들의 실제 연봉 차이를 확인하고, 다음 채용 전에 회사가 정해야 할 기준을 정리합니다.",
      scope: state.mode === "demo"
        ? "16명의 이름 없는 샘플 자료 중 Product Engineer 6명의 역할, 기본 연봉, 관련 경력, 회사 근속과 채용 예외 기록을 먼저 살펴봅니다."
        : `${employeeCount}명의 이름 없는 입력 자료에서 Product Engineer ${employeeCount}명의 역할, 기본 연봉, 관련 경력, 회사 근속과 채용 예외 기록을 먼저 살펴봅니다.`,
      sectionLabel: FOUNDER_COPY["screen.introduction.scope_label"],
      nonClaims: [
        "개인의 적정 연봉이나 인상액을 추천하지 않습니다.",
        "직원의 성과, 의도 또는 퇴사 가능성을 판단하지 않습니다.",
      ],
      outputs: [
        `Product Engineer ${employeeCount}명의 실제 연봉 분포와 구체적인 직원 비교를 확인합니다.`,
        "선택한 설명을 어떤 기록으로 확인할 수 있는지 정리합니다.",
        "같은 채용 방식을 다음에도 적용하기 전에 회사가 정할 기준과 담당 시점을 남깁니다.",
      ],
      duration: "예상 대화 시간은 45~60분입니다.",
      nextStepSummary:
        `먼저 Product Engineer ${employeeCount}명의 실제 연봉 분포와 직원 A·B 비교를 확인합니다.`,
      primaryAction: FOUNDER_COPY["action.view_evidence"],
    },
    evidence: {
      heading: FOUNDER_COPY["screen.evidence.heading"],
      conclusion: evidenceConclusion,
      supportingCopy: formatProductEngineerEvidenceSupporting({
        employeeCount: rows.length,
        lowerPaidLabel: labels.get(lowerPaid.rowId)!,
        higherPaidLabel: labels.get(higherPaid.rowId)!,
      }),
      actionPrompt: FOUNDER_COPY["screen.evidence.product_engineer.action_prompt"],
      nonClaim: FOUNDER_COPY["non_claim.higher_salary"],
      distributionKicker:
        `Product Engineer ${employeeCount}명의 기본 연봉과 관련 경력`,
      distributionHeading:
        `Product Engineer ${employeeCount}명의 기본 연봉과 관련 경력을 함께 표시했습니다.`,
      distribution: rows.map((row) => ({
        employeeLabel: labels.get(row.rowId)!,
        salary: formatManwon(row.baseSalaryKRW),
        salaryKRW: row.baseSalaryKRW,
        relevantExperience: formatRelevantExperience(row.relevantExperienceMonths),
        relevantExperienceMonths: row.relevantExperienceMonths,
        tenure: formatTenure(row.tenureMonths),
        tenureMonths: row.tenureMonths,
        levelLabel: row.levelLabel,
        highlighted: row.rowId === lowerPaid.rowId || row.rowId === higherPaid.rowId,
      })),
      highlightedPair: {
        lowerPaidLabel: labels.get(lowerPaid.rowId)!,
        higherPaidLabel: labels.get(higherPaid.rowId)!,
        lowerPaidSalary: formatManwon(lowerPaid.baseSalaryKRW),
        higherPaidSalary: formatManwon(higherPaid.baseSalaryKRW),
        difference: formatManwon(higherPaid.baseSalaryKRW - lowerPaid.baseSalaryKRW),
        lowerPaidRelevantExperience: formatRelevantExperience(lowerPaid.relevantExperienceMonths),
        higherPaidRelevantExperience: formatRelevantExperience(higherPaid.relevantExperienceMonths),
        lowerPaidTenure: formatTenure(lowerPaid.tenureMonths),
        higherPaidTenure: formatTenure(higherPaid.tenureMonths),
        lowerPaidException: formatExceptionRecord(lowerPaid),
        higherPaidException: formatExceptionRecord(higherPaid),
      },
      supportingObservationsHeading:
        `Product Engineer ${employeeCount}명 전체에서도 비슷한 차이가 반복되는지 확인했습니다.`,
      supportingObservations: [
        `Product Engineer ${employeeCount}명의 관련 경력과 기본 연봉을 함께 놓았을 때, ${formatRelevantExperience(lowerPaid.relevantExperienceMonths)}·회사 근속 ${lowerPaid.tenureMonths}개월인 ${lowerPaidLabel}는 ${formatManwon(lowerPaid.baseSalaryKRW)}이고 ${formatRelevantExperience(higherPaid.relevantExperienceMonths)}·회사 근속 ${higherPaid.tenureMonths}개월인 ${higherPaidLabel}는 ${formatManwon(higherPaid.baseSalaryKRW)}입니다.`,
        `${lowerPaidLabel}와 ${higherPaidLabel} 사이의 ${formatManwon(headlineGapKRW)} 차이가 가장 큽니다. 현재 기록만으로 이 차이를 모두 설명할 공통 기준은 확인되지 않았습니다.`,
      ],
      explanationQuestion:
        FOUNDER_COPY["screen.evidence.product_engineer.explanation_question"],
      explanationChoices: Object.entries(explanationLabels).map(([value, label]) => ({ value, label })),
      selectedExplanation: review?.explanationBasis ?? "unanswered",
      evidenceQuestion: review?.explanationBasis && review.explanationBasis !== "unanswered"
        ? "선택한 설명을 직원들에게 같은 기준으로 안내할 수 있도록 확인할 기록이나 업무 자료가 있습니까?"
        : undefined,
      evidenceChoices: Object.entries(evidenceLabels).map(([value, label]) => ({ value, label })),
      selectedEvidence: review?.evidenceStatus ?? "unanswered",
      evidenceRows: [lowerPaid, higherPaid].map((row) => ({
        employeeLabel: labels.get(row.rowId)!,
        role: row.roleGroup,
        level: showLevelEvidence ? row.levelLabel : undefined,
        relevantExperience: formatRelevantExperience(row.relevantExperienceMonths),
        relevantExperienceMonths: row.relevantExperienceMonths,
        tenure: formatTenure(row.tenureMonths),
        tenureMonths: row.tenureMonths,
        salary: formatManwon(row.baseSalaryKRW),
        documentedException: formatExceptionRecord(row),
      })),
      primaryAction: FOUNDER_COPY["action.repeat_practice"],
    },
    rule: {
      heading: FOUNDER_COPY["screen.rule.heading"],
      conclusion: repeat
        ? `현재 확인된 채용 사례를 한 번 더 적용한다고 가정하면 기존 Product Engineer ${repeat.affectedRowIds.length}명과 최대 ${formatManwon(repeat.maximumGapKRW)}의 연봉 차이가 생깁니다.`
        : "앞서 선택한 설명이 변경되어 같은 채용 방식을 적용한 결과를 다시 확인해야 합니다.",
      selectedExplanation: review?.explanationBasis && review.explanationBasis !== "unanswered"
        ? explanationLabels[review.explanationBasis]
        : "설명을 먼저 확인해야 합니다.",
      selectedEvidence: evidenceLabels[review?.evidenceStatus ?? "unanswered"],
      observedRepeat: {
        heading: repeat
          ? `다음 Product Engineer의 기본 연봉이 ${formatManwon(repeat.syntheticRow.baseSalaryKRW)}이라고 가정해 기존 직원과 다시 비교했습니다.`
          : "설명과 근거를 다시 확인한 뒤 같은 채용 사례를 적용한 결과를 계산합니다.",
        nextHireSalary: repeat ? formatManwon(repeat.syntheticRow.baseSalaryKRW) : "계산 전",
        affectedEmployees: repeat ? `기존 Product Engineer ${repeat.affectedRowIds.length}명` : "계산 전",
        maximumDifference: repeat ? `최대 ${formatManwon(repeat.maximumGapKRW)}` : "계산 전",
        comparisonCount: repeat ? `현재와 다음 채용을 합쳐 ${repeat.combinedPairCount}개 비교` : "계산 전",
        nonClaim: FOUNDER_COPY["non_claim.observed_repeat"],
      },
      missingRuleConditions: ["적용 대상", "금액 또는 범위", "승인자", "재검토 시점"],
      ruleConditions: createRuleConditions(repeatAdditionalPayKRW),
      boundedRuleNonClaim: "위 네 가지 항목은 현재 사례에서 확인해야 할 질문이며, 아직 회사가 승인한 기준이나 개인별 권장 연봉이 아닙니다.",
      decision: {
        heading: decision
          ? "다음 채용 제안 전에 추가 보상 기준을 문서로 정합니다."
          : "설명과 근거를 다시 확인한 뒤 회사 행동을 정합니다.",
        companyAction: decision ? actionLabels[decision.actionKey] : "이번에 정한 사항이 없습니다.",
        owner: decision ? ownerLabels[decision.ownerRole] : "미정",
        due: decision ? dueLabels[decision.dueEvent] : "미정",
      },
      primaryAction: FOUNDER_COPY["action.organize_decisions"],
    },
    result: {
      heading: FOUNDER_COPY["screen.result.heading"],
      conclusion: decision
        ? "Product Engineer의 채용 추가 보상 기준을 다음 채용 제안 전에 문서로 정하기로 했습니다."
        : "앞서 선택한 설명이 변경되어 결정사항을 다시 확인해야 합니다.",
      summary: decision
        ? "현재 연봉 차이와 확인한 설명, 채용 예외 기록을 함께 남겼습니다. 다음 채용에서는 같은 추가 보상을 적용하기 전에 기존 직원과의 차이를 먼저 확인합니다."
        : "연봉 차이와 변경된 설명은 남아 있으며, 근거와 다음 행동을 다시 확인해야 합니다.",
      approvalStatus: decision ? "확인 완료" : "결정사항 다시 확인 필요",
      columns: [
        FOUNDER_COPY["result.column.confirmed"],
        FOUNDER_COPY["result.column.founder_explanation"],
        FOUNDER_COPY["result.column.evidence"],
        FOUNDER_COPY["result.column.decision"],
        FOUNDER_COPY["result.column.owner"],
        FOUNDER_COPY["result.column.due"],
      ],
      rows: [{
        confirmed: state.mode === "demo"
          ? FOUNDER_COPY["interpretation.product_engineer.salary_observation"]
          : evidenceConclusion,
        founderExplanation: review?.explanationBasis && review.explanationBasis !== "unanswered"
          ? explanationLabels[review.explanationBasis]
          : "설명 확인 필요",
        evidence: review?.evidenceStatus === "documented"
          ? "채용 예외 승인 기록 확인"
          : evidenceLabels[review?.evidenceStatus ?? "unanswered"],
        decision: decision ? actionLabels[decision.actionKey] : "결정 확인 필요",
        owner: decision ? ownerLabels[decision.ownerRole] : "미정",
        due: decision ? dueLabels[decision.dueEvent] : "미정",
      }],
      nonClaims: [
        "개인별 적정 연봉이나 인상액을 정한 결과가 아닙니다.",
        "높은 연봉을 받은 직원의 보상이 잘못됐다고 판단한 결과가 아닙니다.",
      ],
      nextActions: decision
        ? [
          { period: "다음 채용 전", action: "추가 보상의 적용 대상과 승인 절차를 문서로 정합니다." },
          { period: "다음 인사평가 전", action: "Product Engineer의 근속 기간별 연봉 검토 기준을 확인합니다." },
        ]
        : [{
          period: "다음 확인",
          action: "변경된 설명을 확인한 뒤 근거와 회사 행동을 다시 정합니다.",
        }],
      copyAction: FOUNDER_COPY["action.copy_result"],
      copySuccess: FOUNDER_COPY["state.copy_succeeded"],
      copyFailure: FOUNDER_COPY["state.copy_failed"],
      printAction: FOUNDER_COPY["action.print_result"],
      endAction: FOUNDER_COPY["action.end_and_clear"],
    },
  };
}


export interface DecisionRoomSubjectOption {
  id: string;
  roleGroup: string;
  reviewStatus: "answered" | "pending";
}

export type EvidenceVisualization =
  | {
      kind: "career";
      distribution: Array<{
        employeeLabel: string;
        salary: string;
        salaryKRW: number;
        relevantExperience: string;
        relevantExperienceMonths: number | undefined;
        tenure: string;
        tenureMonths: number | undefined;
        levelLabel: string | undefined;
        highlighted: boolean;
      }>;
      kicker: string;
      heading: string;
    }
  | {
      kind: "level_order";
      groups: Array<{
        levelLabel: string;
        employees: Array<{
          employeeLabel: string;
          salary: string;
          salaryKRW: number;
          highlighted: boolean;
        }>;
      }>;
      metrics: Array<{ label: string; amount: string }>;
      nonClaim: string;
    };

export type RuleVariant =
  | {
      kind: "observed_precedent";
      heading: string;
      metrics: Array<{ label: string; value: string }>;
      nonClaim: string;
    }
  | {
      kind: "level_order";
      heading: string;
      metrics: Array<{ label: string; amount: string }>;
      nonClaim: string;
    }
  | {
      kind: "pending";
      heading: string;
      missing: string[];
    };

export function createDecisionRoomViewModel(state: DecisionRoomSessionState) {
  const activeTheme = state.selection.selected.find((item) => item.id === state.activeThemeId)
    ?? state.selection.selected[0];
  if (!activeTheme?.headlinePair) throw new Error("ACTIVE_COMPARISON_REQUIRED");

  const subjects: DecisionRoomSubjectOption[] = state.selection.selected.map((theme) => ({
    id: theme.roleGroup,
    roleGroup: theme.roleGroup,
    reviewStatus: state.reviews[theme.id]?.explanationBasis
      && state.reviews[theme.id]?.explanationBasis !== "unanswered"
      ? "answered"
      : "pending",
  }));
  const hasPendingSubjects = subjects.some((subject) => subject.reviewStatus === "pending");
  const isMultiSubjectDemo = state.mode === "demo" && state.selection.selected.length > 1;
  const designerRows = state.rows.filter((row) => row.roleGroup === "Designer");
  const cleanState = designerRows.length > 0
    && !state.themes.some((theme) => theme.roleGroup === "Designer")
    ? {
        roleGroup: "Designer",
        statement: FOUNDER_COPY["screen.evidence.designer.clean"],
      }
    : undefined;

  const base = activeTheme.roleGroup === "Product Engineer"
    ? createProductEngineerDecisionRoomViewModel(state)
    : createRemainingSubjectViewModel(state, activeTheme);

  return {
    ...base,
    subjects,
    activeRoleGroup: activeTheme.roleGroup,
    cleanState,
    introduction: {
      ...base.introduction,
      conclusion: isMultiSubjectDemo
        ? FOUNDER_COPY["screen.introduction.conclusion"]
        : base.introduction.conclusion,
      scope: isMultiSubjectDemo
        ? FOUNDER_COPY["screen.introduction.scope.multi"]
        : base.introduction.scope,
      outputs: isMultiSubjectDemo
        ? [
            FOUNDER_COPY["screen.introduction.output.multi.compare"],
            FOUNDER_COPY["screen.introduction.output.multi.explanation"],
            FOUNDER_COPY["screen.introduction.output.multi.action"],
          ]
        : base.introduction.outputs,
      nextStepSummary: isMultiSubjectDemo
        ? FOUNDER_COPY["screen.introduction.next_step.multi"]
        : base.introduction.nextStepSummary,
      primaryAction: isMultiSubjectDemo
        ? FOUNDER_COPY["screen.introduction.first_action"]
        : base.introduction.primaryAction,
    },
    evidence: {
      ...base.evidence,
      visualization: activeTheme.roleGroup === "Product Engineer"
        ? {
            kind: "career" as const,
            distribution: base.evidence.distribution,
            kicker: base.evidence.distributionKicker,
            heading: base.evidence.distributionHeading,
          }
        : (base.evidence as { visualization: EvidenceVisualization }).visualization,
      subjects,
      activeRoleGroup: activeTheme.roleGroup,
      cleanState,
    },
    rule: {
      ...base.rule,
      variant: activeTheme.roleGroup === "Product Engineer"
        ? {
            kind: "observed_precedent" as const,
            heading: base.rule.observedRepeat.heading,
            metrics: [
              { label: FOUNDER_COPY["screen.rule.metric.next_hire"], value: base.rule.observedRepeat.nextHireSalary },
              { label: FOUNDER_COPY["screen.rule.metric.lower_paid_existing"], value: base.rule.observedRepeat.affectedEmployees },
              { label: FOUNDER_COPY["screen.rule.metric.maximum_gap"], value: base.rule.observedRepeat.maximumDifference },
              { label: FOUNDER_COPY["screen.rule.metric.comparison_count"], value: base.rule.observedRepeat.comparisonCount },
            ],
            nonClaim: base.rule.observedRepeat.nonClaim,
          }
        : (base.rule as { variant: RuleVariant }).variant,
      subjects,
      activeRoleGroup: activeTheme.roleGroup,
    },
    result: {
      ...base.result,
      conclusion: state.selection.selected.length > 1
        ? FOUNDER_COPY["screen.result.multi.conclusion"]
        : base.result.conclusion,
      summary: state.selection.selected.length > 1
        ? FOUNDER_COPY["screen.result.multi.summary"]
        : base.result.summary,
      approvalStatus: hasPendingSubjects
        ? FOUNDER_COPY["state.additional_review_required"]
        : base.result.approvalStatus,
      rows: createResultRows(state),
      nonClaims: state.selection.selected.some((theme) => theme.roleGroup === "GTM")
        ? [...base.result.nonClaims, FOUNDER_COPY["screen.evidence.gtm.non_claim"]]
        : base.result.nonClaims,
      cleanState,
      nextActions: hasPendingSubjects
        ? createPendingNextActions(state)
        : base.result.nextActions,
      unselectedSubjects: state.selection.unselected.map((theme) => ({
        id: theme.roleGroup,
        roleGroup: theme.roleGroup,
      })),
    },
  };
}

function createRemainingSubjectViewModel(
  state: DecisionRoomSessionState,
  selectedTheme: DecisionRoomSessionState["selection"]["selected"][number],
) {
  const template = createProductEngineerDecisionRoomViewModel(state);
  const rows = state.rows
    .filter((row) => row.roleGroup === selectedTheme.roleGroup)
    .sort((a, b) => a.baseSalaryKRW - b.baseSalaryKRW || compareText(a.rowId, b.rowId));
  if (!selectedTheme.headlinePair) throw new Error("ACTIVE_COMPARISON_REQUIRED");
  const lowerPaid = requiredRow(rows, selectedTheme.headlinePair.underpaidRowId);
  const higherPaid = requiredRow(rows, selectedTheme.headlinePair.comparatorRowId);
  const labels = createEmployeeLabels(rows, lowerPaid.rowId, higherPaid.rowId);
  const lowerPaidLabel = labels.get(lowerPaid.rowId)!;
  const higherPaidLabel = labels.get(higherPaid.rowId)!;
  const headlineGapKRW = selectedTheme.metrics.headlineGapKRW;
  if (headlineGapKRW === undefined) throw new Error("ACTIVE_HEADLINE_GAP_REQUIRED");
  const employeeCount = rows.length;
  const review = state.reviews[selectedTheme.id];
  const decision = state.decisions.find((item) => item.themeIds.includes(selectedTheme.id));
  const isGtm = selectedTheme.roleGroup === "GTM";
  const showLevelEvidence = isGtm || resolveOrderedLevelPolicy(rows) === "complete";
  const evidenceConclusion = isGtm
    ? formatGtmEvidenceTitle({
        employeeCount,
        lowerPaidLabel,
        lowerPaidLevel: lowerPaid.levelLabel ?? FOUNDER_COPY["screen.evidence.level_missing"],
        higherPaidLabel,
        higherPaidLevel: higherPaid.levelLabel ?? FOUNDER_COPY["screen.evidence.level_missing"],
        headlineGapKRW,
      })
    : formatCareerEvidenceTitle({
        roleGroup: selectedTheme.roleGroup,
        employeeCount,
        lowerPaidLabel,
        lowerPaidRelevantExperienceMonths: requiredRelevantExperience(lowerPaid),
        lowerPaidTenureMonths: requiredTenure(lowerPaid),
        higherPaidLabel,
        higherPaidRelevantExperienceMonths: requiredRelevantExperience(higherPaid),
        higherPaidTenureMonths: requiredTenure(higherPaid),
        headlineGapKRW,
      });
  const distribution = rows.map((row) => ({
    employeeLabel: labels.get(row.rowId)!,
    salary: formatManwon(row.baseSalaryKRW),
    salaryKRW: row.baseSalaryKRW,
    relevantExperience: formatRelevantExperience(row.relevantExperienceMonths),
    relevantExperienceMonths: row.relevantExperienceMonths,
    tenure: formatTenure(row.tenureMonths),
    tenureMonths: row.tenureMonths,
    levelLabel: row.levelLabel,
    highlighted: row.rowId === lowerPaid.rowId || row.rowId === higherPaid.rowId,
  }));
  const visualization: EvidenceVisualization = isGtm
    ? {
        kind: "level_order",
        groups: ["AE1", "AE2"].map((levelLabel) => ({
          levelLabel,
          employees: rows
            .filter((row) => row.levelLabel === levelLabel)
            .map((row) => ({
              employeeLabel: labels.get(row.rowId)!,
              salary: formatManwon(row.baseSalaryKRW),
              salaryKRW: row.baseSalaryKRW,
              highlighted: row.rowId === lowerPaid.rowId || row.rowId === higherPaid.rowId,
            })),
        })),
        metrics: [
          {
            label: FOUNDER_COPY["screen.evidence.gtm.metric.headline"],
            amount: formatManwon(headlineGapKRW),
          },
          {
            label: FOUNDER_COPY["screen.evidence.gtm.metric.pair"],
            amount: formatManwon(selectedTheme.metrics.pairRepairFloorKRW ?? 0),
          },
          {
            label: FOUNDER_COPY["screen.evidence.gtm.metric.system"],
            amount: formatManwon(selectedTheme.metrics.systemRepairFloorKRW ?? 0),
          },
        ],
        nonClaim: FOUNDER_COPY["screen.evidence.gtm.non_claim"],
      }
    : {
        kind: "career",
        distribution,
        kicker: formatRoleDistributionKicker({
          roleGroup: selectedTheme.roleGroup,
          employeeCount,
        }),
        heading: formatRoleDistributionHeading({
          roleGroup: selectedTheme.roleGroup,
          employeeCount,
        }),
      };
  const supportingCopy = isGtm
    ? FOUNDER_COPY["screen.evidence.gtm.supporting"]
    : FOUNDER_COPY["screen.evidence.platform.supporting"];
  const reviewFocus = isGtm
    ? FOUNDER_COPY["screen.evidence.gtm.review_focus"]
    : FOUNDER_COPY["screen.evidence.platform.review_focus"];
  const explanationQuestion = isGtm
    ? FOUNDER_COPY["screen.evidence.gtm.explanation_question"]
    : FOUNDER_COPY["screen.evidence.platform.explanation_question"];
  const metrics = isGtm && visualization.kind === "level_order" ? visualization.metrics : [];
  const ruleVariant = isGtm
    ? {
        kind: "level_order" as const,
        heading: FOUNDER_COPY["screen.rule.gtm.variant_heading"],
        metrics,
        nonClaim: FOUNDER_COPY["screen.evidence.gtm.non_claim"],
      }
    : {
        kind: "pending" as const,
        heading: FOUNDER_COPY["screen.rule.pending.heading"],
        missing: ruleConditionLabels(),
      };
  const pending = FOUNDER_COPY["state.review_pending"];

  return {
    ...template,
    evidence: {
      ...template.evidence,
      heading: FOUNDER_COPY["screen.evidence.heading"],
      conclusion: evidenceConclusion,
      supportingCopy,
      actionPrompt: reviewFocus,
      distributionKicker: formatRoleDistributionKicker({
        roleGroup: selectedTheme.roleGroup,
        employeeCount,
      }),
      distributionHeading: formatRoleDistributionHeading({
        roleGroup: selectedTheme.roleGroup,
        employeeCount,
      }),
      distribution,
      visualization,
      highlightedPair: {
        lowerPaidLabel,
        higherPaidLabel,
        lowerPaidSalary: formatManwon(lowerPaid.baseSalaryKRW),
        higherPaidSalary: formatManwon(higherPaid.baseSalaryKRW),
        difference: formatManwon(headlineGapKRW),
        lowerPaidRelevantExperience: formatRelevantExperience(lowerPaid.relevantExperienceMonths),
        higherPaidRelevantExperience: formatRelevantExperience(higherPaid.relevantExperienceMonths),
        lowerPaidTenure: formatTenure(lowerPaid.tenureMonths),
        higherPaidTenure: formatTenure(higherPaid.tenureMonths),
        lowerPaidException: formatExceptionRecord(lowerPaid),
        higherPaidException: formatExceptionRecord(higherPaid),
      },
      supportingObservationsHeading: isGtm
        ? FOUNDER_COPY["screen.evidence.gtm.observations_heading"]
        : formatRoleObservationsHeading({
            roleGroup: selectedTheme.roleGroup,
            employeeCount,
          }),
      supportingObservations: (isGtm
        ? [
            FOUNDER_COPY["screen.evidence.gtm.observation"],
          ]
        : [
            FOUNDER_COPY["screen.evidence.platform.observation.long"],
            FOUNDER_COPY["screen.evidence.platform.observation.short"],
          ]).slice(0, 2),
      explanationQuestion,
      selectedExplanation: review?.explanationBasis ?? "unanswered",
      evidenceQuestion: review?.explanationBasis && review.explanationBasis !== "unanswered"
        ? FOUNDER_COPY["screen.evidence.remaining.evidence_question"]
        : undefined,
      selectedEvidence: review?.evidenceStatus ?? "unanswered",
      evidenceRows: [lowerPaid, higherPaid].map((row) => ({
        employeeLabel: labels.get(row.rowId)!,
        role: row.roleGroup,
        level: showLevelEvidence ? row.levelLabel : undefined,
        relevantExperience: formatRelevantExperience(row.relevantExperienceMonths),
        relevantExperienceMonths: row.relevantExperienceMonths,
        tenure: formatTenure(row.tenureMonths),
        tenureMonths: row.tenureMonths,
        salary: formatManwon(row.baseSalaryKRW),
        documentedException: formatExceptionRecord(row),
      })),
      primaryAction: FOUNDER_COPY["action.repeat_practice"],
    },
    rule: {
      ...template.rule,
      conclusion: isGtm
        ? FOUNDER_COPY["screen.rule.gtm.conclusion"]
        : FOUNDER_COPY["screen.rule.pending.heading"],
      selectedExplanation: review?.explanationBasis && review.explanationBasis !== "unanswered"
        ? explanationLabels[review.explanationBasis]
        : pending,
      selectedEvidence: review?.evidenceStatus && review.evidenceStatus !== "unanswered"
        ? evidenceLabels[review.evidenceStatus]
        : pending,
      observedRepeat: {
        heading: isGtm
          ? FOUNDER_COPY["screen.rule.gtm.observed_heading"]
          : FOUNDER_COPY["screen.rule.pending.observed_heading"],
        nextHireSalary: pending,
        affectedEmployees: pending,
        maximumDifference: pending,
        comparisonCount: pending,
        nonClaim: isGtm
          ? FOUNDER_COPY["screen.evidence.gtm.non_claim"]
          : FOUNDER_COPY["state.repeat_insufficient"],
      },
      ruleConditions: createPendingRuleConditions(selectedTheme.roleGroup),
      decision: {
        heading: decision ? actionLabels[decision.actionKey] : FOUNDER_COPY["state.company_action_pending"],
        companyAction: decision ? actionLabels[decision.actionKey] : pending,
        owner: decision ? ownerLabels[decision.ownerRole] : pending,
        due: decision ? dueLabels[decision.dueEvent] : pending,
      },
      variant: ruleVariant,
    },
    result: {
      ...template.result,
      conclusion: FOUNDER_COPY["screen.result.multi.conclusion"],
      summary: FOUNDER_COPY["screen.result.multi.summary"],
    },
  };
}

function createResultRows(state: DecisionRoomSessionState) {
  const pending = FOUNDER_COPY["state.review_pending"];
  return state.selection.selected.map((theme) => {
    const review = state.reviews[theme.id];
    const decision = state.decisions.find((item) => item.themeIds.includes(theme.id));
    return {
      roleGroup: theme.roleGroup,
      confirmed: observedResultStatement(state, theme.roleGroup),
      founderExplanation: review?.explanationBasis && review.explanationBasis !== "unanswered"
        ? explanationLabels[review.explanationBasis]
        : pending,
      evidence: review?.evidenceStatus && review.evidenceStatus !== "unanswered"
        ? evidenceLabels[review.evidenceStatus]
        : pending,
      decision: decision ? actionLabels[decision.actionKey] : pending,
      owner: decision ? ownerLabels[decision.ownerRole] : pending,
      due: decision ? dueLabels[decision.dueEvent] : pending,
    };
  });
}

function createPendingNextActions(state: DecisionRoomSessionState) {
  return state.selection.selected.flatMap((theme) => {
    const review = state.reviews[theme.id];
    const decision = state.decisions.find((item) => item.themeIds.includes(theme.id));
    const complete = review?.explanationBasis && review.explanationBasis !== "unanswered"
      && review.evidenceStatus && review.evidenceStatus !== "unanswered"
      && decision;
    if (complete) return [];
    const action = theme.roleGroup === "Product Engineer"
      ? FOUNDER_COPY["action.next.product"]
      : theme.roleGroup === "Platform Engineer"
        ? FOUNDER_COPY["action.next.platform"]
        : FOUNDER_COPY["action.next.gtm"];
    return [{ period: FOUNDER_COPY["state.next_check_period"], action }];
  });
}

function observedResultStatement(state: DecisionRoomSessionState, roleGroup: string): string {
  if (roleGroup === "Product Engineer") {
    return state.mode === "demo"
      ? FOUNDER_COPY["interpretation.product_engineer.salary_observation"]
      : formatCurrentInputObservation("Product Engineer");
  }
  if (roleGroup === "Platform Engineer") {
    return FOUNDER_COPY["interpretation.platform_engineer.salary_observation"];
  }
  if (roleGroup === "GTM") return FOUNDER_COPY["interpretation.gtm.level_order_observation"];
  return `${roleGroup}에서 확인된 기본 연봉 비교입니다.`;
}

function createPendingRuleConditions(roleGroup: string) {
  const pending = FOUNDER_COPY["state.rule_not_approved"];
  return ruleConditionLabels().map((label) => ({
    label,
    observedContext: formatPendingRuleContext(roleGroup, label),
    approvalStatus: pending,
  }));
}

function ruleConditionLabels(): string[] {
  return [
    FOUNDER_COPY["screen.rule.condition.target"],
    FOUNDER_COPY["screen.rule.condition.amount_range"],
    FOUNDER_COPY["screen.rule.condition.approver"],
    FOUNDER_COPY["screen.rule.condition.review_time"],
  ];
}

function requiredRelevantExperience(row: NormalizedRosterRow): number {
  if (row.relevantExperienceMonths === undefined) {
    throw new Error("ACTIVE_HEADLINE_RELEVANT_EXPERIENCE_REQUIRED");
  }
  return row.relevantExperienceMonths;
}

function requiredTenure(row: NormalizedRosterRow): number {
  if (row.tenureMonths === undefined) throw new Error("ACTIVE_HEADLINE_TENURE_REQUIRED");
  return row.tenureMonths;
}


function createRuleConditions(repeatAdditionalPayKRW: number | undefined) {
  const hasRepeat = repeatAdditionalPayKRW !== undefined;
  const pending = "아직 승인하지 않았습니다.";
  return [
    {
      label: "적용 대상",
      observedContext: hasRepeat
        ? "현재 사례는 Product Engineer 채용에서 확인됐지만, 앞으로 누구에게 적용할지는 승인하지 않았습니다."
        : "설명이 변경되어 앞으로 누구에게 적용할지 다시 확인해야 합니다.",
      approvalStatus: pending,
    },
    {
      label: "금액 또는 범위",
      observedContext: hasRepeat
        ? `현재 사례에서 ${formatManwon(repeatAdditionalPayKRW!)}이 추가됐지만, 앞으로 사용할 금액 또는 범위로 승인하지 않았습니다.`
        : "설명이 변경되어 앞으로 검토할 금액 또는 범위를 다시 확인해야 합니다.",
      approvalStatus: pending,
    },
    {
      label: "승인자",
      observedContext: "현재 기록에는 앞으로 이 추가 보상을 승인할 담당자가 정해져 있지 않습니다.",
      approvalStatus: pending,
    },
    {
      label: "재검토 시점",
      observedContext: "현재 기록에는 이 기준을 다시 확인하거나 종료할 시점이 정해져 있지 않습니다.",
      approvalStatus: pending,
    },
  ];
}

function requiredRow(rows: NormalizedRosterRow[], rowId: string): NormalizedRosterRow {
  const row = rows.find((item) => item.rowId === rowId);
  if (!row) throw new Error("COMPARISON_EMPLOYEE_REQUIRED");
  return row;
}

function formatManwon(amountKRW: number): string {
  return `${(amountKRW / 10_000).toLocaleString("ko-KR")}만원`;
}

function formatTenure(tenureMonths: number | undefined): string {
  if (tenureMonths === undefined) return "회사 근속 확인 필요";
  return `회사 근속 ${tenureMonths}개월`;
}

function formatExceptionRecord(row: NormalizedRosterRow): string {
  return row.exceptionFlag ? "채용 예외 기록 있음" : "별도 채용 예외 기록 없음";
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
