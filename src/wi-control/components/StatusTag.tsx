import classNames from 'classnames';

import { AcceptanceCriteriaState } from '../../common/models/IAcceptanceCriteria';
export interface StatusTagProps {
  state: AcceptanceCriteriaState;
}

const StatusTag = ({ state }: StatusTagProps): React.ReactElement => {
  const getTagColor = () => {
    switch (state) {
      case AcceptanceCriteriaState.Unset:
        return '#9b34eb';
      case AcceptanceCriteriaState.Pending:
        return 'orange';
      case AcceptanceCriteriaState.Approved:
        return 'green';
      case AcceptanceCriteriaState.Rejected:
        return 'red';
    }
  };

  return (
    <span className={classNames('status-tag', [`status-tag-${state}`])}>
      <div className="status-tag-indicator"></div>
      {state}
    </span>
  );
};
export default StatusTag;
