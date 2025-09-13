export const setLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(key);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (e) {
    // Return the raw string if it's not valid JSON (like a JWT token)
    return data;
  }
};

export const removeLocalStorage = (key: string) => {
  localStorage.removeItem(key);
};

export const getFromStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  const item = localStorage.getItem(key);
  if (!item) return null;
  
  try {
    return JSON.parse(item);
  } catch (e) {
    // Return the raw string if it's not valid JSON (like a JWT token)
    return item;
  }
};

export const setToStorage = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};
