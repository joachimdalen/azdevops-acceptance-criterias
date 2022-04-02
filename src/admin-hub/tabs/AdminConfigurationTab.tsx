import PageWrapper from '../components/PageWrapper';
import { Card } from 'azure-devops-ui/Card';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Toggle } from 'azure-devops-ui/Toggle';
import { Checkbox } from 'azure-devops-ui/Checkbox';

const AdminConfigurationTab = (): React.ReactElement => {
  const ComplexRow = () => {
    return (
      <div className="policy-toggle flex-row padding-vertical-16 padding-horizontal-20">
        <div className="flex-column padding-right-16">
          <Toggle onText="On" offText="Off" text="Hello" />
        </div>
        <div className="flex-column flex-grow margin-left-16 padding-horizontal-16">
          <div className="flex-row flex-wrap">
            <div className="flex-column flex-grow">
              <h3 className="body-m margin-0 flex-row">
                <span className="icon-margin">Limit criteria types</span>
              </h3>
              <div className="body-s">
                <div className="secondary-text">Select what criteria types can be created</div>
              </div>
            </div>
          </div>

          <div className="flex-column rhythm-vertical-16">
            <div className="padding-top-16">
              <div className="flex-row">
                <div className="flex-column rhythm-vertical-16">
                  <div className="body-m flex-center flex-row">
                    <Toggle disabled checked />
                    <div className="secondary-text">Scenario Criteria</div>
                  </div>
                  <div className="body-m flex-center flex-row">
                    <Toggle disabled checked />
                    <div className="secondary-text">Text Criteria</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const ToggleRow = () => {
    return (
      <div className="flex-row padding-vertical-16 padding-horizontal-20">
        <div className="flex-column padding-right-16">
          <Toggle onText="On" offText="Off" text="Hello" />
        </div>
        <div className="flex-column flex-grow margin-left-16 padding-horizontal-16">
          <div className="flex-row flex-wrap ">
            <div className="flex-column flex-grow">
              <h3 className="body-m margin-0 flex-row">
                <span className="icon-margin">Text criteria</span>
              </h3>
              <div className="body-s">
                <div className="secondary-text">Do not allow text criterias to be created</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      <Surface background={SurfaceBackground.neutral}>
        <Card titleProps={{ text: 'Allowed criteria types' }}>
          <div className="flex-column flex-grow">
            <ComplexRow />
          </div>
        </Card>
      </Surface>
    </PageWrapper>
  );
};

export default AdminConfigurationTab;
