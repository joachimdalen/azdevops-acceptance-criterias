import './index.scss';

import { createTheme, initializeIcons, loadTheme } from '@fluentui/react';
import { appTheme, showRootComponent, webLogger } from '@joachimdalen/azdevops-ext-core';
import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect } from 'react';

initializeIcons();

const WorkHub = () => {
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init().then(async () => {
      webLogger.information('Loaded work hub...');
    });
  }, []);

  return <div>Hello</div>;
};
showRootComponent(<WorkHub />, 'work-hub-container');
