import { CoreRestClient } from '../Core';
import { GitRestClient } from '../Git';
import { WikiRestClient } from '../Wiki';
import { WorkItemTrackingRestClient } from '../WorkItemTracking';
import { WorkItemTrackingProcessRestClient } from '../WorkItemTrackingProcess';

export function getClient(clientClass: any) {
  switch (new clientClass().TYPE) {
    case 'CoreRestClient':
      return new CoreRestClient({}) as any;
    case 'WikiRestClient':
      return new WikiRestClient({}) as any;
    case 'GitRestClient':
      return new GitRestClient({}) as any;
    case 'WorkItemTrackingProcessRestClient':
      return new WorkItemTrackingProcessRestClient({}) as any;
    case 'WorkItemTrackingRestClient':
      return new WorkItemTrackingRestClient({}) as any;
    default:
      throw new Error('Failed to get mock client' + new clientClass().TYPE);
  }
}
