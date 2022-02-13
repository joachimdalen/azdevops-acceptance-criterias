import { LoadingSection, useBooleanToggle, webLogger } from '@joachimdalen/azdevops-ext-core';
import * as DevOps from 'azure-devops-extension-sdk';
import { PanelContent, PanelFooter } from 'azure-devops-ui/Panel';
import { useEffect, useState } from 'react';

import { IConfirmationConfig } from '../common/common';

const ConfirmationDialog = (): JSX.Element => {
  const [loading, toggleLoading] = useBooleanToggle();
  const [config, setConfig] = useState<IConfirmationConfig | undefined>();
  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        await DevOps.ready();

        const mConfig = DevOps.getConfiguration();
        setConfig(mConfig as IConfirmationConfig);

        toggleLoading();

        await DevOps.notifyLoadSucceeded();
        DevOps.resize();
      } catch (error) {
        webLogger.error('Failed to load confirmation dialog', error);
      } finally {
        toggleLoading();
        DevOps.resize();
      }
    }

    initModule();
  }, []);
  if (loading) {
    return <LoadingSection isLoading={loading} text="Loading..." />;
  }
  if (config === undefined) return <div>Error</div>;

  return (
    <div className="flex-column">
      <PanelContent>{config.content}</PanelContent>
      <PanelFooter
        buttonProps={[
          {
            ...config.cancelButton,
            onClick: () => {
              const config = DevOps.getConfiguration();
              config.dialog?.close(false);
            }
          },
          {
            ...config.confirmButton,
            onClick: () => {
              const config = DevOps.getConfiguration();
              config.dialog?.close(true);
            }
          }
        ]}
      />
    </div>
  );
};
export default ConfirmationDialog;
