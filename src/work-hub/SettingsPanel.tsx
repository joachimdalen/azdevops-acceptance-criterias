import { Icon, IconSize } from 'azure-devops-ui/Icon';
import { Panel } from 'azure-devops-ui/Panel';
import { Toggle } from 'azure-devops-ui/Toggle';
import cx from 'classnames';
import { useState } from 'react';

import { getLocalItem, LocalStorageKeys, setLocalItem } from '../common/localStorage';
interface SettingContainerProps {
  icon?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingContainer = ({
  icon,
  title,
  description,
  children
}: SettingContainerProps): JSX.Element => {
  return (
    <div className="setting flex-grow flex-row">
      {icon && <Icon iconName={icon} size={IconSize.large} />}
      <div
        className={cx('flex-column flex-grow', {
          'margin-left-16': icon !== undefined
        })}
      >
        <div className="flex-row flex-center">
          <div className="flex-grow title-xs">{title}</div>
          {children}
        </div>
        <div className="margin-top-8">{description}</div>
      </div>
    </div>
  );
};

interface SettingsPanelProps {
  onClose: () => void;
}
const SettingsPanel = ({ onClose }: SettingsPanelProps): JSX.Element => {
  const [noWorkItem, setNoWorkItem] = useState(
    getLocalItem(LocalStorageKeys.OpenWorkItem) || false
  );
  const [noUndoComplete, setNoUndoComplete] = useState(
    getLocalItem(LocalStorageKeys.UndoCompleted) || false
  );

  return (
    <Panel
      titleProps={{
        text: 'Settings'
      }}
      onDismiss={onClose}
      footerButtonProps={[{ id: 'close', text: 'Close', onClick: onClose }]}
    >
      <div className="rhythm-vertical-16 flex-grow settings-list">
        <h3>Notifications</h3>
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
    </Panel>
  );
};

export default SettingsPanel;
