import { CriteriaTemplateDocument } from '../types';
import { IStorageService, StorageService } from './StorageService';
import { v4 as uuidV4 } from 'uuid';
import { getLoggedInUser } from '@joachimdalen/azdevops-ext-core/IdentityUtils';
import { DevOpsService, IDevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { CriteriaTemplateModalResult, DialogIds, IConfirmationConfig, PanelIds } from '../common';
import { ActionResult } from '@joachimdalen/azdevops-ext-core/CommonTypes';
class CriteriaTemplateService {
  private readonly _dataStore: IStorageService;
  private readonly _devOpsService: IDevOpsService;

  constructor(dataStore?: IStorageService) {
    this._dataStore = dataStore || new StorageService();
    this._devOpsService = new DevOpsService();
  }

  public async getTemplates(): Promise<CriteriaTemplateDocument[]> {
    try {
      const templates = await this._dataStore.getTemplates();
      return templates;
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
      return [];
    }
  }
  public async getTemplate(id: string): Promise<CriteriaTemplateDocument | undefined> {
    try {
      const template = await this._dataStore.getTemplate(id);
      return template;
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
    }
  }

  public async createOrUpdate(doc: CriteriaTemplateDocument): Promise<CriteriaTemplateDocument> {
    const updated = await this._dataStore.setTemplate(doc);
    return updated;
  }
  public async delete(id: string, onDelete: () => void): Promise<void> {
    const confirmConfig: IConfirmationConfig = {
      cancelButton: {
        text: 'Close'
      },
      confirmButton: {
        text: 'Delete',
        danger: true,
        iconProps: {
          iconName: 'Delete'
        }
      },
      content: `Are you sure you want to delete this template?`
    };
    await this._devOpsService.showDialog<ActionResult<boolean>, DialogIds>(
      DialogIds.ConfirmationDialog,
      {
        title: 'Delete template?',
        onClose: async result => {
          if (result?.success) {
            //  await this._dataStore.deleteTemplate(id);
            onDelete();
          }
        },
        configuration: confirmConfig
      }
    );
  }

  public async edit(
    id: string | undefined,
    onUpdate: (item: CriteriaTemplateDocument) => Promise<void>
  ): Promise<void> {
    await this._devOpsService.showPanel<any | undefined, PanelIds>(PanelIds.CriteriaTemplatePanel, {
      title: `Edit template`,
      size: 2,
      onClose: async (result: CriteriaTemplateModalResult | undefined) => {
        console.log(result);
        try {
          if (result?.result === 'SAVE' && result.data) {
            const updated = await this.createOrUpdate(result.data);
            onUpdate(updated);
          }
        } catch (error: any) {
          this._devOpsService.showToast(error.message);
        }
      },

      configuration: {
        templateId: id
      }
    });
  }

  public async duplicate(id: string): Promise<CriteriaTemplateDocument> {
    const template = await this._dataStore.getTemplate(id);
    if (template === undefined) {
      throw new Error('Failed to find template');
    }
    const user = await getLoggedInUser();

    if (user === undefined) {
      throw new Error('Failed to duplicate template');
    }

    const newTemplate: CriteriaTemplateDocument = {
      ...template,
      name: `${template.name} (Copy)`,
      id: uuidV4(),
      createdAt: new Date(),
      createdBy: user,
      updatedAt: undefined,
      updatedBy: undefined
    };

    const added = await this.createOrUpdate(newTemplate);
    return added;
  }
}

export default CriteriaTemplateService;
