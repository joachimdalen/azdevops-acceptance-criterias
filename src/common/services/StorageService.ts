import { IExtensionDataService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

import { CriteriaDocument } from '../models/CriteriaDocument';

enum ScopeType {
  Default = 'Default',
  User = 'User'
}

enum CollectionNames {
  Criterias = 'AcceptanceCriterias'
}

class StorageService {
  private scopeType: ScopeType;
  private dataService?: IExtensionDataService;

  public constructor() {
    this.scopeType = ScopeType.Default;
  }

  private async getDataService(): Promise<IExtensionDataService> {
    if (this.dataService === undefined) {
      this.dataService = await DevOps.getService<IExtensionDataService>(
        'ms.vss-features.extension-data-service'
      );
    }
    return this.dataService;
  }

  public async getWorkItemData(id: number): Promise<CriteriaDocument | undefined> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.getDocument(CollectionNames.Criterias, id.toString(), {
      scopeType: this.scopeType,
      defaultValue: undefined
    });
  }
  public async getData(): Promise<CriteriaDocument[]> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.getDocuments(CollectionNames.Criterias, {
      scopeType: this.scopeType
    });
  }

  public async setData(data: CriteriaDocument): Promise<CriteriaDocument> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setDocument(CollectionNames.Criterias, data, {
      scopeType: ScopeType.Default
    });
  }
}

export { ScopeType, StorageService };
