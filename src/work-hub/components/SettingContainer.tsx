import { Icon, IconSize } from 'azure-devops-ui/Icon';
import cx from 'classnames';

export interface SettingContainerProps {
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
    <div className="setting flex-grow flex-row border-bottom-light padding-bottom-8">
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

export default SettingContainer;
