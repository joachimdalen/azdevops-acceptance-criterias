import { getCombined, hasError } from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { Link } from 'azure-devops-ui/Link';
import { MessageBar, MessageBarSeverity } from 'azure-devops-ui/MessageBar';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { move } from '../../common';
import KeyBoardShortcut from '../../components/key-board-shortcut/KeyBoardShortcut';
import { DOCS_URL_KEYBOARD_SHORTCUTS } from '../../documentationUrls';
import { IScenario, IScenarioCriteria } from '../../types';
import { useCriteriaBuilderContext } from '../CriteriaBuilderContext';
import ScenarioCriteriaEditRow from './ScenarioCriteriaEditRow';

interface ScenarioCriteriaSectionProps {
  errors: { [key: string]: string[] } | undefined;
}

const ScenarioCriteriaSection = ({ errors }: ScenarioCriteriaSectionProps): JSX.Element => {
  const { dispatch, state } = useCriteriaBuilderContext();
  const [scenario, setScenario] = useState<string>(state.scenario?.scenario || '');
  const [items, setItems] = useState<IScenarioCriteria[]>(state.scenario?.criterias || []);
  const [focused, setFocused] = useState<string | undefined>(undefined);
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(undefined);
  const buttonRef = useRef<Button>(null);

  const add = (id: IScenarioCriteria, index?: number) => {
    if (index === undefined) setItems(prev => [...prev, id]);
    else {
      setItems(prev => {
        const newArr = [...prev];
        newArr.splice(index + 1, 0, id);
        return newArr;
      });
    }
    setFocused(id.id);
    setCurrentIndex(undefined);
  };

  const remove = (criteriaId: string) => {
    const index = items.findIndex(x => x.id === criteriaId);
    if (index !== -1) {
      setItems(prev => prev.filter(x => x.id !== criteriaId));
      if (items.length > 1) {
        const newIndex = index - 1 < 0 ? index + 1 : index - 1;
        setFocused(items[newIndex].id);
      }
    }
  };

  const updateItem = (criteriaId: string, text: string) => {
    const index = items.findIndex(x => x.id === criteriaId);
    if (index === -1) return;

    const newItems = [...items];
    const item = newItems[index];
    item.text = text || '';
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
          resizable
          rows={4}
          value={scenario}
          onChange={(_, val) => {
            setScenario(val);
          }}
        />
      </FormItem>

      <ButtonGroup className="separator-line-top separator-line-bottom justify-center padding-4 dark-background sticky-toolbar">
        <Button
          ref={buttonRef}
          subtle
          text="Given"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), type: 'given' }, currentIndex)}
        />
        <Button
          subtle
          text="When"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), type: 'when' }, currentIndex)}
        />
        <Button
          subtle
          text="Then"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), type: 'then' }, currentIndex)}
        />
        <Button
          subtle
          text="And"
          iconProps={{ iconName: 'Add' }}
          onClick={() => add({ id: uuidV4(), type: 'and' }, currentIndex)}
        />
      </ButtonGroup>
      <div className="rhythm-vertical-8 padding-bottom-16">
        <ConditionalChildren
          renderChildren={items.length === 0 && !hasError(errors, 'scenario.criterias')}
        >
          <div className="flex-column flex-center">
            <h3 className="secondary-text">Build your criteria</h3>
            <p className="secondary-text flex-row flex-center">
              Press <KeyBoardShortcut keys={['Ctrl', 'Enter']} /> to move to the toolbar when
              typing.
            </p>
            <p className="secondary-text">The new item is added below the focused item</p>
            <p className="secondary-text">
              See the{' '}
              <Link href={DOCS_URL_KEYBOARD_SHORTCUTS} rel="noopener noreferrer" target="_blank">
                documentation
              </Link>{' '}
              for a full list of shortcuts
            </p>
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
          {items.map((item, index) => (
            <ScenarioCriteriaEditRow
              key={item.id}
              focusedItemId={focused}
              itemIndex={index}
              errors={errors}
              isLast={index === items.length - 1}
              removeItem={() => {
                remove(item.id);
              }}
              item={item}
              onChange={(id: string, value: string) => updateItem(id, value)}
              moveItem={dir => {
                const nI = [...items];
                move(nI, index, dir === 'up' ? -1 : 1);
                setItems(nI);
              }}
              addItem={() => {
                setCurrentIndex(index);
                buttonRef?.current?.focus();
              }}
            />
          ))}
        </ConditionalChildren>
      </div>
    </div>
  );
};

export default ScenarioCriteriaSection;
