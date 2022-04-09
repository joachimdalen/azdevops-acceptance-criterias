import { fireEvent, prettyDOM, render, screen, waitFor } from '@testing-library/react';

import CheckListCriteriaSection from '../../../criteria-panel/components/CheckListCriteriaSection';
import { CriteriaPanelProvider } from '../../../criteria-panel/CriteriaPanelContext';

describe('CheckListCriteriaSection', () => {
  it('should be empty initially', async () => {
    render(
      <CriteriaPanelProvider>
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/Add your checklist items/));
  });
  it('should add row when button is pressed', async () => {
    render(
      <CriteriaPanelProvider>
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/Add your checklist items/));
    const save = screen.getByRole('button');
    fireEvent.click(save);

    const boxes = screen.getAllByRole('textbox', { name: 'Some criteria...' });
    expect(boxes.length).toEqual(1);
  });
  it('should show second toolbar with 3 items', async () => {
    render(
      <CriteriaPanelProvider>
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/Add your checklist items/));
    const save = screen.getByRole('button');
    fireEvent.click(save);
    fireEvent.click(save);
    fireEvent.click(save);

    const addButtons = screen.getAllByRole('button', { name: 'Add item' });
    expect(addButtons.length).toEqual(2);
  });
  it('should render items when passed', async () => {
    const { container } = render(
      <CriteriaPanelProvider
        defaultState={{
          isLoading: false,
          type: 'checklist',
          checklist: {
            criterias: [{ completed: false, id: '1234', text: 'This item' }]
          }
        }}
      >
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    const boxes = screen.getAllByRole<HTMLInputElement>('textbox', { name: 'Some criteria...' });
    expect(boxes.length).toEqual(1);
    expect(boxes[0].value).toEqual('This item');
  });
  it('should remove item when clicked', async () => {
    const { container } = render(
      <CriteriaPanelProvider
        defaultState={{
          isLoading: false,
          type: 'checklist',
          checklist: {
            criterias: [
              { completed: false, id: '1234', text: 'This item' },
              { completed: false, id: '4321', text: 'This item 2' }
            ]
          }
        }}
      >
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    const removeBtn = screen.getByTestId('__bolt-1234-remove');
    fireEvent.click(removeBtn);

    const boxes = screen.getAllByRole<HTMLInputElement>('textbox', { name: 'Some criteria...' });
    expect(boxes.length).toEqual(1);
  });
  it('should update item', async () => {
    render(
      <CriteriaPanelProvider
        defaultState={{
          isLoading: false,
          type: 'checklist',
          checklist: {
            criterias: [{ completed: false, id: '1234', text: 'This item' }]
          }
        }}
      >
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaPanelProvider>
    );

    const text = screen.getByRole<HTMLInputElement>('textbox', { name: 'Some criteria...' });
    expect(text.value).toEqual('This item');
    fireEvent.change(text, { target: { value: 'New text' } });

    const text2 = screen.getByRole<HTMLInputElement>('textbox', { name: 'Some criteria...' });
    expect(text2.value).toEqual('New text');
  });
});
