import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ScenarioCriteriaSection from '../../../../criteria-panel/components/scenario/ScenarioCriteriaSection';
import { CriteriaPanelProvider } from '../../../../criteria-panel/CriteriaPanelContext';

describe('ScenarioCriteriaSection', () => {
  it('should be empty initially', async () => {
    render(
      <CriteriaPanelProvider>
        <ScenarioCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/Add your Given\/When\/Then sequence elements/));
  });
  it('should add row when button is pressed', async () => {
    render(
      <CriteriaPanelProvider>
        <ScenarioCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/Add your Given\/When\/Then sequence elements/));
    const save = screen.getByRole('button', { name: 'Given' });
    fireEvent.click(save);

    const boxes = screen.getAllByRole('textbox', { name: 'Given' });
    expect(boxes.length).toEqual(1);
  });

  it('should render items when passed', async () => {
    render(
      <CriteriaPanelProvider
        defaultState={{
          isLoading: false,
          type: 'scenario',
          scenario: {
            scenario: 'This is the scenario',
            criterias: [{ id: '1', type: 'given', text: 'Given this is true' }]
          }
        }}
      >
        <ScenarioCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    const boxes = screen.getAllByRole<HTMLInputElement>('textbox', { name: 'Given' });
    expect(boxes.length).toEqual(1);
    expect(boxes[0].value).toEqual('Given this is true');
  });
  it('should remove item when clicked', async () => {
    render(
      <CriteriaPanelProvider
        defaultState={{
          isLoading: false,
          type: 'scenario',
          scenario: {
            scenario: 'This is the scenario',
            criterias: [
              { id: '1', type: 'given', text: 'Given this is true' },
              { id: '2', type: 'and', text: 'and this is false' },
              { id: '3', type: 'and', text: 'and this is also false' }
            ]
          }
        }}
      >
        <ScenarioCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    const removeBtn = screen.getByTestId('__bolt-2-remove');
    fireEvent.click(removeBtn);

    const boxes = screen.getAllByRole<HTMLInputElement>('textbox', { name: 'And' });
    expect(boxes.length).toEqual(1);
  });
  it('should update item', async () => {
    render(
      <CriteriaPanelProvider
        defaultState={{
          isLoading: false,
          type: 'scenario',
          scenario: {
            scenario: 'This is the scenario',
            criterias: [
              { id: '1', type: 'given', text: 'Given this is true' },
              { id: '2', type: 'and', text: 'and this is false' },
              { id: '3', type: 'and', text: 'and this is also false' }
            ]
          }
        }}
      >
        <ScenarioCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    const text = screen.getByRole<HTMLInputElement>('textbox', { name: 'Given' });
    expect(text.value).toEqual('Given this is true');
    fireEvent.change(text, { target: { value: 'New text' } });

    const text2 = screen.getByRole<HTMLInputElement>('textbox', { name: 'Given' });
    expect(text2.value).toEqual('New text');
  });
});
