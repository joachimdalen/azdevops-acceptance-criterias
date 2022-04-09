import { LoadingSection } from '@joachimdalen/azdevops-ext-core/LoadingSection';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { getClient } from 'azure-devops-extension-api';
import { WorkItemTrackingRestClient } from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableValue } from 'azure-devops-ui/Core/Observable';
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
import { useEffect, useMemo, useState } from 'react';

import CriteriaTypeDisplay from '../../../../common/components/CriteriaTypeDisplay';
import ProgressBar from '../../../../common/components/ProgressBar';
import { StorageService } from '../../../../common/services/StorageService';
import { CriteriaDetailDocument, CriteriaTypes } from '../../../../common/types';

const OrphanedCriteriaDetailsTab = (): React.ReactElement => {
  const [loading, toggleLoading] = useBooleanToggle(false);
  const [service, workItemService] = useMemo(
    () => [new StorageService(), getClient(WorkItemTrackingRestClient)],
    []
  );
  const [documents, setDocuments] = useState<CriteriaDetailDocument[]>([]);
  const [showDelete, toggleShowDelete] = useBooleanToggle();

  const [progress, setProgress] = useState<{ max: number; current: number }>({
    max: 0,
    current: 0
  });

  const selection = useMemo(() => {
    return new ListSelection({ selectOnFocus: false, multiSelect: true });
  }, []);

  const getType = (det: CriteriaDetailDocument): 'Unknown' | CriteriaTypes => {
    if (det.checklist !== undefined) return 'checklist';
    if (det.scenario !== undefined) return 'scenario';
    if (det.text !== undefined) return 'text';
    return 'Unknown';
  };

  useEffect(() => {
    async function init() {
      toggleLoading(true);
      const criterias = await service.getAllCriterias();
      const details = await service.getAllCriteriaDetails();
      const ids = criterias.flatMap(x => x.criterias.map(y => y.id));
      const exists = details.filter(x => !ids.some(y => x.id === y));
      setDocuments(exists);
      toggleLoading(false);
    }

    init();
  }, []);

  interface OrphanedCriteriaDetail extends ISimpleTableCell {
    id: string;
    type: 'Unknown' | CriteriaTypes;
  }

  const provider = useMemo(() => {
    const items: OrphanedCriteriaDetail[] = documents.flatMap(doc => {
      return {
        id: doc.id,
        type: getType(doc)
      };
    });
    return new ArrayItemProvider<OrphanedCriteriaDetail>(items);
  }, [documents]);

  const columns: ITableColumn<OrphanedCriteriaDetail>[] = [
    new ColumnSelect() as any,
    {
      id: 'id',
      name: 'Criteria Id',
      renderCell: renderSimpleCell,
      onSize: onSize,
      readonly: true,
      width: new ObservableValue(250)
    },
    {
      id: 'type',
      name: 'Type',
      renderCell: (
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<OrphanedCriteriaDetail>,
        tableItem: OrphanedCriteriaDetail,
        ariaRowIndex?: number
      ) => {
        console.log('rerender');
        return (
          <SimpleTableCell columnIndex={columnIndex} tableColumn={tableColumn}>
            {tableItem.type === 'Unknown' ? (
              'Unknwon'
            ) : (
              <CriteriaTypeDisplay type={tableItem.type} />
            )}
          </SimpleTableCell>
        );
      },
      width: new ObservableValue(-100)
    },
    new ColumnMore((item: OrphanedCriteriaDetail) => {
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
  function onSize(event: MouseEvent, index: number, width: number) {
    (columns[index].width as ObservableValue<number>).value = width;
  }

  async function deleteDocuments() {
    const selectedGroups = selection.value.flatMap(x => {
      const slice = documents.slice(x.beginIndex, x.endIndex + 1);
      return slice;
    });
    setProgress({ max: selectedGroups.length, current: 0 });
    toggleShowDelete();

    for (const item of selectedGroups) {
      await service.deleteCriteriaDetilsDocument(item.id);
      setProgress(prg => ({ max: prg.max, current: prg.current + 1 }));
    }

    const newItems = documents.filter(x => !selectedGroups.some(y => x.id === y.id));
    setDocuments(newItems);
    selection.clear();
  }

  if (loading) return <LoadingSection isLoading={loading} text="Loading criterias details..." />;

  return (
    <div className="flex-column">
      <ButtonGroup>
        <Button
          disabled={selection.selectedCount === 0}
          danger
          text="Delete all"
          onClick={deleteDocuments}
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
      <ConditionalChildren renderChildren={showDelete}>
        <Dialog
          lightDismiss={false}
          titleProps={{
            text:
              progress.current === progress.max ? 'Criteria details deleted' : 'Deleting criterias'
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

export default OrphanedCriteriaDetailsTab;
