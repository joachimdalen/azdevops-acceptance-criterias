import { ErrorBoundary } from '@joachimdalen/azdevops-ext-core/ErrorBoundary';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import CriteriaPanel from './CriteriaPanel';
import { CriteriaBuilderProvider } from '../common/criterias/CriteriaBuilderContext';
import NewTemplatePanelContent from './templates/NewTemplatePanelContent';
import CriteriaPanelPicker from './CriteriaPanelPicker';

showRootComponent(
  <ErrorBoundary>
    <CriteriaBuilderProvider>
      <CriteriaPanelPicker />
    </CriteriaBuilderProvider>
  </ErrorBoundary>,
  'criteria-panel-container'
);
