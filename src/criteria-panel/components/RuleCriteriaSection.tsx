import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { Checkbox } from 'azure-devops-ui/Checkbox';
import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { IRuleCriteria } from '../../common/types';

const RuleCriteriaSection = (): JSX.Element => {
  const [items, setItems] = useState<IRuleCriteria[]>([
    { id: uuidV4(), title: 'One Two', checked: false }
  ]);
  const addOrRemove = (id: IRuleCriteria) => {
    if (items.findIndex(x => x.id === id.id) !== -1) {
      setItems(prev => prev.filter(x => x.id !== id.id));
    } else {
      setItems(prev => [...prev, id]);
    }
  };

  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      {items.map(i => {
        return (
          <div className="flex-row flex-grow rhythm-horizontal-8">
            <Checkbox />
            <TextField value="Some" />
          </div>
        );
      })}
    </div>
  );
};

export default RuleCriteriaSection;
