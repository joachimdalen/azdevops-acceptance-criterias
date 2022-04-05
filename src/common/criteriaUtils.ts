import { AcceptanceCriteriaState, CriteriaDetailDocument, IAcceptanceCriteria } from './types';

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
