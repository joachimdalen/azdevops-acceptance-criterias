import { fireEvent, render, screen } from '@testing-library/react';

import { ProcessEvent } from '../../../common/types';
import RejectionProcessContainer from '../../../criteria-panel/components/RejectionProcessContainer';

describe('RejectionProcessContainer', () => {
  it('should reset to new when selected', async () => {
    const process = jest.fn();
    render(<RejectionProcessContainer criteriaId="1234" onProcess={process} />);

    const setNew = screen.getByRole('radio', { name: 'Reset to new' });

    const save = screen.getByRole('button');

    fireEvent.click(setNew);
    fireEvent.click(save);

    expect(process).toHaveBeenCalledWith('1234', ProcessEvent.ResetToNew);
  });
  it('should resubmit for approval when selected', async () => {
    const process = jest.fn();
    render(<RejectionProcessContainer criteriaId="1234" onProcess={process} />);

    const resubmit = screen.getByRole('radio', { name: 'Resubmit for approval' });

    const save = screen.getByRole('button');

    fireEvent.click(resubmit);
    fireEvent.click(save);

    expect(process).toHaveBeenCalledWith('1234', ProcessEvent.ResubmitForApproval);
  });
});
