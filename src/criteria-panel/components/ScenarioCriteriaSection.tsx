import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { capitalizeFirstLetter, move } from '../../common/common';
import { IScenario, IScenarioCriteria } from '../../common/types';
import { useCriteriaPanelContext } from '../CriteriaPanelContext';

const ScenarioCriteriaSection = (): JSX.Element => {
  const { dispatch } = useCriteriaPanelContext();
  const [scenario, setScenario] = useState('');
  const [items, setItems] = useState<IScenarioCriteria[]>([]);
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
    checkSet();
  };

  const checkSet = () => {
    let shouldUpdate = true;
    if (scenario === '') {
      shouldUpdate = false;
    } else if (items.length === 0) {
      shouldUpdate = false;
    } else if (items.every(x => x.text === undefined || x.text === '')) {
      shouldUpdate = false;
    }

    if (!shouldUpdate) {
      dispatch({ type: 'SET_VALID', data: false });
    } else {
      const item: IScenario = {
        scenario,
        criterias: items
      };
      dispatch({ type: 'SET_CRITERIA', data: item });
      dispatch({ type: 'SET_VALID', data: true });
    }
  };

  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <FormItem label="Scenario">
        <TextField
          width={TextFieldWidth.auto}
          placeholder="Short description.."
          multiline
          rows={5}
          value={scenario}
          onChange={(_, val) => {
            setScenario(val);
            checkSet();
          }}
        />
      </FormItem>
      <ButtonGroup className="separator-line-top separator-line-bottom justify-center padding-4">
        <Button
          subtle
          text="Given"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), type: 'given' })}
        />
        <Button
          subtle
          text="And"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), type: 'and' })}
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
      </ButtonGroup>
      <div className="rhythm-vertical-8 v-scroll-auto">
        {items.map((item, index) => {
          return (
            <FormItem key={item.id} label={capitalizeFirstLetter(item.type)}>
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
                  className="color-error"
                  iconProps={{ iconName: 'Delete' }}
                  subtle
                  tooltipProps={{ text: 'Remove' }}
                  onClick={() => remove(item)}
                />
              </div>
            </FormItem>
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioCriteriaSection;
