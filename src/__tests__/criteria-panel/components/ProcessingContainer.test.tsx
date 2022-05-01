import { fireEvent, render, screen } from '@testing-library/react';

import ProcessingContainer from '../../../criteria-panel/components/ProcessingContainer';

describe('ProcessingContainer', () => {
  it('should approve when selected', async () => {
    const process = jest.fn();
    render(<ProcessingContainer criteriaId="1234" processCriteria={process} />);

    const approve = screen.getByRole('radio', { name: 'Approve' });

    const save = screen.getByRole('button');

    fireEvent.click(approve);
    fireEvent.click(save);

    expect(process).toHaveBeenCalledWith('1234', true);
  });
  it('should reject when selected', async () => {
    const process = jest.fn();
    render(<ProcessingContainer criteriaId="1234" processCriteria={process} />);

    const reject = screen.getByRole('radio', { name: 'Reject' });

    const save = screen.getByRole('button');

    fireEvent.click(reject);
    fireEvent.click(save);

    expect(process).toHaveBeenCalledWith('1234', false);
  });
});
