import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { Button, IButtonProps } from 'azure-devops-ui/Button';
import { Spinner, SpinnerSize } from 'azure-devops-ui/Spinner';
import { useCallback } from 'react';
const LoadingButton = ({
  loadingText,
  onClick,
  ...props
}: Omit<IButtonProps, 'onClick'> & {
  loadingText: string;
  onClick: () => Promise<void>;
}): JSX.Element => {
  const [isLoading, toggleLoading] = useBooleanToggle(false);

  const clicked = useCallback(async () => {
    try {
      toggleLoading(true);
      await onClick();
      toggleLoading(false);
    } finally {
      toggleLoading(false);
    }
  }, [onClick]);

  if (isLoading)
    return (
      <Button
        {...props}
        iconProps={{
          render: () => <Spinner className="margin-right-4" size={SpinnerSize.small} />
        }}
        disabled
        text={loadingText}
      />
    );
  return <Button {...props} onClick={clicked} />;
};

export default LoadingButton;
