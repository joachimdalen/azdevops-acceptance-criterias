import { prettyDOM, render, screen, waitFor } from '@testing-library/react';

import { mockGetDevOpsProject } from '../../__mocks__/@joachimdalen/azdevops-ext-core/DevOpsService';
import { mockGetConfiguration, mockGetUser } from '../../__mocks__/azure-devops-extension-sdk';
import { StorageService } from '../../common/services/StorageService';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  CriteriaDocument,
  CriteriaPanelConfig,
  FullCriteriaStatus,
  HistoryDocument
} from '../../common/types';
import CriteriaPanel from '../../criteria-panel/CriteriaPanel';
import { CriteriaPanelProvider } from '../../criteria-panel/CriteriaPanelContext';
import { getApprover, getTextCriteria } from '../../testdata';
import CriteriaHistoryService from '../../common/services/CriteriaHistoryService';

type CpCon = (CriteriaPanelConfig & { panel: any }) | undefined;

const history: HistoryDocument = {
  __etag: 1,
  id: 'AC-1-2',
  items: []
};

describe('CriteriaPanel', () => {
  const getSettingsSpy = jest.spyOn(StorageService.prototype, 'getSettings');
  const getCriteriaDetailsSpy = jest.spyOn(StorageService.prototype, 'getCriteriaDetail');
  const getCriteriaSpy = jest.spyOn(StorageService.prototype, 'getCriteriasForWorkItem');
  const getHistorySpy = jest.spyOn(CriteriaHistoryService.prototype, 'getHistory');

  beforeEach(() => {
    jest.clearAllMocks();
    getHistorySpy.mockReset();
  });

  it('should render default edit mode', async () => {
    const config: CpCon = {
      panel: true,
      workItemId: '1',
      canEdit: true
    };

    mockGetConfiguration.mockReturnValue(config);
    getHistorySpy.mockResolvedValue(history);
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: false,
      allowedCriteriaTypes: [],
      requireApprovers: false,
      __etag: -1
    });

    render(
      <CriteriaPanelProvider>
        <CriteriaPanel />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/Title/));
  });

  it('should fetch and render criteria', async () => {
    const config: CpCon = {
      panel: {
        onClose: jest.fn()
      },
      workItemId: '1',
      canEdit: true,
      criteriaId: 'AC-1-1'
    };
    const { criteria, details } = getTextCriteria(
      '1',
      FullCriteriaStatus.Approved,
      AcceptanceCriteriaState.Approved,
      '1'
    );

    mockGetConfiguration.mockReturnValue(config);
    getCriteriaDetailsSpy.mockResolvedValue(details);
    getCriteriaSpy.mockResolvedValue(criteria);
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: false,
      allowedCriteriaTypes: [],
      requireApprovers: false,
      __etag: -1
    });
    getHistorySpy.mockResolvedValue(history);

    render(
      <CriteriaPanelProvider>
        <CriteriaPanel />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/This is the content/));
  });

  it('should render complete container', async () => {
    const config: CpCon = {
      panel: {
        onClose: jest.fn()
      },
      workItemId: '1',
      isReadOnly: true,
      criteriaId: 'AC-1-1'
    };
    const { criteria, details } = getTextCriteria(
      '1',
      FullCriteriaStatus.New,
      AcceptanceCriteriaState.New,
      '1'
    );

    mockGetConfiguration.mockReturnValue(config);
    getCriteriaDetailsSpy.mockResolvedValue(details);
    getCriteriaSpy.mockResolvedValue(criteria);
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: false,
      allowedCriteriaTypes: [],
      requireApprovers: false,
      __etag: -1
    });
    getHistorySpy.mockResolvedValue(history);

    render(
      <CriteriaPanelProvider>
        <CriteriaPanel />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/Complete criteria\?/));
  });
  it('should render completed container', async () => {
    const config: CpCon = {
      panel: {
        onClose: jest.fn()
      },
      workItemId: '1',
      isReadOnly: true,
      criteriaId: 'AC-1-1'
    };
    const { criteria, details } = getTextCriteria(
      '1',
      FullCriteriaStatus.Completed,
      AcceptanceCriteriaState.Completed,
      '1'
    );
    mockGetConfiguration.mockReturnValue(config);
    getCriteriaDetailsSpy.mockResolvedValue(details);
    getCriteriaSpy.mockResolvedValue(criteria);
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: false,
      allowedCriteriaTypes: [],
      requireApprovers: false,
      __etag: -1
    });
    getHistorySpy.mockResolvedValue(history);

    render(
      <CriteriaPanelProvider>
        <CriteriaPanel />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/This criteria was completed/));
  });
  it('should render ready for approval container', async () => {
    const config: CpCon = {
      panel: {
        onClose: jest.fn()
      },
      workItemId: '1',
      isReadOnly: true,
      criteriaId: 'AC-1-1'
    };
    const { criteria, details } = getTextCriteria(
      '1',
      FullCriteriaStatus.New,
      AcceptanceCriteriaState.New,
      '1',
      getApprover()
    );
    mockGetConfiguration.mockReturnValue(config);
    getCriteriaDetailsSpy.mockResolvedValue(details);
    getCriteriaSpy.mockResolvedValue(criteria);
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: false,
      allowedCriteriaTypes: [],
      requireApprovers: false,
      __etag: -1
    });
    getHistorySpy.mockResolvedValue(history);

    render(
      <CriteriaPanelProvider>
        <CriteriaPanel />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/Ready for approval/));
  });
  it('should render approval container', async () => {
    const config: CpCon = {
      panel: {
        onClose: jest.fn()
      },
      workItemId: '1',
      isReadOnly: true,
      criteriaId: 'AC-1-1'
    };
    const { criteria, details } = getTextCriteria(
      '1',
      FullCriteriaStatus.New,
      AcceptanceCriteriaState.AwaitingApproval,
      '1',
      getApprover()
    );
    mockGetUser.mockReturnValue(getApprover());
    mockGetConfiguration.mockReturnValue(config);
    getCriteriaDetailsSpy.mockResolvedValue(details);
    getCriteriaSpy.mockResolvedValue(criteria);
    getSettingsSpy.mockResolvedValue({
      id: 'Global',
      limitAllowedCriteriaTypes: false,
      allowedCriteriaTypes: [],
      requireApprovers: false,
      __etag: -1
    });
    getHistorySpy.mockResolvedValue(history);

    render(
      <CriteriaPanelProvider>
        <CriteriaPanel />
      </CriteriaPanelProvider>
    );

    await waitFor(() => screen.findAllByText(/This criteria needs your attention/));
  });
});
