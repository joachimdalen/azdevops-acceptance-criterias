import {
  CommandBar,
  createTheme,
  ICommandBarItemProps,
  loadTheme,
  Separator,
  Spinner,
  SpinnerSize
} from '@fluentui/react';
import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemFormService,
  IWorkItemLoadedArgs,
  WorkItemTrackingServiceIds
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { ZeroData, ZeroDataActionType } from 'azure-devops-ui/ZeroData';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../common/common';
import { DevOpsError } from '../common/DevOpsError';
import { CriteriaDocument } from '../common/models/CriteriaDocument';
import CriteriaNavigationService from '../common/services/CriteriaNavigationService';
import { StorageService } from '../common/services/StorageService';
import WorkItemService from '../common/services/WorkItemService';
import { appTheme, commandBarStyles } from './azure-devops-theme';
import CriteriaList from './components/CriteriaList';

const AcceptanceControl = (): React.ReactElement => {
  const criteriaService = useMemo(() => new CriteriaNavigationService(), []);
  const [criteriaDocument, setCriteriaDocument] = useState<CriteriaDocument>();
  const [loading, setLoading] = useState(true);
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

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init().then(async () => {
      console.log('Loaded...');
      //  DevOps.register(DevOps.getContributionId(), provider);

      //TMP
      setLoading(false);
    });
  }, []);

  // useEffect(() => {
  //   DevOps.resize();
  // }, [ref, rows]);

  const _items: ICommandBarItemProps[] = [
    {
      key: 'newItem',
      text: 'New Acceptance Criteria',
      cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
      iconProps: { iconName: 'Add' },
      onClick: () => {
        criteriaService.showCriteriaModal(res => {
          if (res.result === 'SAVE') {
            if (res.criteria) {
              DevOps.getService<IWorkItemFormService>('ms.vss-work-web.work-item-form').then(
                witService => {
                  witService.getId().then(id => {
                    const storageService = new StorageService();
                    const workItemService = new WorkItemService();
                    const document = workItemService.createNewDocument(id, [res.criteria!]);
                    console.log(document);
                  });
                }
              );
              const items = [...rows, res.criteria];
              setRows(items);
            }
          }
          console.log(res);
        });
      }
    }
  ];

  if (loading) {
    return (
      <div className="acceptance-control-loader">
        <Spinner size={SpinnerSize.large} label="Loading acceptance criterias" />
      </div>
    );
  }

  // if (!loading && criteriaDocument === undefined) {
  //   return (
  //     <div className="flex-grow">
  //       <ZeroData
  //         className="flex-self-center"
  //         imageAltText=""
  //         secondaryText="No acceptance criterias have been added"
  //         iconProps={{ iconName: 'Add' }}
  //         actionText="Add acceptance criteria"
  //         actionType={ZeroDataActionType.ctaButton}
  //         onActionClick={() => {
  //           criteriaService.showCriteriaModal(res => {
  //             if (res.result === 'SAVE') {
  //               if (res.criteria) {
  //                 const items = [...rows, res.criteria];
  //                 setRows(items);
  //               }
  //             }
  //             console.log(res);
  //           });
  //         }}
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className="acceptance-control-container" ref={ref}>
      <div>
        <CommandBar styles={commandBarStyles} items={_items} />
        <Separator />
      </div>
      <CriteriaList rows={rows} />
    </div>
  );
};
export default AcceptanceControl;
