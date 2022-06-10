import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CheckListCriteriaSection from '../../../../common/criterias/checklist/CheckListCriteriaSection';
import { CriteriaBuilderProvider } from '../../../../common/criterias/CriteriaBuilderContext';

describe('CheckListCriteriaSection', () => {
  it('should be empty initially', async () => {
    render(
      <CriteriaBuilderProvider>
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/Add your checklist items/));
  });
  it('should add row when button is pressed', async () => {
    render(
      <CriteriaBuilderProvider>
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/Add your checklist items/));
    const save = screen.getByRole('button');
    fireEvent.click(save);

    const boxes = screen.getAllByRole('textbox', { name: 'Some criteria...' });
    expect(boxes.length).toEqual(1);
  });
  it('should show second toolbar with 3 items', async () => {
    render(
      <CriteriaBuilderProvider>
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
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
    render(
      <CriteriaBuilderProvider
        defaultState={{
          type: 'checklist',
          title: '',
          checklist: {
            criterias: [{ completed: false, id: '1234', text: 'This item' }]
          }
        }}
      >
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    const boxes = screen.getAllByRole<HTMLInputElement>('textbox', { name: 'Some criteria...' });
    expect(boxes.length).toEqual(1);
    expect(boxes[0].value).toEqual('This item');
  });
  it('should remove item when clicked', async () => {
    render(
      <CriteriaBuilderProvider
        defaultState={{
          type: 'checklist',
          title: '',
          checklist: {
            criterias: [
              { completed: false, id: '1234', text: 'This item' },
              { completed: false, id: '4321', text: 'This item 2' }
            ]
          }
        }}
      >
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    const removeBtn = screen.getByTestId('__bolt-1234-remove');
    fireEvent.click(removeBtn);

    const boxes = screen.getAllByRole<HTMLInputElement>('textbox', { name: 'Some criteria...' });
    expect(boxes.length).toEqual(1);
  });
  it('should update item', async () => {
    render(
      <CriteriaBuilderProvider
        defaultState={{
          type: 'checklist',
          title: '',
          checklist: {
            criterias: [{ completed: false, id: '1234', text: 'This item' }]
          }
        }}
      >
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    const text = screen.getByRole<HTMLInputElement>('textbox', { name: 'Some criteria...' });
    expect(text.value).toEqual('This item');
    fireEvent.change(text, { target: { value: 'New text' } });

    const text2 = screen.getByRole<HTMLInputElement>('textbox', { name: 'Some criteria...' });
    expect(text2.value).toEqual('New text');
  });

  it('should move item up when clicked', async () => {
    render(
      <CriteriaBuilderProvider
        defaultState={{
          type: 'checklist',
          title: '',
          checklist: {
            criterias: [
              { completed: false, id: '1234', text: 'This item' },
              { completed: false, id: '4321', text: 'This item 2' }
            ]
          }
        }}
      >
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    const inputs = screen.getAllByRole<HTMLInputElement>('textbox');

    expect(inputs[0].value).toEqual('This item');
    expect(inputs[1].value).toEqual('This item 2');

    const upBtn = screen.getByTestId('__bolt-4321-up');
    fireEvent.click(upBtn);

    const inputsNew = screen.getAllByRole<HTMLInputElement>('textbox');

    expect(inputsNew[0].value).toEqual('This item 2');
    expect(inputsNew[1].value).toEqual('This item');
  });

  it('should move item down when clicked', async () => {
    render(
      <CriteriaBuilderProvider
        defaultState={{
          type: 'checklist',
          title: '',
          checklist: {
            criterias: [
              { completed: false, id: '1234', text: 'This item' },
              { completed: false, id: '4321', text: 'This item 2' }
            ]
          }
        }}
      >
        <CheckListCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    const inputs = screen.getAllByRole<HTMLInputElement>('textbox');

    expect(inputs[0].value).toEqual('This item');
    expect(inputs[1].value).toEqual('This item 2');

    const upBtn = screen.getByTestId('__bolt-1234-down');
    fireEvent.click(upBtn);

    const inputsNew = screen.getAllByRole<HTMLInputElement>('textbox');

    expect(inputsNew[0].value).toEqual('This item 2');
    expect(inputsNew[1].value).toEqual('This item');
  });

  describe('shortcuts', () => {
    it('should move item up when key combo is pressed', async () => {
      render(
        <CriteriaBuilderProvider
          defaultState={{
            type: 'checklist',
            title: '',
            checklist: {
              criterias: [
                { completed: false, id: '1234', text: 'This item' },
                { completed: false, id: '4321', text: 'This item 2' }
              ]
            }
          }}
        >
          <CheckListCriteriaSection errors={undefined} />
        </CriteriaBuilderProvider>
      );

      const inputs = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputs[0].value).toEqual('This item');
      expect(inputs[1].value).toEqual('This item 2');

      const inputOne = screen.getByDisplayValue('This item 2');
      fireEvent.keyUp(inputOne, { key: 'ArrowUp', ctrlKey: true });

      const inputsNew = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputsNew[0].value).toEqual('This item 2');
      expect(inputsNew[1].value).toEqual('This item');
    });
    it('should move item down when key combo is pressed', async () => {
      render(
        <CriteriaBuilderProvider
          defaultState={{
            type: 'checklist',
            title: '',
            checklist: {
              criterias: [
                { completed: false, id: '1234', text: 'This item' },
                { completed: false, id: '4321', text: 'This item 2' }
              ]
            }
          }}
        >
          <CheckListCriteriaSection errors={undefined} />
        </CriteriaBuilderProvider>
      );

      const inputs = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputs[0].value).toEqual('This item');
      expect(inputs[1].value).toEqual('This item 2');

      const inputOne = screen.getByDisplayValue('This item');
      fireEvent.keyUp(inputOne, { key: 'ArrowDown', ctrlKey: true });

      const inputsNew = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputsNew[0].value).toEqual('This item 2');
      expect(inputsNew[1].value).toEqual('This item');
    });
    it('should remove item down when key combo is pressed', async () => {
      render(
        <CriteriaBuilderProvider
          defaultState={{
            type: 'checklist',
            title: '',
            checklist: {
              criterias: [
                { completed: false, id: '1234', text: 'This item' },
                { completed: false, id: '4321', text: 'This item 2' }
              ]
            }
          }}
        >
          <CheckListCriteriaSection errors={undefined} />
        </CriteriaBuilderProvider>
      );

      const inputs = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputs.length).toEqual(2);

      const inputOne = screen.getByDisplayValue('This item 2');
      fireEvent.keyUp(inputOne, { key: 'Delete', ctrlKey: true });

      const inputsNew = screen.getAllByRole<HTMLInputElement>('textbox');
      expect(inputsNew.length).toEqual(1);
    });

    it('should add item down when key combo is pressed', async () => {
      render(
        <CriteriaBuilderProvider
          defaultState={{
            type: 'checklist',
            title: '',
            checklist: {
              criterias: [
                { completed: false, id: '1234', text: 'This item' },
                { completed: false, id: '4321', text: 'This item 2' }
              ]
            }
          }}
        >
          <CheckListCriteriaSection errors={undefined} />
        </CriteriaBuilderProvider>
      );

      const inputs = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputs.length).toEqual(2);

      const inputOne = screen.getByDisplayValue('This item 2');
      fireEvent.keyUp(inputOne, { key: 'Enter', ctrlKey: true });

      const inputsNew = screen.getAllByRole<HTMLInputElement>('textbox');
      expect(inputsNew.length).toEqual(3);
    });
  });
});
