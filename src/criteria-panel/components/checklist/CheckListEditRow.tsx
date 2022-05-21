import { Button } from 'azure-devops-ui/Button';
import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useRef } from 'react';

import { getCombined, hasError } from '../../../common/errorUtils';
import { ICheckListCriteria } from '../../../common/types';

interface CheckListEditRowProps {
  itemIndex: number;
  isLast: boolean;
  item: ICheckListCriteria;
  errors: { [key: string]: string[] } | undefined;
  moveItem: (direction: 'up' | 'down') => void;
  onChange: (id: string, value: string) => void;
  addItem: () => void;
  removeItem: () => void;
  focusedItemId?: string;
}

const CheckListEditRow = ({
  itemIndex,
  item,
  isLast,
  errors,
  moveItem,
  onChange,
  addItem,
  removeItem,
  focusedItemId
}: CheckListEditRowProps): JSX.Element => {
  const inputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => {
    console.log([
      focusedItemId !== undefined,
      focusedItemId === item.id,
      inputRef?.current !== null
    ]);
    if (focusedItemId !== undefined && focusedItemId === item.id && inputRef?.current !== null) {
      console.log('focusing ' + item.id);
      inputRef.current.focus();
    }
  }, [focusedItemId]);

  return (
    <FormItem
      key={item.id}
      error={hasError(errors, 'checklist.scenario')}
      message={getCombined(errors, 'checklist.scenario', 'Scenario')}
    >
      <div className="flex-row flex-center rhythm-horizontal-4">
        <TextField
          containerClassName="flex-grow"
          width={TextFieldWidth.auto}
          placeholder={`Some criteria... (Tip: Press 'Ctrl + Enter' to add a new row)`}
          onChange={(_, val) => onChange(item.id, val)}
          value={item.text}
          onKeyDown={event => {
            console.log(event.key);
            if (event.ctrlKey && event.key === 'Enter') {
              addItem();
            }
          }}
          inputElement={inputRef}
        />
        <Button
          id={`${item.id}-up`}
          disabled={itemIndex === 0}
          iconProps={{ iconName: 'Up' }}
          subtle
          tooltipProps={{ text: 'Move Up' }}
          onClick={() => moveItem('up')}
        />

        <Button
          id={`${item.id}-down`}
          disabled={isLast}
          iconProps={{ iconName: 'Down' }}
          subtle
          tooltipProps={{ text: 'Move Down' }}
          onClick={() => moveItem('down')}
        />
        <Button
          id={`${item.id}-remove`}
          iconProps={{ iconName: 'Delete' }}
          subtle
          tooltipProps={{ text: 'Remove' }}
          onClick={() => removeItem()}
        />
      </div>
    </FormItem>
  );
};

export default CheckListEditRow;
