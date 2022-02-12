import { Button } from 'azure-devops-ui/Button';
import { Dialog } from 'azure-devops-ui/Dialog';

interface ConfirmationDialogProps {
  onDismiss?: () => void;
}
const ConfirmationDialog = ({ onDismiss }: ConfirmationDialogProps): JSX.Element => {
  return <div>Hello</div>;
};
export default ConfirmationDialog;
