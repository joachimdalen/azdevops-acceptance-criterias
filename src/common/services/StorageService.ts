import { DevOpsService, IDevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { IExtensionDataService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';
import { DevOpsError, DevOpsErrorCodes } from '../DevOpsError';

import {
  CriteriaDetailDocument,
  CriteriaDocument,
  CriteriaTemplateDocument,
  GlobalSettingsDocument,
  HistoryDocument
} from '../types';

enum ScopeType {
  Default = 'Default',
  User = 'User'
}

enum CollectionNames {
  Criterias = 'AcceptanceCriterias',
  Details = 'AcceptanceCriteriaDetails',
  Settings = 'Settings',
  History = 'History',
  Templates = 'Templates'
}

export interface IStorageService {
  getCriteriasForWorkItem(workItemId: string): Promise<CriteriaDocument | undefined>;
  getAllCriterias(): Promise<CriteriaDocument[]>;
  setCriteriaDocument(data: CriteriaDocument): Promise<CriteriaDocument>;
  deleteCriteriaDocument(id: string): Promise<void>;
  getCriteriaDetail(id: string): Promise<CriteriaDetailDocument | undefined>;
  setCriteriaDetailsDocument(data: CriteriaDetailDocument): Promise<CriteriaDetailDocument>;
  deleteCriteriaDetilsDocument(id: string): Promise<void>;
  deleteHistoryDocument(id: string): Promise<void>;
  resetSettings(): Promise<GlobalSettingsDocument>;
  getHistory(id: string): Promise<HistoryDocument | undefined>;
  setHistory(data: HistoryDocument): Promise<HistoryDocument>;
  getTemplates(): Promise<CriteriaTemplateDocument[]>;
  setTemplate(data: CriteriaTemplateDocument): Promise<CriteriaTemplateDocument>;
  deleteTemplate(id: string): Promise<void>;
  getTemplate(id: string): Promise<CriteriaTemplateDocument | undefined>;
}
class StorageService implements IStorageService {
  private readonly _devOpsService: IDevOpsService;
  private scopeType: ScopeType;
  private dataService?: IExtensionDataService;
  private _criteriaCollection?: string;
  private _criteriaDetailsCollection?: string;
  private _criteriaHistoryCollection?: string;
  private _criteriaTemplateCollection?: string;
  private _settingsCollection?: string;
  private _projectId?: string;
  private defaultSettingsDocument: GlobalSettingsDocument = {
    id: 'Global',
    limitAllowedCriteriaTypes: false,
    allowedCriteriaTypes: [],
    requireApprovers: false,
    __etag: -1
  };

  public constructor() {
    this._devOpsService = new DevOpsService();
    this.scopeType = ScopeType.Default;
  }

  private async getDataService(): Promise<IExtensionDataService> {
    if (this.dataService === undefined) {
      this.dataService = await DevOps.getService<IExtensionDataService>(
        'ms.vss-features.extension-data-service'
      );
    }

    if (
      this._criteriaCollection === undefined ||
      this._criteriaDetailsCollection === undefined ||
      this._settingsCollection === undefined ||
      this._criteriaHistoryCollection === undefined ||
      this._criteriaTemplateCollection === undefined
    ) {
      const project = await this._devOpsService.getProject();

      if (project === undefined) {
        throw new Error('Failed to find project');
      }

      this._criteriaCollection = `${project.id}-${CollectionNames.Criterias}`;
      this._criteriaDetailsCollection = `${project.id}-${CollectionNames.Details}`;
      this._settingsCollection = `${project.id}-${CollectionNames.Settings}`;
      this._criteriaHistoryCollection = `${project.id}-${CollectionNames.History}`;
      this._criteriaTemplateCollection = `${project.id}-${CollectionNames.Templates}`;
      this._projectId = project.id;
    }

    return this.dataService;
  }

  public async getCriteriasForWorkItem(workItemId: string): Promise<CriteriaDocument | undefined> {
    const dataService = await this.getDataService();

    if (this._criteriaCollection === undefined) {
      throw new Error('Failed to initialize ');
    }

    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    const document: CriteriaDocument | undefined = await dataManager.getDocument(
      this._criteriaCollection,
      workItemId,
      {
        scopeType: this.scopeType,
        defaultValue: undefined
      }
    );

    return document;
  }
  public async getAllCriterias(): Promise<CriteriaDocument[]> {
    const dataService = await this.getDataService();
    if (this._criteriaCollection === undefined) {
      throw new Error('Failed to initialize ');
    }
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.getDocuments(this._criteriaCollection, {
      scopeType: this.scopeType
    });
  }
  public async getAllCriteriaDetails(): Promise<CriteriaDetailDocument[]> {
    const dataService = await this.getDataService();
    if (this._criteriaDetailsCollection === undefined) {
      throw new Error('Failed to initialize ');
    }
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.getDocuments(this._criteriaDetailsCollection, {
      scopeType: this.scopeType
    });
  }
  public async deleteCriteriaDocument(id: string): Promise<void> {
    try {
      const dataService = await this.getDataService();
      if (this._criteriaCollection === undefined) {
        throw new Error('Failed to initialize ');
      }
      const dataManager = await dataService.getExtensionDataManager(
        DevOps.getExtensionContext().id,
        await DevOps.getAccessToken()
      );
      await dataManager.deleteDocument(this._criteriaCollection, id, {
        scopeType: this.scopeType
      });
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
    }
  }

  public async setCriteriaDocument(data: CriteriaDocument): Promise<CriteriaDocument> {
    const dataService = await this.getDataService();
    if (this._criteriaCollection === undefined) {
      throw new Error('Failed to initialize ');
    }
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setDocument(this._criteriaCollection, data, {
      scopeType: ScopeType.Default
    });
  }

  public async getSettings(): Promise<GlobalSettingsDocument> {
    try {
      const dataService = await this.getDataService();

      if (this._settingsCollection === undefined) {
        throw new Error('Failed to initialize ');
      }

      if (!this._projectId) {
        return this.defaultSettingsDocument;
      }
      const dataManager = await dataService.getExtensionDataManager(
        DevOps.getExtensionContext().id,
        await DevOps.getAccessToken()
      );

      const document = await dataManager.getDocument(this._settingsCollection, 'Global', {
        defaultValue: this.defaultSettingsDocument
      });

      return document;
    } catch (error: any) {
      if (error?.status === 404) {
        return this.defaultSettingsDocument;
      } else {
        throw new Error(error);
      }
    }
  }

  public async setSettings(data: GlobalSettingsDocument): Promise<GlobalSettingsDocument> {
    const dataService = await this.getDataService();

    if (this._settingsCollection === undefined) {
      throw new Error('Failed to initialize ');
    }

    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setDocument(this._settingsCollection, data);
  }

  public async resetSettings(): Promise<GlobalSettingsDocument> {
    return this.setSettings(this.defaultSettingsDocument);
  }

  // Criteria details
  public async getCriteriaDetail(id: string): Promise<CriteriaDetailDocument | undefined> {
    const dataService = await this.getDataService();

    if (this._criteriaDetailsCollection === undefined) {
      throw new Error('Failed to initialize ');
    }

    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    const document: CriteriaDetailDocument | undefined = await dataManager.getDocument(
      this._criteriaDetailsCollection,
      id,
      {
        scopeType: this.scopeType,
        defaultValue: undefined
      }
    );

    return document;
  }

  public async setCriteriaDetailsDocument(
    data: CriteriaDetailDocument
  ): Promise<CriteriaDetailDocument> {
    const dataService = await this.getDataService();
    if (this._criteriaDetailsCollection === undefined) {
      throw new Error('Failed to initialize ');
    }
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setDocument(this._criteriaDetailsCollection, data, {
      scopeType: ScopeType.Default
    });
  }

  public async deleteCriteriaDetilsDocument(id: string): Promise<void> {
    try {
      const dataService = await this.getDataService();
      if (this._criteriaDetailsCollection === undefined) {
        throw new Error('Failed to initialize ');
      }
      const dataManager = await dataService.getExtensionDataManager(
        DevOps.getExtensionContext().id,
        await DevOps.getAccessToken()
      );
      await dataManager.deleteDocument(this._criteriaDetailsCollection, id, {
        scopeType: this.scopeType
      });
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
    }
  }
  public async deleteHistoryDocument(id: string): Promise<void> {
    try {
      const dataService = await this.getDataService();
      if (this._criteriaHistoryCollection === undefined) {
        throw new Error('Failed to initialize ');
      }
      const dataManager = await dataService.getExtensionDataManager(
        DevOps.getExtensionContext().id,
        await DevOps.getAccessToken()
      );
      await dataManager.deleteDocument(this._criteriaHistoryCollection, id, {
        scopeType: this.scopeType
      });
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
    }
  }

  public async getHistory(id: string): Promise<HistoryDocument | undefined> {
    const dataService = await this.getDataService();

    if (this._criteriaHistoryCollection === undefined) {
      throw new Error('Failed to initialize ');
    }

    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    const document: HistoryDocument | undefined = await dataManager.getDocument(
      this._criteriaHistoryCollection,
      id,
      {
        scopeType: this.scopeType,
        defaultValue: undefined
      }
    );

    return document;
  }

  public async setHistory(data: HistoryDocument): Promise<HistoryDocument> {
    const dataService = await this.getDataService();
    if (this._criteriaHistoryCollection === undefined) {
      throw new Error('Failed to initialize ');
    }
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setDocument(this._criteriaHistoryCollection, data, {
      scopeType: ScopeType.Default
    });
  }

  public async getTemplates(): Promise<CriteriaTemplateDocument[]> {
    const dataService = await this.getDataService();
    if (this._criteriaTemplateCollection === undefined) {
      throw new Error('Failed to initialize ');
    }
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    const documents: CriteriaTemplateDocument[] | undefined = await dataManager.getDocuments(
      this._criteriaTemplateCollection,
      {
        scopeType: this.scopeType,
        defaultValue: undefined
      }
    );

    return documents;
  }

  public async setTemplate(data: CriteriaTemplateDocument): Promise<CriteriaTemplateDocument> {
    const dataService = await this.getDataService();
    if (this._criteriaTemplateCollection === undefined) {
      throw new Error('Failed to initialize ');
    }
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setDocument(this._criteriaTemplateCollection, data, {
      scopeType: ScopeType.Default
    });
  }
  public async deleteTemplate(id: string): Promise<void> {
    try {
      const dataService = await this.getDataService();
      if (this._criteriaTemplateCollection === undefined) {
        throw new Error('Failed to initialize ');
      }
      const dataManager = await dataService.getExtensionDataManager(
        DevOps.getExtensionContext().id,
        await DevOps.getAccessToken()
      );
      await dataManager.deleteDocument(this._criteriaTemplateCollection, id, {
        scopeType: this.scopeType
      });
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
    }
  }
  public async getTemplate(id: string): Promise<CriteriaTemplateDocument | undefined> {
    const dataService = await this.getDataService();

    if (this._criteriaTemplateCollection === undefined) {
      throw new Error('Failed to initialize ');
    }

    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    const document: CriteriaTemplateDocument | undefined = await dataManager.getDocument(
      this._criteriaTemplateCollection,
      id,
      {
        scopeType: this.scopeType,
        defaultValue: undefined
      }
    );

    return document;
  }
}

export { ScopeType, StorageService };
