import {
  IButtonStyles,
  Icon,
  IconButton,
  IOverflowSetItemProps,
  Link,
  OverflowSet
} from '@fluentui/react';

const ActionMenu = () => {
  const noOp = () => undefined;

  const onRenderItem = (item: IOverflowSetItemProps): JSX.Element => {
    return (
      <Link role="menuitem" styles={{ root: { marginRight: 10 } }} onClick={item.onClick}>
        {item?.iconProps && <Icon {...item.iconProps} />}
        {item.name}
      </Link>
    );
  };

  const onRenderOverflowButton = (overflowItems: any[] | undefined): JSX.Element => {
    const buttonStyles: Partial<IButtonStyles> = {
      root: {
        width: '32px',
        minWidth: '32px',
        maxWidth: '32px',
        padding: '0',
        alignSelf: 'stretch'
      }
    };
    return (
      <IconButton
        role="menuitem"
        title="More options"
        styles={buttonStyles}
        menuIconProps={{ iconName: 'More' }}
        menuProps={{ items: overflowItems! }}
      />
    );
  };

  return (
    <OverflowSet
      aria-label="Basic Menu Example"
      role="menubar"
      overflowItems={[
        {
          key: 'delete',
          name: 'Delete',
          iconProps: { iconName: 'Delete' },
          onClick: noOp
        }
      ]}
      onRenderOverflowButton={onRenderOverflowButton}
      onRenderItem={onRenderItem}
    />
  );
};
export default ActionMenu;
