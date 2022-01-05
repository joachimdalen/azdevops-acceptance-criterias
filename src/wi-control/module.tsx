import './index.scss';

import { initializeIcons } from '@fluentui/react';

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
  return <AcceptanceControl />;
};
showRootComponent(<App />, 'control-container');
