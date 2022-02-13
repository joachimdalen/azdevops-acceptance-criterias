import { DevOpsService, webLogger } from '@joachimdalen/azdevops-ext-core';
import { useEffect, useMemo, useState } from 'react';

function useCriteriaId(): string | undefined {
  const devOpsService = useMemo(() => new DevOpsService(), []);
  const [id, setId] = useState<string | undefined>();
  useEffect(() => {
    async function init() {
      const queryParms = await devOpsService.getQueryParameters();
      webLogger.debug('Checking...');
      if (queryParms?.criteriaId) {
        setId(queryParms?.criteriaId);
      }
    }

    init();
  }, []);

  return id;
}

export default useCriteriaId;
