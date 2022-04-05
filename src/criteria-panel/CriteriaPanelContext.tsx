import React, { createContext, Dispatch, useContext, useReducer } from 'react';

import { CriteriaTypes, ICheckList, IScenario, ITextCriteria } from '../common/types';

export interface ICriteriaPanelContextState {
  isLoading: boolean;
  type: CriteriaTypes;
  scenario?: IScenario;
  text?: ITextCriteria;
  checklist?: ICheckList;
}

export interface ReducerAction {
  type: ContextAction;
  data?: any;
}

const defaultState: ICriteriaPanelContextState = {
  isLoading: true,
  type: 'scenario'
};

export interface ICriteriaPanelContext {
  state: ICriteriaPanelContextState;
  dispatch: Dispatch<ReducerAction>;
}

const CriteriaPanelContext = createContext<ICriteriaPanelContext>({} as any);

export type ContextAction = 'INIT' | 'SET_CRITERIA' | 'SET_TYPE';
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

    case 'SET_CRITERIA': {
      switch (state.type) {
        case 'scenario':
          return { ...state, scenario: action.data };
        case 'text':
          return { ...state, text: action.data };
        case 'checklist': {
          return { ...state, checklist: action.data };
        }
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
