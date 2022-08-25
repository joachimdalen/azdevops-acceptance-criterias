import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import React, { createContext, Dispatch, useContext, useReducer } from 'react';

export interface ICriteriaTemplateContextState {
  name: string;
  description?: string;
}

export interface ReducerAction {
  type: ContextAction;
  data?: any;
}

const intDefaultState: ICriteriaTemplateContextState = {
  name: ''
};

export interface ICriteriaTemplateContext {
  state: ICriteriaTemplateContextState;
  dispatch: Dispatch<ReducerAction>;
}

const CriteriaTemplateContext = createContext<ICriteriaTemplateContext>({} as any);

export type ContextAction = 'INIT' | 'SET_NAME' | 'SET_DESCRIPTION';
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

    case 'SET_NAME': {
      return { ...state, name: action.data };
    }
    case 'SET_DESCRIPTION': {
      return { ...state, description: action.data };
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
