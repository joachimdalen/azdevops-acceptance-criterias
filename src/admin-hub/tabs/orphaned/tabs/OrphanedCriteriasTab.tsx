import { getClient } from 'azure-devops-extension-api';
import {
  WorkItem,
  WorkItemErrorPolicy,
  WorkItemTrackingRestClient
} from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
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
import { useEffect, useMemo, useState } from 'react';

import { chunk } from '../../../../common/chunkUtil';
import CriteriaTypeDisplay from '../../../../common/components/CriteriaTypeDisplay';
import { StorageService } from '../../../../common/services/StorageService';
import { CriteriaDocument, CriteriaTypes } from '../../../../common/types';

const OrphanedCriteriasTab = (): React.ReactElement => {
  const [service, workItemService] = useMemo(
    () => [new StorageService(), getClient(WorkItemTrackingRestClient)],
    []
  );
  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);

  const selection = useMemo(() => {
    return new ListSelection({ selectOnFocus: false, multiSelect: true });
  }, []);

  useEffect(() => {
    async function init() {
      const criterias = await service.getAllCriterias();

      const ids = criterias.map(x => parseInt(x.id));

      const workItmes = await getBatched(ids);
      const notFound = ids.filter(x => !workItmes.some(y => x === y.id));
      const updated = await workItemService.getDeletedWorkItems(notFound);
      setDocuments(criterias.filter(x => updated.some(y => x.id === y.id.toString())));
    }

    init();
  }, []);

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

  return (
    <div className="flex-column">
      <ButtonGroup>
        <Button
          danger
          text="Delete all"
          onClick={() => {
            const selectedGroups = selection.value.flatMap(x => {
              const slice = documents.slice(x.beginIndex, x.endIndex + 1);
              return slice;
            });
            console.log(selectedGroups);
          }}
        />
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
    </div>
  );
};

export default OrphanedCriteriasTab;
