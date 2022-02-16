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
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { CriteriaModalResult, criteriaTypeItems } from '../common/common';
import ApproverDisplay from '../common/components/ApproverDisplay';
import StatusTag from '../common/components/StatusTag';
import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../common/types';
import CustomCriteriaSection from './components/CustomCriteriaSection';
import { InternalTagPicker } from './components/InternalTagPicker';
import ScenarioCriteria from './components/ScenarioCriteriaSection';
import CustomCriteriaViewSection from './components/view/CustomCriteriaViewSection';
import ScenarioCriteriaViewSection from './components/view/ScenarioCriteriaViewSection';
import { useCriteriaPanelContext } from './CriteriaPanelContext';
const CriteriaPanel = (): React.ReactElement => {
  const { state: panelState, dispatch } = useCriteriaPanelContext();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [identity, setIdentity] = useState<IInternalIdentity | undefined>(undefined);
  const [criteria, setCriteria] = useState<IAcceptanceCriteria | undefined>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init({
      loaded: false,
      applyTheme: true
    }).then(async () => {
      WebLogger.information('Loaded criteria panel...');
      DevOps.resize();
    });
    DevOps.ready().then(() => {
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
          dispatch({ type: 'SET_TYPE', data: conCrit.type });
          dispatch({
            type: 'SET_CRITERIA',
            data: conCrit.type === 'scenario' ? conCrit.scenario : conCrit.custom
          });
        }

        DevOps.notifyLoadSucceeded().then(() => {
          // we are visible in this callback.
          setLoading(false);
          DevOps.resize();
        });
      }
    });
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
        criteria: ac
      };
      config.panel.close(res);
    }
  };

  const getCriteriaPayload = () => {
    const ac: IAcceptanceCriteria = {
      id: criteria?.id || uuidV4(),
      requiredApprover: identity,
      state: criteria?.state || AcceptanceCriteriaState.New,
      type: panelState.type,
      custom: panelState.type === 'custom' ? panelState.custom : undefined,
      scenario: panelState.type === 'scenario' ? panelState.scenario : undefined
    };

    return ac;
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
                      renderChildren={criteria.processed?.processedBy !== undefined}
                    >
                      <FormItem
                        label={
                          criteria.state === AcceptanceCriteriaState.Approved
                            ? 'Approved by'
                            : 'Rejected by'
                        }
                        className="flex-grow"
                      >
                        <ApproverDisplay approver={criteria.processed?.processedBy} />
                      </FormItem>
                    </ConditionalChildren>
                  </div>
                </ConditionalChildren>
              </div>
              <ConditionalChildren renderChildren={criteria.type === 'scenario'}>
                {criteria.scenario && <ScenarioCriteriaViewSection criteria={criteria} />}
              </ConditionalChildren>
              <ConditionalChildren renderChildren={criteria.type === 'custom'}>
                {criteria.custom && <CustomCriteriaViewSection criteria={criteria} />}
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
