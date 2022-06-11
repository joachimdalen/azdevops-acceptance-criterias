import '../index.scss';

import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { IListItemDetails, ListItem, ScrollableList } from 'azure-devops-ui/List';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CriteriaTypeDisplay from '../../common/components/CriteriaTypeDisplay';
import { useCriteriaBuilderContext } from '../../common/criterias/CriteriaBuilderContext';
import CriteriaTemplateService from '../../common/services/CriteriaTemplateService';
import { CriteriaTemplateDocument } from '../../common/types';
import CriteriaPanelService from '../CriteriaPanelService';
import EditView from '../EditView';
import TemplateFilterBar from './TemplateFilterBar';
import { IFilterState } from 'azure-devops-ui/Utilities/Filter';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import useValidation from '../../common/hooks/useValidation';

const NewTemplatePanelContent = (): JSX.Element => {
  const [templates, setTemplates] = useState<CriteriaTemplateDocument[]>([]);
  const [visibleTemplate, setVisibleTemplates] = useState<CriteriaTemplateDocument[]>([]);
  const [templateService, panelService] = useMemo(
    () => [new CriteriaTemplateService(), new CriteriaPanelService()],
    []
  );
  const [step, setStep] = useState<'pick-template' | 'create'>('pick-template');
  const { state: panelState, dispatch } = useCriteriaBuilderContext();
  const { errors, validate } = useValidation();
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
      WebLogger.information('Loaded criteria panel...');
      await DevOps.ready();
      const tmplts = await templateService.getTemplates();
      setTemplates(tmplts);
      setVisibleTemplates(tmplts);
      await DevOps.notifyLoadSucceeded();
    }

    init();
  }, []);

  const applyFilter = (filter: IFilterState) => {
    let items = [...templates];
    if (Object.keys(filter).length === 0) {
      setVisibleTemplates(templates);
      return;
    }
    const typeVal = filter['type'];
    if (typeVal && typeVal.value.length > 0) {
      items = items.filter(v => typeVal.value.includes(v.type));
    }
    const title = filter['title'];
    if (title) {
      items = items.filter(v => v.title.indexOf(title.value) > -1);
    }
    setVisibleTemplates(items);
  };

  const filterFunc = useCallback(filter => applyFilter(filter), [templates]);

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

  const hasTemplates = useMemo(() => templates.length !== 0, [templates]);
  return (
    <PanelWrapper
      rootClassName="custom-scrollbar scroll-hidden"
      contentClassName="full-height h-scroll-hidden"
      cancelButton={
        step === 'pick-template'
          ? { text: 'Close', onClick: () => panelService.dismissPanel() }
          : {
              text: 'Back',
              iconProps: { iconName: 'Back' },
              onClick: () => setStep('pick-template')
            }
      }
      okButton={
        hasTemplates && step === 'create'
          ? {
              text: 'Create',
              primary: true,
              iconProps: { iconName: 'Add' },
              onClick: () =>
                panelService.save(panelService.getCriteriaPayload(panelState), panelState, validate)
            }
          : undefined
      }
      moduleVersion={process.env.CRITERIA_PANEL_VERSION}
    >
      <ConditionalChildren renderChildren={step === 'pick-template' && !hasTemplates}>
        <ZeroData
          imageAltText=""
          iconProps={{ iconName: 'FileTemplate' }}
          primaryText="No Templates Created"
          secondaryText="Get started by adding your templates in the admin section for the project"
        />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={step === 'pick-template' && hasTemplates}>
        <TemplateFilterBar onFilterChanged={filterFunc} />
        <ConditionalChildren renderChildren={visibleTemplate.length > 0}>
          <ScrollableList
            itemProvider={new ArrayItemProvider(visibleTemplate)}
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
        <ConditionalChildren renderChildren={visibleTemplate.length === 0}>
          <ZeroData
            imageAltText=""
            iconProps={{ iconName: 'FileTemplate' }}
            primaryText="No templates matches your criterias"
          />
        </ConditionalChildren>
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
