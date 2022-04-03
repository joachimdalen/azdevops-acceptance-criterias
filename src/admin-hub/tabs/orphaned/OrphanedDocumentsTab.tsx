import { getClient } from 'azure-devops-extension-api';
import {
  WorkItem,
  WorkItemErrorPolicy,
  WorkItemTrackingRestClient
} from 'azure-devops-extension-api/WorkItemTracking';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ISimpleTableCell, ITableColumn, renderSimpleCell, Table } from 'azure-devops-ui/Table';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useEffect, useMemo, useState } from 'react';
import { chunk } from '../../../common/chunkUtil';

import { StorageService } from '../../../common/services/StorageService';
import { CriteriaDetailDocument, CriteriaDocument } from '../../../common/types';
import PageWrapper from '../../components/PageWrapper';
import OrphanedCriteriaDetailsTab from './tabs/OrphanedCriteriaDetailsTab';
import OrphanedCriteriasTab from './tabs/OrphanedCriteriasTab';

const OrphanedDocumentsTab = (): React.ReactElement => {
  const [service, workItemService] = useMemo(
    () => [new StorageService(), getClient(WorkItemTrackingRestClient)],
    []
  );
  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);
  const [details, setDetails] = useState<CriteriaDetailDocument[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('criterias');

  // useEffect(() => {
  //   async function init() {
  //     const criterias = await service.getAllCriterias();
  //     const localDetails = await service.getAllCriteriaDetails();

  //     const ids = criterias.map(x => parseInt(x.id));
  //     const criteriaIds = criterias.flatMap(x => x.criterias.map(y => y.id));
  //     const workItmes = await getBatched(ids);

  //     const notFound = ids.filter(x => !workItmes.some(y => x === y.id));
  //     const updated = await workItemService.getDeletedWorkItems(notFound);
  //     setDocuments(criterias.filter(x => updated.some(y => x.id === y.id.toString())));
  //     setDetails(localDetails);
  //     console.log(localDetails);
  //   }

  //   init();
  // }, []);

  // const getBatched = async (workItemIds: number[]): Promise<WorkItem[]> => {
  //   const batched = chunk(workItemIds, 175);
  //   const items: WorkItem[] = [];
  //   for (const batch of batched) {
  //     const wi = await workItemService.getWorkItems(
  //       batch,
  //       undefined,
  //       ['System.ID'],
  //       undefined,
  //       undefined,
  //       WorkItemErrorPolicy.Omit
  //     );
  //     items.push(...wi);
  //   }

  //   return items;
  // };

  // interface OrpahnedCriterias extends ISimpleTableCell {
  //   id: string;
  //   title: string;
  // }
  // interface OrpahnedCriteriaDetails extends ISimpleTableCell {
  //   id: string;
  //   title: string;
  // }

  // const detailsProvider = useMemo(() => {
  //   const items: OrpahnedCriteriaDetails[] = details.flatMap(doc => {
  //     return {
  //       id: doc.id,
  //       title: doc.id
  //     };
  //   });
  //   return new ArrayItemProvider<OrpahnedCriterias>(items);
  // }, [details]);

  // const detailsColumn: ITableColumn<OrpahnedCriterias>[] = [
  //   {
  //     id: 'id',
  //     name: 'Details Id',
  //     renderCell: renderSimpleCell,
  //     width: 100
  //   },
  //   {
  //     id: 'title',
  //     name: 'Title',
  //     renderCell: renderSimpleCell,
  //     width: -100
  //   }
  // ];

  return (
    <PageWrapper>
      <TabBar
        className="margin-bottom-16 margin-top-8"
        onSelectedTabChanged={tab => setSelectedTab(tab)}
        selectedTabId={selectedTab}
        tabSize={TabSize.Compact}
      >
        <Tab name="Criterias" id="criterias" />
        <Tab name="Details" id="details" />
      </TabBar>

      <div className="flex-column">
        <ConditionalChildren renderChildren={selectedTab === 'criterias'}>
          <OrphanedCriteriasTab />
        </ConditionalChildren>
        <ConditionalChildren renderChildren={selectedTab === 'details'}>
          <OrphanedCriteriaDetailsTab />
        </ConditionalChildren>
      </div>
    </PageWrapper>
  );
};

export default OrphanedDocumentsTab;
