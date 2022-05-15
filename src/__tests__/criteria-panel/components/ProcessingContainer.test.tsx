import { fireEvent, render, screen } from '@testing-library/react';

import { ProcessEvent } from '../../../common/types';
import ProcessingContainer from '../../../criteria-panel/components/ProcessingContainer';

describe('ProcessingContainer', () => {
  it('should approve when selected', async () => {
    const process = jest.fn();
    render(<ProcessingContainer criteriaId="1234" processCriteria={process} />);

    const approve = screen.getByRole('radio', { name: 'Approve' });

    const save = screen.getByRole('button');

    fireEvent.click(approve);
    fireEvent.click(save);

    expect(process).toHaveBeenCalledWith('1234', ProcessEvent.Approve, undefined);
  });

  it('should approve with comment when entered', async () => {
    const process = jest.fn();
    render(<ProcessingContainer criteriaId="1234" processCriteria={process} />);

    const approve = screen.getByRole('radio', { name: 'Approve' });

    const comment = screen.getByPlaceholderText(
      'A short reason for rejecting or approving the criteria'
    );
    fireEvent.change(comment, { target: { value: 'I approve this' } });

    const save = screen.getByRole('button');

    fireEvent.click(approve);
    fireEvent.click(save);

    expect(process).toHaveBeenCalledWith('1234', ProcessEvent.Approve, 'I approve this');
  });

  it('should reject when selected', async () => {
    const process = jest.fn();
    render(<ProcessingContainer criteriaId="1234" processCriteria={process} />);

    const reject = screen.getByRole('radio', { name: 'Reject' });

    const save = screen.getByRole('button');

    fireEvent.click(reject);
    fireEvent.click(save);

    expect(process).toHaveBeenCalledWith('1234', ProcessEvent.Reject, undefined);
  });

  it('should reject with comment when entered', async () => {
    const process = jest.fn();
    render(<ProcessingContainer criteriaId="1234" processCriteria={process} />);

    const reject = screen.getByRole('radio', { name: 'Reject' });

    const comment = screen.getByPlaceholderText(
      'A short reason for rejecting or approving the criteria'
    );
    fireEvent.change(comment, { target: { value: 'I reject this' } });

    const save = screen.getByRole('button');

    fireEvent.click(reject);
    fireEvent.click(save);

    expect(process).toHaveBeenCalledWith('1234', ProcessEvent.Reject, 'I reject this');
  });
});
