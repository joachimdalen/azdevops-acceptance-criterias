import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';

import CriteriaHistoryService from '../../../common/services/CriteriaHistoryService';
import { StorageService } from '../../../common/services/StorageService';
import { HistoryDocument, HistoryEvent, ProcessEvent } from '../../../common/types';

const identity: IInternalIdentity = {
  displayName: 'Test User',
  entityId: '1234',
  entityType: 'User',
  id: '54321',
  descriptor: 'user1234',
  image: '/image.png'
};

const historyWithContent: HistoryDocument = {
  __etag: 1,
  id: 'AC-1-2',
  items: [
    {
      date: new Date(),
      event: HistoryEvent.Completed,
      actor: identity
    }
  ]
};

describe('CriteriaHistoryService', () => {
  const getHistorySpy = jest.spyOn(StorageService.prototype, 'getHistory');
  const setHistorySpy = jest.spyOn(StorageService.prototype, 'setHistory');

  beforeEach(() => {
    jest.clearAllMocks();
    getHistorySpy.mockReset();
  });

  describe('getProcessEvent', () => {
    it('should return approved event without actor', () => {
      const service = new CriteriaHistoryService();

      const evnt = service.getProcessEvent(ProcessEvent.Approve);
      expect(evnt.event).toEqual(HistoryEvent.Approved);
      expect(evnt.actor).toBeUndefined();
      expect(evnt.properties).toBeUndefined();
      expect(evnt.date).not.toBeUndefined();
    });

    it('should return rejected event without actor', () => {
      const service = new CriteriaHistoryService();

      const evnt = service.getProcessEvent(ProcessEvent.Reject);
      expect(evnt.event).toEqual(HistoryEvent.Rejected);
      expect(evnt.actor).toBeUndefined();
      expect(evnt.properties).toBeUndefined();
      expect(evnt.date).not.toBeUndefined();
    });

    it('should return complete event without actor', () => {
      const service = new CriteriaHistoryService();

      const evnt = service.getProcessEvent(ProcessEvent.Complete);
      expect(evnt.event).toEqual(HistoryEvent.Completed);
      expect(evnt.actor).toBeUndefined();
      expect(evnt.properties).toBeUndefined();
      expect(evnt.date).not.toBeUndefined();
    });

    it('should return reset-to-new event without actor', () => {
      const service = new CriteriaHistoryService();

      const evnt = service.getProcessEvent(ProcessEvent.ResetToNew);
      expect(evnt.event).toEqual(HistoryEvent.ReOpened);
      expect(evnt.actor).toBeUndefined();
      expect(evnt.properties).toBeUndefined();
      expect(evnt.date).not.toBeUndefined();
    });

    it('should return resubmit-for-approval event without actor', () => {
      const service = new CriteriaHistoryService();

      const evnt = service.getProcessEvent(ProcessEvent.ResubmitForApproval);
      expect(evnt.event).toEqual(HistoryEvent.ReApprove);
      expect(evnt.actor).toBeUndefined();
      expect(evnt.properties).toBeUndefined();
      expect(evnt.date).not.toBeUndefined();
    });

    it('should return event with actor', () => {
      const service = new CriteriaHistoryService();

      const evnt = service.getProcessEvent(ProcessEvent.Approve, identity);
      expect(evnt.event).toEqual(HistoryEvent.Approved);
      expect(evnt.actor).toEqual(identity);
      expect(evnt.properties).toBeUndefined();
      expect(evnt.date).not.toBeUndefined();
    });
    it('should return event with actor and comment', () => {
      const service = new CriteriaHistoryService();

      const evnt = service.getProcessEvent(ProcessEvent.Approve, identity, 'Some comment');
      expect(evnt.event).toEqual(HistoryEvent.Approved);
      expect(evnt.actor).toEqual(identity);
      expect(evnt.properties).not.toBeUndefined();
      expect(evnt.properties?.comment).toEqual('Some comment');
      expect(evnt.date).not.toBeUndefined();
    });
  });

  describe('getHistory', () => {
    it('should return default when 404 is thrown', async () => {
      getHistorySpy.mockRejectedValue({ status: 404 });
      const service = new CriteriaHistoryService();

      const result = await service.getHistory('AC-1-1');

      expect(result).not.toBeUndefined();
      expect(result.__etag).toEqual(-1);
      expect(result.items.length).toEqual(0);
    });

    it('should return default when fetched is undefined', async () => {
      getHistorySpy.mockResolvedValue(undefined);
      const service = new CriteriaHistoryService();

      const result = await service.getHistory('AC-1-1');

      expect(result).not.toBeUndefined();
      expect(result.__etag).toEqual(-1);
      expect(result.items.length).toEqual(0);
    });

    it('should return history', async () => {
      getHistorySpy.mockResolvedValue(historyWithContent);
      const service = new CriteriaHistoryService();

      const result = await service.getHistory('AC-1-1');

      expect(result).not.toBeUndefined();
      expect(result.__etag).toEqual(1);
      expect(result.items.length).toEqual(1);
    });

    it('should throw when error is not 404', async () => {
      getHistorySpy.mockRejectedValue({ status: 500 });
      const service = new CriteriaHistoryService();

      expect(async () => await service.getHistory('AC-1-1')).rejects.toThrowError();
    });
  });

  describe('createOrUpdate', () => {
    it('should update item', async () => {
      getHistorySpy.mockResolvedValue(historyWithContent);
      setHistorySpy.mockImplementation(d => new Promise(resolve => resolve(d)));

      const service = new CriteriaHistoryService();

      const result = await service.createOrUpdate('AC-1-1', {
        date: new Date(),
        event: HistoryEvent.Completed,
        actor: identity,
        properties: {
          comment: 'Hello'
        }
      });

      expect(result).not.toBeUndefined();
      expect(result.items.length).toEqual(2);
      expect(result.items[0].event).toEqual(HistoryEvent.Completed);
    });
  });
});
