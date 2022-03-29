import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { appTheme } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import { isLoggedInUser } from '@joachimdalen/azdevops-ext-core/IdentityUtils';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { useDropdownSelection } from '@joachimdalen/azdevops-ext-core/useDropdownSelection';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useMemo, useState } from 'react';

import { CriteriaModalResult, criteriaTypeItems } from '../common/common';
import ApproverDisplay from '../common/components/ApproverDisplay';
import StatusTag from '../common/components/StatusTag';
import { LocalStorageRawKeys } from '../common/localStorage';
import CriteriaService from '../common/services/CriteriaService';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  CriteriaPanelConfig,
  IAcceptanceCriteria
} from '../common/types';
import CustomCriteriaSection from './components/CustomCriteriaSection';
import ProcessingContainer from './components/ProcessingContainer';
import ScenarioCriteria from './components/ScenarioCriteriaSection';
import CustomCriteriaViewSection from './components/view/CustomCriteriaViewSection';
import ScenarioCriteriaViewSection from './components/view/ScenarioCriteriaViewSection';
import { useCriteriaPanelContext } from './CriteriaPanelContext';

const CriteriaPanel = (): React.ReactElement => {
  const { state: panelState, dispatch } = useCriteriaPanelContext();
  const criteriaService = useMemo(() => new CriteriaService(), []);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [identity, setIdentity] = useState<IInternalIdentity | undefined>(undefined);
  const [title, setTitle] = useState<string>('');
  const [criteria, setCriteria] = useState<IAcceptanceCriteria | undefined>();
  const [details, setDetails] = useState<CriteriaDetailDocument>();
  const [canApprove, toggleCanApprove] = useBooleanToggle();
  const [loading, setLoading] = useState(true);
  const [workItemId, setWorkItemId] = useState<string | undefined>();
  const [wasChanged, toggleWasChanged] = useBooleanToggle();
  const [editAfterComplete, toggleEditAfterComplete] = useBooleanToggle();
  const [detailsError, setDetailsError] = useState<boolean>(false);

  function setCriteriaInfo(crit: IAcceptanceCriteria, details?: CriteriaDetailDocument) {
    dispatch({ type: 'SET_TYPE', data: crit.type });
    setIdentity(crit.requiredApprover);
    setTitle(crit.title);
    setCriteria(crit);
    dispatch({
      type: 'SET_CRITERIA',
      data: crit.type === 'scenario' ? details?.scenario : details?.custom
    });
    setDetails(details);
    setDetailsError(details === undefined);

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
          if (config.criteria) {
            const conCrit = config.criteria as IAcceptanceCriteria;
            const details = await criteriaService.getCriteriaDetails(conCrit.id);
            setCriteriaInfo(conCrit, details);

            if (
              conCrit.state === AcceptanceCriteriaState.AwaitingApproval &&
              conCrit.requiredApprover !== undefined
            ) {
              const teams = await criteriaService.getUserTeams();
              if (isLoggedInUser(conCrit.requiredApprover)) {
                toggleCanApprove(true);
              } else if (teams.some(y => y.id === conCrit.requiredApprover?.id)) {
                toggleCanApprove(true);
              }
            }
          }
          setWorkItemId(config.workItemId);
        }
        setLoading(false);
        await DevOps.notifyLoadSucceeded();
        DevOps.resize();
      } catch (error) {
        WebLogger.error('Failed to get project configuration', error);
      } finally {
        setLoading(false);
      }
    }

    initModule();
  }, []);

  const typeSelection = useDropdownSelection(criteriaTypeItems, panelState.type);

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
  const save = () => {
    const config = DevOps.getConfiguration();
    if (config.panel) {
      const ac = getCriteriaPayload();
      const res: CriteriaModalResult = {
        result: 'SAVE',
        data: ac
      };
      config.panel.close(res);
    }
  };

  const getCriteriaPayload = (): {
    criteria: IAcceptanceCriteria;
    details: CriteriaDetailDocument;
  } => {
    const id = criteria?.id || "unset";
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
      custom: panelState.type === 'custom' ? panelState.custom : undefined,
      scenario: panelState.type === 'scenario' ? panelState.scenario : undefined
    };

    return {
      criteria: ac,
      details: acd
    };
  };

  async function processCriteria(id: string, approve: boolean) {
    if (workItemId) {
      const result = await criteriaService.processCriteria(workItemId, id, approve);
      if (result !== undefined) {
        toggleWasChanged(true);
        setCriteriaInfo(result.criteria, result.details);
      }
    }
  }

  const editContent = (
    <>
      <div className="rhythm-vertical-8 flex-grow border-bottom-light padding-bottom-16">
        <FormItem label="Title">
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
        <FormItem label="Criteira Type" className="flex-grow">
          <Dropdown
            disabled={isReadOnly}
            placeholder="Select an Option"
            items={criteriaTypeItems}
            selection={typeSelection}
            onSelect={(_, i) => dispatch({ type: 'SET_TYPE', data: i.id })}
          />
        </FormItem>
        <FormItem label="Required Approver">
          <IdentityPicker
            localStorageKey={LocalStorageRawKeys.HostUrl}
            identity={identity}
            onChange={i => {
              setIdentity(i);
            }}
            onClear={() => setIdentity(undefined)}
          />
        </FormItem>
        {/* <FormItem label="Tags" className="flex-grow">
          <InternalTagPicker />
        </FormItem> */}
      </div>

      <ConditionalChildren renderChildren={panelState.type === 'scenario'}>
        <ScenarioCriteria />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={panelState.type === 'custom'}>
        <CustomCriteriaSection />
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
              iconProps: { iconName: 'Save' },
              disabled: !panelState.isValid || title === ''
            }
      }
      showVersion={!isReadOnly}
      moduleVersion={process.env.CRITERIA_PANEL_VERSION}
    >
      <ConditionalChildren renderChildren={!loading}>
        <ConditionalChildren renderChildren={detailsError}>
          <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Error}>
            Failed to load critiera details.
          </MessageCard>
        </ConditionalChildren>
        <ConditionalChildren renderChildren={isReadOnly}>
          {criteria && (
            <>
              <div className="rhythm-vertical-16 flex-grow border-bottom-light padding-bottom-16">
                <ConditionalChildren
                  renderChildren={
                    (criteria.state === AcceptanceCriteriaState.Approved ||
                      criteria.state === AcceptanceCriteriaState.Rejected ||
                      criteria.state === AcceptanceCriteriaState.Completed) &&
                    editAfterComplete === false &&
                    canEdit
                  }
                >
                  <MessageCard
                    className="flex-self-stretch"
                    severity={MessageCardSeverity.Info}
                    buttonProps={[
                      {
                        text: 'Edit',
                        onClick: () => {
                          toggleEditAfterComplete();
                          setIsReadOnly(false);
                        }
                      }
                    ]}
                  >
                    {`This criteria has already been ${criteria.state}. You can still edit it, but it may reset history and progress.`}
                  </MessageCard>
                </ConditionalChildren>
                <div className="flex-row rhythm-horizontal-8">
                  <FormItem label="Required Approver" className="flex-grow">
                    <ApproverDisplay approver={criteria?.requiredApprover} />
                  </FormItem>

                  <FormItem label="State" className="flex-grow">
                    <StatusTag state={criteria.state} />
                  </FormItem>
                </div>
                <ConditionalChildren
                  renderChildren={
                    criteria.state === AcceptanceCriteriaState.Approved ||
                    criteria.state === AcceptanceCriteriaState.Rejected
                  }
                >
                  <div className="flex-row rhythm-horizontal-8">
                    <ConditionalChildren
                      renderChildren={details?.processed?.processedBy !== undefined}
                    >
                      <FormItem
                        label={
                          criteria.state === AcceptanceCriteriaState.Approved
                            ? 'Approved by'
                            : 'Rejected by'
                        }
                        className="flex-grow"
                      >
                        <ApproverDisplay approver={details?.processed?.processedBy} />
                      </FormItem>
                    </ConditionalChildren>
                  </div>
                </ConditionalChildren>
              </div>
              <ConditionalChildren
                renderChildren={
                  canApprove &&
                  workItemId !== undefined &&
                  criteria.state === AcceptanceCriteriaState.AwaitingApproval
                }
              >
                <ProcessingContainer processCriteria={processCriteria} criteriaId={criteria.id} />
              </ConditionalChildren>
              <ConditionalChildren
                renderChildren={criteria.type === 'scenario' && details !== undefined}
              >
                {details?.scenario && <ScenarioCriteriaViewSection details={details} />}
              </ConditionalChildren>
              <ConditionalChildren
                renderChildren={criteria.type === 'custom' && details !== undefined}
              >
                {details?.custom && <CustomCriteriaViewSection details={details} />}
              </ConditionalChildren>
            </>
          )}
        </ConditionalChildren>
        <ConditionalChildren renderChildren={!isReadOnly}>{editContent}</ConditionalChildren>
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default CriteriaPanel;
