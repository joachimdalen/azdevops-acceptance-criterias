import { Icon, IconSize } from 'azure-devops-ui/Icon';
import { Panel } from 'azure-devops-ui/Panel';
import { Toggle } from 'azure-devops-ui/Toggle';

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
      <div className="flex-column flex-grow margin-left-16">
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
  return (
    <Panel
      titleProps={{
        text: 'Settings'
      }}
      onDismiss={onClose}
      footerButtonProps={[{ id: 'close', text: 'Close', onClick: onClose }]}
    >
      <div className="rhythm-vertical-16 flex-grow settings-list">
        <SettingContainer
          title="Do not show open work item"
          description="Do not show the 'Open work item' refresh warning"
        >
          <Toggle
            offText={'Off'}
            onText={'On'}
            checked={true}
            onChange={(_, c) => console.log(c)}
          />
        </SettingContainer>
      </div>
    </Panel>
  );
};

export default SettingsPanel;
