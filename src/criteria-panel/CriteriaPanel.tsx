import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
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
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { CriteriaModalResult, criteriaTypeItems } from '../common/common';
import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../common/types';
import CustomCriteriaSection from './components/CustomCriteriaSection';
import RuleCriteriaSection from './components/RuleCriteriaSection';
import ScenarioCriteria from './components/ScenarioCriteriaSection';
import { useCriteriaPanelContext } from './CriteriaPanelContext';
import { InternalTagPicker } from './components/InternalTagPicker';

const CriteriaPanel = (): React.ReactElement => {
  const { state: panelState, dispatch } = useCriteriaPanelContext();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [identity, setIdentity] = useState<IInternalIdentity | undefined>(undefined);

  const [loading, setLoading] = useState(true);
  const dropdownItems: IListBoxItem<any>[] = [
    { id: AcceptanceCriteriaState.New, text: 'New' },
    { id: AcceptanceCriteriaState.Completed, text: 'Completed' },
    { id: AcceptanceCriteriaState.Approved, text: 'Approved' },
    { id: AcceptanceCriteriaState.Rejected, text: 'Rejected' }
  ];

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
          const criteria = config.criteria as IAcceptanceCriteria;
          setIdentity(criteria.requiredApprover);
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
      const ac: IAcceptanceCriteria = {
        id: uuidV4(),
        requiredApprover: identity,
        state: AcceptanceCriteriaState.New,
        type: panelState.type,
        custom: panelState.type === 'custom' ? panelState.custom : undefined,
        rule: panelState.type === 'rule' ? panelState.rule : undefined,
        scenario: panelState.type === 'scenario' ? panelState.scenario : undefined
      };

      const res: CriteriaModalResult = {
        result: 'SAVE',
        criteria: ac
      };
      config.panel.close(res);
    }
  };

  return (
    <PanelWrapper
      cancelButton={{ text: 'Close', onClick: () => dismiss() }}
      okButton={{
        text: 'Save',
        primary: true,
        onClick: () => save(),
        iconProps: { iconName: 'Save' },
        disabled: !panelState.isValid
      }}
      moduleVersion={process.env.CRITERIA_PANEL_VERSION}
    >
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
      <ConditionalChildren renderChildren={panelState.type === 'rule'}>
        <RuleCriteriaSection />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={panelState.type === 'custom'}>
        <CustomCriteriaSection />
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default CriteriaPanel;