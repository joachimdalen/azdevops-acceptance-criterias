import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import { getLoggedInUser } from '@joachimdalen/azdevops-ext-core/IdentityUtils';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { getCombined, hasError } from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { v4 as uuidV4 } from 'uuid';
import * as yup from 'yup';

import { CriteriaTemplateModalResult } from '../common/common';
import ApiErrorMessageBar from '../common/components/ApiErrorMessageBar';
import CheckListCriteriaSection from '../common/criterias/checklist/CheckListCriteriaSection';
import { useCriteriaBuilderContext } from '../common/criterias/CriteriaBuilderContext';
import ScenarioCriteriaSection from '../common/criterias/scenario/ScenarioCriteriaSection';
import TextCriteriaSection from '../common/criterias/text/TextCriteriaSection';
import { getCriteriaDetails } from '../common/criteriaUtils';
import { DevOpsError, DevOpsErrorCodes } from '../common/DevOpsError';
import useValidation from '../common/hooks/useValidation';
import { LocalStorageRawKeys } from '../common/localStorage';
import CriteriaTemplateService from '../common/services/CriteriaTemplateService';
import {
  CriteriaTemplateDocument,
  CriteriaTypes,
  LoadedTemplatePanelConfig
} from '../common/types';
import { getSchema } from '../common/validationSchemas';
import TemplatePanelTabBar, { TemplatePanelTabs } from './components/TemplatePanelTabBar';
import CriteriaTemplatePanelService from './CriteriaTemplatePanelService';
import { useCriteriaTemplateContext } from './CriteriaTemplateProvider';

const TemplatePanel = (): React.ReactElement => {
  const [selectedTabId, setSelectedTabId] = useState<TemplatePanelTabs>('details');

  const [template, setTemplate] = useState<CriteriaTemplateDocument | undefined>();
  const [apiError, setApiError] = useState<DevOpsError | undefined>();
  const { state: criteriaState, dispatch: criteriaDispatch } = useCriteriaBuilderContext();
  const { state, dispatch } = useCriteriaTemplateContext();
  const [templateService, templatePanelService] = useMemo(
    () => [new CriteriaTemplateService(), new CriteriaTemplatePanelService()],
    []
  );
  const { errors, validate } = useValidation();

  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        WebLogger.information('Loaded criteria panel...');
        await DevOps.ready();

        const conf: LoadedTemplatePanelConfig =
          DevOps.getConfiguration() as LoadedTemplatePanelConfig;

        if (conf.templateId !== undefined) {
          const loadedTemplate = await templateService.getTemplate(conf.templateId);
          if (loadedTemplate) {
            criteriaDispatch({ type: 'SET_TYPE', data: loadedTemplate.type });
            dispatch({ type: 'SET_NAME', data: loadedTemplate.name });
            dispatch({ type: 'SET_DESCRIPTION', data: loadedTemplate.name });
            criteriaDispatch({
              type: 'SET_CRITERIA',
              data: getCriteriaDetails(loadedTemplate.type, loadedTemplate)
            });
            criteriaDispatch({ type: 'SET_APPROVER', data: loadedTemplate.approver });
            criteriaDispatch({ type: 'SET_TITLE', data: loadedTemplate.title });
            setTemplate(loadedTemplate);
          }
        } else {
          criteriaDispatch({ type: 'SET_TYPE', data: conf.type });
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

  const save = async () => {
    setApiError(undefined);
    try {
      const payload = await templatePanelService.getCriteriaPayload(criteriaState, state, template);
      await templatePanelService.save(payload, validate);
    } catch (error) {
      const devOpsError = error as DevOpsError;
      setApiError(devOpsError);
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
      cancelButton={{ text: 'Close', onClick: () => templatePanelService.dismissPanel() }}
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
        <ApiErrorMessageBar apiError={apiError} section="template" />
        <TemplatePanelTabBar
          errors={errors}
          selectedTabId={selectedTabId}
          onTabChanged={id => setSelectedTabId(id)}
        />

        <ConditionalChildren renderChildren={selectedTabId === 'details'}>
          <div className="rhythm-vertical-16 flex-grow">
            <h3>Template Details</h3>

            <FormItem
              label="Template name"
              error={hasError(errors, 'name')}
              message={getCombined(errors, 'name')}
            >
              <TextField
                value={state.name}
                onChange={e => {
                  dispatch({ type: 'SET_NAME', data: e.target.value });
                }}
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
                value={state.description}
                onChange={e => {
                  dispatch({ type: 'SET_DESCRIPTION', data: e.target.value });
                }}
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
                value={criteriaState.title}
                maxLength={100}
                onChange={e => {
                  criteriaDispatch({ type: 'SET_TITLE', data: e.target.value });
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
                identity={criteriaState.approver}
                onChange={i => {
                  criteriaDispatch({ type: 'SET_APPROVER', data: i });
                }}
                onClear={() => criteriaDispatch({ type: 'SET_APPROVER' })}
              />
            </FormItem>

            <ConditionalChildren renderChildren={criteriaState?.type === 'scenario'}>
              <ScenarioCriteriaSection errors={errors} />
            </ConditionalChildren>
            <ConditionalChildren renderChildren={criteriaState?.type === 'checklist'}>
              <CheckListCriteriaSection errors={errors} />
            </ConditionalChildren>
            <ConditionalChildren renderChildren={criteriaState?.type === 'text'}>
              <TextCriteriaSection errors={errors} />
            </ConditionalChildren>
          </div>
        </ConditionalChildren>
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default TemplatePanel;
