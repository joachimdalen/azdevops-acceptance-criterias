import { render, screen, waitFor } from '@testing-library/react';

import ProgressBar from '../../../common/components/ProgressBar';

describe('ProgressBar', () => {
  it('should show correct counter', async () => {
    render(<ProgressBar currentValue={10} maxValue={100} labelType="count" />);

    await waitFor(() => screen.findAllByText(/\(10\/100\)/));
  });
  it('should show correct percentage counter', async () => {
    render(<ProgressBar currentValue={10} maxValue={100} labelType="percentage" />);

    await waitFor(() => screen.findAllByText(/10%/));
  });
});
