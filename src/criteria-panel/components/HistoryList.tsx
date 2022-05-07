import { Ago } from 'azure-devops-ui/Ago';
import { Icon, IconSize } from 'azure-devops-ui/Icon';
import { IListItemDetails, ListItem, ScrollableList } from 'azure-devops-ui/List';
import { AgoFormat } from 'azure-devops-ui/Utilities/Date';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import React, { useMemo } from 'react';

import ApproverDisplay from '../../common/components/ApproverDisplay';
import {
  HistoryDocument,
  HistoryEvent,
  historyEventProperties,
  HistoryItem
} from '../../common/types';

interface HistoryListProps {
  events: HistoryDocument;
}
const HistoryList = ({ events }: HistoryListProps): React.ReactElement => {
  const s = useMemo(() => new ArrayItemProvider(events.items), [events]);

  const renderRow = (
    index: number,
    item: HistoryItem,
    details: IListItemDetails<HistoryItem>,

    key?: string
  ): JSX.Element => {
    const prop = historyEventProperties.get(item.event);
    return (
      <ListItem
        key={key || 'list-item' + index}
        index={index}
        details={details}
        className="historylist"
      >
        <div className="flex-grow flex-row separator-line-bottom">
          <Icon iconName={prop?.icon} size={IconSize.medium} className={prop?.iconColor} />
          <div className="flex-column justify-center flex-grow margin-left-8">
            <div>
              <span className="text-ellipsis">{prop?.title}</span>
              <span className="margin-left-8 ">&#183;</span>
              <span className="margin-left-8 font-size-ms text-ellipsis secondary-text">
                <Ago date={item.date} format={AgoFormat.Compact} />
              </span>
            </div>
            <span className="fontSizeMS font-size-ms secondary-text">
              {item?.properties?.comment}
            </span>
          </div>
          {item.actor && (
            <div className="justify-center margin-vertical-8">
              <ApproverDisplay approver={item.actor} />
            </div>
          )}
        </div>
      </ListItem>
    );
  };

  return <ScrollableList itemProvider={s} renderRow={renderRow} width="100%" />;
};

export default HistoryList;
