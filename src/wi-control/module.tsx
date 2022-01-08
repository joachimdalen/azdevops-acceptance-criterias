import './index.scss';

import { initializeIcons } from '@fluentui/react';

import useResizeTimeout from '../common/hooks/useResizeTimeout';
import AcceptanceControl from './AcceptanceControl';
import { showRootComponent } from './common';
initializeIcons();

if (module.hot) {
  console.log('Accepts');
  module.hot.accept(function (err) {
    console.log('An error occurred while accepting new version');
  });
  console.log(module.hot);
}

const App = () => {
  useResizeTimeout(2000);
  return <AcceptanceControl />;
};
showRootComponent(<App />, 'wi-control-container');
