import { Toggle } from 'azure-devops-ui/Toggle';
import { useState } from 'react';

import { getLocalItem, LocalStorageKeys, setLocalItem } from '../../../common/localStorage';
import SettingContainer from '../../components/SettingContainer';

const NotificationsGeneralTab = (): JSX.Element => {
  const [noWorkItem, setNoWorkItem] = useState(
    getLocalItem(LocalStorageKeys.OpenWorkItem) || false
  );

  return (
    <div className="padding-16 flex-grow rhythm-vertical-16">
      <SettingContainer
        title="Do not show open work item"
        description="Do not show the 'Open work item' refresh warning"
        browserLocal
      >
        <Toggle
          offText={'Off'}
          onText={'On'}
          checked={noWorkItem}
          onChange={(_, c) => {
            setLocalItem(LocalStorageKeys.OpenWorkItem, c);
            setNoWorkItem(c);
          }}
        />
      </SettingContainer>
    </div>
  );
};

export default NotificationsGeneralTab;
