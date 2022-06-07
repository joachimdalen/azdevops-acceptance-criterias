import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { Ago } from 'azure-devops-ui/Ago';
import { Link } from 'azure-devops-ui/Link';
import { renderListCell } from 'azure-devops-ui/List';
import { ITableColumn, SimpleTableCell, TableColumnStyle } from 'azure-devops-ui/Table';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { AgoFormat } from 'azure-devops-ui/Utilities/Date';
import css from 'classnames';
import ApproverDisplay from './components/ApproverDisplay';
import InternalLink from './components/InternalLink';
import { IExtendedTableCell } from './types';

export interface ActionCell<T> {
  title: string;
  onClick: (item: T) => void;
}

const renderBaseCell = <T,>(
  columnIndex: number,
  tableColumn: ITableColumn<T>,
  tableCell: string | React.ReactNode,
  ariaRowIndex?: number
) => {
  const columnStyle = tableColumn.columnStyle;
  return (
    <SimpleTableCell
      ariaRowIndex={ariaRowIndex}
      className={css(
        columnStyle === TableColumnStyle.Primary && 'bolt-table-cell-primary',
        columnStyle === TableColumnStyle.Secondary && 'bolt-table-cell-secondary',
        columnStyle === TableColumnStyle.Tertiary && 'bolt-table-cell-tertiary'
      )}
      columnIndex={columnIndex}
      tableColumn={tableColumn}
      key={columnIndex}
    >
      {tableCell}
    </SimpleTableCell>
  );
};

export const renderIdentityCell = <T,>(
  columnIndex: number,
  tableColumn: ITableColumn<T>,
  identity?: IInternalIdentity,
  ariaRowIndex?: number
): JSX.Element =>
  renderBaseCell(columnIndex, tableColumn, <ApproverDisplay approver={identity} />, ariaRowIndex);
export const renderAgoCell = <T,>(
  columnIndex: number,
  tableColumn: ITableColumn<T>,
  date?: Date,
  ariaRowIndex?: number
): JSX.Element =>
  renderBaseCell(
    columnIndex,
    tableColumn,
    date && <Ago format={AgoFormat.Compact} date={date} />,
    ariaRowIndex
  );

export const renderActionCell = <T,>(
  columnIndex: number,
  tableColumn: ITableColumn<T>,
  tableItem: T,
  actionItem: ActionCell<T>,
  ariaRowIndex?: number
): JSX.Element =>
  renderBaseCell(
    columnIndex,
    tableColumn,
    <InternalLink onClick={() => actionItem.onClick(tableItem)}>
      <Tooltip text={actionItem.title}>
        <span>{actionItem.title}</span>
      </Tooltip>
    </InternalLink>,
    ariaRowIndex
  );

export const renderTextCell = <T extends { [key: string]: any }>(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<T>,
  tableItem: T,
  ariaRowIndex?: number
): JSX.Element => renderBaseCell(columnIndex, tableColumn, tableItem[tableColumn.id], ariaRowIndex);
