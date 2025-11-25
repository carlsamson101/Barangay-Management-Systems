import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem("authToken", token);
};

export const getToken = async () => {
  const token = await AsyncStorage.getItem("authToken");
  return token ? { token } : null;
};

export const removeToken = async () => {
  await AsyncStorage.removeItem("authToken");
};
