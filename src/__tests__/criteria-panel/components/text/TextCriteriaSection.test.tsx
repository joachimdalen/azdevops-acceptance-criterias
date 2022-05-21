import { render, screen } from '@testing-library/react';

import TextCriteriaSection from '../../../../criteria-panel/components/text/TextCriteriaSection';
import { CriteriaPanelProvider } from '../../../../criteria-panel/CriteriaPanelContext';



describe('TextCriteriaSection', () => {
  it('should be empty initially', async () => {
    render(
      <CriteriaPanelProvider>
        <TextCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveTextContent('');
  });

  it('should render items when passed', async () => {
    render(
      <CriteriaPanelProvider
        defaultState={{
          isLoading: false,
          type: 'text',
          text: {
            id: 'hello',
            description: 'Hello there'
          }
        }}
      >
        <TextCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveTextContent('Hello there');
  });
});
