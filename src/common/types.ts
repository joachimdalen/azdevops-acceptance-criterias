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
}
export enum FullCriteriaStatus {
  Partial = 'partial',
  Approved = 'approved',
  Rejected = 'rejected'
}

export enum AcceptanceCriteriaState {
  Unset = 'unset',
  Approved = 'approved',
  Pending = 'pending',
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
}
export interface IRuleCriteria {
  id: string;
  title: string;
  checked: boolean;
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

export interface IInternalIdentity {
  entityId: string;
  image?: string;
  displayName: string;
}
