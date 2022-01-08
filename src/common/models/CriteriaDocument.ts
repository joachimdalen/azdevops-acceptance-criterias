import { IAcceptanceCriteria } from './IAcceptanceCriteria';

export enum FullCriteriaStatus {
  Partial = 'partial',
  Approved = 'approved',
  Rejected = 'rejected'
}

export interface CriteriaDocument {
  id: string;
  workItemId: number;
  criterias: IAcceptanceCriteria[];
  state: FullCriteriaStatus;
  lastUpdated?: Date;
  created: Date;
}
