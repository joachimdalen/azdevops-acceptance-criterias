import React from 'react';

interface KeyBoardShortcutProps {
  keys: string[];
}
const KeyBoardShortcut = ({ keys }: KeyBoardShortcutProps): JSX.Element => {
  return (
    <div className="flex-row flex-center rhythm-horizontal-4">
      {keys.map((key, index) => {
        return (
          <React.Fragment key={key}>
            <kbd className="key-board-shortcut">{key}</kbd>
            {index !== keys.length - 1 && <span className="key-board-shortcut-plus">+</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default KeyBoardShortcut;
