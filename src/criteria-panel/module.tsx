import { ErrorBoundary } from '@joachimdalen/azdevops-ext-core/ErrorBoundary';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import CriteriaPanel from './CriteriaPanel';
import { CriteriaPanelProvider } from './CriteriaPanelContext';

showRootComponent(
  <ErrorBoundary>
    <CriteriaPanelProvider>
      <CriteriaPanel />
    </CriteriaPanelProvider>
  </ErrorBoundary>,
  'criteria-panel-container'
);
