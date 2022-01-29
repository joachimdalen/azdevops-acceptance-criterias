import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core';

export interface CriteriaDocument {
  // work item id
  id: string;
  criterias: IAcceptanceCriteria[];
  state: FullCriteriaStatus;
}
export interface IAcceptanceCriteria {
  id: string;
  order?: number;
  requiredApprover?: IInternalIdentity;
  state: AcceptanceCriteriaState;
  type: 'scenario' | 'rule' | 'custom';
  scenario?: IScenario;
  rule?: IRuleCriteria;
  custom?: ICustomCriteria;
  approval?: IAcceptanceCriteriaApproval;
}

export interface IAcceptanceCriteriaApproval {
  approvedBy?: IInternalIdentity;
  approvedAt?: Date;
  completedAt?: Date;
}

export enum FullCriteriaStatus {
  New = 'new',
  Partial = 'partial',
  Completed = 'completed',
  Approved = 'approved',
  Rejected = 'rejected'
}

export enum AcceptanceCriteriaState {
  New = 'new',
  Completed = 'completed',
  AwaitingApproval = 'awaitingapproval',
  Approved = 'approved',
  Rejected = 'rejected'
}

export interface ICriteria {
  id: string;
  type: 'scenario' | 'rule' | 'custom';
  scenario: IScenarioCriteria[];
  rule: any[];
  custom: any[];
}
export interface ICustomCriteria {
  id: string;
  text: string;
}
export interface IRuleCriteria {
  id: string;
  text: string;
}

export interface IScenario {
  scenario: string;
  criterias: IScenarioCriteria[];
}
export interface IScenarioCriteria {
  id: string;
  type: 'given' | 'and' | 'when' | 'then';
  text?: string;
}
export interface WorkItemTypeTagProps {
  iconUrl?: string;
  iconSize?: number;
  type?: string;
  classNames?: string;
}
