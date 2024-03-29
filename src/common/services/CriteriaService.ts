import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { getLoggedInUser, isLoggedInUser } from '@joachimdalen/azdevops-ext-core/IdentityUtils';
import { getClient } from 'azure-devops-extension-api';
import { CoreRestClient, WebApiTeam } from 'azure-devops-extension-api/Core';
import { GraphMembership, GraphRestClient } from 'azure-devops-extension-api/Graph';
import {
  WorkItemQueryResult,
  WorkItemTrackingRestClient
} from 'azure-devops-extension-api/WorkItemTracking';

import { CriteriaModalResult, PanelIds } from '../common';
import { ActionResult } from '../models/ActionResult';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  CriteriaDocument,
  CriteriaPanelConfig,
  FullCriteriaStatus,
  HistoryItem,
  IAcceptanceCriteria,
  ProcessEvent
} from '../types';
import CriteriaHistoryService from './CriteriaHistoryService';
import { IStorageService, StorageService } from './StorageService';

type CriteriaServiceOnChange = (
  data: CriteriaDocument[],
  dataChange: boolean,
  historyChange: boolean,
  isLoad: boolean
) => void;
enum CriteriaErrorCode {
  InvalidDocumentVersionException = 0,
  Failed = 1
}
interface CriteriaError {
  error: CriteriaErrorCode;
  criteria?: CriteriaDocument;
  details?: CriteriaDetailDocument;
}
type CriteriaServiceOnError = (error: CriteriaError) => void;

class CriteriaService {
  private readonly _dataStore: IStorageService;
  private readonly _historyService: CriteriaHistoryService;
  private _isInitialized = false;
  private _data: CriteriaDocument[];
  private _changeHandler?: CriteriaServiceOnChange;
  private _devOpsService: DevOpsService;
  private _errorHandler?: CriteriaServiceOnError;

  constructor(
    onError?: CriteriaServiceOnError,
    dataStore?: IStorageService,
    historyService?: CriteriaHistoryService
  ) {
    this._dataStore = dataStore || new StorageService();
    this._historyService = historyService || new CriteriaHistoryService();
    this._devOpsService = new DevOpsService();
    this._data = [];
    this._errorHandler = onError;
  }

  public isInitialized(): boolean {
    return this._isInitialized;
  }

  public async load(
    onDataChanged?: CriteriaServiceOnChange,
    scopedId: string | undefined = undefined,
    force = false
  ): Promise<ActionResult<CriteriaDocument[]>> {
    if (this._isInitialized && !force) return { success: true, data: this._data };
    try {
      const data =
        scopedId !== undefined
          ? await this._dataStore.getCriteriasForWorkItem(scopedId)
          : await this._dataStore.getAllCriterias();

      if (data === undefined) {
        this._data = [];
      } else {
        this._data = Array.isArray(data) ? data : [data];
      }
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
    }
    this._isInitialized = true;
    if (onDataChanged) {
      this._changeHandler = onDataChanged;
    }

    this.emitChange(true, true, true);
    return { success: true, data: this._data };
  }

  private emitChange(dataChange: boolean, historyChange: boolean, isLoad = false) {
    if (this._changeHandler) {
      this._changeHandler(this._data, dataChange, historyChange, isLoad);
    }
  }
  public async getCriteriaDetails(id: string): Promise<CriteriaDetailDocument | undefined> {
    try {
      const details = await this._dataStore.getCriteriaDetail(id);
      if (details === undefined) return { id: id };
      return details;
    } catch (error: any) {
      if (error?.status !== 404) {
        if (this._errorHandler)
          this._errorHandler({ error: CriteriaErrorCode.InvalidDocumentVersionException });
        throw new Error(error);
      }
    }
    return undefined;
  }

  public async deleteCriteria(id: string): Promise<CriteriaDocument | undefined> {
    const doc = this._data.find(x => x.criterias.some(y => y.id === id));

    if (doc) {
      const criteria = doc.criterias.find(x => x.id === id);
      if (criteria) {
        const newDoc = { ...doc };
        newDoc.criterias = newDoc.criterias.filter(x => x.id !== criteria.id);

        if (newDoc.criterias.length === 0) {
          const newData = this._data.filter(x => x.id !== doc.id);
          await this._dataStore.deleteCriteriaDocument(doc.id);
          await this._dataStore.deleteCriteriaDetilsDocument(id);
          await this._dataStore.deleteHistoryDocument(id);
          this._data = newData;
          this.emitChange(true, false);
          return undefined;
        } else {
          const existingDocumentIndex = this._data.findIndex(x => x.id === doc.id);
          const updated = await this._dataStore.setCriteriaDocument(newDoc);
          await this._dataStore.deleteCriteriaDetilsDocument(id);
          await this._dataStore.deleteHistoryDocument(id);
          this._data[existingDocumentIndex] = updated;
          this.emitChange(true, false);
          return updated;
        }
      }
    }
  }

  public async processCheckListCriteria(
    workItemId: string,
    criteriaId: string,
    checkItemId: string,
    complete: boolean
  ): Promise<{ details: CriteriaDetailDocument; criteria?: IAcceptanceCriteria } | undefined> {
    try {
      const details: CriteriaDetailDocument = (await this.getCriteriaDetails(criteriaId)) || {
        id: criteriaId
      };

      const itemIndex = details.checklist?.criterias?.findIndex(x => x.id === checkItemId);

      if (details.checklist?.criterias !== undefined && itemIndex !== undefined && itemIndex > -1) {
        const newItem = { ...details.checklist.criterias[itemIndex] };
        newItem.completed = complete;
        details.checklist.criterias[itemIndex] = newItem;
        const updated = await this._dataStore.setCriteriaDetailsDocument(details);

        return {
          details: updated
        };
      }

      return undefined;
    } catch (error: any) {
      if (this._errorHandler)
        this._errorHandler({ error: CriteriaErrorCode.InvalidDocumentVersionException });
      throw new Error(error);
    }
  }

  private setCriteriaItems(
    criteria?: IAcceptanceCriteria,
    details?: CriteriaDetailDocument,
    reApprove?: boolean
  ) {
    if (criteria && details) {
      if (
        criteria.state === AcceptanceCriteriaState.AwaitingApproval ||
        criteria.state === AcceptanceCriteriaState.Completed ||
        criteria.state === AcceptanceCriteriaState.Approved ||
        criteria.state === AcceptanceCriteriaState.Rejected
      ) {
        if (reApprove) {
          criteria.state = AcceptanceCriteriaState.AwaitingApproval;
        } else {
          criteria.state = AcceptanceCriteriaState.New;
        }
        details.processed = undefined;
        details.latestComment = undefined;
      } else {
        if (criteria.requiredApprover) {
          criteria.state = AcceptanceCriteriaState.AwaitingApproval;
        } else {
          criteria.state = AcceptanceCriteriaState.Completed;
        }

        details.processed = {
          completedAt: new Date()
        };
      }
    }

    return { criteria, details };
  }

  public async processCriteria(
    workItemId: string,
    id: string,
    action: ProcessEvent,
    comment?: string
  ): Promise<{ criteria: IAcceptanceCriteria; details: CriteriaDetailDocument } | undefined> {
    try {
      const doc = await this._dataStore.getCriteriasForWorkItem(workItemId);
      const details: CriteriaDetailDocument = (await this.getCriteriaDetails(id)) || { id: id };
      const approver = await getLoggedInUser();
      if (doc) {
        const criteria = doc.criterias.find(x => x.id === id);
        if (criteria) {
          if (details.processed !== undefined) {
            details.processed = {
              ...details.processed,
              processedAt: new Date(),
              processedBy: approver
            };
          } else {
            details.processed = {
              completedAt: new Date(),
              processedAt: new Date(),
              processedBy: approver
            };
          }
          details.latestComment = comment;
          criteria.state =
            action === ProcessEvent.Approve
              ? AcceptanceCriteriaState.Approved
              : AcceptanceCriteriaState.Rejected;

          const res = await this.update(doc, criteria, details);

          const historyEvent: HistoryItem = this._historyService.getProcessEvent(
            action,
            approver,
            comment
          );
          await this._historyService.createOrUpdate(id, historyEvent);
          this.emitChange(false, true);
          return res;
        }
      }
    } catch (error: any) {
      if (this._errorHandler)
        this._errorHandler({ error: CriteriaErrorCode.InvalidDocumentVersionException });
      throw new Error(error);
    }
  }

  public async toggleCompletion(
    id: string,
    action: ProcessEvent
  ): Promise<CriteriaDocument | undefined> {
    const doc = this._data.find(x => x.criterias.some(y => y.id === id));
    try {
      if (doc) {
        const details = (await this.getCriteriaDetails(id)) || { id: id };
        const criteria = doc.criterias.find(x => x.id === id);
        const { criteria: crit, details: det } = this.setCriteriaItems(
          criteria,
          details,
          action === ProcessEvent.ResubmitForApproval
        );
        if (crit) {
          const updated = await this.createOrUpdate(doc.id, crit, true);
          if (det) {
            await this._dataStore.setCriteriaDetailsDocument(det);
          }

          const approver = await getLoggedInUser();
          const historyEvent: HistoryItem = this._historyService.getProcessEvent(action, approver);
          await this._historyService.createOrUpdate(id, historyEvent);
          this.emitChange(false, true);
          return updated;
        }
      }
    } catch (error: any) {
      if (this._errorHandler)
        this._errorHandler({ error: CriteriaErrorCode.InvalidDocumentVersionException });
      throw new Error(error);
    }
  }

  public async update(
    document: CriteriaDocument,
    criteria: IAcceptanceCriteria,
    details: CriteriaDetailDocument
  ): Promise<{ criteria: IAcceptanceCriteria; details: CriteriaDetailDocument }> {
    const newDocument = { ...document };
    const index = document.criterias.findIndex(x => x.id === criteria.id);

    if (index > -1) {
      newDocument.criterias[index] = criteria;
    }

    const stateDoc = this.setFullState(newDocument);
    const updated = await this._dataStore.setCriteriaDocument(stateDoc);
    const updatedDetails = await this._dataStore.setCriteriaDetailsDocument(details);

    const docIndex = this._data.findIndex(x => x.id === stateDoc.id);

    if (docIndex > -1) {
      this._data[docIndex] = updated;
    }

    return {
      criteria: criteria,
      details: updatedDetails
    };
  }

  public async createOrUpdate(
    workItemId: string,
    criteria: IAcceptanceCriteria,
    shouldEmitData = false,
    shouldEmitHistory = false,
    details?: CriteriaDetailDocument
  ): Promise<CriteriaDocument | undefined> {
    const existingDocumentIndex = this._data.findIndex(x => x.id === workItemId);

    if (existingDocumentIndex === -1) {
      const document: CriteriaDocument = {
        id: workItemId,
        state: FullCriteriaStatus.New,
        criterias: [
          {
            ...criteria,
            id: `AC-${workItemId}-1`
          }
        ],
        counter: 2
      };
      const created = await this._dataStore.setCriteriaDocument(document);
      this._data = [...this._data, created];

      if (details !== undefined) {
        await this._dataStore.setCriteriaDetailsDocument({
          ...details,
          id: `AC-${workItemId}-1`
        });
      }
      if (shouldEmitData || shouldEmitHistory) {
        this.emitChange(shouldEmitData, shouldEmitHistory);
      }
      return created;
    } else {
      const document = this._data[existingDocumentIndex];
      const newDocument = { ...document };

      if (criteria.id === 'unset') {
        const id = `AC-${workItemId}-${newDocument.counter}`;
        criteria.id = id;
        if (details !== undefined) details.id = id;
        newDocument.counter = newDocument.counter + 1;
      }

      const index = document.criterias.findIndex(x => x.id === criteria.id);

      if (index > -1) {
        newDocument.criterias[index] = criteria;
      } else {
        newDocument.criterias = [...newDocument.criterias, criteria];
      }

      const stateDoc = this.setFullState(newDocument);
      const updated = await this._dataStore.setCriteriaDocument(stateDoc);

      if (details !== undefined) {
        await this._dataStore.setCriteriaDetailsDocument(details);
      }

      const newDocuments = [...this._data];
      newDocuments[existingDocumentIndex] = updated;
      this._data = newDocuments;

      if (shouldEmitData || shouldEmitHistory) {
        this.emitChange(shouldEmitData, shouldEmitHistory);
      }
      return updated;
    }
  }

  public async getUserTeams(): Promise<WebApiTeam[]> {
    const client = getClient(CoreRestClient);
    const teams = await client.getAllTeams(true);
    return teams;
  }

  public async getUserGroups(userDescriptor: string): Promise<GraphMembership[]> {
    const client = getClient(GraphRestClient);
    const groups = client.listMemberships(userDescriptor);
    return groups;
  }

  public setFullState(document: CriteriaDocument): CriteriaDocument {
    const doc = { ...document };
    const news = doc.criterias.some(x => x.state === AcceptanceCriteriaState.New);
    const completed = doc.criterias.some(x => x.state === AcceptanceCriteriaState.Completed);
    const approved = doc.criterias.some(x => x.state === AcceptanceCriteriaState.Approved);
    const rejected = doc.criterias.some(x => x.state === AcceptanceCriteriaState.Rejected);
    const awaiting = doc.criterias.some(x => x.state === AcceptanceCriteriaState.AwaitingApproval);

    if (rejected) {
      doc.state = FullCriteriaStatus.Rejected;
      return doc;
    }

    if (news && !completed && !approved && !rejected) {
      doc.state = FullCriteriaStatus.New;
      return doc;
    }

    if (news || awaiting) {
      doc.state = FullCriteriaStatus.Partial;
      return doc;
    }

    if (completed && !approved && !rejected) {
      doc.state = FullCriteriaStatus.Completed;
      return doc;
    }

    if (approved && !rejected) {
      doc.state = FullCriteriaStatus.Approved;
      return doc;
    }

    return doc;
  }

  public async showPanel(
    options: CriteriaPanelConfig,
    criteria?: IAcceptanceCriteria
  ): Promise<void> {
    const intConfig: Omit<CriteriaPanelConfig, 'onClose'> = {
      criteriaId: options.criteriaId,
      workItemId: options.workItemId,
      mode: options.mode
    };
    await this._devOpsService.showPanel<CriteriaModalResult | undefined, PanelIds>(
      PanelIds.CriteriaPanel,
      {
        title:
          criteria !== undefined ? `${criteria?.id} - ${criteria?.title}` : 'Acceptance Criteria',
        size: 2,
        configuration: intConfig,
        onClose: options.onClose
      }
    );
  }

  public async getActiveWorkItemIds(states: string[], ids: number[]): Promise<WorkItemQueryResult> {
    const project = await this._devOpsService.getProject();
    const statesString = states.map(x => "'" + x + "'").join(',');
    const idString = ids.join(',');

    const query = `select [System.Id] from WorkItems where [System.TeamProject] = @project and [System.WorkItemType] <> '' and not [System.State] in (${statesString}) and [System.Id] in (${idString})`;
    const client = getClient(WorkItemTrackingRestClient);
    const types = await client.queryByWiql({ query: query }, project?.name);

    return types;
  }

  public async checkApproval(criteria: IAcceptanceCriteria): Promise<boolean> {
    if (
      criteria.state === AcceptanceCriteriaState.AwaitingApproval &&
      criteria.requiredApprover !== undefined
    ) {
      if (criteria.requiredApprover.entityType === 'User') {
        if (isLoggedInUser(criteria.requiredApprover)) {
          return true;
        }
      } else {
        const teams = await this.getUserTeams();

        if (teams.some(y => y.id === criteria.requiredApprover?.id)) {
          return true;
        } else {
          const user = await getLoggedInUser();
          if (user?.descriptor !== undefined) {
            const groups = await this.getUserGroups(user.descriptor);
            const group = groups.find(
              x => x.containerDescriptor === criteria.requiredApprover?.descriptor
            );
            if (group !== undefined) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}

export default CriteriaService;
