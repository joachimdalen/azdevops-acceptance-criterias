import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { IVssIdentityService, PeoplePickerProvider } from 'azure-devops-extension-api/Identities';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { useObservable } from 'azure-devops-ui/Core/Observable';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IdentityPickerDropdown, IIdentity } from 'azure-devops-ui/IdentityPicker';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useEffect, useMemo, useState } from 'react';

import { AcceptanceCriteriaState, IAcceptanceCriteria } from '../common/common';
import { appTheme } from '../control/azure-devops-theme';
import { showRootComponent } from '../control/common';

const PanelContent = (): React.ReactElement => {
  const identityProvider = useMemo(() => {
    return new PeoplePickerProvider();
  }, []);

  const [identity, setIdentity] = useObservable<IIdentity | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState<AcceptanceCriteriaState>(AcceptanceCriteriaState.Unset);
  const [businessArea, setBusinessArea] = useState('');
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init().then(async () => {
      console.log('Loaded...');

      const idService = await DevOps.getService<IVssIdentityService>(
        'ms.vss-features.identity-service'
      );
      const ids = await idService.getIdentityMruAsync();
      console.log(ids);
    });
    DevOps.ready().then(() => {
      const config = DevOps.getConfiguration();
      const message = config.message || 'Custom dialog message';
      const toggleValue = !!config.initialValue;

      console.log([message, toggleValue]);

      if (config.dialog) {
        // Give the host frame the size of our dialog content so that the dialog can be sized appropriately.
        // This is the case where we know our content size and can explicitly provide it to SDK.resize. If our
        // size is dynamic, we have to make sure our frame is visible before calling SDK.resize() with no arguments.
        // In that case, we would instead do something like this:
        //
        DevOps.notifyLoadSucceeded().then(() => {
          // we are visible in this callback.
          DevOps.resize();
        });
      }
    });
  }, []);

  const dismiss = () => {
    const config = DevOps.getConfiguration();
    if (config.dialog) {
      const ac: IAcceptanceCriteria = {
        id: '1234',
        order: 4,
        requiredApprover: identity?.value,
        state: state,
        title: title,
        description: description,
        area: businessArea
      };
      config.dialog.close(ac);
    }
  };

  return (
    <div style={{ height: '500px', width: '100%' }} className="rhythm-vertical-16">
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
          items={[
            { id: AcceptanceCriteriaState.Unset, text: 'Unset' },
            { id: AcceptanceCriteriaState.Pending, text: 'Pending' },
            { id: AcceptanceCriteriaState.Approved, text: 'Approved' },
            { id: AcceptanceCriteriaState.Rejected, text: 'Rejected' }
          ]}
          onSelect={(_, i) => setState(i.id as AcceptanceCriteriaState)}
        />
      </FormItem>
      <FormItem label="Business Area">
        <Dropdown
          placeholder="Select an Option"
          items={[
            { id: 'technical', text: 'Technical' },
            { id: 'architecture', text: 'Architecture' }
          ]}
          onSelect={(_, i) => setBusinessArea(i.id)}
        />
      </FormItem>
      <FormItem label="Description">
        <TextField
          width={TextFieldWidth.auto}
          placeholder="Short description.."
          multiline
          value={description}
          onChange={(_, val) => setDescription(val)}
        />
      </FormItem>
      <Button text="Close" onClick={() => dismiss()} />
    </div>
  );
};
showRootComponent(<PanelContent />, 'panel-container');
