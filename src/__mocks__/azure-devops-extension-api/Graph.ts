import { IVssRestClientOptions } from 'azure-devops-extension-api';
import { GraphMembership, GraphTraversalDirection } from 'azure-devops-extension-api/Graph';

export const mockListMemberships = jest.fn().mockRejectedValue(new Error('Not implemented'));
export class GraphRestClient {
  constructor(options: IVssRestClientOptions) {}
  public TYPE = 'GraphRestClient';
  static readonly RESOURCE_AREA_ID: string;

  listMemberships(
    subjectDescriptor: string,
    direction?: GraphTraversalDirection,
    depth?: number
  ): Promise<GraphMembership[]> {
    return new Promise(resolve =>
      resolve(mockListMemberships(subjectDescriptor, direction, depth))
    );
  }
}
