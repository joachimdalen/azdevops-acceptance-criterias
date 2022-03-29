import CriteriaService from '../../../common/services/CriteriaService';
import {
  AcceptanceCriteriaState,
  CriteriaDocument,
  FullCriteriaStatus
} from '../../../common/types';

describe('CriteriaService', () => {
  describe('setFullState', () => {
    it('should be new when all is new', () => {
      const service = new CriteriaService();
      const document: CriteriaDocument = {
        id: '1',
        state: FullCriteriaStatus.New,
        criterias: [
          {
            id: '12',
            state: AcceptanceCriteriaState.New,
            type: 'custom',
            title: 'Test criteria'
          }
        ],
        counter: 1
      };
      const result = service.setFullState(document);
      expect(result.state).toEqual(FullCriteriaStatus.New);
    });
    it('should be partial when mixex', () => {
      const service = new CriteriaService();
      const document: CriteriaDocument = {
        id: '1',
        state: FullCriteriaStatus.New,
        criterias: [
          {
            id: '12',
            state: AcceptanceCriteriaState.New,
            type: 'custom',
            title: 'Test criteria'
          },
          {
            id: '12',
            state: AcceptanceCriteriaState.Completed,
            type: 'custom',
            title: 'Test criteria'
          }
        ],
        counter: 1
      };
      const result = service.setFullState(document);
      expect(result.state).toEqual(FullCriteriaStatus.Partial);
    });
    it('should be completed when all is completed', () => {
      const service = new CriteriaService();
      const document: CriteriaDocument = {
        id: '1',
        state: FullCriteriaStatus.New,
        criterias: [
          {
            id: '12',
            state: AcceptanceCriteriaState.Completed,
            type: 'custom',
            title: 'Test criteria'
          },
          {
            id: '12',
            state: AcceptanceCriteriaState.Completed,
            type: 'custom',
            title: 'Test criteria'
          }
        ],
        counter: 1
      };
      const result = service.setFullState(document);
      expect(result.state).toEqual(FullCriteriaStatus.Completed);
    });
    it('should be approved when all is approved', () => {
      const service = new CriteriaService();
      const document: CriteriaDocument = {
        id: '1',
        state: FullCriteriaStatus.New,
        criterias: [
          {
            id: '12',
            state: AcceptanceCriteriaState.Approved,
            type: 'custom',
            title: 'Test criteria'
          },
          {
            id: '12',
            state: AcceptanceCriteriaState.Approved,
            type: 'custom',
            title: 'Test criteria'
          }
        ],
        counter: 1
      };
      const result = service.setFullState(document);
      expect(result.state).toEqual(FullCriteriaStatus.Approved);
    });
    it('should be rejected when all is rejected', () => {
      const service = new CriteriaService();
      const document: CriteriaDocument = {
        id: '1',
        state: FullCriteriaStatus.New,
        criterias: [
          {
            id: '12',
            state: AcceptanceCriteriaState.Rejected,
            type: 'custom',
            title: 'Test criteria'
          },
          {
            id: '12',
            state: AcceptanceCriteriaState.Rejected,
            type: 'custom',
            title: 'Test criteria'
          }
        ],
        counter: 1
      };
      const result = service.setFullState(document);
      expect(result.state).toEqual(FullCriteriaStatus.Rejected);
    });
    it('should be partial when all is awaitingapproval', () => {
      const service = new CriteriaService();
      const document: CriteriaDocument = {
        id: '1',
        state: FullCriteriaStatus.New,
        criterias: [
          {
            id: '12',
            state: AcceptanceCriteriaState.AwaitingApproval,
            type: 'custom',
            title: 'Test criteria'
          },
          {
            id: '12',
            state: AcceptanceCriteriaState.AwaitingApproval,
            type: 'custom',
            title: 'Test criteria'
          }
        ],
        counter: 1
      };
      const result = service.setFullState(document);
      expect(result.state).toEqual(FullCriteriaStatus.Partial);
    });
  });
});
