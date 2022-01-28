import cx from 'classnames';
import { useMemo } from 'react';

export type ProgressBarLabelType = 'percentage' | 'count';
export interface IProgressBarProps {
  currentValue: number;
  maxValue: number;
  labelType?: ProgressBarLabelType;
}
const ProgressBar = ({ currentValue, maxValue, labelType }: IProgressBarProps): JSX.Element => {
  const current = useMemo(() => currentValue / maxValue, [currentValue, maxValue]);
  const currentText = useMemo(() => {
    if (labelType === undefined) return;
    if (labelType === 'percentage') return `${current * 100}%`;
    return `(${currentValue}/${maxValue})`;
  }, [currentValue, maxValue, labelType]);

  const progressClass = useMemo(() => {
    if (current < 0.5) return;
    if (current === 1) return `progress-bar-status-completed`;
    return `progress-bar-status-close`;
  }, [current]);

  return (
    <div className="flex-row flex-center progress-bar">
      <span className="progress-bar-container flex-row flex-grow scroll-hidden margin-right-8">
        <span
          className={cx('progress-bar-bar', progressClass)}
          style={{ transform: `scaleX(${current})` }}
        ></span>
      </span>
      <span className="progress-bar-progress flex-self-start font-size-s secondary-text">
        {currentText}
      </span>
    </div>
  );
};

export default ProgressBar;
