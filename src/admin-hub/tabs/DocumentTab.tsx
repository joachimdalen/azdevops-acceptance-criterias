import { Button } from 'azure-devops-ui/Button';
import { useEffect, useMemo, useState } from 'react';
import { StorageService } from '../../common/services/StorageService';
import { CriteriaDocument } from '../../common/types';
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

      <div className="flex-row">
        {documents.map(x => {
          return (
            <div>
              {x.id}
              <Button
                text="Delete"
                onClick={async () => {
                  await service.delete(x.id);
                }}
              ></Button>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
};

export default DocumentTab;
