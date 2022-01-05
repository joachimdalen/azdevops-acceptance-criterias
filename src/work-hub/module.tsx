import './index.scss';

import { createTheme, initializeIcons, loadTheme } from '@fluentui/react';
import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect } from 'react';

import { appTheme } from '../wi-control/azure-devops-theme';
import { showRootComponent } from '../wi-control/common';

initializeIcons();

const WorkHub = () => {
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init().then(async () => {
      console.log('Loaded work hub...');
    });
  }, []);

  return <div>Hello</div>;
};
showRootComponent(<WorkHub />, 'work-hub-container');
