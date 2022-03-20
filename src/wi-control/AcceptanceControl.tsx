import {
  CommandBar,
  createTheme,
  ICommandBarItemProps,
  loadTheme,
  Separator
} from '@fluentui/react';
import { appTheme, commandBarStyles } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { ActionResult } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { getHostUrl } from '@joachimdalen/azdevops-ext-core/HostUtils';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import {
  IWorkItemFormService,
  IWorkItemLoadedArgs,
  IWorkItemNotificationListener
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { ZeroData, ZeroDataActionType } from 'azure-devops-ui/ZeroData';
import React, { useEffect, useMemo, useState } from 'react';

import { CriteriaModalResult, DialogIds, IConfirmationConfig } from '../common/common';
import {
  getLocalItem,
  LocalStorageKeys,
  LocalStorageRawKeys,
  setLocalItem
} from '../common/localStorage';
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
        getHostUrl(LocalStorageRawKeys.HostUrl);
        await DevOps.ready();

        DevOps.register(DevOps.getContributionId(), provider);

        loadTheme(createTheme(appTheme));

        const formService = await DevOps.getService<IWorkItemFormService>(
          'ms.vss-work-web.work-item-form'
        );

        const id = await formService.getId();

        if (id !== 0) {
          await criteriaService.load(data => {
            if (data.length > 0) {
              WebLogger.trace('Setting data', data);
              setCriteriaDocument(data[0]);
            } else {
              setCriteriaDocument(undefined);
            }
          }, id.toString());
        }

        setLoading(false);

        DevOps.resize();
      } catch (error) {
        WebLogger.error('Failed to get project configuration', error);
      } finally {
        await DevOps.notifyLoadSucceeded();
        setLoading(false);
      }
    }

    initModule();
  }, []);

  const showPanel = async (
    criteria?: IAcceptanceCriteria,
    readOnly?: boolean,
    canEdit?: boolean,
    isCreate?: boolean
  ) => {
    const isRead = isReadOnly || readOnly;
    const config: CriteriaPanelConfig = {
      workItemId: workItemId.toString(),
      criteria: criteria,
      isReadOnly: isRead,
      canEdit: canEdit,
      onClose: async (result: CriteriaModalResult | undefined) => {
        if (result?.result === 'SAVE' && result.data) {
          const id = await devOpsService.getCurrentWorkItemId();
          if (id) {
            await criteriaService.createOrUpdate(
              id.toString(),
              result.data.criteria,
              true,
              result.data.details
            );
          }
          // TODO: How to send result when X is pressed
        } else if (result?.wasChanged || result === undefined) {
          await reload();
        }
      }
    };

    if (isCreate !== true || getLocalItem<boolean>(LocalStorageKeys.NewStateFlow)) {
      await criteriaService.showPanel(config);
    } else {
      const confirmConfig: IConfirmationConfig = {
        cancelButton: {
          text: 'Close'
        },
        doNotShowAgain: true,
        confirmButton: {
          text: 'Ok',
          primary: true
        },
        content: `Acceptance Criterias does not follow the same saving flow as work items. When adding, deleting or editing an acceptance criteria, it will be saved straight away. If you wish to revert changes to criterias, this must be done manually.`
      };
      await devOpsService.showDialog<ActionResult<boolean>, DialogIds>(
        DialogIds.ConfirmationDialog,
        {
          title: 'Working with acceptance criterias',
          onClose: async result => {
            if (result?.success) {
              if (result.message === 'DO_NOT_SHOW_AGAIN') {
                setLocalItem(LocalStorageKeys.NewStateFlow, true);
              }
            }
            await criteriaService.showPanel(config);
          },
          configuration: confirmConfig
        }
      );
    }
  };

  const _items: ICommandBarItemProps[] = useMemo(() => {
    return [
      {
        key: 'newItem',
        text: 'New Acceptance Criteria',
        cacheKey: 'myCacheKey',
        iconProps: { iconName: 'Add' },
        onClick: () => {
          showPanel(undefined, undefined, undefined, true);
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
        {/* <Spinner size={SpinnerSize.large} label="Loading acceptance criterias" /> */}
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
        <Surface background={SurfaceBackground.neutral}>
          <CriteriaView
            criteria={criteriaDocument}
            onEdit={onEdit}
            onApprove={onApprove}
            onDelete={onDelete}
          />
        </Surface>
      </ConditionalChildren>
    </div>
  );
};
export default AcceptanceControl;
