import { useEffect, useRef } from "react";
import { usePaySimSession } from "../../app/PaySimSessionProvider.tsx";
import { DECISION_ROOM_DEMO_CONTRACT } from "../../lib/hr-paysim/contracts/demoContract.ts";
import type { DecisionRoomScreen } from "../../lib/hr-paysim/session/types.ts";
import { CompanyRuleScreen } from "../company-rule/CompanyRuleScreen.tsx";
import { ConfirmedPayDifferencesScreen } from "../confirmed-pay-differences/ConfirmedPayDifferencesScreen.tsx";
import { SessionIntroductionScreen } from "../session-introduction/SessionIntroductionScreen.tsx";
import { SessionResultScreen } from "../session-result/SessionResultScreen.tsx";
import {
  createProductEngineerDecisionRoomViewModel,
  DECISION_ROOM_PROGRESS,
  getActiveSubjectId,
} from "./decisionRoomViewModel.ts";
import "./decisionRoom.css";

const nextScreen: Partial<Record<DecisionRoomScreen, DecisionRoomScreen>> = {
  introduction: "confirmed_pay_differences",
  confirmed_pay_differences: "company_rule",
  company_rule: "session_result",
};

export function DecisionRoomApp() {
  const { state, dispatch } = usePaySimSession();
  const conclusionRef = useRef<HTMLHeadingElement>(null);
  const currentSubjectId = getActiveSubjectId(state);

  useEffect(() => {
    conclusionRef.current?.focus();
  }, [state.screen, currentSubjectId]);

  if (state.rows.length === 0 || state.selection.selected.length === 0) {
    return (
      <main className="dr-ended" data-decision-room-ended="true">
        <p className="dr-eyebrow">HR PaySim</p>
        <h1 tabIndex={-1}>진단을 종료하고 입력 내용을 지웠습니다.</h1>
        <p>이 브라우저에는 직원 자료와 선택한 내용이 남아 있지 않습니다.</p>
      </main>
    );
  }

  const model = createProductEngineerDecisionRoomViewModel(state);
  const currentIndex = DECISION_ROOM_PROGRESS.findIndex((item) => item.id === state.screen);
  const goForward = () => {
    const target = nextScreen[state.screen];
    if (target) dispatch({ type: "GO_TO_SCREEN", screen: target });
  };

  return (
    <div className="dr-app" data-decision-room="true">
      <header className="dr-topbar">
        <div className="dr-brand">
          <span aria-hidden="true">HR</span>
          <div>
            <strong>HR PaySim</strong>
            <small>대표와 함께 확인하는 보상 의사결정</small>
          </div>
        </div>
        <span className="dr-sample-label">{DECISION_ROOM_DEMO_CONTRACT.sampleLabel}</span>
      </header>

      <nav className="dr-progress" aria-label="금번 진단 진행 단계">
        <ol>
          {DECISION_ROOM_PROGRESS.map((item, index) => {
            const isCurrent = item.id === state.screen;
            const isComplete = index < currentIndex;
            return (
              <li key={item.id} className={isCurrent ? "is-current" : isComplete ? "is-complete" : ""}>
                <span aria-hidden="true">{isComplete ? "✓" : index + 1}</span>
                <strong aria-current={isCurrent ? "step" : undefined}>{item.label}</strong>
              </li>
            );
          })}
        </ol>
      </nav>

      <main className="dr-workspace">
        {state.screen === "introduction" ? (
          <SessionIntroductionScreen
            model={model.introduction}
            headingRef={conclusionRef}
            onNext={goForward}
          />
        ) : null}
        {state.screen === "confirmed_pay_differences" ? (
          <ConfirmedPayDifferencesScreen
            model={model.evidence}
            headingRef={conclusionRef}
            subjectId={currentSubjectId!}
            dispatch={dispatch}
            onNext={goForward}
          />
        ) : null}
        {state.screen === "company_rule" ? (
          <CompanyRuleScreen
            model={model.rule}
            headingRef={conclusionRef}
            onNext={goForward}
          />
        ) : null}
        {state.screen === "session_result" ? (
          <SessionResultScreen
            model={model.result}
            headingRef={conclusionRef}
            onEnd={() => dispatch({ type: "END_SESSION" })}
          />
        ) : null}
      </main>
    </div>
  );
}
