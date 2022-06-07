import { CommandBar } from '@fluentui/react';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { MenuItemType } from 'azure-devops-ui/Menu';
import { ColumnMore, ITableColumn, Table } from 'azure-devops-ui/Table';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { ZeroData, ZeroDataActionType } from 'azure-devops-ui/ZeroData';
import { useCallback, useMemo } from 'react';

import {
  renderActionCell,
  renderAgoCell,
  renderIdentityCell,
  renderTextCell
} from '../../../common/cellRenderers';
import {
  CriteriaTemplateModalResult,
  DialogIds,
  IConfirmationConfig,
  PanelIds
} from '../../../common/common';
import CriteriaTypeDisplay from '../../../common/components/CriteriaTypeDisplay';
import { ActionResult } from '../../../common/models/ActionResult';
import { CriteriaTemplateDocument, CriteriaTypes, IExtendedTableCell } from '../../../common/types';

interface CriteriaTemplateTypesProps {
  type: CriteriaTypes;
  templates: CriteriaTemplateDocument[];
  onAdd: (doc: CriteriaTemplateDocument) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
}

const CriteriaTemplateTypes = ({
  type,
  templates,
  onAdd,
  onDelete,
  onDuplicate
}: CriteriaTemplateTypesProps): JSX.Element => {
  const devOpsService = useMemo(() => new DevOpsService(), []);
  const itemProvider = useMemo(
    () => new ArrayItemProvider<CriteriaTemplateDocument>(templates.filter(x => x.type === type)),
    [type, templates]
  );

  const addCriteria = useCallback(() => {
    devOpsService.showPanel<any | undefined, PanelIds>(PanelIds.CriteriaTemplatePanel, {
      title: `New ${type} template`,
      size: 2,
      onClose: async (result: CriteriaTemplateModalResult | undefined) => {
        console.log(result);
        try {
          if (result?.result === 'SAVE' && result.data) {
            onAdd(result.data);
          }
        } catch (error: any) {
          devOpsService.showToast(error.message);
        }
      },

      configuration: {
        type
      }
    });
  }, [type]);

  return (
    <div>
      <CommandBar
        className="separator-line-bottom separator-line-top"
        items={[
          {
            key: 'h',
            text: 'New Template',
            onRenderIcon: props => {
              return <CriteriaTypeDisplay iconOnly type={type} />;
            },
            onClick: addCriteria
          }
        ]}
      />
      <ConditionalChildren renderChildren={itemProvider.length === 0}>
        <ZeroData
          imageAltText={''}
          iconProps={{ render: () => <CriteriaTypeDisplay size={100} iconOnly type={type} /> }}
          primaryText={`No ${type} critera templates added`}
          actionText="Add new template"
          actionType={ZeroDataActionType.ctaButton}
          onActionClick={addCriteria}
        />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={itemProvider.length !== 0}>
        <Table
          columns={[
            {
              id: 'name',
              width: -30,
              name: 'Name',
              renderCell: (
                rowIndex: number,
                columnIndex: number,
                tableColumn: ITableColumn<CriteriaTemplateDocument>,
                tableItem: CriteriaTemplateDocument,
                ariaRowIndex?: number
              ) =>
                renderActionCell(
                  columnIndex,
                  tableColumn,
                  tableItem,
                  {
                    title: tableItem.name,
                    onClick: (item: CriteriaTemplateDocument) => {
                      console.log(item);
                    }
                  },
                  ariaRowIndex
                )
            },
            new ColumnMore((item: CriteriaTemplateDocument) => {
              return {
                id: 'sub-menu',
                items: [
                  {
                    id: 'edit',
                    text: 'Edit template',
                    iconProps: { iconName: 'Edit' }
                  },
                  {
                    id: 'duplicate',
                    text: 'Duplicate',
                    iconProps: { iconName: 'Copy' },
                    onActivate: async () => {
                      await onDuplicate(item.id);
                    }
                  },
                  {
                    id: 'splitter',
                    itemType: MenuItemType.Divider
                  },
                  {
                    id: 'delete',
                    text: 'Delete',
                    iconProps: { iconName: 'Delete', className: 'text-red' },
                    onActivate: async () => await onDelete(item.id)
                  } as any
                ]
              };
            }),
            { id: 'description', width: -70, name: 'Description', renderCell: renderTextCell },
            {
              id: 'createdBy',
              width: -20,
              name: 'Created by',
              renderCell: (
                rowIndex: number,
                columnIndex: number,
                tableColumn: ITableColumn<CriteriaTemplateDocument>,
                tableItem: CriteriaTemplateDocument,
                ariaRowIndex?: number
              ) => renderIdentityCell(columnIndex, tableColumn, tableItem.createdBy, ariaRowIndex)
            },
            {
              id: 'createdAt',
              width: -20,
              name: 'Created',
              renderCell: (
                rowIndex: number,
                columnIndex: number,
                tableColumn: ITableColumn<CriteriaTemplateDocument>,
                tableItem: CriteriaTemplateDocument,
                ariaRowIndex?: number
              ) => renderAgoCell(columnIndex, tableColumn, tableItem.createdAt, ariaRowIndex)
            },
            {
              id: 'updatedBy',
              width: -20,
              name: 'Updated by',
              renderCell: (
                rowIndex: number,
                columnIndex: number,
                tableColumn: ITableColumn<CriteriaTemplateDocument>,
                tableItem: CriteriaTemplateDocument,
                ariaRowIndex?: number
              ) => renderIdentityCell(columnIndex, tableColumn, tableItem.updatedBy, ariaRowIndex)
            },
            {
              id: 'updatedAt',
              width: -20,
              name: 'Last updated',
              renderCell: (
                rowIndex: number,
                columnIndex: number,
                tableColumn: ITableColumn<CriteriaTemplateDocument>,
                tableItem: CriteriaTemplateDocument,
                ariaRowIndex?: number
              ) => renderAgoCell(columnIndex, tableColumn, tableItem.updatedAt, ariaRowIndex)
            }
          ]}
          itemProvider={itemProvider}
        />
      </ConditionalChildren>
    </div>
  );
};

export default CriteriaTemplateTypes;
