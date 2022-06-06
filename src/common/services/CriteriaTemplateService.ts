import { CriteriaTemplateDocument } from '../types';
import { IStorageService, StorageService } from './StorageService';

class CriteriaTemplateService {
  private readonly _dataStore: IStorageService;

  constructor(dataStore?: IStorageService) {
    this._dataStore = dataStore || new StorageService();
  }

  public async getTemplates(): Promise<CriteriaTemplateDocument[]> {
    try {
      const templates = await this._dataStore.getTemplates();
      return templates;
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
      return [];
    }
  }

  public async createOrUpdate(doc: CriteriaTemplateDocument): Promise<CriteriaTemplateDocument> {
    const updated = await this._dataStore.setTemplate(doc);
    return updated;
  }
}

export default CriteriaTemplateService;
