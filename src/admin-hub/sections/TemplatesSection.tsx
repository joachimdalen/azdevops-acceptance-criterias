import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { LoadingSection } from '@joachimdalen/azdevops-ext-core/LoadingSection';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ObservableValue } from 'azure-devops-ui/Core/Observable';
import { IListItemDetails, List, ListItem, ListSelection } from 'azure-devops-ui/List';
import { SingleLayerMasterPanel } from 'azure-devops-ui/MasterDetails';
import { bindSelectionToObservable } from 'azure-devops-ui/MasterDetailsContext';
import { Observer } from 'azure-devops-ui/Observer';
import { Page } from 'azure-devops-ui/Page';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { ArrayItemProvider, IItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';

import CriteriaTypeDisplay from '../../common/components/CriteriaTypeDisplay';
import CriteriaTemplateService from '../../common/services/CriteriaTemplateService';
import { CriteriaTemplateDocument, CriteriaTypes } from '../../common/types';
import PageWrapper from '../components/PageWrapper';
import CriteriaTemplateTypes from './templates/CriteriaTypeTemplates';

const TemplatesSection = (): React.ReactElement => {
  const [templates, setTemplates] = useState<CriteriaTemplateDocument[]>([]);
  const [devOpsService, templateService] = useMemo(
    () => [new DevOpsService(), new CriteriaTemplateService()],
    []
  );
  const [selection] = useState(new ListSelection({ selectOnFocus: false }));
  const [itemProvider] = useState(
    new ArrayItemProvider<CriteriaTypes>(['scenario', 'checklist', 'text'])
  );
  const [selectedItemObservable] = useState(new ObservableValue<CriteriaTypes>('scenario'));
  const [loading, toggleLoading] = useBooleanToggle(true);

  useEffect(() => {
    async function init() {
      try {
        const templates = await templateService.getTemplates();
        setTemplates(templates);
      } catch (error) {
        console.error(error);
      } finally {
        toggleLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
    bindSelectionToObservable(selection, itemProvider, selectedItemObservable);
  }, [selection, itemProvider]);

  const renderContent = (selection: ListSelection, itemProvider: IItemProvider<CriteriaTypes>) => {
    return (
      <List
        itemProvider={itemProvider as any}
        selection={selection}
        renderRow={renderListItem}
        width="100%"
        singleClickActivation={true}
      />
    );
  };
  const renderListItem = (
    index: number,
    item: CriteriaTypes,
    details: IListItemDetails<CriteriaTypes>,
    key?: string
  ): JSX.Element => {
    return (
      <ListItem key={key || 'list-item' + index} index={index} details={details}>
        <div className="padding-8 flex-row flex-grow flex-center h-scroll-hidden separator-line-bottom">
          <CriteriaTypeDisplay type={item} />
        </div>
      </ListItem>
    );
  };
  return (
    <PageWrapper noPadding>
      <div className="flex-column full-height">
        <LoadingSection isLoading={loading} text="Loading templates..." />
        <ConditionalChildren renderChildren={loading === false}>
          <div className="flex-grow flex-row">
            <SingleLayerMasterPanel renderContent={() => renderContent(selection, itemProvider)} />

            <Observer selectedItem={selectedItemObservable}>
              {(observerProps: { selectedItem: CriteriaTypes }) => (
                <Page className="flex-grow single-layer-details">
                  {observerProps.selectedItem && (
                    <Tooltip text={observerProps.selectedItem} overflowOnly={true}>
                      <span className="single-layer-details-contents">
                        <CriteriaTemplateTypes
                          templates={templates}
                          type={observerProps.selectedItem}
                          onAdd={async doc => {
                            const added = await templateService.createOrUpdate(doc);
                            setTemplates(prev => [...prev, added]);
                          }}
                          onDelete={async id => {
                            await templateService.delete(id, () => {
                              setTemplates(prev => prev.filter(x => x.id !== id));
                            });
                          }}
                          onDuplicate={async id => {
                            const added = await templateService.duplicate(id);
                            setTemplates(prev => [...prev, added]);
                          }}
                        />
                      </span>
                    </Tooltip>
                  )}
                </Page>
              )}
            </Observer>
          </div>
        </ConditionalChildren>
      </div>
    </PageWrapper>
  );
};

export default TemplatesSection;
