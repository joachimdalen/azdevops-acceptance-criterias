import './index.scss';

import { showRootComponent } from '@joachimdalen/azdevops-ext-core';

import ProgressControl from './ProgressControl';

const App = () => {
  return <ProgressControl />;
};
showRootComponent(<App />, 'progress-control-container');
