import { Spinner, SpinnerSize } from '@fluentui/react';
import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import {
  IWorkItemLoadedArgs,
  IWorkItemNotificationListener
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import React, { useEffect, useMemo, useState } from 'react';

import ProgressBar from '../common/components/ProgressBar';
import CriteriaService from '../common/services/CriteriaService';
import { AcceptanceCriteriaState, IProgressStatus } from '../common/types';
import ProgressControlService from './common/ProgressControlService';

const ProgressControl = (): React.ReactElement => {
  const [devOpsService, criteriaService, progressControlService] = useMemo(
    () => [new DevOpsService(), new CriteriaService(), new ProgressControlService()],
    []
  );
  const [progress, setProgress] = useState<IProgressStatus | undefined>();
  const [loading, setLoading] = useState(true);

  const provider = useMemo(() => {
    const listener: Partial<IWorkItemNotificationListener> = {
      onLoaded: async function (workItemLoadedArgs: IWorkItemLoadedArgs): Promise<void> {
        try {
          // const data = await criteriaService.load(undefined, workItemLoadedArgs.id.toString());
          // if (data.success) {
          //   const f = data.data && data.data[0];
          //   if (f) {
          //     const progress: IProgressStatus = {
          //       maxValue: f.criterias.length,
          //       value: f.criterias.filter(
          //         x =>
          //           x.state === AcceptanceCriteriaState.Completed ||
          //           x.state === AcceptanceCriteriaState.Approved
          //       ).length,
          //       type: 'count'
          //     };
          //     setProgress(progress);
          //   }
          // }
          const res = await progressControlService.getWorkItemIds(workItemLoadedArgs.id);
          const data = await progressControlService.getCriteriaData(res);
          console.log(data);
        } catch (error) {
          console.error(error);
        }
      }
    };
    return listener;
  }, []);

  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        WebLogger.information('Loading rule presets panel...');
        await DevOps.ready();

        DevOps.register(DevOps.getContributionId(), provider);

        setLoading(false);

        await DevOps.notifyLoadSucceeded();
        DevOps.resize();
      } catch (error) {
        WebLogger.error('Failed to get project configuration', error);
      } finally {
        setLoading(false);
        DevOps.resize(undefined, 40);
      }
    }

    initModule();
  }, []);

  if (loading) {
    return (
      <div className="acceptance-control-loader">
        <Spinner size={SpinnerSize.large} label="Loading acceptance criterias" />
      </div>
    );
  }
  if (progress === undefined) return <div>H</div>;

  return (
    <ProgressBar
      currentValue={progress.value}
      maxValue={progress.maxValue}
      labelType={progress.type}
    />
  );
};
export default ProgressControl;
