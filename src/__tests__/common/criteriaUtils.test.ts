import { chunk } from '../../common/chunkUtil';
import { isCompleted, isProcessed } from '../../common/criteriaUtils';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  IAcceptanceCriteria
} from '../../common/types';

describe('criteriaUtils', () => {
  describe('isProcessed', () => {
    it('should return true when processed', () => {
      const crit: IAcceptanceCriteria = {
        id: '',
        state: AcceptanceCriteriaState.Approved,
        title: 'Title',
        type: 'checklist'
      };
      const details: CriteriaDetailDocument = {
        id: '',
        processed: {
          processedBy: {
            displayName: '',
            entityId: '',
            entityType: 'Custom',
            id: '1'
          }
        }
      };

      expect(isProcessed(crit, details)).toBeTruthy();
    });
    it('should return false when missing details', () => {
      const crit: IAcceptanceCriteria = {
        id: '',
        state: AcceptanceCriteriaState.Approved,
        title: 'Title',
        type: 'checklist'
      };

      expect(isProcessed(crit)).toBeFalsy();
    });
  });
  describe('isCompleted', () => {
    it('should return true when completed', () => {
      const crit: IAcceptanceCriteria = {
        id: '',
        state: AcceptanceCriteriaState.Approved,
        title: 'Title',
        type: 'checklist'
      };
      expect(isCompleted(crit)).toBeTruthy();
    });
    it('should return false when completed', () => {
      const crit: IAcceptanceCriteria = {
        id: '',
        state: AcceptanceCriteriaState.New,
        title: 'Title',
        type: 'checklist'
      };
      expect(isCompleted(crit)).toBeFalsy();
    });
  });
});
