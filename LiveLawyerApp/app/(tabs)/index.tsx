// import Example from '@/components/Example'
import ExampleRaw from '@/components/ExampleRaw'
import { Styles } from '@/constants/Styles'
import React, { useState } from 'react'
import { Button, Text } from 'react-native'
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

export default function Index() {
  const [times, setTimes] = useState<number>(0)
  const [token, setToken] = useState<string>('')

  const getToken = async (): Promise<boolean> => {
    try {
      const link = `http://${BACKEND_IP}:${BACKEND_PORT}/join-room`
      console.log(link)
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
      setToken(retrievedToken)
      console.log(`TOKEN: ${retrievedToken}`)
    } catch (error: unknown) {
      console.log(`POST error: ${(error as Error).message}`)
      return false
    }
    setTimes(times + 1)

    return true
  }
  return (
    <SafeAreaProvider>
      {token != '' ? (
        <ExampleRaw token={token} />
      ) : (
        <SafeAreaView style={Styles.container}>
          <Text style={Styles.pageTitle}>Hub{'\n\n\n'}</Text>
          <Button title="PRESS ME TO CALL" onPress={getToken} />
          <Text style={Styles.centeredText}>
            `http://{BACKEND_IP}:{BACKEND_PORT}/join-room{'\n\n\n\n\n'}You have called a lawyer{' '}
            {times} times.
          </Text>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  )
}
