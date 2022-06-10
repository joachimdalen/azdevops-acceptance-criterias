import { render, screen } from '@testing-library/react';

import { CriteriaBuilderProvider } from '../../../../common/criterias/CriteriaBuilderContext';
import TextCriteriaSection from '../../../../common/criterias/text/TextCriteriaSection';

describe('TextCriteriaSection', () => {
  it('should be empty initially', async () => {
    render(
      <CriteriaBuilderProvider>
        <TextCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveTextContent('');
  });

  it('should render items when passed', async () => {
    render(
      <CriteriaBuilderProvider
        defaultState={{
          type: 'text',
          title: '',
          text: {
            id: 'hello',
            description: 'Hello there'
          }
        }}
      >
        <TextCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveTextContent('Hello there');
  });
});
