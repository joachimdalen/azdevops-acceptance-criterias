import { CommonServiceIds, IHostNavigationService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Header } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { Page } from 'azure-devops-ui/Page';
import {
  ISurfaceContext,
  Surface,
  SurfaceBackground,
  SurfaceContext
} from 'azure-devops-ui/Surface';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import React, { useState } from 'react';

import AdminConfigurationTab from './tabs/AdminConfigurationTab';
import AreaConfigurationTab from './tabs/AreaConfigurationTab';

const AdminPage = (): React.ReactElement => {
  const [selectedTab, setSelectedTab] = useState<string>('areas');

  const commandBarItems: IHeaderCommandBarItem[] = [
    {
      id: 'open-docs',
      text: 'Open docs',
      iconProps: { iconName: 'Help' },
      onActivate: () => {
        DevOps.getService<IHostNavigationService>('ms.vss-features.host-navigation-service').then(
          value => {
            value.openNewWindow(
              'https://github.com/joachimdalen/azdevops-acceptance-criterias',
              ''
            );
          }
        );
      }
    }
  ];

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page className="flex-grow">
        <Header
          commandBarItems={commandBarItems}
          title="Advanced Acceptance Criterias"
          description="Management for Advanced Acceptance Criterias"
        />
        <TabBar
          className="margin-bottom-16 margin-top-8"
          onSelectedTabChanged={tab => setSelectedTab(tab)}
          selectedTabId={selectedTab}
          tabSize={TabSize.Compact}
        >
          <Tab name="Configuration" id="configuration" iconProps={{ iconName: 'Settings' }} />
          <Tab name="Areas" id="areas" />
        </TabBar>

        <Surface background={SurfaceBackground.normal}>
          <ConditionalChildren renderChildren={selectedTab === 'configuration'}>
            <AdminConfigurationTab />
          </ConditionalChildren>
          <ConditionalChildren renderChildren={selectedTab === 'areas'}>
            <AreaConfigurationTab />
          </ConditionalChildren>
        </Surface>
      </Page>
    </Surface>
  );
};
export default AdminPage;
