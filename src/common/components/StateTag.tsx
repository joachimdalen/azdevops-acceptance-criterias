import cx from 'classnames';
interface StateTagProps {
  color: string;
  text: string;
  className?: string;
}

const StateTag = ({ color, text, className }: StateTagProps): React.ReactElement => {
  return (
    <div className={cx('flex-row flex-center', className)}>
      <div
        style={{
          backgroundColor: `#${color}`,
          width: '10px',
          height: '10px',
          borderRadius: '50%'
        }}
      ></div>
      <span className="margin-left-8">{text}</span>
    </div>
  );
};
export default StateTag;
