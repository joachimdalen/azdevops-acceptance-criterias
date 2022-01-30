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
  appTheme,
  commandBarStyles,
  DevOpsService,
  webLogger
} from '@joachimdalen/azdevops-ext-core';
import { IMessageDialogOptions } from 'azure-devops-extension-api';
import { IWorkItemFormService } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import React, { useEffect, useMemo, useState } from 'react';

import { CriteriaModalResult, PanelIds } from '../common/common';
import CriteriaService from '../common/services/CriteriaService';
import { CriteriaDocument, IAcceptanceCriteria } from '../common/types';
import CriteriaView from './components/CriteriaView';
import WorkItemListener from './WorkItemListener';

const AcceptanceControl = (): React.ReactElement => {
  const [devOpsService, criteriaService] = useMemo(
    () => [new DevOpsService(), new CriteriaService()],
    []
  );
  const [criteriaDocument, setCriteriaDocument] = useState<CriteriaDocument>();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<IAcceptanceCriteria[]>();

  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        webLogger.information('Loading rule presets panel...');
        await DevOps.ready();

        DevOps.register(DevOps.getContributionId(), new WorkItemListener());

        loadTheme(createTheme(appTheme));

        const formService = await DevOps.getService<IWorkItemFormService>(
          'ms.vss-work-web.work-item-form'
        );

        const id = await formService.getId();

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
          if (result?.result === 'SAVE' && result.criteria) {
            const id = await devOpsService.getCurrentWorkItemId();
            if (id) await criteriaService.createOrUpdate(id.toString(), result.criteria);
          }
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

  const [viewMode, setViewMode] = useState<'table' | 'list'>('list');

  const _farItems: ICommandBarItemProps[] = useMemo(() => {
    const items: ICommandBarItemProps[] = [
      {
        key: 'showTable',
        text: 'Show Edit',
        cacheKey: 'myCacheKey',
        iconProps: { iconName: 'Table' },
        checked: viewMode === 'table',
        onClick: () => {
          DevOps.resize();
        }
      },
      {
        key: 'showProcess',
        text: 'Show Process View',
        cacheKey: 'myCacheKey',
        iconProps: { iconName: 'List' },
        checked: viewMode === 'list',
        onClick: () => {
          setViewMode('list');
        }
      }
    ];
    return items;
  }, [viewMode]);

  if (loading) {
    return (
      <div className="acceptance-control-loader">
        <Spinner size={SpinnerSize.large} label="Loading acceptance criterias" />
      </div>
    );
  }

  return (
    <div className="acceptance-control-container">
      <div>
        <CommandBar styles={commandBarStyles} items={_items} farItems={_farItems} />
        <Separator />
      </div>

      <CriteriaView
        criteria={criteriaDocument}
        onApprove={async (id: string, complete: boolean) => {
          await criteriaService.toggleCompletion(id, complete);
        }}
        onDelete={async (id: string) => {
          await devOpsService.showConfirmationDialog({
            title: 'Delete criteria?',
            cancelText: 'Cancel',
            lightDismiss: false,
            okText: 'Delete',
            showCancel: true,
            onClose: async (result: boolean | undefined) => {
              if (result) {
                await criteriaService.deleteCriteria(id);
              }
            }
          });
        }}
      />
    </div>
  );
};
export default AcceptanceControl;
