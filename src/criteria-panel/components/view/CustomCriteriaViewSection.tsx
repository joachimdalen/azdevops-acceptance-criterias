import { FormItem } from 'azure-devops-ui/FormItem';

import { IAcceptanceCriteria } from '../../../common/types';

interface CustomCriteriaViewSectionProps {
  criteria: IAcceptanceCriteria;
}

const CustomCriteriaViewSection = ({ criteria }: CustomCriteriaViewSectionProps): JSX.Element => {
  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <FormItem label="Content" className="flex-grow">
        {criteria.custom?.text}
      </FormItem>
    </div>
  );
};

export default CustomCriteriaViewSection;
