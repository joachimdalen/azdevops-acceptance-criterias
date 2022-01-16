import { DevOpsService, IDevOpsService } from '@joachimdalen/azdevops-ext-core';
import { IExtensionDataService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

import { CriteriaDocument } from '../models/CriteriaDocument';
import SettingDocument from '../models/SettingDocument';

enum ScopeType {
  Default = 'Default',
  User = 'User'
}

enum CollectionNames {
  Criterias = 'AcceptanceCriterias',
  Settings = 'Settings'
}

export interface IStorageService {
  getCriteriasForWorkItem(workItemId: string): Promise<CriteriaDocument | undefined>;
  getAllCriterias(): Promise<CriteriaDocument[]>;
  setCriteriaDocument(data: CriteriaDocument): Promise<CriteriaDocument>;
}
class StorageService implements IStorageService {
  private readonly _devOpsService: IDevOpsService;
  private scopeType: ScopeType;
  private dataService?: IExtensionDataService;
  private _criteriaCollection?: string;
  private _projectId?: string;

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

    if (this._criteriaCollection === undefined) {
      const project = await this._devOpsService.getProject();

      if (project === undefined) {
        throw new Error('Failed to find project');
      }

      this._criteriaCollection = `${project.id}-${CollectionNames.Criterias}`;
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

  public async getSettings(): Promise<SettingDocument> {
    const defaultDocument: SettingDocument = {
      id: '',
      __etag: '-1'
    };
    try {
      const dataService = await this.getDataService();
      if (!this._projectId) {
        return defaultDocument;
      }
      const dataManager = await dataService.getExtensionDataManager(
        DevOps.getExtensionContext().id,
        await DevOps.getAccessToken()
      );

      const document = await dataManager.getDocument(CollectionNames.Settings, this._projectId, {
        defaultValue: defaultDocument
      });

      return document;
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      } else {
        return defaultDocument;
      }
    }
  }

  public async setSettings(data: SettingDocument): Promise<SettingDocument> {
    const dataService = await this.getDataService();

    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setDocument(CollectionNames.Settings, {
      ...data,
      id: this._projectId
    });
  }
}

export { ScopeType, StorageService };
