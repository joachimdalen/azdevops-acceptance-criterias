import { IExtensionDataService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

enum ScopeType {
  Default = 'Default',
  User = 'User'
}

class StorageService {
  private storageKey: string;
  private scopeType: ScopeType;
  private dataService?: IExtensionDataService;

  public constructor(storageKey: string, scope: ScopeType) {
    this.storageKey = storageKey;
    this.scopeType = scope;
  }

  private async getDataService(): Promise<IExtensionDataService> {
    if (this.dataService === undefined) {
      this.dataService = await DevOps.getService<IExtensionDataService>(
        'ms.vss-features.extension-data-service'
      );
    }
    return this.dataService;
  }

  public async getData(): Promise<any> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.getValue(this.storageKey, {
      scopeType: this.scopeType
    });
  }

  public async setData(data: any): Promise<any> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setValue(this.storageKey, data, {
      scopeType: this.scopeType
    });
  }
}

export { ScopeType, StorageService };
