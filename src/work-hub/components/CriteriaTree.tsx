import { getInitials, Persona, PersonaSize } from '@fluentui/react';
import {
  DevOpsService,
  getWorkItemTitle,
  getWorkItemTypeDisplayName,
  IInternalIdentity,
  isLoggedInUser,
  webLogger
} from '@joachimdalen/azdevops-ext-core';
import {
  IWorkItemFormNavigationService,
  WorkItem
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableLike, ObservableValue } from 'azure-devops-ui/Core/Observable';
import { Icon } from 'azure-devops-ui/Icon';
import { MenuItemType } from 'azure-devops-ui/Menu';
import { ColumnMore, ISimpleTableCell, SimpleTableCell } from 'azure-devops-ui/Table';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { ExpandableTreeCell, ITreeColumn, renderTreeCell, Tree } from 'azure-devops-ui/TreeEx';
import {
  ITreeItem,
  ITreeItemEx,
  ITreeItemProvider,
  TreeItemProvider
} from 'azure-devops-ui/Utilities/TreeItemProvider';
import { copyToClipboard } from 'azure-devops-ui/Utils/ClipboardUtils';
import cx from 'classnames';
import React, { MouseEventHandler, useMemo } from 'react';

import { capitalizeFirstLetter, getCriteriaTitle, getUrl } from '../../common/common';
import ApproverDisplay from '../../common/components/ApproverDisplay';
import CriteriaTypeDisplay from '../../common/components/CriteriaTypeDisplay';
import FullStatusTag from '../../common/components/FullStatusTag';
import InternalLink from '../../common/components/InternalLink';
import ProgressBar, { ProgressBarLabelType } from '../../common/components/ProgressBar';
import StatusTag from '../../common/components/StatusTag';
import {
  AcceptanceCriteriaState,
  CriteriaDocument,
  FullCriteriaStatus,
  IAcceptanceCriteria,
  IExtendedTableCell,
  IProgressStatus,
  WorkItemTypeTagProps
} from '../../common/types';
import { useWorkHubContext } from '../WorkHubContext';

const WorkItemTypeTag = ({
  type,
  iconUrl,
  title,
  id,
  classNames,
  iconSize = 16
}: WorkItemTypeTagProps & { id: number | string; title: string }): React.ReactElement => {
  return (
    <div className={cx('flex-row flex-grow flex-center', classNames)}>
      <Tooltip text={type || 'Unknown'}>
        <img src={iconUrl} height={iconSize} />
      </Tooltip>
      <span className="margin-horizontal-8 flex-grow font-size">
        <InternalLink
          onClick={async e => {
            const service = await DevOps.getService<IWorkItemFormNavigationService>(
              'ms.vss-work-web.work-item-form-navigation-service'
            );
            await service.openWorkItem(parseInt(id.toString()));
          }}
        >
          <Tooltip text={title || 'Unknown'}>
            <span>{title || 'Unknown'}</span>
          </Tooltip>
        </InternalLink>
      </span>
    </div>
  );
};

interface CriteriaTreeProps {
  criterias: CriteriaDocument[];
  workItemTypes: Map<string, WorkItemTypeTagProps>;
  workItems: WorkItem[];
  onProcess: (id: string, approved: boolean) => Promise<void>;
  onClick: (criteria: IAcceptanceCriteria) => Promise<void>;
}


interface IWorkItemCriteriaCell extends IExtendedTableCell {
  criteriaId?: string;
  workItemId: string;
  title: string;
  rowType: 'workItem' | 'criteria';
  type: '' | 'scenario' | 'custom';
  state: AcceptanceCriteriaState;
  fullState?: FullCriteriaStatus;
  requiredApprover?: IInternalIdentity;
  progress?: IProgressStatus;
  rawCriteria?: IAcceptanceCriteria;
}

const typeItemCell: ITreeColumn<IWorkItemCriteriaCell> = {
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
const idCell: ITreeColumn<IWorkItemCriteriaCell> = {
  id: 'workItemId',
  minWidth: 50,
  name: 'ID',
  renderCell: renderTreeCell,
  width: 100
};
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
  onProcess,
  onClick
}: CriteriaTreeProps): JSX.Element => {
  const { dispatch, state: workHubState } = useWorkHubContext();
  const devOpsService = useMemo(() => new DevOpsService(), []);
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
    const rootItems: ITreeItem<IWorkItemCriteriaCell>[] = criterias
      .sort((a, b) => {
        return parseInt(b.id) - parseInt(a.id);
      })
      .map(x => {
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
              },
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
  const moreColumn = new ColumnMore((listItem: ITreeItemEx<IWorkItemCriteriaCell>) => {
    const data = listItem.underlyingItem?.data;
    if (data.rowType === 'workItem') {
      return {
        id: 'work-item-menu',
        items: [
          { id: 'open-work-item', text: 'Open work item', iconProps: { iconName: 'WorkItem' } }
        ]
      };
    }

    return {
      id: 'sub-menu',
      items: [
        {
          id: 'view-criteria',
          text: 'View',
          iconProps: { iconName: 'View' },
          onActivate: () => {
            if (data.rawCriteria) {
              onClick(data.rawCriteria);
            }
          }
        },
        {
          id: 'copy-link',
          text: 'Copy link to criteria',
          iconProps: { iconName: 'Link' },
          onActivate: () => {
            if (data.criteriaId) {
              getUrl({ criteriaId: data.criteriaId.toString() }).then(url => {
                copyToClipboard(url);
                devOpsService.showToast('Copied criteria link to clipboard');
              });
            }
            return true;
          }
        },
        { id: 'divider', itemType: MenuItemType.Divider }
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
            <InternalLink
              onClick={async () => {
                if (data.rawCriteria) {
                  await onClick(data.rawCriteria);
                }
              }}
            >
              <Tooltip text={data.title}>
                <span>{data.title}</span>
              </Tooltip>
            </InternalLink>
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
            <ApproverDisplay approver={data?.requiredApprover} />
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
                    await onProcess(data.criteriaId, true);
                  }
                }}
              />
              <Button
                text="Reject"
                danger
                iconProps={{ iconName: 'Cancel' }}
                onClick={async () => {
                  if (data.criteriaId) {
                    await onProcess(data.criteriaId, false);
                  }
                }}
              />
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

  const columns = [
    idCell,
    titleCell,
    moreColumn,
    progressCell,
    criteriaState,
    approverCell,
    typeItemCell,
    actionCell
  ];
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
export default CriteriaTree;
