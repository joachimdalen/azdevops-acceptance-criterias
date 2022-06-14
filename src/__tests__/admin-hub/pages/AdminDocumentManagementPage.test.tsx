import { render, screen, waitFor } from '@testing-library/react';

import AdminDocumentManagementPage from '../../../admin-hub/pages/AdminDocumentManagementPage';
import { StorageService } from '../../../common/services/StorageService';

describe('AdminTemplatesPage', () => {
  const getTemplatesSpy = jest.spyOn(StorageService.prototype, 'getTemplates');
  const getAllCriteriasSpy = jest.spyOn(StorageService.prototype, 'getAllCriterias');
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load default', async () => {
    getTemplatesSpy.mockResolvedValue([]);
    getAllCriteriasSpy.mockResolvedValue([]);

    render(<AdminDocumentManagementPage />);

    await waitFor(() => screen.findAllByText(/No orphaned criterias/));
  });
});
