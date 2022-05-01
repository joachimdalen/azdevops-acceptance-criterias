import { render, screen } from '@testing-library/react';

import StatusTag from '../../../common/components/StatusTag';
import { AcceptanceCriteriaState } from '../../../common/types';

describe('StatusTag', () => {
  it('should show correct status', async () => {
    render(<StatusTag state={AcceptanceCriteriaState.Approved} />);

    await screen.findAllByText(/Approved/);
  });
  it('should format states correctly', async () => {
    render(<StatusTag state={AcceptanceCriteriaState.AwaitingApproval} />);

    await screen.findAllByText(/Awaiting Approval/);
  });
});
