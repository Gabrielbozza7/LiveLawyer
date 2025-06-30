import 'react-native-reanimated'
import { Stack } from 'expo-router'
import { ContextManager } from './components/context-manager'
import Login from './auth/login'

export default function RootLayout() {
  return (
    <ContextManager sessionlessComponent={<Login />}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="call" options={{ headerShown: false }} />
        <Stack.Screen name="screens/edit-contact" options={{ headerShown: false }} />
        <Stack.Screen name="screens/law-office-info" options={{ headerShown: false }} />
      </Stack>
    </ContextManager>
  )
}
