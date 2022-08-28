import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { Card } from 'azure-devops-ui/Card';
import { ITableColumn, renderSimpleCell, SimpleTableCell, Table } from 'azure-devops-ui/Table';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import ApproverDisplay from '../../common/components/ApproverDisplay';

import ProgressBar from '../../common/components/ProgressBar';
import { ApproverProgressItem } from '../types';

const ApproverProgress = ({ approvers }: { approvers: ApproverProgressItem[] }): JSX.Element => {
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
                  <ApproverDisplay
                    approver={
                      tableItem.id === 'none' ? undefined : (tableItem.id as IInternalIdentity)
                    }
                    showUnassigned
                  />
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
                    maxValue={tableItem.total}
                    currentValue={tableItem.current}
                    labelType="count"
                  />
                </SimpleTableCell>
              );
            }
          }
        ]}
        itemProvider={new ArrayItemProvider(approvers)}
      />
    </Card>
  );
};

export default ApproverProgress;
