import { render, screen, waitFor } from '@testing-library/react';

import TextCriteriaViewSection from '../../../../criteria-panel/components/view/TextCriteriaViewSection';

describe('TextCriteriaViewSection', () => {
  it('should show text', async () => {
    render(
      <TextCriteriaViewSection
        details={{
          id: '1',
          text: {
            id: '12',
            description: 'This is the text description'
          }
        }}
      />
    );

    await waitFor(() => screen.findAllByText(/This is the text description/));
  });
});
