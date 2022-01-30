import { useObservableArray } from 'azure-devops-ui/Core/Observable';
import { ISuggestionItemProps } from 'azure-devops-ui/SuggestionsList';
import { TagPicker } from 'azure-devops-ui/TagPicker';

interface TagItem {
  id: number;

  text: string;
}

const tagData: TagItem[] = [
  {
    id: 1,

    text: 'Item 1'
  },

  {
    id: 2,

    text: 'Item 2'
  },

  {
    id: 3,

    text: 'Item 3'
  }
];

export const InternalTagPicker = () => {
  const [tagItems, setTagItems] = useObservableArray<TagItem>(tagData.slice(0, 2));

  const [suggestions, setSuggestions] = useObservableArray<TagItem>([]);

  const areTagsEqual = (a: TagItem, b: TagItem) => {
    return a.id === b.id;
  };

  const convertItemToPill = (tag: TagItem) => {
    return {
      content: tag.text,

      onClick: () => alert(`Clicked tag "${tag.text}"`)
    };
  };

  const onSearchChanged = (searchValue: string) => {
    setSuggestions(
      tagData

        .filter(
          // Items not already included

          testItem =>
            tagItems.value.findIndex(testSuggestion => testSuggestion.id == testItem.id) === -1
        )

        .filter(testItem => testItem.text.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)
    );
  };

  const onTagAdded = (tag: TagItem) => {
    setTagItems([...tagItems.value, tag]);
  };

  const onTagRemoved = (tag: TagItem) => {
    setTagItems(tagItems.value.filter(x => x.id !== tag.id));
  };

  const renderSuggestionItem = (tag: ISuggestionItemProps<TagItem>) => {
    return <div className="body-m">{tag.item.text}</div>;
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
