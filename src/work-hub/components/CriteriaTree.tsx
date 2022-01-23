import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableLike } from 'azure-devops-ui/Core/Observable';
import { ISimpleTableCell } from 'azure-devops-ui/Table';
import {
  ExpandableTreeCell,
  ITreeColumn,
  renderExpandableTreeCell,
  renderTreeCell,
  Tree
} from 'azure-devops-ui/TreeEx';
import {
  ITreeItem,
  ITreeItemEx,
  ITreeItemProvider,
  TreeItemProvider
} from 'azure-devops-ui/Utilities/TreeItemProvider';
import { useMemo } from 'react';
import cx from 'classnames';
import { capitalizeFirstLetter, getCriteriaTitle } from '../../common/common';
import { CriteriaDocument, WorkItemTypeTagProps } from '../../common/types';

const WorkItemTypeTag = ({
  iconUrl,
  text,
  classNames,
  iconSize = 20
}: WorkItemTypeTagProps): React.ReactElement => {
  return (
    <div className={cx('flex-row flex-center', classNames)}>
      {iconUrl && <img src={iconUrl} height={iconSize} />}
      <span className="margin-left-16">{text || 'Unknown'}</span>
    </div>
  );
};

interface CriteriaTreeProps {
  criterias: CriteriaDocument[];
  types: WorkItemType[];
  workItems: Map<string, WorkItemTypeTagProps>;
}

interface IWorkItemCriteriaCell extends ISimpleTableCell {
  workItemId: string;
  title: string;
  rowType: 'workItem' | 'criteria';
  type: '' | 'rule' | 'scenario' | 'custom';
}

const workItemCell: ITreeColumn<IWorkItemCriteriaCell> = {
  id: 'workItemId',
  minWidth: 200,
  name: 'Work Item',
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

    return (
      <ExpandableTreeCell
        key={rowIndex}
        className={treeColumn.className}
        columnIndex={columnIndex}
        contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
        treeItem={treeItem}
        treeColumn={treeColumn}
      >
        <ConditionalChildren renderChildren={treeItem.underlyingItem.data.rowType === 'workItem'}>
          {treeItem.underlyingItem.data.title}
        </ConditionalChildren>
      </ExpandableTreeCell>
    );
  },
  width: -100
};
const typeItemCell: ITreeColumn<IWorkItemCriteriaCell> = {
  id: 'type',
  minWidth: 200,
  name: 'Type',
  renderCell: renderTreeCell,
  width: -100
};
const titleCell: ITreeColumn<IWorkItemCriteriaCell> = {
  id: 'title',
  minWidth: 200,
  name: 'Title',
  renderCell: renderTreeCell,
  width: -100
};

const CriteriaTree = ({ criterias }: CriteriaTreeProps): JSX.Element => {
  const treeProvider: ITreeItemProvider<IWorkItemCriteriaCell> = useMemo(() => {
    const rootItems: ITreeItem<IWorkItemCriteriaCell>[] = criterias.map(x => {
      const item: ITreeItem<IWorkItemCriteriaCell> = {
        data: {
          workItemId: x.id,
          title: 'WI TITLE ' + x.id,
          rowType: 'workItem',
          type: ''
        },
        childItems: x.criterias.map(y => {
          const it: ITreeItem<IWorkItemCriteriaCell> = {
            data: {
              workItemId: '',
              title: getCriteriaTitle(y) || 'Noop',
              rowType: 'criteria',
              type: capitalizeFirstLetter(y.type) as any
            }
          };
          return it;
        })
      };
      return item;
    });

    return new TreeItemProvider<IWorkItemCriteriaCell>(rootItems);
  }, [criterias]);
  return (
    <Tree<IWorkItemCriteriaCell>
      ariaLabel="Basic tree"
      columns={[workItemCell, titleCell, typeItemCell]}
      itemProvider={treeProvider as any}
      onToggle={(event: any, treeItem: ITreeItemEx<IWorkItemCriteriaCell>) => {
        treeProvider.toggle(treeItem.underlyingItem);
      }}
      scrollable={true}
    />
  );
};
export default CriteriaTree;
