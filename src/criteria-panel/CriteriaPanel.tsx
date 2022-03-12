import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { appTheme } from '@joachimdalen/azdevops-ext-core/azure-devops-theme';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { useDropdownSelection } from '@joachimdalen/azdevops-ext-core/useDropdownSelection';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { CriteriaModalResult, criteriaTypeItems } from '../common/common';
import ApproverDisplay from '../common/components/ApproverDisplay';
import StatusTag from '../common/components/StatusTag';
import CriteriaService from '../common/services/CriteriaService';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  IAcceptanceCriteria
} from '../common/types';
import CustomCriteriaSection from './components/CustomCriteriaSection';
import { InternalTagPicker } from './components/InternalTagPicker';
import ScenarioCriteria from './components/ScenarioCriteriaSection';
import CustomCriteriaViewSection from './components/view/CustomCriteriaViewSection';
import ScenarioCriteriaViewSection from './components/view/ScenarioCriteriaViewSection';
import { useCriteriaPanelContext } from './CriteriaPanelContext';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
const CriteriaPanel = (): React.ReactElement => {
  const { state: panelState, dispatch } = useCriteriaPanelContext();
  const criteriaService = useMemo(() => new CriteriaService(), []);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [identity, setIdentity] = useState<IInternalIdentity | undefined>(undefined);
  const [title, setTitle] = useState<string>('');
  const [criteria, setCriteria] = useState<IAcceptanceCriteria | undefined>();
  const [details, setDetails] = useState<CriteriaDetailDocument>();

  const [loading, setLoading] = useState(true);

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
        const config = DevOps.getConfiguration();
        if (config.panel) {
          if (config.isReadOnly) {
            setIsReadOnly(true);
          }
          if (config.canEdit !== undefined) {
            setCanEdit(config.canEdit);
          }
          if (config.criteria) {
            const conCrit = config.criteria as IAcceptanceCriteria;

            setIdentity(conCrit.requiredApprover);
            setCriteria(conCrit);

            const details = await criteriaService.getCriteriaDetails(conCrit.id);

            dispatch({
              type: 'SET_CRITERIA',
              data: conCrit.type === 'scenario' ? details.scenario : details.custom
            });
            setDetails(details);
            dispatch({ type: 'SET_TYPE', data: conCrit.type });
            setLoading(false);
          }

          await DevOps.notifyLoadSucceeded();
          DevOps.resize();
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
        result: 'CANCEL'
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
    const id = criteria?.id || uuidV4();
    const ac: IAcceptanceCriteria = {
      id: id,
      requiredApprover: identity,
      state: criteria?.state || AcceptanceCriteriaState.New,
      type: panelState.type,
      title: title
    };

    const acd: CriteriaDetailDocument = {
      id: id,
      custom: panelState.type === 'custom' ? panelState.custom : undefined,
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
        <FormItem label="Type" className="flex-grow">
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
            identity={identity}
            onChange={i => {
              setIdentity(i);
              console.log(i);
            }}
            onClear={() => setIdentity(undefined)}
          />
        </FormItem>
        <FormItem label="Tags" className="flex-grow">
          <InternalTagPicker />
        </FormItem>
        <FormItem label="Title">
          <TextField
            width={TextFieldWidth.auto}
            placeholder="Short description.."
            value={title}
            maxLength={100}
            onChange={e => {
              setTitle(e.target.value);
            }}
          />
        </FormItem>
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
              disabled: !panelState.isValid
            }
      }
      showVersion={!isReadOnly}
      moduleVersion={process.env.CRITERIA_PANEL_VERSION}
    >
      <ConditionalChildren renderChildren={!loading}>
        <ConditionalChildren renderChildren={isReadOnly}>
          {criteria && (
            <>
              <div className="rhythm-vertical-16 flex-grow border-bottom-light padding-bottom-16">
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
                <ButtonGroup>
                  <Button text="Approve" primary iconProps={{ iconName: 'CheckMark' }} />
                  <Button text="Reject" danger iconProps={{ iconName: 'Cancel' }} />
                </ButtonGroup>
              </div>
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
