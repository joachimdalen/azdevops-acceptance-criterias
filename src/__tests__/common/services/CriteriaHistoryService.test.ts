import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';

import CriteriaHistoryService from '../../../common/services/CriteriaHistoryService';
import { HistoryEvent, ProcessEvent } from '../../../common/types';

const identity: IInternalIdentity = {
  displayName: 'Test User',
  entityId: '1234',
  entityType: 'User',
  id: '54321',
  descriptor: 'user1234',
  image: '/image.png'
};

describe('CriteriaHistoryService', () => {
  describe('getProcessEvent', () => {
    it('should return event without actor', () => {
      const service = new CriteriaHistoryService();

      const evnt = service.getProcessEvent(ProcessEvent.Approve);
      expect(evnt.event).toEqual(HistoryEvent.Approved);
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
});
