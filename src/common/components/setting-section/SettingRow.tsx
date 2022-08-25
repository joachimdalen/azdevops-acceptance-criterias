import { Toggle } from 'azure-devops-ui/Toggle';

import { SettingRow } from './types';

const SettingRow = ({
  settings,
  toggle,
  disabled,
  id
}: {
  id: string;
  disabled?: boolean;
  settings: SettingRow;
  toggle: (key: string, value: boolean) => Promise<void>;
}): JSX.Element => {
  return (
    <div className="flex-row padding-vertical-16 padding-horizontal-20 separator-line-bottom">
      <div className="flex-column padding-right-16">
        <Toggle
          onText="On"
          offText="Off"
          text={settings.title}
          disabled={disabled}
          id={id}
          onChange={(e, c) => {
            toggle('root', c);
          }}
          checked={settings.checked}
        />
      </div>
      <div className="flex-column flex-grow margin-left-16 padding-horizontal-16">
        <div className="flex-row flex-wrap">
          <div className="flex-column flex-grow">
            <h3 className="body-m margin-0 flex-row">
              <span className="icon-margin">{settings.title}</span>
            </h3>
            {settings.description && (
              <div className="body-s">
                <div className="secondary-text">{settings.description}</div>
              </div>
            )}
          </div>
        </div>

        {settings.checked && settings.options && (
          <div className="flex-column rhythm-vertical-16">
            <div className="padding-top-16">
              <div className="flex-row">
                <div className="flex-column rhythm-vertical-16">
                  {settings.options.map(s => {
                    return (
                      <Toggle
                        key={s.id}
                        text={s.title}
                        disabled={disabled}
                        checked={s.checked}
                        onChange={(e, c) => toggle(s.id, c)}
                        className="secondary-text"
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SettingRow;
