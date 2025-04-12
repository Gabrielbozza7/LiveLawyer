import { Styles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

const [BACKEND_IP, BACKEND_PORT] = getBackendVariables()

export function getBackendVariables(): [ip: string, port: string] {
  let ip = process.env.EXPO_PUBLIC_BACKEND_IP
  let port = process.env.EXPO_PUBLIC_BACKEND_PORT
  if (ip === undefined) {
    console.log(
      "WARNING: EXPO_PUBLIC_BACKEND_IP environment variable not set, defaulting to 'localhost'!",
    )
    ip = 'localhost'
  }
  if (port === undefined) {
    console.log(
      "WARNING: EXPO_PUBLIC_BACKEND_PORT environment variable not set, defaulting to '4000'!",
    )
    port = '4000'
  }
  return [ip, port]
}

export default function CallLawyer() {
  const router = useRouter()
  const [times, setTimes] = useState<number>(0)

  const getToken = async (): Promise<boolean> => {
    try {
      const link = `http://${BACKEND_IP}:${BACKEND_PORT}/join-room`
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: 'abcxyz123' }),
        mode: 'cors',
      })
      const { token: retrievedToken } = await response.json()
      console.log(`TOKEN: ${retrievedToken}`)
      setTimes(times + 1)
      router.navigate(`/call?token=${retrievedToken}&roomName=abcxyz123`)
      return true
    } catch (error: unknown) {
      console.log(`POST error: ${(error as Error).message}`)
      return false
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        <Text style={Styles.pageTitle}>{'\n\n\n'}</Text>
        <TouchableOpacity onPress={getToken}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/images/main-call-image.jpeg')}
            style={Styles.mainLogoButton}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={Styles.centeredText}>Press the Logo To Call A Lawyer.</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
