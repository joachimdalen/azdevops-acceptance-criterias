import { ObservableValue } from 'azure-devops-ui/Core/Observable';
import { IListItemDetails, List, ListItem, ListSelection } from 'azure-devops-ui/List';
import { SingleLayerMasterPanel } from 'azure-devops-ui/MasterDetails';
import { bindSelectionToObservable } from 'azure-devops-ui/MasterDetailsContext';
import { Observer } from 'azure-devops-ui/Observer';
import { Page } from 'azure-devops-ui/Page';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { ArrayItemProvider, IItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useEffect, useState } from 'react';
import * as React from 'react';

import CriteriaTypeDisplay from '../../common/components/CriteriaTypeDisplay';
import { CriteriaTemplate, CriteriaTypes } from '../../common/types';
import PageWrapper from '../components/PageWrapper';
import CriteriaTemplateTypes from './templates/CriteriaTypeTemplates';

const sampleDate: CriteriaTemplate[] = [
  {
    id: 'one',
    createdAt: new Date(),
    createdBy: {} as any,
    name: 'Some criteria',
    description: 'Some checklist critera',
    type: 'checklist'
  },
  {
    id: 'one',
    createdAt: new Date(),
    createdBy: {} as any,
    name: 'When a admin enters',
    description: 'Some scenario criteria',
    type: 'scenario'
  }
];
const TemplatesTab = (): React.ReactElement => {
  const [templates, setTemplates] = useState<CriteriaTemplate[]>(sampleDate);
  const [selection] = useState(new ListSelection({ selectOnFocus: false }));
  const [itemProvider] = useState(
    new ArrayItemProvider<CriteriaTypes>(['scenario', 'checklist', 'text'])
  );
  const [selectedItemObservable] = useState(new ObservableValue<CriteriaTypes>('scenario'));

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
                      />
                    </span>
                  </Tooltip>
                )}
              </Page>
            )}
          </Observer>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TemplatesTab;
