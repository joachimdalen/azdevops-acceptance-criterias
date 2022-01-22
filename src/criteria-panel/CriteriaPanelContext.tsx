import React, { createContext, Dispatch, useContext, useReducer } from 'react';

import { IRuleCriteria, IScenario } from '../common/types';

export interface ICriteriaPanelContextState {
  isLoading: boolean;
  isValid: boolean;

  type: 'scenario' | 'rule' | 'custom';
  rule?: IRuleCriteria;
  scenario?: IScenario;
  custom?: any;
}

export interface ReducerAction {
  type: ContextAction;
  data?: any;
}

const defaultState: ICriteriaPanelContextState = {
  isLoading: true,
  isValid: false,
  type: 'scenario'
};

export interface ICriteriaPanelContext {
  state: ICriteriaPanelContextState;
  dispatch: Dispatch<ReducerAction>;
}

const CriteriaPanelContext = createContext<ICriteriaPanelContext>({} as any);

export type ContextAction = 'INIT' | 'SET_CRITERIA' | 'SET_TYPE' | 'SET_VALID';
type CriteriaPanelProviderProps = { children: React.ReactNode };
function panelReducer(
  state: ICriteriaPanelContextState,
  action: ReducerAction
): ICriteriaPanelContextState {
  switch (action.type) {
    case 'INIT': {
      return { ...state };
    }
    case 'SET_TYPE': {
      return { ...state, type: action.data };
    }
    case 'SET_VALID': {
      return { ...state, isValid: action.data };
    }
    case 'SET_CRITERIA': {
      switch (state.type) {
        case 'scenario':
          return { ...state, scenario: action.data };
        case 'rule':
          return { ...state, rule: action.data };
        case 'custom':
          return { ...state, custom: action.data };
        default:
          throw new Error(`Unhandled criteria type`);
      }
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
function CriteriaPanelProvider({ children }: CriteriaPanelProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(panelReducer, defaultState);

  const value: ICriteriaPanelContext = { state, dispatch };
  return <CriteriaPanelContext.Provider value={value}>{children}</CriteriaPanelContext.Provider>;
}

function useCriteriaPanelContext(): ICriteriaPanelContext {
  const context = useContext(CriteriaPanelContext);
  if (context === undefined) {
    throw new Error('useCriteriaPanelContext must be used within a CriteriaPanelProvider');
  }
  return context;
}
export { CriteriaPanelProvider, useCriteriaPanelContext };
