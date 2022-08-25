export interface SettingSection {
  key: string;
  setting: SettingRow;
  toggle: (key: string, value: boolean) => Promise<void>;
}

export interface SettingRow {
  title: string;
  description?: string;
  checked: boolean;
  options?: { id: string; checked: boolean; title: string }[];
}
