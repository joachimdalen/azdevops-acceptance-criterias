import { createTheme, loadTheme, Separator } from '@fluentui/react';
import {
  appTheme,
  DevOpsService,
  distrinct,
  getWorkItemReferenceNameFromDisplayName,
  getWorkItemTypeDisplayName,
  getWorkTypeFromReferenceName,
  isDefined,
  useBooleanToggle,
  VersionDisplay,
  webLogger,
  WorkItemService
} from '@joachimdalen/azdevops-ext-core';
import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Card } from 'azure-devops-ui/Card';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { IFilterState } from 'azure-devops-ui/Utilities/Filter';
import { useEffect, useMemo, useState } from 'react';

import { getCriteriaTitle } from '../common/common';
import { getLocalItem, LocalStorageKeys } from '../common/localStorage';
import CriteriaService from '../common/services/CriteriaService';
import { CriteriaDocument, IAcceptanceCriteria, WorkItemTypeTagProps } from '../common/types';
import ColumnsPanel from './ColumnsPanel';
import CriteriaTree from './components/CriteriaTree';
import HubFilterBar from './components/HubFilterBar';
import { useWorkHubContext } from './WorkHubContext';

const WorkHub = (): JSX.Element => {
  const [criteriaService, workItemService, devOpsService] = useMemo(
    () => [new CriteriaService(), new WorkItemService(), new DevOpsService()],
    []
  );
  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);
  const [visibleDocuments, setVisibleDocuments] = useState<CriteriaDocument[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, toggleFilter] = useBooleanToggle(true);
  const { dispatch, state: workHubState } = useWorkHubContext();
  const [showPanel, togglePanel] = useBooleanToggle(false);
  const commandBarItems: IHeaderCommandBarItem[] = [
    {
      id: 'refresh',
      text: 'Refresh',
      iconProps: { iconName: 'Refresh' },

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
      tooltipProps: {
        text: 'Show/Hide filter'
      },
      onActivate: () => toggleFilter()
    },
    {
      id: 'columns',
      iconProps: { iconName: 'TripleColumnEdit' },
      subtle: true,
      tooltipProps: {
        text: 'Configure columns'
      },
      onActivate: () => togglePanel()
    }
  ];
  useEffect(() => {
    async function initModule() {
      setLoading(true);
      loadTheme(createTheme(appTheme));
      await DevOps.init();
      const loadedTypes = await workItemService.getWorkItemTypes();
      const teams = await criteriaService.getUserTeams();

      dispatch({ type: 'SET_WI_TYPES', data: loadedTypes });
      dispatch({ type: 'SET_TEAMS', data: teams });

      webLogger.information('Loaded work hub...');
      const queryParams = await devOpsService.getQueryParameters();
      const result = await criteriaService.load(data => {
        setDocuments(data);

        const filter = getLocalItem<IFilterState>(LocalStorageKeys.FilterState);
        if (filter !== undefined && Object.keys(filter).length > 0) {
          console.log(filter);
          applyFilter(filter, data);
        } else {
          setVisibleDocuments(data);
        }

        webLogger.information('Set', data);
      });

      // if (result.success && result.data) {
      //   if (result.data.length > 0) {
      //     setDocuments(result.data);
      //     setVisibleDocuments(result.data);
      //   }
      // }
      setLoading(false);
    }

    initModule();
  }, []);

  const criterias = useMemo(() => documents.flatMap(x => x.criterias), [documents]);
  const workItemIds = useMemo(() => documents.map(x => parseInt(x.id)), [documents]);

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
    let items = innerDocuments !== undefined ? [...innerDocuments] : [...documents];
    if (Object.keys(filter).length === 0) {
      setVisibleDocuments(items);
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

    setVisibleDocuments(items);
  };

  useEffect(() => {
    async function load() {
      if (workItemIds.length > 0) {
        const wi = await workItemService.getWorkItems(workItemIds);
        setWorkItems(wi);
      }
    }
    load();
  }, [workItemIds]);

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page className="flex-grow">
        <ConditionalChildren renderChildren={!loading}>
          <Header
            commandBarItems={commandBarItems}
            title="Acceptance Criterias"
            titleSize={TitleSize.Large}
            description={<VersionDisplay moduleVersion={process.env.WORK_HUB_VERSION} />}
          />

          <div className="page-content flex-grow margin-top-8">
            <Separator />
            <HubFilterBar
              criterias={criterias}
              showFilter={showFilter}
              onFilterChanged={filter => applyFilter(filter)}
            />

            <Card className="margin-top-16" contentProps={{ contentPadding: false }}>
              <CriteriaTree
                criterias={visibleDocuments}
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
          </div>
        </ConditionalChildren>
        <ConditionalChildren renderChildren={showPanel}>
          <ColumnsPanel onClose={() => togglePanel()} />
        </ConditionalChildren>
      </Page>
    </Surface>
  );
};

export default WorkHub;
