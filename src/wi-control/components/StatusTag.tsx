import classNames from 'classnames';

import { AcceptanceCriteriaState } from '../../common/types';

export interface StatusTagProps {
  state: AcceptanceCriteriaState;
}

const StatusTag = ({ state }: StatusTagProps): React.ReactElement => {
  return (
    <span className={classNames('status-tag', [`status-tag-${state}`])}>
      <div className="status-tag-indicator"></div>
      {state}
    </span>
  );
};
export default StatusTag;
