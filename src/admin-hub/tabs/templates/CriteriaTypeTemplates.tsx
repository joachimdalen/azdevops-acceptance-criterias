import { CommandBar } from '@fluentui/react';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Panel } from 'azure-devops-ui/Panel';
import { ColumnMore, ISimpleTableCell, renderSimpleCell, Table } from 'azure-devops-ui/Table';
import { Tab, Tabs, TabSize } from 'azure-devops-ui/Tabs';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useMemo, useState } from 'react';

import CriteriaTypeDisplay from '../../../common/components/CriteriaTypeDisplay';
import CriteriaService from '../../../common/services/CriteriaService';
import { CriteriaTemplate, CriteriaTypes } from '../../../common/types';
import TemplatePanel from './TemplatePanel';

interface CriteriaTemplateTypesProps {
  type: CriteriaTypes;
  templates: CriteriaTemplate[];
}

interface CriteriaTemplateRow extends ISimpleTableCell {
  id: string;
  name: string;
  description: string;
}

const CriteriaTemplateTypes = ({ type, templates }: CriteriaTemplateTypesProps): JSX.Element => {
  const [addNew, setAddNew] = useState(false);
  const itemProvider = useMemo(
    () =>
      new ArrayItemProvider<CriteriaTemplateRow>(
        templates
          .filter(x => x.type === type)
          .map(i => ({ name: i.name, description: i.description || '', id: i.id }))
      ),
    [type]
  );

  console.log(templates);
  console.log(itemProvider);

  const criteriaService = useMemo(() => new CriteriaService(), []);
  return (
    <div>
      <CommandBar
        className="separator-line-bottom separator-line-top"
        items={[
          {
            key: 'h',
            text: 'New Template',
            onRenderIcon: props => {
              return <CriteriaTypeDisplay iconOnly type={type} />;
            },
            onClick: () => {
              // criteriaService.showPanel({
              //   onClose: async res => {
              //     console.log(res);
              //   }
              // });
              setAddNew(true);
            }
          }
        ]}
      />
      <Table
        columns={[
          { id: 'name', width: -30, name: 'Name', renderCell: renderSimpleCell },
          new ColumnMore((item: any) => {
            return {
              id: 'sub-menu',
              items: [
                {
                  id: 'delete',
                  text: 'Delete',
                  iconProps: { iconName: 'Delete' },
                  onActivate: () => {
                    console.log(item);
                  }
                }
              ]
            };
          }),
          { id: 'description', width: -70, name: 'Description', renderCell: renderSimpleCell }
        ]}
        itemProvider={itemProvider}
      />
      <ConditionalChildren renderChildren={addNew}>
        <TemplatePanel onDismiss={() => setAddNew(false)} />
      </ConditionalChildren>
    </div>
  );
};

export default CriteriaTemplateTypes;
