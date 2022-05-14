import { Button } from 'azure-devops-ui/Button';

import { ProcessEvent } from '../../common/types';

interface CompletedProcessContainerProps {
  criteriaId: string;
  onProcess: (criteriaId: string, action: ProcessEvent) => Promise<void>;
}

const CompletedProcessContainer = ({
  criteriaId,
  onProcess
}: CompletedProcessContainerProps): JSX.Element => {
  return (
    <div className="flex-grow padding-horizontal-16 padding-bottom-8 padding-top-4 font-size-s dark-background">
      <h3>This criteria was completed</h3>
      <p>
        You can chose to <strong>reset the state to new</strong>.
      </p>
      <div className="flex-row flex-center justify-end font-size-m">
        <Button
          text="Reset to new"
          primary
          iconProps={{ iconName: 'Save' }}
          onClick={() => onProcess(criteriaId, ProcessEvent.ResetToNew)}
        />
      </div>
    </div>
  );
};

export default CompletedProcessContainer;
