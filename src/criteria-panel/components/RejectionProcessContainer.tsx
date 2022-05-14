import { Button } from 'azure-devops-ui/Button';
import {
  RadioButton,
  RadioButtonGroup,
  RadioButtonGroupDirection
} from 'azure-devops-ui/RadioButton';
import { useState } from 'react';

import { ProcessEvent } from '../../common/types';

interface RejectionProcessContainerProps {
  criteriaId: string;
  onProcess: (criteriaId: string, action: ProcessEvent) => Promise<void>;
}

const RejectionProcessContainer = ({
  criteriaId,
  onProcess
}: RejectionProcessContainerProps): JSX.Element => {
  const [selected, setSelected] = useState<string>('dummy');
  return (
    <div className="flex-grow padding-horizontal-16 padding-bottom-8 padding-top-4 font-size-s dark-background">
      <h3>This criteria was rejected</h3>
      <p>
        This criteria was rejected by the approver. You can chose to{' '}
        <strong>reset the state to new</strong> or <strong>resubmit it for approval</strong>.
      </p>
      <div className="flex-row flex-center justify-end font-size-m">
        <RadioButtonGroup
          onSelect={selectedId => setSelected(selectedId)}
          selectedButtonId={selected}
          direction={RadioButtonGroupDirection.Horizontal}
          className="margin-right-16"
        >
          <RadioButton id="new" text="Reset to new" key="new" />
          <RadioButton id="resubmit" text="Resubmit for approval" key="resubmit" />
        </RadioButtonGroup>
        <Button
          text="Save"
          primary
          disabled={selected === 'dummy'}
          iconProps={{ iconName: 'Save' }}
          onClick={() =>
            onProcess(
              criteriaId,
              selected === 'new' ? ProcessEvent.ResetToNew : ProcessEvent.ResubmitForApproval
            )
          }
        />
      </div>
    </div>
  );
};

export default RejectionProcessContainer;
