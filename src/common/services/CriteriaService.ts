import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { getLoggedInUser } from '@joachimdalen/azdevops-ext-core/IdentityUtils';
import { getClient } from 'azure-devops-extension-api';
import { CoreRestClient, WebApiTeam } from 'azure-devops-extension-api/Core';

import { CriteriaModalResult, PanelIds } from '../common';
import { ActionResult } from '../models/ActionResult';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  CriteriaDocument,
  FullCriteriaStatus,
  IAcceptanceCriteria
} from '../types';
import { IStorageService, StorageService } from './StorageService';
type CriteriaServiceOnChange = (data: CriteriaDocument[]) => void;
class CriteriaService {
  private readonly _dataStore: IStorageService;
  private _isInitialized = false;
  private _data: CriteriaDocument[];
  private _changeHandler?: CriteriaServiceOnChange;
  private _devOpsService: DevOpsService;

  constructor(dataStore?: IStorageService) {
    this._dataStore = dataStore || new StorageService();
    this._devOpsService = new DevOpsService();

    this._data = [];
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

    this.emitChange();
    return { success: true, data: this._data };
  }

  private emitChange() {
    if (this._changeHandler) {
      this._changeHandler(this._data);
    }
  }
  public async getCriteriaDetails(id: string): Promise<CriteriaDetailDocument> {
    const details = await this._dataStore.getCriteriaDetail(id);

    if (details === undefined) {
      return { id: id };
    }

    return details;
  }

  public async deleteCriteria(id: string): Promise<CriteriaDocument | undefined> {
    const doc = this._data.find(x => x.criterias.some(y => y.id === id));

    if (doc) {
      const criteria = doc.criterias.find(x => x.id === id);
      if (criteria) {
        const newDoc = { ...doc };
        newDoc.criterias = newDoc.criterias.filter(x => x.id !== criteria.id);
        const existingDocumentIndex = this._data.findIndex(x => x.id === doc.id);
        const updated = await this._dataStore.setCriteriaDocument(newDoc);
        this._data[existingDocumentIndex] = updated;
        this.emitChange();
        return updated;
      }
    }
  }

  public async processCriteria(id: string, approved: boolean): Promise<void> {
    const doc = this._data.find(x => x.criterias.some(y => y.id === id));
    const details: CriteriaDetailDocument = await this.getCriteriaDetails(id);
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

        criteria.state = approved
          ? AcceptanceCriteriaState.Approved
          : AcceptanceCriteriaState.Rejected;
        await this.createOrUpdate(doc.id, criteria, true);
        await this._dataStore.setCriteriaDetailsDocument(details);
      }
    }
  }

  public async toggleCompletion(
    id: string,
    complete: boolean
  ): Promise<CriteriaDocument | undefined> {
    const doc = this._data.find(x => x.criterias.some(y => y.id === id));

    if (doc) {
      const details = await this.getCriteriaDetails(id);
      const criteria = doc.criterias.find(x => x.id === id);
      if (criteria) {
        if (
          criteria.state === AcceptanceCriteriaState.AwaitingApproval ||
          criteria.state === AcceptanceCriteriaState.Completed ||
          criteria.state === AcceptanceCriteriaState.Approved ||
          criteria.state === AcceptanceCriteriaState.Rejected
        ) {
          criteria.state = AcceptanceCriteriaState.New;
          details.processed = undefined;
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
        const updated = await this.createOrUpdate(doc.id, criteria, true);
        await this._dataStore.setCriteriaDetailsDocument(details);
        return updated;
      }
    }
  }

  public async createOrUpdate(
    workItemId: string,
    criteria: IAcceptanceCriteria,
    shouldEmit = false,
    details?: CriteriaDetailDocument
  ): Promise<CriteriaDocument | undefined> {
    const existingDocumentIndex = this._data.findIndex(x => x.id === workItemId);

    if (existingDocumentIndex === -1) {
      const document: CriteriaDocument = {
        id: workItemId,
        state: FullCriteriaStatus.New,
        criterias: [criteria]
      };
      const created = await this._dataStore.setCriteriaDocument(document);
      this._data = [...this._data, created];
      return created;
    } else {
      const document = this._data[existingDocumentIndex];
      const newDocument = { ...document };
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

      if (shouldEmit) {
        this.emitChange();
      }
      return updated;
    }
  }

  public async getUserTeams(): Promise<WebApiTeam[]> {
    const client = getClient(CoreRestClient);
    const teams = await client.getAllTeams(true);
    return teams;
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
    criteria?: IAcceptanceCriteria,
    readOnly?: boolean,
    canEdit?: boolean,
    onClose?: (result: CriteriaModalResult | undefined) => Promise<void>
  ): Promise<void> {
    await this._devOpsService.showPanel<CriteriaModalResult | undefined, PanelIds>(
      PanelIds.CriteriaPanel,
      {
        title: 'Acceptance Criteria',
        size: 2,
        configuration: {
          isReadOnly: readOnly === undefined ? false : readOnly,
          canEdit: canEdit === undefined ? false : canEdit,
          criteria
        },
        onClose: onClose
      }
    );
  }
}

export default CriteriaService;
