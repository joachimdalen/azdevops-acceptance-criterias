import { getInitials, Persona, PersonaSize } from '@fluentui/react';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core';
import { Checkbox } from 'azure-devops-ui/Checkbox';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableLike } from 'azure-devops-ui/Core/Observable';
import { Icon } from 'azure-devops-ui/Icon';
import { IMenuItem, MenuItemType } from 'azure-devops-ui/Menu';
import {
  ColumnFill,
  ColumnMore,
  ColumnSorting,
  ISimpleTableCell,
  SimpleTableCell
} from 'azure-devops-ui/Table';
import { ExpandableTreeCell, ITreeColumn, Tree } from 'azure-devops-ui/TreeEx';
import {
  ITreeItem,
  ITreeItemEx,
  ITreeItemProvider,
  TreeItemProvider
} from 'azure-devops-ui/Utilities/TreeItemProvider';
import React, { useMemo } from 'react';

import { capitalizeFirstLetter, getCriteriaTitle } from '../../common/common';
import { ProgressBarLabelType } from '../../common/components/ProgressBar';
import { AcceptanceCriteriaState, CriteriaDocument, IScenario } from '../../common/types';
import StatusTag from '../../wi-control/components/StatusTag';

interface CriteriaViewProps {
  criteria?: CriteriaDocument;
  onApprove: (id: string, complete: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}
interface IDynamicProperties {
  [key: string]: any;
}
type IExtendedTableCell = ISimpleTableCell & IDynamicProperties;
interface IProgressStatus {
  value: number;
  maxValue: number;
  type: ProgressBarLabelType;
}
interface IWorkItemCriteriaCell extends IExtendedTableCell {
  id: string;
  title: string;
  rowType: 'item' | 'details';
  type: '' | 'rule' | 'scenario' | 'custom';
  state?: AcceptanceCriteriaState;
  requiredApprover?: IInternalIdentity;
  progress?: IProgressStatus;
  scenario?: IScenario;
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
const getIcon = (type: string) => {
  switch (type) {
    case 'rule':
      return 'CheckboxCompositeReversed';
    case 'custom':
      return 'Comment';
    case 'scenario':
      return 'Add';
  }
};
const CriteriaView = ({ criteria, onApprove, onDelete }: CriteriaViewProps): JSX.Element => {
  const treeProvider: ITreeItemProvider<IWorkItemCriteriaCell> = useMemo(() => {
    const rootItems: ITreeItem<IWorkItemCriteriaCell>[] = (criteria?.criterias || []).map(x => {
      const children: ITreeItem<IWorkItemCriteriaCell>[] = [];
      if (x.type === 'scenario') {
        children.push({
          data: {
            id: '',
            title: '',
            rowType: 'details',
            scenario: x.scenario,
            type: 'custom'
          }
        });
      }

      const it: ITreeItem<IWorkItemCriteriaCell> = {
        data: {
          id: x.id,
          title: getCriteriaTitle(x) || 'Noop',
          rowType: 'item',
          type: x.type,
          state: x.state,
          requiredApprover: x.requiredApprover,
          progress: {
            maxValue: 1,
            value: x.state === 'approved' ? 1 : 0,
            type: 'percentage'
          }
        },
        childItems: children
      };
      return it;
    });

    return new TreeItemProvider<IWorkItemCriteriaCell>(rootItems);
  }, [criteria]);
  const moreColumn = new ColumnMore((listItem: ITreeItemEx<IWorkItemCriteriaCell>) => {
    return {
      id: 'sub-menu',
      items: [
        { id: 'edit', text: 'Edit', iconProps: { iconName: 'Edit' } },
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
        <React.Fragment>
          <span>{data.title}</span>
        </React.Fragment>
      );

      if (data.type !== 'scenario') {
        return (
          <SimpleTableCell
            className={treeColumn.className}
            columnIndex={columnIndex}
            contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
            tableColumn={treeColumn}
            colspan={data.rowType === 'details' ? 4 : 0}
          >
            <ConditionalChildren renderChildren={data.rowType === 'item'}>
              <div className="margin-left-16">{content}</div>
            </ConditionalChildren>
            <ConditionalChildren renderChildren={data.rowType === 'details'}>
              <div className="flex-column">
                <div className="font-weight-semibold"> {data.scenario?.scenario}</div>
                <div className="margin-top-8">
                  {data.scenario?.criterias.map(g => {
                    return (
                      <span key={g.id}>
                        <span className="font-weight-heavy">{capitalizeFirstLetter(g.type)}</span>{' '}
                        {g.text}{' '}
                      </span>
                    );
                  })}
                </div>
              </div>
            </ConditionalChildren>
          </SimpleTableCell>
        );
      }

      return (
        <ExpandableTreeCell
          key={rowIndex}
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          treeItem={treeItem}
          treeColumn={treeColumn}
        >
          {content}
        </ExpandableTreeCell>
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
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          tableColumn={treeColumn}
        >
          <ConditionalChildren renderChildren={data.rowType === 'item'}>
            <ConditionalChildren renderChildren={data.requiredApprover === undefined}>
              <span>Unassigned</span>
            </ConditionalChildren>
            <ConditionalChildren renderChildren={data.requiredApprover !== undefined}>
              {data.requiredApprover && (
                <Persona
                  text={data.requiredApprover.displayName}
                  size={PersonaSize.size24}
                  imageInitials={getInitials(data.requiredApprover.displayName, false)}
                  imageUrl={data.requiredApprover.image}
                />
              )}
            </ConditionalChildren>
          </ConditionalChildren>
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
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          tableColumn={treeColumn}
        >
          <ConditionalChildren renderChildren={data.rowType === 'item'}>
            <div className="rhythm-horizontal-8 flex-row flex-center">
              <Icon iconName={getIcon(data.type)} />
              <span>{capitalizeFirstLetter(data.type)}</span>
            </div>
          </ConditionalChildren>
        </SimpleTableCell>
      );
    },
    width: -100
  };
  const toggleCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'toggle',
    minWidth: 50,
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
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          tableColumn={treeColumn}
        >
          <ConditionalChildren renderChildren={data.rowType === 'item'}>
            <Checkbox
              checked={data?.state !== AcceptanceCriteriaState.New}
              onChange={(e, checked: boolean) => {
                onApprove(data.id, checked);
              }}
            />
          </ConditionalChildren>
        </SimpleTableCell>
      );
    },
    width: 50
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
