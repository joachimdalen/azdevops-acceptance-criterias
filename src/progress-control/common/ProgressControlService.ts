import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import { getClient } from 'azure-devops-extension-api';
import { WorkItemTrackingRestClient } from 'azure-devops-extension-api/WorkItemTracking';

import { IStorageService, StorageService } from '../../common/services/StorageService';
import { CriteriaDocument } from '../../common/types';

class ProgressControlService {
  private _devOpsService: DevOpsService;
  private _dataStore: IStorageService;

  constructor() {
    this._devOpsService = new DevOpsService();
    this._dataStore = new StorageService();
  }

  public async getCriteriaData(workItemIds: number[]): Promise<CriteriaDocument[]> {
    const criteriaDocuements: CriteriaDocument[] = [];

    for (const id of workItemIds) {
      try {
        const result = await this._dataStore.getCriteriasForWorkItem(id.toString());
        if (result !== undefined) {
          criteriaDocuements.push(result);
        } else {
          WebLogger.trace('Failed to load for ' + id);
        }
      } catch (error: any) {
        if (error?.status !== 404) {
          throw new Error(error);
        }
      }
    }

    return criteriaDocuements;
  }

  public async getWorkItemIds(workItemId: number): Promise<number[]> {
    const project = await this._devOpsService.getProject();
    const query = `SELECT
    [System.Id]
FROM workitemLinks
WHERE
    (
            [Source].[System.TeamProject] = @project
            AND [Source].[System.Id] = ${workItemId}
    )
    AND (
            [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward'
    )
    AND (
            [Target].[System.TeamProject] = @project
            AND [Target].[System.WorkItemType] <> ''
    )
MODE (Recursive)
`;
    const client = getClient(WorkItemTrackingRestClient);
    const types = await client.queryByWiql({ query: query }, project?.name);

    console.log(types);
    return types?.workItemRelations?.map(x => x.target?.id) || [];
  }
}
export default ProgressControlService;
