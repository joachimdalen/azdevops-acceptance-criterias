import { Card } from 'azure-devops-ui/Card';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Toggle } from 'azure-devops-ui/Toggle';
import { useEffect, useMemo, useState } from 'react';

import { StorageService } from '../../common/services/StorageService';
import { CriteriaTypes, GlobalSettingsDocument } from '../../common/types';
import PageWrapper from '../components/PageWrapper';

interface SettingSection {
  setting: SettingRow;
  toggle: (key: string, value: boolean) => Promise<void>;
}

interface SettingRow {
  title: string;
  description?: string;
  checked: boolean;
  options?: { id: string; checked: boolean; title: string }[];
}

const SettingRow = ({
  settings,
  toggle
}: {
  settings: SettingRow;
  toggle: (key: string, value: boolean) => Promise<void>;
}) => {
  return (
    <div className="flex-row padding-vertical-16 padding-horizontal-20 separator-line-bottom">
      <div className="flex-column padding-right-16">
        <Toggle
          onText="On"
          offText="Off"
          text="Hello"
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
                      <div className="body-m flex-center flex-row" key={s.id}>
                        <Toggle checked={s.checked} onChange={(e, c) => toggle(s.id, c)} />
                        <div className="secondary-text">{s.title}</div>
                      </div>
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

const AdminConfigurationTab = (): React.ReactElement => {
  const storageService = useMemo(() => new StorageService(), []);
  const [settings, setSettings] = useState<GlobalSettingsDocument>();

  useEffect(() => {
    async function init() {
      const loadedSetting = await storageService.getSettings();
      setSettings(loadedSetting);
    }

    init();
  }, []);

  const updateCriteria = async (key: string, value: boolean) => {
    if (settings === undefined) return;
    const newSettings = { ...settings };

    if (key === 'root') {
      newSettings.limitAllowedCriteriaTypes = value;

      if (value) {
        newSettings.allowedCriteriaTypes = ['checklist', 'scenario', 'text'];
      } else {
        newSettings.allowedCriteriaTypes = [];
      }
    } else {
      const typedKey = key as CriteriaTypes;

      if (newSettings.allowedCriteriaTypes.includes(typedKey)) {
        newSettings.allowedCriteriaTypes = newSettings.allowedCriteriaTypes?.filter(
          x => x !== typedKey
        );
      } else {
        newSettings.allowedCriteriaTypes = [...settings.allowedCriteriaTypes, typedKey];
      }
    }

    newSettings.allowedCriteriaTypes = newSettings.allowedCriteriaTypes.sort(
      (a: CriteriaTypes, b: CriteriaTypes) => (a as string).localeCompare(b as string)
    );
    const updated = await storageService.setSettings(newSettings);
    setSettings(updated);
  };

  const sections: SettingSection[] = useMemo(() => {
    return [
      {
        setting: {
          title: 'Limit criteria types',
          description: 'Select what criteria types can be created',
          checked: settings?.limitAllowedCriteriaTypes || false,
          options: [
            {
              id: 'checklist',
              title: 'Checklist',
              checked: settings?.allowedCriteriaTypes.includes('checklist') || false
            },
            {
              id: 'scenario',
              title: 'Scenario',
              checked: settings?.allowedCriteriaTypes.includes('scenario') || false
            },
            {
              id: 'text',
              title: 'Text',
              checked: settings?.allowedCriteriaTypes.includes('text') || false
            }
          ]
        },
        toggle: updateCriteria
      },
      {
        setting: {
          title: 'Require approver on all criterias',
          description: 'Ensures all criterias is created with assigned approvers',
          checked: settings?.requireApprovers || false
        },
        toggle: async (key: string, value: boolean) => {
          if (settings === undefined) return;
          const newSettings = { ...settings };
          newSettings.requireApprovers = value;
          const updated = await storageService.setSettings(newSettings);
          setSettings(updated);
        }
      }
    ];
  }, [settings]);

  return (
    <PageWrapper>
      <Surface background={SurfaceBackground.neutral}>
        <div className="rhythm-vertical-16 flex-column">
          <Card
            titleProps={{ text: 'Settings' }}
            headerCommandBarItems={[
              {
                id: 'reset-configuration',
                text: 'Reset configuration',
                isPrimary: true,
                onActivate: () => {
                  storageService.resetSettings().then(newSettings => setSettings(newSettings));
                }
              }
            ]}
          >
            <div className="flex-column flex-grow">
              {sections.map(section => {
                return <SettingRow settings={section.setting} toggle={section.toggle} />;
              })}
            </div>
          </Card>
        </div>
      </Surface>
    </PageWrapper>
  );
};

export default AdminConfigurationTab;
