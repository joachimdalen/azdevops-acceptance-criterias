import './index.scss';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect, useMemo, useState } from 'react';

import CriteriaTemplateService from '../common/services/CriteriaTemplateService';
import { CriteriaTemplateDocument, CriteriaTypes } from '../common/types';
import { IListItemDetails, ListItem, ScrollableList } from 'azure-devops-ui/List';
import { Icon } from 'azure-devops-ui/Icon';
import CriteriaTypeDisplay from '../common/components/CriteriaTypeDisplay';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { FilterBar } from 'azure-devops-ui/FilterBar';
import { KeywordFilterBarItem } from 'azure-devops-ui/TextFilterBarItem';
import { Filter } from 'azure-devops-ui/Utilities/Filter';
import { DropdownFilterBarItem } from 'azure-devops-ui/Dropdown';
import { ITableColumn, SimpleTableCell } from 'azure-devops-ui/Table';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { criteriaTypeItems } from '../common/common';

const NewTemplatePanelContent = (): JSX.Element => {
  const [templates, setTemplates] = useState<CriteriaTemplateDocument[]>([]);
  const templateService = useMemo(() => new CriteriaTemplateService(), []);
  useEffect(() => {
    async function init() {
      await DevOps.init({
        loaded: false,
        applyTheme: true
      });
      WebLogger.information('Loaded criteria panel...');
      await DevOps.ready();
      const tmplts = await templateService.getTemplates();
      setTemplates(tmplts);
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
      cancelButton={{ text: 'Close' }}
      okButton={{
        text: 'Save',
        primary: true,

        iconProps: { iconName: 'Save' }
      }}
      moduleVersion={process.env.CRITERIA_PANEL_VERSION}
    >
      <FilterBar filter={new Filter()}>
        <KeywordFilterBarItem filterItemKey="Placeholder" />
        <DropdownFilterBarItem
          filterItemKey="type"
          filter={new Filter()}
          items={criteriaTypeItems}
          placeholder="Type"
          renderItem={(
            rowIndex: number,
            columnIndex: number,
            tableColumn: ITableColumn<IListBoxItem>,
            tableItem: IListBoxItem
          ) => {
            return (
              <SimpleTableCell key={tableItem.id} columnIndex={columnIndex}>
                <CriteriaTypeDisplay type={tableItem.id as CriteriaTypes} />
              </SimpleTableCell>
            );
          }}
        />
      </FilterBar>
      <ScrollableList
        itemProvider={new ArrayItemProvider(templates)}
        renderRow={renderRow}
        width="100%"
        onSelect={(e, row) => console.log(row)}
      />
    </PanelWrapper>
  );
};

export default NewTemplatePanelContent;
