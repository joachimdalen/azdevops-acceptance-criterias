import { CommandBar, getDateRangeArray, ICommandBarItemProps } from '@fluentui/react';
import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableArray, ObservableValue } from 'azure-devops-ui/Core/Observable';
import { FilterBar } from 'azure-devops-ui/FilterBar';
import { ListSelection } from 'azure-devops-ui/List';
import { MenuItemType } from 'azure-devops-ui/Menu';
import {
  ColumnMore,
  ColumnSelect,
  ColumnSorting,
  ITableColumn,
  sortItems,
  SortOrder,
  Table
} from 'azure-devops-ui/Table';
import { KeywordFilterBarItem } from 'azure-devops-ui/TextFilterBarItem';
import { Filter, IFilterState } from 'azure-devops-ui/Utilities/Filter';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { ZeroData, ZeroDataActionType } from 'azure-devops-ui/ZeroData';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  renderActionCell,
  renderAgoCell,
  renderIdentityCell,
  renderTextCell
} from '../../../common/cellRenderers';
import { CriteriaTemplateModalResult, PanelIds } from '../../../common/common';
import CriteriaTypeDisplay from '../../../common/components/CriteriaTypeDisplay';
import { CriteriaTemplateDocument, CriteriaTypes } from '../../../common/types';
import TemplatesFilterBar from './TemplatesFilterBar';

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
  const [internalTemplates, setInternalTemplates] = useState<CriteriaTemplateDocument[]>([]);
  const [visibleTemplates, setVisibleTemplates] = useState<CriteriaTemplateDocument[]>([]);
  const devOpsService = useMemo(() => new DevOpsService(), []);

  useEffect(() => {
    setInternalTemplates(templates.filter(x => x.type === type));
    setVisibleTemplates(templates.filter(x => x.type === type));
  }, [templates, type]);

  const itemProvider = useMemo(
    () => new ArrayItemProvider(visibleTemplates),
    [type, visibleTemplates]
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
        ) => renderIdentityCell(columnIndex, tableColumn, tableItem.createdBy, ariaRowIndex)
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
        ) => renderIdentityCell(columnIndex, tableColumn, tableItem.updatedBy, ariaRowIndex)
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
  const applyFilter = (filter: IFilterState) => {
    let items = [...internalTemplates];
    if (Object.keys(filter).length === 0) {
      setVisibleTemplates(items);
      return;
    }

    const title = filter['title'];
    if (title) {
      items = items.filter(
        v => v.title.toLocaleLowerCase().indexOf(title.value?.toLocaleLowerCase()) > -1
      );
    }

    const creators = filter['creators'];

    if (creators && creators.value.length > 0) {
      items = items.filter(v => creators.value.includes(v.createdBy.entityId));
    }
    setVisibleTemplates(items);
  };

  const filterFunc = useCallback(filter => applyFilter(filter), [internalTemplates]);

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
          },
          {
            key: 'import-from-work-item',
            text: 'Import from work item',
            iconProps: { iconName: 'WorkItem' }
          }
        ]}
      />
      <TemplatesFilterBar
        className="margin-horizontal-8"
        templates={templates}
        onFilterChanged={filterFunc}
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
