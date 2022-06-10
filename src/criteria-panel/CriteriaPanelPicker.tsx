import { LoadingSection } from '@joachimdalen/azdevops-ext-core/LoadingSection';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect, useState } from 'react';

import { CriteriaPanelMode, LoadedCriteriaPanelConfig } from '../common/types';
import CriteriaPanel from './CriteriaPanel';
import NewTemplatePanelContent from './templates/NewTemplatePanelContent';
const CriteriaPanelPicker = () => {
  const [mode, setMode] = useState<CriteriaPanelMode | undefined>();
  useEffect(() => {
    async function initModule() {
      console.log('Hello');
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        const config = DevOps.getConfiguration() as LoadedCriteriaPanelConfig;
        setMode(config.mode);
        console.log('Setting mode', config.mode);
      } catch (error) {
        WebLogger.error('Load failed', error);
      } finally {
        WebLogger.debug('Loaded');
      }
    }

    initModule();
  }, []);

  if (mode === undefined) return <LoadingSection isLoading text="Loading panel..." />;
  if (mode === CriteriaPanelMode.NewFromTemplate) return <NewTemplatePanelContent />;
  return <CriteriaPanel />;
};

export default CriteriaPanelPicker;
