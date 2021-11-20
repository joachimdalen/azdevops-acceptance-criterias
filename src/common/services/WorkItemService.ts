import { getClient } from 'azure-devops-extension-api';
import {
  FieldType,
  FieldUsage,
  WorkItem,
  WorkItemField,
  WorkItemTrackingRestClient
} from 'azure-devops-extension-api/WorkItemTracking';

class WorkItemService {
  public async getWorkItem(id: number): Promise<WorkItem> {
    const client = getClient(WorkItemTrackingRestClient);
    const wit = await client.getWorkItem(id);
    return wit;
  }
  public async getFields(): Promise<WorkItemField[]> {
    const client = getClient(WorkItemTrackingRestClient);
    const fields = await client.getFields();
    return fields;
  }
  public async createField(): Promise<WorkItemField> {
    const client = getClient(WorkItemTrackingRestClient);
    const payload: Partial<WorkItemField> = {
      type: FieldType.String,
      usage: FieldUsage.WorkItem,
      canSortBy: true,
      isQueryable: true,
      name: 'Advanced Acceptance Criteria Status',
      referenceName: 'Jd.AdvancedAcceptanceCriteria.Status'
    };
    const data = await client.createField(payload as any);
    console.log(data);
    return data;
  }
}
export default WorkItemService;
