import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { MessageBar, MessageBarSeverity } from 'azure-devops-ui/MessageBar';

import { DevOpsError, knownDevOpsErros } from '../DevOpsError';

interface ApiErrorMessageBarProps {
  section: string;
  apiError?: DevOpsError;
}
const ApiErrorMessageBar = ({ apiError, section }: ApiErrorMessageBarProps): JSX.Element => {
  return (
    <ConditionalChildren renderChildren={apiError !== undefined}>
      <MessageBar severity={MessageBarSeverity.Error} className="margin-bottom-4">
        {(apiError?.serverError &&
          knownDevOpsErros[apiError.serverError.typeKey].replace('{section}', section)) ||
          'Unknown error occurred'}
      </MessageBar>
    </ConditionalChildren>
  );
};
export default ApiErrorMessageBar;
