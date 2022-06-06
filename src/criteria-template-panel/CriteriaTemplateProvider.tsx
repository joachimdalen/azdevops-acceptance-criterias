import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import React, { createContext, Dispatch, useContext, useReducer } from 'react';

export interface ICriteriaTemplateContextState {
  title?: string;
  name?: string;
  description?: string;
  approver?: IInternalIdentity;
}

export interface ReducerAction {
  type: ContextAction;
  data?: any;
}

const intDefaultState: ICriteriaTemplateContextState = {};

export interface ICriteriaTemplateContext {
  state: ICriteriaTemplateContextState;
  dispatch: Dispatch<ReducerAction>;
}

const CriteriaTemplateContext = createContext<ICriteriaTemplateContext>({} as any);

export type ContextAction = 'INIT' | 'SET_TITLE' | 'SET_NAME' | 'SET_DESCRIPTION' | 'SET_APPROVER';
type CriteriaTemplateProviderProps = {
  children: React.ReactNode;
  defaultState?: ICriteriaTemplateContextState;
};
function panelReducer(
  state: ICriteriaTemplateContextState,
  action: ReducerAction
): ICriteriaTemplateContextState {
  switch (action.type) {
    case 'INIT': {
      return { ...state };
    }
    case 'SET_TITLE': {
      return { ...state, title: action.data };
    }
    case 'SET_NAME': {
      return { ...state, name: action.data };
    }
    case 'SET_DESCRIPTION': {
      return { ...state, description: action.data };
    }
    case 'SET_APPROVER': {
      return { ...state, approver: action.data };
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
function CriteriaTemplateProvider({
  children,
  defaultState
}: CriteriaTemplateProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(panelReducer, defaultState || intDefaultState);

  const value: ICriteriaTemplateContext = { state, dispatch };
  return (
    <CriteriaTemplateContext.Provider value={value}>{children}</CriteriaTemplateContext.Provider>
  );
}

function useCriteriaTemplateContext(): ICriteriaTemplateContext {
  const context = useContext(CriteriaTemplateContext);
  if (context === undefined) {
    throw new Error('useCriteriaTemplateContext must be used within a CriteriaTemplateProvider');
  }
  return context;
}
export { CriteriaTemplateProvider, useCriteriaTemplateContext };
