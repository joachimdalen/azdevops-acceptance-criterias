import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemLoadedArgs,
  IWorkItemNotificationListener
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';

class AcceptanceControlProvider implements IWorkItemNotificationListener {
  async onLoaded(args: IWorkItemLoadedArgs): Promise<void> {
    console.log(`onLoaded`, args);
  }
  onFieldChanged(args: IWorkItemFieldChangedArgs): void {
    console.log(`onFieldChanged`, args);
  }
  onSaved(args: IWorkItemChangedArgs): void {
    console.log(`onSaved`, args);
  }
  onRefreshed(args: IWorkItemChangedArgs): void {
    console.log(`onRefreshed`, args);
  }
  onReset(args: IWorkItemChangedArgs): void {
    console.log(`onReset`, args);
  }
  onUnloaded(args: IWorkItemChangedArgs): void {
    console.log(`onUnloaded`, args);
  }
}

export default AcceptanceControlProvider;
