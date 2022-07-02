import { render, screen, waitFor } from '@testing-library/react';

import {
  mockGetContributionId,
  mockGetExtensionContext,
  mockGetResourceAreaLocation
} from '../../__mocks__/azure-devops-extension-sdk';
import testTheory from '../../__test-utils__/JestTheory';
import AdminHub from '../../admin-hub/AdminHub';
import { StorageService } from '../../common/services/StorageService';

describe('AdminHub', () => {
  const getTemplatesSpy = jest.spyOn(StorageService.prototype, 'getTemplates');
  const getAllCriteriasSpy = jest.spyOn(StorageService.prototype, 'getAllCriterias');
  beforeEach(() => {
    jest.clearAllMocks();
    const context = {
      id: 'joachimdalen.acceptance-criterias-dev',
      publisherId: 'joachimdalen',
      extensionId: 'acceptance-criterias-dev'
    };
    mockGetExtensionContext.mockReturnValue(context);
    getTemplatesSpy.mockResolvedValue([]);
    getAllCriteriasSpy.mockResolvedValue([]);
    mockGetResourceAreaLocation.mockResolvedValue('https://myapp.local/');
  });

  testTheory(
    'Should load {hub}',
    [
      { hub: 'admin-configuration', expected: 'Configuration' },
      { hub: 'admin-templates', expected: 'Templates' },
      { hub: 'admin-document-mgmt', expected: 'Orphaned Criterias' }
    ],
    async theory => {
      mockGetContributionId.mockReturnValue(`joachimdalen.acceptance-criterias-dev.${theory.hub}`);
      render(<AdminHub />);

      await waitFor(() => screen.findAllByText(theory.expected));
    }
  );
});
