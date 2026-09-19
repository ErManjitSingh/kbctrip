const TOKEN_KEY = 'kbc_trip_token';

export const getGuestToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setGuestToken = (token: string) => {
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const clearGuestToken = () => {
  window.localStorage.removeItem(TOKEN_KEY);
};
