import 'react-native-reanimated'
import { Stack } from 'expo-router'
import Login from '../components/auth/login-register'
import * as SecureStore from 'expo-secure-store'
import { ContextManager } from 'livelawyerlibrary/context-manager'
import { Text } from 'react-native'
import { BACKEND_URL } from '@/constants/BackendVariables'
import { AuthRefreshManager } from '../components/auth/auth-refresh-manager'
import CompleteRegistration from '@/components/auth/complete-registration'
import { DefaultTheme, Provider as PaperProvider, Portal } from 'react-native-paper'
import { AlertDelivery } from '@/components/alert-delivery'
import { SafeAreaProvider } from 'react-native-safe-area-context'

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

const appTheme = {
  ...DefaultTheme,
  colors: {
    elevation: {
      level0: 'rgb(247, 243, 249)', // For standard page backgrounds
      level1: 'rgb(225, 10, 136)', // Currently unused
      level2: 'rgb(236, 230, 243)', // Tab navigation
      level3: 'rgb(225, 10, 136)', // Currently unused
      level4: 'rgb(225, 10, 136)', // Currently unused
      level5: 'rgb(225, 10, 136)', // Currently unused
    },
  },
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <Portal.Host>
          <ContextManager
            env={{
              backendUrl: BACKEND_URL,
              supabaseUrl: supabaseUrl!,
              supabaseAnonKey: supabaseAnonKey!,
            }}
            storage={ExpoSecureStoreAdapter}
            sessionlessComponent={<Login />}
            alertDeliveryComponent={<AlertDelivery />}
            loadingComponent={<Text>Loading...</Text>}
            uninitializedUserComponent={<CompleteRegistration />}
          >
            <AuthRefreshManager>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="screens/edit-contact" options={{ headerShown: false }} />
                <Stack.Screen name="screens/law-office-info" options={{ headerShown: false }} />
                <Stack.Screen name="call" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
              </Stack>
            </AuthRefreshManager>
          </ContextManager>
        </Portal.Host>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
