import './index.scss';

import { initializeIcons } from '@fluentui/react';

import AcceptanceControl from './AcceptanceControl';
import { showRootComponent } from './common';
initializeIcons();

const App = () => {
  return <AcceptanceControl />;
};
showRootComponent(<App />, 'wi-control-container');
