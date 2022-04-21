export enum LocalStorageKeys {
  FilterState = 'AC_FILTER_STATE',
  OpenWorkItem = 'AC_OPEN_WORK_ITEM_DIALOG',
  UndoCompleted = 'AC_UNDO_COMPLETED',
  ShowCompletedWi = 'AC_SHOW_COMPLETED_WIS',
  NewStateFlow = 'AC_NEW_FLOW'
}
export enum LocalStorageRawKeys {
  HostUrl = 'AC_HOST_BASE_URL',
  HostUrlWithOrg = 'AC_HOST_BASE_URL_ORG'
}

export const setLocalItem = <T>(key: LocalStorageKeys, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};
export const getLocalItem = <T>(key: LocalStorageKeys): T | undefined => {
  const item = localStorage.getItem(key);
  if (item === null) return undefined;
  return JSON.parse(item);
};
export const getRawLocalItem = (key: LocalStorageRawKeys): string | undefined => {
  const item = localStorage.getItem(key);
  if (item === null) return undefined;
  return item;
};
export const deleteLocalItem = (key: LocalStorageKeys): void => {
  localStorage.removeItem(key);
};
