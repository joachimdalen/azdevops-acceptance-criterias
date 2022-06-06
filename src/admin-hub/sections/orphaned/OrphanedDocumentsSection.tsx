import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import { useState } from 'react';

import PageWrapper from '../../components/PageWrapper';
import OrphanedCriteriaDetailsTab from './tabs/OrphanedCriteriaDetailsTab';
import OrphanedCriteriasTab from './tabs/OrphanedCriteriasTab';

const OrphanedDocumentsSection = (): React.ReactElement => {
  const [selectedTab, setSelectedTab] = useState<string>('criterias');

  return (
    <PageWrapper>
      <TabBar
        className="margin-bottom-16 margin-top-8"
        onSelectedTabChanged={tab => setSelectedTab(tab)}
        selectedTabId={selectedTab}
        tabSize={TabSize.Compact}
      >
        <Tab name="Criterias" id="criterias" />
        <Tab name="Details" id="details" />
      </TabBar>

      <div className="flex-column">
        <ConditionalChildren renderChildren={selectedTab === 'criterias'}>
          <OrphanedCriteriasTab />
        </ConditionalChildren>
        <ConditionalChildren renderChildren={selectedTab === 'details'}>
          <OrphanedCriteriaDetailsTab />
        </ConditionalChildren>
      </div>
    </PageWrapper>
  );
};

export default OrphanedDocumentsSection;
