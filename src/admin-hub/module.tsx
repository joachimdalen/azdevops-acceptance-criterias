/* istanbul ignore file */

import './index.scss';

import { initializeIcons } from '@fluentui/react';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import AdminHub from './AdminHub';

initializeIcons();

showRootComponent(<AdminHub />, 'admin-hub-container');
