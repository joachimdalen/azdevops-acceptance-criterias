import { render, screen, waitFor } from '@testing-library/react';

import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../../../common/types';
import CompletionContainer from '../../../criteria-panel/components/CompletionContainer';

describe('CompletionContainer', () => {
  it('should show correct texts for approve', async () => {
    const process = jest.fn();

    const criteria: IAcceptanceCriteria = {
      id: '1',
      state: AcceptanceCriteriaState.New,
      title: 'Title',
      type: 'checklist',
      requiredApprover: {
        displayName: 'Approver',
        entityId: '',
        entityType: 'Group',
        id: '1'
      }
    };

    render(<CompletionContainer criteria={criteria} onComplete={process} />);

    const save = screen.getByRole('button');

    await waitFor(() => screen.findAllByText(/Ready for approval\?/));
    expect(save).toHaveTextContent('Send to approval');
  });
  it('should show correct texts for complete', async () => {
    const process = jest.fn();

    const criteria: IAcceptanceCriteria = {
      id: '1',
      state: AcceptanceCriteriaState.New,
      title: 'Title',
      type: 'checklist'
    };

    render(<CompletionContainer criteria={criteria} onComplete={process} />);

    const save = screen.getByRole('button');

    await waitFor(() => screen.findAllByText(/Complete criteria\?/));
    expect(save).toHaveTextContent('Complete');
  });
});
