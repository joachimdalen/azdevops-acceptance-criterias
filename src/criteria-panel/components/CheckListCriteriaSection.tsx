import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { Checkbox } from 'azure-devops-ui/Checkbox';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { capitalizeFirstLetter, move } from '../../common/common';
import { ICheckList, ICheckListCriteria, IScenario, IScenarioCriteria } from '../../common/types';
import { useCriteriaPanelContext } from '../CriteriaPanelContext';

const CheckListCriteriaSection = (): JSX.Element => {
  const { dispatch, state } = useCriteriaPanelContext();
  const [items, setItems] = useState<ICheckListCriteria[]>(state.checklist?.criterias || []);
  const [selectedTabId, setSelectedTabId] = useState<string>('details');
  const add = (id: ICheckListCriteria) => {
    setItems(prev => [...prev, id]);
  };

  const remove = (crit: ICheckListCriteria) => {
    if (items.findIndex(x => x.id === crit.id) !== -1) {
      setItems(prev => prev.filter(x => x.id !== crit.id));
    }
  };

  const updateItem = (
    criteria: ICheckListCriteria,
    updateType: 'check' | 'text',
    text?: string,
    val?: boolean
  ) => {
    const index = items.findIndex(x => x.id === criteria.id);
    if (index === -1) return;

    const newItems = [...items];
    const item = newItems[index];
    if (updateType === 'check' && val !== undefined) {
      item.completed = val;
    } else {
      item.text = text;
    }
    newItems[index] = item;

    setItems(newItems);
  };

  useEffect(() => {
    let shouldUpdate = true;
    if (items.length === 0) {
      shouldUpdate = false;
    } else if (items.every(x => x.text === undefined || x.text === '')) {
      shouldUpdate = false;
    }

    if (!shouldUpdate) {
      dispatch({ type: 'SET_VALID', data: false });
    } else {
      const item: ICheckList = {
        criterias: items
      };
      dispatch({ type: 'SET_CRITERIA', data: item });
      dispatch({ type: 'SET_VALID', data: true });
    }
  }, [items]);

  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <ButtonGroup className="separator-line-top separator-line-bottom justify-center padding-4 dark-background sticky-toolbar">
        <Button
          subtle
          text="Add item"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), text: '', completed: false })}
        />
      </ButtonGroup>
      <div className="rhythm-vertical-8 padding-bottom-16">
        {items.map((item, index) => {
          return (
            <div key={item.id} className="flex-row flex-center rhythm-horizontal-4">
              <Checkbox
                checked={item.completed}
                onChange={(e, c) => updateItem(item, 'check', undefined, c)}
              />
              <TextField
                containerClassName="flex-grow"
                width={TextFieldWidth.auto}
                placeholder={`Some criteria...`}
                onChange={(_, val) => updateItem(item, 'text', val)}
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
          );
        })}
      </div>
    </div>
  );
};

export default CheckListCriteriaSection;
