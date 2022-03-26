import { Toggle } from 'azure-devops-ui/Toggle';
import { useState } from 'react';

import { getLocalItem, LocalStorageKeys, setLocalItem } from '../../../common/localStorage';
import SettingContainer from '../../components/SettingContainer';

const WorkItemDisplayTab = (): JSX.Element => {
  const [showCompletedWi, setShowCompletedWi] = useState(
    getLocalItem(LocalStorageKeys.ShowCompletedWi) || false
  );

  return (
    <div className="padding-16 flex-grow rhythm-vertical-16">
      <SettingContainer
        title="Show completed Work Items"
        description="Show critieras for work items that are in the completed group"
      >
        <Toggle
          offText={'Off'}
          onText={'On'}
          checked={showCompletedWi}
          onChange={(_, c) => {
            setLocalItem(LocalStorageKeys.ShowCompletedWi, c);
            setShowCompletedWi(c);
          }}
        />
      </SettingContainer>
    </div>
  );
};

export default WorkItemDisplayTab;
