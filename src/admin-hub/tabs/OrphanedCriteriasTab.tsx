import { getClient } from 'azure-devops-extension-api';
import { Operation } from 'azure-devops-extension-api/WebApi';
import {
  WorkItemErrorPolicy,
  WorkItemTrackingRestClient
} from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { useEffect, useMemo, useState } from 'react';
import { validate } from 'uuid';

import { StorageService } from '../../common/services/StorageService';
import { CriteriaDocument, FullCriteriaStatus } from '../../common/types';
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

      const notFound = ids.filter(x => !workItmes.some(y => x === y.id))
      const updated = await client.getDeletedWorkItems(notFound);
      setDocuments(criterias.filter(x => updated.some(y => x.id === y.id.toString())));
    }

    init();
  }, []);

  return (
    <PageWrapper>
      <div>Orphaned Criteiras</div>

      <div className="flex-column">
        {documents.map(x => {
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
        })}
      </div>

      <div className="margin-top-16">
        <Button
          text="Set info"
          onClick={async () => {
            const operation = [
              {
                op: 'add',
                path: '/fields/Jd.AcceptanceCriterias.State',
                value: FullCriteriaStatus.New.toString()
              }
            ];
            const client = getClient(WorkItemTrackingRestClient);
            const updated = await client.updateWorkItem(operation, 338, undefined, true);
            console.log(updated);
          }}
        ></Button>
      </div>
    </PageWrapper>
  );
};

export default OrphanedCriteriasTab;
