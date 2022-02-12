import {
  CommonServiceIds,
  ILocationService,
  IProjectPageService
} from 'azure-devops-extension-api';
import { CoreRestClient } from 'azure-devops-extension-api/Core';
import * as DevOps from 'azure-devops-extension-sdk';
import { IListBoxItem } from 'azure-devops-ui/ListBox';

import { IAcceptanceCriteria } from './types';

export enum PanelIds {
  CriteriaPanel = 'criteria-panel'
}

export interface CriteriaModalResult {
  result: 'CANCEL' | 'SAVE';
  criteria?: IAcceptanceCriteria;
}

export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const move = <T>(array: T[], index: number, delta: number): void => {
  //ref: https://gist.github.com/albertein/4496103
  const newIndex = index + delta;
  if (newIndex < 0 || newIndex == array.length) return;
  const indexes = [index, newIndex].sort((a, b) => a - b);
  array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]);
};

export const getCriteriaTitle = (criteria: IAcceptanceCriteria): string | undefined => {
  if (criteria.type === 'custom') return criteria.custom?.text;
  return criteria.scenario?.scenario;
};

export const criteriaTypeItems: IListBoxItem<any>[] = [
  { id: 'scenario', text: 'Scenario Based' },
  { id: 'custom', text: 'Simple' }
];

type KeyVal = { [key: string]: string };
export const getUrl = async ({ ...urlParams }: KeyVal): Promise<string> => {
  // https://github.com/microsoft/azure-devops-extension-sdk/issues/28
  const locationService = await DevOps.getService<ILocationService>(
    'ms.vss-features.location-service'
  );
  const hostBaseUrl = await locationService.getResourceAreaLocation(
    CoreRestClient.RESOURCE_AREA_ID
  );

  const projectService = await DevOps.getService<IProjectPageService>(
    'ms.vss-tfs-web.tfs-page-data-service'
  );
  const project = await projectService.getProject();

  if (!project) {
    throw new Error('Cannot get project.');
  }

  const contrib = DevOps.getContributionId();
  const params = new URLSearchParams(urlParams);

  return `${hostBaseUrl}${project.name}/_apps/hub/${contrib}?${params.toString()}`;
};
