import { Button } from 'azure-devops-ui/Button';

import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../../common/types';

interface CompletionContainerProps {
  criteria: IAcceptanceCriteria;
  onComplete: (criteriaId: string) => Promise<void>;
}

const CompletionContainer = ({ criteria, onComplete }: CompletionContainerProps): JSX.Element => {
  const getTexts = (): { title: string; description: string; buttonText: string } => {
    if (criteria.state === AcceptanceCriteriaState.New && criteria.requiredApprover !== undefined) {
      return {
        title: 'Ready for approval?',
        description: 'Complete this critiera to mark it read for approval',
        buttonText: 'Send to approval'
      };
    }

    return {
      title: 'Complete criteria?',
      description:
        'Complete this criteria to show the work as completed and that the acceptance criteria is met',
      buttonText: 'Complete'
    };
  };

  const content = getTexts();

  return (
    <div className="flex-grow padding-16 font-size-s dark-background">
      <div className="flex-row">
        <div className="flex-column flex-grow rhythm-vertical-4">
          <h3 className="no-margin">{content.title}</h3>
          <p className="no-margin">{content.description}</p>
        </div>
        <div className="margin-left-16 flex-row flex-center">
          <Button
            text={content.buttonText}
            primary
            iconProps={{ iconName: 'CheckMark' }}
            onClick={() => onComplete(criteria.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default CompletionContainer;
