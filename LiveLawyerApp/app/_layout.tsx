import 'react-native-reanimated'
import { Stack } from 'expo-router'
import Login from './auth/login'
import * as SecureStore from 'expo-secure-store'
import { ContextManager } from 'livelawyerlibrary/context-manager'
import { Text } from 'react-native'
import { BACKEND_URL } from '@/constants/BackendVariables'
import { AuthRefreshManager } from '../components/auth-refresh-manager'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

export default function RootLayout() {
  return (
    <ContextManager
      env={{
        backendUrl: BACKEND_URL,
        supabaseUrl: supabaseUrl!,
        supabaseAnonKey: supabaseAnonKey!,
      }}
      storage={ExpoSecureStoreAdapter}
      loadingComponent={<Text>Loading...</Text>}
      sessionlessComponent={<Login />}
    >
      <AuthRefreshManager>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="call" options={{ headerShown: false }} />
          <Stack.Screen name="screens/edit-contact" options={{ headerShown: false }} />
          <Stack.Screen name="screens/law-office-info" options={{ headerShown: false }} />
        </Stack>
      </AuthRefreshManager>
    </ContextManager>
  )
}
