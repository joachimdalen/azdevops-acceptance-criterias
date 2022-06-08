import { CriteriaTemplateModalResult } from '../common/common';
import SettingRow from '../common/components/setting-section/SettingRow';
import { SettingSection } from '../common/components/setting-section/types';
import CheckListCriteriaSection from '../common/criterias/checklist/CheckListCriteriaSection';
import { useCriteriaBuilderContext } from '../common/criterias/CriteriaBuilderContext';
import ScenarioCriteriaSection from '../common/criterias/scenario/ScenarioCriteriaSection';
import TextCriteriaSection from '../common/criterias/text/TextCriteriaSection';
import { LocalStorageRawKeys } from '../common/localStorage';
import { CriteriaTemplateDocument, CriteriaTypes } from '../common/types';
import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import { getLoggedInUser } from '@joachimdalen/azdevops-ext-core/IdentityUtils';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Tab, TabBar } from 'azure-devops-ui/Tabs';
import { TabSize } from 'azure-devops-ui/Tabs.Types';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import * as yup from 'yup';
import {
  getCombined,
  getValidationCount,
  getValidationCountByPattern,
  hasError,
  parseValidationError
} from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';

import { v4 as uuidV4 } from 'uuid';
import { getSchema } from '../common/validationSchemas';
import { Pill, PillSize } from 'azure-devops-ui/Pill';
import CriteriaTemplateService from '../common/services/CriteriaTemplateService';
interface TemplatePanelConfig {
  type: CriteriaTypes;
  panel: any;
  templateId?: string;
}

const TemplatePanel = (): React.ReactElement => {
  const [selectedTabId, setSelectedTabId] = useState<'details' | 'criteria'>('details');
  const [config, setConfig] = useState<TemplatePanelConfig | undefined>();
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [title, setTitle] = useState('');
  const [approver, setApprover] = useState<IInternalIdentity | undefined>();
  const [errors, setErrors] = useState<{ [key: string]: string[] } | undefined>();
  const { state, dispatch } = useCriteriaBuilderContext();
  const templateService = useMemo(() => new CriteriaTemplateService(), []);
  const getData = (itemTemplate: CriteriaTemplateDocument) => {
    switch (itemTemplate.type) {
      case 'text':
        return itemTemplate?.text;
      case 'scenario':
        return itemTemplate?.scenario;
      case 'checklist':
        return itemTemplate?.checklist;
    }
  };
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

        if (conf.templateId !== undefined) {
          const template = await templateService.getTemplate(conf.templateId);
          if (template) {
            console.log(template.type);
            dispatch({ type: 'SET_TYPE', data: template.type });
            setTemplateDescription(template.description || '');
            setTemplateName(template.name || '');
            setTitle(template.title);
            dispatch({
              type: 'SET_CRITERIA',
              data: getData(template)
            });
          }
        } else {
          dispatch({ type: 'SET_TYPE', data: conf.type });
        }

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

  const dismiss = () => {
    const config = DevOps.getConfiguration();
    if (config.panel) {
      const res: CriteriaTemplateModalResult = {
        result: 'CANCEL'
      };
      config.panel.close(res);
    }
  };
  const save = async () => {
    if (config !== undefined && config.panel) {
      const schema = getSchema(state.type).concat(
        yup.object().shape({
          name: yup.string().required().min(5).max(100),
          description: yup.string().min(5).max(200)
        })
      );
      const user = await getLoggedInUser();
      const doc: CriteriaTemplateDocument = {
        id: uuidV4(),
        createdAt: new Date(),
        createdBy: user as any,
        name: templateName,
        description: templateDescription,
        title: title,
        type: state.type,
        text: state.type === 'text' ? state.text : undefined,
        checklist: state.type === 'checklist' ? state.checklist : undefined,
        scenario: state.type === 'scenario' ? state.scenario : undefined
      };
      try {
        await schema.validate(doc, { abortEarly: false });
        const res: CriteriaTemplateModalResult = {
          result: 'SAVE',
          data: doc
        };
        config.panel.close(res);
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const data = parseValidationError(error);
          setErrors(data);
          console.log(data);
        } else {
          console.error(error);
        }
      }
    }
  };

  return (
    <PanelWrapper
      rootClassName="custom-scrollbar scroll-hidden"
      contentClassName="full-height h-scroll-hidden"
      okButton={{
        text: 'Save',
        primary: true,
        onClick: () => save(),
        iconProps: { iconName: 'Save' }
      }}
      cancelButton={{ text: 'Close', onClick: () => dismiss() }}
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
            <Tab
              id="details"
              name="Details"
              renderBadge={() => {
                const count = getValidationCount(errors, ['name', 'description']);
                if (count === undefined) return undefined;
                return (
                  <Pill
                    className="bolt-tab-badge"
                    size={PillSize.compact}
                    color={{ red: 184, green: 35, blue: 57 }}
                  >
                    {count}
                  </Pill>
                );
              }}
            />
            <Tab
              id="criteria"
              name="Criteria"
              renderBadge={() => {
                const count = getValidationCount(errors, ['title', 'requiredApprover']);
                const countTwo = getValidationCountByPattern(
                  errors,
                  /^(scenario|text|checklist|]).+$/
                );
                if (count === undefined && countTwo == undefined) return undefined;
                const fullCount = (count || 0) + (countTwo || 0);
                return (
                  <Pill
                    className="bolt-tab-badge"
                    size={PillSize.compact}
                    color={{ red: 184, green: 35, blue: 57 }}
                  >
                    {fullCount}
                  </Pill>
                );
              }}
            />
          </TabBar>
        </Surface>
      </div>

      <ConditionalChildren renderChildren={selectedTabId === 'details'}>
        <div className="rhythm-vertical-16 flex-grow">
          <h3>Template Details</h3>

          <FormItem
            label="Template name"
            error={hasError(errors, 'name')}
            message={getCombined(errors, 'name')}
          >
            <TextField
              value={templateName}
              onChange={(e, v) => setTemplateName(v)}
              placeholder="Give the template a short name..."
            />
          </FormItem>
          <FormItem
            label="Template description"
            error={hasError(errors, 'description')}
            message={getCombined(errors, 'description')}
          >
            <TextField
              multiline
              value={templateDescription}
              onChange={(e, v) => setTemplateDescription(v)}
              placeholder="Introduce the template with a short description..."
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
        <div className="rhythm-vertical-16 flex-grow">
          <h3>Criteria Details</h3>
          <FormItem
            label="Title"
            error={hasError(errors, 'title')}
            message={getCombined(errors, 'title')}
          >
            <TextField
              width={TextFieldWidth.auto}
              placeholder="Short title.."
              value={title}
              maxLength={100}
              onChange={e => {
                setTitle(e.target.value);
              }}
            />
          </FormItem>
          <FormItem
            label="Required Approver"
            error={hasError(errors, 'requiredApprover')}
            message={getCombined(errors, 'requiredApprover')}
          >
            <IdentityPicker
              localStorageKey={LocalStorageRawKeys.HostUrl}
              identity={approver}
              onChange={i => {
                setApprover(i);
              }}
              onClear={() => setApprover(undefined)}
            />
          </FormItem>

          <ConditionalChildren renderChildren={state?.type === 'scenario'}>
            <ScenarioCriteriaSection errors={errors} />
          </ConditionalChildren>
          <ConditionalChildren renderChildren={state?.type === 'checklist'}>
            <CheckListCriteriaSection errors={errors} />
          </ConditionalChildren>
          <ConditionalChildren renderChildren={state?.type === 'text'}>
            <TextCriteriaSection errors={errors} />
          </ConditionalChildren>
        </div>
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default TemplatePanel;
