import { ErrorBoundary } from '@joachimdalen/azdevops-ext-core/ErrorBoundary';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

showRootComponent(<ErrorBoundary>Hello</ErrorBoundary>, 'criteria-template-panel-container');
