export const setLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const removeLocalStorage = (key: string) => {
  localStorage.removeItem(key);
};

export const getFromStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const setToStorage = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};
