import { ActionResult } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { LoadingSection } from '@joachimdalen/azdevops-ext-core/LoadingSection';
import {
  getWorkItemTitle,
  getWorkItemTypeDisplayName
} from '@joachimdalen/azdevops-ext-core/WorkItemUtils';
import {
  IWorkItemFormNavigationService,
  WorkItem
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableLike } from 'azure-devops-ui/Core/Observable';
import { MenuItemType } from 'azure-devops-ui/Menu';
import { ColumnMore, SimpleTableCell } from 'azure-devops-ui/Table';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { ExpandableTreeCell, ITreeColumn, Tree } from 'azure-devops-ui/TreeEx';
import {
  ITreeItemEx,
  ITreeItemProvider} from 'azure-devops-ui/Utilities/TreeItemProvider';
import { copyToClipboard } from 'azure-devops-ui/Utils/ClipboardUtils';
import { useMemo } from 'react';

import { DialogIds, getUrl, IConfirmationConfig } from '../../common/common';
import ApproverDisplay from '../../common/components/ApproverDisplay';
import InternalLink from '../../common/components/InternalLink';
import ProgressBar from '../../common/components/ProgressBar';
import { getLocalItem, LocalStorageKeys, setLocalItem } from '../../common/localStorage';
import {
  CriteriaDocument,
  IAcceptanceCriteria,
  WorkItemTypeTagProps
} from '../../common/types';
import {
  criteriaState,
  getTreeProvider,
  idCell,
  IWorkItemCriteriaCell,
  typeItemCell
} from './CriteriaTreeData';
import WorkItemTypeTag from './WorkItemTypeTag';

interface CriteriaTreeProps {
  workItemTypes: Map<string, WorkItemTypeTagProps>;
  workItems: WorkItem[];
  visibleDocuments: CriteriaDocument[];
  documents: CriteriaDocument[];
  onClick: (criteria: IAcceptanceCriteria) => Promise<void>;
}

const CriteriaTree = ({
  workItemTypes,
  workItems,
  onClick,
  visibleDocuments,
  documents
}: CriteriaTreeProps): JSX.Element => {
  const devOpsService = useMemo(() => new DevOpsService(), []);
  const treeProvider: ITreeItemProvider<IWorkItemCriteriaCell> = useMemo(
    () => getTreeProvider(documents, visibleDocuments),
    [visibleDocuments]
  );

  const moreColumn = new ColumnMore((listItem: ITreeItemEx<IWorkItemCriteriaCell>) => {
    const data = listItem.underlyingItem?.data;
    if (data.rowType === 'workItem') {
      return {
        id: 'work-item-menu',
        items: [
          {
            id: 'open-work-item',
            text: 'Open work item',
            iconProps: { iconName: 'WorkItem' },
            onActivate: async () => {
              await checkOpenWorkItem(parseInt(data.workItemId));
            }
          }
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

  const openWorkItem = async (id: number) => {
    const service = await DevOps.getService<IWorkItemFormNavigationService>(
      'ms.vss-work-web.work-item-form-navigation-service'
    );
    const wi = await service.openWorkItem(id);
    console.log(wi);
  };
  const checkOpenWorkItem = async (id: number) => {
    if (getLocalItem<boolean>(LocalStorageKeys.OpenWorkItem)) {
      await openWorkItem(id);
    } else {
      const config: IConfirmationConfig = {
        cancelButton: {
          text: 'Cancel'
        },
        doNotShowAgain: true,
        confirmButton: {
          text: 'OK',
          primary: true
        },
        content: `When adding or updating acceptance criterias from this view you will need to press "Refresh"
        in the top for changes to appear.`
      };
      await devOpsService.showDialog<ActionResult<boolean>, DialogIds>(
        DialogIds.ConfirmationDialog,
        {
          title: 'Open work item',
          onClose: async result => {
            if (result?.success) {
              if (result.message === 'DO_NOT_SHOW_AGAIN') {
                setLocalItem(LocalStorageKeys.OpenWorkItem, true);
              }
              openWorkItem(id);
            }
          },
          configuration: config
        }
      );
    }
  };

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
              <WorkItemTypeTag
                {...dta}
                id={wi.id}
                title={getWorkItemTitle(wi)}
                onClick={async (id: number) => {
                  await checkOpenWorkItem(id);
                }}
              />
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

  if (workItems.length === 0)
    return (
      <div className="flex-grow">
        <LoadingSection isLoading text="Loading criterias..." />
      </div>
    );

  const columns = [
    idCell,
    titleCell,
    moreColumn,
    progressCell,
    criteriaState,
    approverCell,
    typeItemCell
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
