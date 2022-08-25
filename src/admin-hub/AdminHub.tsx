import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { appTheme } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect, useState } from 'react';

import AdminConfigurationPage from './pages/AdminConfigurationPage';
import AdminDocumentManagementPage from './pages/AdminDocumentManagementPage';
import AdminTemplatesPage from './pages/AdminTemplatesPage';
import { getHostUrl } from '@joachimdalen/azdevops-ext-core/HostUtils';
import { LocalStorageRawKeys } from '../common/localStorage';

const AdminHub = (): JSX.Element => {
  const [adminSection, setAdminSection] = useState('');
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    getHostUrl(LocalStorageRawKeys.HostUrlWithOrg, true);
    DevOps.init().then(async () => {
      WebLogger.information('Loaded admin hub...');

      const contributionId = DevOps.getContributionId();
      const extensionId = DevOps.getExtensionContext().id;
      const admSec = contributionId.replace(extensionId, '')?.substring(1);
      setAdminSection(admSec);
    });
  }, []);

  if (adminSection === '' || adminSection === undefined) {
    return <span>Unable to load admin hub</span>;
  }

  switch (adminSection) {
    case 'admin-configuration':
      return <AdminConfigurationPage />;
    case 'admin-templates':
      return <AdminTemplatesPage />;
    case 'admin-document-mgmt':
      return <AdminDocumentManagementPage />;
  }

  return <span>Unable to load admin hub</span>;
};
export default AdminHub;
