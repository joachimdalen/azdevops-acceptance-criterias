import { createTheme, loadTheme } from '@fluentui/react';
import { appTheme } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { distinct, isDefined } from '@joachimdalen/azdevops-ext-core/CoreUtils';
import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
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
  WorkItemStateColor,
  WorkItemType
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { Card } from 'azure-devops-ui/Card';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { TextField } from 'azure-devops-ui/TextField';
import { IFilterState } from 'azure-devops-ui/Utilities/Filter';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import cx from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { chunk } from '../common/chunkUtil';
import { SlimErrorBoundary } from '../common/components/SlimErrorBoundary';
import { getWorkItemIdFromCriteriaId } from '../common/criteriaUtils';
import { DOCS_URL_EXTENSION, DOCS_URL_KEYBOARD_SHORTCUTS } from '../common/documentationUrls';
import useCriteriaId from '../common/hooks/useCriteriaId';
import { getLocalItem, LocalStorageKeys, LocalStorageRawKeys } from '../common/localStorage';
import CriteriaService from '../common/services/CriteriaService';
import { CriteriaDocument, IAcceptanceCriteria, WorkItemTypeTagProps } from '../common/types';
import CriteriaTree from '../work-hub/components/CriteriaTree';
import ApproverProgress from './components/ApproverProgress';

interface ProgressReportProps {
  workItemTypes: Map<string, WorkItemTypeTagProps>;
  workItemStates: Map<string, WorkItemStateColor[]>;
}

const WorkItemLookup = (): JSX.Element => {
  return (
    <div className="flex-column flex-center flex-grow">
      <div className="flex-row">
        <Card
          headerIconProps={{ iconName: 'WorkItem' }}
          titleProps={{ text: 'Lookup work item' }}
          headerDescriptionProps={{ text: 'Open a work item to see progress report' }}
          contentProps={{ className: 'rhythm-horizontal-16' }}
        >
          <FormItem>
            <TextField placeholder="Work item id" />
          </FormItem>
          <Button text="Open" primary />
        </Card>
      </div>
    </div>
  );
};

const AnalyticsHub = (): JSX.Element => {
  const [criteriaService, workItemService, devOpsService] = useMemo(
    () => [new CriteriaService(), new WorkItemService(), new DevOpsService()],
    []
  );
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [workItemTypes, setWorkItemTypes] = useState<WorkItemType[]>([]);
  const [completedStates, setCompletedStates] = useState<string[]>([]);
  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);
  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init();
        loadTheme(createTheme(appTheme));
        const loadedTypes = await workItemService.getWorkItemTypes();
        setWorkItemTypes(loadedTypes);
        const wi = await workItemService.getWorkItem(631);
        setWorkItems([wi]);

        const result = await criteriaService.load(data => {
          if (data.length > 0) {
            setDocuments(data);
          }
        }, '631');

        await DevOps.notifyLoadSucceeded();
      } catch (error: any) {
        WebLogger.error('Failed to load acceptance criterias', error);
      }
    }

    initModule();
  }, []);

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

  const wiStates: Map<string, WorkItemStateColor[]> = useMemo(() => {
    const mp = new Map<string, WorkItemStateColor[]>();
    workItems
      .map(x => getWorkItemTypeDisplayName(x))
      .filter(isDefined)
      .filter(distinct)
      .map(y => {
        if (mp.has(y)) return;
        const refName = getWorkItemReferenceNameFromDisplayName(y, workItemTypes);
        if (refName === undefined) return;

        const item = workItemTypes.find(x => x.referenceName === refName);
        if (item?.states) {
          mp.set(y, item?.states);
        }
      });

    return mp;
  }, [workItems]);

  const ProgressReport = (): JSX.Element => {
    return (
      <div className="page-content rhythm-vertical-16">
        <div className="flex-row rhythm-horizontal-16 flex-grow">
          <Card className="flex-grow" titleProps={{ text: 'Criterias by status' }}>
            ddd
          </Card>
          <Card className="flex-grow" titleProps={{ text: 'Criterias by status' }}>
            ddd
          </Card>
          <Card className="flex-grow" titleProps={{ text: 'Criterias by status' }}>
            ddd
          </Card>
        </div>
        <div className="flex-row flex-grow rhythm-horizontal-16">
          <div className="flex-column flex-grow" style={{ flex: 1 }}>
            <Card
              titleProps={{ text: 'Criterias' }}
              contentProps={{ contentPadding: false }}
              headerCommandBarItems={[
                { id: 'export', text: 'Export', iconProps: { iconName: 'ExcelDocument' } }
              ]}
            >
              <CriteriaTree
                workItems={workItems}
                visibleDocuments={documents}
                documents={documents}
                workItemTypes={wiMap}
                workItemStates={wiStates}
                onClick={async (workItemId: string, criteria: IAcceptanceCriteria) => {
                  console.log('');
                }}
              />
            </Card>
          </div>
          <div className="flex-column flex-grow" style={{ flex: 1 }}>
            <ApproverProgress />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page className="flex-grow">
        <Header
          title="Progress Report"
          titleSize={TitleSize.Large}
          description={<VersionDisplay moduleVersion={process.env.WORK_HUB_VERSION} />}
        />

        {/* <div className="page-content flex-row h-scroll-hidden flex-start full-height">
          <div className="flex-grow flex-column full-height">
            <div className="page-content-bottom">
              <div className="page-content-top">ddd</div>
            </div>

            <div className={cx('bolt-page-grey flex-row flex-start flex-grow v-scroll-auto')}>
              dd
            </div>
          </div>
        </div> */}

        {/* <WorkItemLookup /> */}
        <ProgressReport />
      </Page>
    </Surface>
  );
};

export default AnalyticsHub;
