import { render, screen, waitFor } from '@testing-library/react';
import { MessageBarSeverity } from 'azure-devops-ui/MessageBar';
import { IConfirmationConfig } from '../../common/common';

import ConfirmationDialog from '../../confirmation-dialog/ConfirmationDialog';
import {
  mockGetConfiguration,
  mockGetContributionId
} from '../../__mocks__/azure-devops-extension-sdk';

describe('ConfirmationDialog', () => {
  it('should show error when failing to load config', async () => {
    mockGetConfiguration.mockReturnValue(undefined);
    render(<ConfirmationDialog />);
    await waitFor(() => screen.findAllByText(/Error/));
  });
  it('should render correctly', async () => {
    const config: IConfirmationConfig = {
      cancelButton: {
        text: 'Cancel'
      },
      confirmButton: {
        text: 'Ok'
      },
      content: 'This is the dialog content'
    };
    mockGetConfiguration.mockReturnValue(config);

    render(<ConfirmationDialog />);

    await waitFor(() => screen.findAllByText(/This is the dialog content/));

    const okButton = screen.getByRole('button', {
      name: 'Ok'
    });
    const cancelButton = screen.getByRole('button', {
      name: 'Ok'
    });

    expect(okButton).not.toBeUndefined();
    expect(cancelButton).not.toBeUndefined();
  });
  it('should not render "Do not show again" unless configured', async () => {
    const config: IConfirmationConfig = {
      cancelButton: {
        text: 'Cancel'
      },
      confirmButton: {
        text: 'Ok'
      },
      content: 'This is the dialog content'
    };
    mockGetConfiguration.mockReturnValue(config);

    render(<ConfirmationDialog />);

    await waitFor(() => screen.findAllByText(/This is the dialog content/));

    const dnsa = screen.queryByRole('checkbox');

    expect(dnsa).toBeNull();
  });
  it('should render message bar', async () => {
    const config: IConfirmationConfig = {
      cancelButton: {
        text: 'Cancel'
      },
      confirmButton: {
        text: 'Ok'
      },
      content: 'This is the dialog content',
      messageBar: {
        severity: MessageBarSeverity.Error
      },
      messageBarContent: 'This is mb content'
    };
    mockGetConfiguration.mockReturnValue(config);

    render(<ConfirmationDialog />);

    await waitFor(() => screen.findAllByText(/This is mb content/));
  });
  it('should render array content', async () => {
    const config: IConfirmationConfig = {
      cancelButton: {
        text: 'Cancel'
      },
      confirmButton: {
        text: 'Ok'
      },
      content: ['This is the dialog content', 'And this is the row'],
      messageBar: {
        severity: MessageBarSeverity.Error
      },
      messageBarContent: 'This is mb content'
    };
    mockGetConfiguration.mockReturnValue(config);

    render(<ConfirmationDialog />);

    await waitFor(() => screen.findAllByText(/This is the dialog content/));
    await waitFor(() => screen.findAllByText(/And this is the row/));
  });
});
