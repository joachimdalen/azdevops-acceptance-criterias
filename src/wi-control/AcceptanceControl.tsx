import {
  CommandBar,
  createTheme,
  ICommandBarItemProps,
  loadTheme,
  Separator,
  Spinner,
  SpinnerSize
} from '@fluentui/react';
import { appTheme, commandBarStyles, DevOpsService } from '@joachimdalen/azdevops-ext-core';
import { IWorkItemFormService } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import React, { useEffect, useMemo, useState } from 'react';

import { CriteriaModalResult, PanelIds } from '../common/common';
import { CriteriaDocument } from '../common/models/CriteriaDocument';
import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../common/models/IAcceptanceCriteria';
import CriteriaService from '../common/services/CriteriaService';
import CriteriaList from '../common/components/CriteriaList';

const AcceptanceControl = (): React.ReactElement => {
  const [devOpsService, criteriaService] = useMemo(
    () => [new DevOpsService(), new CriteriaService()],
    []
  );
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

  useEffect(() => {
    loadTheme(createTheme(appTheme));

    async function initModule() {
      await DevOps.init();
      const formService = await DevOps.getService<IWorkItemFormService>(
        'ms.vss-work-web.work-item-form'
      );

      const id = await formService.getId();

      const result = await criteriaService.load(id.toString());

      console.log(result);
      if (result.success && result.data) {
        if (result.data.length > 0) {
          console.log('setting', result.data[0]);
          setCriteriaDocument(result.data[0]);
        }
      }

      setLoading(false);
    }

    initModule();
  }, []);

  const showPanel = async (criteria?: IAcceptanceCriteria) => {
    await devOpsService.showPanel<CriteriaModalResult | undefined, PanelIds>(
      PanelIds.CriteriaPanel,
      {
        title: 'Acceptance Criteria',
        size: 2,
        configuration: {
          criteria
        },
        onClose: async (result: CriteriaModalResult | undefined) => {
          console.log('Close result', result);
          if (result?.result === 'SAVE' && result.criteria) {
            console.log(result.criteria);
            const formService = await DevOps.getService<IWorkItemFormService>(
              'ms.vss-work-web.work-item-form'
            );
            const id = await formService.getId();
            await criteriaService.createOrUpdate(id.toString(), result.criteria);
          }
        }
      }
    );
  };

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
        showPanel();
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
    <div className="acceptance-control-container">
      <div>
        <CommandBar styles={commandBarStyles} items={_items} />
        <Separator />
      </div>
      <CriteriaList rows={criteriaDocument?.criterias || []} />
    </div>
  );
};
export default AcceptanceControl;
