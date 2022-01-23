import { createTheme, loadTheme } from '@fluentui/react';
import {
  appTheme,
  getWorkItemReferenceName,
  getWorkItemTypeDisplayName,
  getWorkTypeFromReferenceName,
  isDefined,
  VersionDisplay,
  webLogger,
  WorkItemService
} from '@joachimdalen/azdevops-ext-core';
import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { Page } from 'azure-devops-ui/Page';
import { useEffect, useMemo, useState } from 'react';

import CriteriaList from '../common/components/CriteriaList';
import CriteriaService from '../common/services/CriteriaService';
import { CriteriaDocument, WorkItemTypeTagProps } from '../common/types';
import CriteriaTree from './components/CriteriaTree';
import HubFilterBar from './components/HubFilterBar';

const WorkHub = (): JSX.Element => {
  const [criteriaService, workItemService] = useMemo(
    () => [new CriteriaService(), new WorkItemService()],
    []
  );
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  useEffect(() => {
    async function initModule() {
      loadTheme(createTheme(appTheme));
      await DevOps.init();
      const loadedTypes = await workItemService.getWorkItemTypes();

      setTypes(loadedTypes);
      webLogger.information('Loaded work hub...');
      const result = await criteriaService.load();

      console.log(result);
      if (result.success && result.data) {
        if (result.data.length > 0) {
          setDocuments(result.data);
        }
      }
    }

    initModule();
  }, []);

  const criterias = useMemo(() => documents.flatMap(x => x.criterias), [documents]);
  const workItemIds = useMemo(() => documents.map(x => parseInt(x.id)), [documents]);

  const wiMap: Map<string, WorkItemTypeTagProps> = useMemo(() => {
    const mp = new Map<string, WorkItemTypeTagProps>();
    console.log(workItems);
    workItems.map(wi => {
      const refName = getWorkItemReferenceName(wi, types);
      console.log(refName);
      if (!refName) return;
      const t = getWorkTypeFromReferenceName(refName, types);
      const pro: WorkItemTypeTagProps = {
        iconSize: 16,
        iconUrl: t?.icon.url,
        text: t?.name
      };
      mp.set(wi.id.toString(), pro);
    });

    console.log(mp);
    return mp;
  }, [workItems]);

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
    <Page className="flex-grow">
      <Header
        title="Acceptance Criterias"
        titleSize={TitleSize.Large}
        description={<VersionDisplay moduleVersion={process.env.WORK_HUB_VERSION} />}
      />

      <div className="padding-8 flex-grow">
        <HubFilterBar criterias={criterias} />

        <div className="padding-8">
          {/* <CriteriaList rows={criterias} /> */}
          <CriteriaTree criterias={documents} types={types} workItems={wiMap} />
        </div>
      </div>
    </Page>
  );
};

export default WorkHub;
