import { Card } from 'azure-devops-ui/Card';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Toggle } from 'azure-devops-ui/Toggle';
import { useEffect, useMemo, useState } from 'react';
import SettingRow from '../../common/components/setting-section/SettingRow';
import { SettingSection } from '../../common/components/setting-section/types';

import { StorageService } from '../../common/services/StorageService';
import { CriteriaTypes, GlobalSettingsDocument } from '../../common/types';
import PageWrapper from '../components/PageWrapper';



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
