import {
  CommandBar,
  createTheme,
  ICommandBarItemProps,
  loadTheme,
  Separator,
  Spinner,
  SpinnerSize
} from '@fluentui/react';
import { appTheme, commandBarStyles } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { ActionResult } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import {
  IWorkItemFormService,
  IWorkItemLoadedArgs,
  IWorkItemNotificationListener
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ZeroData, ZeroDataActionType } from 'azure-devops-ui/ZeroData';
import React, { useEffect, useMemo, useState } from 'react';

import { CriteriaModalResult, DialogIds, IConfirmationConfig } from '../common/common';
import { getLocalItem, LocalStorageKeys, setLocalItem } from '../common/localStorage';
import CriteriaService from '../common/services/CriteriaService';
import {
  AcceptanceCriteriaState,
  CriteriaDocument,
  CriteriaPanelConfig,
  IAcceptanceCriteria
} from '../common/types';
import CriteriaView from './components/CriteriaView';

const AcceptanceControl = (): React.ReactElement => {
  const [devOpsService, criteriaService] = useMemo(
    () => [new DevOpsService(), new CriteriaService()],
    []
  );
  const [criteriaDocument, setCriteriaDocument] = useState<CriteriaDocument>();
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setReadOnly] = useState<boolean>(false);
  const [isNew, setIsNew] = useState<boolean>(true);
  const [workItemId, setWorkItemId] = useState<number>(-1);

  const provider = useMemo(() => {
    const listener: Partial<IWorkItemNotificationListener> = {
      onLoaded: async function (workItemLoadedArgs: IWorkItemLoadedArgs): Promise<void> {
        setReadOnly(workItemLoadedArgs.isReadOnly);
        setIsNew(workItemLoadedArgs.isNew);
        setWorkItemId(workItemLoadedArgs.id);
      }
    };
    return listener;
  }, []);

  const reload = async () => {
    const formService = await DevOps.getService<IWorkItemFormService>(
      'ms.vss-work-web.work-item-form'
    );
    const id = await formService.getId();
    await criteriaService.load(undefined, id.toString(), true);
    devOpsService.showToast('Refreshed data');
  };

  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        WebLogger.information('Loading rule presets panel...');
        await DevOps.ready();

        DevOps.register(DevOps.getContributionId(), provider);

        loadTheme(createTheme(appTheme));

        const formService = await DevOps.getService<IWorkItemFormService>(
          'ms.vss-work-web.work-item-form'
        );

        const id = await formService.getId();

        if (id !== 0) {
          const loadResult = await criteriaService.load(data => {
            if (data.length > 0) {
              WebLogger.trace('Setting data', data);
              setCriteriaDocument(data[0]);
            }
          }, id.toString());

          if (loadResult.success && loadResult.data) {
            if (loadResult.data.length > 0) {
              WebLogger.trace('setting', loadResult.data[0]);
              setCriteriaDocument(loadResult.data[0]);
            }
          }
        }

        setLoading(false);

        await DevOps.notifyLoadSucceeded();
        DevOps.resize();
      } catch (error) {
        WebLogger.error('Failed to get project configuration', error);
      } finally {
        setLoading(false);
      }
    }

    initModule();
  }, []);

  const showPanel = async (
    criteria?: IAcceptanceCriteria,
    readOnly?: boolean,
    canEdit?: boolean
  ) => {
    const isRead = isReadOnly || readOnly;
    const config: CriteriaPanelConfig = {
      workItemId: workItemId.toString(),
      criteria: criteria,
      isReadOnly: isRead,
      canEdit: canEdit,
      onClose: async (result: CriteriaModalResult | undefined) => {
        console.log('cr', result);
        if (result?.result === 'SAVE' && result.data) {
          const id = await devOpsService.getCurrentWorkItemId();
          console.log(result);
          if (id) {
            await criteriaService.createOrUpdate(
              id.toString(),
              result.data.criteria,
              true,
              result.data.details
            );
          }
        }
      }
    };

    await criteriaService.showPanel(config);
  };

  const _items: ICommandBarItemProps[] = useMemo(() => {
    return [
      {
        key: 'newItem',
        text: 'New Acceptance Criteria',
        cacheKey: 'myCacheKey',
        iconProps: { iconName: 'Add' },
        onClick: () => {
          showPanel();
        }
      },
      {
        key: 'refresh',
        text: 'Refresh',
        cacheKey: 'myCacheKey',
        iconProps: { iconName: 'Refresh' },
        onClick: async () => {
          await reload();
        }
      }
    ];
  }, []);

  if (loading) {
    return (
      <div className="acceptance-control-loader">
        <Spinner size={SpinnerSize.large} label="Loading acceptance criterias" />
      </div>
    );
  }

  // if (isNew) {
  //   return (
  //     <div className="acceptance-control-container">
  //       <ZeroData
  //         imageAltText={''}
  //         iconProps={{ iconName: 'Save' }}
  //         secondaryText="Save the work item to start adding acceptance criterias"
  //       />
  //     </div>
  //   );
  // }

  async function onApprove(criteria: IAcceptanceCriteria, complete: boolean) {
    if (
      [AcceptanceCriteriaState.Approved, AcceptanceCriteriaState.Rejected].includes(
        criteria.state
      ) &&
      complete === false
    ) {
      if (getLocalItem<boolean>(LocalStorageKeys.UndoCompleted)) {
        await criteriaService.toggleCompletion(criteria.id, complete);
      } else {
        const config: IConfirmationConfig = {
          cancelButton: {
            text: 'No'
          },
          doNotShowAgain: true,
          confirmButton: {
            text: 'Yes',
            primary: true
          },
          content: `This criteria has been fully processed. If you undo the completion state of this it will be reset and the criteria will need to be approved or rejected again. Proceed?`
        };
        await devOpsService.showDialog<ActionResult<boolean>, DialogIds>(
          DialogIds.ConfirmationDialog,
          {
            title: 'Undo completed criteria?',
            onClose: async result => {
              if (result?.success) {
                if (result.message === 'DO_NOT_SHOW_AGAIN') {
                  setLocalItem(LocalStorageKeys.UndoCompleted, true);
                }
                await criteriaService.toggleCompletion(criteria.id, complete);
              }
            },
            configuration: config
          }
        );
      }
    } else {
      await criteriaService.toggleCompletion(criteria.id, complete);
    }
  }
  async function onDelete(id: string) {
    const config: IConfirmationConfig = {
      cancelButton: {
        text: 'Cancel'
      },
      confirmButton: {
        text: 'Delete',
        danger: true,
        iconProps: {
          iconName: 'Delete'
        }
      },
      content: `Are you sure you want to delete the criteria. This can not be undone.`
    };
    await devOpsService.showDialog<boolean, DialogIds>(DialogIds.ConfirmationDialog, {
      title: 'Delete criteria?',
      onClose: async result => {
        if (result) {
          await criteriaService.deleteCriteria(id);
        }
      },
      configuration: config
    });
  }

  async function onEdit(criteria: IAcceptanceCriteria, readOnly?: boolean, canEdit?: boolean) {
    await showPanel(criteria, readOnly, canEdit);
  }

  return (
    <div className="acceptance-control-container">
      <div>
        <CommandBar styles={commandBarStyles} items={_items} />
        <Separator />
      </div>

      <ConditionalChildren renderChildren={criteriaDocument === undefined}>
        <ZeroData
          imageAltText={''}
          secondaryText="No criterias added"
          actionType={ZeroDataActionType.ctaButton}
          actionText="New Acceptance Criteria"
          onActionClick={() => {
            showPanel();
          }}
        />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={criteriaDocument !== undefined}>
        <CriteriaView
          criteria={criteriaDocument}
          onEdit={onEdit}
          onApprove={onApprove}
          onDelete={onDelete}
        />
      </ConditionalChildren>
    </div>
  );
};
export default AcceptanceControl;
