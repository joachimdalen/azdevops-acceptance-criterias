import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';

import { HistoryDocument, HistoryEvent, HistoryItem, ProcessEvent } from '../types';
import { IStorageService, StorageService } from './StorageService';

class CriteriaHistoryService {
  private readonly _dataStore: IStorageService;

  constructor(dataStore?: IStorageService) {
    this._dataStore = dataStore || new StorageService();
  }

  public getProcessEvent(event: ProcessEvent, actor?: IInternalIdentity): HistoryItem {
    switch (event) {
      case ProcessEvent.Approve: {
        return this.getApprovedEvent(actor);
      }
      case ProcessEvent.Reject: {
        return this.getRejectedEvent(actor);
      }
      case ProcessEvent.Complete: {
        return this.getCompletedEvent(actor);
      }
      case ProcessEvent.ResetToNew: {
        return this.getReOpenEvent(actor);
      }
      case ProcessEvent.ResubmitForApproval: {
        return this.getReApproveEvent(actor);
      }
    }
  }
  public getApprovedEvent(actor?: IInternalIdentity): HistoryItem {
    return {
      event: HistoryEvent.Approved,
      date: new Date(),
      actor: actor
    };
  }
  public getReApproveEvent(actor?: IInternalIdentity): HistoryItem {
    return {
      event: HistoryEvent.ReApprove,
      date: new Date(),
      actor: actor
    };
  }
  public getRejectedEvent(actor?: IInternalIdentity): HistoryItem {
    return {
      event: HistoryEvent.Rejected,
      date: new Date(),
      actor: actor
    };
  }
  public getCompletedEvent(actor?: IInternalIdentity): HistoryItem {
    return {
      event: HistoryEvent.Completed,
      date: new Date(),
      actor: actor
    };
  }
  public getReOpenEvent(actor?: IInternalIdentity): HistoryItem {
    return {
      event: HistoryEvent.ReOpened,
      date: new Date(),
      actor: actor
    };
  }

  public async getHistory(id: string): Promise<HistoryDocument> {
    const defaultItem = {
      id: id,
      __etag: -1,
      items: []
    };
    try {
      const history = await this._dataStore.getHistory(id);
      if (history === undefined) {
        return defaultItem;
      }
      return history;
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
      return defaultItem;
    }
  }

  public async createOrUpdate(id: string, event: HistoryItem): Promise<HistoryDocument> {
    const existingHistory = await this.getHistory(id);
    const newDocument: HistoryDocument = {
      ...existingHistory,
      items: [event, ...existingHistory.items]
    };
    const updated = await this._dataStore.setHistory(newDocument);
    return updated;
  }
}

export default CriteriaHistoryService;
