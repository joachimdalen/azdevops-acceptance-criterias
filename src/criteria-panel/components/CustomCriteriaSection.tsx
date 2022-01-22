import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useState } from 'react';

type NullableString = string | undefined;
const CustomCriteriaSection = (): JSX.Element => {
  const [description, setDescription] = useState<NullableString>('');

  return (
    <div className="rhythm-vertical-16 flex-grow">
      <FormItem label="Description">
        <TextField
          width={TextFieldWidth.auto}
          placeholder="Short description.."
          multiline
          value={description}
          rows={5}
          onChange={(_, val) => setDescription(val)}
        />
      </FormItem>
    </div>
  );
};

export default CustomCriteriaSection;
