import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import CriteriaPanel from './CriteriaPanel';
import { CriteriaPanelProvider } from './CriteriaPanelContext';

showRootComponent(
  <CriteriaPanelProvider>
    <CriteriaPanel />
  </CriteriaPanelProvider>,
  'criteria-panel-container'
);
