import { ContentSize } from 'azure-devops-ui/Callout';
import { useObservableArray } from 'azure-devops-ui/Core/Observable';
import { Panel } from 'azure-devops-ui/Panel';
import { TabContent, TabGroupProvider, TabList, TabProvider } from 'azure-devops-ui/Tabs';
import { ITabGroup, IVssContributedTab, TabSize } from 'azure-devops-ui/Tabs.Types';
import { useState } from 'react';

import NotificationsGeneralTab from './tabs/NotificationsGeneralTab';
import WorkItemDisplayTab from './tabs/WorkItemDisplayTab';

interface SettingsPanelProps {
  onClose: () => void;
}
const SettingsPanel = ({ onClose }: SettingsPanelProps): JSX.Element => {
  const tabs: IVssContributedTab[] = [
    {
      id: 'notifications',
      name: 'Notifications',
      iconProps: { iconName: 'Comment', className: 'margin-right-4' },
      groupId: 'general',
      render: () => <NotificationsGeneralTab />
    },
    {
      id: 'work-items-display',
      name: 'Work Items',
      groupId: 'display',
      iconProps: { iconName: 'WorkItem', className: 'margin-right-4' },
      render: () => <WorkItemDisplayTab />
    }
  ];

  const [groupProviders] = useObservableArray<ITabGroup>([]);
  const [providers] = useObservableArray<IVssContributedTab>(tabs);
  const [selectedTabId, setSelectedTabId] = useState<string>('notifications');
  const groups: ITabGroup[] = [
    {
      id: 'general',
      name: 'General',
      order: 1
    },
    {
      id: 'display',
      name: 'Display',
      order: 2
    }
  ];

  return (
    <Panel
      size={ContentSize.ExtraLarge}
      titleProps={{
        text: 'Settings'
      }}
      onDismiss={onClose}
      footerButtonProps={[{ id: 'close', text: 'Close', onClick: onClose }]}
    >
      <TabGroupProvider providers={groupProviders}>
        <TabProvider providers={providers} selectedTabId={selectedTabId}>
          <TabList
            key={1}
            onSelectedTabChanged={tabId => setSelectedTabId(tabId)}
            selectedTabId={selectedTabId}
            tabSize={TabSize.Tall}
            tabGroups={groups}
            className="settings-tab-list"
          />

          <TabContent />
        </TabProvider>
      </TabGroupProvider>
    </Panel>
  );
};

export default SettingsPanel;
