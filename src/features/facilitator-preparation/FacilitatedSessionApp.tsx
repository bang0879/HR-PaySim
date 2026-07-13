import { useEffect, useState } from "react";
import { usePaySimSession } from "../../app/PaySimSessionProvider.tsx";
import type { ProductEngineerSessionDraft } from "../../lib/hr-paysim/preparation/types.ts";
import { DecisionRoomApp } from "../decision-room/DecisionRoomApp.tsx";
import { FacilitatorPreparationScreen } from "./FacilitatorPreparationScreen.tsx";

const PREPARATION_PATH = "/hr-paysim/session/new";
const SESSION_PATH = "/hr-paysim/session";

export function FacilitatedSessionApp() {
  const { state, dispatch } = usePaySimSession();
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const hasActiveSession = state.rows.length > 0 && state.selection.selected.length > 0;

  useEffect(() => {
    if (!hasActiveSession) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasActiveSession]);

  function replacePath(nextPath: string) {
    window.history.replaceState(null, "", nextPath);
    setPathname(nextPath);
  }

  function startSession(draft: ProductEngineerSessionDraft) {
    const ownedDraft = structuredClone(draft);
    dispatch({
      type: "START_SESSION",
      mode: "facilitated",
      rows: ownedDraft.rows,
      themes: ownedDraft.themes,
      selection: ownedDraft.selection,
      activeThemeId: ownedDraft.activeThemeId,
    });
    replacePath(SESSION_PATH);
  }

  function endSession() {
    replacePath(PREPARATION_PATH);
  }

  if (hasActiveSession) {
    return <DecisionRoomApp onSessionEnd={endSession} />;
  }

  if (pathname === SESSION_PATH) {
    return (
      <main className="fp-app fp-no-session" data-no-active-session="true">
        <section className="fp-panel">
          <p className="fp-eyebrow">HR PaySim · 비공개 진행자 준비</p>
          <h1>진행 중인 세션이 없습니다.</h1>
          <p>직원 자료는 URL이나 브라우저 저장소에 남기지 않습니다. 새 자료를 안전하게 확인해 주세요.</p>
          <button
            className="fp-primary"
            type="button"
            onClick={() => replacePath(PREPARATION_PATH)}
          >
            세션 준비로 이동
          </button>
        </section>
      </main>
    );
  }

  return <FacilitatorPreparationScreen onStart={startSession} />;
}
