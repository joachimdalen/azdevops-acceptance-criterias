import { WebApiTeam } from 'azure-devops-extension-api/Core';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import React, { createContext, Dispatch, useContext, useReducer } from 'react';

export interface IWorkHubContextState {
  isLoading: boolean;
  isValid: boolean;
  teams: WebApiTeam[];
  workItemTypes: WorkItemType[];
}

export interface ReducerAction {
  type: ContextAction;
  data?: any;
}

const defaultState: IWorkHubContextState = {
  isLoading: true,
  isValid: false,
  teams: [],
  workItemTypes: []
};

export interface IWorkHubContext {
  state: IWorkHubContextState;
  dispatch: Dispatch<ReducerAction>;
}

const WorkHubContext = createContext<IWorkHubContext>({} as any);

export type ContextAction = 'INIT' | 'SET_TEAMS' | 'SET_WI_TYPES';
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
