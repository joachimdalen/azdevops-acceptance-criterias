import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { Panel } from 'azure-devops-ui/Panel';
import { Tab, TabBar } from 'azure-devops-ui/Tabs';
import { TabSize } from 'azure-devops-ui/Tabs.Types';
import { TextField } from 'azure-devops-ui/TextField';
import { useState } from 'react';
import * as React from 'react';

interface TemplatePanelProps {
  onDismiss: () => void;
}
const TemplatePanel = ({ onDismiss }: TemplatePanelProps): React.ReactElement => {
  const [selectedTabId, setSelectedTabId] = useState<'template-details' | 'criteria-details'>(
    'template-details'
  );
  return (
    <Panel titleProps={{ text: 'Add new template' }} onDismiss={onDismiss}>
      <PanelWrapper>
        <div>
          <TabBar
            selectedTabId={selectedTabId}
            onSelectedTabChanged={(newTabId: string) => setSelectedTabId(newTabId as any)}
            tabSize={TabSize.Compact}
            className="margin-bottom-16"
          >
            <Tab id="template-details" name="Template" />
            <Tab id="criteria-details" name="Criteria" />
          </TabBar>
        </div>

        <ConditionalChildren renderChildren={true}>
          <div className="rhythm-vertical-16 flex-grow">
            <FormItem label="Template name">
              <TextField />
            </FormItem>
            <FormItem label="Template description">
              <TextField multiline />
            </FormItem>
          </div>
        </ConditionalChildren>
      </PanelWrapper>
    </Panel>
  );
};

export default TemplatePanel;
