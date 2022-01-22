import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { appTheme, PanelWrapper, useDropdownSelection } from '@joachimdalen/azdevops-ext-core';
import { PeoplePickerProvider } from 'azure-devops-extension-api/Identities';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { useObservable } from 'azure-devops-ui/Core/Observable';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IdentityPickerDropdown, IIdentity } from 'azure-devops-ui/IdentityPicker';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { CriteriaModalResult } from '../common/common';
import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../common/types';
import RuleCriteriaSection from './components/RuleCriteriaSection';
import ScenarioCriteria from './components/ScenarioCriteria';
import { useCriteriaPanelContext } from './CriteriaPanelContext';
import CustomCriteriaSection from './components/CustomCriteriaSection';
type NullableString = string | undefined;
const CriteriaPanel = (): React.ReactElement => {
  const { state: panelState, dispatch } = useCriteriaPanelContext();
  const identityProvider = useMemo(() => {
    return new PeoplePickerProvider();
  }, []);

  const [isReadOnly, setIsReadOnly] = useState(false);

  const [identity, setIdentity] = useObservable<IIdentity | undefined>(undefined);

  const [state, setState] = useState<AcceptanceCriteriaState>(AcceptanceCriteriaState.Unset);

  const [loading, setLoading] = useState(true);
  const dropdownItems: IListBoxItem<any>[] = [
    { id: AcceptanceCriteriaState.Unset, text: 'Unset' },
    { id: AcceptanceCriteriaState.Pending, text: 'Pending' },
    { id: AcceptanceCriteriaState.Approved, text: 'Approved' },
    { id: AcceptanceCriteriaState.Rejected, text: 'Rejected' }
  ];

  const typeItems: IListBoxItem<any>[] = [
    { id: 'scenario', text: 'Scenario Based' },
    { id: 'rule', text: 'Rule Based' },
    { id: 'custom', text: 'Simple' }
  ];
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init({
      loaded: false,
      applyTheme: true
    }).then(async () => {
      console.log('Loaded...');
      DevOps.resize();
    });
    DevOps.ready().then(() => {
      const config = DevOps.getConfiguration();
      console.log(config);
      if (config.panel) {
        if (config.isReadOnly) {
          setIsReadOnly(true);
        }
        if (config.criteria) {
          const criteria = config.criteria as IAcceptanceCriteria;
          console.log('Setting criteria', criteria);

          setState(criteria.state);
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

  const stateSelection = useDropdownSelection(dropdownItems, state);

  const typeSelection = useDropdownSelection(typeItems, panelState.type);

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
        requiredApprover: identity?.value,
        state: state,
        type: panelState.type,
        custom: panelState.type === 'custom' ? panelState.custom : undefined,
        rule: panelState.type === 'rule' ? panelState.rule : undefined,
        scenario: panelState.type === 'scenario' ? panelState.scenario : undefined
      };

      const res: CriteriaModalResult = {
        result: 'SAVE',
        criteria: ac
      };
      console.log(res);
      //   config.panel.close(res);
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
      <div className="rhythm-vertical-16 flex-grow border-bottom-light padding-bottom-16">
        <div className="flex-row flex-grow rhythm-horizontal-16">
          <FormItem label="Type" className="flex-grow">
            <Dropdown
              disabled={isReadOnly}
              placeholder="Select an Option"
              items={typeItems}
              selection={typeSelection}
              onSelect={(_, i) => dispatch({ type: 'SET_TYPE', data: i.id })}
            />
          </FormItem>
          <FormItem label="Status" className="flex-grow">
            <Dropdown
              disabled={isReadOnly}
              placeholder="Select an Option"
              items={dropdownItems}
              selection={stateSelection}
              onSelect={(_, i) => setState(i.id as AcceptanceCriteriaState)}
            />
          </FormItem>
        </div>

        <FormItem label="Required Approver">
          <IdentityPickerDropdown
            disabled={isReadOnly}
            pickerProvider={identityProvider}
            value={identity}
            onChange={identity => setIdentity(identity)}
          />
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

  // return (
  //   <div className="flex-column flex-grow">
  //     <div className="flex-grow">
  //       <div className="rhythm-vertical-16 flex-grow">
  //         <FormItem label="Required Approver">
  //           <IdentityPickerDropdown
  //             pickerProvider={identityProvider}
  //             value={identity}
  //             onChange={identity => setIdentity(identity)}
  //           />
  //         </FormItem>
  //         <FormItem label="Title">
  //           <TextField
  //             width={TextFieldWidth.auto}
  //             placeholder="Acceptance title.."
  //             value={title}
  //             onChange={(_, val) => setTitle(val)}
  //           />
  //         </FormItem>
  //         <FormItem label="Status">
  //           <Dropdown
  //             placeholder="Select an Option"
  //             items={dropdownItems}
  //             selection={stateSelection}
  //             onSelect={(_, i) => setState(i.id as AcceptanceCriteriaState)}
  //           />
  //         </FormItem>
  //         <FormItem label="Business Area">
  //           <Dropdown
  //             placeholder="Select an Option"
  //             items={areaItems}
  //             selection={areaSelection}
  //             onSelect={(_, i) => setBusinessArea(i.id)}
  //           />
  //         </FormItem>
  //         <FormItem label="Description">
  //           <TextField
  //             width={TextFieldWidth.auto}
  //             placeholder="Short description.."
  //             multiline
  //             value={description}
  //             rows={5}
  //             onChange={(_, val) => setDescription(val)}
  //           />
  //         </FormItem>
  //       </div>
  //     </div>
  //     <ButtonGroup className="justify-space-between flex-center margin-bottom-16">
  //       <Button text="Close" onClick={() => dismiss()} />
  //       <Button text="Save" primary iconProps={{ iconName: 'Save' }} onClick={() => save()} />
  //     </ButtonGroup>
  //   </div>
  // );
};

export default CriteriaPanel;
