import { webLogger } from '@joachimdalen/azdevops-ext-core';
import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemLoadedArgs,
  IWorkItemNotificationListener
} from 'azure-devops-extension-api/WorkItemTracking';

class WorkItemListener implements IWorkItemNotificationListener {
  async onLoaded(args: IWorkItemLoadedArgs): Promise<void> {
    webLogger.information('Loaded');
  }
  onFieldChanged(args: IWorkItemFieldChangedArgs): void {}
  async onSaved(args: IWorkItemChangedArgs): Promise<void> {}
  onRefreshed(args: IWorkItemChangedArgs): void {}
  onReset(args: IWorkItemChangedArgs): void {}
  onUnloaded(args: IWorkItemChangedArgs): void {}
}

export default WorkItemListener;
