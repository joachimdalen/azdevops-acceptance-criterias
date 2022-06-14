import { render, screen, waitFor } from '@testing-library/react';

import AdminTemplatesPage from '../../../admin-hub/pages/AdminTemplatesPage';
import { StorageService } from '../../../common/services/StorageService';

describe('AdminTemplatesPage', () => {
  const getTemplatesSpy = jest.spyOn(StorageService.prototype, 'getTemplates');
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load default', async () => {
    getTemplatesSpy.mockResolvedValue([]);

    render(<AdminTemplatesPage />);

    await waitFor(() => screen.findAllByText(/Templates/));
  });
});
