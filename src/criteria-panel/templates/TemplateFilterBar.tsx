import { DropdownFilterBarItem } from 'azure-devops-ui/Dropdown';
import { FilterBar } from 'azure-devops-ui/FilterBar';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { ITableColumn, SimpleTableCell } from 'azure-devops-ui/Table';
import { KeywordFilterBarItem } from 'azure-devops-ui/TextFilterBarItem';
import {
  Filter,
  FILTER_CHANGE_EVENT,
  FilterOperatorType,
  IFilterState
} from 'azure-devops-ui/Utilities/Filter';
import { useMemo } from 'react';

import { criteriaTypeItems } from '../../common/common';
import CriteriaTypeDisplay from '../../common/components/CriteriaTypeDisplay';
import { getLocalItem, LocalStorageKeys, setLocalItem } from '../../common/localStorage';
import { CriteriaTypes } from '../../common/types';

interface TemplateFilterBarProps {
  onFilterChanged: (filter: IFilterState) => void;
}

const TemplateFilterBar = ({ onFilterChanged }: TemplateFilterBarProps): JSX.Element | null => {
  const filter = useMemo(() => {
    const f = new Filter();

    f.setFilterItemState('title', {
      value: '',
      operator: FilterOperatorType.and
    });
    f.setFilterItemState('type', {
      value: '',
      operator: FilterOperatorType.and
    });

    f.subscribe(() => {
      const state = f.getState();
      setLocalItem(LocalStorageKeys.FilterState, state);
      onFilterChanged(state);
    }, FILTER_CHANGE_EVENT);

    return f;
  }, [onFilterChanged]);

  return (
    <FilterBar filter={filter}>
      <KeywordFilterBarItem filterItemKey="title" />

      <DropdownFilterBarItem
        filterItemKey="type"
        filter={filter}
        items={criteriaTypeItems}
        placeholder="Type"
        renderItem={(
          rowIndex: number,
          columnIndex: number,
          tableColumn: ITableColumn<IListBoxItem>,
          tableItem: IListBoxItem
        ) => {
          return (
            <SimpleTableCell key={tableItem.id} columnIndex={columnIndex}>
              <CriteriaTypeDisplay type={tableItem.id as CriteriaTypes} />
            </SimpleTableCell>
          );
        }}
      />
    </FilterBar>
  );
};

export default TemplateFilterBar;
