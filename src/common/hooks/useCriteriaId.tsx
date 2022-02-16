import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import { useEffect, useMemo, useState } from 'react';

function useCriteriaId(): string | undefined {
  const devOpsService = useMemo(() => new DevOpsService(), []);
  const [id, setId] = useState<string | undefined>();
  useEffect(() => {
    async function init() {
      const queryParms = await devOpsService.getQueryParameters();
      WebLogger.debug('Checking...');
      if (queryParms?.criteriaId) {
        setId(queryParms?.criteriaId);
      }
    }

    init();
  }, []);

  return id;
}

export default useCriteriaId;
