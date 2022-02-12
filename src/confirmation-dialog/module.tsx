import './index.scss';

import { showRootComponent, useResizeTimeout } from '@joachimdalen/azdevops-ext-core';

import ConfirmationDialog from '../wi-control/ConfirmationDialog';
const App = () => {
  return <ConfirmationDialog />;
};
showRootComponent(<App />, 'confirmation-dialog-container');
