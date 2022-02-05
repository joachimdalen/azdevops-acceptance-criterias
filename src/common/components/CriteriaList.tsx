import {
  CheckboxVisibility,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  Link,
  Persona,
  PersonaSize
} from '@fluentui/react';
import { DevOpsService } from '@joachimdalen/azdevops-ext-core';
import { IHostPageLayoutService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';
import { Icon } from 'azure-devops-ui/Icon';
import { useMemo } from 'react';

import ActionMenu from '../../wi-control/components/ActionMenu';
import { capitalizeFirstLetter, getCriteriaTitle, PanelIds } from '../common';
import { IAcceptanceCriteria } from '../types';
import StatusTag from './StatusTag';

interface CriteriaListProps {
  rows: IAcceptanceCriteria[];
}
const CriteriaList = ({ rows }: CriteriaListProps): React.ReactElement => {
  const devOpsService = useMemo(() => new DevOpsService(), []);
  const columns: IColumn[] = [
    {
      key: 'order',
      name: '#',
      fieldName: 'order',
      minWidth: 20,
      maxWidth: 30,
      onRender: (item: IAcceptanceCriteria, num, col) => {
        return (
          <div className="flex-row flex-center">
            <Icon iconName="More" />
            {item.order}
          </div>
        );
      }
    },
    {
      key: 'title',
      name: 'Title',
      fieldName: 'title',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      onRender: (item: IAcceptanceCriteria, num, col) => {
        return (
          <div className="acceptance-critera-title-cell">
            <Link
              className="title"
              styles={{ root: { color: 'rgba(var(--palette-neutral-100), 1)' } }}
              onClick={async () => {
                await devOpsService.showPanel(PanelIds.CriteriaPanel, {
                  size: 2,
                  configuration: {
                    criteria: item,
                    isReadOnly: true
                  }
                });
              }}
            >
              {getCriteriaTitle(item)}
            </Link>
            <ActionMenu />
          </div>
        );
      }
    },
    {
      key: 'type',
      name: 'Type',
      fieldName: 'type',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      onRender: (item: IAcceptanceCriteria, num, col) => {
        return capitalizeFirstLetter(item.type);
      }
    },
    {
      key: 'state',
      name: 'State',
      fieldName: 'state',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      onRender: (item, num, col) => {
        return <StatusTag state={item.state} />;
      }
    },
    {
      key: 'approver',
      name: 'Required Approver',
      fieldName: 'requiredApprover',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      onRender: (item: IAcceptanceCriteria, num, col) => {
        if (!item.requiredApprover) return <span>Unassigned</span>;
        return (
          <Persona
            text={item.requiredApprover.displayName}
            size={PersonaSize.size24}
            imageInitials="JD"
            imageUrl={item.requiredApprover.image}
          />
        );
      }
    },
    {
      key: 'actions',
      name: 'Actions',
      fieldName: 'actions',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      onRender: (item: IAcceptanceCriteria, num, col) => {
        return (
          <DefaultButton
            styles={{ rootHovered: { color: 'green' }, root: { backgroundColor: 'green' } }}
            iconProps={{ iconName: 'CheckMark' }}
            onClick={async () => {
              const dialogService = await DevOps.getService<IHostPageLayoutService>(
                'ms.vss-features.host-page-layout-service'
              );
              dialogService.openCustomDialog('Use large title?', {
                title: 'Message dialog',
                configuration: {
                  resizable: true
                },
                onClose: (result: IAcceptanceCriteria | undefined) => {
                  console.log(result);
                }
              });
            }}
          >
            Approve
          </DefaultButton>
        );
      }
    }
  ];

  return (
    <DetailsList
      items={rows}
      columns={columns}
      setKey="set"
      layoutMode={DetailsListLayoutMode.justified}
      selectionPreservedOnEmptyClick={true}
      ariaLabelForSelectionColumn="Toggle selection"
      ariaLabelForSelectAllCheckbox="Toggle selection for all items"
      checkboxVisibility={CheckboxVisibility.hidden}
      onItemInvoked={item => console.log(item)}
    />
  );
};
export default CriteriaList;
