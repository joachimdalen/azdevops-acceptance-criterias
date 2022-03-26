import { Toggle } from 'azure-devops-ui/Toggle';
import { useState } from 'react';

import { getLocalItem, LocalStorageKeys, setLocalItem } from '../../../common/localStorage';
import SettingContainer from '../../components/SettingContainer';

const NotificationsGeneralTab = (): JSX.Element => {
  const [noWorkItem, setNoWorkItem] = useState(
    getLocalItem(LocalStorageKeys.OpenWorkItem) || false
  );
  const [noUndoComplete, setNoUndoComplete] = useState(
    getLocalItem(LocalStorageKeys.UndoCompleted) || false
  );

  return (
    <div className="padding-16 flex-grow rhythm-vertical-16">
      <SettingContainer
        title="Do not show open work item"
        description="Do not show the 'Open work item' refresh warning"
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
      <SettingContainer
        title="Do not show undo completed"
        description="Do not show the 'Undo completed criteria' warning"
      >
        <Toggle
          offText={'Off'}
          onText={'On'}
          checked={noUndoComplete}
          onChange={(_, c) => {
            setLocalItem(LocalStorageKeys.UndoCompleted, c);
            setNoUndoComplete(c);
          }}
        />
      </SettingContainer>
    </div>
  );
};

export default NotificationsGeneralTab;
