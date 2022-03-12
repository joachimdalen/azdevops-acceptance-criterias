import { FormItem } from 'azure-devops-ui/FormItem';

import { CriteriaDetailDocument } from '../../../common/types';

interface CustomCriteriaViewSectionProps {
  details: CriteriaDetailDocument;
}

const CustomCriteriaViewSection = ({ details }: CustomCriteriaViewSectionProps): JSX.Element => {
  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <FormItem label="Content" className="flex-grow">
        {details.custom?.text}
      </FormItem>
    </div>
  );
};

export default CustomCriteriaViewSection;
