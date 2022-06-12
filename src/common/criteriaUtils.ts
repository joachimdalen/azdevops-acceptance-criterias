import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  CriteriaTypes,
  IAcceptanceCriteria,
  ICheckList,
  IHasCriterias,
  IScenario,
  ITextCriteria
} from './types';

export const isProcessed = (
  criteria: IAcceptanceCriteria,
  details?: CriteriaDetailDocument
): boolean => {
  return (
    (criteria.state === AcceptanceCriteriaState.Approved ||
      criteria.state === AcceptanceCriteriaState.Rejected) &&
    details?.processed?.processedBy !== undefined
  );
};
export const isCompleted = (criteria: IAcceptanceCriteria): boolean => {
  return (
    criteria.state === AcceptanceCriteriaState.Approved ||
    criteria.state === AcceptanceCriteriaState.Rejected ||
    criteria.state === AcceptanceCriteriaState.Completed
  );
};

export const getWorkItemIdFromCriteriaId = (id: string): string | undefined => {
  const parts = id.split('-');
  if (parts.length !== 3) return undefined;
  return parts[1];
};

export const getCriteriaDetails = (
  type: CriteriaTypes,
  doc: IHasCriterias
): ITextCriteria | IScenario | ICheckList | undefined => {
  switch (type) {
    case 'text':
      return doc?.text;
    case 'scenario':
      return doc?.scenario;
    case 'checklist':
      return doc?.checklist;
  }
};
