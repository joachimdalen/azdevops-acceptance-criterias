import { getInitials, Persona, PersonaSize } from '@fluentui/react';
import { distrinctBy, isDefined } from '@joachimdalen/azdevops-ext-core';
import { DropdownFilterBarItem } from 'azure-devops-ui/Dropdown';
import { FilterBar } from 'azure-devops-ui/FilterBar';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { KeywordFilterBarItem } from 'azure-devops-ui/TextFilterBarItem';
import {
  DropdownMultiSelection,
  DropdownSelection
} from 'azure-devops-ui/Utilities/DropdownSelection';
import { Filter, FILTER_CHANGE_EVENT, FilterOperatorType } from 'azure-devops-ui/Utilities/Filter';
import { useMemo } from 'react';

import { criteriaTypeItems } from '../../common/common';
import { IAcceptanceCriteria } from '../../common/types';

interface HubFilterBarProps {
  criterias: IAcceptanceCriteria[];
}

const HubFilterBar = ({ criterias }: HubFilterBarProps): JSX.Element => {
  const filter = useMemo(() => {
    const f = new Filter();
    f.setFilterItemState('approvers', {
      value: [],
      operator: FilterOperatorType.and
    });
    f.subscribe(() => {
      console.log(JSON.stringify(f.getState(), null, 4));
    }, FILTER_CHANGE_EVENT);

    return f;
  }, []);
  const approversSelection = useMemo(() => new DropdownMultiSelection(), []);
  const typeSelection = useMemo(() => new DropdownSelection(), []);
  const approvers = useMemo(() => {
    const approvers = criterias.map(x => x.requiredApprover).filter(isDefined);
    const distApprovers = distrinctBy(approvers, 'entityId');
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
    </FilterBar>
  );
};

export default HubFilterBar;
