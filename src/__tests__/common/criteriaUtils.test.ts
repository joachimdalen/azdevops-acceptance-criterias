import { chunk } from '../../common/chunkUtil';
import { getWorkItemIdFromCriteriaId, isCompleted, isProcessed } from '../../common/criteriaUtils';
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
  describe('getWorkItemIdFromCriteriaId', () => {
    it('should return id when correct format', () => {
      expect(getWorkItemIdFromCriteriaId('AC-12345-123')).toEqual('12345');
    });
    it('should return undefined when wrong format', () => {
      expect(getWorkItemIdFromCriteriaId('AC-12345')).toBeUndefined();
    });
  });
});
