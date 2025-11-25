import { Stack } from "expo-router";
import { NativeBaseProvider } from "native-base";

export default function RootLayout() {
  return (
    <NativeBaseProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </NativeBaseProvider>
  );
}
