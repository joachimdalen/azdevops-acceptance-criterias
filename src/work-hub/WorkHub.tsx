import { createTheme, loadTheme, Separator } from '@fluentui/react';
import {
  appTheme,
  DevOpsService,
  distrinct,
  ExtendedZeroData,
  getWorkItemReferenceNameFromDisplayName,
  getWorkItemTypeDisplayName,
  getWorkTypeFromReferenceName,
  isDefined,
  LoadingSection,
  useBooleanToggle,
  VersionDisplay,
  webLogger,
  WorkItemService
} from '@joachimdalen/azdevops-ext-core';
import { WorkItem, WorkItemErrorPolicy } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Card } from 'azure-devops-ui/Card';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { IconSize } from 'azure-devops-ui/Icon';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { IFilterState } from 'azure-devops-ui/Utilities/Filter';
import { useEffect, useMemo, useState } from 'react';

import { getCriteriaTitle } from '../common/common';
import useCriteriaId from '../common/hooks/useCriteriaId';
import { getLocalItem, LocalStorageKeys } from '../common/localStorage';
import CriteriaService from '../common/services/CriteriaService';
import { CriteriaDocument, IAcceptanceCriteria, WorkItemTypeTagProps } from '../common/types';
import ColumnsPanel from './ColumnsPanel';
import CriteriaTree from './components/CriteriaTree';
import HubFilterBar from './components/HubFilterBar';
import SettingsPanel from './SettingsPanel';
import { useWorkHubContext } from './WorkHubContext';

const WorkHub = (): JSX.Element => {
  const [criteriaService, workItemService, devOpsService] = useMemo(
    () => [new CriteriaService(), new WorkItemService(), new DevOpsService()],
    []
  );
  const criteriaId = useCriteriaId();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loadingData, toggleLoadingData] = useBooleanToggle();
  const [loadingWis, toggleLoadingWis] = useBooleanToggle();
  const [showFilter, toggleFilter] = useBooleanToggle(true);
  const [didShowPanel, toggleDidShow] = useBooleanToggle(false);
  const { dispatch, state: workHubState } = useWorkHubContext();
  const [showPanel, togglePanel] = useBooleanToggle(false);
  const [showSettingsPanel, toggleSettingsPanel] = useBooleanToggle(false);

  const [error, setError] = useState<string | undefined>();
  const isActive = !loadingData && !loadingWis && error === undefined;
  const commandBarItems: IHeaderCommandBarItem[] = [
    {
      id: 'refresh',
      text: 'Refresh',
      iconProps: { iconName: 'Refresh' },
      disabled: !isActive,
      onActivate: () => {
        criteriaService.load(undefined, undefined, true).then(res => {
          if (res.success) {
            devOpsService.showToast('Refreshed data');
          }
        });
      }
    },
    {
      id: 'filter',
      iconProps: { iconName: 'Filter' },
      subtle: true,
      disabled: !isActive,
      tooltipProps: {
        text: 'Show/Hide filter'
      },
      onActivate: () => toggleFilter()
    },
    {
      id: 'columns',
      iconProps: { iconName: 'TripleColumnEdit' },
      subtle: true,
      disabled: !isActive,
      tooltipProps: {
        text: 'Configure columns'
      },
      onActivate: () => togglePanel()
    },
    {
      id: 'settings',
      iconProps: { iconName: 'Settings' },
      subtle: true,
      important: true,
      disabled: !isActive,
      tooltipProps: {
        text: 'Open settings'
      },
      onActivate: () => toggleSettingsPanel()
    }
  ];
  useEffect(() => {
    async function initModule() {
      toggleLoadingData(true);
      loadTheme(createTheme(appTheme));
      await DevOps.init();
      const loadedTypes = await workItemService.getWorkItemTypes();
      const teams = await criteriaService.getUserTeams();

      dispatch({ type: 'SET_WI_TYPES', data: loadedTypes });
      dispatch({ type: 'SET_TEAMS', data: teams });

      webLogger.information('Loaded work hub...');
      const result = await criteriaService.load(data => {
        dispatch({ type: 'SET_DOCUMENTS', data: data });

        const filter = getLocalItem<IFilterState>(LocalStorageKeys.FilterState);
        if (filter !== undefined && Object.keys(filter).length > 0) {
          console.log(filter);
          applyFilter(filter, data);
        } else {
          dispatch({ type: 'SET_VISIBLE_DOCUMENTS', data: data });
        }

        webLogger.information('Set', data);
      });

      // if (result.success && result.data) {
      //   if (result.data.length > 0) {
      //     setDocuments(result.data);
      //     setVisibleDocuments(result.data);
      //   }
      // }

      toggleLoadingData(false);
    }

    initModule();
  }, []);

  useEffect(() => {
    if (criteriaId && !didShowPanel && workHubState.documents.length > 0) {
      openCriteria(criteriaId);
      toggleDidShow(true);
    }
  }, [criteriaId, workHubState.documents]);

  const criterias = useMemo(
    () => workHubState.documents.flatMap(x => x.criterias),
    [workHubState.documents]
  );
  const workItemIds = useMemo(
    () => workHubState.documents.map(x => parseInt(x.id)),
    [workHubState.documents]
  );

  const wiMap: Map<string, WorkItemTypeTagProps> = useMemo(() => {
    const mp = new Map<string, WorkItemTypeTagProps>();
    workItems
      .map(x => getWorkItemTypeDisplayName(x))
      .filter(isDefined)
      .filter(distrinct)
      .map(y => {
        if (mp.has(y)) return;
        const refName = getWorkItemReferenceNameFromDisplayName(y, workHubState.workItemTypes);
        if (refName === undefined) return;
        const t = getWorkTypeFromReferenceName(refName, workHubState.workItemTypes);
        const pro: WorkItemTypeTagProps = {
          iconSize: 16,
          iconUrl: t?.icon.url,
          type: t?.name
        };
        mp.set(y, pro);
      });

    return mp;
  }, [workItems]);

  const innerFilter = (
    items: CriteriaDocument[],
    predicate: (v: IAcceptanceCriteria) => boolean
  ) => {
    return items
      .map(x => {
        const crits = x.criterias.filter(predicate);

        if (crits.length === 0) return undefined;

        return {
          ...x,
          criterias: crits
        };
      })
      .filter(isDefined);
  };
  const applyFilter = (filter: IFilterState, innerDocuments?: CriteriaDocument[]) => {
    let items = innerDocuments !== undefined ? [...innerDocuments] : [...workHubState.documents];
    if (Object.keys(filter).length === 0) {
      dispatch({ type: 'SET_VISIBLE_DOCUMENTS', data: items });
      return;
    }

    const approvers = filter['approvers'];

    if (approvers && approvers.value.length > 0) {
      items = innerFilter(items, v => approvers.value.includes(v.requiredApprover?.entityId));
    }
    const typeVal = filter['type'];
    if (typeVal && typeVal.value.length > 0) {
      items = innerFilter(items, v => typeVal.value.includes(v.type));
    }
    const title = filter['title'];
    if (title) {
      items = innerFilter(items, v => (getCriteriaTitle(v) || '')?.indexOf(title.value) > -1);
    }

    const state = filter['state'];

    if (state) {
      items = innerFilter(items, v => v.state.indexOf(state.value) > -1);
    }
    dispatch({ type: 'SET_VISIBLE_DOCUMENTS', data: items });
  };

  const fields: string[] = ['System.Title', 'System.WorkItemType'];
  useEffect(() => {
    async function load() {
      toggleLoadingWis(true);
      if (workItemIds.length > 0) {
        try {
          const wi = await workItemService.getWorkItems(
            workItemIds,
            undefined,
            fields,
            WorkItemErrorPolicy.Omit
          );
          setWorkItems(wi);
        } catch (error: any) {
          setError(error?.message || 'Failed to load related work items');
        } finally {
          toggleLoadingWis(false);
        }
      }
    }
    load();
  }, [workItemIds]);

  const openCriteria = async (criteriaId: string) => {
    const document = workHubState.documents.find(x => x.criterias.some(y => y.id === criteriaId));
    const criteria = document?.criterias.find(x => x.id === criteriaId);

    if (criteria === undefined) {
      await devOpsService.showToast('Failed to find criteria');
    } else {
      await criteriaService.showPanel(criteria);
    }
  };

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page className="flex-grow">
        <Header
          commandBarItems={commandBarItems}
          title="Acceptance Criterias"
          titleSize={TitleSize.Large}
          description={<VersionDisplay moduleVersion={process.env.WORK_HUB_VERSION} />}
        />

        <div className="page-content flex-grow margin-top-8">
          <Separator />
          <LoadingSection isLoading={loadingData || loadingWis} text="Loading data..." />
          <ConditionalChildren renderChildren={error !== undefined}>
            <ExtendedZeroData
              title={'Error'}
              description={error}
              icon={{ iconName: 'Error', size: IconSize.large }}
              buttons={[]}
            />
          </ConditionalChildren>
          <ConditionalChildren renderChildren={isActive}>
            <HubFilterBar
              criterias={criterias}
              showFilter={showFilter}
              onFilterChanged={filter => applyFilter(filter)}
            />

            <Card className="margin-top-16" contentProps={{ contentPadding: false }}>
              <CriteriaTree
                workItems={workItems}
                workItemTypes={wiMap}
                onProcess={async (id: string, approved: boolean) => {
                  await criteriaService.processCriteria(id, approved);
                }}
                onClick={async (criteria: IAcceptanceCriteria) => {
                  await criteriaService.showPanel(criteria, true, false);
                }}
              />
            </Card>
          </ConditionalChildren>
        </div>

        <ConditionalChildren renderChildren={showPanel}>
          <ColumnsPanel onClose={() => togglePanel()} />
        </ConditionalChildren>
        <ConditionalChildren renderChildren={showSettingsPanel}>
          <SettingsPanel onClose={() => toggleSettingsPanel()} />
        </ConditionalChildren>
      </Page>
    </Surface>
  );
};

export default WorkHub;
