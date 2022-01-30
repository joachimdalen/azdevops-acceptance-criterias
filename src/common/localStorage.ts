export enum LocalStorageKeys {
  FilterState = 'AC_FILTER_STATE'
}

export const setLocalItem = <T>(key: LocalStorageKeys, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};
export const getLocalItem = <T>(key: LocalStorageKeys): T | undefined => {
  const item = localStorage.getItem(key);
  if (item === null) return undefined;
  return JSON.parse(item);
};
export const deleteLocalItem = (key: LocalStorageKeys): void => {
  localStorage.removeItem(key);
};
