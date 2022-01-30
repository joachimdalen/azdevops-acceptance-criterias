import {
  CommandBar,
  createTheme,
  ICommandBarItemProps,
  loadTheme,
  Separator
} from '@fluentui/react';
import {
  appTheme,
  distrinct,
  distrinctBy,
  getWorkItemReferenceNameFromDisplayName,
  getWorkItemTypeDisplayName,
  getWorkTypeFromReferenceName,
  IInternalIdentity,
  isDefined,
  VersionDisplay,
  webLogger,
  WorkItemService
} from '@joachimdalen/azdevops-ext-core';
import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Card } from 'azure-devops-ui/Card';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { IFilterState } from 'azure-devops-ui/Utilities/Filter';
import { useEffect, useMemo, useState } from 'react';

import { getCriteriaTitle } from '../common/common';
import { getLocalItem, LocalStorageKeys } from '../common/localStorage';
import CriteriaService from '../common/services/CriteriaService';
import { CriteriaDocument, IAcceptanceCriteria, WorkItemTypeTagProps } from '../common/types';
import CriteriaTree from './components/CriteriaTree';
import HubFilterBar from './components/HubFilterBar';
import { useWorkHubContext } from './WorkHubContext';

const WorkHub = (): JSX.Element => {
  const [criteriaService, workItemService] = useMemo(
    () => [new CriteriaService(), new WorkItemService()],
    []
  );
  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);
  const [visibleDocuments, setVisibleDocuments] = useState<CriteriaDocument[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const { dispatch, state: workHubState } = useWorkHubContext();
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
      const result = await criteriaService.load(data => {
        setDocuments(data);

        const filter = getLocalItem<IFilterState>(LocalStorageKeys.FilterState);
        if (filter !== undefined && Object.keys(filter).length > 0) {
          console.log(filter);
          applyFilter(filter);
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
  const applyFilter = (filter: IFilterState) => {
    let items = [...documents];

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

  const _items: ICommandBarItemProps[] = useMemo(() => {
    return [
      {
        key: 'newItem',
        text: 'New Acceptance Criteria',
        cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
        iconProps: { iconName: 'Add' },
        onClick: () => {
          console.log('');
        }
      }
    ];
  }, []);

  const _farItems: ICommandBarItemProps[] = useMemo(() => {
    return [
      {
        key: 'columnOptions',
        text: 'Columns',
        cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
        iconProps: { iconName: 'ColumnOptions' },
        onClick: () => {
          console.log('');
        }
      },
      {
        key: 'filter',
        text: 'Filter',
        cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
        iconProps: { iconName: 'Filter' },
        iconOnly: true,
        onClick: () => {
          setShowFilter(prev => !prev);
        }
      }
    ];
  }, []);

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page className="flex-grow">
        <ConditionalChildren renderChildren={!loading}>
          <Header
            title="Acceptance Criterias"
            titleSize={TitleSize.Large}
            description={<VersionDisplay moduleVersion={process.env.WORK_HUB_VERSION} />}
          />

          <div className="page-content flex-grow margin-top-8">
            <CommandBar items={_items} farItems={_farItems} />
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
                onApprove={async (id: string) => {
                  await criteriaService.approveCriteria(id);
                }}
              />
            </Card>
          </div>
        </ConditionalChildren>
      </Page>
    </Surface>
  );
};

export default WorkHub;
