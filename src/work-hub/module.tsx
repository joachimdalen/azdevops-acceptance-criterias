import './index.scss';

import { initializeIcons } from '@fluentui/react';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core';

import WorkHub from './WorkHub';

initializeIcons();


showRootComponent(<WorkHub />, 'work-hub-container');
