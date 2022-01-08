import { IHostPageLayoutService, PanelSize } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

import { IAcceptanceCriteria } from '../common';

export interface CriteriaModalResult {
  result: 'CANCEL' | 'SAVE';
  criteria?: IAcceptanceCriteria;
}

class CriteriaNavigationService {
  private readonly CriteriaModalSuffix: string = '.criteria-panel';
  private readonly HostPageLayoutServiceId: string = 'ms.vss-features.host-page-layout-service';

  private getFullId(suffix: string): string {
    return DevOps.getExtensionContext().id + suffix;
  }

  public async showCriteriaModal(
    onClose: (result: CriteriaModalResult) => void,
    criteria?: IAcceptanceCriteria
  ): Promise<void> {
    DevOps.getService<IHostPageLayoutService>(this.HostPageLayoutServiceId).then(dialogService => {
      const id = this.getFullId(this.CriteriaModalSuffix);
      dialogService.openPanel(id, {
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
      });
    });
  }
}

export default CriteriaNavigationService;
