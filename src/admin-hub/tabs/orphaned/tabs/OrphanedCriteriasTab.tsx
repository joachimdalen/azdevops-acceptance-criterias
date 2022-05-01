import { LoadingSection } from '@joachimdalen/azdevops-ext-core/LoadingSection';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { getClient } from 'azure-devops-extension-api';
import {
  WorkItem,
  WorkItemErrorPolicy,
  WorkItemTrackingRestClient
} from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Dialog } from 'azure-devops-ui/Dialog';
import { ListSelection } from 'azure-devops-ui/List';
import {
  ColumnMore,
  ColumnSelect,
  ISimpleTableCell,
  ITableColumn,
  renderSimpleCell,
  SimpleTableCell,
  Table
} from 'azure-devops-ui/Table';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import { useEffect, useMemo, useState } from 'react';

import { chunk } from '../../../../common/chunkUtil';
import CriteriaTypeDisplay from '../../../../common/components/CriteriaTypeDisplay';
import ProgressBar from '../../../../common/components/ProgressBar';
import { StorageService } from '../../../../common/services/StorageService';
import { CriteriaDocument, CriteriaTypes } from '../../../../common/types';

const OrphanedCriteriasTab = (): React.ReactElement => {
  const [service, workItemService] = useMemo(
    () => [new StorageService(), getClient(WorkItemTrackingRestClient)],
    []
  );
  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);
  const [loading, toggleLoading] = useBooleanToggle(false);
  const [showDelete, toggleShowDelete] = useBooleanToggle();

  const [progress, setProgress] = useState<{ max: number; current: number }>({
    max: 0,
    current: 0
  });

  const selection = useMemo(() => {
    return new ListSelection({ selectOnFocus: false, multiSelect: true });
  }, []);

  useEffect(() => {
    async function init() {
      toggleLoading(true);
      const criterias = await service.getAllCriterias();

      const ids = criterias.map(x => parseInt(x.id));

      const workItmes = await getBatched(ids);
      const notFound = ids.filter(x => !workItmes.some(y => x === y.id));
      if (notFound?.length !== 0) {
        const updated = await workItemService.getDeletedWorkItems(notFound);
        setDocuments(criterias.filter(x => updated.some(y => x.id === y.id.toString())));
      }
      toggleLoading(false);
    }

    init();
  }, []);

  async function deleteDocuments() {
    const selectedGroups = selection.value.flatMap(x => {
      const slice = documents.slice(x.beginIndex, x.endIndex + 1);
      return slice;
    });
    setProgress({ max: selectedGroups.length, current: 0 });
    toggleShowDelete();

    for (const item of selectedGroups) {
      await service.deleteCriteriaDocument(item.id);
      setProgress(prg => ({ max: prg.max, current: prg.current + 1 }));
    }

    const newItems = documents.filter(x => !selectedGroups.some(y => x.id === y.id));
    setDocuments(newItems);
    selection.clear();
  }

  const getBatched = async (workItemIds: number[]): Promise<WorkItem[]> => {
    const batched = chunk(workItemIds, 175);
    const items: WorkItem[] = [];
    for (const batch of batched) {
      const wi = await workItemService.getWorkItems(
        batch,
        undefined,
        ['System.ID'],
        undefined,
        undefined,
        WorkItemErrorPolicy.Omit
      );
      items.push(...wi);
    }

    return items;
  };

  interface OrpahnedCriterias extends ISimpleTableCell {
    id: string;
    workItemId: string;
    title: string;
    type: CriteriaTypes;
  }

  const provider = useMemo(() => {
    const items: OrpahnedCriterias[] = documents.flatMap(doc => {
      return doc.criterias.map(crit => {
        return {
          id: crit.id,
          workItemId: doc.id,
          title: crit.title,
          type: crit.type
        };
      });
    });
    return new ArrayItemProvider<OrpahnedCriterias>(items);
  }, [documents]);

  const columns: ITableColumn<OrpahnedCriterias>[] = [
    new ColumnSelect() as any,
    {
      id: 'id',
      name: 'Criteria Id',
      renderCell: renderSimpleCell,
      width: 250
    },
    {
      id: 'workItemId',
      name: 'Work Item Id',
      renderCell: renderSimpleCell,
      width: 100
    },
    {
      id: 'title',
      name: 'Title',
      renderCell: renderSimpleCell,
      width: -100
    },
    {
      id: 'type',
      name: 'Type',
      renderCell: (
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<OrpahnedCriterias>,
        tableItem: OrpahnedCriterias,
        ariaRowIndex?: number
      ) => {
        return (
          <SimpleTableCell columnIndex={columnIndex} tableColumn={tableColumn}>
            <CriteriaTypeDisplay type={tableItem.type} />
          </SimpleTableCell>
        );
      },
      width: -100
    },
    new ColumnMore((item: OrpahnedCriterias) => {
      return {
        id: 'sub-menu',
        items: [
          {
            id: 'delete',
            text: 'Delete',
            iconProps: { iconName: 'Delete' },
            onActivate: () => {
              service.deleteCriteriaDocument(item.id);
              service.deleteCriteriaDetilsDocument(item.id);
            }
          }
        ]
      };
    })
  ];

  if (loading) return <LoadingSection isLoading={loading} text="Loading criterias..." />;

  return (
    <div className="flex-column">
      <ConditionalChildren renderChildren={documents.length > 0}>
        <ButtonGroup>
          <Button danger text="Delete all" onClick={deleteDocuments} />
        </ButtonGroup>
        <Table
          ariaLabel="Basic Table"
          columns={columns}
          itemProvider={provider}
          selection={selection}
          role="table"
          className="table-example"
          containerClassName="h-scroll-auto"
        />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={documents.length === 0}>
        <ZeroData imageAltText="" primaryText="No orphaned criterias" />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={showDelete}>
        <Dialog
          lightDismiss={false}
          titleProps={{
            text: progress.current === progress.max ? 'Criterias deleted' : 'Deleting criterias'
          }}
          footerButtonProps={
            progress.current === progress.max
              ? [
                  {
                    primary: true,
                    text: 'Dismiss',
                    onClick: () => toggleShowDelete(false)
                  }
                ]
              : []
          }
          onDismiss={() => toggleShowDelete(false)}
        >
          <ProgressBar
            fixedColor
            maxValue={progress.max}
            currentValue={progress.current}
            labelType="count"
          />
        </Dialog>
      </ConditionalChildren>
    </div>
  );
};

export default OrphanedCriteriasTab;
