interface KeyBoardShortcutProps {
  keys: string[];
}
const KeyBoardShortcut = ({ keys }: KeyBoardShortcutProps): JSX.Element => {
  return (
    <div className="flex-row flex-center rhythm-horizontal-4">
      {keys.map((key, index) => {
        return (
          <>
            <kbd key={key} className="key-board-shortcut">
              {key}
            </kbd>
            {index !== keys.length - 1 && <span className="key-board-shortcut-plus">+</span>}
          </>
        );
      })}
    </div>
  );
};

export default KeyBoardShortcut;
