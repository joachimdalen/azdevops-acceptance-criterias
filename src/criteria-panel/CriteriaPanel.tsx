import './index.scss';

import { createTheme, getInitials, loadTheme, Persona, PersonaSize } from '@fluentui/react';
import {
  appTheme,
  IdentityPicker,
  IInternalIdentity,
  PanelWrapper,
  useDropdownSelection,
  webLogger
} from '@joachimdalen/azdevops-ext-core';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { TagPicker } from 'azure-devops-ui/TagPicker';
import { TextField } from 'azure-devops-ui/TextField';
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { CriteriaModalResult, criteriaTypeItems } from '../common/common';
import StatusTag from '../common/components/StatusTag';
import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../common/types';
import CustomCriteriaSection from './components/CustomCriteriaSection';
import { InternalTagPicker } from './components/InternalTagPicker';
import ScenarioCriteria from './components/ScenarioCriteriaSection';
import { useCriteriaPanelContext } from './CriteriaPanelContext';
import ScenarioCriteriaViewSection from './components/view/ScenarioCriteriaViewSection';
import { Icon } from 'azure-devops-ui/Icon';

const CriteriaPanel = (): React.ReactElement => {
  const { state: panelState, dispatch } = useCriteriaPanelContext();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [identity, setIdentity] = useState<IInternalIdentity | undefined>(undefined);
  const [criteria, setCriteria] = useState<IAcceptanceCriteria | undefined>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init({
      loaded: false,
      applyTheme: true
    }).then(async () => {
      webLogger.information('Loaded criteria panel...');
      DevOps.resize();
    });
    DevOps.ready().then(() => {
      const config = DevOps.getConfiguration();

      if (config.panel) {
        if (config.isReadOnly) {
          setIsReadOnly(true);
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

  return (
    <PanelWrapper
      cancelButton={{ text: 'Close', onClick: () => dismiss() }}
      okButton={
        isReadOnly
          ? undefined
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
              <div className="rhythm-vertical-8 flex-grow border-bottom-light padding-bottom-16">
                <div className="flex-row rhythm-horizontal-8">
                  <FormItem label="Required Approver" className="flex-grow">
                    <ConditionalChildren renderChildren={criteria.requiredApprover === undefined}>
                      <div className="secondary-text">
                        <Icon iconName="Contact" />
                        <span className="margin-left-8">Unassigned</span>
                      </div>
                    </ConditionalChildren>
                    <ConditionalChildren renderChildren={criteria.requiredApprover !== undefined}>
                      {criteria.requiredApprover && (
                        <Persona
                          text={criteria.requiredApprover.displayName}
                          size={PersonaSize.size24}
                          imageInitials={getInitials(criteria.requiredApprover.displayName, false)}
                          imageUrl={criteria.requiredApprover.image}
                        />
                      )}
                    </ConditionalChildren>
                  </FormItem>

                  <FormItem label="State" className="flex-grow">
                    <StatusTag state={criteria.state} />
                  </FormItem>
                </div>
              </div>
              <ConditionalChildren renderChildren={criteria.type === 'scenario'}>
                {criteria.scenario && <ScenarioCriteriaViewSection criteria={criteria} />}
              </ConditionalChildren>
              <ConditionalChildren renderChildren={criteria.type === 'custom'}>
                <FormItem label="Content" className="flex-grow">
                  {criteria.custom?.text}
                </FormItem>
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
