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
  ActionResult,
  appTheme,
  commandBarStyles,
  DevOpsService,
  useBooleanToggle,
  webLogger
} from '@joachimdalen/azdevops-ext-core';
import {
  IWorkItemFormService,
  IWorkItemLoadedArgs,
  IWorkItemNotificationListener
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import React, { useEffect, useMemo, useState } from 'react';

import { CriteriaModalResult, DialogIds, IConfirmationConfig } from '../common/common';
import { getLocalItem, LocalStorageKeys, setLocalItem } from '../common/localStorage';
import CriteriaService from '../common/services/CriteriaService';
import { AcceptanceCriteriaState, CriteriaDocument, IAcceptanceCriteria } from '../common/types';
import CriteriaView from './components/CriteriaView';

const AcceptanceControl = (): React.ReactElement => {
  const [devOpsService, criteriaService] = useMemo(
    () => [new DevOpsService(), new CriteriaService()],
    []
  );
  const [criteriaDocument, setCriteriaDocument] = useState<CriteriaDocument>();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<IAcceptanceCriteria[]>();
  const [isReadOnly, setReadOnly] = useState<boolean>(false);
  const [isNew, setIsNew] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useBooleanToggle();
  const provider = useMemo(() => {
    const listener: Partial<IWorkItemNotificationListener> = {
      onLoaded: async function (workItemLoadedArgs: IWorkItemLoadedArgs): Promise<void> {
        setReadOnly(workItemLoadedArgs.isReadOnly);
        setIsNew(workItemLoadedArgs.isNew);
      }
    };
    return listener;
  }, []);

  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        webLogger.information('Loading rule presets panel...');
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
              webLogger.trace('Setting data', data);
              setCriteriaDocument(data[0]);
            }
          }, id.toString());

          if (loadResult.success && loadResult.data) {
            if (loadResult.data.length > 0) {
              webLogger.trace('setting', loadResult.data[0]);
              setCriteriaDocument(loadResult.data[0]);
            }
          }
        }

        setLoading(false);

        await DevOps.notifyLoadSucceeded();
        DevOps.resize();
      } catch (error) {
        webLogger.error('Failed to get project configuration', error);
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

    await criteriaService.showPanel(
      criteria,
      isRead,
      canEdit,
      async (result: CriteriaModalResult | undefined) => {
        if (result?.result === 'SAVE' && result.criteria) {
          const id = await devOpsService.getCurrentWorkItemId();
          if (id) await criteriaService.createOrUpdate(id.toString(), result.criteria, true);
        }
      }
    );
  };

  // useEffect(() => {
  //   DevOps.resize();
  // }, [ref, rows]);

  const _items: ICommandBarItemProps[] = useMemo(() => {
    return [
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

  return (
    <div className="acceptance-control-container">
      <div>
        <CommandBar styles={commandBarStyles} items={_items} />
        <Separator />
      </div>

      <CriteriaView
        criteria={criteriaDocument}
        onEdit={async (criteria: IAcceptanceCriteria, readOnly?: boolean, canEdit?: boolean) => {
          await showPanel(criteria, readOnly, canEdit);
        }}
        onApprove={async (criteria: IAcceptanceCriteria, complete: boolean) => {
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
        }}
        onDelete={async (id: string) => {
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
          setShowConfirmation();
        }}
      />
    </div>
  );
};
export default AcceptanceControl;
