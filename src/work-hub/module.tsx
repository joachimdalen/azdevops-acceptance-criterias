import './index.scss';

import { initializeIcons } from '@fluentui/react';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core';

import WorkHub from './WorkHub';
import { WorkHubProvider } from './WorkHubContext';

initializeIcons();
showRootComponent(
  <WorkHubProvider>
    <WorkHub />
  </WorkHubProvider>,
  'work-hub-container'
);
