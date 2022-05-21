import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { MessageBar, MessageBarSeverity } from 'azure-devops-ui/MessageBar';
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { move } from '../../../common/common';
import { getCombined, hasError } from '../../../common/errorUtils';
import { ICheckList, ICheckListCriteria } from '../../../common/types';
import { useCriteriaPanelContext } from '../../CriteriaPanelContext';
import CheckListEditRow from './CheckListEditRow';

interface CheckListCriteriaSectionProps {
  errors: { [key: string]: string[] } | undefined;
}

const CheckListCriteriaSection = ({ errors }: CheckListCriteriaSectionProps): JSX.Element => {
  const { dispatch, state } = useCriteriaPanelContext();
  const [items, setItems] = useState<ICheckListCriteria[]>(state.checklist?.criterias || []);
  const [focused, setFocused] = useState<string | undefined>(undefined);
  const add = (id: ICheckListCriteria, index?: number) => {
    if (index === undefined) setItems(prev => [...prev, id]);
    else {
      setItems(prev => {
        const newArr = [...prev];
        newArr.splice(index, 0, id);
        return newArr;
      });
    }
    setFocused(id.id);
  };

  const remove = (crit: ICheckListCriteria) => {
    if (items.findIndex(x => x.id === crit.id) !== -1) {
      setItems(prev => prev.filter(x => x.id !== crit.id));
    }
  };

  const updateItem = (id: string, text: string) => {
    const index = items.findIndex(x => x.id === id);
    if (index === -1) return;

    const newItems = [...items];
    const item = newItems[index];
    item.text = text || '';
    newItems[index] = item;

    setItems(newItems);
  };

  useEffect(() => {
    const item: ICheckList = {
      criterias: items
    };
    dispatch({ type: 'SET_CRITERIA', data: item });
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
        <ConditionalChildren
          renderChildren={items.length === 0 && !hasError(errors, 'checklist.criterias')}
        >
          <div className="flex-column flex-center">
            <h3 className="secondary-text">Build your criteria</h3>
            <p className="secondary-text">Add your checklist items</p>
            <p className="secondary-text">
              Press <code>Ctrl + Enter</code> to add a new item below when typing
            </p>
          </div>
        </ConditionalChildren>
        <ConditionalChildren
          renderChildren={hasError(errors, 'checklist.criterias')}
        >
          <MessageBar severity={MessageBarSeverity.Error}>
            {getCombined(errors, 'checklist.criterias', 'Checklist')}
          </MessageBar>
        </ConditionalChildren>

        <ConditionalChildren renderChildren={items.length !== 0}>
          {items.map((item, index) => (
            <CheckListEditRow
              key={item.id}
              focusedItemId={focused}
              itemIndex={index}
              errors={errors}
              isLast={index === items.length - 1}
              removeItem={() => {
                remove(item);
              }}
              item={item}
              onChange={(id: string, value: string) => updateItem(id, value)}
              moveItem={dir => {
                const nI = [...items];
                move(nI, index, dir === 'up' ? -1 : 1);
                setItems(nI);
              }}
              addItem={() => {
                add({ id: uuidV4(), text: '', completed: false }, index + 1);
              }}
            />
          ))}
        </ConditionalChildren>
      </div>
      {items.length >= 3 && addItemToolbar}
    </div>
  );
};

export default CheckListCriteriaSection;
