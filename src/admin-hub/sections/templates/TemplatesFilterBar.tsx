import { getInitials, Persona, PersonaSize } from '@fluentui/react';
import { distinctBy, isDefined } from '@joachimdalen/azdevops-ext-core/CoreUtils';
import { DropdownFilterBarItem } from 'azure-devops-ui/Dropdown';
import { FilterBar } from 'azure-devops-ui/FilterBar';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { KeywordFilterBarItem } from 'azure-devops-ui/TextFilterBarItem';
import { DropdownMultiSelection } from 'azure-devops-ui/Utilities/DropdownSelection';
import {
  Filter,
  FILTER_CHANGE_EVENT,
  FilterOperatorType,
  IFilterState
} from 'azure-devops-ui/Utilities/Filter';
import { useMemo } from 'react';

import { getRawLocalItem, LocalStorageRawKeys } from '../../../common/localStorage';
import { CriteriaTemplateDocument } from '../../../common/types';
import css from 'classnames';

interface TemplatesFilterBarProps {
  className?: string;
  templates: CriteriaTemplateDocument[];
  onFilterChanged: (filter: IFilterState) => void;
}

const TemplatesFilterBar = ({
  className,
  templates,
  onFilterChanged
}: TemplatesFilterBarProps): JSX.Element | null => {
  const creatorsSelection = useMemo(() => new DropdownMultiSelection(), []);
  const creators = useMemo(() => {
    const creator = templates.map(x => x.createdBy).filter(isDefined);
    const distApprovers = distinctBy(creator, 'entityId');
    return distApprovers;
  }, [templates]);

  const approverItems: IListBoxItem[] = useMemo(() => {
    const host = getRawLocalItem(LocalStorageRawKeys.HostUrl);
    const url = host === undefined ? '' : host;

    return creators.map(app => {
      const item: IListBoxItem = {
        id: app.entityId,
        text: app.displayName,
        iconProps: {
          render: () => (
            <Persona
              text={app.displayName}
              size={PersonaSize.size24}
              imageInitials={getInitials(app.displayName, false)}
              imageUrl={app?.image?.startsWith(url) ? app?.image : `${url}${app?.image}`}
              onRenderPrimaryText={p => null}
            />
          )
        }
      };

      return item;
    });
  }, [creators]);
  const filter = useMemo(() => {
    const f = new Filter();
    f.setFilterItemState('title', {
      value: '',
      operator: FilterOperatorType.and
    });
    f.setFilterItemState('creators', {
      value: [],
      operator: FilterOperatorType.and
    });

    f.subscribe(() => {
      const state = f.getState();
      onFilterChanged(state);
    }, FILTER_CHANGE_EVENT);

    return f;
  }, [onFilterChanged]);

  return (
    <FilterBar filter={filter} className={css(className)}>
      <KeywordFilterBarItem filterItemKey="title" />
      <DropdownFilterBarItem
        filterItemKey="creators"
        filter={filter}
        items={approverItems}
        selection={creatorsSelection}
        placeholder="Creators"
        showFilterBox
      />
    </FilterBar>
  );
};

export default TemplatesFilterBar;
