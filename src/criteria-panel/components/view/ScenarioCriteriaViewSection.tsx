import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListItemDetails, ListItem, ScrollableList } from 'azure-devops-ui/List';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { capitalizeFirstLetter } from '../../../common/common';
import { IAcceptanceCriteria, IScenario, IScenarioCriteria } from '../../../common/types';
import { useCriteriaPanelContext } from '../../CriteriaPanelContext';

interface ScenarioCriteriaViewSectionProps {
  criteria: IAcceptanceCriteria;
}

const ScenarioCriteriaViewSection = ({
  criteria
}: ScenarioCriteriaViewSectionProps): JSX.Element => {
  const { dispatch } = useCriteriaPanelContext();

  const provider = useMemo(() => {
    if (criteria.scenario?.criterias) {
      return new ArrayItemProvider(criteria.scenario.criterias);
    }
    return new ArrayItemProvider([]);
  }, [criteria]);

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
        <p>{criteria.scenario?.scenario}</p>
      </div>
      <ScrollableList  itemProvider={provider} renderRow={renderRow} width="100%" />
    </div>
  );
};

export default ScenarioCriteriaViewSection;
