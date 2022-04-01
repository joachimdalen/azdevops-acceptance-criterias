import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { ITextCriteria } from '../../common/types';
import { useCriteriaPanelContext } from '../CriteriaPanelContext';

const TextCriteriaSection = (): JSX.Element => {
  const { state: panelState, dispatch } = useCriteriaPanelContext();
  const [text, setText] = useState<string | undefined>(panelState.text?.text);

  useEffect(() => {
    if (text === undefined || text === '') {
      dispatch({ type: 'SET_VALID', data: false });
      dispatch({ type: 'SET_CRITERIA', data: undefined });
    } else {
      const item: ITextCriteria = {
        id: panelState?.text?.id || uuidV4(),
        text: text
      };
      dispatch({ type: 'SET_CRITERIA', data: item });
      dispatch({ type: 'SET_VALID', data: true });
    }
  }, [text]);

  return (
    <div className="rhythm-vertical-16 margin-top-8 flex-grow">
      <FormItem label="Description">
        <TextField
          width={TextFieldWidth.auto}
          placeholder="Short description.."
          multiline
          value={text}
          rows={5}
          onChange={(_, val) => {
            setText(val);
          }}
        />
      </FormItem>
    </div>
  );
};

export default TextCriteriaSection;
