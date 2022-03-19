import { getInitials, Persona, PersonaSize } from '@fluentui/react';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { Icon } from 'azure-devops-ui/Icon';

import { getRawLocalItem, LocalStorageRawKeys } from '../localStorage';

const ApproverDisplay = ({ approver }: { approver?: IInternalIdentity }): JSX.Element => {
  const baseUrl = getRawLocalItem(LocalStorageRawKeys.HostUrl);
  const url = baseUrl === undefined ? '' : baseUrl;

  if (approver === undefined) {
    return (
      <div className="secondary-text">
        <Icon iconName="Contact" />
        <span className="margin-left-8">Unassigned</span>
      </div>
    );
  }

  return (
    <Persona
      text={approver.displayName}
      size={PersonaSize.size24}
      imageInitials={getInitials(approver.displayName, false)}
      imageUrl={`${url}${approver.image}`}
    />
  );
};
export default ApproverDisplay;
