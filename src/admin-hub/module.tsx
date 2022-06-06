import './index.scss';

import { createTheme, initializeIcons, loadTheme } from '@fluentui/react';
import { appTheme } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect, useState } from 'react';

import AdminConfigurationPage from './pages/AdminConfigurationPage';
import AdminDocumentManagementPage from './pages/AdminDocumentManagementPage';
import AdminTemplatesPage from './pages/AdminTemplatesPage';

initializeIcons();

const AdminHub = () => {
  const [adminSection, setAdminSection] = useState('');
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init().then(async () => {
      WebLogger.information('Loaded admin hub...');

      const contributionId = DevOps.getContributionId();
      const extensionId = DevOps.getExtensionContext().id;
      const admSec = contributionId.replace(extensionId, '')?.substring(1);
      setAdminSection(admSec);
    });
  }, []);

  if (adminSection === '' || adminSection === undefined) {
    return null;
  }

  switch (adminSection) {
    case 'admin-configuration':
      return <AdminConfigurationPage />;
    case 'admin-templates':
      return <AdminTemplatesPage />;
    case 'admin-document-mgmt':
      return <AdminDocumentManagementPage />;
  }

  return null;
};
showRootComponent(<AdminHub />, 'admin-hub-container');
