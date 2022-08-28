import { Card } from 'azure-devops-ui/Card';
import { ITableColumn, renderSimpleCell, SimpleTableCell, Table } from 'azure-devops-ui/Table';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';

import ProgressBar from '../../common/components/ProgressBar';

interface ApproverProgressItem {
  name: string;
  max: number;
  current: number;
}

const ApproverProgress = (): JSX.Element => {
  return (
    <Card
      headerIconProps={{ iconName: 'Contact' }}
      titleProps={{ text: 'Approver Progress' }}
      contentProps={{ contentPadding: false }}
    >
      <Table
        columns={[
          {
            id: 'approver',
            width: -30,
            name: 'Approver',
            renderCell: (
              rowIndex: number,
              columnIndex: number,
              tableColumn: ITableColumn<ApproverProgressItem>,
              tableItem: ApproverProgressItem,
              ariaRowIndex?: number
            ) => {
              return (
                <SimpleTableCell columnIndex={columnIndex} tableColumn={tableColumn}>
                  {tableItem.name}
                </SimpleTableCell>
              );
            }
          },
          {
            id: 'progress',
            width: -30,
            name: 'Progress',
            renderCell: (
              rowIndex: number,
              columnIndex: number,
              tableColumn: ITableColumn<ApproverProgressItem>,
              tableItem: ApproverProgressItem,
              ariaRowIndex?: number
            ) => {
              return (
                <SimpleTableCell columnIndex={columnIndex} tableColumn={tableColumn}>
                  <ProgressBar
                    maxValue={tableItem.max}
                    currentValue={tableItem.current}
                    labelType="count"
                  />
                </SimpleTableCell>
              );
            }
          }
        ]}
        itemProvider={
          new ArrayItemProvider<ApproverProgressItem>([
            { name: 'Joachim Dalen', max: 100, current: 14 }
          ])
        }
      />
    </Card>
  );
};

export default ApproverProgress;
