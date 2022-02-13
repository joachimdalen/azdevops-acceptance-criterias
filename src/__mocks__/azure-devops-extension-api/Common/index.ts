import { CoreRestClient } from "../Core";
import { GitRestClient } from "../Git";
import { WikiRestClient } from "../Wiki";


export function getClient(clientClass: any) {
  switch (new clientClass().TYPE) {
    case 'CoreRestClient':
      return new CoreRestClient({}) as any;
    case 'WikiRestClient':
      return new WikiRestClient({}) as any;
      case 'GitRestClient':
        return new GitRestClient({}) as any;
    default:
      throw new Error('Failed to get mock client');
  }
}
