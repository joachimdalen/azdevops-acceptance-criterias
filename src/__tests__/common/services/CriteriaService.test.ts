import { mockGetDevOpsProject } from '../../../__mocks__/@joachimdalen/azdevops-ext-core/DevOpsService';
import { mockGetDocument, mockGetProject } from '../../../__mocks__/azure-devops-extension-sdk';
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
            type: 'text',
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
            type: 'text',
            title: 'Test criteria'
          },
          {
            id: '12',
            state: AcceptanceCriteriaState.Completed,
            type: 'text',
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
            type: 'text',
            title: 'Test criteria'
          },
          {
            id: '12',
            state: AcceptanceCriteriaState.Completed,
            type: 'text',
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
            type: 'text',
            title: 'Test criteria'
          },
          {
            id: '12',
            state: AcceptanceCriteriaState.Approved,
            type: 'text',
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
            type: 'text',
            title: 'Test criteria'
          },
          {
            id: '12',
            state: AcceptanceCriteriaState.Rejected,
            type: 'text',
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
            type: 'text',
            title: 'Test criteria'
          },
          {
            id: '12',
            state: AcceptanceCriteriaState.AwaitingApproval,
            type: 'text',
            title: 'Test criteria'
          }
        ],
        counter: 1
      };
      const result = service.setFullState(document);
      expect(result.state).toEqual(FullCriteriaStatus.Partial);
    });
  });
  describe('load', () => {
    describe('singleItem', () => {
      beforeEach(() => {
        mockGetDevOpsProject.mockResolvedValue({
          name: 'MyProject',
          id: 'ac8bc00e-6c55-4c23-ab83-dd3763ccd974'
        });
      });
      it('should set empty array if data is undefined', async () => {
        const service = new CriteriaService();
        mockGetDocument.mockReturnValue(undefined);

        const result = await service.load(undefined, '1');

        expect(result.success).toBeTruthy();
        expect(result.data).toEqual([]);
      });
    });
  });
});
