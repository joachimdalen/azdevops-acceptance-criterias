import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { render, screen, waitFor } from '@testing-library/react';

import { mockGetConfiguration, mockGetUser } from '../../__mocks__/azure-devops-extension-sdk';
import CriteriaHistoryService from '../../common/services/CriteriaHistoryService';
import { StorageService } from '../../common/services/StorageService';
import {
  AcceptanceCriteriaState,
  CriteriaPanelConfig,
  CriteriaPanelMode,
  FullCriteriaStatus,
  HistoryDocument,
  HistoryEvent,
  LoadedCriteriaPanelConfig
} from '../../common/types';
import CriteriaPanel from '../../criteria-panel/CriteriaPanel';
import { CriteriaBuilderProvider } from '../../common/criterias/CriteriaBuilderContext';
import { getApprover, getTextCriteria } from '../../testdata';

const history: HistoryDocument = {
  __etag: 1,
  id: 'AC-1-2',
  items: []
};

const identity: IInternalIdentity = {
  displayName: 'Test User',
  entityId: '1234',
  entityType: 'User',
  id: '54321',
  descriptor: 'user1234',
  image: '/image.png'
};

const historyWithContent: HistoryDocument = {
  __etag: 1,
  id: 'AC-1-2',
  items: [
    {
      date: new Date(),
      event: HistoryEvent.Completed,
      actor: identity
    }
  ]
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
    const config: LoadedCriteriaPanelConfig = {
      panel: {
        close: jest.fn()
      },
      workItemId: '1',
      mode: CriteriaPanelMode.ViewWithEdit
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
      <CriteriaBuilderProvider>
        <CriteriaPanel />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/Title/));
  });

  it('should fetch and render criteria', async () => {
    const config: LoadedCriteriaPanelConfig = {
      panel: {
        close: jest.fn()
      },
      workItemId: '1',
      mode: CriteriaPanelMode.View,
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
      <CriteriaBuilderProvider>
        <CriteriaPanel />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/This is the content/));
  });

  it('should render complete container', async () => {
    const config: LoadedCriteriaPanelConfig = {
      panel: {
        close: jest.fn()
      },
      workItemId: '1',
      mode: CriteriaPanelMode.View,
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
      <CriteriaBuilderProvider>
        <CriteriaPanel />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/Complete criteria\?/));
  });
  it('should render completed container', async () => {
    const config: LoadedCriteriaPanelConfig = {
      panel: {
        close: jest.fn()
      },
      workItemId: '1',
      mode: CriteriaPanelMode.View,
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
      <CriteriaBuilderProvider>
        <CriteriaPanel />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/This criteria was completed/));
  });
  it('should render ready for approval container', async () => {
    const config: LoadedCriteriaPanelConfig = {
      panel: {
        close: jest.fn()
      },
      workItemId: '1',
      mode: CriteriaPanelMode.View,
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
      <CriteriaBuilderProvider>
        <CriteriaPanel />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/Ready for approval/));
  });
  it('should render approval container', async () => {
    const config: LoadedCriteriaPanelConfig = {
      panel: {
        close: jest.fn()
      },
      workItemId: '1',
      mode: CriteriaPanelMode.View,
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
      <CriteriaBuilderProvider>
        <CriteriaPanel />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/This criteria needs your attention/));
  });
  it('should render history tab when criteria have history', async () => {
    const config: LoadedCriteriaPanelConfig = {
      panel: {
        close: jest.fn()
      },
      workItemId: '1',
      mode: CriteriaPanelMode.View,
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
    getHistorySpy.mockResolvedValue(historyWithContent);

    render(
      <CriteriaBuilderProvider>
        <CriteriaPanel />
      </CriteriaBuilderProvider>
    );

    await waitFor(() => screen.findAllByText(/History/));
  });
});
