/* istanbul ignore file */

import './index.scss';

import { initializeIcons } from '@fluentui/react';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import AcceptanceControl from './AcceptanceControl';
initializeIcons();

const App = () => {
  return <AcceptanceControl />;
};
showRootComponent(<App />, 'wi-control-container');
