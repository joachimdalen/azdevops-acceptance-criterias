import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableLike } from 'azure-devops-ui/Core/Observable';
import { MenuItemType } from 'azure-devops-ui/Menu';
import { ColumnFill, ColumnMore, SimpleTableCell } from 'azure-devops-ui/Table';
import { Toggle } from 'azure-devops-ui/Toggle';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { ExpandableTreeCell, ITreeColumn, Tree } from 'azure-devops-ui/TreeEx';
import {
  ITreeItem,
  ITreeItemEx,
  ITreeItemProvider,
  TreeItemProvider
} from 'azure-devops-ui/Utilities/TreeItemProvider';
import { useMemo } from 'react';

import { capitalizeFirstLetter } from '../../common/common';
import ApproverDisplay from '../../common/components/ApproverDisplay';
import CriteriaTypeDisplay from '../../common/components/CriteriaTypeDisplay';
import InternalLink from '../../common/components/InternalLink';
import { ProgressBarLabelType } from '../../common/components/ProgressBar';
import StatusTag from '../../common/components/StatusTag';
import {
  AcceptanceCriteriaState,
  CriteriaDocument,
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
  type: '' | 'scenario' | 'custom';
  state?: AcceptanceCriteriaState;
  requiredApprover?: IInternalIdentity;
  progress?: IProgressStatus;
  scenario?: IScenario;
  rawCriteria?: IAcceptanceCriteria;
}

// const titleCell: ITreeColumn<IWorkItemCriteriaCell> = {
//   id: 'title',
//   minWidth: 200,
//   name: 'Title',
//   renderCell: renderTreeCell,
//   width: -100
// };
const criteriaState: ITreeColumn<IWorkItemCriteriaCell> = {
  id: 'state',
  minWidth: 200,
  name: 'State',
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
  },
  width: -100
};

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
  const titleCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'title',
    minWidth: 200,
    name: 'Title',
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
            <span>{data.title}</span>
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
    },
    width: -100
  };
  const approverCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'requiredApprover',
    minWidth: 200,
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
    },
    width: -100
  };

  const typeCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'type',
    minWidth: 200,
    name: 'Criteria Type',
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
          {data.type !== '' && <CriteriaTypeDisplay type={data.type} />}
        </SimpleTableCell>
      );
    },
    width: -100
  };
  const toggleCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'toggle',
    minWidth: 50,
    width: 80,
    name: '',
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
          <Toggle
            checked={data?.state !== AcceptanceCriteriaState.New}
            onChange={(e, checked: boolean) => {
              if (data.rawCriteria) {
                onApprove(data.rawCriteria, checked);
              }
              e.preventDefault();
            }}
          />
        </SimpleTableCell>
      );
    }
  };

  return (
    <Tree<IWorkItemCriteriaCell>
      ariaLabel="Basic tree"
      columns={[
        toggleCell,
        titleCell,
        criteriaState,
        approverCell,
        typeCell,
        ColumnFill,
        moreColumn as any
      ]}
      itemProvider={treeProvider as any}
      onToggle={(event: any, treeItem: ITreeItemEx<IWorkItemCriteriaCell>) => {
        treeProvider.toggle(treeItem.underlyingItem);
      }}
      scrollable={true}
    />
  );
};
export default CriteriaView;
