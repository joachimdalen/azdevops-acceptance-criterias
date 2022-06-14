import { prettyDOM, render, screen, waitFor } from '@testing-library/react';

import AdminConfigurationPage from '../../../admin-hub/pages/AdminConfigurationPage';
import ConfigurationSection from '../../../admin-hub/sections/ConfigurationSection';
import { DevOpsError, DevOpsErrorCodes } from '../../../common/DevOpsError';
import { StorageService } from '../../../common/services/StorageService';
import userEvent from '@testing-library/user-event';
import { GlobalSettingsDocument } from '../../../common/types';
import testTheory from '../../../__test-utils__/JestTheory';

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

    setSettingsSpy.mockImplementation(
      settings => new Promise(res => setTimeout(() => res(settings), 1000))
    );

    await waitFor(() => screen.findAllByText(/Reset configuration/));

    const resetButton = screen.getByRole('menuitem', { name: 'Reset configuration' });
    await userEvent.click(resetButton);

    await waitFor(() => screen.findAllByText(/Resetting/));
    await waitFor(() => screen.findAllByText(/Reset configuration/));

    const scenarioToggle = screen.getByTestId('__bolt-limit-types');
    expect(scenarioToggle).not.toBeChecked();
  });
  it('should toggle required approver', async () => {
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: true,
      allowedCriteriaTypes: ['checklist'],
      requireApprovers: false,
      __etag: -1
    });

    setSettingsSpy.mockImplementation(settings => Promise.resolve(settings));

    render(<ConfigurationSection />);

    await waitFor(() => screen.findAllByText(/Settings/));

    const toggleContainer = screen.getByTestId('__bolt-require-approver').closest('div');
    if (toggleContainer === null) throw Error('Failed to find element');
    await userEvent.click(toggleContainer);

    const toggleSecond = screen.getByTestId('__bolt-require-approver');
    expect(toggleSecond).toBeChecked();
  });

  it('should toggle limit types', async () => {
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: false,
      allowedCriteriaTypes: ['checklist'],
      requireApprovers: false,
      __etag: -1
    });

    setSettingsSpy.mockImplementation(settings => Promise.resolve(settings));

    render(<ConfigurationSection />);

    await waitFor(() => screen.findAllByText(/Settings/));

    const toggleContainer = screen.getByTestId('__bolt-limit-types').closest('div');
    if (toggleContainer === null) throw Error('Failed to find element');
    await userEvent.click(toggleContainer);

    const toggleSecond = screen.getByTestId('__bolt-limit-types');
    expect(toggleSecond).toBeChecked();
  });

  testTheory(
    'should toggle {option}',
    [{ option: 'Checklist' }, { option: 'Scenario' }, { option: 'Text' }],
    async theory => {
      getSettingsSpy.mockResolvedValue({
        id: 'Global',
        limitAllowedCriteriaTypes: true,
        allowedCriteriaTypes: [],
        requireApprovers: false,
        __etag: -1
      });

      setSettingsSpy.mockImplementation(settings => Promise.resolve(settings));

      render(<ConfigurationSection />);

      await waitFor(() => screen.findAllByText(/Settings/));
      const toggleFirst = screen.getByRole('switch', { name: theory.option });
      expect(toggleFirst).not.toBeChecked();

      const toggleContainer = screen.getByRole('switch', { name: theory.option }).closest('div');
      if (toggleContainer === null) throw Error('Failed to find element');
      await userEvent.click(toggleContainer);

      const toggleSecond = screen.getByRole('switch', { name: theory.option });
      expect(toggleSecond).toBeChecked();
    }
  );
  testTheory(
    'should untoggle {option}',
    [
      { option: 'Checklist', nonOptions: ['Scenario', 'Text'] },
      { option: 'Scenario', nonOptions: ['Text', 'Checklist'] },
      { option: 'Text', nonOptions: ['Scenario', 'Checklist'] }
    ],
    async theory => {
      getSettingsSpy.mockResolvedValue({
        id: 'Global',
        limitAllowedCriteriaTypes: true,
        allowedCriteriaTypes: ['checklist', 'scenario', 'text'],
        requireApprovers: false,
        __etag: -1
      });

      setSettingsSpy.mockImplementation(settings => Promise.resolve(settings));

      render(<ConfigurationSection />);

      await waitFor(() => screen.findAllByText(/Settings/));
      const toggleFirst = screen.getByRole('switch', { name: theory.option });
      expect(toggleFirst).toBeChecked();

      const toggleContainer = screen.getByRole('switch', { name: theory.option }).closest('div');
      if (toggleContainer === null) throw Error('Failed to find element');
      await userEvent.click(toggleContainer);

      const toggleSecond = screen.getByRole('switch', { name: theory.option });
      expect(toggleSecond).not.toBeChecked();

      for (const item of theory.nonOptions) {
        const toggleThird = screen.getByRole('switch', { name: item });
        expect(toggleThird).toBeChecked();
      }
    }
  );
});
