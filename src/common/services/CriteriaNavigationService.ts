import { DevOpsService, IDevOpsService } from '@joachimdalen/azdevops-ext-core';

import { IAcceptanceCriteria } from '../common';

export enum PanelIds {
  CriteriaPanel = 'criteria-panel'
}

export interface CriteriaModalResult {
  result: 'CANCEL' | 'SAVE';
  criteria?: IAcceptanceCriteria;
}

class CriteriaNavigationService {
  private _devOpsService: IDevOpsService;

  constructor() {
    this._devOpsService = new DevOpsService();
  }

  public async showCriteriaModal(
    onClose: (result: CriteriaModalResult) => void,
    criteria?: IAcceptanceCriteria
  ): Promise<void> {
    await this._devOpsService.showPanel<CriteriaModalResult | undefined, PanelIds>(
      PanelIds.CriteriaPanel,
      {
        title: 'Acceptance Criteria',
        size: 2,
        configuration: {
          criteria
        },
        onClose: (result: CriteriaModalResult | undefined) => {
          if (result === undefined) {
            onClose({ result: 'CANCEL' });
          } else {
            onClose(result);
          }
        }
      }
    );
  }
}

export default CriteriaNavigationService;
