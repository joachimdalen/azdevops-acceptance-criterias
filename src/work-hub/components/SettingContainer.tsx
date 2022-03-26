import { Icon, IconSize } from 'azure-devops-ui/Icon';
import { Pill, PillSize, PillVariant } from 'azure-devops-ui/Pill';
import cx from 'classnames';

export interface SettingContainerProps {
  icon?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  browserLocal?: boolean;
}

const SettingContainer = ({
  icon,
  title,
  description,
  browserLocal = false,
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
          <div className="flex-grow flex-row">
            <span className="title-xs">{title}</span>
            {browserLocal && (
              <Pill
                className="margin-left-4"
                size={PillSize.compact}
                variant={PillVariant.colored}
                color={{ red: 43, green: 136, blue: 216 }}
              >
                Browser local
              </Pill>
            )}
          </div>
          {children}
        </div>
        <div className="margin-top-8">{description}</div>
      </div>
    </div>
  );
};

export default SettingContainer;
