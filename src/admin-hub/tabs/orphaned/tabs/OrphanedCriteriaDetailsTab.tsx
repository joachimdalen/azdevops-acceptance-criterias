import { getClient } from 'azure-devops-extension-api';
import { WorkItemTrackingRestClient } from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
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
import { Dialog } from 'azure-devops-ui/Dialog';
import CriteriaTypeDisplay from '../../../../common/components/CriteriaTypeDisplay';
import { StorageService } from '../../../../common/services/StorageService';
import { CriteriaDetailDocument, CriteriaTypes } from '../../../../common/types';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import ProgressBar from '../../../../common/components/ProgressBar';

const OrphanedCriteriaDetailsTab = (): React.ReactElement => {
  const [service, workItemService] = useMemo(
    () => [new StorageService(), getClient(WorkItemTrackingRestClient)],
    []
  );
  const [documents, setDocuments] = useState<CriteriaDetailDocument[]>([]);
  const [showDelete, toggleShowDelete] = useBooleanToggle();
  const [currentValue, setCurrentValue] = useState(0);
  const [progrss, setProgress] = useState<{ max: number; current: number }>({ max: 0, current: 0 });

  useEffect(() => {
    let interval: any = null;
    if (showDelete) {
      interval = setInterval(() => {
        setCurrentValue(seconds => seconds + 1);
      }, 1000);
    } else if (!showDelete && currentValue !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showDelete, currentValue]);

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
      const criterias = await service.getAllCriterias();
      const details = await service.getAllCriteriaDetails();
      const ids = criterias.flatMap(x => x.criterias.map(y => y.id));
      const exists = details.filter(x => !ids.some(y => x.id === y));
      setDocuments(exists);
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
      width: 250
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
      width: -100
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

  return (
    <div className="flex-column">
      <ButtonGroup>
        <Button
          danger
          text="Delete all"
          onClick={async () => {
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
      <ConditionalChildren renderChildren={showDelete}>
        <Dialog
          titleProps={{ text: 'Confirm' }}
          footerButtonProps={[
            {
              text: 'Cancel',
              onClick: () => toggleShowDelete(false)
            }
          ]}
          onDismiss={() => toggleShowDelete(false)}
        >
          <p>Deleting criterias</p>
          <ProgressBar maxValue={progrss.max} currentValue={progrss.current} labelType="count" />
        </Dialog>
      </ConditionalChildren>
    </div>
  );
};

export default OrphanedCriteriaDetailsTab;
