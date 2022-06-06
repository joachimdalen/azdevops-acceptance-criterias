import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Tab, TabBar } from 'azure-devops-ui/Tabs';
import { TabSize } from 'azure-devops-ui/Tabs.Types';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useState } from 'react';
import * as React from 'react';

import SettingRow from '../common/components/setting-section/SettingRow';
import { SettingSection } from '../common/components/setting-section/types';
import CheckListCriteriaSection from '../common/criterias/checklist/CheckListCriteriaSection';
import ScenarioCriteriaSection from '../common/criterias/scenario/ScenarioCriteriaSection';
import TextCriteriaSection from '../common/criterias/text/TextCriteriaSection';
import { LocalStorageRawKeys } from '../common/localStorage';
import { CriteriaTypes } from '../common/types';

interface TemplatePanelConfig {
  type: CriteriaTypes;
  panel: any;
}

const TemplatePanel = (): React.ReactElement => {
  const [selectedTabId, setSelectedTabId] = useState<'details' | 'criteria'>('details');
  const [config, setConfig] = useState<TemplatePanelConfig | undefined>();

  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        WebLogger.information('Loaded criteria panel...');
        await DevOps.ready();

        const conf: TemplatePanelConfig = DevOps.getConfiguration() as TemplatePanelConfig;
        setConfig(conf);

        await DevOps.notifyLoadSucceeded();
        DevOps.resize();
      } catch (error) {
        WebLogger.error('Load failed', error);
      }
    }

    initModule();
  }, []);

  const sections: SettingSection[] = [
    {
      setting: {
        title: 'Lock changes',
        description:
          'Disallows the user to make changes before saving the criteria. Title and Approver can still be changed',
        checked: false
      },
      toggle: async (key: string, value: boolean) => {
        console.log('d');
      }
    },
    {
      setting: {
        title: 'Require Approver',
        description: 'Allow the user to make changes before saving the criteria',
        checked: false
      },
      toggle: async (key: string, value: boolean) => {
        console.log('d');
      }
    }
  ];

  return (
    <PanelWrapper
      rootClassName="custom-scrollbar scroll-hidden"
      contentClassName="full-height h-scroll-hidden"
      okButton={{
        text: 'Save',
        primary: true,
        onClick: () => console.log(''),
        iconProps: { iconName: 'Save' }
      }}
      moduleVersion={process.env.CRITERIA_TEMPLATE_PANEL_VERSION}
    >
      <div>
        <Surface background={SurfaceBackground.callout}>
          <TabBar
            selectedTabId={selectedTabId}
            onSelectedTabChanged={(newTabId: string) => setSelectedTabId(newTabId as any)}
            tabSize={TabSize.Compact}
            className="margin-bottom-16"
          >
            <Tab id="details" name="Details" />
            <Tab id="criteria" name="Criteria" />
          </TabBar>
        </Surface>
      </div>

      <ConditionalChildren renderChildren={selectedTabId === 'details'}>
        <div className="rhythm-vertical-16 flex-grow">
          <h3>Template Details</h3>
          <FormItem label="Template name">
            <TextField />
          </FormItem>
          <FormItem label="Template description">
            <TextField multiline />
          </FormItem>
        </div>
        <div className="rhythm-vertical-16 flex-grow">
          <h3>Criteria Details</h3>
          <FormItem label="Title">
            <TextField
              width={TextFieldWidth.auto}
              placeholder="Short title.."
              maxLength={100}
              onChange={e => {
                console.log(e.target.value);
              }}
            />
          </FormItem>
          <FormItem label="Required Approver">
            <IdentityPicker
              localStorageKey={LocalStorageRawKeys.HostUrl}
              onChange={i => {
                console.log(i);
              }}
            />
          </FormItem>
        </div>
        <div className="rhythm-vertical-16 flex-grow">
          <h3>Options</h3>
          <div className="margin-top-16 flex-column flex-grow">
            {sections.map(section => {
              return <SettingRow settings={section.setting} toggle={section.toggle} />;
            })}
          </div>
        </div>
      </ConditionalChildren>
      <ConditionalChildren renderChildren={selectedTabId === 'criteria'}>
        <ConditionalChildren renderChildren={config?.type === 'scenario'}>
          <ScenarioCriteriaSection errors={undefined} />
        </ConditionalChildren>
        <ConditionalChildren renderChildren={config?.type === 'checklist'}>
          <CheckListCriteriaSection errors={undefined} />
        </ConditionalChildren>
        <ConditionalChildren renderChildren={config?.type === 'text'}>
          <TextCriteriaSection errors={undefined} />
        </ConditionalChildren>
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default TemplatePanel;
