import { createTheme, loadTheme } from '@fluentui/react';
import { appTheme } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { distinct, isDefined } from '@joachimdalen/azdevops-ext-core/CoreUtils';
import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { ErrorBoundary } from '@joachimdalen/azdevops-ext-core/ErrorBoundary';
import { ExtendedZeroData } from '@joachimdalen/azdevops-ext-core/ExtendedZeroData';
import { getHostUrl } from '@joachimdalen/azdevops-ext-core/HostUtils';
import { LoadingSection } from '@joachimdalen/azdevops-ext-core/LoadingSection';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { VersionDisplay } from '@joachimdalen/azdevops-ext-core/VersionDisplay';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import { WorkItemService } from '@joachimdalen/azdevops-ext-core/WorkItemService';
import {
  getWorkItemReferenceNameFromDisplayName,
  getWorkItemTypeDisplayName,
  getWorkTypeFromReferenceName
} from '@joachimdalen/azdevops-ext-core/WorkItemUtils';
import {
  WorkItem,
  WorkItemErrorPolicy,
  WorkItemType
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { IconSize } from 'azure-devops-ui/Icon';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { IFilterState } from 'azure-devops-ui/Utilities/Filter';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import cx from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';

import { chunk } from '../common/chunkUtil';
import { SlimErrorBoundary } from '../common/components/SlimErrorBoundary';
import { getWorkItemIdFromCriteriaId } from '../common/criteriaUtils';
import useCriteriaId from '../common/hooks/useCriteriaId';
import { getLocalItem, LocalStorageKeys, LocalStorageRawKeys } from '../common/localStorage';
import CriteriaService from '../common/services/CriteriaService';
import { CriteriaDocument, IAcceptanceCriteria, WorkItemTypeTagProps } from '../common/types';
import ColumnsPanel from './ColumnsPanel';
import CriteriaTree from './components/CriteriaTree';
import HubFilterBar from './components/HubFilterBar';
import SettingsPanel from './settings-panel/SettingsPanel';

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
  //  const { dispatch, state: workHubState } = useWorkHubContext();
  const [showPanel, togglePanel] = useBooleanToggle(false);
  const [showSettingsPanel, toggleSettingsPanel] = useBooleanToggle(false);
  const ref = useRef(null);
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
    // {
    //   id: 'columns',
    //   iconProps: { iconName: 'TripleColumnEdit' },
    //   subtle: true,
    //   disabled: !isActive,
    //   tooltipProps: {
    //     text: 'Configure columns'
    //   },
    //   onActivate: () => togglePanel()
    // },
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

  const [visibleDocuments, setVisibleDocuments] = useState<CriteriaDocument[]>([]);
  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);
  const [workItemTypes, setWorkItemTypes] = useState<WorkItemType[]>([]);

  const [completedStates, setCompletedStates] = useState<string[]>([]);

  useEffect(() => {
    async function initModule() {
      try {
        toggleLoadingData(true);
        loadTheme(createTheme(appTheme));
        await DevOps.init();
        getHostUrl(LocalStorageRawKeys.HostUrl);
        getHostUrl(LocalStorageRawKeys.HostUrlWithOrg, true);
        const loadedTypes = await workItemService.getWorkItemTypes();

        setWorkItemTypes(loadedTypes);
        const categories = ['Completed', 'Removed'];
        const completedStatesA = loadedTypes
          .flatMap(x => x.states.filter(x => categories.includes(x.category)).map(x => x.name))
          .filter(distinct);

        setCompletedStates(completedStatesA);

        WebLogger.information('Loaded work hub...');
        const result = await criteriaService.load(data => {
          setDocuments(data);

          const filter = getLocalItem<IFilterState>(LocalStorageKeys.FilterState);
          if (filter !== undefined && Object.keys(filter).length > 0) {
            applyFilter(filter, data);
          } else {
            setVisibleDocuments(data);
          }

          WebLogger.information('Set', data);
        });

        toggleLoadingData(false);
      } catch (error: any) {
        WebLogger.error('Failed to load acceptance criterias', error);
        setError(
          'Failed to load acceptance criterias. Please check the browser console and report any issues on GitHub. ' +
            error?.message
        );
      } finally {
        toggleLoadingData(false);
      }
    }

    initModule();
  }, []);

  useEffect(() => {
    if (criteriaId && !didShowPanel && documents.length > 0) {
      openCriteria(criteriaId);
      toggleDidShow(true);
    }
  }, [criteriaId, documents]);

  const criterias = useMemo(() => documents.flatMap(x => x.criterias), [documents]);
  const workItemIds = useMemo(() => documents.map(x => parseInt(x.id)), [documents]);

  const wiMap: Map<string, WorkItemTypeTagProps> = useMemo(() => {
    const mp = new Map<string, WorkItemTypeTagProps>();
    workItems
      .map(x => getWorkItemTypeDisplayName(x))
      .filter(isDefined)
      .filter(distinct)
      .map(y => {
        if (mp.has(y)) return;
        const refName = getWorkItemReferenceNameFromDisplayName(y, workItemTypes);
        if (refName === undefined) return;
        const t = getWorkTypeFromReferenceName(refName, workItemTypes);
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
      items = innerFilter(items, v => v.title.indexOf(title.value) > -1);
    }

    const state = filter['state'];

    if (state) {
      items = innerFilter(items, v => v.state.indexOf(state.value) > -1);
    }
    setVisibleDocuments(items);
  };

  const fields: string[] = ['System.Title', 'System.WorkItemType'];

  const getBatched = async (workItemIds: number[]) => {
    const batched = chunk(workItemIds, 175);
    const items: WorkItem[] = [];
    for (const batch of batched) {
      const wi = await workItemService.getWorkItems(
        batch,
        undefined,
        fields,
        WorkItemErrorPolicy.Omit
      );
      items.push(...wi);
    }

    return items;
  };
  useEffect(() => {
    async function load() {
      //TODO: This triggers on every change of the document array, we should check if it is different
      if (workItemIds.length > 0 && workItemIds.length !== workItems.length) {
        toggleLoadingWis(true);
        try {
          let wids = workItemIds;
          if (!getLocalItem(LocalStorageKeys.ShowCompletedWi)) {
            const res = await criteriaService.getActiveWorkItemIds(completedStates, workItemIds);
            wids = res.workItems.map(x => x.id);
          }

          const wi = await getBatched(wids);
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
    const document = documents.find(x => x.criterias.some(y => y.id === criteriaId));
    const criteria = document?.criterias.find(x => x.id === criteriaId);

    if (criteria === undefined) {
      await devOpsService.showToast('Failed to find criteria');
    } else {
      await criteriaService.showPanel(
        {
          criteriaId: criteria.id,
          workItemId: getWorkItemIdFromCriteriaId(criteria.id),
          canEdit: false,
          isReadOnly: true
        },
        criteria
      );
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

        <div className="page-content flex-row h-scroll-hidden flex-start full-height">
          <div className="flex-grow flex-column full-height">
            <div className="page-content-bottom">
              <div className="page-content-top">
                <ConditionalChildren renderChildren={isActive}>
                  <SlimErrorBoundary title="Error in filtering">
                    <HubFilterBar
                      criterias={criterias}
                      showFilter={showFilter}
                      onFilterChanged={filter => applyFilter(filter)}
                    />
                  </SlimErrorBoundary>
                </ConditionalChildren>
              </div>
            </div>

            <div
              className={cx('bolt-page-grey flex-row flex-start flex-grow v-scroll-auto', {
                'depth-8': workItems.length > 0
              })}
            >
              <ConditionalChildren renderChildren={loadingData || loadingWis}>
                <div className="flex-grow flex-column full-height padding-vertical-20">
                  <LoadingSection isLoading={true} text="Loading data..." />
                </div>
              </ConditionalChildren>
              <ConditionalChildren renderChildren={error !== undefined}>
                <div className="flex-grow flex-column full-height padding-vertical-20 zero-data-error">
                  <ExtendedZeroData
                    title={'Error'}
                    description={error}
                    icon={{ iconName: 'Error' }}
                    buttons={[]}
                  />
                </div>
              </ConditionalChildren>
              <ConditionalChildren renderChildren={isActive}>
                <ConditionalChildren renderChildren={workItems.length > 0 && documents.length > 0}>
                  <SlimErrorBoundary>
                    <CriteriaTree
                      workItems={workItems}
                      visibleDocuments={visibleDocuments}
                      documents={documents}
                      workItemTypes={wiMap}
                      onClick={async (workItemId: string, criteria: IAcceptanceCriteria) => {
                        await criteriaService.showPanel(
                          {
                            criteriaId: criteria.id,
                            workItemId,
                            isReadOnly: true,
                            canEdit: false
                          },
                          criteria
                        );
                      }}
                    />
                  </SlimErrorBoundary>
                </ConditionalChildren>

                <ConditionalChildren
                  renderChildren={workItems.length === 0 || documents.length === 0}
                >
                  <div className="flex-grow">
                    <ZeroData
                      className="no-criterias-loaded"
                      primaryText="No acceptance criterias"
                      secondaryText="Open a work item and add your first acceptance criteria"
                      iconProps={{ iconName: 'WorkItem' }}
                      imageAltText={''}
                    />
                  </div>
                </ConditionalChildren>
              </ConditionalChildren>
            </div>
          </div>
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
