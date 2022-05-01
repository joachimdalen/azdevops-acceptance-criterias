import { render, screen } from '@testing-library/react';

import CriteriaTypeDisplay from '../../../common/components/CriteriaTypeDisplay';

describe('CriteriaTypeDisplay', () => {
  it('should show text criteria', async () => {
    render(<CriteriaTypeDisplay type="text" />);

    await screen.findAllByText(/Text/);
  });
  it('should show scenario criteria', async () => {
    render(<CriteriaTypeDisplay type="scenario" />);

    await screen.findAllByText(/Scenario/);
  });
  it('should show checklist criteria', async () => {
    render(<CriteriaTypeDisplay type="checklist" />);

    await screen.findAllByText(/Checklist/);
  });
});
