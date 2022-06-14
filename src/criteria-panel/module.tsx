/* istanbul ignore file */

import { ErrorBoundary } from '@joachimdalen/azdevops-ext-core/ErrorBoundary';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import { CriteriaBuilderProvider } from '../common/criterias/CriteriaBuilderContext';
import CriteriaPanelPicker from './CriteriaPanelPicker';

showRootComponent(
  <ErrorBoundary>
    <CriteriaBuilderProvider>
      <CriteriaPanelPicker />
    </CriteriaBuilderProvider>
  </ErrorBoundary>,
  'criteria-panel-container'
);
