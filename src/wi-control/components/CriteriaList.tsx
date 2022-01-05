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
import { IHostPageLayoutService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';
import { useMemo } from 'react';

import { IAcceptanceCriteria } from '../../common/common';
import CriteriaNavigationService from '../../common/services/CriteriaNavigationService';
import ActionMenu from './ActionMenu';
import StatusTag from './StatusTag';
interface CriteriaListProps {
  rows: IAcceptanceCriteria[];
}
const CriteriaList = ({ rows }: CriteriaListProps): React.ReactElement => {
  const criteriaService = useMemo(() => new CriteriaNavigationService(), []);
  const columns: IColumn[] = [
    {
      key: 'id',
      name: '#',
      fieldName: 'id',
      minWidth: 20,
      maxWidth: 30
    },
    {
      key: 'title',
      name: 'Title',
      fieldName: 'title',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      isResizable: true,
      onRender: (item: IAcceptanceCriteria, num, col) => {
        return (
          <div className="acceptance-critera-title-cell">
            <Link
              className="title"
              styles={{ root: { color: 'rgba(var(--palette-neutral-100), 1)' } }}
              onClick={async () => {
                await criteriaService.showCriteriaModal(res => console.log(res), item);
              }}
            >
              {item.title}
            </Link>
            <ActionMenu />
          </div>
        );
      }
    },
    {
      key: 'state',
      name: 'State',
      fieldName: 'state',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      isResizable: true,
      onRender: (item, num, col) => {
        return <StatusTag state={item.state} />;
      }
    },
    {
      key: 'area',
      name: 'Area',
      fieldName: 'area',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      isResizable: true
    },
    {
      key: 'approver',
      name: 'Required Approver',
      fieldName: 'requiredApprover',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      isResizable: true,
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
