import { IIdentity } from 'azure-devops-ui/IdentityPicker';

export interface IAcceptanceCriteria {
  id: string;
  order: number;
  title: string;
  description?: string;
  area?: string;
  requiredApprover?: IIdentity;
  state?: AcceptanceCriteriaState;
}

export interface IWorkItemAcceptanceCriterias {
  criterias: IWorkItemAcceptanceCriteriasItem[];
}

export interface IWorkItemAcceptanceCriteriasItem {
  order: number;
  criteria: IAcceptanceCriteria;
}

export enum AcceptanceCriteriaState {
  Unset = 'unset',
  Approved = 'approved',
  Pending = 'pending',
  Rejected = 'rejected'
}
