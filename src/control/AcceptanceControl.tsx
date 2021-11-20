import {
  CommandBar,
  createTheme,
  ICommandBarItemProps,
  IPersonaProps,
  loadTheme,
  Separator
} from '@fluentui/react';
import { IHostPageLayoutService } from 'azure-devops-extension-api';
import { IVssIdentityService } from 'azure-devops-extension-api/Identities';
import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemFormService,
  IWorkItemLoadedArgs,
  WorkItemTrackingServiceIds
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import React, { useEffect, useRef, useState } from 'react';

import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../common/common';
import { WorkItemFieldNames } from '../common/constants';
import { appTheme, commandBarStyles } from './azure-devops-theme';
import CriteriaList from './components/CriteriaList';

const AcceptanceControl = (): React.ReactElement => {
  const [rows, setRows] = useState<IAcceptanceCriteria[]>([
    {
      id: '1',
      order: 1,
      title: 'User must be able to accept terms - NEWd',
      description: '',
      area: 'Technical',
      state: AcceptanceCriteriaState.Approved
    },
    {
      id: '2',
      order: 2,
      title: 'User must be able to accept terms',
      description: '',
      area: 'Technical',
      state: AcceptanceCriteriaState.Pending
    },
    {
      id: '3',
      order: 3,
      title: 'User must be able to accept terms',
      description: '',
      area: 'Technical',
      state: AcceptanceCriteriaState.Rejected
    }
  ]);

  const provider = () => {
    return {
      // Called when the active work item is modified
      onFieldChanged: (args: IWorkItemFieldChangedArgs) => {
        console.log(`onFieldChanged`, args);
      },

      // Called when a new work item is being loaded in the UI
      onLoaded: async (args: IWorkItemLoadedArgs) => {
        console.log(`onLoaded`, args);

        // const service = new WorkItemService();
        // const wit = await service.getWorkItem(args.id);
        // console.log(wit);
        const workItemFormService = await DevOps.getService<IWorkItemFormService>(
          WorkItemTrackingServiceIds.WorkItemFormService
        );

        const fields = await workItemFormService.getFields();
        console.log(fields);

        const result = await workItemFormService.setFieldValue(
          WorkItemFieldNames.Status,
          'Accepted'
        );
        console.log('result', result);
      },

      // Called when the active work item is being unloaded in the UI
      onUnloaded: (args: IWorkItemChangedArgs) => {
        console.log(`onUnloaded`, args);
      },

      // Called after the work item has been saved
      onSaved: async (args: IWorkItemChangedArgs) => {
        console.log(`onSaved`, args);
      },

      // Called when the work item is reset to its unmodified state (undo)
      onReset: (args: IWorkItemChangedArgs) => {
        console.log(`onReset`, args);
      },

      // Called when the work item has been refreshed from the server
      onRefreshed: (args: IWorkItemChangedArgs) => {
        console.log(`onRefreshed`, args);
      }
    };
  };

  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init().then(async () => {
      console.log('Loaded...');
      DevOps.register(DevOps.getContributionId(), provider);
    });
  }, []);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Resize');
    DevOps.resize(ref.current?.scrollWidth || 200, ref.current?.scrollHeight || 600);
  });

  const getPersona = async (): Promise<IPersonaProps> => {
    const workItemFormService = await DevOps.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );

    const idService = await DevOps.getService<IVssIdentityService>(
      'ms.vss-features.identity-service'
    );

    const assign = await workItemFormService.getFieldValue('System.AssignedTo', {
      returnOriginalValue: false
    });

    const email = getEmail(assign as string);

    if (email) {
      const id = await idService.searchIdentitiesAsync(email);
    }

    return {};
  };

  const getEmail = (identifier: string) => {
    const regex = /^.+<(?<email>.+)>$/;
    const matches = regex.exec(identifier);
    return matches?.groups?.email;
  };
  const _items: ICommandBarItemProps[] = [
    {
      key: 'newItem',
      text: 'New Acceptance Criteria',
      cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
      iconProps: { iconName: 'Add' },
      onClick: () => {
        DevOps.getService<IHostPageLayoutService>('ms.vss-features.host-page-layout-service').then(
          dialogService => {
            const id = DevOps.getExtensionContext().id + '.acceptance-criterias-panel';
            console.log(id);
            dialogService.openCustomDialog(id, {
              title: 'Message dialog',
              configuration: {
                resizable: true
              },
              onClose: (result: IAcceptanceCriteria | undefined) => {
                setRows(prev => [...prev, result as IAcceptanceCriteria]);
                console.log(result);
              }
            });
          }
        );
      }
    }
  ];
  return (
    <div style={{ height: '100%', width: '100%' }} ref={ref}>
      <div>
        <CommandBar styles={commandBarStyles} items={_items} />
        <Separator />
      </div>
      <CriteriaList rows={rows} />
    </div>
  );
};
export default AcceptanceControl;
