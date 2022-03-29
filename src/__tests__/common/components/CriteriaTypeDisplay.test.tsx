import { render, screen } from '@testing-library/react';

import CriteriaTypeDisplay from '../../../common/components/CriteriaTypeDisplay';

describe('CriteriaTypeDisplay', () => {
  it('should show custom criteria', async () => {
    render(<CriteriaTypeDisplay type="custom" />);

    await screen.findAllByText(/Custom/);
  });
  it('should show scenario criteria', async () => {
    render(<CriteriaTypeDisplay type="scenario" />);

    await screen.findAllByText(/Scenario/);
  });
});
