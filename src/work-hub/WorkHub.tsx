import { createTheme, loadTheme } from '@fluentui/react';
import {
  appTheme,
  useDropdownSelection,
  VersionDisplay,
  webLogger
} from '@joachimdalen/azdevops-ext-core';
import * as DevOps from 'azure-devops-extension-sdk';
import { DropdownFilterBarItem } from 'azure-devops-ui/Dropdown';
import { FilterBar } from 'azure-devops-ui/FilterBar';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { Page } from 'azure-devops-ui/Page';
import { KeywordFilterBarItem } from 'azure-devops-ui/TextFilterBarItem';
import { Filter } from 'azure-devops-ui/Utilities/Filter';
import { useEffect, useMemo, useState } from 'react';

import CriteriaList from '../common/components/CriteriaList';
import CriteriaService from '../common/services/CriteriaService';
import { CriteriaDocument } from '../common/types';

const WorkHub = (): JSX.Element => {
  const [criteriaService] = useMemo(() => [new CriteriaService()], []);
  const [documents, setDocuments] = useState<CriteriaDocument[]>([]);
  useEffect(() => {
    async function initModule() {
      loadTheme(createTheme(appTheme));
      await DevOps.init();
      webLogger.information('Loaded work hub...');
      const result = await criteriaService.load();

      console.log(result);
      if (result.success && result.data) {
        if (result.data.length > 0) {
          setDocuments(result.data);
        }
      }
    }

    initModule();
  }, []);

  const filter = useMemo(() => new Filter(), []);
  const stateSelection = useDropdownSelection([]);
  const criterias = useMemo(() => documents.flatMap(x => x.criterias), [documents]);
  return (
    <Page className="flex-grow">
      <Header
        title="Acceptance Criterias"
        titleSize={TitleSize.Large}
        description={<VersionDisplay moduleVersion={process.env.WORK_HUB_VERSION} />}
      />

      <div className="page-content padding-16 flex-grow">
        <FilterBar filter={filter}>
          <KeywordFilterBarItem filterItemKey="Placeholder" />
          <DropdownFilterBarItem
            filterItemKey="listMulti"
            filter={filter}
            items={[]}
            selection={stateSelection}
            placeholder="State"
          />
          <DropdownFilterBarItem
            filterItemKey="listMulti"
            filter={filter}
            items={[]}
            selection={stateSelection}
            placeholder="Required Approver"
          />
        </FilterBar>

        <div className="padding-8">
          <CriteriaList rows={criterias} />
        </div>
      </div>
    </Page>
  );
};

export default WorkHub;
