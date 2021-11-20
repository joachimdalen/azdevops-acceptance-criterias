import { AcceptanceCriteriaState } from '../../common/common';
export interface StatusTagProps {
  state: AcceptanceCriteriaState;
}

const StatusTag = ({ state }: StatusTagProps): React.ReactElement => {
  const getTagColor = () => {
    switch (state) {
      case AcceptanceCriteriaState.Pending:
        return 'orange';
      case AcceptanceCriteriaState.Approved:
        return 'green';
      case AcceptanceCriteriaState.Rejected:
        return 'red';
    }
  };

  return (
    <span className="status-tag">
      <div className="status-tag-indicator" style={{ backgroundColor: getTagColor() }}></div>
      {state}
    </span>
  );
};
export default StatusTag;
