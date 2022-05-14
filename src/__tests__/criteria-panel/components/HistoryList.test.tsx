import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { render, screen, waitFor } from '@testing-library/react';

import { HistoryDocument, HistoryEvent } from '../../../common/types';
import HistoryList from '../../../criteria-panel/components/HistoryList';

const identity: IInternalIdentity = {
  displayName: 'Test User',
  entityId: '1234',
  entityType: 'User',
  id: '54321',
  descriptor: 'user1234',
  image: '/image.png'
};

describe('HistoryList', () => {
  it('should show list item', async () => {
    const document: HistoryDocument = {
      id: 'AC-1-1',
      __etag: 0,
      items: [{ date: new Date(), event: HistoryEvent.Rejected, actor: identity }]
    };

    render(<HistoryList events={document} />);

    await waitFor(() => screen.findAllByText(/Rejected criteria/));
  });
  it('should not render actor if not defined', async () => {
    const document: HistoryDocument = {
      id: 'AC-1-1',
      __etag: 0,
      items: [{ date: new Date(), event: HistoryEvent.Rejected }]
    };

    const { container } = render(<HistoryList events={document} />);

    await waitFor(() => screen.findAllByText(/Rejected criteria/));
    expect(container.querySelector('.ms-Persona')).not.toBeInTheDocument();
  });
});
