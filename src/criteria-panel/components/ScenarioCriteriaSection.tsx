import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { MessageBar, MessageBarSeverity } from 'azure-devops-ui/MessageBar';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { capitalizeFirstLetter, move } from '../../common/common';
import { getCombined, hasError } from '../../common/errorUtils';
import { IScenario, IScenarioCriteria } from '../../common/types';
import { useCriteriaPanelContext } from '../CriteriaPanelContext';

interface ScenarioCriteriaSectionProps {
  errors: { [key: string]: string[] } | undefined;
}

const ScenarioCriteriaSection = ({ errors }: ScenarioCriteriaSectionProps): JSX.Element => {
  const { dispatch, state } = useCriteriaPanelContext();
  const [scenario, setScenario] = useState<string>(state.scenario?.scenario || '');
  const [items, setItems] = useState<IScenarioCriteria[]>(state.scenario?.criterias || []);

  const add = (id: IScenarioCriteria) => {
    setItems(prev => [...prev, id]);
  };

  const remove = (crit: IScenarioCriteria) => {
    if (items.findIndex(x => x.id === crit.id) !== -1) {
      setItems(prev => prev.filter(x => x.id !== crit.id));
    }
  };

  const updateItem = (criteria: IScenarioCriteria, text: string) => {
    const index = items.findIndex(x => x.id === criteria.id);
    if (index === -1) return;

    const newItems = [...items];
    const item = newItems[index];
    item.text = text;
    newItems[index] = item;

    setItems(newItems);
  };

  useEffect(() => {
    const item: IScenario = {
      scenario,
      criterias: items
    };
    dispatch({ type: 'SET_CRITERIA', data: item });
  }, [items, scenario]);

  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <FormItem
        label="Scenario"
        error={hasError(errors, 'scenario.scenario')}
        message={getCombined(errors, 'scenario.scenario', 'Scenario')}
      >
        <TextField
          width={TextFieldWidth.auto}
          placeholder="Short description.."
          multiline
          rows={8}
          value={scenario}
          onChange={(_, val) => {
            setScenario(val);
          }}
        />
      </FormItem>

      <ButtonGroup className="separator-line-top separator-line-bottom justify-center padding-4 dark-background sticky-toolbar">
        <Button
          subtle
          text="Given"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), type: 'given' })}
        />
        <Button
          subtle
          text="When"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), type: 'when' })}
        />
        <Button
          subtle
          text="Then"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), type: 'then' })}
        />
        <Button
          subtle
          text="And"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), type: 'and' })}
        />
      </ButtonGroup>
      <div className="rhythm-vertical-8 padding-bottom-16">
        <ConditionalChildren
          renderChildren={items.length === 0 && !hasError(errors, 'scenario.criterias')}
        >
          <div className="flex-column flex-center">
            <h3 className="secondary-text">Build your criteria</h3>
            <p className="secondary-text">Add your Given/When/Then sequence elements</p>
          </div>
        </ConditionalChildren>
        <ConditionalChildren
          renderChildren={items.length === 0 && hasError(errors, 'scenario.criterias')}
        >
          <MessageBar severity={MessageBarSeverity.Error}>
            {getCombined(errors, 'scenario.criterias', 'Criterias')}
          </MessageBar>
        </ConditionalChildren>

        <ConditionalChildren renderChildren={items.length !== 0}>
          {items.map((item, index) => {
            return (
              <FormItem
                key={item.id}
                label={capitalizeFirstLetter(item.type)}
                error={hasError(errors, `scenario.criterias[${index}].text`)}
                message={getCombined(errors, `scenario.criterias[${index}].text`, 'Text')}
              >
                <div className="flex-row flex-center rhythm-horizontal-4">
                  <TextField
                    containerClassName="flex-grow"
                    width={TextFieldWidth.auto}
                    placeholder={`${capitalizeFirstLetter(item.type)}...`}
                    onChange={(_, val) => updateItem(item, val)}
                    value={item.text}
                  />

                  <Button
                    disabled={index === 0}
                    iconProps={{ iconName: 'Up' }}
                    subtle
                    tooltipProps={{ text: 'Move Up' }}
                    onClick={() => {
                      const nI = [...items];
                      move(nI, index, -1);
                      setItems(nI);
                    }}
                  />

                  <Button
                    disabled={index === items.length - 1}
                    iconProps={{ iconName: 'Down' }}
                    subtle
                    tooltipProps={{ text: 'Move Down' }}
                    onClick={() => {
                      const nI = [...items];
                      move(nI, index, 1);
                      setItems(nI);
                    }}
                  />
                  <Button
                    iconProps={{ iconName: 'Delete' }}
                    subtle
                    tooltipProps={{ text: 'Remove' }}
                    onClick={() => remove(item)}
                  />
                </div>
              </FormItem>
            );
          })}
        </ConditionalChildren>
      </div>
    </div>
  );
};

export default ScenarioCriteriaSection;
