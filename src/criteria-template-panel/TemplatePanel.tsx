import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import { getLoggedInUser } from '@joachimdalen/azdevops-ext-core/IdentityUtils';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import {
  getCombined,
  getValidationCount,
  getValidationCountByPattern,
  hasError
} from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { MessageBar, MessageBarSeverity } from 'azure-devops-ui/MessageBar';
import { Pill, PillSize } from 'azure-devops-ui/Pill';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Tab, TabBar } from 'azure-devops-ui/Tabs';
import { TabSize } from 'azure-devops-ui/Tabs.Types';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { v4 as uuidV4 } from 'uuid';
import * as yup from 'yup';

import { CriteriaTemplateModalResult } from '../common/common';
import SettingRow from '../common/components/setting-section/SettingRow';
import { SettingSection } from '../common/components/setting-section/types';
import CheckListCriteriaSection from '../common/criterias/checklist/CheckListCriteriaSection';
import { useCriteriaBuilderContext } from '../common/criterias/CriteriaBuilderContext';
import ScenarioCriteriaSection from '../common/criterias/scenario/ScenarioCriteriaSection';
import TextCriteriaSection from '../common/criterias/text/TextCriteriaSection';
import { DevOpsError, DevOpsErrorCodes, knownDevOpsErros } from '../common/DevOpsError';
import useValidation from '../common/hooks/useValidation';
import { LocalStorageRawKeys } from '../common/localStorage';
import CriteriaTemplateService from '../common/services/CriteriaTemplateService';
import { CriteriaTemplateDocument, CriteriaTypes } from '../common/types';
import { getSchema } from '../common/validationSchemas';
interface TemplatePanelConfig {
  type: CriteriaTypes;
  panel: any;
  templateId?: string;
}

const TemplatePanel = (): React.ReactElement => {
  const [selectedTabId, setSelectedTabId] = useState<'details' | 'criteria'>('details');
  const [config, setConfig] = useState<TemplatePanelConfig | undefined>();
  const [template, setTemplate] = useState<CriteriaTemplateDocument | undefined>();
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [title, setTitle] = useState('');
  const [approver, setApprover] = useState<IInternalIdentity | undefined>();
  //const [errors, setErrors] = useState<{ [key: string]: string[] } | undefined>();
  const [apiError, setApiError] = useState<DevOpsError | undefined>();
  const { state, dispatch } = useCriteriaBuilderContext();
  const templateService = useMemo(() => new CriteriaTemplateService(), []);
  const { errors, validate } = useValidation();
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
          const loadedTemplate = await templateService.getTemplate(conf.templateId);
          if (loadedTemplate) {
            dispatch({ type: 'SET_TYPE', data: loadedTemplate.type });
            setTemplateDescription(loadedTemplate.description || '');
            setTemplateName(loadedTemplate.name || '');
            setTitle(loadedTemplate.title);
            setApprover(loadedTemplate.approver);
            dispatch({
              type: 'SET_CRITERIA',
              data: getData(loadedTemplate)
            });
            setTemplate(loadedTemplate);
          }
        } else {
          dispatch({ type: 'SET_TYPE', data: conf.type });
        }
      } catch (error) {
        const devOpsError = error as DevOpsError;
        setApiError(devOpsError);
        if (devOpsError.serverError.typeKey === undefined) {
          WebLogger.error('Failed to load template');
        }
      } finally {
        await DevOps.notifyLoadSucceeded();
        DevOps.resize();
      }
    }

    initModule();
  }, []);

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
    setApiError(undefined);
    if (config !== undefined && config.panel) {
      const schema = getSchema(state.type).concat(
        yup.object().shape({
          name: yup.string().required().min(5).max(100),
          description: yup.string().min(5).max(200)
        })
      );
      const user = await getLoggedInUser();
      const doc: CriteriaTemplateDocument = {
        __etag: template?.__etag,
        id: config.templateId || uuidV4(),
        createdAt: template?.createdAt || new Date(),
        createdBy: template?.createdBy || (user as any),
        updatedAt: template === undefined ? undefined : new Date(),
        updatedBy: template === undefined ? undefined : (user as any),
        name: templateName,
        description: templateDescription,
        approver: approver,
        title: title,
        type: state.type,
        text: state.type === 'text' ? state.text : undefined,
        checklist: state.type === 'checklist' ? state.checklist : undefined,
        scenario: state.type === 'scenario' ? state.scenario : undefined
      };

      try {
        const valid = await validate(schema, doc);
        if (valid) {
          const added = await templateService.createOrUpdate(doc);
          const res: CriteriaTemplateModalResult = {
            result: 'SAVE',
            data: added
          };
          config.panel.close(res);
        }
      } catch (error) {
        const devOpsError = error as DevOpsError;
        setApiError(devOpsError);
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
      <ConditionalChildren
        renderChildren={
          apiError !== undefined &&
          apiError?.serverError?.typeKey === DevOpsErrorCodes.DocumentDoesNotExistException
        }
      >
        <ZeroData
          primaryText="Failed to find template"
          iconProps={{ iconName: 'FileTemplate' }}
          imageAltText={''}
        />
      </ConditionalChildren>
      <ConditionalChildren
        renderChildren={
          apiError === undefined ||
          apiError?.serverError?.typeKey !== DevOpsErrorCodes.DocumentDoesNotExistException
        }
      >
        <ConditionalChildren renderChildren={apiError !== undefined}>
          <MessageBar severity={MessageBarSeverity.Error} className="margin-bottom-4">
            {apiError?.serverError && knownDevOpsErros[apiError.serverError.typeKey]}
          </MessageBar>
        </ConditionalChildren>
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
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default TemplatePanel;
