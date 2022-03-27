import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';

interface ProcessingContainerProps {
  criteriaId: string;
  processCriteria: (id: string, approve: boolean) => Promise<void>;
}

const ProcessingContainer = ({
  criteriaId,
  processCriteria
}: ProcessingContainerProps): JSX.Element => {
  return (
    <div className="flex-grow padding-left-16 padding-bottom-8 padding-top-4 font-size-s dark-background">
      <h3>This criteria needs your attention</h3>
      <p>
        This acceptance require you to process it. You can chose to <strong>Approve</strong> or{' '}
        <strong>Reject</strong> it.
      </p>
      <ButtonGroup className="flex-end">
        <Button
          text="Approve"
          primary
          iconProps={{ iconName: 'CheckMark' }}
          onClick={async () => {
            await processCriteria(criteriaId, true);
          }}
        />
        <Button
          text="Reject"
          danger
          iconProps={{ iconName: 'Cancel' }}
          onClick={async () => {
            await processCriteria(criteriaId, false);
          }}
        />
      </ButtonGroup>
    </div>
  );
};

export default ProcessingContainer;
