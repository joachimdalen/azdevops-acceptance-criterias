import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';

export interface ApproverProgressItem {
  id: IInternalIdentity | 'none';
  total: number;
  current: number;
}
