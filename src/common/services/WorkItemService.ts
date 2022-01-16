import { getClient } from 'azure-devops-extension-api';
import {
  FieldType,
  FieldUsage,
  WorkItem,
  WorkItemExpand,
  WorkItemField,
  WorkItemTrackingRestClient
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { IIdentity } from 'azure-devops-ui/IdentityPicker';
class WorkItemService {
  public async getWorkItem(id: number): Promise<WorkItem> {
    const client = getClient(WorkItemTrackingRestClient);
    const wit = await client.getWorkItem(id, undefined, undefined, undefined, WorkItemExpand.All);
    return wit;
  }
  public async getFields(): Promise<WorkItemField[]> {
    const client = getClient(WorkItemTrackingRestClient);
    const fields = await client.getFields();
    return fields;
  }
  public async createField(): Promise<WorkItemField | undefined> {
    try {
      const client = getClient(WorkItemTrackingRestClient);
      const payload: Partial<WorkItemField> = {
        type: FieldType.String,
        usage: FieldUsage.WorkItemLink,
        canSortBy: true,
        isQueryable: true,
        name: 'Advanced Acceptance Criteria Link',
        referenceName: 'Jd.AdvancedAcceptanceCriteria.Link'
      };
      const data = await client.createField(payload as any);

      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  public async getCurrentIdentity(): Promise<IIdentity | undefined> {
    const user = await DevOps.getUser();
    // const client = await DevOps.getService<IVssIdentityService>('ms.vss-features.identity-service');
    // const identities = await client.searchIdentitiesAsync(user.descriptor);
    // const identity = identities && identities[0];
    // console.log(identities);
    // return identity;
    console.log(user);
    return undefined;
  }
}
export default WorkItemService;
