import 'react-native-reanimated'
import { Stack } from 'expo-router'
import Login from '../components/auth/login-register'
import * as SecureStore from 'expo-secure-store'
import { ContextManager } from 'livelawyerlibrary/context-manager'
import { Text } from 'react-native'
import {
  BACKEND_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  WEBSITE_URL,
} from '@/constants/BackendVariables'
import { AuthRefreshManager } from '../components/auth/auth-refresh-manager'
import CompleteRegistration from '@/components/auth/complete-registration'
import { DefaultTheme, Provider as PaperProvider, Portal } from 'react-native-paper'
import { AlertDelivery } from '@/components/alert-delivery'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PlatformValidatedForm } from '@/components/forms/platform-validated-form'
import { PlatformValidatedTextField } from '@/components/forms/platform-validated-text-field'
import { PlatformValidatedFormSubmitButton } from '@/components/forms/platform-validated-form-submit-button'

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
      level0: 'rgb(247, 243, 249)', // Standard page backgrounds
      level1: 'rgb(225, 223, 241)', // Cards
      level2: 'rgb(236, 230, 243)', // Tab navigation
      level3: 'rgb(221, 238, 255)', // FABs and dialogs
      level4: 'rgb(244, 151, 151)', // Error banners
      level5: 'rgb(225, 10, 136)', // Currently unused
    },
    surface: 'rgb(247, 243, 249)',
    surfaceDisabled: 'rgb(193, 193, 193)', // Backgrounds for disabled elements (like buttons)
    secondaryContainer: 'rgba(241, 228, 248, 1)', // Active segmented button
    error: 'rgb(235, 15, 15)', // Error backgrounds
  },
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <Portal.Host>
          <ContextManager
            env={{
              websiteUrl: WEBSITE_URL,
              supabaseUrl: SUPABASE_URL,
              supabaseAnonKey: SUPABASE_ANON_KEY,
              backendUrl: BACKEND_URL,
            }}
            storage={ExpoSecureStoreAdapter}
            sessionlessComponent={<Login />}
            alertDeliveryComponent={<AlertDelivery />}
            platformValidatedFormComponents={{
              Form: PlatformValidatedForm,
              TextField: PlatformValidatedTextField,
              FormSubmitButton: PlatformValidatedFormSubmitButton,
            }}
            loadingComponent={<Text>Loading...</Text>}
            uninitializedUserComponent={<CompleteRegistration />}
          >
            <AuthRefreshManager>
              <Portal.Host>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="screens/account" />
                  <Stack.Screen name="screens/call" />
                  <Stack.Screen name="screens/edit-contact" />
                  <Stack.Screen name="screens/law-office-info" />
                  <Stack.Screen name="index" />
                </Stack>
              </Portal.Host>
            </AuthRefreshManager>
          </ContextManager>
        </Portal.Host>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
