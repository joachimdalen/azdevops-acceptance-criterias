import { getInitials, Persona, PersonaSize } from '@fluentui/react';
import {
  getLoggedInUser,
  getWorkItemTitle,
  getWorkItemTypeDisplayName,
  IInternalIdentity,
  isLoggedInUser,
  webLogger
} from '@joachimdalen/azdevops-ext-core';
import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableLike } from 'azure-devops-ui/Core/Observable';
import { Icon } from 'azure-devops-ui/Icon';
import { ISimpleTableCell, SimpleTableCell } from 'azure-devops-ui/Table';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { ExpandableTreeCell, ITreeColumn, renderTreeCell, Tree } from 'azure-devops-ui/TreeEx';
import {
  ITreeItem,
  ITreeItemEx,
  ITreeItemProvider,
  TreeItemProvider
} from 'azure-devops-ui/Utilities/TreeItemProvider';
import cx from 'classnames';
import { useMemo } from 'react';

import { capitalizeFirstLetter, getCriteriaTitle } from '../../common/common';
import ProgressBar, { ProgressBarLabelType } from '../../common/components/ProgressBar';
import {
  AcceptanceCriteriaState,
  CriteriaDocument,
  FullCriteriaStatus,
  WorkItemTypeTagProps
} from '../../common/types';
import FullStatusTag from '../../wi-control/components/FullStatusTag';
import StatusTag from '../../wi-control/components/StatusTag';
import { useWorkHubContext } from '../WorkHubContext';
const WorkItemTypeTag = ({
  iconUrl,
  title,
  id,
  classNames,
  iconSize = 16
}: WorkItemTypeTagProps & { id: number | string; title: string }): React.ReactElement => {
  return (
    <Tooltip text={title || 'Unknown'}>
      <div className={cx('flex-row flex-grow flex-center', classNames)}>
        <img src={iconUrl} height={iconSize} />
        <span className="margin-horizontal-8 flex-grow font-size">
          <span className="margin-right-4"> {id}</span>
          <span>{title || 'Unknown'}</span>
        </span>
      </div>
    </Tooltip>
  );
};

interface CriteriaTreeProps {
  criterias: CriteriaDocument[];
  workItemTypes: Map<string, WorkItemTypeTagProps>;
  workItems: WorkItem[];
  onApprove: (id: string) => Promise<void>;
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
  criteriaId?: string;
  workItemId: string;
  title: string;
  rowType: 'workItem' | 'criteria';
  type: '' | 'rule' | 'scenario' | 'custom';
  state: AcceptanceCriteriaState;
  fullState?: FullCriteriaStatus;
  requiredApprover?: IInternalIdentity;
  progress?: IProgressStatus;
}

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

const CriteriaTree = ({
  criterias,
  workItemTypes,
  workItems,
  onApprove
}: CriteriaTreeProps): JSX.Element => {
  const { dispatch, state: workHubState } = useWorkHubContext();
  const approvable = useMemo(
    () =>
      criterias
        .flatMap(x => x.criterias)
        .filter(x => {
          if (x.requiredApprover) {
            if (isLoggedInUser(x.requiredApprover)) {
              return true;
            }

            if (workHubState.teams.some(y => y.id === x.requiredApprover?.id)) {
              return true;
            }
          }
          return false;
        })
        .map(x => x.id),
    [criterias, workHubState.teams]
  );

  const treeProvider: ITreeItemProvider<IWorkItemCriteriaCell> = useMemo(() => {
    webLogger.trace('mapping', criterias);
    const rootItems: ITreeItem<IWorkItemCriteriaCell>[] = criterias.map(x => {
      const criteriaRows = x.criterias.map(y => {
        const it: ITreeItem<IWorkItemCriteriaCell> = {
          data: {
            workItemId: '',
            title: getCriteriaTitle(y) || 'Noop',
            rowType: 'criteria',
            type: capitalizeFirstLetter(y.type) as any,
            state: y.state,
            requiredApprover: y.requiredApprover,
            criteriaId: y.id,
            progress: {
              maxValue: 1,
              value: y.state === 'approved' ? 1 : 0,
              type: 'percentage'
            }
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
          progress: {
            maxValue: x.criterias.length,
            value: x.criterias.filter(
              x =>
                x.state === AcceptanceCriteriaState.Completed ||
                x.state === AcceptanceCriteriaState.Approved
            ).length,
            type: 'count'
          }
        },
        childItems: criteriaRows
      };
      return item;
    });

    return new TreeItemProvider<IWorkItemCriteriaCell>(rootItems);
  }, [criterias]);
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

      const defaultCell = (
        <ExpandableTreeCell
          key={rowIndex}
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          treeItem={treeItem}
          treeColumn={treeColumn}
        >
          <ConditionalChildren renderChildren={data.rowType === 'criteria'}>
            <div className="rhythm-horizontal-8 flex-row flex-center">
              <Icon iconName="CheckboxCompositeReversed" />
              <span>{capitalizeFirstLetter(data.rowType)}</span>
            </div>
          </ConditionalChildren>
          <ConditionalChildren renderChildren={data.rowType === 'workItem'}>
            {treeItem.underlyingItem.data.title}
          </ConditionalChildren>
        </ExpandableTreeCell>
      );

      if (data.rowType === 'workItem') {
        const wi = workItems.find(x => x.id === parseInt(data.workItemId));
        if (wi === undefined) return defaultCell;
        const type = getWorkItemTypeDisplayName(wi);
        const dta = workItemTypes.get(type);
        return (
          <ExpandableTreeCell
            key={rowIndex}
            className={treeColumn.className}
            columnIndex={columnIndex}
            contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
            treeItem={treeItem}
            treeColumn={treeColumn}
          >
            <ConditionalChildren
              renderChildren={treeItem.underlyingItem.data.rowType === 'workItem'}
            >
              <WorkItemTypeTag {...dta} id={wi.id} title={getWorkItemTitle(wi)} />
            </ConditionalChildren>
          </ExpandableTreeCell>
        );
      }

      return defaultCell;
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
          <ConditionalChildren renderChildren={data.rowType === 'criteria'}>
            <ConditionalChildren renderChildren={data.requiredApprover === undefined}>
              <div className="secondary-text">
                <Icon iconName="Contact" />
                <span className="margin-left-8">Unassigned</span>
              </div>
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
  const actionCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'actions',
    minWidth: 200,
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

      const canProcess =
        data.state === AcceptanceCriteriaState.AwaitingApproval &&
        data.criteriaId !== undefined &&
        approvable.includes(data.criteriaId);

      // const approver = identities.get(data.requiredApprover);
      return (
        <SimpleTableCell
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          tableColumn={treeColumn}
        >
          <ConditionalChildren renderChildren={canProcess}>
            <ButtonGroup>
              <Button
                text="Approve"
                primary
                iconProps={{ iconName: 'CheckMark' }}
                onClick={async () => {
                  if (data.criteriaId) {
                    await onApprove(data.criteriaId);
                  }
                }}
              />
              <Button text="Reject" danger iconProps={{ iconName: 'Cancel' }} />
            </ButtonGroup>
          </ConditionalChildren>
        </SimpleTableCell>
      );
    },
    width: -100
  };
  const progressCell: ITreeColumn<IWorkItemCriteriaCell> = {
    id: 'progress',
    minWidth: 200,
    name: 'Progress',
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
        <SimpleTableCell
          className={treeColumn.className}
          columnIndex={columnIndex}
          contentClassName={hasLink ? 'bolt-table-cell-content-with-link' : undefined}
          tableColumn={treeColumn}
        >
          <ConditionalChildren
            renderChildren={data.rowType === 'workItem' && data.progress !== undefined}
          >
            {data.progress && (
              <ProgressBar
                maxValue={data.progress.maxValue}
                currentValue={data.progress.value}
                labelType={data.progress.type}
              />
            )}
          </ConditionalChildren>
        </SimpleTableCell>
      );
    },
    width: -100
  };

  if (workItems.length === 0) return <div>Loding..</div>;

  return (
    <Tree<IWorkItemCriteriaCell>
      ariaLabel="Basic tree"
      columns={[
        workItemCell,
        titleCell,
        progressCell,
        criteriaState,
        approverCell,
        typeItemCell,
        actionCell
      ]}
      itemProvider={treeProvider as any}
      onToggle={(event: any, treeItem: ITreeItemEx<IWorkItemCriteriaCell>) => {
        treeProvider.toggle(treeItem.underlyingItem);
      }}
      scrollable={true}
    />
  );
};
export default CriteriaTree;
