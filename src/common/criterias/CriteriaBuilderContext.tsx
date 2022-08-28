import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import React, { createContext, Dispatch, useContext, useReducer } from 'react';

import { CriteriaTypes, ICheckList, IScenario, ITextCriteria } from '../types';

export interface ICriteriaBuilderContextState {
  title: string;
  approver?: IInternalIdentity;
  type: CriteriaTypes;
  scenario?: IScenario;
  text?: ITextCriteria;
  checklist?: ICheckList;
  workItems?: number[];
  workItemTypes?: WorkItemType[];
}

export interface ReducerAction {
  type: ContextAction;
  data?: any;
}

const intDefaultState: ICriteriaBuilderContextState = {
  type: 'scenario',
  title: ''
};

export interface ICriteriaBuilderContext {
  state: ICriteriaBuilderContextState;
  dispatch: Dispatch<ReducerAction>;
}

const CriteriaBuilderContext = createContext<ICriteriaBuilderContext>({} as any);

export type ContextAction =
  | 'INIT'
  | 'SET_CRITERIA'
  | 'SET_TYPE'
  | 'SET_TITLE'
  | 'SET_APPROVER'
  | 'SET_WORKITEMS'
  | 'SET_WORKITEM_TYPES';
type CriteriaBuilderProviderProps = {
  children: React.ReactNode;
  defaultState?: ICriteriaBuilderContextState;
};
function panelReducer(
  state: ICriteriaBuilderContextState,
  action: ReducerAction
): ICriteriaBuilderContextState {
  switch (action.type) {
    case 'INIT': {
      return { ...state };
    }
    case 'SET_TYPE': {
      return { ...state, type: action.data };
    }
    case 'SET_TITLE': {
      return { ...state, title: action.data };
    }
    case 'SET_APPROVER': {
      return { ...state, approver: action.data };
    }
    case 'SET_WORKITEMS': {
      return { ...state, workItems: action.data };
    }
    case 'SET_WORKITEM_TYPES': {
      return { ...state, workItemTypes: action.data };
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
function CriteriaBuilderProvider({
  children,
  defaultState
}: CriteriaBuilderProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(panelReducer, defaultState || intDefaultState);

  const value: ICriteriaBuilderContext = { state, dispatch };
  return (
    <CriteriaBuilderContext.Provider value={value}>{children}</CriteriaBuilderContext.Provider>
  );
}

function useCriteriaBuilderContext(): ICriteriaBuilderContext {
  const context = useContext(CriteriaBuilderContext);
  if (context === undefined) {
    throw new Error('useCriteriaBuilderContext must be used within a CriteriaBuilderProvider');
  }
  return context;
}
export { CriteriaBuilderProvider, useCriteriaBuilderContext };
