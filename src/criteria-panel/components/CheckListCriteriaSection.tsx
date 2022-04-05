import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { Checkbox } from 'azure-devops-ui/Checkbox';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Icon } from 'azure-devops-ui/Icon';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { move } from '../../common/common';
import { ICheckList, ICheckListCriteria } from '../../common/types';
import { useCriteriaPanelContext } from '../CriteriaPanelContext';

const CheckListCriteriaSection = (): JSX.Element => {
  const { dispatch, state } = useCriteriaPanelContext();
  const [items, setItems] = useState<ICheckListCriteria[]>(state.checklist?.criterias || []);
  const add = (id: ICheckListCriteria) => {
    setItems(prev => [...prev, id]);
  };

  const remove = (crit: ICheckListCriteria) => {
    if (items.findIndex(x => x.id === crit.id) !== -1) {
      setItems(prev => prev.filter(x => x.id !== crit.id));
    }
  };

  const updateItem = (criteria: ICheckListCriteria, text: string) => {
    const index = items.findIndex(x => x.id === criteria.id);
    if (index === -1) return;

    const newItems = [...items];
    const item = newItems[index];
    item.text = text || '';
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

  const addItemToolbar = (
    <ButtonGroup className="separator-line-top separator-line-bottom justify-center padding-4 dark-background sticky-toolbar">
      <Button
        subtle
        text="Add item"
        iconProps={{ iconName: 'Add' }}
        onClick={() => add({ id: uuidV4(), text: '', completed: false })}
      />
    </ButtonGroup>
  );

  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      {addItemToolbar}
      <div className="rhythm-vertical-8 padding-bottom-16">
        <ConditionalChildren renderChildren={items.length === 0}>
          <div className="flex-column flex-center">
            <h3 className="secondary-text">Build your criteria</h3>
            <p className="secondary-text">Add your checklist items</p>
          </div>
        </ConditionalChildren>

        <ConditionalChildren renderChildren={items.length !== 0}>
          {items.map((item, index) => {
            return (
              <div key={item.id} className="flex-row flex-center rhythm-horizontal-4">
                <Icon
                  style={{ color: item.completed ? 'green' : 'red' }}
                  iconName={item.completed ? 'Accept' : 'Clear'}
                  className="margin-right-4"
                />
                <TextField
                  containerClassName="flex-grow"
                  width={TextFieldWidth.auto}
                  placeholder={`Some criteria...`}
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
            );
          })}
        </ConditionalChildren>
      </div>
      {items.length >= 3 && addItemToolbar}
    </div>
  );
};

export default CheckListCriteriaSection;
