import { ActionResult } from '../models/ActionResult';
import { CriteriaDocument } from '../models/CriteriaDocument';
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

  public async load(force = false): Promise<ActionResult<CriteriaDocument[]>> {
    if (this._isInitialized && !force) return { success: true, data: this._data };
    try {
      const data = await this._dataStore.getAllCriterias();
      this._data = data;
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
    }
    this._isInitialized = true;
    return { success: true, data: this._data };
  }
}

export default CriteriaService;
