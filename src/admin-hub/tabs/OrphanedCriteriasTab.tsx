import { getClient } from 'azure-devops-extension-api';
import {
  WorkItemErrorPolicy,
  WorkItemTrackingRestClient
} from 'azure-devops-extension-api/WorkItemTracking';
import { ISimpleTableCell, ITableColumn, renderSimpleCell, Table } from 'azure-devops-ui/Table';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useEffect, useMemo, useState } from 'react';

import { StorageService } from '../../common/services/StorageService';
import { CriteriaDocument } from '../../common/types';
import PageWrapper from '../components/PageWrapper';

const OrphanedCriteriasTab = (): React.ReactElement => {
  const service = useMemo(() => new StorageService(), []);
  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);

  useEffect(() => {
    async function init() {
      const criterias = await service.getAllCriterias();
      const client = getClient(WorkItemTrackingRestClient);
      const ids = criterias.map(x => parseInt(x.id));
      const workItmes = await client.getWorkItems(
        ids,
        undefined,
        ['System.ID'],
        undefined,
        undefined,
        WorkItemErrorPolicy.Omit
      );

      const notFound = ids.filter(x => !workItmes.some(y => x === y.id));
      const updated = await client.getDeletedWorkItems(notFound);
      setDocuments(criterias.filter(x => updated.some(y => x.id === y.id.toString())));
    }

    init();
  }, []);

  interface OrpahnedCriterias extends ISimpleTableCell {
    id: string;
    title: string;
  }

  const provider = useMemo(() => {
    const items: OrpahnedCriterias[] = documents.flatMap(doc => {
      return doc.criterias.map(crit => {
        return {
          id: doc.id,
          title: `${crit.id} - ${crit.title}`
        };
      });
    });
    return new ArrayItemProvider<OrpahnedCriterias>(items);
  }, [documents]);

  const columns: ITableColumn<OrpahnedCriterias>[] = [
    {
      id: 'id',
      name: 'Criteria Id',
      renderCell: renderSimpleCell,
      width: 100
    },
    {
      id: 'title',
      name: 'Title',
      renderCell: renderSimpleCell,
      width: -100
    }
  ];

  return (
    <PageWrapper>
      <div>Orphaned Criteiras</div>

      <div className="flex-column">
        <Table
          ariaLabel="Basic Table"
          columns={columns}
          itemProvider={provider}
          role="table"
          className="table-example"
          containerClassName="h-scroll-auto"
        />
        {/* {documents.map(x => {
          return (
            <div>
              {x.id}
              <Button
                text="Delete"
                onClick={async () => {
                  await service.deleteCriteriaDocument(x.id);
                  await service.deleteCriteriaDetilsDocument(x.id);
                }}
              ></Button>
            </div>
          );
        })} */}
      </div>
    </PageWrapper>
  );
};

export default OrphanedCriteriasTab;
