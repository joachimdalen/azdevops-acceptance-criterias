import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { IRuleCriteria } from '../../common/types';
import { useCriteriaPanelContext } from '../CriteriaPanelContext';

const RuleCriteriaSection = (): JSX.Element => {
  const { state: panelState, dispatch } = useCriteriaPanelContext();
  const [text, setText] = useState<string | undefined>();

  const setItemValue = (value: string | undefined) => {
    setText(value);

    if (value === undefined || value === '') {
      if (panelState.rule !== undefined) {
        dispatch({ type: 'SET_VALID', data: false });
      }
    } else {
      const item: IRuleCriteria = {
        id: uuidV4(),
        text: value
      };
      dispatch({ type: 'SET_CRITERIA', data: item });
      dispatch({ type: 'SET_VALID', data: true });
    }
  };
  return (
    <div className="rhythm-vertical-16 margin-top-8 flex-grow">
      <FormItem label="Title">
        <TextField
          width={TextFieldWidth.auto}
          placeholder="Rule..."
          multiline
          value={text}
          rows={5}
          onChange={(_, val) => {
            setItemValue(val);
          }}
        />
      </FormItem>
    </div>
  );
};

export default RuleCriteriaSection;
