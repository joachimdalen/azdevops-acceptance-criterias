import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import {
  getWorkItemTitle,
  getWorkItemTypeDisplayName
} from '@joachimdalen/azdevops-ext-core/WorkItemUtils';
import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableLike } from 'azure-devops-ui/Core/Observable';
import { SimpleTableCell } from 'azure-devops-ui/Table';
import { ITreeColumn, renderTreeCell } from 'azure-devops-ui/TreeEx';
import {
  ITreeItem,
  ITreeItemEx,
  ITreeItemProvider,
  TreeItemProvider
} from 'azure-devops-ui/Utilities/TreeItemProvider';

import { capitalizeFirstLetter } from '../../common/common';
import CriteriaTypeDisplay from '../../common/components/CriteriaTypeDisplay';
import FullStatusTag from '../../common/components/FullStatusTag';
import StatusTag from '../../common/components/StatusTag';
import {
  AcceptanceCriteriaState,
  CriteriaDocument,
  CriteriaTypes,
  FullCriteriaStatus,
  IAcceptanceCriteria,
  IExtendedTableCell,
  IProgressStatus,
  WorkItemTypeTagProps
} from '../../common/types';

export interface IWorkItemCriteriaCell extends IExtendedTableCell {
  criteriaId?: string;
  workItemId: string;
  title: string;
  rowType: 'workItem' | 'criteria';
  type: '' | CriteriaTypes;
  state: AcceptanceCriteriaState;
  fullState?: FullCriteriaStatus;
  requiredApprover?: IInternalIdentity;
  progress?: IProgressStatus;
  rawCriteria?: IAcceptanceCriteria;
  workItemDetails?: WorkItemDetails;
}

interface WorkItemDetails {
  type: string;
  title: string;
  tag?: WorkItemTypeTagProps;
}

export const typeItemCell: ITreeColumn<IWorkItemCriteriaCell> = {
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
        <ConditionalChildren renderChildren={data.rowType === 'criteria'}>
          {data.type !== '' && <CriteriaTypeDisplay type={data.type} />}
        </ConditionalChildren>
      </SimpleTableCell>
    );
  },
  width: -100
};
export const idCell: ITreeColumn<IWorkItemCriteriaCell> = {
  id: 'workItemId',
  minWidth: 50,
  name: 'ID',
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
        {data.rowType === 'criteria' ? data.criteriaId : data.workItemId}
      </SimpleTableCell>
    );
  },
  width: 100
};

export const criteriaState: ITreeColumn<IWorkItemCriteriaCell> = {
  id: 'state',
  minWidth: 200,
  name: 'Criteria State',
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
        ariaRowIndex={rowIndex}
        key={rowIndex + '-' + columnIndex}
        className={treeColumn.className}
        columnIndex={columnIndex}
        contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
        tableColumn={treeColumn}
      >
        <ConditionalChildren renderChildren={data.rowType === 'criteria'}>
          <StatusTag state={data.state} />
        </ConditionalChildren>
        <ConditionalChildren renderChildren={data.rowType === 'workItem'}>
          {data.fullState && <FullStatusTag state={data.fullState} />}
        </ConditionalChildren>
      </SimpleTableCell>
    );

    return defaultCell;
  },
  width: -100
};

export const getProgress = (
  documents: CriteriaDocument[],
  workItemId: string
): IProgressStatus | undefined => {
  const doc = documents.find(x => x.id === workItemId);
  if (doc === undefined) return undefined;

  return {
    maxValue: doc.criterias.length,
    value: doc.criterias.filter(x =>
      [AcceptanceCriteriaState.Approved, AcceptanceCriteriaState.Completed].includes(x.state)
    ).length,
    type: 'count'
  };
};

export const getTreeProvider = (
  documents: CriteriaDocument[],
  visibleDocuments: CriteriaDocument[],
  workItems: WorkItem[],
  workItemTypes: Map<string, WorkItemTypeTagProps>
): ITreeItemProvider<IWorkItemCriteriaCell> => {
  const rootItems: ITreeItem<IWorkItemCriteriaCell>[] = visibleDocuments
    .sort((a, b) => {
      return parseInt(b.id) - parseInt(a.id);
    })
    .map(x => {
      const wi = workItems.find(y => y.id.toString() === x.id);
      const type = wi === undefined ? 'Unknown' : getWorkItemTypeDisplayName(wi);
      const title = wi === undefined ? 'Unknown' : getWorkItemTitle(wi);
      const dta = workItemTypes.get(type);

      const criteriaRows = x.criterias.map(y => {
        const it: ITreeItem<IWorkItemCriteriaCell> = {
          data: {
            workItemId: x.id,
            title: y.title,
            rowType: 'criteria',
            type: (capitalizeFirstLetter(y.type) as CriteriaTypes),
            state: y.state,
            requiredApprover: y.requiredApprover,
            criteriaId: y.id,
            rawCriteria: y
          }
        };
        return it;
      });
      const item: ITreeItem<IWorkItemCriteriaCell> = {
        data: {
          workItemId: x.id,
          title: '',
          rowType: 'workItem',
          type: '',
          state: AcceptanceCriteriaState.New,
          fullState: x.state,
          progress: getProgress(documents, x.id),
          workItemDetails: {
            type: type,
            title: title,
            tag: dta
          }
        },
        childItems: criteriaRows
      };
      return item;
    });

  return new TreeItemProvider<IWorkItemCriteriaCell>(rootItems);
};
