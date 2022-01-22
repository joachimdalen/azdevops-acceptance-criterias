import { ActionResult } from '../models/ActionResult';
import { CriteriaDocument, FullCriteriaStatus, IAcceptanceCriteria } from '../types';
import { IStorageService, StorageService } from './StorageService';

class CriteriaService {
  private readonly _dataStore: IStorageService;
  private _isInitialized = false;
  private _data: CriteriaDocument[];

  constructor(dataStore?: IStorageService) {
    this._dataStore = dataStore || new StorageService();

    this._data = [];
  }

  public isInitialized(): boolean {
    return this._isInitialized;
  }

  public async load(
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
    return { success: true, data: this._data };
  }

  public async createOrUpdate(
    workItemId: string,
    criteria: IAcceptanceCriteria
  ): Promise<CriteriaDocument | undefined> {
    const existingDocument = this._data.find(x => x.id === workItemId);

    if (existingDocument === undefined) {
      const document: CriteriaDocument = {
        id: workItemId,
        state: FullCriteriaStatus.Partial,
        criterias: [criteria]
      };
      const created = await this._dataStore.setCriteriaDocument(document);
      this._data = [...this._data, created];
      return created;
    }
    return undefined;
  }
}

export default CriteriaService;
