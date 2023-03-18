import { distinct, isDefined } from '@joachimdalen/azdevops-ext-core/CoreUtils';
import {
  getWorkItemReferenceNameFromDisplayName,
  getWorkItemTypeDisplayName,
  getWorkTypeFromReferenceName
} from '@joachimdalen/azdevops-ext-core/WorkItemUtils';
import {
  WorkItem,
  WorkItemStateColor,
  WorkItemType
} from 'azure-devops-extension-api/WorkItemTracking';

import { WorkItemTypeTagProps } from './types';

export function getWorkItemTypeMap(
  workItems: WorkItem[],
  workItemTypes: WorkItemType[]
): Map<string, WorkItemTypeTagProps> {
  const mp = new Map<string, WorkItemTypeTagProps>();
  workItems
    .map(x => getWorkItemTypeDisplayName(x))
    .filter(isDefined)
    .filter(distinct)
    .map(y => {
      if (mp.has(y)) return;
      const refName = getWorkItemReferenceNameFromDisplayName(y, workItemTypes);
      console.log(refName);
      if (refName === undefined) return;
      const t = getWorkTypeFromReferenceName(refName, workItemTypes);
      console.log(t, refName);
      const pro: WorkItemTypeTagProps = {
        iconSize: 16,
        iconUrl: t?.icon.url,
        type: t?.name
      };
      mp.set(y, pro);
    });
  return mp;
}

export function getWorkItemStates(
  workItems: WorkItem[],
  workItemTypes: WorkItemType[]
): Map<string, WorkItemStateColor[]> {
  const mp = new Map<string, WorkItemStateColor[]>();
  workItems
    .map(x => getWorkItemTypeDisplayName(x))
    .filter(isDefined)
    .filter(distinct)
    .map(y => {
      if (mp.has(y)) return;
      const refName = getWorkItemReferenceNameFromDisplayName(y, workItemTypes);
      if (refName === undefined) return;

      const item = workItemTypes.find(x => x.referenceName === refName);
      if (item?.states) {
        mp.set(y, item?.states);
      }
    });

  return mp;
}
