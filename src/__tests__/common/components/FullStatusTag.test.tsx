import { render, screen } from '@testing-library/react';

import FullStatusTag from '../../../common/components/FullStatusTag';
import { FullCriteriaStatus } from '../../../common/types';

describe('FullStatusTag', () => {
  it('should show status', async () => {
    render(<FullStatusTag state={FullCriteriaStatus.Approved} />);

    await screen.findAllByText(/approved/);
  });
});
