import { FormItem } from 'azure-devops-ui/FormItem';

import { CriteriaDetailDocument } from '../../../common/types';

interface TextCriteriaViewSectionProps {
  details: CriteriaDetailDocument;
}

const TextCriteriaViewSection = ({ details }: TextCriteriaViewSectionProps): JSX.Element => {
  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <FormItem label="Content" className="flex-grow">
        {details.text?.description}
      </FormItem>
    </div>
  );
};

export default TextCriteriaViewSection;
