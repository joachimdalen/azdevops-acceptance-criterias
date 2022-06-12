import { prettyDOM, render, screen, waitFor } from '@testing-library/react';

import AdminConfigurationPage from '../../../admin-hub/pages/AdminConfigurationPage';
import ConfigurationSection from '../../../admin-hub/sections/ConfigurationSection';
import { DevOpsError, DevOpsErrorCodes } from '../../../common/DevOpsError';
import { StorageService } from '../../../common/services/StorageService';
import userEvent from '@testing-library/user-event';
import { GlobalSettingsDocument } from '../../../common/types';

describe('ConfigurationSection', () => {
  const getSettingsSpy = jest.spyOn(StorageService.prototype, 'getSettings');
  const resetSettingsSpy = jest.spyOn(StorageService.prototype, 'resetSettings');
  const setSettingsSpy = jest.spyOn(StorageService.prototype, 'setSettings');
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load default', async () => {
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: false,
      allowedCriteriaTypes: [],
      requireApprovers: false,
      __etag: -1
    });

    render(<ConfigurationSection />);

    await waitFor(() => screen.findAllByText(/Settings/));
  });

  it('should check options', async () => {
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: true,
      allowedCriteriaTypes: ['checklist'],
      requireApprovers: false,
      __etag: -1
    });

    render(<ConfigurationSection />);

    await waitFor(() => screen.findAllByText(/Settings/));

    const checklistToggle = await screen.findByRole('switch', { name: 'Checklist' });
    const scenarioToggle = await screen.findByRole('switch', { name: 'Scenario' });

    expect(checklistToggle).toBeChecked();
    expect(scenarioToggle).not.toBeChecked();
  });

  it('should reset settings when clicked', async () => {
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: true,
      allowedCriteriaTypes: ['checklist'],
      requireApprovers: true,
      __etag: 1
    });

    render(<AdminConfigurationPage />);

    const resetButton = screen.getByRole('menubar');
    await userEvent.click(resetButton);

    setSettingsSpy.mockImplementation(settings => Promise.resolve(settings));

    await waitFor(() => screen.findAllByText(/Resetting configuration/));
    await waitFor(() => screen.findAllByText(/Reset configuration/));

    const scenarioToggle = screen.getByTestId('__bolt-limit-types');
    expect(scenarioToggle).not.toBeChecked();
  });
});
