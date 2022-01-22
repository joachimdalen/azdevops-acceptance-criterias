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
