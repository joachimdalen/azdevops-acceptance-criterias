import { IVssRestClientOptions } from 'azure-devops-extension-api';
import { GitRepository } from 'azure-devops-extension-api/Git';

export const mockGetRepository = jest.fn().mockRejectedValue(new Error('Not implemented'));

export class GitRestClient {
  public TYPE = 'GitRestClient';
  constructor(options: IVssRestClientOptions) {}

  getRepository(repositoryId: string, project?: string): Promise<GitRepository> {
    return new Promise(resolve => resolve(mockGetRepository(repositoryId, project)));
  }
}
export enum VersionControlRecursionType {
  /**
   * Only return the specified item.
   */
  None = 0,
  /**
   * Return the specified item and its direct children.
   */
  OneLevel = 1,
  /**
   * Return the specified item and its direct children, as well as recursive chains of nested child folders that only contain a single folder.
   */
  OneLevelPlusNestedEmptyFolders = 4,
  /**
   * Return specified item and all descendants
   */
  Full = 120
}
