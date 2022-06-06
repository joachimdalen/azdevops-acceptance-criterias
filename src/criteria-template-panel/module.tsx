import './index.scss';

import { ErrorBoundary } from '@joachimdalen/azdevops-ext-core/ErrorBoundary';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import TemplatePanel from './TemplatePanel';
import { CriteriaBuilderProvider } from '../common/criterias/CriteriaBuilderContext';

showRootComponent(
  <ErrorBoundary>
    <CriteriaBuilderProvider>
      <TemplatePanel />
    </CriteriaBuilderProvider>
  </ErrorBoundary>,
  'criteria-template-panel-container'
);
