import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'kbc_trip_token';

export const getGuestToken = async () => AsyncStorage.getItem(TOKEN_KEY);

export const setGuestToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const clearGuestToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};
