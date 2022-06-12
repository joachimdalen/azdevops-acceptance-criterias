import { getLoggedInUser } from '@joachimdalen/azdevops-ext-core/IdentityUtils';
import * as DevOps from 'azure-devops-extension-sdk';
import { v4 as uuidV4 } from 'uuid';
import * as yup from 'yup';

import { CriteriaTemplateModalResult } from '../common/common';
import { ICriteriaBuilderContextState } from '../common/criterias/CriteriaBuilderContext';
import { ValidationFunc } from '../common/hooks/useValidation';
import CriteriaTemplateService from '../common/services/CriteriaTemplateService';
import {
  CriteriaTemplateDocument,
  GlobalSettingsDocument,
  LoadedTemplatePanelConfig
} from '../common/types';
import { getSchema } from '../common/validationSchemas';
import {
  ICriteriaTemplateContext,
  ICriteriaTemplateContextState
} from './CriteriaTemplateProvider';

class CriteriaTemplatePanelService {
  private readonly _templateService: CriteriaTemplateService;

  constructor() {
    this._templateService = new CriteriaTemplateService();
  }

  public async getCriteriaPayload(
    criteriaState: ICriteriaBuilderContextState,
    templateState: ICriteriaTemplateContextState,
    template?: CriteriaTemplateDocument
  ): Promise<CriteriaTemplateDocument> {
    const user = await getLoggedInUser();
    const doc: CriteriaTemplateDocument = {
      __etag: template?.__etag,
      id: template?.id || uuidV4(),
      createdAt: template?.createdAt || new Date(),
      createdBy: template?.createdBy || (user as any),
      updatedAt: template === undefined ? undefined : new Date(),
      updatedBy: template === undefined ? undefined : (user as any),
      name: templateState.name,
      description: templateState.description,
      approver: criteriaState.approver,
      title: criteriaState.title,
      type: criteriaState.type,
      text: criteriaState.type === 'text' ? criteriaState.text : undefined,
      checklist: criteriaState.type === 'checklist' ? criteriaState.checklist : undefined,
      scenario: criteriaState.type === 'scenario' ? criteriaState.scenario : undefined
    };

    return doc;
  }

  public async save(
    payload: CriteriaTemplateDocument,
    validate: ValidationFunc<any>,
    settings?: GlobalSettingsDocument
  ): Promise<void> {
    const config = DevOps.getConfiguration() as LoadedTemplatePanelConfig;
    const schema = getSchema(payload.type).concat(
      yup.object().shape({
        name: yup.string().required().min(5).max(100),
        description: yup.string().min(5).max(200)
      })
    );
    const valid = await validate(schema, payload);
    if (valid) {
      await this._templateService.createOrUpdate(payload);
      const res: CriteriaTemplateModalResult = {
        result: 'SAVE',
        data: payload
      };
      config.panel.close(res);
    }
  }

  public dismissPanel(): void {
    const config = DevOps.getConfiguration() as LoadedTemplatePanelConfig;
    if (config.panel) {
      const res: CriteriaTemplateModalResult = {
        result: 'CANCEL'
      };
      config.panel.close(res);
    }
  }
}

export default CriteriaTemplatePanelService;
