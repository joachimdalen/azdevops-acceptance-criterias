import classNames from 'classnames';

import { FullCriteriaStatus } from '../../common/types';

export interface FullStatusTagProps {
  state: FullCriteriaStatus;
}

const FullStatusTag = ({ state }: FullStatusTagProps): React.ReactElement => {
  const getDisplayName = (state: FullCriteriaStatus) => {
    switch (state) {
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
export default FullStatusTag;
