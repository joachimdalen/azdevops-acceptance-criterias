import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { ISimpleTableCell } from 'azure-devops-ui/Table';

import { CriteriaModalResult } from './common';
import { ProgressBarLabelType } from './components/ProgressBar';

export interface CriteriaDocument {
  // work item id
  id: string;
  criterias: IAcceptanceCriteria[];
  state: FullCriteriaStatus;
  readonly __etag?: number;
  counter: number;
}
export interface IAcceptanceCriteria {
  id: string;
  order?: number;
  requiredApprover?: IInternalIdentity;
  state: AcceptanceCriteriaState;
  type: CriteriaTypes;
  title: string;
}

export type CriteriaTypes = 'scenario' | 'text' | 'checklist';

export interface CriteriaDetailDocument {
  id: string;
  processed?: IAcceptanceCriteriaProcess;
  scenario?: IScenario;
  text?: ITextCriteria;
  checklist?: ICheckList;
  readonly __etag?: number;
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

export interface ITextCriteria {
  id: string;
  description?: string;
}

export interface IScenario {
  scenario: string;
  criterias: IScenarioCriteria[];
}
export interface ICheckList {
  criterias: ICheckListCriteria[];
}
export interface ICheckListCriteria {
  id: string;
  completed: boolean;
  text: string;
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

export interface CriteriaPanelConfig {
  workItemId?: string;
  criteria?: IAcceptanceCriteria;
  isReadOnly?: boolean;
  isNew?: boolean;
  canEdit?: boolean;
  onClose?: (result: CriteriaModalResult | undefined) => Promise<void>;
}
