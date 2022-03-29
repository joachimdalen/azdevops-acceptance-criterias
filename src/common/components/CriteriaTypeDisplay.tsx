import { Icon } from 'azure-devops-ui/Icon';

import { capitalizeFirstLetter } from '../common';

const CriteriaTypeDisplay = ({ type }: { type: 'custom' | 'scenario' }): JSX.Element => {
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
