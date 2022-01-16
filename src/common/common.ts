import { IAcceptanceCriteria } from './models/IAcceptanceCriteria';

export enum PanelIds {
  CriteriaPanel = 'criteria-panel'
}

export interface CriteriaModalResult {
  result: 'CANCEL' | 'SAVE';
  criteria?: IAcceptanceCriteria;
}
