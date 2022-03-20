import { getClient } from 'azure-devops-extension-api';
import { Operation } from 'azure-devops-extension-api/WebApi';
import { WorkItemTrackingRestClient } from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { useEffect, useMemo, useState } from 'react';
import { validate } from 'uuid';

import { StorageService } from '../../common/services/StorageService';
import { CriteriaDocument, FullCriteriaStatus } from '../../common/types';
import PageWrapper from '../components/PageWrapper';

const DocumentTab = (): React.ReactElement => {
  const service = useMemo(() => new StorageService(), []);

  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);

  useEffect(() => {
    service.getAllCriterias().then(x => setDocuments(x));
  }, []);

  return (
    <PageWrapper>
      <div>Areas</div>

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
          }}
        ></Button>
      </div>
    </PageWrapper>
  );
};

export default DocumentTab;
