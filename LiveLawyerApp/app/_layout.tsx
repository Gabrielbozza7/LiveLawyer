import 'react-native-reanimated'
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="call" options={{ headerShown: false }} />
    </Stack>
  )
}
