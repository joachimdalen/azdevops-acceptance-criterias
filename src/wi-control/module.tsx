import './index.scss';

import { initializeIcons } from '@fluentui/react';

import useResizeTimeout from '../common/hooks/useResizeTimeout';
import AcceptanceControl from './AcceptanceControl';
import { showRootComponent } from './common';
initializeIcons();

const App = () => {
  useResizeTimeout(1000);
  return <AcceptanceControl />;
};
showRootComponent(<App />, 'wi-control-container');
