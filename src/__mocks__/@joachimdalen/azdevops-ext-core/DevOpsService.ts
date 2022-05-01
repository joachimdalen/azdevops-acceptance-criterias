import { IProjectInfo } from 'azure-devops-extension-api';

export const mockGetDevOpsProject = jest.fn();
export const mockGetDevOpsQueryParameters = jest.fn();

export class DevOpsService {
  public getProject(): Promise<IProjectInfo | undefined> {
    return new Promise(resolve => resolve(mockGetDevOpsProject()));
  }

  public getQueryParameters(): Promise<
    | {
        [key: string]: string;
      }
    | undefined
  > {
    return new Promise(resolve => resolve(mockGetDevOpsQueryParameters()));
  }
}
