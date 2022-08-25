import {
  getValidationCount,
  getValidationCountByPattern
} from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { Pill, PillSize } from 'azure-devops-ui/Pill';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';

import { ValidationErrors } from '../../common/types';

export type TemplatePanelTabs = 'details' | 'criteria';

interface TemplatePanelTabBarProps {
  errors: ValidationErrors;
  selectedTabId: TemplatePanelTabs;
  onTabChanged: (id: TemplatePanelTabs) => void;
}
const TemplatePanelTabBar = ({
  errors,
  selectedTabId,
  onTabChanged
}: TemplatePanelTabBarProps): JSX.Element => {
  return (
    <Surface background={SurfaceBackground.callout}>
      <TabBar
        selectedTabId={selectedTabId}
        onSelectedTabChanged={(newTabId: string) => onTabChanged(newTabId as TemplatePanelTabs)}
        tabSize={TabSize.Compact}
        className="margin-bottom-16"
      >
        <Tab
          id="details"
          name="Details"
          renderBadge={() => {
            const count = getValidationCount(errors, ['name', 'description']);
            if (count === undefined) return undefined;
            return (
              <Pill
                className="bolt-tab-badge"
                size={PillSize.compact}
                color={{ red: 184, green: 35, blue: 57 }}
              >
                {count}
              </Pill>
            );
          }}
        />
        <Tab
          id="criteria"
          name="Criteria"
          renderBadge={() => {
            const count = getValidationCount(errors, ['title', 'requiredApprover']);
            const countTwo = getValidationCountByPattern(errors, /^(scenario|text|checklist|]).+$/);
            if (count === undefined && countTwo == undefined) return undefined;
            const fullCount = (count || 0) + (countTwo || 0);
            return (
              <Pill
                className="bolt-tab-badge"
                size={PillSize.compact}
                color={{ red: 184, green: 35, blue: 57 }}
              >
                {fullCount}
              </Pill>
            );
          }}
        />
      </TabBar>
    </Surface>
  );
};
export default TemplatePanelTabBar;
