import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { PeoplePickerProvider } from 'azure-devops-extension-api/Identities';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { useObservable } from 'azure-devops-ui/Core/Observable';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IdentityPickerDropdown, IIdentity } from 'azure-devops-ui/IdentityPicker';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useMemo, useState } from 'react';

import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../common/common';
import useDropdownSelection from '../common/hooks/useDropdownSelection';
import { CriteriaModalResult } from '../common/services/CriteriaNavigationService';
import { appTheme } from '../wi-control/azure-devops-theme';
import { showRootComponent } from '../wi-control/common';
type NullableString = string | undefined;
const PanelContent = (): React.ReactElement => {
  const identityProvider = useMemo(() => {
    return new PeoplePickerProvider();
  }, []);

  const [identity, setIdentity] = useObservable<IIdentity | undefined>(undefined);
  const [title, setTitle] = useState<NullableString>('');
  const [description, setDescription] = useState<NullableString>('');
  const [state, setState] = useState<AcceptanceCriteriaState>(AcceptanceCriteriaState.Unset);
  const [businessArea, setBusinessArea] = useState<NullableString>('');
  const [loading, setLoading] = useState(true);
  const dropdownItems = [
    { id: AcceptanceCriteriaState.Unset, text: 'Unset' },
    { id: AcceptanceCriteriaState.Pending, text: 'Pending' },
    { id: AcceptanceCriteriaState.Approved, text: 'Approved' },
    { id: AcceptanceCriteriaState.Rejected, text: 'Rejected' }
  ];
  const areaItems = [
    { id: 'technical', text: 'Technical' },
    { id: 'architecture', text: 'Architecture' }
  ];
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init().then(async () => {
      console.log('Loaded...');
    });
    DevOps.ready().then(() => {
      const config = DevOps.getConfiguration();
      console.log(config);
      if (config.dialog) {
        if (config.criteria) {
          const criteria = config.criteria as IAcceptanceCriteria;
          console.log('Setting criteria', criteria);
          setTitle(criteria.title);
          setBusinessArea(criteria.area);
          setDescription(criteria.description);
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
  const areaSelection = useDropdownSelection(areaItems, businessArea?.toLowerCase());

  const dismiss = () => {
    const config = DevOps.getConfiguration();
    if (config.dialog) {
      const res: CriteriaModalResult = {
        result: 'CANCEL'
      };
      config.dialog.close(res);
    }
  };
  const save = () => {
    const config = DevOps.getConfiguration();
    if (config.dialog) {
      const ac: IAcceptanceCriteria = {
        id: '1234',
        order: 4,
        requiredApprover: identity?.value,
        state: state,
        title: title || '',
        description: description,
        area: businessArea
      };

      const res: CriteriaModalResult = {
        result: 'SAVE',
        criteria: ac
      };
      config.dialog.close(res);
    }
  };

  return (
    <div className="flex-grow">
      <ConditionalChildren renderChildren={!loading}>
        <div className="rhythm-vertical-16 flex-grow">
          <FormItem label="Required Approver">
            <IdentityPickerDropdown
              pickerProvider={identityProvider}
              value={identity}
              onChange={identity => setIdentity(identity)}
            />
          </FormItem>
          <FormItem label="Title">
            <TextField
              width={TextFieldWidth.auto}
              placeholder="Acceptance title.."
              value={title}
              onChange={(_, val) => setTitle(val)}
            />
          </FormItem>
          <FormItem label="Status">
            <Dropdown
              placeholder="Select an Option"
              items={dropdownItems}
              selection={stateSelection}
              onSelect={(_, i) => setState(i.id as AcceptanceCriteriaState)}
            />
          </FormItem>
          <FormItem label="Business Area">
            <Dropdown
              placeholder="Select an Option"
              items={areaItems}
              selection={areaSelection}
              onSelect={(_, i) => setBusinessArea(i.id)}
            />
          </FormItem>
          <FormItem label="Description">
            <TextField
              width={TextFieldWidth.auto}
              placeholder="Short description.."
              multiline
              value={description}
              rows={5}
              onChange={(_, val) => setDescription(val)}
            />
          </FormItem>
        </div>
        <ButtonGroup className="justify-space-between margin-top-16">
          <Button text="Close" onClick={() => dismiss()} />
          <Button text="Save" primary iconProps={{ iconName: 'Save' }} onClick={() => save()} />
        </ButtonGroup>
      </ConditionalChildren>
    </div>
  );
};
showRootComponent(<PanelContent />, 'panel-container');
