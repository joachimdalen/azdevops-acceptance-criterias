import classNames from 'classnames';

import { AcceptanceCriteriaState } from '../../common/types';

export interface StatusTagProps {
  state: AcceptanceCriteriaState;
}

const StatusTag = ({ state }: StatusTagProps): React.ReactElement => {
  const getDisplayName = (state: AcceptanceCriteriaState) => {
    switch (state) {
      case AcceptanceCriteriaState.AwaitingApproval:
        return 'Awaiting Approval';
      default:
        return state;
    }
  };
  return (
    <span className={classNames('status-tag', [`status-tag-${state}`])}>
      <div className="status-tag-indicator"></div>
      {getDisplayName(state)}
    </span>
  );
};
export default StatusTag;
