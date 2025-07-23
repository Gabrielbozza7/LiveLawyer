import { newStyles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native'
import * as Location from 'expo-location'
import { useAlerter } from 'livelawyerlibrary/context-manager'
import { ActivityIndicator, FAB, Text } from 'react-native-paper'
import { TabPage } from '@/components/ui/tab-page'
import { Colors } from '@/constants/Colors'
import { placeholderLogo } from './lawyers'
import { ErrorBanner } from '@/components/ui/error-banner'

export default function Index() {
  const alerterRef = useAlerter()
  const router = useRouter()
  const [missingPermissions, setMissingPermissions] = useState<Set<string> | undefined>(undefined)

  useEffect(() => {
    if (missingPermissions === undefined) {
      ;(async () => {
        const missing = new Set(['Precise Location Access'])
        ;(
          Platform.select({
            android: ['Camera Access', 'Microphone Access'],
            ios: [], // TODO
          }) ?? []
        ).forEach(permission => missing.add(permission))
        try {
          // Precise Location Access:
          const { status } = await Location.requestForegroundPermissionsAsync()
          if (status === 'granted') {
            missing.delete('Precise Location Access')
          }
          // Camera and Microphone Access
          const platformRequester = Platform.select({
            android: async () => {
              const status = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
              ])
              if (status['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED) {
                missing.delete('Camera Access')
              }
              if (
                status['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
              ) {
                missing.delete('Microphone Access')
              }
            },
            ios: async () => {}, // TODO
          })
          if (platformRequester !== undefined) {
            await platformRequester()
          }
        } catch (error) {
          alerterRef.current.error('An error occurred when trying to request device permissions!')
          console.error(error)
        }
        setMissingPermissions(missing)
      })()
    }
  }, [missingPermissions])

  const missingPermissionsMessage = () => {
    let message = 'The following permissions are required to make calls but are missing:'
    missingPermissions?.forEach(permission => (message += `\n\u2022 ${permission}`))
    return message
  }

  const attemptCall = async () => {
    router.navigate(`/screens/call`)
  }

  return (
    <TabPage>
      {missingPermissions === undefined ? (
        <ActivityIndicator />
      ) : missingPermissions.size > 0 ? (
        <>
          <ErrorBanner text={missingPermissionsMessage()} />
          <FAB
            icon="refresh"
            onPress={() => setMissingPermissions(undefined)}
            mode="elevated"
            variant="surface"
            style={newStyles.bottomLeftFab}
          />
        </>
      ) : (
        <TabPage verticallyCenter={true} horizontallyCenter={true}>
          <View style={styles.callButtonContainer}>
            <TouchableOpacity onPress={attemptCall} style={styles.callButton}>
              <Image style={styles.callButtonLogo} source={placeholderLogo} resizeMode="cover" />
            </TouchableOpacity>
          </View>
          <Text variant="headlineSmall" style={newStyles.centeredText}>
            {'\n'}Press the logo to make a call!
          </Text>
        </TabPage>
      )}
    </TabPage>
  )
}

const styles = StyleSheet.create({
  callButtonContainer: {
    // iOS shadow:
    shadowColor: Colors.gray,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 4,
  },
  callButton: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 50,
    overflow: 'hidden',
    // Android shadow:
    elevation: 5,
  },
  callButtonLogo: {
    height: '100%',
    aspectRatio: 1,
  },
})
