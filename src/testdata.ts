import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';

import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  CriteriaDocument,
  FullCriteriaStatus
} from './common/types';

export const getApprover = (): IInternalIdentity => {
  return {
    displayName: 'Project User',
    entityId: 'project-user',
    entityType: 'User',
    id: 'project-user-1234',
    descriptor: 'project-user@1234'
  };
};

export const getTextCriteria = (
  workItemId: string,
  workItemStatus: FullCriteriaStatus,
  criteriaStatus: AcceptanceCriteriaState,
  criteriaId: string,
  approver?: IInternalIdentity
): { criteria: CriteriaDocument; details: CriteriaDetailDocument } => {
  const criteria: CriteriaDocument = {
    id: workItemId,
    counter: 1,
    state: workItemStatus,
    criterias: [
      {
        id: `AC-${workItemId}-${criteriaId}`,
        state: criteriaStatus,
        title: 'This is a criteria',
        type: 'text',
        order: 0,
        requiredApprover: approver
      }
    ]
  };

  const details: CriteriaDetailDocument = {
    id: `AC-${workItemId}-${criteriaId}`,
    text: {
      id: '1',
      description: 'This is the content'
    }
  };

  return { criteria, details };
};
