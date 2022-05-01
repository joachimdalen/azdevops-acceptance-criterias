import { IVssRestClientOptions } from 'azure-devops-extension-api';
import { VersionControlRecursionType } from 'azure-devops-extension-api/Git';
import { WikiV2 } from 'azure-devops-extension-api/Wiki';

export const mockGetWiki = jest.fn().mockRejectedValue(new Error('Not implemented'));
export const mockGetPageByIdText = jest.fn().mockRejectedValue(new Error('Not implemented'));

export class WikiRestClient {
  public TYPE = 'WikiRestClient';
  constructor(options: IVssRestClientOptions) {}

  getWiki(wikiIdentifier: string, project?: string): Promise<WikiV2> {
    return new Promise(resolve => resolve(mockGetWiki(wikiIdentifier, project)));
  }
  getPageByIdText(
    project: string,
    wikiIdentifier: string,
    id: number,
    recursionLevel?: VersionControlRecursionType,
    includeContent?: boolean
  ): Promise<string> {
    return new Promise(resolve =>
      resolve(mockGetPageByIdText(project, wikiIdentifier, id, recursionLevel, includeContent))
    );
  }
}
