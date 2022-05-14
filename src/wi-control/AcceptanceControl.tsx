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
import { ExtendedZeroData } from '@joachimdalen/azdevops-ext-core/ExtendedZeroData';
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
import { CriteriaDocument, CriteriaPanelConfig, IAcceptanceCriteria } from '../common/types';
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
  const [error, setError] = useState<string | undefined>();

  const provider = useMemo(() => {
    const listener: Partial<IWorkItemNotificationListener> = {
      onLoaded: async function (workItemLoadedArgs: IWorkItemLoadedArgs): Promise<void> {
        setReadOnly(workItemLoadedArgs.isReadOnly);
        setIsNew(workItemLoadedArgs.isNew);
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
        loadTheme(createTheme(appTheme));

        getHostUrl(LocalStorageRawKeys.HostUrl);
        getHostUrl(LocalStorageRawKeys.HostUrlWithOrg, true);
        await DevOps.ready();
        DevOps.register(DevOps.getContributionId(), provider);

        const id = await devOpsService.getCurrentWorkItemId();

        if (id !== undefined && id !== 0) {
          await criteriaService.load(data => {
            if (data.length > 0) {
              setCriteriaDocument(data[0]);
            } else {
              setCriteriaDocument(undefined);
            }
          }, id.toString());
        }

        setLoading(false);
      } catch (error: any) {
        WebLogger.error('Failed to load acceptance criterias', error);
        setError(
          'Failed to load acceptance criterias. Please check the browser console and report any issues on GitHub. ' +
            error?.message
        );
      } finally {
        await DevOps.notifyLoadSucceeded();
        setLoading(false);
        if (window.location.search.indexOf('isControl=true') >= 0) {
          console.log('Refreshing...');
          DevOps.resize();
        }
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
    const workItemId = await devOpsService.getCurrentWorkItemId();

    if (workItemId === undefined) {
      await devOpsService.showToast('Failed to show criteria. ');
      return;
    }

    const isRead = isReadOnly || readOnly;
    const config: CriteriaPanelConfig = {
      workItemId: workItemId.toString(),
      criteriaId: criteria?.id,
      isReadOnly: isRead,
      canEdit: canEdit,
      onClose: async (result: CriteriaModalResult | undefined) => {
        try {
          if (result?.result === 'SAVE' && result.data) {
            const id = await devOpsService.getCurrentWorkItemId();
            if (id) {
              await criteriaService.createOrUpdate(
                id.toString(),
                result.data.criteria,
                true,
                false,
                result.data.details
              );
            }
            // TODO: How to send result when X is pressed
          } else if (result?.wasChanged || result === undefined) {
            await reload();
          }
        } catch (error: any) {
          devOpsService.showToast(error.message);
        }
      }
    };

    if (isCreate !== true || getLocalItem<boolean>(LocalStorageKeys.NewStateFlow)) {
      await criteriaService.showPanel(config, criteria);
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
            await criteriaService.showPanel(config, criteria);
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

  if (isNew) {
    return (
      <div className="acceptance-control-container">
        <ZeroData
          imageAltText={''}
          iconProps={{ iconName: 'Save' }}
          secondaryText="Save the work item to start adding acceptance criterias"
        />
      </div>
    );
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

  if (error !== undefined) {
    return (
      <div className="padding-vertical-20 zero-data-error">
        <ExtendedZeroData
          title={'Error'}
          description={error}
          icon={{ iconName: 'Error' }}
          buttons={[]}
        />
      </div>
    );
  }

  return (
    <div className="flex-grow">
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
            showPanel(undefined, undefined, undefined, true);
          }}
        />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={criteriaDocument !== undefined}>
        <Surface background={SurfaceBackground.neutral}>
          <CriteriaView criteria={criteriaDocument} onEdit={onEdit} onDelete={onDelete} />
        </Surface>
      </ConditionalChildren>
    </div>
  );
};
export default AcceptanceControl;
