import { IListItemDetails, ListItem, ScrollableList } from 'azure-devops-ui/List';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useMemo } from 'react';

import { capitalizeFirstLetter } from '../../../common/common';
import { CriteriaDetailDocument, IScenarioCriteria } from '../../../common/types';
import { useCriteriaPanelContext } from '../../CriteriaPanelContext';

interface ScenarioCriteriaViewSectionProps {
  details: CriteriaDetailDocument;
}

const ScenarioCriteriaViewSection = ({
  details
}: ScenarioCriteriaViewSectionProps): JSX.Element => {
  const { dispatch } = useCriteriaPanelContext();

  const provider = useMemo(() => {
    if (details.scenario?.criterias) {
      return new ArrayItemProvider(details.scenario.criterias);
    }
    return new ArrayItemProvider([]);
  }, [details]);

  const renderRow = (
    index: number,
    item: IScenarioCriteria,
    details: IListItemDetails<IScenarioCriteria>,
    key?: string
  ): JSX.Element => {
    return (
      <ListItem key={key || 'list-item' + index} index={index} details={details}>
        <div className="flex-column h-scroll-hidden padding-vertical-4">
          <span className="font-weight-semibold font-size text-ellipsis secondary-text">
            {capitalizeFirstLetter(item.type)}
          </span>
          <span className="text-ellipsis margin-top-4">{item.text}</span>
        </div>
      </ListItem>
    );
  };

  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <div>
        <span className="font-weight-semibold font-size">Scenario</span>
        <p>{details.scenario?.scenario}</p>
      </div>
      <ScrollableList  itemProvider={provider} renderRow={renderRow} width="100%" />
    </div>
  );
};

export default ScenarioCriteriaViewSection;
