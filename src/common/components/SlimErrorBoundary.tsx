import { MessageBar, MessageBarSeverity } from 'azure-devops-ui/MessageBar';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
  title?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SlimErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(err: Error): State {
    return { hasError: true, error: err };
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public render() {
    if (this.state.hasError) {
      return (
        <MessageBar
          className="flex-grow"
          severity={MessageBarSeverity.Error}
          buttonProps={[
            {
              text: 'Reload',
              onClick: () => {
                window.location.reload();
              }
            }
          ]}
        >
          <div className="flex-column font-size-xs">
            {this.props.title && <span className="font-weight-heavy">{this.props.title}</span>}
            <span>{this.state.error?.message}</span>
          </div>
        </MessageBar>
      );
    }

    return this.props.children;
  }
}
