import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { getCombined, hasError } from '../../../common/errorUtils';
import { ITextCriteria } from '../../../common/types';
import { useCriteriaPanelContext } from '../../CriteriaPanelContext';

interface TextCriteriaSectionProps {
  errors: { [key: string]: string[] } | undefined;
}
const TextCriteriaSection = ({ errors }: TextCriteriaSectionProps): JSX.Element => {
  const { state: panelState, dispatch } = useCriteriaPanelContext();
  const [description, setDescription] = useState<string | undefined>(panelState.text?.description);

  useEffect(() => {
    const item: ITextCriteria = {
      id: panelState?.text?.id || uuidV4(),
      description: description
    };
    dispatch({ type: 'SET_CRITERIA', data: item });
  }, [description]);

  return (
    <div className="rhythm-vertical-16 margin-top-8 flex-grow">
      <FormItem
        label="Description"
        error={hasError(errors, 'text.description')}
        message={getCombined(errors, 'text.description', 'Description')}
      >
        <TextField
          width={TextFieldWidth.auto}
          placeholder="Short description.."
          multiline
          value={description}
          rows={5}
          onChange={(_, val) => {
            setDescription(val);
          }}
        />
      </FormItem>
    </div>
  );
};

export default TextCriteriaSection;
