import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { appTheme } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { useDropdownSelection } from '@joachimdalen/azdevops-ext-core/useDropdownSelection';
import {
  getCombined,
  hasError,
  parseValidationError
} from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { ITableColumn, SimpleTableCell } from 'azure-devops-ui/Table';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';

import { CriteriaModalResult } from '../common/common';
import CriteriaTypeDisplay from '../common/components/CriteriaTypeDisplay';
import CheckListCriteriaSection from '../common/criterias/checklist/CheckListCriteriaSection';
import { useCriteriaBuilderContext } from '../common/criterias/CriteriaBuilderContext';
import ScenarioCriteria from '../common/criterias/scenario/ScenarioCriteriaSection';
import TextCriteriaSection from '../common/criterias/text/TextCriteriaSection';
import { LocalStorageRawKeys } from '../common/localStorage';
import CriteriaHistoryService from '../common/services/CriteriaHistoryService';
import CriteriaService from '../common/services/CriteriaService';
import { StorageService } from '../common/services/StorageService';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  CriteriaDocument,
  CriteriaPanelConfig,
  CriteriaTypes,
  GlobalSettingsDocument,
  HistoryDocument,
  IAcceptanceCriteria
} from '../common/types';
import { getSchema } from '../common/validationSchemas';
import HistoryList from './components/HistoryList';
import ReadOnlyView from './ReadOnlyView';

const CriteriaPanel = (): React.ReactElement => {
  const { state: panelState, dispatch } = useCriteriaBuilderContext();
  const [tabId, setTabId] = useState('details');
  const [eTag, setEtag] = useState<number | undefined>();
  const [isError, setIsError] = useBooleanToggle();
  const [criteriaService, storageService, historyService] = useMemo(
    () => [
      new CriteriaService(error => {
        setIsError(true);
      }),
      new StorageService(),
      new CriteriaHistoryService()
    ],
    []
  );
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [identity, setIdentity] = useState<IInternalIdentity | undefined>(undefined);
  const [title, setTitle] = useState<string>('');
  const [criteria, setCriteria] = useState<IAcceptanceCriteria | undefined>();
  const [details, setDetails] = useState<CriteriaDetailDocument>();
  const [canApprove, toggleCanApprove] = useBooleanToggle();
  const [loading, setLoading] = useState(true);
  const [workItemId, setWorkItemId] = useState<string | undefined>();
  const [settings, setSettings] = useState<GlobalSettingsDocument>();
  const [historyEvents, setHistoryEvents] = useState<HistoryDocument>();
  const [wasChanged, toggleWasChanged] = useBooleanToggle();
  const [editAfterComplete, toggleEditAfterComplete] = useBooleanToggle();
  const [detailsError, setDetailsError] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] } | undefined>();



  function setCriteriaInfo(crit: IAcceptanceCriteria, passedDetails?: CriteriaDetailDocument) {
    const getData = () => {
      switch (crit.type) {
        case 'text':
          return passedDetails?.text;
        case 'scenario':
          return passedDetails?.scenario;
        case 'checklist':
          return passedDetails?.checklist;
      }
    };
    dispatch({ type: 'SET_TYPE', data: crit.type });
    setIdentity(crit.requiredApprover);
    setTitle(crit.title);
    setCriteria(crit);
    if (passedDetails !== undefined) {
      dispatch({
        type: 'SET_CRITERIA',
        data: getData()
      });
      setDetails(passedDetails);
      setDetailsError(passedDetails === undefined && details === undefined);
    }

    if (
      crit.state === AcceptanceCriteriaState.Approved ||
      crit.state === AcceptanceCriteriaState.Completed
    ) {
      setIsReadOnly(true);
    }
  }

  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        WebLogger.information('Loaded criteria panel...');
        await DevOps.ready();

        loadTheme(createTheme(appTheme));
        const config = DevOps.getConfiguration() as
          | (CriteriaPanelConfig & { panel: any })
          | undefined;
        if (config && config.panel) {
          if (config.isReadOnly) {
            setIsReadOnly(true);
          }
          if (config.canEdit !== undefined) {
            setCanEdit(config.canEdit);
          }

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
                    config.isReadOnly &&
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

  const dismiss = () => {
    const config = DevOps.getConfiguration();
    if (config.panel) {
      const res: CriteriaModalResult = {
        result: 'CANCEL',
        wasChanged
      };
      config.panel.close(res);
    }
  };
  const save = async () => {
    const config = DevOps.getConfiguration();
    if (config.panel) {
      const schema = getSchema(panelState.type, settings?.requireApprovers || false);
      const ac = getCriteriaPayload();
      try {
        await schema.validate(
          {
            ...ac.criteria,
            ...ac.details
          },
          { abortEarly: false }
        );
        setErrors(undefined);
        const res: CriteriaModalResult = {
          result: 'SAVE',
          data: ac
        };
        config.panel.close(res);
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const data = parseValidationError(error);
          setErrors(data);
        } else {
          console.error(error);
        }
      }
    }
  };

  const getCriteriaPayload = (): {
    criteria: IAcceptanceCriteria;
    details: CriteriaDetailDocument;
  } => {
    const id = criteria?.id || 'unset';
    const ac: IAcceptanceCriteria = {
      id: id,
      requiredApprover: identity,
      state: criteria?.state || AcceptanceCriteriaState.New,
      type: panelState.type,
      title: title
    };

    const acd: CriteriaDetailDocument = {
      __etag: details?.__etag,
      id: id,
      text: panelState.type === 'text' ? panelState.text : undefined,
      checklist: panelState.type === 'checklist' ? panelState.checklist : undefined,
      scenario: panelState.type === 'scenario' ? panelState.scenario : undefined
    };

    return {
      criteria: ac,
      details: acd
    };
  };

  const editContent = (
    <>
      <div className="rhythm-vertical-8 flex-grow border-bottom-light padding-bottom-16">
        <FormItem
          label="Title"
          error={hasError(errors, 'title')}
          message={getCombined(errors, 'title')}
        >
          <TextField
            width={TextFieldWidth.auto}
            placeholder="Short title.."
            value={title}
            maxLength={100}
            onChange={e => {
              setTitle(e.target.value);
            }}
          />
        </FormItem>
        <FormItem
          label="Required Approver"
          error={hasError(errors, 'requiredApprover')}
          message={getCombined(errors, 'requiredApprover')}
        >
          <IdentityPicker
            localStorageKey={LocalStorageRawKeys.HostUrl}
            identity={identity}
            onChange={i => {
              setIdentity(i);
            }}
            onClear={() => setIdentity(undefined)}
          />
        </FormItem>
        <FormItem label="Criteria Type" className="flex-grow">
          <Dropdown
            disabled={isReadOnly}
            placeholder="Select an Option"
            items={criteriaTypeItemsFiltered}
            selection={typeSelection}
            onSelect={(_, i) => dispatch({ type: 'SET_TYPE', data: i.id })}
            renderItem={(
              rowIndex: number,
              columnIndex: number,
              tableColumn: ITableColumn<IListBoxItem>,
              tableItem: IListBoxItem
            ) => {
              const date: any = tableItem.data;
              return (
                <SimpleTableCell key={tableItem.id} columnIndex={columnIndex}>
                  <div className="flex-column justify-center">
                    <CriteriaTypeDisplay type={tableItem.id as CriteriaTypes} />
                    {tableItem.disabled && (
                      <span className="font-size-xs error-text margin-top-4">
                        This criteria type is disallowed by setting set by a project admin
                      </span>
                    )}
                  </div>
                </SimpleTableCell>
              );
            }}
          />
        </FormItem>
        {/* <FormItem label="Tags" className="flex-grow">
          <InternalTagPicker />
        </FormItem> */}
      </div>

      <ConditionalChildren renderChildren={panelState.type === 'scenario'}>
        <ScenarioCriteria errors={errors} />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={panelState.type === 'text'}>
        <TextCriteriaSection errors={errors} />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={panelState.type === 'checklist'}>
        <CheckListCriteriaSection errors={errors} />
      </ConditionalChildren>
    </>
  );

  const showEditButton =
    canEdit &&
    criteria?.state !== AcceptanceCriteriaState.Completed &&
    criteria?.state !== AcceptanceCriteriaState.Approved;

  return (
    <PanelWrapper
      rootClassName="custom-scrollbar scroll-hidden"
      contentClassName="full-height h-scroll-hidden"
      cancelButton={{ text: 'Close', onClick: () => dismiss() }}
      okButton={
        isReadOnly
          ? showEditButton
            ? {
                text: 'Edit',
                primary: true,
                onClick: () => setIsReadOnly(false),
                iconProps: { iconName: 'Edit' }
              }
            : undefined
          : {
              text: 'Save',
              primary: true,
              onClick: () => save(),
              iconProps: { iconName: 'Save' }
            }
      }
      showVersion={!isReadOnly}
      moduleVersion={process.env.CRITERIA_PANEL_VERSION}
    >
      <ConditionalChildren
        renderChildren={historyEvents !== undefined && historyEvents.items.length > 0 && isReadOnly}
      >
        <Surface background={SurfaceBackground.callout}>
          <TabBar
            tabSize={TabSize.Compact}
            onSelectedTabChanged={t => setTabId(t)}
            selectedTabId={tabId}
            className="margin-bottom-16"
          >
            <Tab id="details" name="Details" iconProps={{ iconName: 'Page' }} />
            <Tab
              id="history"
              name="History"
              badgeCount={historyEvents?.items.length}
              iconProps={{ iconName: 'History' }}
            />
          </TabBar>
        </Surface>
      </ConditionalChildren>

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
          <ConditionalChildren renderChildren={isReadOnly}>
            {criteria && (
              <ReadOnlyView
                criteria={criteria}
                details={details}
                canApproveCriteria={canApprove}
                criteriaService={criteriaService}
                onDataChange={(
                  crit: IAcceptanceCriteria,
                  passedDetails?: CriteriaDetailDocument
                ) => {
                  setCriteriaInfo(crit, passedDetails);
                }}
                workItemId={workItemId}
              />
            )}
          </ConditionalChildren>

          <ConditionalChildren renderChildren={!isReadOnly}>{editContent}</ConditionalChildren>
        </ConditionalChildren>
      </ConditionalChildren>
      <ConditionalChildren renderChildren={tabId === 'history' && historyEvents !== undefined}>
        {historyEvents && <HistoryList events={historyEvents} />}
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default CriteriaPanel;
