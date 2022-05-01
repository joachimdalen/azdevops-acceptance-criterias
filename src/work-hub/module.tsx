import './index.scss';

import { initializeIcons } from '@fluentui/react';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import WorkHub from './WorkHub';

initializeIcons();
showRootComponent(<WorkHub />, 'work-hub-container');
