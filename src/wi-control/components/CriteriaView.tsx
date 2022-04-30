import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableLike, ObservableValue } from 'azure-devops-ui/Core/Observable';
import { MenuItemType } from 'azure-devops-ui/Menu';
import { ColumnFill, ColumnMore, SimpleTableCell } from 'azure-devops-ui/Table';
import { Toggle } from 'azure-devops-ui/Toggle';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { ITreeColumn, renderTreeCell, Tree } from 'azure-devops-ui/TreeEx';
import {
  ITreeItem,
  ITreeItemEx,
  ITreeItemProvider,
  TreeItemProvider
} from 'azure-devops-ui/Utilities/TreeItemProvider';
import { useMemo } from 'react';

import ApproverDisplay from '../../common/components/ApproverDisplay';
import CriteriaTypeDisplay from '../../common/components/CriteriaTypeDisplay';
import InternalLink from '../../common/components/InternalLink';
import { ProgressBarLabelType } from '../../common/components/ProgressBar';
import StatusTag from '../../common/components/StatusTag';
import {
  AcceptanceCriteriaState,
  CriteriaDocument,
  CriteriaTypes,
  IAcceptanceCriteria,
  IExtendedTableCell,
  IScenario
} from '../../common/types';

interface CriteriaViewProps {
  criteria?: CriteriaDocument;
  onApprove: (criteria: IAcceptanceCriteria, complete: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (criteria: IAcceptanceCriteria, readOnly?: boolean, canEdit?: boolean) => Promise<void>;
}

interface IProgressStatus {
  value: number;
  maxValue: number;
  type: ProgressBarLabelType;
}
interface IWorkItemCriteriaCell extends IExtendedTableCell {
  id: string;
  title: string;
  type: '' | CriteriaTypes;
  state?: AcceptanceCriteriaState;
  requiredApprover?: IInternalIdentity;
  progress?: IProgressStatus;
  scenario?: IScenario;
  rawCriteria?: IAcceptanceCriteria;
}

const CriteriaView = ({
  criteria,
  onApprove,
  onDelete,
  onEdit
}: CriteriaViewProps): JSX.Element => {
  const treeProvider: ITreeItemProvider<IWorkItemCriteriaCell> = useMemo(() => {
    const rootItems: ITreeItem<IWorkItemCriteriaCell>[] = (criteria?.criterias || []).map(x => {
      const it: ITreeItem<IWorkItemCriteriaCell> = {
        data: {
          id: x.id,
          title: x.title,
          type: x.type,
          state: x.state,
          requiredApprover: x.requiredApprover,
          progress: {
            maxValue: 1,
            value: x.state === 'approved' ? 1 : 0,
            type: 'percentage'
          },
          rawCriteria: x
        }
      };
      return it;
    });

    return new TreeItemProvider<IWorkItemCriteriaCell>(rootItems);
  }, [criteria]);

  const moreColumn = new ColumnMore((listItem: ITreeItemEx<IWorkItemCriteriaCell>) => {
    return {
      id: 'sub-menu',
      items: [
        {
          id: 'edit',
          text: 'Edit',
          iconProps: { iconName: 'Edit' },
          onActivate: () => {
            if (listItem?.underlyingItem?.data?.rawCriteria) {
              onEdit(listItem?.underlyingItem?.data?.rawCriteria, false, true);
            }
          }
        },
        { id: 'divider', itemType: MenuItemType.Divider },
        {
          id: 'delete',
          text: 'Delete',
          iconProps: { iconName: 'Delete' },
          onActivate: () => {
            if (listItem?.underlyingItem?.data?.id) {
              onDelete(listItem.underlyingItem.data.id);
            }
          }
        }
      ]
    };
  });
  const idCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'id',
    name: 'ID',
    renderCell: renderTreeCell,
    minWidth: 50,
    width: new ObservableValue(-100),
    onSize: onSize,
    
  };
  const criteriaState: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'state',
    minWidth: 200,
    name: 'State',
    width: new ObservableValue(-100),
    onSize: onSize,
    renderCell: (
      rowIndex: number,
      columnIndex: number,
      treeColumn: ITreeColumn<IWorkItemCriteriaCell>,
      treeItem: ITreeItemEx<IWorkItemCriteriaCell>
    ) => {
      const underlyingItem = treeItem.underlyingItem;
      const data = ObservableLike.getValue(underlyingItem.data);
      const treeCell = data && data[treeColumn.id];
      // Do not include padding if the table cell has an href
      const hasLink = !!(
        treeCell &&
        typeof treeCell !== 'string' &&
        typeof treeCell !== 'number' &&
        treeCell.href
      );

      const defaultCell = (
        <SimpleTableCell
          key={`${columnIndex}-${data.id}`}
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          tableColumn={treeColumn}
        >
          {data.state && <StatusTag state={data.state} />}
        </SimpleTableCell>
      );

      return defaultCell;
    }
  };
  const titleCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'title',
    minWidth: 300,
    name: 'Title',
    width: new ObservableValue(-100),
    onSize: onSize,
    renderCell: (
      rowIndex: number,
      columnIndex: number,
      treeColumn: ITreeColumn<IWorkItemCriteriaCell>,
      treeItem: ITreeItemEx<IWorkItemCriteriaCell>
    ) => {
      const underlyingItem = treeItem.underlyingItem;
      const data = ObservableLike.getValue(underlyingItem.data);
      const treeCell = data && data[treeColumn.id];
      // Do not include padding if the table cell has an href
      const hasLink = !!(
        treeCell &&
        typeof treeCell !== 'string' &&
        typeof treeCell !== 'number' &&
        treeCell.href
      );
      const content = (
        <InternalLink
          onClick={async () => {
            if (data.rawCriteria) {
              onEdit(data.rawCriteria, true, true);
            }
          }}
        >
          <Tooltip text={data.title}>
            <div className=" flex-row flex-center">
              {data.type !== '' ? (
                <CriteriaTypeDisplay type={data.type} title={data.title} />
              ) : (
                <span>{data.title}</span>
              )}
            </div>
          </Tooltip>
        </InternalLink>
      );

      return (
        <SimpleTableCell
          key={`${columnIndex}-${data.id}`}
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          tableColumn={treeColumn}
        >
          {content}
        </SimpleTableCell>
      );
    }
  };
  const approverCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'requiredApprover',
    width: new ObservableValue(-100),
    onSize: onSize,
    name: 'Required Approver',
    renderCell: (
      rowIndex: number,
      columnIndex: number,
      treeColumn: ITreeColumn<IWorkItemCriteriaCell>,
      treeItem: ITreeItemEx<IWorkItemCriteriaCell>
    ) => {
      const underlyingItem = treeItem.underlyingItem;
      const data = ObservableLike.getValue(underlyingItem.data);
      const treeCell = data && data[treeColumn.id];
      // Do not include padding if the table cell has an href
      const hasLink = !!(
        treeCell &&
        typeof treeCell !== 'string' &&
        typeof treeCell !== 'number' &&
        treeCell.href
      );
      // const approver = identities.get(data.requiredApprover);
      return (
        <SimpleTableCell
          key={`${columnIndex}-${data.id}`}
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          tableColumn={treeColumn}
        >
          <ApproverDisplay approver={data?.requiredApprover} />
        </SimpleTableCell>
      );
    }
  };

  const toggleCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'toggle',
    minWidth: 50,
    width: new ObservableValue(100),
    onSize: onSize,
    name: 'Completed',
    renderCell: (
      rowIndex: number,
      columnIndex: number,
      treeColumn: ITreeColumn<IWorkItemCriteriaCell>,
      treeItem: ITreeItemEx<IWorkItemCriteriaCell>
    ) => {
      const underlyingItem = treeItem.underlyingItem;
      const data = ObservableLike.getValue(underlyingItem.data);
      const treeCell = data && data[treeColumn.id];
      // Do not include padding if the table cell has an href
      const hasLink = !!(
        treeCell &&
        typeof treeCell !== 'string' &&
        typeof treeCell !== 'number' &&
        treeCell.href
      );
      // const approver = identities.get(data.requiredApprover);
      return (
        <SimpleTableCell
          key={`${columnIndex}-${data.id}`}
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          tableColumn={treeColumn}
        >
          <ConditionalChildren renderChildren={data.type !== 'checklist'}>
            <Toggle
              checked={data?.state !== AcceptanceCriteriaState.New}
              onChange={(e, checked: boolean) => {
                if (data.rawCriteria) {
                  onApprove(data.rawCriteria, checked);
                }
                e.preventDefault();
              }}
            />
          </ConditionalChildren>
        </SimpleTableCell>
      );
    }
  };

  const columns = [
    //toggleCell,
    idCell,
    titleCell,
    criteriaState,
    approverCell,
    ColumnFill,
    moreColumn as any
  ];

  function onSize(event: MouseEvent | KeyboardEvent, index: number, width: number) {
    (columns[index].width as ObservableValue<number>).value = width;
  }

  return (
    <Tree<IWorkItemCriteriaCell>
      ariaLabel="Basic tree"
      columns={columns}
      itemProvider={treeProvider as any}
      onToggle={(event: any, treeItem: ITreeItemEx<IWorkItemCriteriaCell>) => {
        treeProvider.toggle(treeItem.underlyingItem);
      }}
      scrollable={true}
    />
  );
};
export default CriteriaView;
