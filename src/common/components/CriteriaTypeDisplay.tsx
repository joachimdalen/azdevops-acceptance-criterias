import { Icon } from 'azure-devops-ui/Icon';

import { capitalizeFirstLetter } from '../common';
import { CriteriaTypes } from '../types';

const CriteriaTypeDisplay = ({ type }: { type: CriteriaTypes }): JSX.Element => {
  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'custom':
        return 'Comment';
      case 'scenario':
        return 'Add';
    }
  };
  return (
    <div className="rhythm-horizontal-8 flex-row flex-center">
      <Icon iconName={getIcon(type)} />
      <span>{capitalizeFirstLetter(type)}</span>
    </div>
  );
};
export default CriteriaTypeDisplay;
