import { CommandBar } from '@fluentui/react';
import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableValue } from 'azure-devops-ui/Core/Observable';
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
import { CriteriaTemplateModalResult, PanelIds } from '../../../common/common';
import CriteriaTypeDisplay from '../../../common/components/CriteriaTypeDisplay';
import { CriteriaTemplateDocument, CriteriaTypes } from '../../../common/types';

interface CriteriaTemplateTypesProps {
  type: CriteriaTypes;
  templates: CriteriaTemplateDocument[];
  onAdd: (doc: CriteriaTemplateDocument) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onOpen: (id: string) => Promise<void>;
}

const CriteriaTemplateTypes = ({
  type,
  templates,
  onAdd,
  onDelete,
  onDuplicate,
  onOpen
}: CriteriaTemplateTypesProps): JSX.Element => {
  const devOpsService = useMemo(() => new DevOpsService(), []);

  const itemProvider = useMemo(
    () => new ArrayItemProvider(templates.filter(x => x.type === type)),
    [type, templates]
  );

  const addCriteria = useCallback(() => {
    devOpsService.showPanel<any | undefined, PanelIds>(PanelIds.CriteriaTemplatePanel, {
      title: `New ${type} template`,
      size: 2,
      onClose: async (result: CriteriaTemplateModalResult | undefined) => {
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

  const tableColumns: ITableColumn<CriteriaTemplateDocument>[] = useMemo(
    () => [
      {
        id: 'name',
        width: new ObservableValue(-30),
        name: 'Name',
        onSize: onSize,
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
              onClick: async (item: CriteriaTemplateDocument) => {
                await onOpen(item.id);
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
              iconProps: { iconName: 'Edit' },
              onActivate: async () => {
                await onOpen(item.id);
              }
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
      {
        id: 'description',
        onSize: onSize,
        width: new ObservableValue(-70),
        name: 'Description',
        renderCell: renderTextCell
      },
      {
        id: 'createdBy',
        width: new ObservableValue(-20),
        name: 'Created by',
        onSize: onSize,
        renderCell: (
          rowIndex: number,
          columnIndex: number,
          tableColumn: ITableColumn<CriteriaTemplateDocument>,
          tableItem: CriteriaTemplateDocument,
          ariaRowIndex?: number
        ) => renderIdentityCell(columnIndex, tableColumn, tableItem.createdBy, ariaRowIndex, false)
      },
      {
        id: 'createdAt',
        width: new ObservableValue(-20),
        name: 'Created',
        onSize: onSize,

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
        width: new ObservableValue(-20),
        name: 'Updated by',
        onSize: onSize,
        renderCell: (
          rowIndex: number,
          columnIndex: number,
          tableColumn: ITableColumn<CriteriaTemplateDocument>,
          tableItem: CriteriaTemplateDocument,
          ariaRowIndex?: number
        ) => renderIdentityCell(columnIndex, tableColumn, tableItem.updatedBy, ariaRowIndex, false)
      },
      {
        id: 'updatedAt',
        width: new ObservableValue(-20),
        name: 'Last updated',
        onSize: onSize,

        renderCell: (
          rowIndex: number,
          columnIndex: number,
          tableColumn: ITableColumn<CriteriaTemplateDocument>,
          tableItem: CriteriaTemplateDocument,
          ariaRowIndex?: number
        ) => renderAgoCell(columnIndex, tableColumn, tableItem.updatedAt, ariaRowIndex)
      }
    ],
    [type]
  );

  function onSize(
    event: MouseEvent | KeyboardEvent,
    columnIndex: number,
    width: number,
    column: ITableColumn<CriteriaTemplateDocument>
  ) {
    (tableColumns[columnIndex].width as ObservableValue<number>).value = width;
  }

  return (
    <div>
      <CommandBar
        className="separator-line-bottom separator-line-top"
        items={[
          {
            key: 'new-template',
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
        <Table columns={tableColumns} itemProvider={itemProvider} />
      </ConditionalChildren>
    </div>
  );
};

export default CriteriaTemplateTypes;
