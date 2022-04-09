import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Header } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import React, { useMemo, useState } from 'react';

import AdminConfigurationTab from './tabs/AdminConfigurationTab';
import DocumentTab from './tabs/DocumentTab';
import OrphanedDocumentsTab from './tabs/orphaned/OrphanedDocumentsTab';

const AdminPage = (): React.ReactElement => {
  const [devOpsService] = useMemo(() => [new DevOpsService()], []);
  const [selectedTab, setSelectedTab] = useState<string>('configuration');

  const commandBarItems: IHeaderCommandBarItem[] = [
    {
      id: 'open-docs',
      text: 'Open docs',
      iconProps: { iconName: 'Help' },
      onActivate: () => {
        devOpsService.openLink(
          'https://docs.devops-extensions.dev/docs/extensions/acceptance-criterias'
        );
      }
    }
  ];

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page className="flex-grow">
        <Header
          commandBarItems={commandBarItems}
          title="Acceptance Criterias"
          description="Management for Acceptance Criterias"
        />
        <TabBar
          className="margin-bottom-16 margin-top-8"
          onSelectedTabChanged={tab => setSelectedTab(tab)}
          selectedTabId={selectedTab}
          tabSize={TabSize.Compact}
        >
          <Tab name="Configuration" id="configuration" />
          <Tab name="Areas" id="areas" />
          <Tab name="Orphaned Criterias" id="orphaned" />
        </TabBar>

        <Surface background={SurfaceBackground.normal}>
          <ConditionalChildren renderChildren={selectedTab === 'configuration'}>
            <AdminConfigurationTab />
          </ConditionalChildren>
          <ConditionalChildren renderChildren={selectedTab === 'areas'}>
            <DocumentTab />
          </ConditionalChildren>
          <ConditionalChildren renderChildren={selectedTab === 'orphaned'}>
            <OrphanedDocumentsTab />
          </ConditionalChildren>
        </Surface>
      </Page>
    </Surface>
  );
};
export default AdminPage;
