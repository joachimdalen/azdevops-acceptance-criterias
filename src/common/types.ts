import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core';
import { ISimpleTableCell } from 'azure-devops-ui/Table';
import { ProgressBarLabelType } from './components/ProgressBar';

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
  type: 'scenario' | 'custom';
  scenario?: IScenario;
  custom?: ICustomCriteria;
  processed?: IAcceptanceCriteriaProcess;
}

export interface IAcceptanceCriteriaProcess {
  processedBy?: IInternalIdentity;
  processedAt?: Date;
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
  type: 'scenario' | 'custom';
  scenario: IScenarioCriteria[];
  custom: any[];
}
export interface ICustomCriteria {
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

export interface IDynamicProperties {
  [key: string]: any;
}
export type IExtendedTableCell = ISimpleTableCell & IDynamicProperties;
export interface IProgressStatus {
  value: number;
  maxValue: number;
  type: ProgressBarLabelType;
}
