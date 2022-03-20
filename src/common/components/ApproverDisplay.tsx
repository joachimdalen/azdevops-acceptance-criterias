import { getInitials, Persona, PersonaSize } from '@fluentui/react';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { Icon } from 'azure-devops-ui/Icon';
import { useMemo } from 'react';

import { getRawLocalItem, LocalStorageRawKeys } from '../localStorage';

const ApproverDisplay = ({ approver }: { approver?: IInternalIdentity }): JSX.Element => {
  const imageUrl = useMemo(() => {
    const baseUrl = getRawLocalItem(LocalStorageRawKeys.HostUrl);
    const url = baseUrl === undefined ? '' : baseUrl;
    const imageUrl = approver?.image?.startsWith(url)
      ? approver?.image
      : `${url}${approver?.image}`;
    return imageUrl;
  }, [approver]);

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
      imageUrl={imageUrl}
    />
  );
};
export default ApproverDisplay;
