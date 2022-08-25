import { IVssRestClientOptions } from 'azure-devops-extension-api';
import { WorkItemDeleteReference } from 'azure-devops-extension-api/WorkItemTracking';

export const mockGetDeletedWorkItems = jest.fn().mockRejectedValue(new Error('Not implemented'));

export class WorkItemTrackingRestClient {
  public TYPE = 'WorkItemTrackingRestClient';
  constructor(options: IVssRestClientOptions) {}

  getDeletedWorkItems(ids: number[], project?: string): Promise<WorkItemDeleteReference[]> {
    return new Promise(resolve => resolve(mockGetDeletedWorkItems(ids, project)));
  }
}
