import { showRootComponent } from '@joachimdalen/azdevops-ext-core';

import CriteriaPanel from './CriteriaPanel';
import { CriteriaPanelProvider } from './CriteriaPanelContext';

showRootComponent(
  <CriteriaPanelProvider>
    <CriteriaPanel />
  </CriteriaPanelProvider>,
  'criteria-panel-container'
);
