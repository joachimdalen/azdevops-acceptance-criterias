import { Panel } from 'azure-devops-ui/Panel';

interface ColumnsPanelProps {
  onClose: () => void;
}
const ColumnsPanel = ({ onClose }: ColumnsPanelProps): JSX.Element => {
  return (
    <Panel
      titleProps={{
        text: 'Configure Columns'
      }}
      onDismiss={onClose}
      footerButtonProps={[
        { id: 'close', text: 'Close', onClick: onClose },
        { id: 'save', text: 'Save', primary: true, iconProps: { iconName: 'Save' } }
      ]}
    >
      Hello
    </Panel>
  );
};

export default ColumnsPanel;
