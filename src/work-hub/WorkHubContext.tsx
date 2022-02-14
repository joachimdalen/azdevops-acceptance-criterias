import { WebApiTeam } from 'azure-devops-extension-api/Core';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import React, { createContext, Dispatch, useContext, useReducer } from 'react';

import { CriteriaDocument } from '../common/types';

export interface IWorkHubContextState {
  isLoading: boolean;
  isValid: boolean;
  teams: WebApiTeam[];
  workItemTypes: WorkItemType[];
  documents: CriteriaDocument[];
  visibleDocuments: CriteriaDocument[];
}

export interface ReducerAction {
  type: ContextAction;
  data?: any;
}

const defaultState: IWorkHubContextState = {
  isLoading: true,
  isValid: false,
  teams: [],
  workItemTypes: [],
  documents: [],
  visibleDocuments: []
};

export interface IWorkHubContext {
  state: IWorkHubContextState;
  dispatch: Dispatch<ReducerAction>;
}

const WorkHubContext = createContext<IWorkHubContext>({} as any);

export type ContextAction =
  | 'INIT'
  | 'SET_TEAMS'
  | 'SET_WI_TYPES'
  | 'SET_DOCUMENTS'
  | 'SET_VISIBLE_DOCUMENTS';
type WorkHubProviderProps = { children: React.ReactNode };
function hubReducer(state: IWorkHubContextState, action: ReducerAction): IWorkHubContextState {
  switch (action.type) {
    case 'INIT': {
      return { ...state };
    }
    case 'SET_TEAMS': {
      return { ...state, teams: action.data };
    }
    case 'SET_WI_TYPES': {
      return { ...state, workItemTypes: action.data };
    }
    case 'SET_DOCUMENTS': {
      return { ...state, documents: action.data };
    }
    case 'SET_VISIBLE_DOCUMENTS': {
      return { ...state, visibleDocuments: action.data };
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
function WorkHubProvider({ children }: WorkHubProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(hubReducer, defaultState);

  const value: IWorkHubContext = { state, dispatch };
  return <WorkHubContext.Provider value={value}>{children}</WorkHubContext.Provider>;
}

function useWorkHubContext(): IWorkHubContext {
  const context = useContext(WorkHubContext);
  if (context === undefined) {
    throw new Error('useWorkHubContext must be used within a WorkHubProvider');
  }
  return context;
}
export { WorkHubProvider, useWorkHubContext };
