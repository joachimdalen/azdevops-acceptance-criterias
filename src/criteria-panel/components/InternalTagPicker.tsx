import { ExtendedWorkItemTrackingRestClient } from '@joachimdalen/azdevops-ext-core/ExtendedWorkItemTrackingRestClient';
import { getClient } from 'azure-devops-extension-api';
import { WorkItemTagDefinition } from 'azure-devops-extension-api/WorkItemTracking';
import { useObservableArray } from 'azure-devops-ui/Core/Observable';
import { ISuggestionItemProps } from 'azure-devops-ui/SuggestionsList';
import { TagPicker } from 'azure-devops-ui/TagPicker';
import { useEffect } from 'react';

export const InternalTagPicker = () => {
  const [tagItems, setTagItems] = useObservableArray<WorkItemTagDefinition>([]);
  const [suggestions, setSuggestions] = useObservableArray<WorkItemTagDefinition>([]);

  useEffect(() => {
    async function init() {
      const client = getClient(ExtendedWorkItemTrackingRestClient);
      const tags = await client.getWorkItemTags('DemoProject');

      setTagItems(tags);
    }

    init();
  }, []);

  const areTagsEqual = (a: WorkItemTagDefinition, b: WorkItemTagDefinition) => {
    return a.id === b.id;
  };

  const convertItemToPill = (tag: WorkItemTagDefinition) => {
    return {
      content: tag.name,
      onClick: () => alert(`Clicked tag "${tag.name}"`)
    };
  };

  const onSearchChanged = (searchValue: string) => {
    // setSuggestions(
    //   tagData
    //     .filter(
    //       testItem =>
    //         tagItems.value.findIndex(testSuggestion => testSuggestion.id == testItem.id) === -1
    //     )
    //     .filter(testItem => testItem.text.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)
    // );
    console.log(searchValue);
  };

  const onTagAdded = (tag: WorkItemTagDefinition) => {
    setTagItems([...tagItems.value, tag]);
  };

  const onTagRemoved = (tag: WorkItemTagDefinition) => {
    setTagItems(tagItems.value.filter(x => x.id !== tag.id));
  };

  const renderSuggestionItem = (tag: ISuggestionItemProps<WorkItemTagDefinition>) => {
    return <div className="body-m">{tag.item.name}</div>;
  };

  return (
    <div className="flex-column">
      <TagPicker
        areTagsEqual={areTagsEqual}
        convertItemToPill={convertItemToPill}
        noResultsFoundText={'No results found'}
        onSearchChanged={onSearchChanged}
        onTagAdded={onTagAdded}
        onTagRemoved={onTagRemoved}
        renderSuggestionItem={renderSuggestionItem}
        selectedTags={tagItems}
        suggestions={suggestions}
        suggestionsLoading={false}
      />
    </div>
  );
};
