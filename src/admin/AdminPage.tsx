import { WorkItemField } from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { FormItem } from 'azure-devops-ui/FormItem';
import { Header } from 'azure-devops-ui/Header';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { TextField } from 'azure-devops-ui/TextField';
import React, { useEffect, useMemo, useState } from 'react';
import { WorkItemFieldNames } from '../common/constants';

import WorkItemService from '../common/services/WorkItemService';

const CreateFieldForm = (): React.ReactElement => {
  const [name, setName] = useState<string>('');

  return (
    <div>
      <FormItem label="Title">
        <TextField value={name} onChange={(_, v) => setName(v)} />
      </FormItem>
      <Button
        text="Create"
        onClick={async () => {
          const service = new WorkItemService();
         // await service.createField();
        }}
      />
    </div>
  );
};

const AdminPage = (): React.ReactElement => {
  const validFields: string[] = [WorkItemFieldNames.Status];

  const [fields, setFields] = useState<WorkItemField[]>();
  useEffect(() => {
    async function fetchMyAPI() {
      const service = new WorkItemService();
      const result = await service.getFields();
      setFields(result);
      console.log(result);
    }
    fetchMyAPI();
  }, []);

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page>
        <Header title="Advanced Acceptance Criterias" />
        <div className="page-content">
          <div>Page content</div>
          <ul>
            {fields &&
              fields
                .filter(x => validFields.includes(x.referenceName))
                .sort((a, b) => (a.referenceName > b.referenceName ? 1 : -1))
                .map(x => <li key={x.referenceName}>{x.referenceName}</li>)}
          </ul>
          <CreateFieldForm />
        </div>
      </Page>
    </Surface>
  );
};
export default AdminPage;
