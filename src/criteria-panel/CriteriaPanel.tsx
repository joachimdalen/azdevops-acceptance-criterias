import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { appTheme } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import { getLoggedInUser, isLoggedInUser } from '@joachimdalen/azdevops-ext-core/IdentityUtils';
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
import * as yup from 'yup';

import { CriteriaModalResult, criteriaTypeItems } from '../common/common';
import ApproverDisplay from '../common/components/ApproverDisplay';
import StatusTag from '../common/components/StatusTag';
import { isCompleted, isProcessed } from '../common/criteriaUtils';
import { getCombined, hasError, parseValidationError } from '../common/errorUtils';
import { LocalStorageRawKeys } from '../common/localStorage';
import CriteriaService from '../common/services/CriteriaService';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  CriteriaPanelConfig,
  CriteriaTypes,
  IAcceptanceCriteria
} from '../common/types';
import CheckListCriteriaSection from './components/CheckListCriteriaSection';
import CompletionContainer from './components/CompletionContainer';
import ProcessingContainer from './components/ProcessingContainer';
import ScenarioCriteria from './components/ScenarioCriteriaSection';
import TextCriteriaSection from './components/TextCriteriaSection';
import ChecklistCriteriaViewSection from './components/view/ChecklistCriteriaViewSection';
import ScenarioCriteriaViewSection from './components/view/ScenarioCriteriaViewSection';
import TextCriteriaViewSection from './components/view/TextCriteriaViewSection';
import { useCriteriaPanelContext } from './CriteriaPanelContext';

const getSchema = (type: CriteriaTypes) => {
  const baseSchema = yup.object().shape({
    title: yup.string().required().min(4).max(300),
    requiredApprover: yup.object()
  });

  switch (type) {
    case 'checklist': {
      return baseSchema.concat(
        yup.object().shape({
          checklist: yup.object().shape({
            criterias: yup
              .array()
              .of(
                yup.object().shape({
                  text: yup.string().required().min(4)
                })
              )
              .min(1)
          })
        })
      );
    }
    case 'scenario': {
      return baseSchema.concat(
        yup.object().shape({
          scenario: yup.object().shape({
            scenario: yup.string().required().min(4),
            criterias: yup
              .array()
              .of(
                yup.object().shape({
                  text: yup.string().required().min(4)
                })
              )
              .min(1)
          })
        })
      );
    }
    case 'text': {
      return baseSchema.concat(
        yup.object().shape({
          text: yup
            .object()
            .shape({
              text: yup.string().required().min(4)
            })
            .required()
        })
      );
    }
  }
};

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
  const [errors, setErrors] = useState<{ [key: string]: string[] } | undefined>();

  function setCriteriaInfo(crit: IAcceptanceCriteria, details?: CriteriaDetailDocument) {
    const getData = () => {
      switch (crit.type) {
        case 'text':
          return details?.text;
        case 'scenario':
          return details?.scenario;
        case 'checklist':
          return details?.checklist;
      }
    };
    dispatch({ type: 'SET_TYPE', data: crit.type });
    setIdentity(crit.requiredApprover);
    setTitle(crit.title);
    setCriteria(crit);
    dispatch({
      type: 'SET_CRITERIA',
      data: getData()
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
            await checkApproval(conCrit);
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

  const checkApproval = async (criteria: IAcceptanceCriteria) => {
    if (
      criteria.state === AcceptanceCriteriaState.AwaitingApproval &&
      criteria.requiredApprover !== undefined
    ) {
      if (criteria.requiredApprover.entityType === 'User') {
        if (isLoggedInUser(criteria.requiredApprover)) {
          toggleCanApprove(true);
        }
      } else {
        const teams = await criteriaService.getUserTeams();

        if (teams.some(y => y.id === criteria.requiredApprover?.id)) {
          toggleCanApprove(true);
        } else {
          const user = await getLoggedInUser();
          if (user?.descriptor !== undefined) {
            const groups = await criteriaService.getUserGroups(user.descriptor);
            const group = groups.find(
              x => x.containerDescriptor === criteria.requiredApprover?.descriptor
            );
            if (group !== undefined) {
              toggleCanApprove(true);
            }
          }
        }
      }
    }
  };

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
  const save = async () => {
    const config = DevOps.getConfiguration();
    if (config.panel) {
      const schema = getSchema(panelState.type);
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
          console.log('not err', error);
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

  async function processCriteria(id: string, approve: boolean) {
    if (workItemId && parseInt(workItemId) > 0) {
      const result = await criteriaService.processCriteria(workItemId, id, approve);
      if (result !== undefined) {
        toggleWasChanged(true);
        setCriteriaInfo(result.criteria, result.details);
      }
    } else {
      WebLogger.error('Precondition failed');
    }
  }

  async function processCheckListCriteria(id: string, complete: boolean) {
    if (workItemId && parseInt(workItemId) > 0 && criteria?.id) {
      const result = await criteriaService.processCheckListCriteria(
        workItemId,
        criteria?.id,
        id,
        complete
      );
      if (result !== undefined) {
        setDetails(result.details);
        if (result.criteria) {
          setCriteria(result.criteria);
          await checkApproval(result.criteria);
        }
      }
    } else {
      WebLogger.error('Precondition failed ' + workItemId, criteria?.id);
    }
  }

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
        <FormItem label="Criteria Type" className="flex-grow">
          <Dropdown
            disabled={isReadOnly}
            placeholder="Select an Option"
            items={criteriaTypeItems}
            selection={typeSelection}
            onSelect={(_, i) => dispatch({ type: 'SET_TYPE', data: i.id })}
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
                  renderChildren={isCompleted(criteria) && editAfterComplete === false && canEdit}
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
                    <ApproverDisplay approver={criteria?.requiredApprover} large />
                  </FormItem>
                  <ConditionalChildren renderChildren={isProcessed(criteria, details)}>
                    <FormItem
                      label={
                        criteria.state === AcceptanceCriteriaState.Approved
                          ? 'Approved by'
                          : 'Rejected by'
                      }
                      className="flex-grow"
                    >
                      <ApproverDisplay approver={details?.processed?.processedBy} large />
                    </FormItem>
                  </ConditionalChildren>
                  <FormItem label="State" className="flex-grow">
                    <StatusTag state={criteria.state} />
                  </FormItem>
                </div>
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
              <ConditionalChildren renderChildren={criteria.state === AcceptanceCriteriaState.New}>
                <CompletionContainer criteria={criteria} />
              </ConditionalChildren>
              <ConditionalChildren
                renderChildren={criteria.type === 'scenario' && details !== undefined}
              >
                {details?.scenario && <ScenarioCriteriaViewSection details={details} />}
              </ConditionalChildren>
              <ConditionalChildren
                renderChildren={criteria.type === 'text' && details !== undefined}
              >
                {details?.text && <TextCriteriaViewSection details={details} />}
              </ConditionalChildren>
              <ConditionalChildren
                renderChildren={criteria.type === 'checklist' && details !== undefined}
              >
                {details?.checklist && (
                  <ChecklistCriteriaViewSection
                    details={details}
                    processItem={processCheckListCriteria}
                  />
                )}
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
