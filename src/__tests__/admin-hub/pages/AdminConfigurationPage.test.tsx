import { render, screen, waitFor } from '@testing-library/react';

import {
  mockGetContributionId,
  mockGetExtensionContext
} from '../../../__mocks__/azure-devops-extension-sdk';
import AdminConfigurationPage from '../../../admin-hub/pages/AdminConfigurationPage';
import { StorageService } from '../../../common/services/StorageService';

describe('AdminConfigurationPage', () => {
  const getSettingsSpy = jest.spyOn(StorageService.prototype, 'getSettings');
  beforeEach(() => {
    jest.clearAllMocks();
    // const context = {
    //   id: 'joachimdalen.acceptance-criterias-dev',
    //   publisherId: 'joachimdalen',
    //   extensionId: 'acceptance-criterias-dev'
    // };
    // mockGetContributionId.mockReturnValue(
    //   'joachimdalen.acceptance-criterias-dev.admin-configuration'
    // );
    // mockGetExtensionContext.mockReturnValue(context);
  });

  it('should load default', async () => {
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: false,
      allowedCriteriaTypes: [],
      requireApprovers: false,
      __etag: -1
    });

    render(<AdminConfigurationPage />);

    await waitFor(() => screen.findAllByText(/Configuration/));
  });

  it('should set default settings', async () => {
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: false,
      allowedCriteriaTypes: [],
      requireApprovers: false,
      __etag: -1
    });

    render(<AdminConfigurationPage />);

    await waitFor(() => screen.findAllByText(/Configuration/));
  });
});
