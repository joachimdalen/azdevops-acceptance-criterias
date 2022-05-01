import { Tooltip } from 'azure-devops-ui/TooltipEx';
import cx from 'classnames';

import InternalLink from '../../common/components/InternalLink';
import { WorkItemTypeTagProps } from '../../common/types';
const WorkItemTypeTag = ({
  type,
  iconUrl,
  title,
  id,
  classNames,
  iconSize = 16,
  onClick
}: WorkItemTypeTagProps & {
  id: number | string;
  title: string;
  onClick: (id: number) => Promise<void>;
}): React.ReactElement => {
  return (
    <div className={cx('flex-row flex-grow flex-center', classNames)}>
      <Tooltip text={type || 'Unknown'}>
        <img src={iconUrl} height={iconSize} />
      </Tooltip>
      <span className="margin-horizontal-8 flex-grow body-m">
        <InternalLink onClick={async () => await onClick(parseInt(id.toString()))}>
          <Tooltip text={title || 'Unknown'}>
            <span>{title || 'Unknown'}</span>
          </Tooltip>
        </InternalLink>
      </span>
    </div>
  );
};

export default WorkItemTypeTag;
