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

export interface CriteriaTemplateDocument {
  id: string;
  type: CriteriaTypes;
  name: string;
  title: string;
  description?: string;
  approver?: IInternalIdentity;
  scenario?: IScenario;
  text?: ITextCriteria;
  checklist?: ICheckList;
  createdBy: IInternalIdentity;
  updatedBy?: IInternalIdentity;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CriteriaTemplateSettings {
  requireApprover: boolean;
  allowChanges: boolean;
}

export type CriteriaTypes = 'scenario' | 'text' | 'checklist';

export interface CriteriaIconMapping {
  iconName: string;
  color: string;
}

export const criteriaIcons: Map<CriteriaTypes, CriteriaIconMapping> = new Map<
  CriteriaTypes,
  CriteriaIconMapping
>([
  ['text', { iconName: 'icon_sticky_note', color: 'e6df5a' }],
  ['checklist', { iconName: 'icon_check_box', color: '49b84b' }],
  ['scenario', { iconName: 'icon_chat_bubble', color: '735ae6' }]
]);

export interface CriteriaDetailDocument {
  id: string;
  latestComment?: string;
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

export interface ContribPanel<T> {
  panel: {
    close: (data: T) => Promise<void>;
  };
}
export interface CriteriaPanelConfig {
  workItemId?: string;
  criteriaId?: string;
  mode: CriteriaPanelMode;
  onClose?: (result: CriteriaModalResult | undefined) => Promise<void>;
}
export interface LoadedCriteriaPanelConfig
  extends CriteriaPanelConfig,
    ContribPanel<CriteriaModalResult | undefined> {}

export interface GlobalSettingsDocument {
  readonly id: string;
  readonly __etag?: number;
  limitAllowedCriteriaTypes: boolean;
  allowedCriteriaTypes: CriteriaTypes[];
  requireApprovers: boolean;
}
export interface HistoryDocument {
  readonly id: string;
  readonly __etag?: number;
  items: HistoryItem[];
}

export enum ProcessEvent {
  Approve = 'approve',
  Reject = 'reject',
  Complete = 'complete',
  ResetToNew = 'reset-to-new',
  ResubmitForApproval = 'resubmit-for-approval'
}

export enum HistoryEvent {
  Completed = 'completed',
  ReOpened = 'reopened',
  Approved = 'approved',
  Rejected = 'rejected',
  ReApprove = 'reapprove'
}

export interface HistoryItem {
  event: HistoryEvent;
  actor?: IInternalIdentity;
  date: Date;
  properties?: { [key: string]: string };
}

export interface EventProperties {
  icon: string;
  iconColor?: string;
  title: string;
}
export const historyEventProperties: Map<HistoryEvent, EventProperties> = new Map<
  HistoryEvent,
  EventProperties
>([
  [
    HistoryEvent.Completed,
    { icon: 'SkypeCircleCheck', iconColor: 'text-blue', title: 'Completed criteria' }
  ],
  [
    HistoryEvent.ReOpened,
    { icon: 'CirclePlus', iconColor: 'text-blue', title: 'Reset back to new' }
  ],
  [
    HistoryEvent.Approved,
    { icon: 'CheckMark', iconColor: 'text-green', title: 'Approved criteria' }
  ],
  [
    HistoryEvent.ReApprove,
    { icon: 'Refresh', iconColor: 'text-orange', title: 'Sent to re approval' }
  ],
  [
    HistoryEvent.Rejected,
    { icon: 'StatusErrorFull', iconColor: 'text-red', title: 'Rejected criteria' }
  ]
]);
export enum CriteriaPanelMode {
  New = 'new',
  NewFromTemplate = 'new-from-template',
  Edit = 'edit',
  View = 'view',
  ViewWithEdit = 'view-with-edit'
}

export const isViewMode = (mode: CriteriaPanelMode): boolean =>
  mode === CriteriaPanelMode.View || mode === CriteriaPanelMode.ViewWithEdit;
