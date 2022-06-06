import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { Header } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import React, { useMemo } from 'react';

import { DOCS_URL_EXTENSION } from '../../common/documentationUrls';
import ConfigurationSection from '../sections/ConfigurationSection';

const AdminConfigurationPage = (): React.ReactElement => {
  const [devOpsService] = useMemo(() => [new DevOpsService()], []);
  const commandBarItems: IHeaderCommandBarItem[] = [
    {
      id: 'open-docs',
      text: 'Open docs',
      iconProps: { iconName: 'Help' },
      onActivate: () => {
        devOpsService.openLink(DOCS_URL_EXTENSION);
      }
    }
  ];

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page className="flex-grow">
        <Header
          commandBarItems={commandBarItems}
          title="Configuration"
          description="Configuration for Acceptance Criterias"
          className="margin-bottom-16"
          titleIconProps={{ iconName: 'Settings' }}
        />

        <Surface background={SurfaceBackground.normal}>
          <ConfigurationSection />
        </Surface>
      </Page>
    </Surface>
  );
};
export default AdminConfigurationPage;
