import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { useMemo } from 'react';

import { capitalizeFirstLetter } from '../common';
import { getRawLocalItem, LocalStorageRawKeys } from '../localStorage';
import { criteriaIcons, CriteriaTypes } from '../types';

const CriteriaTypeDisplay = ({
  type,
  title,
  iconOnly = false,
  size = 16
}: {
  type: CriteriaTypes;
  title?: string;
  iconOnly?: boolean;
  size?: number;
}): JSX.Element => {
  const iconUrl = useMemo(() => {
    const mapping = criteriaIcons.get(type);
    if (!mapping) return undefined;

    return encodeURI(
      `${getRawLocalItem(LocalStorageRawKeys.HostUrlWithOrg)}/_apis/wit/workitemicons/${
        mapping.iconName
      }?color=${mapping.color}&api-version=7.1-preview.1`
    );
  }, [type]);
  const typeText = capitalizeFirstLetter(type || 'Unknown');
  return (
    <div className="flex-row flex-grow flex-center">
      {iconUrl && (
        <Tooltip text={typeText}>
          <img src={iconUrl} height={size} />
        </Tooltip>
      )}
      {iconOnly === false && (
        <span className="margin-horizontal-8 flex-grow body-m">
          <Tooltip text={title || typeText}>
            <span>{title || typeText}</span>
          </Tooltip>
        </span>
      )}
    </div>
  );
};
export default CriteriaTypeDisplay;
