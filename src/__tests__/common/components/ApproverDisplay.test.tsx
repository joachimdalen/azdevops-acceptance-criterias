import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { prettyDOM, render, screen } from '@testing-library/react';

import ApproverDisplay from '../../../common/components/ApproverDisplay';
import { getLocalItem, getRawLocalItem, LocalStorageRawKeys } from '../../../common/localStorage';

jest.mock('../../../common/localStorage', () => ({
  ...jest.requireActual('../../../common/localStorage'),
  getRawLocalItem: jest.fn()
}));
describe('ApproverDisplay', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const identity: IInternalIdentity = {
    displayName: 'Test User',
    entityId: '1234',
    entityType: 'User',
    id: '54321',
    descriptor: 'user1234',
    image: '/image.png'
  };

  it('should show unassigned if identity is undefined', async () => {
    render(<ApproverDisplay />);

    await screen.findAllByText(/Unassigned/);
  });
  it('should show persona when defined', async () => {
    render(<ApproverDisplay approver={identity} />);

    await screen.findAllByText(/Test User/);
  });
  it('should show persona with correct url', async () => {
    (getRawLocalItem as any).mockReturnValue('https://myapp.local');
    render(<ApproverDisplay approver={identity} />);

    const image: HTMLImageElement = await screen.findByRole('img');

    expect(image.src).toEqual('https://myapp.local/image.png');
  });
  it('should show persona with correct url if already absolute', async () => {
    (getRawLocalItem as any).mockReturnValue('https://myapp.local');
    render(<ApproverDisplay approver={{ ...identity, image: 'https://myapp.local/image.png' }} />);

    const image: HTMLImageElement = await screen.findByRole('img');

    expect(image.src).toEqual('https://myapp.local/image.png');
  });
  it('should show persona with relative url if failing to get', async () => {
    (getRawLocalItem as any).mockReturnValue(undefined);
    render(<ApproverDisplay approver={{ ...identity, image: '/image.png' }} />);

    const image: HTMLImageElement = await screen.findByRole('img');

    expect(image.src).toEqual('http://localhost/image.png');
  });
});
