import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { useMemo } from 'react';

import { capitalizeFirstLetter } from '../common';
import { getRawLocalItem, LocalStorageRawKeys } from '../localStorage';
import { CriteriaTypes } from '../types';

interface IconMapping {
  [key: string]: {
    iconName: string;
    color: string;
  };
}
const mappings: IconMapping = {
  text: {
    iconName: 'icon_sticky_note',
    color: 'e6df5a'
  },
  checklist: {
    iconName: 'icon_check_box',
    color: '49b84b'
  },
  scenario: {
    iconName: 'icon_chat_bubble',
    color: '735ae6'
  }
};
const CriteriaTypeDisplay = ({
  type,
  title
}: {
  type: CriteriaTypes;
  title?: string;
}): JSX.Element => {
  const iconUrl = useMemo(() => {
    const stringType = (type as string)?.toLowerCase();

    return encodeURI(
      `${getRawLocalItem(LocalStorageRawKeys.HostUrlWithOrg)}/_apis/wit/workitemicons/${
        mappings[stringType].iconName
      }?color=${mappings[stringType].color}&api-version=7.1-preview.1`
    );
  }, [type]);
  const typeText = capitalizeFirstLetter(type || 'Unknown');
  return (
    <div className="flex-row flex-grow flex-center">
      <Tooltip text={typeText}>
        <img src={iconUrl} height={16} />
      </Tooltip>
      <span className="margin-horizontal-8 flex-grow body-m">
        <Tooltip text={title || typeText}>
          <span>{title || typeText}</span>
        </Tooltip>
      </span>
    </div>
  );
};
export default CriteriaTypeDisplay;
