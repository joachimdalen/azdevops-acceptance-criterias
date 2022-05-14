import { Button } from 'azure-devops-ui/Button';
import {
  RadioButton,
  RadioButtonGroup,
  RadioButtonGroupDirection
} from 'azure-devops-ui/RadioButton';
import { useState } from 'react';

import { ProcessEvent } from '../../common/types';
interface ProcessingContainerProps {
  criteriaId: string;
  processCriteria: (id: string, action: ProcessEvent) => Promise<void>;
}

const ProcessingContainer = ({
  criteriaId,
  processCriteria
}: ProcessingContainerProps): JSX.Element => {
  const [selected, setSelected] = useState<string>('dummy');
  return (
    <div className="flex-grow padding-horizontal-16 padding-bottom-8 padding-top-4 font-size-s dark-background">
      <h3>This criteria needs your attention</h3>
      <p>
        This acceptance require you to process it. You can chose to <strong>Approve</strong> or{' '}
        <strong>Reject</strong> it.
      </p>
      <div className="flex-row flex-center justify-end font-size-m">
        <RadioButtonGroup
          onSelect={selectedId => setSelected(selectedId)}
          selectedButtonId={selected}
          direction={RadioButtonGroupDirection.Horizontal}
          className="margin-right-16"
        >
          <RadioButton id="approve" text="Approve" key="approve" />
          <RadioButton id="reject" text="Reject" key="reject" />
        </RadioButtonGroup>
        <Button
          disabled={selected === 'dummy'}
          text="Save"
          primary
          iconProps={{ iconName: 'Save' }}
          onClick={async () => {
            await processCriteria(
              criteriaId,
              selected === 'approve' ? ProcessEvent.Approve : ProcessEvent.Reject
            );
          }}
        />
      </div>
    </div>
  );
};

export default ProcessingContainer;
