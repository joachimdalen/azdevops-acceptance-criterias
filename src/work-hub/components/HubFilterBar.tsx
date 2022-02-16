import { getInitials, Persona, PersonaSize } from '@fluentui/react';
import { distinct, distinctBy, isDefined } from '@joachimdalen/azdevops-ext-core/CoreUtils';
import { DropdownFilterBarItem } from 'azure-devops-ui/Dropdown';
import { FilterBar } from 'azure-devops-ui/FilterBar';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { SimpleTableCell } from 'azure-devops-ui/Table';
import { KeywordFilterBarItem } from 'azure-devops-ui/TextFilterBarItem';
import {
  DropdownMultiSelection,
  DropdownSelection
} from 'azure-devops-ui/Utilities/DropdownSelection';
import {
  Filter,
  FILTER_CHANGE_EVENT,
  FilterOperatorType,
  IFilterState
} from 'azure-devops-ui/Utilities/Filter';
import { useEffect, useMemo } from 'react';

import { capitalizeFirstLetter, criteriaTypeItems } from '../../common/common';
import StatusTag from '../../common/components/StatusTag';
import { getLocalItem, LocalStorageKeys, setLocalItem } from '../../common/localStorage';
import { IAcceptanceCriteria } from '../../common/types';

interface HubFilterBarProps {
  criterias: IAcceptanceCriteria[];
  showFilter: boolean;
  onFilterChanged: (filter: IFilterState) => void;
}

const HubFilterBar = ({
  criterias,
  showFilter,
  onFilterChanged
}: HubFilterBarProps): JSX.Element | null => {
  const filter = useMemo(() => {
    const f = new Filter();
    const filter = getLocalItem<IFilterState>(LocalStorageKeys.FilterState);
    if (filter !== undefined && Object.keys(filter).length > 0) {
      f.setState(filter);
    } else {
      f.setFilterItemState('approvers', {
        value: [],
        operator: FilterOperatorType.and
      });
    }

    return f;
  }, []);

  useEffect(() => {
    filter.subscribe(() => {
      setLocalItem(LocalStorageKeys.FilterState, filter.getState());
      onFilterChanged(filter.getState());
    }, FILTER_CHANGE_EVENT);

    return filter.unsubscribe(() => {
      onFilterChanged(filter.getState());
    }, FILTER_CHANGE_EVENT);
  }, [filter, onFilterChanged]);
  const approversSelection = useMemo(() => new DropdownMultiSelection(), []);
  const typeSelection = useMemo(() => new DropdownSelection(), []);
  const stateSelection = useMemo(() => new DropdownSelection(), []);
  const approvers = useMemo(() => {
    const approvers = criterias.map(x => x.requiredApprover).filter(isDefined);
    const distApprovers = distinctBy(approvers, 'entityId');
    return distApprovers;
  }, [criterias]);

  const approverItems: IListBoxItem[] = useMemo(() => {
    return approvers.map(app => {
      const item: IListBoxItem = {
        id: app.entityId,
        text: app.displayName,
        iconProps: {
          render: () => (
            <Persona
              text={app.displayName}
              size={PersonaSize.size24}
              imageInitials={getInitials(app.displayName, false)}
              imageUrl={app.image}
              onRenderPrimaryText={p => null}
            />
          )
        }
      };

      return item;
    });
  }, [approvers]);

  const stateItems: IListBoxItem[] = useMemo(() => {
    return criterias
      .map(x => x.state)
      .filter(distinct)
      .map(c => {
        const item: IListBoxItem = {
          id: c,
          text: capitalizeFirstLetter(c),
          render: (ri, ci, tc, ti) => (
            <SimpleTableCell columnIndex={ci} tableColumn={tc}>
              <StatusTag state={c} />
            </SimpleTableCell>
          )
        };
        return item;
      });
  }, [criterias]);

  if (!showFilter) return null;

  return (
    <FilterBar filter={filter}>
      <KeywordFilterBarItem filterItemKey="title" />
      <DropdownFilterBarItem
        filterItemKey="type"
        filter={filter}
        items={criteriaTypeItems}
        selection={typeSelection}
        placeholder="Type"
      />
      <DropdownFilterBarItem
        filterItemKey="approvers"
        filter={filter}
        items={approverItems}
        selection={approversSelection}
        placeholder="Required Approver"
      />
      <DropdownFilterBarItem
        filterItemKey="state"
        filter={filter}
        items={stateItems}
        selection={stateSelection}
        placeholder="States"
      />
    </FilterBar>
  );
};

export default HubFilterBar;
