import VideoCall from '@/components/VideoCall'
import { Styles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Button, View, Text, Alert } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { getCoordinates } from '@/components/locationStore'
import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { BACKEND_URL } from '@/constants/BackendVariables'
import { useSession } from 'livelawyerlibrary/context-manager'

export default function Call() {
  const sessionRef = useSession()
  const coordinates = getCoordinates()
  const router = useRouter()
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(
    io(BACKEND_URL, { autoConnect: false }),
  )
  const socketTokenRef = useRef<string>('')
  const [inCall, setInCall] = useState<boolean | null>(null)
  const [token, setToken] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')
  const [disconnectSignal, setDisconnectSignal] = useState<boolean>(false)

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

  useEffect(() => {
    if (inCall === null) {
      // Only runs for initialization even with strict mode
      setInCall(false)
      ;(async (): Promise<void> => {
        if (coordinates === null) {
          Alert.alert(
            "Your location could not be read! Try restarting the app or changing the app's permissions",
          )
          router.back()
        } else {
          socketRef.current.on('sendToRoom', onSendToRoom)
          socketRef.current.on('endCall', onEndCall)
          socketRef.current.on('disconnect', () => {
            // This can be eventually changed to account for reconnection attempts.
            socketRef.current?.removeAllListeners()
          })
          let connectPromiseResolver = () => {}
          const connectPromise = new Promise<void>(resolve => {
            connectPromiseResolver = resolve
          })
          socketRef.current.on('connect', connectPromiseResolver)
          socketRef.current.connect()
          await connectPromise
          socketRef.current.off('connect', connectPromiseResolver)
          const authResult = await socketRef.current.emitWithAck('authenticate', {
            accessToken: sessionRef.current.access_token,
            coordinates,
          })
          if (authResult.result === 'INVALID_AUTH') {
            Alert.alert('Your session is invalid! Try logging in again.')
            router.back()
          } else {
            socketTokenRef.current = authResult.socketToken
            // Joining call:
            const joinResult = await socketRef.current.emitWithAck('joinAsClient', {
              socketToken: socketTokenRef.current,
            })
            if (joinResult === 'INVALID_AUTH') {
              Alert.alert('Your session is invalid! Try logging in again.')
              router.back()
            } else if (joinResult === 'NO_OBSERVERS') {
              Alert.alert('There are no observers currently available to take your call.')
              router.back()
            } else if (joinResult === 'ALREADY_IN_ROOM') {
              Alert.alert('You are already in a room!')
              router.back()
            }
          }
        }
      })()
    }

    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  const onEndCallClick = async () => {
    if (!socketRef.current.connected) {
      Alert.alert('Your connection is broken!')
      return
    }
    const hangUpResult = await socketRef.current.emitWithAck('hangUp', {
      socketToken: socketTokenRef.current,
    })
    if (hangUpResult === 'INVALID_AUTH') {
      Alert.alert('Your login is invalid!')
    } else if (hangUpResult === 'NOT_IN_ROOM') {
      Alert.alert('You are not in a room!')
    } else if (hangUpResult === 'CALL_ALREADY_ENDED') {
      Alert.alert('The call already ended!')
    }
  }

  return (
    <View style={Styles.videoContainer}>
      {inCall ? (
        <VideoCall
          token={token}
          roomName={roomName}
          disconnectSignal={disconnectSignal}
          hangUpCallback={onEndCallClick}
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
