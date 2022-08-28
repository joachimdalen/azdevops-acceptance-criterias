/* istanbul ignore file */

import './index.scss';

import { initializeIcons } from '@fluentui/react';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import AnalyticsHub from './AnalyticsHub';

initializeIcons();
showRootComponent(<AnalyticsHub />, 'analytics-hub-container');
