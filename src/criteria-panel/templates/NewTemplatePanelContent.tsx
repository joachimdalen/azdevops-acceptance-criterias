import '../index.scss';

import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { DropdownFilterBarItem } from 'azure-devops-ui/Dropdown';
import { FilterBar } from 'azure-devops-ui/FilterBar';
import { Icon } from 'azure-devops-ui/Icon';
import { IListItemDetails, ListItem, ScrollableList } from 'azure-devops-ui/List';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { ITableColumn, SimpleTableCell } from 'azure-devops-ui/Table';
import { KeywordFilterBarItem } from 'azure-devops-ui/TextFilterBarItem';
import { Filter } from 'azure-devops-ui/Utilities/Filter';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useEffect, useMemo, useState } from 'react';

import { criteriaTypeItems } from '../../common/common';
import CriteriaTypeDisplay from '../../common/components/CriteriaTypeDisplay';
import { useCriteriaBuilderContext } from '../../common/criterias/CriteriaBuilderContext';
import CriteriaTemplateService from '../../common/services/CriteriaTemplateService';
import { CriteriaTemplateDocument, CriteriaTypes } from '../../common/types';
import EditView from '../EditView';
import TemplateFilterBar from './TemplateFilterBar';

const NewTemplatePanelContent = (): JSX.Element => {
  const [templates, setTemplates] = useState<CriteriaTemplateDocument[]>([]);
  const templateService = useMemo(() => new CriteriaTemplateService(), []);
  const [step, setStep] = useState<'pick-template' | 'create'>('pick-template');
  const { state: panelState, dispatch } = useCriteriaBuilderContext();
  const getData = (template: CriteriaTemplateDocument) => {
    switch (template.type) {
      case 'text':
        return template?.text;
      case 'scenario':
        return template?.scenario;
      case 'checklist':
        return template?.checklist;
    }
  };
  useEffect(() => {
    async function init() {
      // await DevOps.init({
      //   loaded: false,
      //   applyTheme: true
      // });
      WebLogger.information('Loaded criteria panel...');
      await DevOps.ready();
      const tmplts = await templateService.getTemplates();
      setTemplates(tmplts);
      await DevOps.notifyLoadSucceeded();
    }

    init();
  }, []);

  const renderRow = (
    index: number,

    item: CriteriaTemplateDocument,

    details: IListItemDetails<CriteriaTemplateDocument>,

    key?: string
  ): JSX.Element => {
    return (
      <ListItem key={key || 'list-item' + index} index={index} details={details}>
        <div className="padding-4 flex-row h-scroll-hidden">
          <CriteriaTypeDisplay iconOnly size={30} type={item.type} />
          <div
            style={{ marginLeft: '10px', padding: '10px 0px' }}
            className="flex-column h-scroll-hidden"
          >
            <span className="text-ellipsis">{item.name}</span>

            <span className="font-size-ms text-ellipsis secondary-text">{item.description}</span>
          </div>
        </div>
      </ListItem>
    );
  };
  return (
    <PanelWrapper
      rootClassName="custom-scrollbar scroll-hidden"
      contentClassName="full-height h-scroll-hidden"
      cancelButton={
        step === 'pick-template'
          ? { text: 'Close' }
          : {
              text: 'Back',
              iconProps: { iconName: 'Back' },
              onClick: () => setStep('pick-template')
            }
      }
      okButton={{
        text: 'Create',
        primary: true,
        iconProps: { iconName: 'Add' }
      }}
      moduleVersion={process.env.CRITERIA_PANEL_VERSION}
    >
      <ConditionalChildren renderChildren={step === 'pick-template'}>
        <TemplateFilterBar onFilterChanged={filter => console.log(filter)} />
        <ScrollableList
          itemProvider={new ArrayItemProvider(templates)}
          renderRow={renderRow}
          width="100%"
          onSelect={(e, row) => {
            dispatch({ type: 'SET_TYPE', data: row.data.type });
            dispatch({ type: 'SET_TITLE', data: row.data.title });
            dispatch({ type: 'SET_CRITERIA', data: getData(row.data) });

            setStep('create');
          }}
        />
      </ConditionalChildren>

      <ConditionalChildren renderChildren={step === 'create'}>
        <EditView
          errors={undefined}
          settings={{
            id: '1',
            allowedCriteriaTypes: [],
            limitAllowedCriteriaTypes: false,
            requireApprovers: false
          }}
        />
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default NewTemplatePanelContent;
