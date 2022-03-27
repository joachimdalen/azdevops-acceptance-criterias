import classNames from 'classnames';

import { FullCriteriaStatus } from '../../common/types';

export interface FullStatusTagProps {
  state: FullCriteriaStatus;
}

const FullStatusTag = ({ state }: FullStatusTagProps): React.ReactElement => {
  return (
    <span className={classNames('status-tag', [`status-tag-${state}`])}>
      <div className="status-tag-indicator"></div>
      {state}
    </span>
  );
};
export default FullStatusTag;
