import { ErrorBoundary } from '@joachimdalen/azdevops-ext-core/ErrorBoundary';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import CriteriaPanel from './CriteriaPanel';
import { CriteriaBuilderProvider } from '../common/criterias/CriteriaBuilderContext';

showRootComponent(
  <ErrorBoundary>
    <CriteriaBuilderProvider>
      <CriteriaPanel />
    </CriteriaBuilderProvider>
  </ErrorBoundary>,
  'criteria-panel-container'
);
