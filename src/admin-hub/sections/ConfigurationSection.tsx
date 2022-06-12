import { LoadingSection } from '@joachimdalen/azdevops-ext-core/LoadingSection';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import { Button } from 'azure-devops-ui/Button';
import { Card } from 'azure-devops-ui/Card';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { useEffect, useMemo, useState } from 'react';

import ApiErrorMessageBar from '../../common/components/ApiErrorMessageBar';
import SettingRow from '../../common/components/setting-section/SettingRow';
import { SettingSection } from '../../common/components/setting-section/types';
import { DevOpsError } from '../../common/DevOpsError';
import { StorageService } from '../../common/services/StorageService';
import { CriteriaTypes, GlobalSettingsDocument } from '../../common/types';
import LoadingButton from '../components/LoadingButton';
import PageWrapper from '../components/PageWrapper';

const ConfigurationSection = (): React.ReactElement => {
  const storageService = useMemo(() => new StorageService(), []);
  const [loading, toggleLoading] = useBooleanToggle(true);
  const [resetting, toggleResetting] = useBooleanToggle(true);
  const [settings, setSettings] = useState<GlobalSettingsDocument>();
  const [apiError, setApiError] = useState<DevOpsError>();

  useEffect(() => {
    async function init() {
      try {
        const loadedSetting = await storageService.getSettings();
        setSettings(loadedSetting);
      } catch (error) {
        WebLogger.error(error);
        setApiError(error as DevOpsError);
      } finally {
        toggleLoading();
      }
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
        key: 'limit-types',
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
        key: 'require-approver',
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
        <LoadingSection isLoading={loading} text="Loading configuration..." />
        <ApiErrorMessageBar apiError={apiError} section="configuration" />
        <ConditionalChildren renderChildren={!loading}>
          <div className="rhythm-vertical-16 flex-column">
            <Card
              titleProps={{ text: 'Settings' }}
              headerCommandBarItems={[
                {
                  disabled: apiError !== undefined,
                  id: 'reset-configuration',
                  text: 'Reset configuration',
                  renderButton: props => (
                    <LoadingButton
                      loadingText="Resetting configuration..."
                      key={props.id}
                      {...props}
                      danger
                      onClick={async () => {
                        const newSettings = await storageService.resetSettings();
                        setSettings(newSettings);
                      }}
                    />
                  )
                }
              ]}
            >
              <div className="flex-column flex-grow">
                {sections.map(section => {
                  return (
                    <SettingRow
                      disabled={apiError !== undefined}
                      key={section.key}
                      id={section.key}
                      settings={section.setting}
                      toggle={section.toggle}
                    />
                  );
                })}
              </div>
            </Card>
          </div>
        </ConditionalChildren>
      </Surface>
    </PageWrapper>
  );
};

export default ConfigurationSection;
