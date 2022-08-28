import { LoadingSection } from '@joachimdalen/azdevops-ext-core/LoadingSection';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { useDropdownSelection } from '@joachimdalen/azdevops-ext-core/useDropdownSelection';
import { WorkItemService } from '@joachimdalen/azdevops-ext-core/WorkItemService';
import {
  IWorkItemFormNavigationService,
  WorkItem,
  WorkItemExpand
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { useObservableArray } from 'azure-devops-ui/Core/Observable';
import { EditableDropdown, IEditableDropdownProps } from 'azure-devops-ui/EditableDropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { Link } from 'azure-devops-ui/Link';
import { IListItemDetails, ListItem, ScrollableList } from 'azure-devops-ui/List';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { ITableColumn, SimpleTableCell } from 'azure-devops-ui/Table';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import debounce from 'lodash.debounce';
import { useEffect, useMemo, useState } from 'react';

import { useCriteriaBuilderContext } from '../criterias/CriteriaBuilderContext';
import { CriteriaPanelMode, isEditMode } from '../types';
import { getWorkItemStates, getWorkItemTypeMap } from '../workItemUtils';
import StateTag from './StateTag';
interface WorkItemPickerProps
  extends Omit<IEditableDropdownProps, 'renderItem' | 'items' | 'disabled'> {
  disabled?: boolean;
  workItems?: number[];
  mode: CriteriaPanelMode;
  onWorkItemSelected: (workItemIds: number[]) => void;
}
const renderWorkItemCell = (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IListBoxItem>,
  tableItem: IListBoxItem
): JSX.Element => {
  const data: any = tableItem.data;
  return (
    <SimpleTableCell key={tableItem.id} columnIndex={columnIndex}>
      <div className="flex-row flex-center">
        <img src={data?.icon?.url} height={16} />
        <span className="margin-left-16 font-size-sm">{`${data?.workItemType} ${tableItem.id}: ${tableItem?.text}`}</span>
      </div>
    </SimpleTableCell>
  );
};

const WorkItemPicker = ({
  disabled,
  workItems,
  onWorkItemSelected,
  mode
}: WorkItemPickerProps): JSX.Element => {
  const [loadedWorkItems, setLoadedWorkItems] = useObservableArray<IListBoxItem>([]);
  const [searchedWorkItems, setSearchedWorkItems] = useState<WorkItem[]>([]);
  const selection = useDropdownSelection(loadedWorkItems.value);
  const workItemService = useMemo(() => new WorkItemService(), []);
  const [pickedWorkItems, setPickedWorkItems] = useState<WorkItem[]>([]);
  const [isLoading, toggleLoading] = useBooleanToggle(false);
  const { state, dispatch } = useCriteriaBuilderContext();
  useEffect(() => {
    async function init() {
      if (state.workItemTypes === undefined) {
        toggleLoading(true);
        const loadedTypes = await workItemService.getWorkItemTypes();
        dispatch({ type: 'SET_WORKITEM_TYPES', data: loadedTypes });
      }

      if (workItems && workItems.length > 0) {
        toggleLoading(true);
        const predefinedWorkItems = await workItemService.getWorkItems(workItems);
        setPickedWorkItems(predefinedWorkItems);
      }
      toggleLoading(false);
    }

    init();
  }, []);

  const maps = useMemo(
    () => getWorkItemTypeMap([...searchedWorkItems, ...pickedWorkItems], state.workItemTypes || []),
    [searchedWorkItems, pickedWorkItems, state.workItemTypes]
  );
  const states = useMemo(
    () => getWorkItemStates([...searchedWorkItems, ...pickedWorkItems], state.workItemTypes || []),
    [searchedWorkItems, pickedWorkItems, state.workItemTypes]
  );
  const openWorkItem = async (id: number) => {
    const service = await DevOps.getService<IWorkItemFormNavigationService>(
      'ms.vss-work-web.work-item-form-navigation-service'
    );
    await service.openWorkItem(id, true);
  };

  useEffect(() => {
    setLoadedWorkItems(
      searchedWorkItems
        .filter(x => !pickedWorkItems.some(y => x.id == y.id))
        .map(x => {
          const item: IListBoxItem = {
            id: x.id.toString(),
            text: x.fields['System.Title'],
            data: {
              workItem: x,
              workItemType: x.fields['System.WorkItemType'],
              icon: {
                url: maps.get(x.fields['System.WorkItemType'])?.iconUrl
              }
            }
          };

          return item;
        })
    );
  }, [searchedWorkItems, maps, pickedWorkItems]);

  const changeHandler = async (
    event:
      | React.SyntheticEvent<HTMLElement, Event>
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | null,
    value?: string | undefined
  ) => {
    if (value == '') return;

    let query = `SELECT [System.Id] FROM workitems WHERE [System.WorkItemType] <> '' AND [System.State] <> '' `;

    if (isNaN(parseInt(value || ''))) {
      query = query + `AND [System.Title] CONTAINS '${value}'`;
    } else {
      query = query + `AND [System.Id] = '${value}'`;
    }

    const workItemResult = await workItemService.queryWorkItems(query);
    const ids = workItemResult?.workItems.map(x => x.id) || [];
    if (ids.length > 0) {
      const wis = await workItemService.getWorkItems(ids, WorkItemExpand.None, [
        'System.Id',
        'System.WorkItemType',
        'System.Title',
        'System.State',
        'System.AssignedTo'
      ]);
      setSearchedWorkItems(wis);
    }
  };
  const debouncedChangeHandler = useMemo(() => debounce(changeHandler, 500), []);
  const renderRow = (
    index: number,
    item: WorkItem,
    listDetails: IListItemDetails<WorkItem>,
    key?: string
  ): JSX.Element => {
    console.log(states);
    const state = states
      .get(item.fields['System.WorkItemType'])
      ?.find(x => x.name == item.fields['System.State']);
    return (
      <ListItem key={key || 'list-item' + index} index={index} details={listDetails}>
        <div className="h-scroll-hidden padding-8 flex-row flex-grow dark-background">
          <div className="flex-row flex-grow flex-center rhythm-horizontal-8">
            <img src={maps.get(item.fields['System.WorkItemType'])?.iconUrl} height={16} />
            <div className="rhythm-vertical-4">
              <Link onClick={() => openWorkItem(item.id)}>
                <div className="rhythm-horizontal-8 font-size-s font-weight-heavy">
                  <span>{item.id}</span>
                  <span>{item.fields['System.Title']}</span>
                </div>
              </Link>
              {state && (
                <StateTag
                  className="font-size-s"
                  color={state?.color}
                  text={item.fields['System.State']}
                />
              )}
            </div>
          </div>
          <ConditionalChildren renderChildren={isEditMode(mode)}>
            <Button
              danger
              tooltipProps={{ text: 'Remove link' }}
              iconProps={{ iconName: 'RemoveLink' }}
              onClick={() => {
                const newItems = pickedWorkItems.filter(x => x.id !== item.id);
                onWorkItemSelected(newItems.map(x => x.id));
                setPickedWorkItems(newItems);
              }}
            />
          </ConditionalChildren>
        </div>
      </ListItem>
    );
  };
  return (
    <div className="flex-grow flex-center padding-vertical-8">
      <ConditionalChildren renderChildren={isEditMode(mode)}>
        <div className="flex-grow margin-bottom-8">
          <FormItem label="Link a work item">
            <EditableDropdown
              placeholder="Search id or title"
              items={loadedWorkItems}
              selection={selection}
              renderItem={renderWorkItemCell}
              onTextChange={debouncedChangeHandler}
              onValueChange={v => {
                const wi = (v?.data as any)?.workItem;
                if (wi !== undefined) {
                  const newItems = [...pickedWorkItems, wi];
                  setPickedWorkItems(newItems);
                  onWorkItemSelected(newItems.map(x => x.id));
                }
              }}
              filterByText={false}
              noItemsText="Searching...."
            />
          </FormItem>
        </div>
      </ConditionalChildren>
      <LoadingSection isLoading={isLoading} text="Loading work items..." />
      <ConditionalChildren renderChildren={!isLoading && pickedWorkItems.length === 0}>
        <ZeroData imageAltText="" primaryText="No work items linked" />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={!isLoading && pickedWorkItems.length !== 0}>
        <ScrollableList
          className="margin-top-16"
          itemProvider={new ArrayItemProvider(pickedWorkItems)}
          renderRow={renderRow}
          width="100%"
        />
      </ConditionalChildren>
    </div>
  );
};

export default WorkItemPicker;
