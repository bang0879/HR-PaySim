import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  createEmptyDecisionRoomSession,
  decisionRoomReducer,
  initializeDecisionRoomSession,
} from "../lib/hr-paysim/session/decisionRoomReducer.ts";
import type {
  DecisionRoomAction,
  DecisionRoomSessionState,
} from "../lib/hr-paysim/session/types.ts";

interface PaySimSessionContextValue {
  state: DecisionRoomSessionState;
  dispatch: Dispatch<DecisionRoomAction>;
}

const PaySimSessionContext = createContext<PaySimSessionContextValue | undefined>(undefined);

export function PaySimSessionProvider({
  initialState,
  children,
}: {
  initialState?: DecisionRoomSessionState;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    decisionRoomReducer,
    initialState ?? createEmptyDecisionRoomSession(),
    initializeDecisionRoomSession,
  );
  return (
    <PaySimSessionContext.Provider value={{ state, dispatch }}>
      {children}
    </PaySimSessionContext.Provider>
  );
}

export function usePaySimSession(): PaySimSessionContextValue {
  const context = useContext(PaySimSessionContext);
  if (!context) throw new Error("PAY_SIM_SESSION_PROVIDER_REQUIRED");
  return context;
}
