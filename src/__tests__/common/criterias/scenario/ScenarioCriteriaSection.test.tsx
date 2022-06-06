import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CriteriaBuilderProvider } from '../../../../common/criterias/CriteriaBuilderContext';
import ScenarioCriteriaSection from '../../../../common/criterias/scenario/ScenarioCriteriaSection';

describe('ScenarioCriteriaSection', () => {
  it('should be empty initially', async () => {
    render(
      <CriteriaBuilderProvider>
        <ScenarioCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/The new item is added below the focused item/));
  });
  it('should add row when button is pressed', async () => {
    render(
      <CriteriaBuilderProvider>
        <ScenarioCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/The new item is added below the focused item/));
    const save = screen.getByRole('button', { name: 'Given' });
    fireEvent.click(save);

    const boxes = screen.getAllByRole('textbox', { name: 'Given' });
    expect(boxes.length).toEqual(1);
  });

  it('should render items when passed', async () => {
    render(
      <CriteriaBuilderProvider
        defaultState={{
          type: 'scenario',
          scenario: {
            scenario: 'This is the scenario',
            criterias: [{ id: '1', type: 'given', text: 'Given this is true' }]
          }
        }}
      >
        <ScenarioCriteriaSection errors={undefined} />
      </CriteriaBuilderProvider>
    );

    const boxes = screen.getAllByRole<HTMLInputElement>('textbox', { name: 'Given' });
    expect(boxes.length).toEqual(1);
    expect(boxes[0].value).toEqual('Given this is true');
  });
  it('should remove item when clicked', async () => {
    render(
      <CriteriaBuilderProvider
        defaultState={{
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
      </CriteriaBuilderProvider>
    );

    const removeBtn = screen.getByTestId('__bolt-2-remove');
    fireEvent.click(removeBtn);

    const boxes = screen.getAllByRole<HTMLInputElement>('textbox', { name: 'And' });
    expect(boxes.length).toEqual(1);
  });
  it('should update item', async () => {
    render(
      <CriteriaBuilderProvider
        defaultState={{
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
      </CriteriaBuilderProvider>
    );

    const text = screen.getByRole<HTMLInputElement>('textbox', { name: 'Given' });
    expect(text.value).toEqual('Given this is true');
    fireEvent.change(text, { target: { value: 'New text' } });

    const text2 = screen.getByRole<HTMLInputElement>('textbox', { name: 'Given' });
    expect(text2.value).toEqual('New text');
  });

  describe('shortcuts', () => {
    it('should move item up when key combo is pressed', async () => {
      render(
        <CriteriaBuilderProvider
          defaultState={{
            type: 'scenario',
            scenario: {
              scenario: 'Some scenario',
              criterias: [
                { id: '1234', text: 'This item', type: 'given' },
                { id: '4321', text: 'This item 2', type: 'and' }
              ]
            }
          }}
        >
          <ScenarioCriteriaSection errors={undefined} />
        </CriteriaBuilderProvider>
      );

      const inputs = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputs[1].value).toEqual('This item');
      expect(inputs[2].value).toEqual('This item 2');

      const inputOne = screen.getByLabelText('And');
      fireEvent.keyUp(inputOne, { key: 'ArrowUp', ctrlKey: true });

      const inputsNew = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputsNew[1].value).toEqual('This item 2');
      expect(inputsNew[2].value).toEqual('This item');
    });
    it('should move item down when key combo is pressed', async () => {
      render(
        <CriteriaBuilderProvider
          defaultState={{
            type: 'scenario',
            scenario: {
              scenario: 'Some scenario',
              criterias: [
                { id: '1234', text: 'This item', type: 'given' },
                { id: '4321', text: 'This item 2', type: 'and' }
              ]
            }
          }}
        >
          <ScenarioCriteriaSection errors={undefined} />
        </CriteriaBuilderProvider>
      );

      const inputs = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputs[1].value).toEqual('This item');
      expect(inputs[2].value).toEqual('This item 2');

      const inputOne = screen.getByLabelText('Given');
      fireEvent.keyUp(inputOne, { key: 'ArrowDown', ctrlKey: true });

      const inputsNew = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputsNew[1].value).toEqual('This item 2');
      expect(inputsNew[2].value).toEqual('This item');
    });
    it('should remove item down when key combo is pressed', async () => {
      render(
        <CriteriaBuilderProvider
          defaultState={{
            type: 'scenario',
            scenario: {
              scenario: 'Some scenario',
              criterias: [
                { id: '1234', text: 'This item', type: 'given' },
                { id: '4321', text: 'This item 2', type: 'and' }
              ]
            }
          }}
        >
          <ScenarioCriteriaSection errors={undefined} />
        </CriteriaBuilderProvider>
      );

      const inputs = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputs.length).toEqual(3);

      const inputOne = screen.getByLabelText('Given');
      fireEvent.keyUp(inputOne, { key: 'Delete', ctrlKey: true });

      const inputsNew = screen.getAllByRole<HTMLInputElement>('textbox');

      expect(inputsNew.length).toEqual(2);
    });
  });
});
