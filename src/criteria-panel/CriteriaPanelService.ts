import * as DevOps from 'azure-devops-extension-sdk';

import { CriteriaModalResult } from '../common/common';
import { ICriteriaBuilderContextState } from '../common/criterias/CriteriaBuilderContext';
import { ValidationFunc } from '../common/hooks/useValidation';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  GlobalSettingsDocument,
  IAcceptanceCriteria,
  LoadedCriteriaPanelConfig
} from '../common/types';
import { getSchema } from '../common/validationSchemas';

interface CriteriaSavePayload {
  criteria: IAcceptanceCriteria;
  details: CriteriaDetailDocument;
}

class CriteriaPanelService {
  public getCriteriaPayload(
    state: ICriteriaBuilderContextState,
    criteria?: IAcceptanceCriteria,
    details?: CriteriaDetailDocument
  ): CriteriaSavePayload {
    const id = criteria?.id || 'unset';
    const ac: IAcceptanceCriteria = {
      id: id,
      requiredApprover: state.approver,
      state: criteria?.state || AcceptanceCriteriaState.New,
      type: state.type,
      title: state.title
    };

    const acd: CriteriaDetailDocument = {
      __etag: details?.__etag,
      id: id,
      text: state.type === 'text' ? state.text : undefined,
      checklist: state.type === 'checklist' ? state.checklist : undefined,
      scenario: state.type === 'scenario' ? state.scenario : undefined
    };

    return {
      criteria: ac,
      details: acd
    };
  }

  public async save(
    payload: CriteriaSavePayload,
    state: ICriteriaBuilderContextState,
    validate: ValidationFunc<any>,
    settings?: GlobalSettingsDocument
  ): Promise<void> {
    const config = DevOps.getConfiguration() as LoadedCriteriaPanelConfig;
    if (config.panel) {
      const schema = getSchema(state.type, settings?.requireApprovers || false);

      try {
        const isValid = await validate(schema, {
          ...payload.criteria,
          ...payload.details
        });
        if (isValid) {
          const res: CriteriaModalResult = {
            result: 'SAVE',
            data: payload
          };
          config.panel.close(res);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  public dismissPanel(wasChanged = false): void {
    const config = DevOps.getConfiguration() as LoadedCriteriaPanelConfig;
    if (config.panel) {
      const res: CriteriaModalResult = {
        result: 'CANCEL',
        wasChanged
      };
      config.panel.close(res);
    }
  }
}

export default CriteriaPanelService;
