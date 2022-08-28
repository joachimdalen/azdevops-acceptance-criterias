import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { appTheme } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import { useEffect, useMemo, useState } from 'react';

import WorkItemPicker from '../common/components/WorkItemPicker';
import { useCriteriaBuilderContext } from '../common/criterias/CriteriaBuilderContext';
import { getCriteriaDetails } from '../common/criteriaUtils';
import useValidation from '../common/hooks/useValidation';
import CriteriaHistoryService from '../common/services/CriteriaHistoryService';
import CriteriaService from '../common/services/CriteriaService';
import { StorageService } from '../common/services/StorageService';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  CriteriaDocument,
  CriteriaPanelMode,
  GlobalSettingsDocument,
  HistoryDocument,
  IAcceptanceCriteria,
  isViewMode,
  LoadedCriteriaPanelConfig
} from '../common/types';
import HistoryList from './components/HistoryList';
import CriteriaPanelService from './CriteriaPanelService';
import EditView from './EditView';
import ReadOnlyView from './ReadOnlyView';

const CriteriaPanel = (): React.ReactElement => {
  const { state: panelState, dispatch } = useCriteriaBuilderContext();
  const [tabId, setTabId] = useState('details');
  const [eTag, setEtag] = useState<number | undefined>();
  const [isError, setIsError] = useBooleanToggle();
  const [criteriaService, storageService, historyService, panelService] = useMemo(
    () => [
      new CriteriaService(error => {
        setIsError(true);
      }),
      new StorageService(),
      new CriteriaHistoryService(),
      new CriteriaPanelService()
    ],
    []
  );
  const [mode, setMode] = useState<CriteriaPanelMode>(CriteriaPanelMode.New);
  const [criteria, setCriteria] = useState<IAcceptanceCriteria | undefined>();
  const [details, setDetails] = useState<CriteriaDetailDocument>();
  const [canApprove, toggleCanApprove] = useBooleanToggle();
  const [loading, setLoading] = useState(true);
  const [workItemId, setWorkItemId] = useState<string | undefined>();
  const [settings, setSettings] = useState<GlobalSettingsDocument>();
  const [historyEvents, setHistoryEvents] = useState<HistoryDocument>();
  const [wasChanged, toggleWasChanged] = useBooleanToggle();
  const [detailsError, setDetailsError] = useState<boolean>(false);
  const { errors, validate } = useValidation();

  function setCriteriaInfo(crit?: IAcceptanceCriteria, passedDetails?: CriteriaDetailDocument) {
    if (criteria !== undefined || details !== undefined) {
      toggleWasChanged(true);
    }
    if (crit) {
      dispatch({ type: 'SET_TYPE', data: crit.type });
      dispatch({ type: 'SET_APPROVER', data: crit.requiredApprover });
      dispatch({ type: 'SET_TITLE', data: crit.title });
      dispatch({ type: 'SET_WORKITEMS', data: crit.workItems });
      setCriteria(crit);
    }

    if (passedDetails !== undefined) {
      if (crit) {
        dispatch({
          type: 'SET_CRITERIA',
          data: getCriteriaDetails(crit.type, passedDetails)
        });
      }
      setDetails(passedDetails);
      setDetailsError(passedDetails === undefined && details === undefined);
    }
  }

  useEffect(() => {
    async function initModule() {
      try {
        WebLogger.information('Loaded criteria panel...');
        await DevOps.ready();

        loadTheme(createTheme(appTheme));
        const config = DevOps.getConfiguration() as LoadedCriteriaPanelConfig;
        if (config && config.panel) {
          setMode(config.mode);

          const fetchedSettings = await storageService.getSettings();

          if (
            fetchedSettings &&
            fetchedSettings.limitAllowedCriteriaTypes &&
            fetchedSettings.allowedCriteriaTypes.length > 0
          ) {
            dispatch({ type: 'SET_TYPE', data: fetchedSettings.allowedCriteriaTypes[0] });
          }

          setSettings(fetchedSettings);

          if (config.criteriaId && config.workItemId) {
            const loadedDetails = await criteriaService.getCriteriaDetails(config.criteriaId);

            await criteriaService.load(
              async (
                data: CriteriaDocument[],
                dataChange: boolean,
                historyChange: boolean,
                isLoad: boolean
              ) => {
                if (dataChange === false && historyChange === false) return;

                const doc = data.find(x => x.criterias.find(y => y.id === config.criteriaId));
                const crit = doc?.criterias.find(x => x.id === config.criteriaId);

                if (crit) {
                  if (dataChange) {
                    setCriteriaInfo(crit, isLoad ? loadedDetails : undefined);
                    const canApprove = await criteriaService.checkApproval(crit);
                    toggleCanApprove(canApprove);
                  }

                  if (
                    (historyEvents === undefined || doc?.__etag !== eTag) &&
                    doc?.__etag !== 1 &&
                    isViewMode(config.mode) &&
                    historyChange
                  ) {
                    setEtag(doc?.__etag);
                    const historyEvents = await historyService.getHistory(crit.id);
                    setHistoryEvents(historyEvents);
                  }
                }
              },
              config.workItemId
            );
          }

          setWorkItemId(config.workItemId);
        }
        setLoading(false);
        await DevOps.notifyLoadSucceeded();
        DevOps.resize();
      } catch (error) {
        WebLogger.error('Load failed', error);
      } finally {
        setLoading(false);
      }
    }

    initModule();
  }, []);

  const showEditButton =
    mode === CriteriaPanelMode.ViewWithEdit &&
    criteria?.state !== AcceptanceCriteriaState.Completed &&
    criteria?.state !== AcceptanceCriteriaState.Approved;

  return (
    <PanelWrapper
      rootClassName="custom-scrollbar scroll-hidden"
      contentClassName="full-height h-scroll-hidden"
      cancelButton={{ text: 'Close', onClick: () => panelService.dismissPanel(wasChanged) }}
      okButton={
        isViewMode(mode)
          ? showEditButton
            ? {
                text: 'Edit',
                primary: true,
                onClick: () => setMode(CriteriaPanelMode.Edit),
                iconProps: { iconName: 'Edit' }
              }
            : undefined
          : {
              text: 'Save',
              primary: true,
              onClick: () =>
                panelService.save(
                  panelService.getCriteriaPayload(panelState, criteria, details),
                  panelState,
                  validate,
                  settings
                ),
              iconProps: { iconName: 'Save' }
            }
      }
      showVersion={mode === CriteriaPanelMode.Edit}
      moduleVersion={process.env.CRITERIA_PANEL_VERSION}
    >
      <Surface background={SurfaceBackground.callout}>
        <TabBar
          tabSize={TabSize.Compact}
          onSelectedTabChanged={t => setTabId(t)}
          selectedTabId={tabId}
          className="margin-bottom-8"
        >
          <Tab id="details" name="Details" iconProps={{ iconName: 'Page' }} />
          <Tab id="work-items" name="Work Items" iconProps={{ iconName: 'WorkItem' }} />
          <ConditionalChildren
            renderChildren={
              historyEvents !== undefined && historyEvents.items.length > 0 && isViewMode(mode)
            }
          >
            <Tab
              id="history"
              name="History"
              badgeCount={historyEvents?.items.length}
              iconProps={{ iconName: 'History' }}
            />
          </ConditionalChildren>
        </TabBar>
      </Surface>

      <ConditionalChildren
        renderChildren={tabId === 'details' || historyEvents?.items?.length === 0}
      >
        <ConditionalChildren renderChildren={!loading}>
          <ConditionalChildren renderChildren={detailsError}>
            <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Error}>
              Failed to load critiera details.
            </MessageCard>
          </ConditionalChildren>
          <ConditionalChildren renderChildren={isError}>
            <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Error}>
              An error occurred. Please refresh and try again
            </MessageCard>
          </ConditionalChildren>
          <ConditionalChildren renderChildren={isViewMode(mode) && tabId === 'details'}>
            {criteria && (
              <ReadOnlyView
                criteria={criteria}
                details={details}
                canApproveCriteria={canApprove}
                criteriaService={criteriaService}
                onDataChange={(
                  crit?: IAcceptanceCriteria,
                  passedDetails?: CriteriaDetailDocument
                ) => {
                  setCriteriaInfo(crit, passedDetails);
                }}
                workItemId={workItemId}
              />
            )}
          </ConditionalChildren>

          <ConditionalChildren
            renderChildren={
              (mode === CriteriaPanelMode.Edit || mode === CriteriaPanelMode.New) &&
              tabId === 'details'
            }
          >
            {settings && <EditView errors={errors} settings={settings} />}
          </ConditionalChildren>
        </ConditionalChildren>
      </ConditionalChildren>
      <ConditionalChildren renderChildren={tabId === 'history' && historyEvents !== undefined}>
        {historyEvents && <HistoryList events={historyEvents} />}
      </ConditionalChildren>
      <ConditionalChildren renderChildren={tabId === 'work-items'}>
        <WorkItemPicker
          disabled={isViewMode(mode)}
          workItems={criteria?.workItems}
          onWorkItemSelected={(workItemIds: number[]) => {
            dispatch({ type: 'SET_WORKITEMS', data: workItemIds });
          }}
          mode={mode}
        />
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default CriteriaPanel;
