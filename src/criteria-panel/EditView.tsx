import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import { getCombined, hasError } from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { ITableColumn, SimpleTableCell } from 'azure-devops-ui/Table';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { title } from 'process';

import CriteriaTypeDisplay from '../common/components/CriteriaTypeDisplay';
import CheckListCriteriaSection from '../common/criterias/checklist/CheckListCriteriaSection';
import { useCriteriaBuilderContext } from '../common/criterias/CriteriaBuilderContext';
import ScenarioCriteriaSection from '../common/criterias/scenario/ScenarioCriteriaSection';
import TextCriteriaSection from '../common/criterias/text/TextCriteriaSection';
import { LocalStorageRawKeys } from '../common/localStorage';
import { CriteriaTypes, GlobalSettingsDocument } from '../common/types';
import { useDropdownSelection } from '@joachimdalen/azdevops-ext-core/useDropdownSelection';
import { useMemo } from 'react';

interface EditViewProps {
  errors: any;
  settings?: GlobalSettingsDocument;
  showTypePicker?: boolean;
}

const EditView = ({ errors, settings, showTypePicker = true }: EditViewProps): JSX.Element => {
  const { state: panelState, dispatch } = useCriteriaBuilderContext();
  const criteriaTypeItemsFiltered = useMemo(() => {
    if (settings?.limitAllowedCriteriaTypes) {
      return [
        {
          id: 'checklist',
          text: 'Checklist',
          disabled: !settings.allowedCriteriaTypes.includes('checklist')
        },
        {
          id: 'scenario',
          text: 'Scenario',
          disabled: !settings.allowedCriteriaTypes.includes('scenario')
        },
        { id: 'text', text: 'Text', disabled: !settings.allowedCriteriaTypes.includes('text') }
      ];
    }

    return [
      { id: 'checklist', text: 'Checklist' },
      { id: 'scenario', text: 'Scenario' },
      { id: 'text', text: 'Text' }
    ];
  }, [settings]);

  const typeSelection = useDropdownSelection(criteriaTypeItemsFiltered, panelState.type);

  return (
    <>
      <div className="rhythm-vertical-8 flex-grow border-bottom-light padding-bottom-16">
        {showTypePicker && (
          <FormItem label="Criteria Type" className="flex-grow">
            <Dropdown
              placeholder="Select an Option"
              items={criteriaTypeItemsFiltered}
              selection={typeSelection}
              onSelect={(_, i) => dispatch({ type: 'SET_TYPE', data: i.id })}
              renderItem={(
                rowIndex: number,
                columnIndex: number,
                tableColumn: ITableColumn<IListBoxItem>,
                tableItem: IListBoxItem
              ) => {
                return (
                  <SimpleTableCell key={tableItem.id} columnIndex={columnIndex}>
                    <div className="flex-column justify-center">
                      <CriteriaTypeDisplay type={tableItem.id as CriteriaTypes} />
                      {tableItem.disabled && (
                        <span className="font-size-xs error-text margin-top-4">
                          This criteria type is disallowed by setting set by a project admin
                        </span>
                      )}
                    </div>
                  </SimpleTableCell>
                );
              }}
            />
          </FormItem>
        )}
        <FormItem
          label="Title"
          error={hasError(errors, 'title')}
          message={getCombined(errors, 'title')}
        >
          <TextField
            width={TextFieldWidth.auto}
            placeholder="Short title.."
            value={panelState.title}
            maxLength={100}
            onChange={e => {
              dispatch({ type: 'SET_TITLE', data: e.target.value });
            }}
          />
        </FormItem>
        <FormItem
          label="Required Approver"
          error={hasError(errors, 'requiredApprover')}
          message={getCombined(errors, 'requiredApprover')}
        >
          <IdentityPicker
            localStorageKey={LocalStorageRawKeys.HostUrl}
            identity={panelState.approver}
            onChange={i => {
              dispatch({ type: 'SET_APPROVER', data: i });
            }}
            onClear={() => dispatch({ type: 'SET_APPROVER' })}
          />
        </FormItem>
      </div>

      <ConditionalChildren renderChildren={panelState.type === 'scenario'}>
        <ScenarioCriteriaSection errors={errors} />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={panelState.type === 'text'}>
        <TextCriteriaSection errors={errors} />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={panelState.type === 'checklist'}>
        <CheckListCriteriaSection errors={errors} />
      </ConditionalChildren>
    </>
  );
};

export default EditView;
