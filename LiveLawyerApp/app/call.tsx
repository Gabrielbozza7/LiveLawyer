import VideoCall from '@/components/VideoCall'
import { Styles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Button, View, Text, Alert } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { getCoordinates } from '@/components/locationStore'
import { supabase } from './lib/supabase'
import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { BACKEND_URL } from '@/constants/BackendVariables'

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export default function Call() {
  const coordinates = getCoordinates()
  const router = useRouter()
  const [inCall, setInCall] = useState<boolean | null>(null)
  const [token, setToken] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')
  const [disconnectSignal, setDisconnectSignal] = useState<boolean>(false)

  useEffect(() => {
    const onSendToRoom = async (
      { token, roomName }: { token: string; roomName: string },
      callback: (acknowledged: boolean) => void,
    ) => {
      setToken(token)
      setRoomName(roomName)
      setInCall(true)
      callback(true)
    }

    const onEndCall = () => {
      setDisconnectSignal(true)
    }

    if (inCall === null) {
      // Only runs for initialization even with strict mode
      setInCall(false)
      ;(async (): Promise<void> => {
        socket = io(BACKEND_URL)
        socket.on('sendToRoom', onSendToRoom)
        socket.on('endCall', onEndCall)
        // Get User ID
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session === null) {
          Alert.alert('Your session is invalid! Try restarting the app or logging in again.')
          router.back()
        } else if (coordinates === null) {
          Alert.alert(
            "Your location could not be read! Try restarting the app or changing the app's permissions",
          )
          router.back()
        } else {
          // Authenticating socket:
          const authResult = await socket.emitWithAck('authenticate', {
            accessToken: session.access_token,
          })
          if (authResult === 'INVALID_AUTH') {
            Alert.alert('Your session is invalid! Try logging in again.')
            router.back()
          } else {
            // Joining call:
            const clientJoinStatusCode = await socket.emitWithAck('joinAsClient', { coordinates })
            if (clientJoinStatusCode === 'NO_OBSERVERS') {
              Alert.alert('There are no observers currently available to take your call.')
              router.back()
            } else if (clientJoinStatusCode === 'INVALID_AUTH') {
              Alert.alert('Your session is invalid! Try logging in again.')
              router.back()
            }
          }
        }
      })()
    }

    return () => {
      if (socket) {
        socket.off('sendToRoom', onSendToRoom)
        socket.off('endCall', onEndCall)
        socket.disconnect()
      }
    }
  }, [])

  const hangUp = () => {
    socket.emit('hangUp')
  }

  return (
    <View style={Styles.videoContainer}>
      {inCall ? (
        <VideoCall
          token={token}
          roomName={roomName}
          disconnectSignal={disconnectSignal}
          hangUpCallback={hangUp}
          disconnectCallback={() => {
            setInCall(false)
            router.back()
          }}
        />
      ) : (
        <SafeAreaProvider>
          <SafeAreaView>
            <Text>Loading...</Text>
            <Button title="Go Back" onPress={router.back} />
          </SafeAreaView>
        </SafeAreaProvider>
      )}
    </View>
  )
}
