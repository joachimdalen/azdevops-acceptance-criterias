import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CompletedProcessContainer from '../../../criteria-panel/components/CompletedProcessContainer';

describe('CompletedProcessContainer', () => {
  it('should show correct texts for approve', async () => {
    const process = jest.fn();

    render(<CompletedProcessContainer criteriaId="1" onProcess={process} />);

    const reset = screen.getByRole('button');

    await waitFor(() => screen.findAllByText(/This criteria was completed/));
    expect(reset).toHaveTextContent('Reset to new');
  });
  it('should pass correct information on reset', async () => {
    const process = jest.fn();

    render(<CompletedProcessContainer criteriaId="1" onProcess={process} />);

    const reset = screen.getByRole('button');
    fireEvent.click(reset);

    expect(process).toHaveBeenCalledWith('1', 'new');
  });
});
