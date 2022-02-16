import { getInitials, Persona, PersonaSize } from '@fluentui/react';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { Icon } from 'azure-devops-ui/Icon';

const ApproverDisplay = ({ approver }: { approver?: IInternalIdentity }): JSX.Element => {
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
      imageUrl={approver.image}
    />
  );
};
export default ApproverDisplay;
