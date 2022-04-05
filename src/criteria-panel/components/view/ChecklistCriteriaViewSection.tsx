import { Checkbox } from 'azure-devops-ui/Checkbox';
import { ClipboardButton } from 'azure-devops-ui/Clipboard';
import { IListItemDetails, ListItem, ScrollableList } from 'azure-devops-ui/List';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useMemo } from 'react';

import { CriteriaDetailDocument, ICheckListCriteria } from '../../../common/types';
import { useCriteriaPanelContext } from '../../CriteriaPanelContext';

interface ChecklistCriteriaViewSectionProps {
  details: CriteriaDetailDocument;
  processItem: (id: string, complete: boolean) => Promise<any>;
}

const ChecklistCriteriaViewSection = ({
  details,
  processItem
}: ChecklistCriteriaViewSectionProps): JSX.Element => {
  const { dispatch } = useCriteriaPanelContext();

  const provider = useMemo(() => {
    if (details.checklist?.criterias) {
      return new ArrayItemProvider(details.checklist.criterias);
    }
    return new ArrayItemProvider([]);
  }, [details]);

  const renderRow = (
    index: number,
    item: ICheckListCriteria,
    details: IListItemDetails<ICheckListCriteria>,
    key?: string
  ): JSX.Element => {
    return (
      <ListItem key={key || 'list-item' + index} index={index} details={details}>
        <div className="h-scroll-hidden padding-vertical-4 flex-row flex-grow">
          <Checkbox
            className="flex-grow"
            checked={item.completed}
            label={item.text}
            onChange={(v, c) => processItem(item.id, c)}
          />
          <ClipboardButton getContent={() => item.text} />
        </div>
      </ListItem>
    );
  };

  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8 checklist">
      <span className="font-weight-semibold font-size">Items</span>
      <ScrollableList itemProvider={provider} renderRow={renderRow} width="100%" />
    </div>
  );
};

export default ChecklistCriteriaViewSection;
